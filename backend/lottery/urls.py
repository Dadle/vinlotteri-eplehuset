"""
URL configuration for the lottery API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'draws', views.DrawViewSet, basename='draw')
router.register(r'wines', views.WineViewSet, basename='wine')

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/', views.statistics, name='statistics'),
    path('statistics/export/', views.statistics_export, name='statistics-export'),
    path('algorithms/', views.algorithms_list, name='algorithms-list'),
    path('vinmonopolet/search/', views.vinmonopolet_search, name='vinmonopolet-search'),
]
