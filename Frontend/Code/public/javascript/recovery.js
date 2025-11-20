var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { API_URL } from './consts.js';
window.onload = () => {
    const form = document.getElementById('forgotPasswordForm');
    const formSection = document.getElementById('formSection');
    const successSection = document.getElementById('successSection');
    const sentEmailSpan = document.getElementById('sentEmail');
    const backBtn = document.getElementById('backToLoginBtn');
    if (form) {
        form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            const email = emailInput.value;
            const btn = form.querySelector('button');
            try {
                btn.disabled = true;
                btn.innerText = 'Enviando...';
                // Chama o endpoint de recuperação do Django
                const response = yield fetch(`${API_URL}/password-reset/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });
                // Por segurança, muitas APIs retornam 200 (OK) mesmo se o e-mail não existir,
                // para não revelar quais e-mails estão cadastrados.
                if (response.ok) {
                    showSuccess(email);
                }
                else {
                    // Caso queira tratar erros específicos (opcional)
                    const data = yield response.json();
                    alert('Erro: ' + (data.detail || 'Falha ao solicitar recuperação.'));
                }
            }
            catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor.');
            }
            finally {
                btn.disabled = false;
                btn.innerText = 'Enviar Link de Recuperação';
            }
        }));
    }
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    function showSuccess(email) {
        formSection.style.display = 'none';
        successSection.style.display = 'block';
        if (sentEmailSpan)
            sentEmailSpan.innerText = email;
    }
};
