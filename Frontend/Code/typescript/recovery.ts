import { API_URL } from './consts.js';

window.onload = () => {
    const form = document.getElementById('forgotPasswordForm') as HTMLFormElement;
    const formSection = document.getElementById('formSection') as HTMLDivElement;
    const successSection = document.getElementById('successSection') as HTMLDivElement;
    const sentEmailSpan = document.getElementById('sentEmail') as HTMLElement;
    const backBtn = document.getElementById('backToLoginBtn') as HTMLButtonElement;

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email') as HTMLInputElement;
            const email = emailInput.value;
            const btn = form.querySelector('button') as HTMLButtonElement;

            try {
                btn.disabled = true;
                btn.innerText = 'Enviando...';

                // Chama o endpoint de recuperação do Django
                const response = await fetch(`${API_URL}/password-reset/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });

                // Por segurança, muitas APIs retornam 200 (OK) mesmo se o e-mail não existir,
                // para não revelar quais e-mails estão cadastrados.
                if (response.ok) {
                    showSuccess(email);
                } else {
                    // Caso queira tratar erros específicos (opcional)
                    const data = await response.json();
                    alert('Erro: ' + (data.detail || 'Falha ao solicitar recuperação.'));
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor.');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Enviar Link de Recuperação';
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    function showSuccess(email: string) {
        formSection.style.display = 'none';
        successSection.style.display = 'block';
        if (sentEmailSpan) sentEmailSpan.innerText = email;
    }
};