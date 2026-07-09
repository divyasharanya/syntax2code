from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    TaskViewSet, ApplyView, SubmitView, SubmissionViewSet,
    ReviewSubmissionView, AdminOverviewView, AdminDeactivateUserView,
    AdminDeactivateTaskView
)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),

    # Task Applications & Submissions
    path('tasks/<int:task_id>/apply/', ApplyView.as_view(), name='task-apply'),
    path('tasks/<int:task_id>/submit/', SubmitView.as_view(), name='task-submit'),
    path('submissions/<int:submission_id>/review/', ReviewSubmissionView.as_view(), name='submission-review'),

    # Router Endpoints
    path('', include(router.urls)),

    # Admin Endpoints
    path('admin/overview/', AdminOverviewView.as_view(), name='admin-overview'),
    path('admin/users/<int:user_id>/deactivate/', AdminDeactivateUserView.as_view(), name='admin-user-deactivate'),
    path('admin/tasks/<int:task_id>/deactivate/', AdminDeactivateTaskView.as_view(), name='admin-task-deactivate'),
]
