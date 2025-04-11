from django.db import models
from django.conf import settings
from conversations.models import Conversation

class TrainingDataset(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_datasets'
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    conversations = models.ManyToManyField(
        Conversation,
        through='DatasetConversation',
        related_name='datasets'
    )
    
    def __str__(self):
        return self.name

class DatasetConversation(models.Model):
    dataset = models.ForeignKey(TrainingDataset, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        unique_together = ('dataset', 'conversation')
    
    def __str__(self):
        return f"{self.conversation.id} in {self.dataset.name}"

class ModelTrainingJob(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    id = models.UUIDField(primary_key=True)
    dataset = models.ForeignKey(
        TrainingDataset,
        on_delete=models.CASCADE,
        related_name='training_jobs'
    )
    model_name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    parameters = models.JSONField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='training_jobs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Training job for {self.model_name} on {self.dataset.name}"
