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

            const dataOriginal = new Date(cliente.data);
            const dataAjustada = new Date(dataOriginal.getTime() - (3 * 60 * 60 * 1000)); // Subtrai 3 horas

            const dataFormatada = dataAjustada.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            let classeSituacao = '';
            switch (cliente.situacao) {
                case 'Aprovado':
                    classeSituacao = 'aprovado';
                    break;
                case 'Negado':
                    classeSituacao = 'negado';
                    break;
                case 'R$250,00':
                    classeSituacao = 'valor-250';
                    break;
                case 'R$500,00':
                    classeSituacao = 'valor-500';
                    break;
                default:
                    classeSituacao = '';
        }

            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.cnpj}</td>
                <td>${cliente.vendedor}</td>
                <td>${cliente.localizacao}</td>
                <td><span class="situacao ${classeSituacao}">${cliente.situacao}</span></td>
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
        const response = await fetch('http://localhost:8080/usuarios/tipo/vendedor');
        const vendedores = await response.json();

        const vendedorSelect = document.getElementById('vendedor-select');
        vendedorSelect.innerHTML = '<option value="">Selecione o Vendedor</option>';

        vendedores.forEach(v => {
            const option = document.createElement('option');
            option.value = v.usuario;
            option.textContent = v.usuario;
            vendedorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
    }
}

async function carregarConsultores() {
    try {
        const response = await fetch('http://localhost:8080/usuarios/tipo/consultor');
        const consultores = await response.json();

        const consultorSelect = document.getElementById('consultor-select');
        consultorSelect.innerHTML = '<option value="">Selecione o Consultor</option>';

        consultores.forEach(c => {
            const option = document.createElement('option');
            option.value = c.usuario;
            option.textContent = c.usuario;
            consultorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar consultores:', error);
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

function filtrarClientes() {
    var input = document.getElementById("busca-cliente");
    var filtro = input.value.toLowerCase();
    var tabela = document.getElementById("tabela-clientes");
    var linhas = tabela.getElementsByTagName("tr");

    for (var i = 1; i < linhas.length; i++) {
        var linha = linhas[i];
        var cpf = linha.cells[2].textContent.toLowerCase();  // CPF está na coluna 3
        var cnpj = linha.cells[3].textContent.toLowerCase(); // CNPJ está na coluna 4
        if (cpf.includes(filtro) || cnpj.includes(filtro)) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }
    }
}


window.onload = function() {
    carregarVendedores();
    carregarConsultores();
    carregarCidades();
}


// Chama a função ao carregar a página
window.addEventListener('DOMContentLoaded', carregarClientes);