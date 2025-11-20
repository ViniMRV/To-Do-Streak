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
    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            try {
                btn.disabled = true;
                btn.innerText = 'Entrando...';
                const response = yield fetch(`${API_URL}/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: password })
                    // Nota: Django User model usa 'username' por padrão, mas pode ser adaptado para email
                });
                if (response.ok) {
                    const data = yield response.json();
                    // Salva o token para usar nas outras requisições
                    localStorage.setItem('token', data.token);
                    // Redireciona para a Dashboard
                    window.location.href = 'index.html';
                }
                else {
                    alert('Login falhou! Verifique suas credenciais.');
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
    // --- LÓGICA DE CADASTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const name = document.getElementById('name').value;
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
                const response = yield fetch(`${API_URL}/register/`, {
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
