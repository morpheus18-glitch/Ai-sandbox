from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingDatasetViewSet, ModelTrainingJobViewSet

router = DefaultRouter()
router.register(r'datasets', TrainingDatasetViewSet, basename='dataset')
router.register(r'jobs', ModelTrainingJobViewSet, basename='training-job')

urlpatterns = [
    path('', include(router.urls)),
]
