from django.http import JsonResponse


def index(request):
	return JsonResponse({"message": "Lists API root"})
