// Função para carregar a lista de tipos de equipamento
async function carregarTiposEquipamento() {
    try {
        const response = await fetch('/tipo_equipamento', {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao carregar tipos de equipamento');
        }
        
        const tipos = await response.json();
        const tbody = document.querySelector('#tabelaTiposEquipamento tbody');
        tbody.innerHTML = '';
        
        tipos.forEach(tipo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tipo.id}</td>
                <td>${tipo.tipo_equipamento}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="excluirTipoEquipamento('${tipo.id}')">Excluir</button>
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

// Função para adicionar novo tipo de equipamento
document.getElementById('formTipoEquipamento').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const tipoEquipamento = document.getElementById('tipoEquipamento').value.trim();
    if (!tipoEquipamento) return;
    
    try {
        const response = await fetch('/tipo_equipamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tipo_equipamento: tipoEquipamento })
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
        document.getElementById('tipoEquipamento').value = '';
        carregarTiposEquipamento();
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    }
});        

// Função para excluir tipo de equipamento (você precisaria criar a rota no backend)
async function excluirTipoEquipamento(id) {
    if (!confirm('Tem certeza que deseja excluir este tipo de equipamento?')) return;
    
    try {
        const response = await fetch(`/tipo_equipamento/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(text || 'Resposta inválida do servidor');
        }

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Erro ao excluir');
        }

        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-success">${result.message}</div>
        `;
        carregarTiposEquipamento();
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('mensagem').innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    }
}

// Torna a função acessível globalmente
window.excluirTipoEquipamento = excluirTipoEquipamento;

// Carrega os tipos de equipamento quando a página é aberta
document.addEventListener('DOMContentLoaded', carregarTiposEquipamento);