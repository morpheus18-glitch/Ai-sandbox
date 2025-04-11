from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, F, Q
from django.utils import timezone
from .models import ConversationAnalysis, AgentPerformance, UserActivity
from .serializers import (
    ConversationAnalysisSerializer, AgentPerformanceSerializer,
    UserActivitySerializer
)
from users.permissions import IsAdminUser
from conversations.permissions import HasConversationAccess
from conversations.models import Conversation, Message, Agent

class ConversationAnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated, HasConversationAccess]
    
    def get_queryset(self):
        return ConversationAnalysis.objects.all()
    
    @action(detail=False, methods=['post'])
    def analyze_conversation(self, request):
        conversation_id = request.data.get('conversation_id')
        if not conversation_id:
            return Response(
                {"detail": "conversation_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation = Conversation.objects.get(id=conversation_id)
        
        # Check access to the conversation
        self.check_object_permissions(request, conversation)
        
        # Get messages
        messages = Message.objects.filter(conversation=conversation)
        
        if not messages.exists():
            return Response(
                {"detail": "No messages found for this conversation"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate metrics
        total_messages = messages.count()
        avg_length = messages.aggregate(avg_length=Avg(F('content').length()))['avg_length'] or 0
        
        # Create or update analysis
        analysis, created = ConversationAnalysis.objects.update_or_create(
            conversation=conversation,
            defaults={
                'total_messages': total_messages,
                'average_message_length': avg_length,
                # Other metrics would be calculated by more complex algorithms
                'topic_coherence': 0.75,  # Placeholder
                'sentiment_score': 0.6,   # Placeholder
                'complexity_score': 0.8   # Placeholder
            }
        )
        
        return Response(ConversationAnalysisSerializer(analysis).data)

class AgentPerformanceViewSet(viewsets.ModelViewSet):
    serializer_class = AgentPerformanceSerializer
    permission_classes = [permissions.IsAuthenticated, HasConversationAccess]
    
    def get_queryset(self):
        return AgentPerformance.objects.all()
    
    @action(detail=False, methods=['post'])
    def analyze_agent_performance(self, request):
        conversation_id = request.data.get('conversation_id')
        if not conversation_id:
            return Response(
                {"detail": "conversation_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation = Conversation.objects.get(id=conversation_id)
        
        # Check access to the conversation
        self.check_object_permissions(request, conversation)
        
        # Get messages grouped by agent
        agent_messages = Message.objects.filter(conversation=conversation).values('agent').annotate(
            message_count=Count('id')
        )
        
        results = []
        
        for agent_data in agent_messages:
            agent_id = agent_data['agent']
            agent = Agent.objects.get(id=agent_id)
            
            # Calculate metrics
            message_count = agent_data['message_count']
            
            # Create or update performance record
            performance, created = AgentPerformance.objects.update_or_create(
                agent=agent,
                conversation=conversation,
                defaults={
                    'message_count': message_count,
                    # Other metrics would be calculated by more complex algorithms
                    'average_response_time': 2.5,  # Placeholder
                    'coherence_score': 0.7,        # Placeholder
                    'relevance_score': 0.8,        # Placeholder
                    'creativity_score': 0.6        # Placeholder
                }
            )
            
            results.append(AgentPerformanceSerializer(performance).data)
        
        return Response(results)

class UserActivityViewSet(viewsets.ModelViewSet):
    serializer_class = UserActivitySerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return UserActivity.objects.all()
    
    @action(detail=False, methods=['post'])
    def update_user_activity(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        
        # Calculate metrics
        conversations_created = Conversation.objects.filter(created_by=user).count()
        conversations_participated = Conversation.objects.filter(
            Q(created_by=user) | Q(user_access__user=user)
        ).distinct().count()
        agents_created = Agent.objects.filter(created_by=user).count()
        total_messages = Message.objects.filter(conversation__created_by=user).count()
        
        # Create or update activity record
        activity, created = UserActivity.objects.update_or_create(
            user=user,
            defaults={
                'conversations_created': conversations_created,
                'conversations_participated': conversations_participated,
                'agents_created': agents_created,
                'total_messages': total_messages,
                'last_active': timezone.now()
            }
        )
        
        return Response(UserActivitySerializer(activity).data)
