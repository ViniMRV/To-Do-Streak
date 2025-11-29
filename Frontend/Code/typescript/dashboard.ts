import { API_URL, getAuthHeaders } from './consts.js';

interface Item {
    id: number;
    text: string;
    done: boolean;
    todo_list: number;
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
    try {
        const userResp = await fetch(`${API_URL}/users/me/`, {
            headers: getAuthHeaders()
        });
        
        if (userResp.status === 401) {
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
                listElement.innerHTML = '<li>No lists found. Please create a task to start!</li>';
                return;
            }

            const mainList = lists[0];
            
            localStorage.setItem('current_list_id', mainList.id.toString());

            if (mainList.items.length === 0) {
                listElement.innerHTML = '<li style="justify-content:center; color:#888;">No tasks yet. Enjoy your day! ☀️</li>';
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
    }
}

async function toggleItem(item: Item) {
    try {
        await fetch(`${API_URL}/lists/items/${item.id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ done: !item.done })
        });
        loadDashboard();
    } catch (error) {
        console.error('Error toggling item:', error);
    }
}

async function deleteItem(id: number) {
    if(!confirm("Are you sure?")) return;
    try {
        await fetch(`${API_URL}/lists/items/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        loadDashboard();
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

window.onload = loadDashboard;