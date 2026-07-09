from django.contrib.auth import authenticate
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import CustomUser, Task, Application, Submission
from .serializers import (
    UserSerializer, RegisterSerializer, TaskSerializer,
    ApplicationSerializer, SubmissionSerializer
)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve user by email
        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.deactivated:
            return Response({'error': 'This account has been deactivated by an administrator.'}, status=status.HTTP_403_FORBIDDEN)

        # Authenticate using username (which is set to email)
        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user:
            token, _ = Token.objects.get_or_create(user=authenticated_user)
            return Response({
                'token': token.key,
                'user': UserSerializer(authenticated_user).data
            }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        
        # If admin, return all tasks
        if user.is_authenticated and user.role == 'admin':
            return Task.objects.all().order_by('-created_at')

        # Company can see all their own tasks, even deactivated ones
        if user.is_authenticated and user.role == 'company':
            my_tasks = self.request.query_params.get('my_tasks', None)
            if my_tasks == 'true':
                return Task.objects.filter(company=user).order_by('-created_at')

        # Default query for candidates / public: active and non-deactivated tasks
        return Task.objects.filter(deactivated=False).order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'company':
            raise permissions.exceptions.PermissionDenied("Only company users can post tasks.")
        serializer.save(company=self.request.user)


class ApplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, task_id):
        if request.user.role != 'candidate':
            return Response({'error': 'Only candidates can apply to tasks.'}, status=status.HTTP_403_FORBIDDEN)

        task = get_object_or_404(Task, id=task_id, deactivated=False)
        if task.status == 'closed':
            return Response({'error': 'This task is closed for applications.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already applied
        if Application.objects.filter(task=task, candidate=request.user).exists():
            return Response({'error': 'You have already applied to this task.'}, status=status.HTTP_400_BAD_REQUEST)

        application = Application.objects.create(task=task, candidate=request.user, status='Applied')
        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, task_id):
        if request.user.role != 'candidate':
            return Response({'error': 'Only candidates can submit solutions.'}, status=status.HTTP_403_FORBIDDEN)

        task = get_object_or_404(Task, id=task_id, deactivated=False)
        application = get_object_or_404(Application, task=task, candidate=request.user)

        # Check if already submitted
        if hasattr(application, 'submission'):
            return Response({'error': 'You have already submitted a solution for this task.'}, status=status.HTTP_400_BAD_REQUEST)

        github_url = request.data.get('githubUrl')
        live_url = request.data.get('liveUrl', '')
        notes = request.data.get('notes', '')

        if not github_url:
            return Response({'error': 'GitHub repository URL is required.'}, status=status.HTTP_400_BAD_REQUEST)

        submission = Submission.objects.create(
            application=application,
            github_url=github_url,
            live_url=live_url,
            notes=notes
        )
        serializer = SubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Submission.objects.all().order_by('-submitted_at')
        elif user.role == 'company':
            # Submissions for tasks created by this company
            return Submission.objects.filter(
                application__task__company=user,
                application__candidate__deactivated=False,
                application__task__deactivated=False
            ).order_by('-submitted_at')
        elif user.role == 'candidate':
            # Submissions by this candidate
            return Submission.objects.filter(
                application__candidate=user,
                application__task__deactivated=False
            ).order_by('-submitted_at')
        return Submission.objects.none()


class ReviewSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, submission_id):
        if request.user.role != 'company':
            return Response({'error': 'Only company accounts can review submissions.'}, status=status.HTTP_403_FORBIDDEN)

        submission = get_object_or_404(Submission, id=submission_id)
        
        # Verify the task belongs to the company reviewing it
        if submission.application.task.company != request.user:
            return Response({'error': 'You are not authorized to review this submission.'}, status=status.HTTP_403_FORBIDDEN)

        status_val = request.data.get('status')
        feedback = request.data.get('feedback', '')
        score = request.data.get('score')

        if not status_val:
            return Response({'error': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = [choice[0] for choice in Application.STATUS_CHOICES]
        if status_val not in valid_statuses:
            return Response({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

        # Update submission details
        submission.feedback = feedback
        if score is not None:
            submission.score = int(score)
        submission.save()

        # Update application status
        old_status = submission.application.status
        application = submission.application
        application.status = status_val
        application.save()

        # Award points to candidate if reviewed for the first time
        if old_status == 'Applied' and status_val == 'Reviewed':
            candidate = application.candidate
            reward_points = application.task.reward
            candidate.points += reward_points
            candidate.save()

        serializer = SubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Access Denied.'}, status=status.HTTP_403_FORBIDDEN)

        candidates = CustomUser.objects.filter(role='candidate').order_by('-date_joined')
        companies = CustomUser.objects.filter(role='company').order_by('-date_joined')
        tasks = Task.objects.all().order_by('-created_at')

        return Response({
            'candidates': UserSerializer(candidates, many=True).data,
            'companies': UserSerializer(companies, many=True).data,
            'tasks': TaskSerializer(tasks, many=True).data
        }, status=status.HTTP_200_OK)


class AdminDeactivateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != 'admin':
            return Response({'error': 'Access Denied.'}, status=status.HTTP_403_FORBIDDEN)

        target_user = get_object_or_404(CustomUser, id=user_id)
        if target_user.role == 'admin':
            return Response({'error': 'Cannot deactivate an admin account.'}, status=status.HTTP_400_BAD_REQUEST)

        # Toggle deactivated status
        target_user.deactivated = not target_user.deactivated
        target_user.save()
        
        return Response({
            'success': True,
            'userId': target_user.id,
            'deactivated': target_user.deactivated
        }, status=status.HTTP_200_OK)


class AdminDeactivateTaskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, task_id):
        if request.user.role != 'admin':
            return Response({'error': 'Access Denied.'}, status=status.HTTP_403_FORBIDDEN)

        task = get_object_or_404(Task, id=task_id)
        task.deactivated = not task.deactivated
        task.save()

        return Response({
            'success': True,
            'taskId': task.id,
            'deactivated': task.deactivated
        }, status=status.HTTP_200_OK)
