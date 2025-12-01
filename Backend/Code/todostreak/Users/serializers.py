import secrets
from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "profile_picture", "streak_count")


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "profile_picture")

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password", "profile_picture")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = False
        user.activation_token = secrets.token_urlsafe(32)
        user.save()
        return user


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)


class TokenObtainPairRequestSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)


class TokenObtainPairResponseSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove o campo 'username' padrão (que o SimpleJWT exige por padrão)
        if 'username' in self.fields:
            del self.fields['username']
        
        # Adiciona o campo 'email' como obrigatório
        self.fields['email'] = serializers.EmailField()
        # O campo 'password' já vem configurado pelo pai (TokenObtainPairSerializer)

    def validate(self, attrs):
        # Pega o e-mail e senha enviados pelo front
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Busca o usuário pelo e-mail
            user = User.objects.filter(email=email).first()

            if user:
                # Verifica a senha manualmente
                if not user.check_password(password):
                    raise AuthenticationFailed('Senha incorreta.')
                
                if not user.is_active:
                    raise AuthenticationFailed('Esta conta ainda não foi ativada.')

                # Gera os tokens (Refresh e Access)
                refresh = self.get_token(user)

                data = {}
                data['refresh'] = str(refresh)
                data['access'] = str(refresh.access_token)

                return data
            else:
                raise AuthenticationFailed('Nenhum usuário encontrado com este e-mail.')
        else:
            raise AuthenticationFailed('E-mail e senha são obrigatórios.')