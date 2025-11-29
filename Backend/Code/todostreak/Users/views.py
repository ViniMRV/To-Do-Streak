import secrets
from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import User
from .forms import CustomPasswordResetForm
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    EmailSerializer,
    PasswordResetConfirmSerializer,
    TokenObtainPairRequestSerializer,
    TokenObtainPairResponseSerializer,
)
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserUpdateSerializer
from rest_framework.permissions import IsAuthenticated

class RegisterUserView(APIView):
    """API endpoint para registrar usuário usando DRF serializer."""
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: UserSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            frontend_domain = getattr(settings, 'FRONTEND_DOMAIN', 'localhost:3000')
            activation_link = f"http://{frontend_domain}/ativar-conta/{user.activation_token}/"

            try:
                send_mail(
                    'Ative sua conta',
                    f'Olá!\n\nClique no link para ativar sua conta: {activation_link}',
                    getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    [user.email],
                    fail_silently=True,
                )
            except Exception:
                # don't block registration if email sending fails in dev
                pass

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateUserView(APIView):
    """Ativa conta do usuário a partir do token de ativação."""
    permission_classes = [AllowAny]

    @extend_schema()
    def post(self, request, token):
        try:
            user = User.objects.get(activation_token=token)
        except User.DoesNotExist:
            return Response({"error": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_active:
            return Response({"message": "Conta já ativa."}, status=status.HTTP_200_OK)

        user.is_active = True
        user.activation_token = None
        user.save()
        return Response({"message": "Conta ativada com sucesso."}, status=status.HTTP_200_OK)

@extend_schema(
    request=TokenObtainPairRequestSerializer,
    responses={200: TokenObtainPairResponseSerializer},
)
class LoginUserView(TokenObtainPairView):
    """Login que retorna par de tokens (access + refresh) usando SimpleJWT."""
    permission_classes = [AllowAny]
  
class LogoutUserView(APIView):
    """Logout para JWT: recebe refresh token e adiciona à blacklist."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout ok."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class UserPasswordResetView(APIView):
    """
    API View para solicitar redefinição de senha.
    Recebe um JSON: {"email": "user@example.com"}
    """

    permission_classes = [AllowAny]
    email_template_name = "users/password_reset_email.html" 

    @extend_schema(request=EmailSerializer, responses={200: None})
    def post(self, request):
        form = CustomPasswordResetForm(request.data)
        
        if form.is_valid():
            frontend_domain = getattr(settings, 'FRONTEND_DOMAIN', 'localhost:3000')

            opts = {
                'use_https': request.is_secure(),
                'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL'),
                'email_template_name': self.email_template_name,
                'request': request,
                # Isso força o link a ser gerado com o endereço do front
                'domain_override': frontend_domain, 
            }

            form.save(**opts)

            return Response(
                {"message": "Se o e-mail existir, enviamos um link de redefinição."}, 
                status=status.HTTP_200_OK
            )
        
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class UserMeView(APIView):
    """Retrieve or update the authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPasswordResetConfirmView(APIView):
    """
    Recebe os dados para efetivar a troca de senha.
    """

    permission_classes = [AllowAny]

    @extend_schema(request=PasswordResetConfirmSerializer, responses={200: None})
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                new_password = request.data.get('new_password')

                if not new_password:
                    return Response(
                        {"error": "A nova senha é obrigatória."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.set_password(new_password)
                user.save()
                return Response({"message": "Senha alterada com sucesso!"}, status=status.HTTP_200_OK)
            
            else:
                return Response(
                    {"error": "Link da redefinição inválido ou expirado."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Link inválido."},
                status=status.HTTP_400_BAD_REQUEST
            )

