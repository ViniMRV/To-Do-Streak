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
    const titleInput = document.getElementById('titulo');
    const pageTitle = document.getElementById('pageTitle');
    if (id) {
        if (pageTitle)
            pageTitle.innerText = 'Editar Tarefa';
        const resp = yield fetch(`${API_URL}/lists/items/${id}/`, { headers: getAuthHeaders() });
        if (resp.ok) {
            const data = yield resp.json();
            titleInput.value = data.text; // Field is 'text'
        }
    }
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        let listId = localStorage.getItem('current_list_id');
        if (!id && !listId) {
            try {
                const listResp = yield fetch(`${API_URL}/lists/`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ title: "Minha Lista" })
                });
                if (listResp.ok) {
                    const newList = yield listResp.json();
                    listId = newList.id.toString();
                    localStorage.setItem('current_list_id', listId);
                }
            }
            catch (err) {
                console.error("Error creating default list", err);
            }
        }
        const method = id ? 'PATCH' : 'POST';
        const url = id ? `${API_URL}/lists/items/${id}/` : `${API_URL}/lists/items/`;
        const payload = { text: titleInput.value };
        if (!id && listId) {
            payload.todo_list = parseInt(listId);
        }
        const response = yield fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            window.location.href = 'index.html';
        }
        else {
            const err = yield response.json();
            console.error(err);
            alert('Erro ao salvar tarefa: ' + JSON.stringify(err));
        }
    }));
});
