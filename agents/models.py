from django.db import models
from django.conf import settings

class Agent(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    avatar = models.CharField(max_length=255)
    instructions = models.TextField()
    color = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    role = models.CharField(max_length=255, null=True, blank=True)
    expertise = models.JSONField(null=True, blank=True)
    traits = models.JSONField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_agents'
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
