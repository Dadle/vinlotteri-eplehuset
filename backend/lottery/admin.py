"""
Admin configuration for the lottery app.
"""

from django.contrib import admin
from .models import Draw, DrawParticipant


class DrawParticipantInline(admin.TabularInline):
    model = DrawParticipant
    extra = 0


@admin.register(Draw)
class DrawAdmin(admin.ModelAdmin):
    list_display = ['name', 'algorithm_used', 'winner_name', 'performed_at', 'voided_at']
    list_filter = ['algorithm_used', 'performed_at', 'voided_at']
    search_fields = ['name', 'winner_name', 'wine_name']
    inlines = [DrawParticipantInline]


@admin.register(DrawParticipant)
class DrawParticipantAdmin(admin.ModelAdmin):
    list_display = ['name', 'draw', 'ticket_count', 'is_winner']
    list_filter = ['is_winner', 'draw']
    search_fields = ['name']
