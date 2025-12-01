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
            const emailInput = document.getElementById('email');
            const email = emailInput.value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            try {
                btn.disabled = true;
                btn.innerText = 'Entrando...';
                const response = yield fetch(`${API_URL}/users/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });
                if (response.ok) {
                    const data = yield response.json();
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    window.location.href = 'index.html';
                }
                else {
                    const errorData = yield response.json();
                    alert(errorData.detail || 'Falha no login! Verifique suas credenciais.');
                    //alert('Falha no login! Verifique suas credenciais.');
                }
            }
            catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor.');
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
            const username = document.getElementById('username').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const btn = registerForm.querySelector('button');
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            try {
                btn.disabled = true;
                btn.innerText = 'Criando conta...';
                const response = yield fetch(`${API_URL}/users/register/`, {
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
                }
                else {
                    const data = yield response.json();
                    alert('Erro ao criar conta: ' + JSON.stringify(data));
                }
            }
            catch (error) {
                console.error(error);
                alert('Erro de conexão.');
            }
            finally {
                btn.disabled = false;
                btn.innerText = 'Criar Conta';
            }
        }));
    }
};
