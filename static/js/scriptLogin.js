document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const mensagemDiv = document.getElementById('mensagem');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        
        // Limpa mensagens anteriores
        mensagemDiv.innerHTML = '';
        mensagemDiv.className = 'mt-3 text-center';
        
        // Validação básica
        if (!usuario || !senha) {
            mostrarMensagem('Por favor, preencha todos os campos', 'danger');
            return;
        }
        
        // Objeto com os dados do login
        const dadosLogin = {
            usuario: usuario,
            senha: senha
        };
        
        // Faz a requisição para a API
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosLogin)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            // Login bem-sucedido
            mostrarMensagem('Login realizado com sucesso! Redirecionando...', 'success');
            
            // Armazena o token (se estiver usando JWT)
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            // Redireciona para a URL recebida do servidor
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            // Trata erros de login
            const mensagemErro = error.message || 'Credenciais inválidas';
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