import { API_URL } from './consts.js';

window.onload = () => {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const btn = loginForm.querySelector('button') as HTMLButtonElement;

            try {
                btn.disabled = true;
                btn.innerText = 'Signing in...';

                const response = await fetch(`${API_URL}/users/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: password }) 
                });

                if (response.ok) {
                    const data = await response.json();
                    // Save JWT tokens
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    // Redirect to Dashboard
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed! Please check your credentials.');
                }
            } catch (error) {
                console.error(error);
                alert('Connection error.');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Entrar';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = (document.getElementById('name') as HTMLInputElement).value;
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
            const btn = registerForm.querySelector('button') as HTMLButtonElement;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = 'Creating account...';

                const response = await fetch(`${API_URL}/users/register/`, {
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
                    alert('Account created successfully! Please login.');
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    alert('Error creating account: ' + JSON.stringify(data));
                }
            } catch (error) {
                console.error(error);
                alert('Connection error.');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Criar Conta';
            }
        });
    }
};