from django.contrib import admin

# Register your models here.
from .models import User, UserList
class UserAdmin(admin.ModelAdmin):
    exclude = ("password",)
    list_display = ("username", "first_name", "email", "is_active", "streak_count")
    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("is_active", "is_staff")


admin.site.register(User, UserAdmin)
admin.site.register(UserList)