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
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            try {
                btn.disabled = true;
                btn.innerText = 'Signing in...';
                const response = yield fetch(`${API_URL}/users/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: password })
                });
                if (response.ok) {
                    const data = yield response.json();
                    // Save JWT tokens
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    // Redirect to Dashboard
                    window.location.href = 'index.html';
                }
                else {
                    alert('Login failed! Please check your credentials.');
                }
            }
            catch (error) {
                console.error(error);
                alert('Connection error.');
            }
            finally {
                btn.disabled = false;
                btn.innerText = 'Entrar';
            }
        }));
    }
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const btn = registerForm.querySelector('button');
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            try {
                btn.disabled = true;
                btn.innerText = 'Creating account...';
                const response = yield fetch(`${API_URL}/users/register/`, {
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
                }
                else {
                    const data = yield response.json();
                    alert('Error creating account: ' + JSON.stringify(data));
                }
            }
            catch (error) {
                console.error(error);
                alert('Connection error.');
            }
            finally {
                btn.disabled = false;
                btn.innerText = 'Criar Conta';
            }
        }));
    }
};
