from rest_framework import serializers
from .models import CustomUser, Task, Application, Submission

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', required=False, allow_blank=True)
    companyName = serializers.CharField(source='company_name', required=False, allow_blank=True)
    companyLogo = serializers.CharField(source='company_logo', required=False, allow_blank=True)
    companyUrl = serializers.CharField(source='company_url', required=False, allow_blank=True)
    portfolioUrl = serializers.CharField(source='portfolio_url', required=False, allow_blank=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'name', 'email', 'role', 'deactivated',
            'title', 'bio', 'skills', 'portfolioUrl', 'points', 'avatar',
            'companyName', 'companyLogo', 'companyUrl'
        ]
        read_only_fields = ['id', 'points', 'deactivated']


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    
    # Role-specific fields
    title = serializers.CharField(required=False, allow_blank=True)
    companyName = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['name', 'email', 'password', 'role', 'title', 'companyName']

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        name = validated_data.pop('name')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        role = validated_data.pop('role')
        title = validated_data.get('title', '')
        company_name = validated_data.get('companyName', '')

        # Set default avatars/logos
        avatar = ''
        company_logo = ''
        if role == 'candidate':
            avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
        elif role == 'company':
            company_logo = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80"

        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
            role=role,
            title=title if role == 'candidate' else '',
            company_name=company_name if role == 'company' else '',
            avatar=avatar,
            company_logo=company_logo,
            points=0
        )
        return user


class TaskSerializer(serializers.ModelSerializer):
    companyId = serializers.ReadOnlyField(source='company.id')
    companyName = serializers.ReadOnlyField(source='company.company_name')
    companyLogo = serializers.ReadOnlyField(source='company.company_logo')
    applicantsCount = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'companyId', 'companyName', 'companyLogo',
            'title', 'description', 'difficulty', 'duration', 'reward',
            'tags', 'created_at', 'status', 'applicantsCount', 'deactivated'
        ]
        read_only_fields = ['id', 'companyId', 'created_at', 'applicantsCount', 'deactivated']

    def get_applicantsCount(self, obj):
        return obj.applications.filter(candidate__deactivated=False).count()


class ApplicationSerializer(serializers.ModelSerializer):
    candidateName = serializers.ReadOnlyField(source='candidate.first_name')
    candidateEmail = serializers.ReadOnlyField(source='candidate.email')
    
    class Meta:
        model = Application
        fields = ['id', 'task', 'candidate', 'candidateName', 'candidateEmail', 'applied_at', 'status']
        read_only_fields = ['id', 'applied_at']


class SubmissionSerializer(serializers.ModelSerializer):
    candidateId = serializers.ReadOnlyField(source='application.candidate.id')
    candidateName = serializers.ReadOnlyField(source='application.candidate.first_name')
    candidateAvatar = serializers.ReadOnlyField(source='application.candidate.avatar')
    taskId = serializers.ReadOnlyField(source='application.task.id')
    taskTitle = serializers.ReadOnlyField(source='application.task.title')
    companyName = serializers.ReadOnlyField(source='application.task.company.company_name')
    status = serializers.ReadOnlyField(source='application.status')
    
    githubUrl = serializers.URLField(source='github_url', required=False, allow_blank=True, allow_null=True)
    liveUrl = serializers.URLField(source='live_url', required=False, allow_blank=True, allow_null=True)
    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'application_id', 'candidateId', 'candidateName', 'candidateAvatar',
            'taskId', 'taskTitle', 'companyName', 'githubUrl', 'liveUrl',
            'notes', 'submitted_at', 'status', 'feedback', 'score', 'file'
        ]
        read_only_fields = ['id', 'application_id', 'submitted_at', 'status']
