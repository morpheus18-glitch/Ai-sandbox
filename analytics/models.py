from django.db import models
from django.conf import settings
from conversations.models import Conversation, Message, Agent

class ConversationAnalysis(models.Model):
    conversation = models.OneToOneField(
        Conversation,
        on_delete=models.CASCADE,
        related_name='analysis'
    )
    total_messages = models.IntegerField(default=0)
    average_message_length = models.FloatField(default=0)
    topic_coherence = models.FloatField(null=True, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)
    complexity_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analysis for {self.conversation.id}"

class AgentPerformance(models.Model):
    agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        related_name='performance_metrics'
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='agent_performance'
    )
    message_count = models.IntegerField(default=0)
    average_response_time = models.FloatField(null=True, blank=True)
    coherence_score = models.FloatField(null=True, blank=True)
    relevance_score = models.FloatField(null=True, blank=True)
    creativity_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('agent', 'conversation')
    
    def __str__(self):
        return f"Performance of {self.agent.name} in {self.conversation.id}"

class UserActivity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    conversations_created = models.IntegerField(default=0)
    conversations_participated = models.IntegerField(default=0)
    agents_created = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    last_active = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Activity for {self.user.email}"
