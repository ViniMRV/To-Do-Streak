import { API_URL } from './consts.js';

window.onload = () => {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const username = (document.getElementById('username') as HTMLInputElement)?.value || email; 
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const btn = loginForm.querySelector('button') as HTMLButtonElement;

            try {
                btn.disabled = true;
                btn.innerText = 'Entrando...';

                const response = await fetch(`${API_URL}/users/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, password: password }) 
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    window.location.href = 'index.html';
                } else {
                    alert('Falha no login! Verifique suas credenciais.');
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor.');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Entrar';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = (document.getElementById('username') as HTMLInputElement).value;
            const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
            const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
            const btn = registerForm.querySelector('button') as HTMLButtonElement;

            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = 'Criando conta...';

                const response = await fetch(`${API_URL}/users/register/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: username,
                        first_name: firstName,
                        last_name: lastName,
                        email: email, 
                        password: password 
                    })
                });

                if (response.ok) {
                    alert('Conta criada com sucesso! Verifique seu e-mail para ativar ou faça login.');
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    alert('Erro ao criar conta: ' + JSON.stringify(data));
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão.');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Criar Conta';
            }
        });
    }
};