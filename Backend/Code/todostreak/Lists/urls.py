from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r"", views.ListViewSet, basename="lists")
router.register(r"items", views.ItemViewSet, basename="items")

app_name = "lists"

urlpatterns = [
    path("", include(router.urls)),
]
