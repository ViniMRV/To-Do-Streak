import { API_URL, getAuthHeaders } from './consts.js';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

window.onload = async () => {
    const form = document.getElementById('taskForm') as HTMLFormElement;
    const titleInput = document.getElementById('titulo') as HTMLInputElement; 
    const pageTitle = document.getElementById('pageTitle');

    if (id) {
        if (pageTitle) pageTitle.innerText = 'Editar Tarefa';
        
        const resp = await fetch(`${API_URL}/lists/items/${id}/`, { headers: getAuthHeaders() });
        if (resp.ok) {
            const data = await resp.json();
            titleInput.value = data.text; 
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let listId = localStorage.getItem('current_list_id');
        
        if (!id && !listId) {
            const listResp = await fetch(`${API_URL}/lists/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title: "Minha Lista" })
            });
            const newList = await listResp.json();
            listId = newList.id.toString();
            localStorage.setItem('current_list_id', listId!);
        }

        const method = id ? 'PATCH' : 'POST';
        const url = id ? `${API_URL}/lists/items/${id}/` : `${API_URL}/lists/items/`;
        
        const payload: any = { text: titleInput.value };
        if (!id) {
            payload.todo_list = parseInt(listId!); 
        }

        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            const err = await response.json();
            alert('Error saving task: ' + JSON.stringify(err));
        }
    });
};