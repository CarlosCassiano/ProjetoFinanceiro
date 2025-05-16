
    // Lógica de logout
    document.getElementById('btnLogout').addEventListener('click', function() {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                sessionStorage.removeItem('usuario_nome');
                sessionStorage.removeItem('tipo_usuario');
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Erro ao fazer logout:', error);
        });
    });