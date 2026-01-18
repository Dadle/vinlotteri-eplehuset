"""
Serializers for the lottery API.
"""

from rest_framework import serializers
from .models import Draw, DrawParticipant, Wine


class WineSerializer(serializers.ModelSerializer):
    """Serializer for wine management."""
    
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Wine
        fields = [
            'id', 'name', 'producer', 'wine_type', 'country', 'region',
            'vintage', 'grape_variety', 'price', 'description', 'image_url',
            'vinmonopolet_id', 'is_active', 'display_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'display_name']


class WineListSerializer(serializers.ModelSerializer):
    """Simplified serializer for wine dropdown lists."""
    
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Wine
        fields = ['id', 'name', 'producer', 'wine_type', 'vintage', 'display_name']


class DrawParticipantSerializer(serializers.ModelSerializer):
    """Serializer for draw participants."""
    
    class Meta:
        model = DrawParticipant
        fields = ['id', 'name', 'ticket_count', 'is_winner']
        read_only_fields = ['id', 'is_winner']


class DrawSerializer(serializers.ModelSerializer):
    """Serializer for draws with nested participants."""
    
    participants = DrawParticipantSerializer(many=True, required=False)
    can_void = serializers.ReadOnlyField()
    is_performed = serializers.ReadOnlyField()
    is_voided = serializers.ReadOnlyField()
    wine_details = WineListSerializer(source='wine', read_only=True)
    
    class Meta:
        model = Draw
        fields = [
            'id', 'name', 'algorithm_used',
            'wine', 'wine_details',
            'wine_name', 'wine_description', 'wine_image_url',
            'created_at', 'performed_at', 'voided_at',
            'winner_name', 'participants',
            'can_void', 'is_performed', 'is_voided'
        ]
        read_only_fields = ['id', 'created_at', 'performed_at', 'voided_at', 'winner_name']
    
    def create(self, validated_data):
        """Create a draw with its participants."""
        participants_data = validated_data.pop('participants', [])
        draw = Draw.objects.create(**validated_data)
        
        for participant_data in participants_data:
            DrawParticipant.objects.create(draw=draw, **participant_data)
        
        return draw
    
    def update(self, instance, validated_data):
        """Update draw and optionally replace participants."""
        participants_data = validated_data.pop('participants', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if participants_data is not None:
            instance.participants.all().delete()
            for participant_data in participants_data:
                DrawParticipant.objects.create(draw=instance, **participant_data)
        
        return instance


class DrawListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing draws."""
    
    participant_count = serializers.SerializerMethodField()
    can_void = serializers.ReadOnlyField()
    wine_details = WineListSerializer(source='wine', read_only=True)
    
    class Meta:
        model = Draw
        fields = [
            'id', 'name', 'algorithm_used',
            'wine', 'wine_details', 'wine_name', 'winner_name',
            'created_at', 'performed_at', 'voided_at',
            'participant_count', 'can_void'
        ]
    
    def get_participant_count(self, obj):
        return obj.participants.count()


class PerformDrawSerializer(serializers.Serializer):
    """Serializer for the perform draw action."""
    
    algorithm = serializers.ChoiceField(
        choices=Draw.ALGORITHM_CHOICES,
        required=False
    )


class StatisticsQuerySerializer(serializers.Serializer):
    """Serializer for statistics query parameters."""
    
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)


class ParticipantStatsSerializer(serializers.Serializer):
    """Serializer for participant statistics."""
    
    name = serializers.CharField()
    wins = serializers.IntegerField()
    total_participations = serializers.IntegerField()
    total_tickets = serializers.IntegerField()
    win_rate = serializers.SerializerMethodField()
    
    def get_win_rate(self, obj):
        if obj['total_participations'] == 0:
            return 0
        return round(obj['wins'] / obj['total_participations'] * 100, 1)
