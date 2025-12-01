import { API_URL, getAuthHeaders } from './consts.js';

interface Item {
    id: number;
    text: string;
    done: boolean;
    order: number;
}

interface ToDoList {
    id: number;
    title: string;
    items: Item[];
}

interface UserData {
    username: string;
    streak_count: number;
}

async function loadDashboard() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const userResp = await fetch(`${API_URL}/users/me/`, {
            headers: getAuthHeaders()
        });
        
        if (userResp.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = 'login.html';
            return;
        }
        const userData: UserData = await userResp.json();
        
        const streakElement = document.getElementById('streakValue');
        if (streakElement) streakElement.innerText = userData.streak_count.toString();

        const listsResp = await fetch(`${API_URL}/lists/`, {
            headers: getAuthHeaders()
        });
        const lists: ToDoList[] = await listsResp.json();

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
                if (item.done) li.classList.add('done');

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

    } catch (error) {
        console.error(error);
        const listElement = document.getElementById('taskList');
        if (listElement) listElement.innerHTML = '<li style="color:red">Erro ao carregar dados.</li>';
    }
}

async function toggleItem(item: Item) {
    try {
        await fetch(`${API_URL}/lists/items/${item.id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ done: !item.done })
        });
        loadDashboard(); // Reload to update UI
    } catch (error) {
        console.error('Error toggling item:', error);
        alert('Erro ao atualizar tarefa.');
    }
}

async function deleteItem(id: number) {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await fetch(`${API_URL}/lists/items/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        loadDashboard();
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Erro ao excluir tarefa.');
    }
}

window.onload = loadDashboard;