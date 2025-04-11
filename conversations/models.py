from django.db import models
from django.conf import settings
from agents.models import Agent

class Conversation(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    topic = models.CharField(max_length=255)
    objective = models.TextField()
    system_prompt = models.TextField(null=True, blank=True)
    max_turns = models.IntegerField(default=20)
    temperature = models.FloatField(default=0.7)
    language = models.CharField(max_length=50, default='english')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_conversations'
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    constraints = models.JSONField(null=True, blank=True)
    enable_meta_cognition = models.BooleanField(default=True)
    enable_recursive_thinking = models.BooleanField(default=True)
    enable_vector_monitoring = models.BooleanField(default=True)
    enable_emergent_behavior = models.BooleanField(default=True)
    
    agents = models.ManyToManyField(
        Agent,
        through='ConversationAgent',
        related_name='conversations'
    )
    
    def __str__(self):
        return f"{self.topic} ({self.id})"

class ConversationAgent(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('conversation', 'agent')

class Message(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    content = models.TextField()
    timestamp = models.DateTimeField()
    thinking = models.TextField(null=True, blank=True)
    confidence = models.FloatField(null=True, blank=True)
    sentiment = models.CharField(max_length=50, null=True, blank=True)
    keywords = models.JSONField(null=True, blank=True)
    embedding_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.agent.name} in {self.conversation.id}"

class VectorMetrics(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='vector_metrics'
    )
    timestamp = models.DateTimeField()
    asymmetric_cognition = models.FloatField()
    meta_language_coherence = models.FloatField()
    recursive_depth = models.FloatField()
    incompleteness_tolerance = models.FloatField()
    cognitive_transparency = models.FloatField()
    non_monotonic_exploration = models.FloatField()
    pattern_persistence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Metrics for {self.conversation.id} at {self.timestamp}"

class UserAccess(models.Model):
    ACCESS_CHOICES = (
        ('view', 'View'),
        ('edit', 'Edit'),
        ('admin', 'Admin'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversation_access'
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='user_access'
    )
    access_level = models.CharField(max_length=50, choices=ACCESS_CHOICES)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='granted_access'
    )
    
    class Meta:
        unique_together = ('user', 'conversation')
    
    def __str__(self):
        return f"{self.user.email} has {self.access_level} access to {self.conversation.id}"
