import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import TrainingDataset, DatasetConversation, ModelTrainingJob
from .serializers import (
    TrainingDatasetSerializer, TrainingDatasetDetailSerializer,
    DatasetConversationSerializer, ModelTrainingJobSerializer
)
from users.permissions import IsStandardOrAdmin
from conversations.permissions import HasConversationAccess
from conversations.models import Conversation
from .tasks import start_model_training

class TrainingDatasetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStandardOrAdmin]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TrainingDatasetDetailSerializer
        return TrainingDatasetSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin users can see all datasets
        if user.role == 'admin':
            return TrainingDataset.objects.all()
        
        # Standard users can see public datasets and their own datasets
        return TrainingDataset.objects.filter(
            Q(is_public=True) | Q(created_by=user)
        )
    
    def perform_create(self, serializer):
        serializer.save(
            id=uuid.uuid4(),
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def add_conversation(self, request, pk=None):
        dataset = self.get_object()
        conversation_id = request.data.get('conversation_id')
        
        if not conversation_id:
            return Response(
                {"detail": "conversation_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the conversation
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if the user has access to the conversation
        self.check_object_permissions(request, conversation)
        
        # Add conversation to dataset
        dataset_conversation, created = DatasetConversation.objects.get_or_create(
            dataset=dataset,
            conversation=conversation,
            defaults={'added_by': request.user}
        )
        
        if not created:
            return Response(
                {"detail": "Conversation already in dataset"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            DatasetConversationSerializer(dataset_conversation).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def remove_conversation(self, request, pk=None):
        dataset = self.get_object()
        conversation_id = request.data.get('conversation_id')
        
        if not conversation_id:
            return Response(
                {"detail": "conversation_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the dataset conversation
        deleted, _ = DatasetConversation.objects.filter(
            dataset=dataset,
            conversation_id=conversation_id
        ).delete()
        
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"detail": "Conversation not found in dataset"},
                status=status.HTTP_404_NOT_FOUND
            )

class ModelTrainingJobViewSet(viewsets.ModelViewSet):
    serializer_class = ModelTrainingJobSerializer
    permission_classes = [IsStandardOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin users can see all training jobs
        if user.role == 'admin':
            return ModelTrainingJob.objects.all()
        
        # Standard users can see their own training jobs
        return ModelTrainingJob.objects.filter(created_by=user)
    
    def perform_create(self, serializer):
        job = serializer.save(
            id=uuid.uuid4(),
            created_by=self.request.user,
            status='pending'
        )
        
        # Queue the training job
        start_model_training.delay(str(job.id))
        
        return job
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        job = self.get_object()
        
        if job.status not in ['pending', 'running']:
            return Response(
                {"detail": "Cannot cancel a job that is not pending or running"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        job.status = 'failed'
        job.error_message = 'Cancelled by user'
        job.save()
        
        return Response({"detail": "Job cancelled"})
