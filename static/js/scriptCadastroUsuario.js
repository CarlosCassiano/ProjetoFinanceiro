document.addEventListener('DOMContentLoaded', function() {
    const cadastroForm = document.getElementById('cadastroForm');
    const mensagemDiv = document.getElementById('mensagem');

    cadastroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const tipo = document.getElementById('tipo').value;
        
        // Limpa mensagens anteriores
        mensagemDiv.innerHTML = '';
        mensagemDiv.className = 'mt-3 text-center';
        
        // Validações
        if (!usuario || !senha || !confirmarSenha || !tipo) {
            mostrarMensagem('Por favor, preencha todos os campos', 'danger');
            return;
        }
        
        if (senha !== confirmarSenha) {
            mostrarMensagem('As senhas não coincidem', 'danger');
            return;
        }
        
        if (senha.length < 6) {
            mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'danger');
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
                'Authorization': 'Bearer ' + localStorage.getItem('token') // Se estiver usando JWT
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
            // Cadastro bem-sucedido
            mostrarMensagem('Usuário cadastrado com sucesso!', 'success');
            cadastroForm.reset();
        })
        .catch(error => {
            // Trata erros de cadastro
            const mensagemErro = error.message || 'Erro ao cadastrar usuário';
            mostrarMensagem(mensagemErro, 'danger');
        });
    });
    
    function mostrarMensagem(texto, tipo) {
        mensagemDiv.textContent = texto;
        mensagemDiv.classList.add(`text-${tipo}`);
        
        if (tipo === 'success') {
            mensagemDiv.classList.add('fw-bold');
        }
    }
});