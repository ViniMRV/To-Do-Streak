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
function carregarDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Faz a requisição para pegar tarefas e streak
            // Assumimos que o endpoint '/dashboard/' retorna tudo isso junto
            const response = yield fetch(`${API_URL}/dashboard/`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            // Se der erro 401 (Não autorizado), o token expirou ou não existe
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }
            const data = yield response.json();
            // 1. Atualiza o contador de Streak na tela
            const streakElement = document.getElementById('streakValue');
            if (streakElement) {
                streakElement.innerText = data.streak.toString();
                // Efeito visual simples: muda a cor se tiver streak > 0
                streakElement.style.color = data.streak > 0 ? '#ff4500' : '#666';
            }
            // 2. Renderiza a Lista de Tarefas
            const lista = document.getElementById('taskList');
            if (lista) {
                lista.innerHTML = ''; // Limpa a lista atual antes de redesenhar
                if (data.tarefas.length === 0) {
                    lista.innerHTML = '<li style="justify-content:center; color:#888;">Nenhuma tarefa pendente. Aproveite o dia! ☀️</li>';
                    return;
                }
                data.tarefas.forEach(tarefa => {
                    const li = document.createElement('li');
                    // Adiciona classe CSS 'done' se a tarefa estiver concluída (para riscar o texto)
                    if (tarefa.concluida) {
                        li.classList.add('done');
                    }
                    // Checkbox para marcar como feito
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = tarefa.concluida;
                    // Ao clicar, chama a função de toggle
                    checkbox.onclick = () => toggleTarefa(tarefa.id);
                    // Texto da Tarefa
                    const span = document.createElement('span');
                    span.innerText = tarefa.titulo;
                    // Grupo de Ações (Botões)
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'task-actions';
                    // Botão Editar (Redireciona para task.html com ID)
                    const btnEdit = document.createElement('a');
                    btnEdit.innerText = '✏️';
                    btnEdit.href = `task.html?id=${tarefa.id}`;
                    btnEdit.title = "Editar";
                    // Botão Excluir
                    const btnDel = document.createElement('button');
                    btnDel.innerText = '🗑️';
                    btnDel.title = "Excluir";
                    btnDel.onclick = () => deletarTarefa(tarefa.id);
                    actionsDiv.append(btnEdit, btnDel);
                    li.append(checkbox, span, actionsDiv);
                    lista.appendChild(li);
                });
            }
        }
        catch (error) {
            console.error('Erro no dashboard:', error);
            const lista = document.getElementById('taskList');
            if (lista)
                lista.innerHTML = '<li style="color:red;">Erro ao carregar tarefas. Verifique a conexão.</li>';
        }
    });
}
// Função para Marcar/Desmarcar Tarefa
function toggleTarefa(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/tarefas/${id}/toggle/`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                // Recarrega o dashboard para atualizar o Streak e a ordenação
                carregarDashboard();
            }
            else {
                alert('Não foi possível atualizar a tarefa.');
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
// Função para Deletar Tarefa
function deletarTarefa(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm("Tem certeza que deseja excluir esta tarefa?"))
            return;
        try {
            const response = yield fetch(`${API_URL}/tarefas/${id}/`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                carregarDashboard(); // Atualiza a lista
            }
            else {
                alert('Erro ao excluir tarefa.');
            }
        }
        catch (error) {
            console.error(error);
            alert('Erro de conexão.');
        }
    });
}
// Inicializa o dashboard quando a página carregar
window.onload = carregarDashboard;
