"""
API views for the lottery application.
"""

import csv
import requests
from datetime import datetime
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Draw, DrawParticipant, Wine
from .serializers import (
    DrawSerializer,
    DrawListSerializer,
    PerformDrawSerializer,
    StatisticsQuerySerializer,
    ParticipantStatsSerializer,
    WineSerializer,
    WineListSerializer,
)
from .algorithms import execute_draw, get_algorithm_info, Participant, ALGORITHMS


class WineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing wines.
    
    list: Get all active wines
    create: Add a new wine
    retrieve: Get a specific wine
    update: Update wine details
    destroy: Delete a wine
    """
    
    serializer_class = WineSerializer
    
    def get_queryset(self):
        """Return wines, optionally filtering by active status."""
        queryset = Wine.objects.all()
        
        # By default, only show active wines
        include_inactive = self.request.query_params.get('include_inactive', 'false')
        if include_inactive.lower() != 'true':
            queryset = queryset.filter(is_active=True)
        
        # Filter by type if specified
        wine_type = self.request.query_params.get('type')
        if wine_type:
            queryset = queryset.filter(wine_type=wine_type)
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WineListSerializer
        return WineSerializer
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get list of wine types."""
        return Response([
            {'key': key, 'name': name}
            for key, name in Wine.TYPE_CHOICES
        ])


class DrawViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing draws.
    """
    
    serializer_class = DrawSerializer
    
    def get_queryset(self):
        """Return draws, optionally filtering out voided ones."""
        queryset = Draw.objects.all()
        
        include_voided = self.request.query_params.get('include_voided', 'false')
        if include_voided.lower() != 'true':
            queryset = queryset.filter(voided_at__isnull=True)
        
        return queryset.prefetch_related('participants').select_related('wine')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DrawListSerializer
        return DrawSerializer
    
    def _get_history_for_algorithm(self, algorithm_key: str):
        """Get historical data formatted for the specified algorithm."""
        if algorithm_key == 'weighted_losses':
            stats = Draw.objects.get_statistics()
            return [{'name': s['name'], 'wins': s['wins']} for s in stats]
        
        elif algorithm_key == 'round_robin':
            from django.db.models import Max
            
            last_wins = DrawParticipant.objects.filter(
                is_winner=True,
                draw__voided_at__isnull=True
            ).values('name').annotate(
                last_win_date=Max('draw__performed_at')
            )
            
            return [
                {
                    'name': lw['name'],
                    'last_win_date': lw['last_win_date'].isoformat() if lw['last_win_date'] else None
                }
                for lw in last_wins
            ]
        
        return None
    
    @action(detail=True, methods=['post'])
    def perform(self, request, pk=None):
        """Execute the draw and select a winner."""
        draw = self.get_object()
        
        if draw.is_performed:
            return Response(
                {'error': 'Draw has already been performed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if draw.participants.count() == 0:
            return Response(
                {'error': 'Draw has no participants'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PerformDrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        algorithm = serializer.validated_data.get('algorithm', draw.algorithm_used)
        
        participants = [
            Participant(name=p.name, ticket_count=p.ticket_count)
            for p in draw.participants.all()
        ]
        
        history = self._get_history_for_algorithm(algorithm)
        winner_name = execute_draw(algorithm, participants, history)
        
        draw.algorithm_used = algorithm
        draw.winner_name = winner_name
        draw.performed_at = timezone.now()
        draw.save()
        
        draw.participants.filter(name=winner_name).update(is_winner=True)
        
        return Response(DrawSerializer(draw).data)
    
    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        """Simulate the draw without saving."""
        draw = self.get_object()
        
        if draw.participants.count() == 0:
            return Response(
                {'error': 'Draw has no participants'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PerformDrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        algorithm = serializer.validated_data.get('algorithm', draw.algorithm_used)
        
        participants = [
            Participant(name=p.name, ticket_count=p.ticket_count)
            for p in draw.participants.all()
        ]
        
        history = self._get_history_for_algorithm(algorithm)
        winner_name = execute_draw(algorithm, participants, history)
        
        return Response({
            'preview': True,
            'algorithm': algorithm,
            'winner_name': winner_name,
            'message': 'This is a preview. The draw has not been saved.'
        })
    
    @action(detail=True, methods=['post'])
    def void(self, request, pk=None):
        """Void a completed draw."""
        draw = self.get_object()
        
        if not draw.is_performed:
            return Response(
                {'error': 'Cannot void a draw that has not been performed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if draw.is_voided:
            return Response(
                {'error': 'Draw has already been voided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not draw.can_void:
            return Response(
                {'error': 'Time limit exceeded. Draws can only be voided within 5 minutes of execution.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        draw.void()
        return Response(DrawSerializer(draw).data)


@api_view(['GET'])
def statistics(request):
    """Get win statistics aggregated by participant name."""
    serializer = StatisticsQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    
    start_date = serializer.validated_data.get('start_date')
    end_date = serializer.validated_data.get('end_date')
    
    stats = Draw.objects.get_statistics(start_date=start_date, end_date=end_date)
    
    total_draws = Draw.objects.completed().count()
    total_participants = sum(s['total_participations'] for s in stats)
    
    return Response({
        'participants': ParticipantStatsSerializer(stats, many=True).data,
        'totals': {
            'total_draws': total_draws,
            'total_participations': total_participants,
            'unique_participants': len(stats),
        }
    })


@api_view(['GET'])
def statistics_export(request):
    """Export statistics as CSV file."""
    serializer = StatisticsQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    
    start_date = serializer.validated_data.get('start_date')
    end_date = serializer.validated_data.get('end_date')
    
    stats = Draw.objects.get_statistics(start_date=start_date, end_date=end_date)
    
    response = HttpResponse(content_type='text/csv')
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    response['Content-Disposition'] = f'attachment; filename="lottery_stats_{timestamp}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Name', 'Wins', 'Total Participations', 'Total Tickets', 'Win Rate (%)'])
    
    for stat in stats:
        win_rate = round(stat['wins'] / stat['total_participations'] * 100, 1) if stat['total_participations'] > 0 else 0
        writer.writerow([
            stat['name'],
            stat['wins'],
            stat['total_participations'],
            stat['total_tickets'],
            win_rate
        ])
    
    return response


@api_view(['GET'])
def algorithms_list(request):
    """Get information about available draw algorithms."""
    return Response(get_algorithm_info())


@api_view(['GET'])
def vinmonopolet_search(request):
    """
    Proxy endpoint for searching wines from Vinmonopolet's API.
    
    Requires VINMONOPOLET_API_KEY environment variable.
    Get your API key from: https://api.vinmonopolet.no/
    
    Query params:
    - query: Search term (required)
    - limit: Max results (default 20)
    """
    import os
    
    api_key = os.environ.get('VINMONOPOLET_API_KEY', '')
    
    if not api_key:
        return Response(
            {
                'error': 'Vinmonopolet API key not configured',
                'details': 'Set VINMONOPOLET_API_KEY environment variable. Get your key from https://api.vinmonopolet.no/'
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    query = request.query_params.get('query', '').strip()
    if not query:
        return Response(
            {'error': 'Query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    limit = min(int(request.query_params.get('limit', 20)), 50)
    
    try:
        # Official Vinmonopolet API endpoint
        # Documentation: https://api.vinmonopolet.no/apis
        api_url = 'https://apis.vinmonopolet.no/products/v0/details-normal'
        
        params = {
            'productShortNameContains': query,
            'maxResults': limit,
        }
        
        headers = {
            'Ocp-Apim-Subscription-Key': api_key,
            'Accept': 'application/json',
        }
        
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 401:
            return Response(
                {'error': 'Invalid Vinmonopolet API key', 'details': 'Check your VINMONOPOLET_API_KEY'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch from Vinmonopolet', 'details': response.text},
                status=status.HTTP_502_BAD_GATEWAY
            )
        
        products = response.json()
        
        # Handle case where API returns empty or non-list
        if not isinstance(products, list):
            products = []
        
        # Transform to our wine format
        wines = []
        for product in products:
            # Extract wine type from category
            main_category = (product.get('productType') or '').lower()
            wine_type = 'red'  # default
            if 'hvitvin' in main_category or 'white' in main_category:
                wine_type = 'white'
            elif 'rosévin' in main_category or 'rosé' in main_category:
                wine_type = 'rose'
            elif 'musserende' in main_category or 'champagne' in main_category:
                wine_type = 'sparkling'
            elif 'dessertvin' in main_category:
                wine_type = 'dessert'
            elif 'sterkvin' in main_category or 'portvin' in main_category or 'sherry' in main_category:
                wine_type = 'fortified'
            
            # Extract price
            price = None
            basic = product.get('basic', {})
            if basic.get('price'):
                try:
                    price = float(basic['price'])
                except (ValueError, TypeError):
                    pass
            
            # Extract vintage
            vintage = None
            if basic.get('vintage'):
                try:
                    vintage = int(basic['vintage'])
                except (ValueError, TypeError):
                    pass
            
            wines.append({
                'vinmonopolet_id': basic.get('productId'),
                'name': basic.get('productShortName', ''),
                'producer': basic.get('producerName', ''),
                'wine_type': wine_type,
                'country': product.get('origins', {}).get('origin', {}).get('country', ''),
                'region': product.get('origins', {}).get('origin', {}).get('region', ''),
                'vintage': vintage,
                'grape_variety': ', '.join([r.get('grapeDesc', '') for r in product.get('rawMaterial', {}).get('rawMaterial', []) if r.get('grapeDesc')]),
                'price': price,
                'description': product.get('description', {}).get('characteristics', {}).get('taste', ''),
                'image_url': None,  # API doesn't provide image URLs directly
                'volume_ml': basic.get('volume'),
                'alcohol_percent': basic.get('alcoholContent'),
            })
        
        return Response({
            'count': len(wines),
            'total': data.get('productSearchResult', {}).get('totalResults', 0),
            'wines': wines,
        })
        
    except requests.exceptions.Timeout:
        return Response(
            {'error': 'Request to Vinmonopolet timed out'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.exceptions.RequestException as e:
        return Response(
            {'error': f'Failed to connect to Vinmonopolet: {str(e)}'},
            status=status.HTTP_502_BAD_GATEWAY
        )
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
