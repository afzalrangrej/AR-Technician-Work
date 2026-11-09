import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def create_admin():
    username = 'afzal'
    email = 'afzal@electrohome.com'
    password = 'afzal@26'

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"[SUCCESS] Superuser '{username}' created successfully with password '{password}'!")
    else:
        print(f"[INFO] Superuser '{username}' already exists.")

if __name__ == '__main__':
    create_admin()
