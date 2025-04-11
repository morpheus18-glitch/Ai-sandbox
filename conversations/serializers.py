from rest_framework import serializers
from .models import Conversation, Message, VectorMetrics, UserAccess, ConversationAgent
from agents.serializers import AgentSerializer
from agents.models import Agent

class ConversationAgentSerializer(serializers.ModelSerializer):
    agent_details = AgentSerializer(source='agent', read_only=True)
    
    class Meta:
        model = ConversationAgent
        fields = ('agent', 'agent_details', 'joined_at', 'left_at')

class MessageSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    agent_color = serializers.CharField(source='agent.color', read_only=True)
    agent_avatar = serializers.CharField(source='agent.avatar', read_only=True)
    
    class Meta:
        model = Message
        fields = (
            'id', 'conversation', 'agent', 'agent_name', 'agent_color', 
            'agent_avatar', 'content', 'timestamp', 'thinking', 'confidence',
            'sentiment', 'keywords', 'embedding_id'
        )
        read_only_fields = ('created_at',)

class VectorMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorMetrics
        fields = (
            'id', 'conversation', 'timestamp', 'asymmetric_cognition',
            'meta_language_coherence', 'recursive_depth', 'incompleteness_tolerance',
            'cognitive_transparency', 'non_monotonic_exploration', 'pattern_persistence'
        )
        read_only_fields = ('created_at',)

class UserAccessSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    granted_by_email = serializers.CharField(source='granted_by.email', read_only=True)
    
    class Meta:
        model = UserAccess
        fields = (
            'id', 'user', 'user_email', 'conversation', 'access_level',
            'granted_at', 'granted_by', 'granted_by_email'
        )
        read_only_fields = ('granted_at',)

class ConversationSerializer(serializers.ModelSerializer):
    agents = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Agent.objects.all(),
        required=False
    )
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = (
            'id', 'topic', 'objective', 'system_prompt', 'max_turns',
            'temperature', 'language', 'created_by', 'created_by_email',
            'is_public', 'created_at', 'updated_at', 'completed_at',
            'is_active', 'constraints', 'enable_meta_cognition',
            'enable_recursive_thinking', 'enable_vector_monitoring',
            'enable_emergent_behavior', 'agents', 'message_count'
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by')
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def create(self, validated_data):
        agents_data = validated_data.pop('agents', [])
        conversation = Conversation.objects.create(**validated_data)
        
        for agent in agents_data:
            ConversationAgent.objects.create(
                conversation=conversation,
                agent=agent
            )
        
        return conversation

class ConversationDetailSerializer(ConversationSerializer):
    agents = ConversationAgentSerializer(
        source='conversationagent_set',
        many=True,
        read_only=True
    )
    messages = MessageSerializer(many=True, read_only=True)
    user_access = UserAccessSerializer(many=True, read_only=True)
    
    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ('messages', 'user_access')
