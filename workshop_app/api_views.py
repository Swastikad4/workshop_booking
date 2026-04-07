from datetime import datetime

from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .forms import UserRegistrationForm
from .models import Profile, Workshop, WorkshopType, Comment, AttachmentFile
from .serializers import (
    UserSerializer, WorkshopSerializer, WorkshopTypeSerializer,
    WorkshopTypeListSerializer, CommentSerializer, ProfileSerializer
)
from .send_mails import send_email


def is_instructor(user):
    return user.groups.filter(name='instructor').exists()


def is_email_checked(user):
    return hasattr(user, 'profile') and user.profile.is_email_verified


# ─── Auth ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    return Response({'authenticated': False}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    user = authenticate(username=username, password=password)
    if user is None:
        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not is_email_checked(user):
        return Response(
            {'error': 'Email not verified', 'needs_activation': True},
            status=status.HTTP_403_FORBIDDEN
        )
    login(request, user)
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_logout(request):
    logout(request)
    return Response({'success': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    form = UserRegistrationForm(request.data)
    if form.is_valid():
        username, password, key = form.save()
        new_user = authenticate(username=username, password=password)
        login(request, new_user)
        user_position = new_user.profile.position
        try:
            send_email(
                request, call_on='Registration',
                user_position=user_position,
                key=key
            )
        except Exception:
            pass
        return Response({'needs_activation': True}, status=status.HTTP_201_CREATED)
    return Response({'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)


# ─── Workshops ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workshop_status_coordinator(request):
    user = request.user
    if is_instructor(user):
        return Response(
            {'error': 'Instructors cannot access coordinator status'},
            status=status.HTTP_403_FORBIDDEN
        )
    workshops = Workshop.objects.filter(
        coordinator=user.id
    ).order_by('-date')
    serializer = WorkshopSerializer(workshops, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workshop_status_instructor(request):
    user = request.user
    if not is_instructor(user):
        return Response(
            {'error': 'Only instructors can access this'},
            status=status.HTTP_403_FORBIDDEN
        )
    today = timezone.now().date()
    workshops = Workshop.objects.filter(Q(
        instructor=user.id,
        date__gte=today,
    ) | Q(status=0)).order_by('-date')
    serializer = WorkshopSerializer(workshops, many=True)
    return Response({'workshops': serializer.data, 'today': str(today)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_workshop(request, workshop_id):
    user = request.user
    if not is_instructor(user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        workshop = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    workshop.status = 1
    workshop.instructor = user
    workshop.save()
    try:
        coordinator_profile = workshop.coordinator.profile
        send_email(request, call_on='Booking Confirmed',
                   user_position='instructor',
                   workshop_date=str(workshop.date),
                   workshop_title=workshop.workshop_type.name,
                   user_name=workshop.coordinator.get_full_name(),
                   other_email=workshop.coordinator.email,
                   phone_number=coordinator_profile.phone_number,
                   institute=coordinator_profile.institute)
        send_email(request, call_on='Booking Confirmed',
                   workshop_date=str(workshop.date),
                   workshop_title=workshop.workshop_type.name,
                   other_email=workshop.coordinator.email,
                   phone_number=request.user.profile.phone_number)
    except Exception:
        pass
    return Response({'success': True, 'message': 'Workshop accepted!'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_workshop_date(request, workshop_id):
    user = request.user
    if not is_instructor(user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    new_date_str = request.data.get('new_date')
    if not new_date_str:
        return Response({'error': 'new_date required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        new_workshop_date = datetime.strptime(new_date_str, "%Y-%m-%d")
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
    today = datetime.today()
    if today > new_workshop_date:
        return Response({'error': 'Date must be in the future'}, status=status.HTTP_400_BAD_REQUEST)
    workshop = Workshop.objects.filter(id=workshop_id)
    if not workshop.exists():
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    workshop_date = workshop.first().date
    workshop.update(date=new_workshop_date)
    try:
        send_email(request, call_on='Change Date',
                   user_position='instructor',
                   workshop_date=str(workshop_date),
                   new_workshop_date=str(new_workshop_date.date()))
        send_email(request, call_on='Change Date',
                   new_workshop_date=str(new_workshop_date.date()),
                   workshop_date=str(workshop_date),
                   other_email=workshop.first().coordinator.email)
    except Exception:
        pass
    return Response({'success': True, 'message': 'Workshop date updated'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workshop_details(request, workshop_id):
    try:
        workshop = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    ws_serializer = WorkshopSerializer(workshop)
    if is_instructor(request.user):
        comments = Comment.objects.filter(workshop=workshop)
    else:
        comments = Comment.objects.filter(workshop=workshop, public=True)
    comments_serializer = CommentSerializer(comments, many=True)
    return Response({
        'workshop': ws_serializer.data,
        'comments': comments_serializer.data,
        'is_instructor': is_instructor(request.user)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_comment(request, workshop_id):
    try:
        workshop = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    comment_text = request.data.get('comment', '').strip()
    if not comment_text:
        return Response({'error': 'Comment cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
    public = request.data.get('public', True)
    if not is_instructor(request.user):
        public = True
    Comment.objects.create(
        author=request.user,
        comment=comment_text,
        public=public,
        created_date=timezone.now(),
        workshop=workshop
    )
    return Response({'success': True, 'message': 'Comment posted'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def propose_workshop(request):
    user = request.user
    if is_instructor(user):
        return Response({'error': 'Instructors cannot propose workshops'},
                        status=status.HTTP_403_FORBIDDEN)
    workshop_type_id = request.data.get('workshop_type')
    date_str = request.data.get('date')
    tnc_accepted = request.data.get('tnc_accepted', False)
    if not all([workshop_type_id, date_str, tnc_accepted]):
        return Response({'error': 'All fields are required'},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        workshop_type = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return Response({'error': 'Invalid workshop type'},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return Response({'error': 'Invalid date format'},
                        status=status.HTTP_400_BAD_REQUEST)
    if Workshop.objects.filter(
            date=date, workshop_type=workshop_type, coordinator=user).exists():
        return Response({'error': 'Duplicate workshop entry'},
                        status=status.HTTP_400_BAD_REQUEST)
    Workshop.objects.create(
        coordinator=user,
        workshop_type=workshop_type,
        date=date,
        tnc_accepted=tnc_accepted,
        status=0
    )
    try:
        instructors = Profile.objects.filter(position='instructor')
        for i in instructors:
            send_email(request, call_on='Proposed Workshop',
                       user_position='instructor',
                       workshop_date=str(date),
                       workshop_title=str(workshop_type),
                       user_name=user.get_full_name(),
                       other_email=i.user.email,
                       phone_number=user.profile.phone_number,
                       institute=user.profile.institute)
    except Exception:
        pass
    return Response({'success': True, 'message': 'Workshop proposed successfully'})


# ─── Workshop Types ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def workshop_type_list(request):
    workshop_types = WorkshopType.objects.get_queryset().order_by("id")
    paginator = PageNumberPagination()
    paginator.page_size = 12
    paginated = paginator.paginate_queryset(workshop_types, request)
    serializer = WorkshopTypeListSerializer(paginated, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def workshop_type_detail(request, workshop_type_id):
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = WorkshopTypeSerializer(wt)
    data = serializer.data
    attachments = AttachmentFile.objects.filter(workshop_type=wt)
    data['attachments'] = [
        {'id': a.id, 'url': a.attachments.url if a.attachments else ''}
        for a in attachments
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def workshop_type_tnc(request, workshop_type_id):
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'tnc': wt.terms_and_conditions})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_workshop_type(request):
    if not is_instructor(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    name = request.data.get('name', '')
    description = request.data.get('description', '')
    duration = request.data.get('duration', '')
    terms = request.data.get('terms_and_conditions', '')
    if not all([name, description, duration, terms]):
        return Response({'error': 'All fields are required'},
                        status=status.HTTP_400_BAD_REQUEST)
    wt = WorkshopType.objects.create(
        name=name, description=description,
        duration=int(duration), terms_and_conditions=terms
    )
    return Response({'success': True, 'id': wt.id, 'message': 'Workshop Type added'})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_workshop_type(request, workshop_type_id):
    if not is_instructor(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    wt.name = request.data.get('name', wt.name)
    wt.description = request.data.get('description', wt.description)
    wt.duration = int(request.data.get('duration', wt.duration))
    wt.terms_and_conditions = request.data.get('terms_and_conditions', wt.terms_and_conditions)
    wt.save()
    return Response({'success': True, 'message': 'Workshop type saved.'})


# ─── Profile ────────────────────────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def own_profile(request):
    user = request.user
    profile = user.profile
    if request.method == 'GET':
        user_data = UserSerializer(user).data
        return Response(user_data)
    # PUT
    profile.title = request.data.get('title', profile.title)
    profile.phone_number = request.data.get('phone_number', profile.phone_number)
    profile.institute = request.data.get('institute', profile.institute)
    profile.department = request.data.get('department', profile.department)
    profile.position = request.data.get('position', profile.position)
    profile.location = request.data.get('location', profile.location)
    profile.state = request.data.get('state', profile.state)
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.save()
    profile.save()
    return Response({'success': True, 'message': 'Profile updated.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_profile(request, user_id):
    user = request.user
    if not is_instructor(user) or not is_email_checked(user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    profile_data = UserSerializer(target_user).data
    workshops = Workshop.objects.filter(coordinator=user_id).order_by('date')
    workshops_data = WorkshopSerializer(workshops, many=True).data
    return Response({'profile': profile_data, 'workshops': workshops_data})
