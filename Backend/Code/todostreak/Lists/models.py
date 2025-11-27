from django.db import models
from django.conf import settings


class List(models.Model):
	"""Modelo mínimo para representar uma lista (to-do list).

	Campos:
	- title: nome da lista
	- description: descrição opcional
	- created_at: timestamp de criação
	"""
	title = models.CharField(max_length=200)
	description = models.TextField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return self.title
