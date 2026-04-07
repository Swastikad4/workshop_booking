import datetime as dt

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from workshop_app.models import Workshop, WorkshopType, states
from workshop_app.serializers import WorkshopSerializer
from teams.models import Team


def is_instructor(user):
    return user.groups.filter(name='instructor').exists()


@api_view(['GET'])
@permission_classes([AllowAny])
def workshop_public_stats(request):
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    state = request.GET.get('state')
    workshoptype = request.GET.get('workshop_type')
    sort = request.GET.get('sort', 'date')

    if from_date and to_date:
        workshops = Workshop.objects.filter(
            date__range=(from_date, to_date), status=1
        ).order_by(sort)
        if state:
            workshops = workshops.filter(coordinator__profile__state=state)
        if workshoptype:
            workshops = workshops.filter(workshop_type_id=workshoptype)
    else:
        today = timezone.now()
        upto = today + dt.timedelta(days=15)
        workshops = Workshop.objects.filter(
            date__range=(today, upto), status=1
        ).order_by("date")

    if request.user.is_authenticated:
        show_workshops = request.GET.get('show_workshops')
        if show_workshops:
            if is_instructor(request.user):
                workshops = workshops.filter(instructor_id=request.user.id)
            else:
                workshops = workshops.filter(coordinator_id=request.user.id)

    ws_states, ws_count = Workshop.objects.get_workshops_by_state(workshops)
    ws_type, ws_type_count = Workshop.objects.get_workshops_by_type(workshops)

    # Paginate
    page = int(request.GET.get('page', 1))
    page_size = 30
    total = workshops.count()
    start = (page - 1) * page_size
    end = start + page_size
    paginated_workshops = workshops[start:end]

    serializer = WorkshopSerializer(paginated_workshops, many=True)

    # Workshop type choices for filter
    wt_choices = list(
        WorkshopType.objects.values_list('id', 'name').order_by('name')
    )
    state_choices = [{'code': s[0], 'name': s[1]} for s in states if s[0]]

    return Response({
        'workshops': serializer.data,
        'ws_states': ws_states,
        'ws_count': ws_count,
        'ws_type': ws_type,
        'ws_type_count': ws_type_count,
        'total': total,
        'page': page,
        'page_size': page_size,
        'num_pages': (total + page_size - 1) // page_size if total else 1,
        'workshop_type_choices': wt_choices,
        'state_choices': state_choices,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_stats(request, team_id=None):
    user = request.user
    teams = Team.objects.all()
    if not teams.exists():
        return Response({'error': 'No teams found'}, status=404)
    if team_id:
        team = teams.filter(id=team_id).first()
        if not team:
            return Response({'error': 'Team not found'}, status=404)
    else:
        team = teams.first()
    if not team.members.filter(user_id=user.id).exists():
        return Response({'error': 'You are not added to the team'}, status=403)

    member_workshop_data = {}
    for member in team.members.all():
        workshop_count = Workshop.objects.filter(
            instructor_id=member.user.id).count()
        member_workshop_data[member.user.get_full_name()] = workshop_count

    all_teams_data = [{'id': t.id, 'name': f'Team {i+1}'}
                      for i, t in enumerate(teams)]

    return Response({
        'team_labels': list(member_workshop_data.keys()),
        'ws_count': list(member_workshop_data.values()),
        'all_teams': all_teams_data,
        'team_id': team.id,
    })
