document.addEventListener('DOMContentLoaded', function() {
    const cadastroForm = document.getElementById('cadastroForm');
    const edicaoForm = document.getElementById('edicaoForm');
    const mensagemDiv = document.getElementById('mensagem');
    const edicaoMensagemDiv = document.getElementById('edicaoMensagem');
    
    // Carrega usuários ao iniciar
    carregarUsuarios();
    
    // Cadastro de novo usuário
    cadastroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const tipo = document.getElementById('tipo').value;
        
        limparMensagens();
        
        // Validações
        if (!usuario || !senha || !confirmarSenha || !tipo) {
            mostrarMensagem('Por favor, preencha todos os campos', 'danger', mensagemDiv);
            return;
        }
        
        if (senha !== confirmarSenha) {
            mostrarMensagem('As senhas não coincidem', 'danger', mensagemDiv);
            return;
        }
        
        if (senha.length < 6) {
            mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'danger', mensagemDiv);
            return;
        }
        
        // Objeto com os dados do cadastro
        const dadosCadastro = {
            usuario: usuario,
            senha: senha,
            tipo: tipo
        };
        
        // Faz a requisição para a API
        fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(dadosCadastro)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            mostrarMensagem('Usuário cadastrado com sucesso!', 'success', mensagemDiv);
            cadastroForm.reset();
            carregarUsuarios();
            
            // Fecha o modal após 1.5 segundos
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('cadastroModal'));
                modal.hide();
            }, 1500);
        })
        .catch(error => {
            const mensagemErro = error.message || 'Erro ao cadastrar usuário';
            mostrarMensagem(mensagemErro, 'danger', mensagemDiv);
        });
    });
    
    // Edição de usuário existente
    edicaoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuarioId = document.getElementById('edicaoUsuarioId').value;
        const usuario = document.getElementById('edicaoUsuario').value;
        const tipo = document.getElementById('edicaoTipo').value;
        const senha = document.getElementById('edicaoSenha').value;
        const status = document.getElementById('edicaoStatus').checked;
        
        limparMensagens();
        
        if (!usuario || !tipo) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios', 'danger', edicaoMensagemDiv);
            return;
        }
        
        // Objeto com os dados da edição
        const dadosEdicao = {
            usuario: usuario,
            tipo: tipo,
            ativo: status
        };
        
        // Adiciona senha apenas se foi preenchida
        if (senha) {
            if (senha.length < 6) {
                mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'danger', edicaoMensagemDiv);
                return;
            }
            dadosEdicao.senha = senha;
        }
        
        // Faz a requisição para a API
        fetch(`/usuarios/${usuarioId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(dadosEdicao)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            mostrarMensagem('Usuário atualizado com sucesso!', 'success', edicaoMensagemDiv);
            carregarUsuarios();
            
            // Fecha o modal após 1.5 segundos
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('edicaoModal'));
                modal.hide();
            }, 1500);
        })
        .catch(error => {
            const mensagemErro = error.message || 'Erro ao atualizar usuário';
            mostrarMensagem(mensagemErro, 'danger', edicaoMensagemDiv);
        });
    });
    
    // Função para carregar usuários
    function carregarUsuarios() {
        fetch('/usuarios', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar usuários');
            }
            return response.json();
        })
        .then(usuarios => {
            renderizarUsuarios(usuarios);
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    }
    
    // Função para renderizar a lista de usuários
    function renderizarUsuarios(usuarios) {
        const ativosContainer = document.getElementById('usersListAtivos');
        const bloqueadosContainer = document.getElementById('usersListBloqueados');
        
        ativosContainer.innerHTML = '';
        bloqueadosContainer.innerHTML = '';
        
        if (usuarios.length === 0) {
            ativosContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">Nenhum usuário cadastrado</div>';
            return;
        }
        
        usuarios.forEach(usuario => {
            const card = criarCardUsuario(usuario);
            
            if (usuario.ativo) {
                ativosContainer.appendChild(card);
            } else {
                bloqueadosContainer.appendChild(card);
            }
        });
    }
    
    // Função para criar o card de um usuário
    function criarCardUsuario(usuario) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-3';
        
        const card = document.createElement('div');
        card.className = `card user-card ${usuario.tipo} h-100`;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title d-flex justify-content-between align-items-center';
        cardTitle.innerHTML = `
            <span>${usuario.usuario}</span>
            <span class="badge ${usuario.tipo === 'admin' ? 'bg-danger' : usuario.tipo === 'consultor' ? 'bg-primary' : 'bg-success'}">
                ${usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
            </span>
        `;
        
        const cardText = document.createElement('p');
        cardText.className = 'card-text text-muted small';
        cardText.textContent = `ID: ${usuario.id}`;
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge badge ${usuario.ativo ? 'bg-success' : 'bg-secondary'}`;
        statusBadge.textContent = usuario.ativo ? 'Ativo' : 'Bloqueado';
        
        const btnGroup = document.createElement('div');
        btnGroup.className = 'd-flex justify-content-end gap-2 mt-3';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.onclick = () => abrirModalEdicao(usuario);
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = `btn btn-sm ${usuario.ativo ? 'btn-outline-warning' : 'btn-outline-success'}`;
        toggleBtn.innerHTML = usuario.ativo ? '<i class="bi bi-lock"></i>' : '<i class="bi bi-unlock"></i>';
        toggleBtn.onclick = () => toggleStatusUsuario(usuario.id, !usuario.ativo);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.onclick = () => deletarUsuario(usuario.id);
        
        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(toggleBtn);
        btnGroup.appendChild(deleteBtn);
        
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(statusBadge);
        cardBody.appendChild(btnGroup);
        
        card.appendChild(cardBody);
        col.appendChild(card);
        
        return col;
    }
    
    // Função para abrir modal de edição
    function abrirModalEdicao(usuario) {
        document.getElementById('edicaoUsuarioId').value = usuario.id;
        document.getElementById('edicaoUsuario').value = usuario.usuario;
        document.getElementById('edicaoTipo').value = usuario.tipo;
        document.getElementById('edicaoStatus').checked = usuario.ativo;
        document.getElementById('edicaoSenha').value = '';
        
        const modal = new bootstrap.Modal(document.getElementById('edicaoModal'));
        modal.show();
    }
    
    // Função para alternar status do usuário (ativo/bloqueado)
    function toggleStatusUsuario(usuarioId, novoStatus) {
        if (!confirm(`Tem certeza que deseja ${novoStatus ? 'desbloquear' : 'bloquear'} este usuário?`)) {
            return;
        }
        
        fetch(`/usuarios/${usuarioId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                ativo: novoStatus
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar status do usuário');
            }
            return response.json();
        })
        .then(() => {
            carregarUsuarios();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao atualizar status do usuário: ' + error.message);
        });
    }
    
    // Função para deletar usuário
    function deletarUsuario(usuarioId) {
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        fetch(`/usuarios/${usuarioId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir usuário');
            }
            return response.json();
        })
        .then(() => {
            carregarUsuarios();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao excluir usuário: ' + error.message);
        });
    }
    
    // Funções auxiliares
    function mostrarMensagem(texto, tipo, elemento) {
        elemento.textContent = texto;
        elemento.className = `text-${tipo} text-center`;
        
        if (tipo === 'success') {
            elemento.classList.add('fw-bold');
        }
    }
    
    function limparMensagens() {
        mensagemDiv.textContent = '';
        mensagemDiv.className = '';
        edicaoMensagemDiv.textContent = '';
        edicaoMensagemDiv.className = '';
    }
});