import os
import django
import traceback
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'microintern_backend.settings')
django.setup()

from api.models import CustomUser, Task, Application, Submission

client = Client(raise_request_exception=True)

def test_all():
    try:
        # 1. Verify Seeded Data
        print("Testing seeded data...")
        admin = CustomUser.objects.filter(role='admin').first()
        assert admin is not None, "Admin not seeded"
        print("OK: Admin user seeded")

        cand = CustomUser.objects.filter(email='candidate@microintern.com').first()
        assert cand is not None, "Candidate not seeded"
        assert cand.points == 350, f"Candidate points mismatch: {cand.points}"
        print("OK: Candidate user seeded with points")

        stripe = CustomUser.objects.filter(company_name='Stripe').first()
        assert stripe is not None, "Stripe not seeded"
        print("OK: Stripe company seeded")

        # 2. Login candidate
        print("Testing auth endpoints...")
        response = client.post('/api/auth/login/', {
            'email': 'candidate@microintern.com',
            'password': 'password'
        }, content_type='application/json')
        assert response.status_code == 200, f"Login failed: {response.content}"
        data = response.json()
        assert 'token' in data, "Token missing in response"
        assert data['user']['name'] == 'Alex Rivera', "User name mismatch"
        token = data['token']
        print("OK: Login successful for candidate")

        # Access profile with token
        auth_header = f'Token {token}'
        response = client.get('/api/auth/profile/', HTTP_AUTHORIZATION=auth_header)
        assert response.status_code == 200, f"Profile get failed: {response.content}"
        print("OK: Profile fetched using Token successfully")

        # Update profile
        response = client.patch('/api/auth/profile/', {
            'bio': 'New candidate bio description'
        }, content_type='application/json', HTTP_AUTHORIZATION=auth_header)
        assert response.status_code == 200, f"Profile patch failed: {response.content}"
        assert response.json()['bio'] == 'New candidate bio description', "Profile bio not updated"
        print("OK: Profile updated successfully")

        # 3. Create task and applications
        print("Testing task creation and application flow...")
        
        # Clean up test users from previous runs
        CustomUser.objects.filter(email__in=['newcompany@test.com', 'bob@test.com']).delete()

        # Register a new company user
        response = client.post('/api/auth/register/', {
            'name': 'New Company Recruiter',
            'email': 'newcompany@test.com',
            'password': 'password123',
            'role': 'company',
            'companyName': 'Test Corp'
        }, content_type='application/json')
        assert response.status_code == 201, f"Registration failed: {response.content}"
        comp_token = response.json()['token']
        comp_header = f'Token {comp_token}'
        print("OK: Registered new company user successfully")

        # Create task
        response = client.post('/api/tasks/', {
            'title': 'Test React Task',
            'description': 'Implement some details',
            'difficulty': 'Easy',
            'duration': '1h',
            'reward': 120,
            'tags': ['React']
        }, content_type='application/json', HTTP_AUTHORIZATION=comp_header)
        assert response.status_code == 201, f"Task creation failed: {response.content}"
        task_id = response.json()['id']
        print(f"OK: Task created successfully with ID: {task_id}")

        # Register a new candidate user
        response = client.post('/api/auth/register/', {
            'name': 'Bob Tester',
            'email': 'bob@test.com',
            'password': 'password123',
            'role': 'candidate',
            'title': 'QA Automation Engineer'
        }, content_type='application/json')
        assert response.status_code == 201, f"Registration failed: {response.content}"
        cand_token = response.json()['token']
        cand_header = f'Token {cand_token}'
        print("OK: Registered new candidate user successfully")

        # Candidate applies to task
        response = client.post(f'/api/tasks/{task_id}/apply/', HTTP_AUTHORIZATION=cand_header)
        assert response.status_code == 201, f"Task apply failed: {response.content}"
        print("OK: Candidate applied to task")

        # Candidate submits work
        response = client.post(f'/api/tasks/{task_id}/submit/', {
            'githubUrl': 'https://github.com/bob/test-react-task',
            'notes': 'All requirements met.'
        }, content_type='application/json', HTTP_AUTHORIZATION=cand_header)
        assert response.status_code == 201, f"Task submit failed: {response.content}"
        sub_id = response.json()['id']
        print(f"OK: Candidate submitted solution with ID: {sub_id}")

        # Company reviews submission
        response = client.post(f'/api/submissions/{sub_id}/review/', {
            'status': 'Reviewed',
            'feedback': 'Excellent work, Bob!',
            'score': 90
        }, content_type='application/json', HTTP_AUTHORIZATION=comp_header)
        assert response.status_code == 200, f"Submission review failed: {response.content}"
        print("OK: Company reviewed submission and updated status to Reviewed")

        # Check candidate points
        response = client.get('/api/auth/profile/', HTTP_AUTHORIZATION=cand_header)
        assert response.json()['points'] == 120, f"Candidate points not updated: {response.json()['points']}"
        print("OK: Candidate points successfully updated to 120 (reward)")

        # 4. Admin Features
        print("Testing admin dashboard actions...")
        # Login admin
        response = client.post('/api/auth/login/', {
            'email': 'admin@microintern.com',
            'password': 'adminpassword'
        }, content_type='application/json')
        assert response.status_code == 200, f"Admin login failed: {response.content}"
        admin_token = response.json()['token']
        admin_header = f'Token {admin_token}'
        print("OK: Admin logged in successfully")

        # Admin overview
        response = client.get('/api/admin/overview/', HTTP_AUTHORIZATION=admin_header)
        assert response.status_code == 200, f"Admin overview failed: {response.content}"
        overview_data = response.json()
        assert len(overview_data['candidates']) >= 2, "Candidate count mismatch"
        assert len(overview_data['companies']) >= 4, "Company count mismatch"
        print("OK: Admin dashboard overview retrieved successfully")

        # Admin deactivates user
        bob = CustomUser.objects.get(email='bob@test.com')
        assert not bob.deactivated, "User should start as active"
        response = client.post(f'/api/admin/users/{bob.id}/deactivate/', HTTP_AUTHORIZATION=admin_header)
        assert response.status_code == 200, f"Deactivate failed: {response.content}"
        assert response.json()['deactivated'] == True, "Deactivate status mismatch"
        
        # Verify login fails for deactivated user
        response = client.post('/api/auth/login/', {
            'email': 'bob@test.com',
            'password': 'password123'
        }, content_type='application/json')
        assert response.status_code == 403, f"Deactivated user should not be able to log in: {response.status_code}"
        print("OK: Admin user deactivation and blocking verified successfully")

        print("\nAll Backend Tests Passed Successfully!")

    except Exception as e:
        print("ERROR occurred:")
        traceback.print_exc()
        raise e

if __name__ == '__main__':
    test_all()
