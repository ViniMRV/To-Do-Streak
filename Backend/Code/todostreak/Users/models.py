from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

def path_to_profile_picture(instance, filename):
    type = filename.split('.')[-1] # get file extension
    email = instance.email.replace('@', '_at_').replace('.', '_dot_') 
    file_name = f"{email}_profile_picture.{type}"

    return f"profile_pictures/{email}/{file_name}"

class User(AbstractUser):

    activation_token = models.CharField(max_length=64, blank=True, null=True)
    email = models.EmailField (unique=True)
    profile_picture = models.ImageField(upload_to=path_to_profile_picture, null=True, blank=True)

    def __str__(self):
        return f"{ self.username }"


class UserList(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    list_name = models.ForeignKey("Lists.List", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lista \"{ self.list_name }\" do usuário { self.user.username }"