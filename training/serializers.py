from rest_framework import serializers
from .models import TrainingDataset, DatasetConversation, ModelTrainingJob

class DatasetConversationSerializer(serializers.ModelSerializer):
    conversation_topic = serializers.CharField(source='conversation.topic', read_only=True)
    added_by_email = serializers.CharField(source='added_by.email', read_only=True)
    
    class Meta:
        model = DatasetConversation
        fields = (
            'id', 'dataset', 'conversation', 'conversation_topic',
            'added_at', 'added_by', 'added_by_email'
        )
        read_only_fields = ('added_at',)

class TrainingDatasetSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    conversation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingDataset
        fields = (
            'id', 'name', 'description', 'created_by', 'created_by_email',
            'is_public', 'created_at', 'updated_at', 'conversation_count'
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by')
    
    def get_conversation_count(self, obj):
        return obj.conversations.count()

class TrainingDatasetDetailSerializer(TrainingDatasetSerializer):
    conversations = DatasetConversationSerializer(
        source='datasetconversation_set',
        many=True,
        read_only=True
    )
    
    class Meta(TrainingDatasetSerializer.Meta):
        fields = TrainingDatasetSerializer.Meta.fields + ('conversations',)

class ModelTrainingJobSerializer(serializers.ModelSerializer):
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = ModelTrainingJob
        fields = (
            'id', 'dataset', 'dataset_name', 'model_name', 'status',
            'parameters', 'created_by', 'created_by_email', 'created_at',
            'started_at', 'completed_at', 'error_message'
        )
        read_only_fields = ('created_at', 'started_at', 'completed_at', 'error_message')
