from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConversationAnalysisViewSet, AgentPerformanceViewSet,
    UserActivityViewSet
)

router = DefaultRouter()
router.register(r'conversation-analysis', ConversationAnalysisViewSet, basename='conversation-analysis')
router.register(r'agent-performance', AgentPerformanceViewSet, basename='agent-performance')
router.register(r'user-activity', UserActivityViewSet, basename='user-activity')

urlpatterns = [
    path('', include(router.urls)),
]
