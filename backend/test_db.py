import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'microintern_backend.settings')
django.setup()

from django.test import Client
client = Client()

response = client.post('/api/auth/login/', {
    'email': 'candidate@microintern.com',
    'password': 'password'
}, content_type='application/json')

with open('error_log.txt', 'w', encoding='utf-8') as f:
    f.write(response.content.decode('utf-8'))

print("Done! View error_log.txt")
