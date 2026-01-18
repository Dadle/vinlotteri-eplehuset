"""
Models for the wine lottery application.
"""

from django.db import models
from django.utils import timezone
from datetime import timedelta


class Wine(models.Model):
    """Represents a wine that can be won in the lottery."""
    
    TYPE_CHOICES = [
        ('red', 'Red'),
        ('white', 'White'),
        ('rose', 'Rosé'),
        ('sparkling', 'Sparkling'),
        ('dessert', 'Dessert'),
        ('fortified', 'Fortified'),
    ]
    
    name = models.CharField(max_length=200)
    producer = models.CharField(max_length=200, blank=True)
    wine_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='red')
    country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    vintage = models.PositiveIntegerField(null=True, blank=True)
    grape_variety = models.CharField(max_length=200, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    vinmonopolet_id = models.CharField(max_length=50, blank=True, help_text="Product ID from Vinmonopolet")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        if self.vintage:
            return f"{self.name} {self.vintage}"
        return self.name
    
    @property
    def display_name(self):
        """Full display name with vintage if available."""
        parts = [self.name]
        if self.vintage:
            parts.append(str(self.vintage))
        if self.producer:
            parts.insert(0, self.producer)
        return ' '.join(parts)


class DrawManager(models.Manager):
    """Custom manager for Draw model with statistics methods."""
    
    def active(self):
        """Return only non-voided draws."""
        return self.filter(voided_at__isnull=True)
    
    def completed(self):
        """Return only completed (performed) non-voided draws."""
        return self.active().filter(performed_at__isnull=False)
    
    def get_statistics(self, start_date=None, end_date=None):
        """
        Get win statistics aggregated by participant name.
        Returns a list of dicts with name, wins, total_participations, total_tickets.
        """
        from django.db.models import Count, Sum, Q
        
        queryset = DrawParticipant.objects.filter(
            draw__voided_at__isnull=True,
            draw__performed_at__isnull=False
        )
        
        if start_date:
            queryset = queryset.filter(draw__performed_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(draw__performed_at__lte=end_date)
        
        stats = queryset.values('name').annotate(
            wins=Count('id', filter=Q(is_winner=True)),
            total_participations=Count('id'),
            total_tickets=Sum('ticket_count')
        ).order_by('-wins', 'name')
        
        return list(stats)


class Draw(models.Model):
    """Represents a single lottery draw event."""
    
    ALGORITHM_CHOICES = [
        ('pure_random', 'Pure Random'),
        ('weighted_losses', 'Weighted by Losses'),
        ('round_robin', 'Round-Robin Fair'),
        ('equal_chance', 'Equal Chance'),
    ]
    
    name = models.CharField(max_length=200, blank=True)
    algorithm_used = models.CharField(
        max_length=50,
        choices=ALGORITHM_CHOICES,
        default='pure_random'
    )
    
    # Wine reference (optional for backwards compatibility)
    wine = models.ForeignKey(
        Wine,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='draws'
    )
    
    # Legacy wine metadata (kept for backwards compatibility)
    wine_name = models.CharField(max_length=200, blank=True)
    wine_description = models.TextField(blank=True)
    wine_image_url = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    performed_at = models.DateTimeField(null=True, blank=True)
    voided_at = models.DateTimeField(null=True, blank=True)
    
    # Winner name (denormalized for quick access)
    winner_name = models.CharField(max_length=100, blank=True)
    
    objects = DrawManager()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name or f"Draw #{self.pk}"
    
    def save(self, *args, **kwargs):
        # Auto-generate name if empty
        if not self.name and not self.pk:
            count = Draw.objects.count() + 1
            self.name = f"Draw #{count}"
        
        # Sync wine_name from wine if wine is set
        if self.wine and not self.wine_name:
            self.wine_name = self.wine.display_name
            if self.wine.description and not self.wine_description:
                self.wine_description = self.wine.description
            if self.wine.image_url and not self.wine_image_url:
                self.wine_image_url = self.wine.image_url
        
        super().save(*args, **kwargs)
    
    @property
    def is_performed(self):
        return self.performed_at is not None
    
    @property
    def is_voided(self):
        return self.voided_at is not None
    
    @property
    def can_void(self):
        """Check if draw can still be voided (within 5 minutes of execution)."""
        if not self.performed_at or self.voided_at:
            return False
        return timezone.now() - self.performed_at < timedelta(minutes=5)
    
    def void(self):
        """Void this draw if allowed."""
        if not self.can_void:
            raise ValueError("Draw cannot be voided (either already voided, not performed, or time limit exceeded)")
        self.voided_at = timezone.now()
        self.save()


class DrawParticipant(models.Model):
    """A participant in a specific draw."""
    
    draw = models.ForeignKey(
        Draw,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    name = models.CharField(max_length=100)
    ticket_count = models.PositiveIntegerField(default=1)
    is_winner = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['name']
        unique_together = ['draw', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.ticket_count} tickets)"
