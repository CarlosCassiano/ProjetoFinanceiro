let clienteEditandoId = null;  // Declare a variável globalmente

// Evento de envio do formulário
document.getElementById('cliente-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        let url = 'http://localhost:8080/clientes';
        let method = 'POST';

        // Se estivermos editando, faz PATCH
        if (clienteEditandoId) {
            url = `http://localhost:8080/clientes/${clienteEditandoId}`;
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
        clienteEditandoId = null;
        carregarClientes();

    } catch (error) {
        console.error('Erro ao cadastrar/editar cliente:', error);
        alert('Erro ao cadastrar/editar cliente');
    }
});

// Função para carregar os clientes e exibir na tabela
async function carregarClientes() {
    try {
        const response = await fetch('http://localhost:8080/clientes');
        const clientes = await response.json();

        const tbody = document.querySelector('#tabela-clientes tbody');
        tbody.innerHTML = ''; // Limpa o conteúdo da tabela

        // Inverte a ordem dos clientes para mostrar os mais recentes no topo
        clientes.reverse().forEach(cliente => {
            const row = document.createElement('tr');

            const dataFormatada = new Date(cliente.data).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.cnpj}</td>
                <td>${cliente.vendedor}</td>
                <td>${cliente.localizacao}</td>
                <td>${cliente.situacao}</td>
                <td>${cliente.score}</td>
                <td>${cliente.consultor}</td>
                <td>${cliente.observacao || ''}</td>
                <td>
                    <button onclick='editarCliente(${JSON.stringify(cliente)})'>Editar</button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

// Preenche o formulário com os dados do cliente para editar
function editarCliente(cliente) {
    const form = document.getElementById('cliente-form');

    for (const campo in cliente) {
        if (form.elements[campo]) {
            form.elements[campo].value = cliente[campo];
        }
    }

    clienteEditandoId = cliente.id;
}

// Carregar Vendedores
async function carregarVendedores() {
    try {
        const response = await fetch('http://localhost:8080/vendedores');
        const vendedores = await response.json();

        const vendedorSelect = document.getElementById('vendedor-select');
        vendedorSelect.innerHTML = '<option value="">Selecione o Vendedor</option>';  // Limpa as opções existentes

        vendedores.forEach(vendedor => {
            const option = document.createElement('option');
            option.value = vendedor.nome;
            option.textContent = vendedor.nome;
            vendedorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
    }
}


// Carregar cidades
async function carregarCidades() {
    try {
        const response = await fetch('http://localhost:8080/cidades');
        const cidades = await response.json();

        const cidadeSelect = document.getElementById('localizacao-select');
        cidadeSelect.innerHTML = '<option value="">Selecione a Cidade</option>';  // Limpa as opções existentes

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
window.onload = function() {
    carregarVendedores();
    carregarCidades();
}


// Chama a função ao carregar a página
window.addEventListener('DOMContentLoaded', carregarClientes);