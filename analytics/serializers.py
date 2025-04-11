from rest_framework import serializers
from .models import ConversationAnalysis, AgentPerformance, UserActivity

class ConversationAnalysisSerializer(serializers.ModelSerializer):
    conversation_topic = serializers.CharField(source='conversation.topic', read_only=True)
    
    class Meta:
        model = ConversationAnalysis
        fields = (
            'id', 'conversation', 'conversation_topic', 'total_messages',
            'average_message_length', 'topic_coherence', 'sentiment_score',
            'complexity_score', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')

class AgentPerformanceSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    conversation_topic = serializers.CharField(source='conversation.topic', read_only=True)
    
    class Meta:
        model = AgentPerformance
        fields = (
            'id', 'agent', 'agent_name', 'conversation', 'conversation_topic',
            'message_count', 'average_response_time', 'coherence_score',
            'relevance_score', 'creativity_score', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')

class UserActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = (
            'id', 'user', 'user_email', 'conversations_created',
            'conversations_participated', 'agents_created',
            'total_messages', 'last_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')
