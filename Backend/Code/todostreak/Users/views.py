import traceback
import os
from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import redirect

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
from .serializers import UserUpdateSerializer, EmailTokenObtainPairSerializer

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

            backend_domain = "localhost:8000"  # padrão para desenvolvimento local
            protocol = "http"
            
            activation_link = f"{protocol}://{backend_domain}/users/activate/{user.activation_token}/"

            try:                
                send_mail(
                    'Ative sua conta',
                    f'Olá!\n\nClique no link para ativar sua conta: {activation_link}',
                    getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    [user.email],
                    fail_silently=False,
                )
                print(f"EMAIL ENVIADO! Link gerado: {activation_link}")
            except Exception as e:
                print("ERRO DE ENVIO DETALHADO:")
                traceback.print_exc()

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateUserView(APIView):
    """Ativa conta do usuário a partir do token de ativação."""
    permission_classes = [AllowAny]

    @extend_schema()
    def get(self, request, token):
        try:
            user = User.objects.get(activation_token=token)
        except User.DoesNotExist:
            return Response({"error": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            user.is_active = True
            user.activation_token = None
            user.save()
            print(f"CONTA ATIVADA COM SUCESSO: {user.email}") # Log no terminal
        else:
             print(f"CONTA JÁ ESTAVA ATIVA: {user.email}")
        
        # Redirecionamento dinâmico para o Frontend (Porta 8080)
        # Tenta pegar o host atual (que é 8000) e mudar para 8080
        backend_host = request.get_host()
        if '8000' in backend_host:
            frontend = backend_host.replace('8000', '8080')
        else:
            frontend = getattr(settings, 'FRONTEND_DOMAIN', 'localhost:8080')
            
        protocol = "https" if request.is_secure() else "http"
        return redirect(f"{protocol}://{frontend}/login.html")

@extend_schema(
    request=TokenObtainPairRequestSerializer,
    responses={200: TokenObtainPairResponseSerializer},
)
class LoginUserView(TokenObtainPairView):
    """Login que retorna par de tokens (access + refresh) usando SimpleJWT e E-mail."""
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer
  
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
            # Mesma lógica dinâmica para o link de reset de senha
            host = request.get_host()
            if '8000' in host:
                frontend_domain = host.replace('8000', '8080')
            else:
                frontend_domain = getattr(settings, 'FRONTEND_DOMAIN', 'localhost:8080')

            opts = {
                'use_https': request.is_secure(),
                'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL'),
                'email_template_name': self.email_template_name,
                'request': request,
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