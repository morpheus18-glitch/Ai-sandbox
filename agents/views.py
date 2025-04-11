from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Agent
from .serializers import AgentSerializer
from users.permissions import IsStandardOrAdmin

class AgentViewSet(viewsets.ModelViewSet):
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['model', 'role', 'is_public']
    search_fields = ['name', 'description', 'role']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin users can see all agents
        if user.role == 'admin':
            return Agent.objects.all()
        
        # Standard and guest users can see public agents and their own agents
        return Agent.objects.filter(
            Q(is_public=True) | Q(created_by=user)
        )
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStandardOrAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
