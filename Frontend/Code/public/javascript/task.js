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
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    const form = document.getElementById('taskForm');
    const tituloInput = document.getElementById('titulo');
    const pageTitle = document.getElementById('pageTitle');
    // Se tiver ID
    if (id) {
        if (pageTitle)
            pageTitle.innerText = 'Editar Tarefa';
        // Fetch dados atuais
        const resp = yield fetch(`${API_URL}/tarefas/${id}/`, { headers: getAuthHeaders() });
        const data = yield resp.json();
        tituloInput.value = data.titulo;
    }
    // Enviar formulário
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/tarefas/${id}/` : `${API_URL}/tarefas/`;
        const response = yield fetch(url, {
            method: metodo,
            headers: getAuthHeaders(),
            body: JSON.stringify({ titulo: tituloInput.value })
        });
        if (response.ok) {
            window.location.href = 'index.html';
        }
        else {
            alert('Erro ao salvar tarefa');
        }
    }));
});
