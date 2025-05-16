let equipamentoEditandoId = null;

document.getElementById('equipamento-form').addEventListener('submit', async function (e){
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        let url = 'http://localhost:8080/equipamento';
        let method = 'POST';

        // Se estivermos editando, faz PATCH
        if (equipamentoEditandoId) {
            url = `http://localhost:8080/equipamento/${equipamentoEditandoId}`;
            method = 'PATCH';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
        this.reset();
        equipamentoEditandoId = null;
        carregarEquipamentos();

    } catch (error) {
        console.error('Erro ao cadastrar/editar equipamento:', error);
        alert('Erro ao cadastrar/editar equipamento');
    }
});

async function carregarEquipamentos() {
    try {
        const response = await fetch('http://localhost:8080/equipamento');
        const equipamentos = await response.json();

        const tbody = document.querySelector('#tabela-equipamentos tbody');
        tbody.innerHTML = ''; // Limpa o conteúdo da tabela

        // Inverte a ordem dos equipamentos para mostrar os mais recentes no topo
        equipamentos.reverse().forEach(equipamento => {
            const row = document.createElement('tr');

            const dataFormatada = new Date(equipamento.data).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${equipamento.usuario}</td>
                <td>${equipamento.nome_cliente}</td>
                <td>${equipamento.equipamento}</td>
                <td>${equipamento.quantidade}</td>
                <td>${equipamento.onu}</td>
                <td>${equipamento.rede_wifi}</td>
                <td>${equipamento.senha_wifi}</td>
                <td>${equipamento.teste}</td>
                <td>${equipamento.status}</td>
                <td>${equipamento.cidade}</td>
                <td>${equipamento.tipo}</td>
                <td>${equipamento.faturado}</td>
                <td>${equipamento.nota_fiscal}</td>
                <td>${equipamento.observacao}</td>
                <td>
                    <button class="btn btn-primary" onclick='editarEquipamento(${JSON.stringify(equipamento)})'>Editar</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
    }
}

function editarEquipamento(equipamento) {
    const form = document.getElementById('equipamento-form');

    for (const campo in equipamento) {
        if (form.elements[campo]) {
            form.elements[campo].value = equipamento[campo];
        }
    }

    equipamentoEditandoId = equipamento.id;
}


// Função para carregar os vendedores no select
async function carregarVendedores() {
    try {
        const response = await fetch('http://localhost:8080/usuarios');
        const vendedores = await response.json();

        const vendedorSelect = document.getElementById('usuario-select');
        vendedorSelect.innerHTML = '<option value="">Selecione o Usuario</option>'; // Limpa o conteúdo do select

        vendedores.forEach(u => {
            const option = document.createElement('option');
            option.value = u.usuario;
            option.textContent = u.usuario;
            vendedorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
    }
}

// Função para carregar as cidades no select
async function carregarCidades() {
    try {
        const response = await fetch('http://localhost:8080/cidades');
        const cidades = await response.json();

        const cidadeSelect = document.getElementById('cidade-select');
        cidadeSelect.innerHTML = '<option value="">Selecione a Cidade</option>'; // Limpa o conteúdo do select

        cidades.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade.cidade;
            option.textContent = cidade.cidade;
            cidadeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
    }
}

// Função para carregar os equipamentos no select
async function carregarTipoEquipamentos() {
    try {
        const response = await fetch('http://localhost:8080/tipo_equipamento');
        const equipamentos = await response.json();

        const equipamentoSelect = document.getElementById('equipamento-select');
        equipamentoSelect.innerHTML = '<option value="">Selecione o Equipamento</option>'; // Limpa o conteúdo do select

        equipamentos.forEach(equipamento => {
            const option = document.createElement('option');
            option.value = equipamento.tipo_equipamento;
            option.textContent = equipamento.tipo_equipamento;
            equipamentoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
    }
}

function filtrarEquipamentos() {
    var input = document.getElementById("busca-cliente");
    var filtro = input.value.toLowerCase();
    var tabela = document.getElementById("tabela-equipamentos");
    var linhas = tabela.getElementsByTagName("tr");

    // Começa do índice 1 para pular o cabeçalho
    for (var i = 1; i < linhas.length; i++) {
        var linha = linhas[i];
        // O nome do cliente está na terceira coluna (índice 2)
        var nomeCliente = linha.cells[2].textContent.toLowerCase();
        
        if (nomeCliente.includes(filtro)) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }
    }
}

// Chama as funções para carregar os vendedores e cidades ao carregar a página
window.onload = function() {
    carregarVendedores();
    carregarCidades();
    carregarEquipamentos();
    carregarTipoEquipamentos();
}

window.addEventListener('DOMContentLoaded', carregarEquipamentos);