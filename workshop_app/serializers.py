from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Workshop, WorkshopType, Comment, AttachmentFile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['title', 'institute', 'department', 'phone_number',
                  'position', 'location', 'state', 'how_did_you_hear_about_us']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    is_instructor = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'is_instructor', 'profile']

    def get_is_instructor(self, obj):
        return obj.groups.filter(name='instructor').exists()

    def get_full_name(self, obj):
        return obj.get_full_name()


class WorkshopTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopType
        fields = ['id', 'name', 'description', 'duration', 'terms_and_conditions']


class WorkshopTypeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopType
        fields = ['id', 'name', 'duration']


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_id = serializers.IntegerField(source='author.id', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author_id', 'author_name', 'comment', 'public',
                  'created_date']

    def get_author_name(self, obj):
        return obj.author.get_full_name()


class WorkshopSerializer(serializers.ModelSerializer):
    workshop_type_name = serializers.CharField(
        source='workshop_type.name', read_only=True)
    workshop_type_id = serializers.IntegerField(
        source='workshop_type.id', read_only=True)
    coordinator_name = serializers.SerializerMethodField()
    coordinator_id = serializers.IntegerField(
        source='coordinator.id', read_only=True)
    coordinator_institute = serializers.SerializerMethodField()
    instructor_name = serializers.SerializerMethodField()
    instructor_id = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Workshop
        fields = ['id', 'uid', 'date', 'status', 'status_display',
                  'workshop_type_name', 'workshop_type_id',
                  'coordinator_name', 'coordinator_id', 'coordinator_institute',
                  'instructor_name', 'instructor_id', 'tnc_accepted']

    def get_coordinator_name(self, obj):
        return obj.coordinator.get_full_name()

    def get_coordinator_institute(self, obj):
        if hasattr(obj.coordinator, 'profile'):
            return obj.coordinator.profile.institute
        return ''

    def get_instructor_name(self, obj):
        if obj.instructor:
            return obj.instructor.get_full_name()
        return None

    def get_instructor_id(self, obj):
        if obj.instructor:
            return obj.instructor.id
        return None

    def get_status_display(self, obj):
        return obj.get_status()


class AttachmentFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttachmentFile
        fields = ['id', 'attachments']
