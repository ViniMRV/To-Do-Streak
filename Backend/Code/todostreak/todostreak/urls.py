"""
URL configuration for todostreak project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.http import FileResponse, HttpResponse
from pathlib import Path
from django.conf.urls.static import static
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.permissions import AllowAny
FRONTEND_URL = f"http://{settings.FRONTEND_DOMAIN}/"


def serve_frontend_login(request):
    """Serve the frontend login.html file from Frontend/Code/public when available (DEV only)."""
    try:
        # settings.BASE_DIR is Backend/Code/todostreak
        project_root = Path(settings.BASE_DIR).parent.parent.parent
        login_path = project_root / "Frontend" / "Code" / "public" / "login.html"
        if login_path.exists():
            return FileResponse(open(login_path, "rb"), content_type="text/html")
        return HttpResponse(
            "Frontend login page not found. Start frontend server or place login.html in Frontend/Code/public/",
            status=404,
        )
    except Exception as e:
        return HttpResponse(f"Error serving frontend login: {e}", status=500)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", serve_frontend_login, name="home") if settings.DEBUG else path("", RedirectView.as_view(url=FRONTEND_URL, permanent=False), name="home"),
    path("users/", include("Users.urls")),
    path("lists/", include("Lists.urls")),
]

if settings.DEBUG:
    # registrar documentação apenas em DEBUG
    try:
        # expõe schema e UIs apenas em DEBUG e com permissão pública para facilitar desenvolvimento
        urlpatterns = [
            path(
                "api/schema/",
                SpectacularAPIView.as_view(permission_classes=[AllowAny]),
                name="schema",
            ),
            path(
                "api/docs/",
                SpectacularSwaggerView.as_view(url_name="schema", permission_classes=[AllowAny]),
                name="swagger-ui",
            ),
            path(
                "api/redoc/",
                SpectacularRedocView.as_view(url_name="schema", permission_classes=[AllowAny]),
                name="redoc",
            ),
        ] + urlpatterns
    except Exception:
        # drf-spectacular não disponível — ignore
        pass

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)