
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


class List(models.Model):
	"""Modelo mínimo para representar uma lista (to-do list).

	Campos:
	- owner: usuário dono da lista
	- title: nome da lista
	- description: descrição opcional
	- image: foto opcional da lista
	- created_at: timestamp de criação
	"""
	# inicialmente permitimos NULL para facilitar migrações em bancos existentes
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lists", null=True, blank=True)
	title = models.CharField(max_length=200, blank=True)
	description = models.TextField(blank=True, null=True)
	image = models.ImageField(upload_to="list_pictures/", null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return self.title or f"lista {self.pk}"


class Item(models.Model):
	"""Uma atividade dentro de uma List. Cada item tem texto e um estado feito/não feito."""
	todo_list = models.ForeignKey(List, related_name="items", on_delete=models.CASCADE)
	text = models.CharField(max_length=300)
	done = models.BooleanField(default=False)
	order = models.PositiveIntegerField(default=0)
	completed_at = models.DateTimeField(null=True, blank=True)

	def __str__(self) -> str:
		return f"{self.text} ({'done' if self.done else 'todo'})"


def _try_increment_user_streak(todo_list: List):
	"""If all items in todo_list are done and user hasn't already had their streak incremented today,
	increment the owner's streak_count and set last_streak_date to today.
	This gives at most one increment per day per user (regardless of how many lists completed).
	"""
	owner = todo_list.owner
	today = timezone.localdate()
	# if any item not done, nothing to do
	if todo_list.items.filter(done=False).exists():
		return
	# already incremented today?
	if owner.last_streak_date == today:
		return
	owner.streak_count = (owner.streak_count or 0) + 1
	owner.last_streak_date = today
	owner.save(update_fields=["streak_count", "last_streak_date"])


@receiver(post_save, sender=Item)
def item_post_save(sender, instance: Item, created, **kwargs):
	# set completed_at when item is marked done and timestamp missing
	if instance.done and instance.completed_at is None:
		Item.objects.filter(pk=instance.pk).update(completed_at=timezone.now())
	# after every save, check if the whole list is complete and update streak
	try:
		_try_increment_user_streak(instance.todo_list)
	except Exception:
		# avoid breaking request on unexpected errors during signal handling
		pass
