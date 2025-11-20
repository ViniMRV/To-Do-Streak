import { API_URL, getAuthHeaders } from './consts.js';

window.onload = () => {
    const form = document.getElementById('changePasswordForm') as HTMLFormElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Limpa mensagens anteriores
        messageDiv.className = 'feedback-message';
        messageDiv.innerText = '';

        const oldPassword = (document.getElementById('oldPassword') as HTMLInputElement).value;
        const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;

        // Validação básica no Frontend
        if (newPassword !== confirmPassword) {
            showMessage('As novas senhas não coincidem.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/change-password/`, {
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
            } else {
                const data = await response.json();
                // Exibe erro retornado pelo Django ou erro genérico
                const erroMsg = data.detail || data.error || 'Erro ao alterar senha.';
                showMessage(erroMsg, 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão com o servidor.', 'error');
        }
    });

    function showMessage(msg: string, type: 'success' | 'error') {
        messageDiv.innerText = msg;
        messageDiv.className = `feedback-message ${type}`;
    }
};