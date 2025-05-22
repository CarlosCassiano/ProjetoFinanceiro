// Função para carregar a lista de cidades
async function carregarCidades() {
    try {
        const response = await fetch('/cidades');
        if (!response.ok) throw new Error('Erro ao carregar cidades');
        
        const cidades = await response.json();
        const tbody = document.querySelector('#tabelaCidades tbody');
        tbody.innerHTML = '';
        
        cidades.forEach(cidade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cidade.id}</td>
                <td>${cidade.cidade}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="excluirCidade('${cidade.id}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    }
}       

// Função para adicionar nova cidade
document.getElementById('formCidade').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nomeCidade = document.getElementById('nomeCidade').value.trim();
    if (!nomeCidade) return;
    
    try {
        const response = await fetch('/adicionar-cidade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cidade: nomeCidade })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message);
        }
        
        // Feedback para o usuário
        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-success">${result.message}</div>
        `;
        
        // Limpa o campo e recarrega a lista
        document.getElementById('nomeCidade').value = '';
        carregarCidades();
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    }
});        

// Função para excluir cidade (opcional - você precisaria criar a rota no backend)
async function excluirCidade(id) {
    if (!confirm('Tem certeza que deseja excluir esta cidade?')) return;
    
    try {
        const response = await fetch(`/deletar-cidade/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir cidade');
        }
        
        const result = await response.json();
        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-success">${result.message}</div>
        `;
        carregarCidades();
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    }
}

// Torna a função acessível globalmente
window.excluirCidade = excluirCidade;

// Carrega as cidades quando a página é aberta
document.addEventListener('DOMContentLoaded', carregarCidades);        