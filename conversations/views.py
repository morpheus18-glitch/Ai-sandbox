from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Conversation, Message, VectorMetrics, UserAccess
from .serializers import (
    ConversationSerializer, ConversationDetailSerializer, MessageSerializer,
    VectorMetricsSerializer, UserAccessSerializer
)
from users.permissions import IsStandardOrAdmin
from .permissions import HasConversationAccess
from .llm_service import generate_agent_response
from .consumers import ConversationConsumer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, HasConversationAccess]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_public', 'language']
    search_fields = ['topic', 'objective']
    ordering_fields = ['created_at', 'updated_at', 'topic']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin users can see all conversations
        if user.role == 'admin':
            return Conversation.objects.all()
        
        # Standard and guest users can see public conversations, their own conversations,
        # and conversations they have access to
        return Conversation.objects.filter(
            Q(is_public=True) | 
            Q(created_by=user) |
            Q(user_access__user=user)
        ).distinct()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        conversation = self.get_object()
        
        if conversation.is_active:
            return Response(
                {"detail": "Conversation is already active"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation.is_active = True
        conversation.save()
        
        # Notify clients via WebSocket
        ConversationConsumer.conversation_updated(conversation.id, {
            'type': 'conversation_started',
            'conversation_id': conversation.id
        })
        
        return Response({"detail": "Conversation started"})
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        conversation = self.get_object()
        
        if not conversation.is_active:
            return Response(
                {"detail": "Conversation is already paused"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation.is_active = False
        conversation.save()
        
        # Notify clients via WebSocket
        ConversationConsumer.conversation_updated(conversation.id, {
            'type': 'conversation_paused',
            'conversation_id': conversation.id
        })
        
        return Response({"detail": "Conversation paused"})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        conversation = self.get_object()
        
        conversation.is_active = False
        conversation.completed_at = timezone.now()
        conversation.save()
        
        # Notify clients via WebSocket
        ConversationConsumer.conversation_updated(conversation.id, {
            'type': 'conversation_completed',
            'conversation_id': conversation.id
        })
        
        return Response({"detail": "Conversation marked as completed"})
    
    @action(detail=True, methods=['post'])
    def generate_response(self, request, pk=None):
        conversation = self.get_object()
        agent_id = request.data.get('agent_id')
        
        if not agent_id:
            return Response(
                {"detail": "agent_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not conversation.is_active:
            return Response(
                {"detail": "Cannot generate response for inactive conversation"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the agent
        agent = get_object_or_404(conversation.agents, id=agent_id)
        
        # Get conversation messages
        messages = conversation.messages.all().order_by('timestamp')
        
        # Generate response
        try:
            response = generate_agent_response(
                agent=agent,
                conversation=conversation,
                messages=messages
            )
            
            # Save the response
            message = Message.objects.create(
                id=response['id'],
                conversation=conversation,
                agent=agent,
                content=response['content'],
                timestamp=response['timestamp'],
                thinking=response.get('thinking'),
                confidence=response.get('confidence')
            )
            
            # Notify clients via WebSocket
            ConversationConsumer.new_message(conversation.id, MessageSerializer(message).data)
            
            return Response(MessageSerializer(message).data)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        conversation = self.get_object()
        user_id = request.data.get('user_id')
        access_level = request.data.get('access_level', 'view')
        
        if not user_id:
            return Response(
                {"detail": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if access_level not in ['view', 'edit', 'admin']:
            return Response(
                {"detail": "Invalid access_level. Must be one of: view, edit, admin"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the user
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or update access
        access, created = UserAccess.objects.update_or_create(
            user=user,
            conversation=conversation,
            defaults={
                'access_level': access_level,
                'granted_by': request.user
            }
        )
        
        return Response(UserAccessSerializer(access).data)
    
    @action(detail=True, methods=['post'])
    def revoke_access(self, request, pk=None):
        conversation = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"detail": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the access
        deleted, _ = UserAccess.objects.filter(
            user_id=user_id,
            conversation=conversation
        ).delete()
        
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"detail": "Access not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, HasConversationAccess]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['agent']
    ordering_fields = ['timestamp']
    ordering = ['timestamp']
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        return Message.objects.filter(conversation_id=conversation_id)
    
    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_pk')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if the user has access to the conversation
        self.check_object_permissions(self.request, conversation)
        
        serializer.save(conversation=conversation)
        
        # Notify clients via WebSocket
        ConversationConsumer.new_message(conversation.id, serializer.data)

class VectorMetricsViewSet(viewsets.ModelViewSet):
    serializer_class = VectorMetricsSerializer
    permission_classes = [permissions.IsAuthenticated, HasConversationAccess]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['timestamp']
    ordering = ['timestamp']
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        return VectorMetrics.objects.filter(conversation_id=conversation_id)
    
    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_pk')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if the user has access to the conversation
        self.check_object_permissions(self.request, conversation)
        
        serializer.save(conversation=conversation)

class UserAccessViewSet(viewsets.ModelViewSet):
    serializer_class = UserAccessSerializer
    permission_classes = [permissions.IsAuthenticated, HasConversationAccess]
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        return UserAccess.objects.filter(conversation_id=conversation_id)
    
    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_pk')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if the user has access to the conversation
        self.check_object_permissions(self.request, conversation)
        
        serializer.save(
            conversation=conversation,
            granted_by=self.request.user
        )
