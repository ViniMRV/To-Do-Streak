import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.contrib.auth import authenticate
from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator

from .models import User
from .forms import UserRegistrationForm, CustomPasswordResetForm

class RegisterUserView(APIView):
    """
    API View para registrar um novo usuário.
    Recebe um JSON com os campos do formulário de registro.
    """
    permission_classes = [AllowAny]
    
    if form.is_valid():
        try:
            user = form.save(commit = False)
            user.is_active = False  
            user.activation_token = secrets.token_urlsafe(32)
            user.save()

            frontend_domain = getattr(settings, 'FRONTEND_DOMAIN', 'localhost:3000')
            activation_link = f"http://{frontend_domain}/ativar-conta/{ user.activation_token }/"

            send_mail(
                'Ative sua conta',
                f'Hello World!\n\n Clique no link para ativar sua conta: { activation_link }',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

            return Response(
                {"message": "Usuário registrado com sucesso. Verifique seu e-mail para ativar a conta."}, 
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": "Erro ao processar o cadastro.", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateUserView(APIView):
    """
    API View para ativar a conta do usuário.
    Recebe o token de ativação na URL.
    """
    permission_classes = [AllowAny]

    def post(self, request, token):
        try:
            user = User.objects.get(activation_token=token)

            if user.is_active:
                return Response(
                    {"message": "Essa conta já está ativa."}, 
                    status=status.HTTP_200_OK
                )
                user.is_active = True
                user.activation_token = None
                user.save()

                return Response(
                    {"message": "Conta ativada com sucesso."}, 
                    status=status.HTTP_200_OK
                )
        except User.DoesNotExist:
            return Response(
                {"error": "Token de ativação inválido ou expirado."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class LoginUserView(APIView):
    """
    Autentica o usuario e retorna um Token de acesso.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email e senha são obrigatórios."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user = authenticate(request, username=email, password=password)

        if user is not None:
            if not user.is_active:
                return Response(
                    {"error": "Conta não ativada. Por favor, ative sua conta via e-mail."}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                    "token": token.key,
                    "user_id": user.pk,
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email,
                    "profile_picture": user.profile_picture.url if user.profile_picture else None,
                }, 
                status=status.HTTP_200_OK
            )
        return Response({"error": "Email ou senha inválidos."}, status=status.HTTP_401_UNAUTHORIZED)
  
class LogoutUserView(APIView):
    """
    Realiza logout do usuário, invalidando o Token de acesso.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()  
        return Response({"message": "Logout realizado com sucesso."}, status=status.HTTP_200_OK)


class UserPasswordResetView(APIView):
    """
    API View para solicitar redefinição de senha.
    Recebe um JSON: {"email": "user@example.com"}
    """

    permission_classes = [AllowAny]
    email_template_name = "users/password_reset_email.html" 

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

class UserPasswordResetConfirmView(APIView):
    """
    Recebe os dados para efetivar a troca de senha.
    """

    permission_classes = [AllowAny]

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

