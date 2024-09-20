from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import User
import secrets


class APIKey(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.key:
            raw_key = secrets.token_urlsafe(32)
            # Hash the key before saving it
            self.key = make_password(raw_key)
        super().save(*args, **kwargs)

    def check_key(self, raw_key):
        return check_password(raw_key, self.key)
