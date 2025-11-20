import { API_URL } from './consts.js';

window.onload = () => {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;

    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const btn = loginForm.querySelector('button') as HTMLButtonElement;

            try {
                btn.disabled = true;
                btn.innerText = 'Entrando...';

                const response = await fetch(`${API_URL}/login/`, { // Ajuste a rota conforme seu backend
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: password }) 
                    // Nota: Django User model usa 'username' por padrão, mas pode ser adaptado para email
                });

                if (response.ok) {
                    const data = await response.json();
                    // Salva o token para usar nas outras requisições
                    localStorage.setItem('token', data.token);
                    // Redireciona para a Dashboard
                    window.location.href = 'index.html';
                } else {
                    alert('Login falhou! Verifique suas credenciais.');
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

    // --- LÓGICA DE CADASTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = (document.getElementById('name') as HTMLInputElement).value;
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

                const response = await fetch(`${API_URL}/register/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        first_name: name,
                        username: email, 
                        email: email, 
                        password: password 
                    })
                });

                if (response.ok) {
                    alert('Conta criada com sucesso! Faça login para continuar.');
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