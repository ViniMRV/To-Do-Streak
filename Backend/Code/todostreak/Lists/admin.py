from django.contrib import admin
from .models import List, Item


class ItemInline(admin.TabularInline):
	model = Item
	extra = 0


@admin.register(List)
class ListAdmin(admin.ModelAdmin):
	list_display = ("title", "owner", "created_at")
	search_fields = ("title", "owner__username", "owner__email")
	inlines = [ItemInline]


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
	list_display = ("text", "todo_list", "done", "order", "completed_at")
	list_filter = ("done",)
