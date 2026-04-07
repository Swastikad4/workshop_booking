from django.urls import path
from . import api_views

urlpatterns = [
    path('public/', api_views.workshop_public_stats, name='api_public_stats'),
    path('team/', api_views.team_stats, name='api_team_stats'),
    path('team/<int:team_id>/', api_views.team_stats, name='api_team_stats_id'),
]
