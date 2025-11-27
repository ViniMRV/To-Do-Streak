from django.urls import path
from . import views

app_name = "lists"

urlpatterns = [
    # placeholder - implement API endpoints as needed
    path("", views.index, name="index"),
]
