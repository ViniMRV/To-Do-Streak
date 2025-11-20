var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { API_URL, getAuthHeaders } from './consts.js';
window.onload = () => {
    const form = document.getElementById('changePasswordForm');
    const messageDiv = document.getElementById('message');
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        // Limpa mensagens anteriores
        messageDiv.className = 'feedback-message';
        messageDiv.innerText = '';
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        // Validação básica no Frontend
        if (newPassword !== confirmPassword) {
            showMessage('As novas senhas não coincidem.', 'error');
            return;
        }
        try {
            const response = yield fetch(`${API_URL}/change-password/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });
            if (response.ok) {
                showMessage('Senha alterada com sucesso!', 'success');
                form.reset();
            }
            else {
                const data = yield response.json();
                // Exibe erro retornado pelo Django ou erro genérico
                const erroMsg = data.detail || data.error || 'Erro ao alterar senha.';
                showMessage(erroMsg, 'error');
            }
        }
        catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão com o servidor.', 'error');
        }
    }));
    function showMessage(msg, type) {
        messageDiv.innerText = msg;
        messageDiv.className = `feedback-message ${type}`;
    }
};
