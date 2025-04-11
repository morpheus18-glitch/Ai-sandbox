from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentViewSet

router = DefaultRouter()
router.register(r'', AgentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
