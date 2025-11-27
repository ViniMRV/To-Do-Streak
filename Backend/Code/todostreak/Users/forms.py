from django import forms
from .models import User
from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm
import os

domain_override = os.environ.get("FRONTEND_DOMAIN", "localhost:3000")

class UserRegistrationForm(forms.ModelForm):

    username = forms.CharField(
                    max_length=30,
                    label = "Username",
                    error_messages={'required': "Por favor, insira um nome de usuário.",
                            'unique': "Este nome de usuário já está em uso.",
                            'max_length': "O nome de usuário não pode ter mais de 30 caracteres.",
                    }
    )
    
    first_name = forms.CharField(
                    label = "Nome",
                    error_messages={'required': "Por favor, insira seu nome.",}
    )
    
    last_name = forms.CharField(
                    label = "Sobrenome",
                    error_messages={'required': "Por favor, insira seu sobrenome.",}
    )

    email = forms.EmailField(
                    label = "Email",
                    error_messages={'required': "Por favor, insira seu email.",
                                    'unique': "Este email já está em uso.",
                                    'invalid': "Por favor, insira um email válido.",
                    }
    )

    password = forms.CharField(
                    widget = forms.PasswordInput,
                    label = "Senha",
                    error_messages={'required': "A senha é obrigatória.",}
    )

    profile_picture = forms.ImageField(
                    required = False,
                    label = "Foto de Perfil",
    )


    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'profile_picture']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


class CustomPasswordResetForm(PasswordResetForm):
    def save(self, domain_override=None, subject_template_name=None, email_template_name=None, use_https=False,
             token_generator=None, from_email=None, request=None, html_email_template_name=None, extra_email_context=None):
        # prefer explicit domain_override, fallback to FRONTEND_DOMAIN
        domain_override = domain_override or getattr(settings, "FRONTEND_DOMAIN", os.environ.get("FRONTEND_DOMAIN", "localhost:3000"))
        use_https = True
        subject_template_name = None
        self.subject = "Redefinição de senha - To-Do Streak"

        return super().save(
            domain_override=domain_override,
            subject_template_name=subject_template_name,
            email_template_name=email_template_name,
            use_https=use_https,
            token_generator=token_generator,
            from_email=from_email,
            request=request,
            html_email_template_name=html_email_template_name,
            extra_email_context=extra_email_context,
        )



