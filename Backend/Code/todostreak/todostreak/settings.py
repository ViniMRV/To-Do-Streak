import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR.parent.parent, '.env'))

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-r3-i+f4b+c4en$w+%30aas9ahnaj2ak1etrn2c-h%ehwxt67+9"

DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    ".github.dev",
]

FRONTEND_DOMAIN = getattr(globals().get('os', __import__('os')).environ, 'get', lambda k, d=None: d)('FRONTEND_DOMAIN', 'localhost:3000')

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "https://localhost:8000",
    "https://*.github.dev",
    "http://localhost:8080",
    "https://localhost:8080",
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "Users",
    "Lists",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "todostreak.urls"

FRONTEND_DOMAIN = "localhost:8080"

CORS_ALLOW_CREDENTIALS = True  

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "https://localhost:8000",
    "http://localhost:8080",
    "https://localhost:8080",
    "https://*.github.dev",
    f"http://{FRONTEND_DOMAIN}",
    f"https://{FRONTEND_DOMAIN}"
]
CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOWED_ORIGINS = [
#     f"http://{FRONTEND_DOMAIN}",
#     f"https://{FRONTEND_DOMAIN}",
# ]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "todostreak.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "Users.User"

from datetime import timedelta

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "To-Do Streak API",
    "DESCRIPTION": "API do backend do To-Do Streak (DRF + SimpleJWT)",
    "VERSION": "1.0.0",
    "COMPONENTS": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
            ,
            "jwtAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        }
    },
    "SECURITY": [{"BearerAuth": []}],
}

SPECTACULAR_SETTINGS.setdefault("SERVERS", [{"url": "http://localhost:8000", "description": "Development server"}])

# Configurações de E-mail (Gmail SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# O os.getenv tenta ler do .env, se falhar (None), usa o segundo valor como padrão
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'quiz4funemailsender@gmail.com')

# A senha com espaços PRECISA estar correta aqui
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'eawq mygk cngy yldz')

# Tratamento do booleano (True/False)
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'

DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Quiz4Fun <quiz4funemailsender@gmail.com>')

# Debug: Mostrar erros no terminal em vez de silenciar
EMAIL_FAIL_SILENTLY = False