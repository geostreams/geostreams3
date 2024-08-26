from django.db import models
from django.contrib.auth.models import User
import secrets


class APIKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.key:
            print("Look here" + secrets.token_urlsafe(32))
            self.key = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
