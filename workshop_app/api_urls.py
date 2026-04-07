from django.urls import path
from . import api_views

urlpatterns = [
    # Auth
    path('auth/user/', api_views.current_user, name='api_current_user'),
    path('auth/login/', api_views.api_login, name='api_login'),
    path('auth/logout/', api_views.api_logout, name='api_logout'),
    path('auth/register/', api_views.api_register, name='api_register'),

    # Workshops
    path('workshops/status/coordinator/',
         api_views.workshop_status_coordinator,
         name='api_workshop_status_coordinator'),
    path('workshops/status/instructor/',
         api_views.workshop_status_instructor,
         name='api_workshop_status_instructor'),
    path('workshops/accept/<int:workshop_id>/',
         api_views.accept_workshop,
         name='api_accept_workshop'),
    path('workshops/change-date/<int:workshop_id>/',
         api_views.change_workshop_date,
         name='api_change_workshop_date'),
    path('workshops/<int:workshop_id>/',
         api_views.workshop_details,
         name='api_workshop_details'),
    path('workshops/<int:workshop_id>/comment/',
         api_views.post_comment,
         name='api_post_comment'),
    path('workshops/propose/',
         api_views.propose_workshop,
         name='api_propose_workshop'),

    # Workshop Types
    path('workshop-types/',
         api_views.workshop_type_list,
         name='api_workshop_type_list'),
    path('workshop-types/<int:workshop_type_id>/',
         api_views.workshop_type_detail,
         name='api_workshop_type_detail'),
    path('workshop-types/<int:workshop_type_id>/tnc/',
         api_views.workshop_type_tnc,
         name='api_workshop_type_tnc'),
    path('workshop-types/add/',
         api_views.add_workshop_type,
         name='api_add_workshop_type'),
    path('workshop-types/<int:workshop_type_id>/edit/',
         api_views.edit_workshop_type,
         name='api_edit_workshop_type'),

    # Profile
    path('profile/',
         api_views.own_profile,
         name='api_own_profile'),
    path('profile/<int:user_id>/',
         api_views.view_profile,
         name='api_view_profile'),
]
