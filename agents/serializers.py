from rest_framework import serializers
from .models import Agent

class AgentSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Agent
        fields = (
            'id', 'name', 'model', 'avatar', 'instructions', 'color',
            'description', 'role', 'expertise', 'traits', 'created_by',
            'created_by_email', 'is_public', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'created_by_email')
    
    def get_created_by_email(self, obj):
        return obj.created_by.email if obj.created_by else None
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)
