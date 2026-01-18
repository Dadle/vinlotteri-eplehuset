"""
URL configuration for vinlotteri project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('lottery.urls')),
]

# Serve frontend for all other routes (SPA support)
# Only in production when frontend is built
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^(?!api|admin|static).*$', TemplateView.as_view(template_name='index.html')),
    ]
