import { API_URL, getAuthHeaders } from './consts.js';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

window.onload = async () => {
    const form = document.getElementById('taskForm') as HTMLFormElement;
    const tituloInput = document.getElementById('titulo') as HTMLInputElement;
    const pageTitle = document.getElementById('pageTitle');

    // Se tiver ID
    if (id) {
        if (pageTitle) pageTitle.innerText = 'Editar Tarefa';
        // Fetch dados atuais
        const resp = await fetch(`${API_URL}/tarefas/${id}/`, { headers: getAuthHeaders() });
        const data = await resp.json();
        tituloInput.value = data.titulo;
    }

    // Enviar formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/tarefas/${id}/` : `${API_URL}/tarefas/`;

        const response = await fetch(url, {
            method: metodo,
            headers: getAuthHeaders(),
            body: JSON.stringify({ titulo: tituloInput.value })
        });

        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            alert('Erro ao salvar tarefa');
        }
    });
};