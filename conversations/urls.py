from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    ConversationViewSet, MessageViewSet, 
    VectorMetricsViewSet, UserAccessViewSet
)

router = routers.SimpleRouter()
router.register(r'', ConversationViewSet, basename='conversation')

# Nested routes
messages_router = routers.NestedSimpleRouter(router, r'', lookup='conversation')
messages_router.register(r'messages', MessageViewSet, basename='conversation-messages')

metrics_router = routers.NestedSimpleRouter(router, r'', lookup='conversation')
metrics_router.register(r'metrics', VectorMetricsViewSet, basename='conversation-metrics')

access_router = routers.NestedSimpleRouter(router, r'', lookup='conversation')
access_router.register(r'access', UserAccessViewSet, basename='conversation-access')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(messages_router.urls)),
    path('', include(metrics_router.urls)),
    path('', include(access_router.urls)),
]
