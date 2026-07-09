from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('candidate', 'candidate'),
        ('company', 'company'),
        ('admin', 'admin'),
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    deactivated = models.BooleanField(default=False)
    
    # Candidate fields
    title = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    portfolio_url = models.URLField(blank=True, null=True)
    points = models.IntegerField(default=0)
    avatar = models.URLField(blank=True, null=True)
    
    # Company fields
    company_name = models.CharField(max_length=100, blank=True, null=True)
    company_logo = models.URLField(blank=True, null=True)
    company_url = models.URLField(blank=True, null=True)

    # Use email for username lookup internally if needed, but we keep username field
    # (Django standard: username is still required by AbstractUser unless custom manager is set,
    # so we'll just populate username with email in serializers or registration).
    
    def __str__(self):
        return f"{self.email} ({self.role})"


class Task(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]
    STATUS_CHOICES = [
        ('open', 'open'),
        ('closed', 'closed'),
    ]
    company = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Intermediate')
    duration = models.CharField(max_length=50)
    reward = models.IntegerField(default=100)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    deactivated = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Application(models.Model):
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Reviewed', 'Reviewed'),
        ('Shortlisted', 'Shortlisted'),
        ('Interview', 'Interview'),
        ('Offered', 'Offered'),
        ('Rejected', 'Rejected'),
    ]
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='applications')
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')

    class Meta:
        unique_together = ('task', 'candidate')

    def __str__(self):
        return f"{self.candidate.email} -> {self.task.title} ({self.status})"


class Submission(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='submission')
    github_url = models.URLField()
    live_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    feedback = models.TextField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"Submission for {self.application}"
