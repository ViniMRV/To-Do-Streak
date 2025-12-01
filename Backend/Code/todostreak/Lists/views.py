from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import List, Item
from .serializers import ListSerializer, ItemSerializer


class IsOwner(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		return obj.owner == request.user


class ListViewSet(viewsets.ModelViewSet):
	serializer_class = ListSerializer
	permission_classes = [permissions.IsAuthenticated]
	lookup_value_regex = r'\d+'

	def get_queryset(self):
		# only lists owned by request.user
		return List.objects.filter(owner=self.request.user).order_by("-created_at")

	def perform_create(self, serializer):
		serializer.save(owner=self.request.user)


class ItemViewSet(viewsets.ModelViewSet):
	serializer_class = ItemSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		# only items that belong to lists owned by request.user
		return Item.objects.filter(todo_list__owner=self.request.user).order_by("order")

	def perform_create(self, serializer):
		todo_list = serializer.validated_data.get("todo_list")
		if todo_list.owner != self.request.user:
			raise PermissionError("Cannot add item to another user's list")
		serializer.save()

