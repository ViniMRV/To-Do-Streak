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
function loadDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userResp = yield fetch(`${API_URL}/users/me/`, {
                headers: getAuthHeaders()
            });
            if (userResp.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            const userData = yield userResp.json();
            const streakElement = document.getElementById('streakValue');
            if (streakElement)
                streakElement.innerText = userData.streak_count.toString();
            const listsResp = yield fetch(`${API_URL}/lists/`, {
                headers: getAuthHeaders()
            });
            const lists = yield listsResp.json();
            const listElement = document.getElementById('taskList');
            if (listElement) {
                listElement.innerHTML = '';
                if (lists.length === 0) {
                    listElement.innerHTML = '<li>Nenhuma lista encontrada. Crie uma tarefa para começar!</li>';
                    return;
                }
                const mainList = lists[0];
                localStorage.setItem('current_list_id', mainList.id.toString());
                if (mainList.items.length === 0) {
                    listElement.innerHTML = '<li style="justify-content:center; color:#888;">Nenhuma tarefa pendente. Aproveite o dia! ☀️</li>';
                }
                mainList.items.forEach(item => {
                    const li = document.createElement('li');
                    if (item.done)
                        li.classList.add('done');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = item.done;
                    checkbox.onclick = () => toggleItem(item);
                    const span = document.createElement('span');
                    span.innerText = item.text;
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'task-actions';
                    const btnEdit = document.createElement('a');
                    btnEdit.innerText = '✏️';
                    btnEdit.href = `task.html?id=${item.id}`;
                    const btnDel = document.createElement('button');
                    btnDel.innerText = '🗑️';
                    btnDel.onclick = () => deleteItem(item.id);
                    actionsDiv.append(btnEdit, btnDel);
                    li.append(checkbox, span, actionsDiv);
                    listElement.appendChild(li);
                });
            }
        }
        catch (error) {
            console.error(error);
            const listElement = document.getElementById('taskList');
            if (listElement)
                listElement.innerHTML = '<li style="color:red">Erro ao carregar dados.</li>';
        }
    });
}
function toggleItem(item) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fetch(`${API_URL}/lists/items/${item.id}/`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ done: !item.done })
            });
            loadDashboard(); // Reload to update UI
        }
        catch (error) {
            console.error('Error toggling item:', error);
            alert('Erro ao atualizar tarefa.');
        }
    });
}
function deleteItem(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm("Tem certeza que deseja excluir?"))
            return;
        try {
            yield fetch(`${API_URL}/lists/items/${id}/`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            loadDashboard();
        }
        catch (error) {
            console.error('Error deleting item:', error);
            alert('Erro ao excluir tarefa.');
        }
    });
}
window.onload = loadDashboard;
