#!/bin/bash

# Verificação otimizada da conexão com PostgreSQL
check_db_connection() {
    python << END
import sys
import psycopg2
from time import sleep

max_retries = 30
retry_delay = 2

for i in range(max_retries):
    try:
        conn = psycopg2.connect(
            dbname="clientes",
            user="postgres",
            password="postgres",
            host="db",
            connect_timeout=5
        )
        conn.close()
        print("PostgreSQL is ready!")
        sys.exit(0)
    except psycopg2.OperationalError as e:
        if i == max_retries - 1:
            print(f"ERROR: Failed to connect to PostgreSQL after {max_retries} attempts")
            sys.exit(1)
        print(f"Attempt {i+1}/{max_retries} - PostgreSQL not ready, retrying in {retry_delay} seconds...")
        sleep(retry_delay)
END
}

# Define a variável FLASK_APP para evitar erro de KeyError
export FLASK_APP=app

# Executa a verificação
check_db_connection

# Inicializar/migrar banco de dados
if [ ! -d "migrations" ]; then
    echo "Initializing database..."
    flask db init
fi

flask db migrate -m "Initial tables"
flask db upgrade

# Cria usuário admin se não existir ou atualiza para garantir que está ativo
python << END
import os
from app import app, db
from models.usuariosLogin import UsuarioLogin

with app.app_context():
    admin_user = os.getenv('FLASK_ADMIN_USER', 'admin')
    admin_pass = os.getenv('FLASK_ADMIN_PASSWORD', 'admin')
    
    admin = UsuarioLogin.query.filter_by(usuario=admin_user).first()
    
    if not admin:
        # Cria novo usuário admin ativo
        admin = UsuarioLogin(
            usuario=admin_user,
            tipo='admin',
            ativo=True  # Garante que o admin está ativo
        )
        admin.senha = admin_pass  # Isso vai gerar o hash automaticamente
        db.session.add(admin)
        print(f"[SUCCESS] Usuário admin criado: {admin_user}")
    else:
        # Atualiza usuário existente para garantir que está ativo
        admin.ativo = True
        admin.tipo = 'admin'  # Garante que o tipo é admin
        if admin_pass != 'admin':  # Atualiza senha apenas se for diferente da padrão
            admin.senha = admin_pass
        print(f"[SUCCESS] Usuário admin atualizado: {admin_user}")
    
    db.session.commit()
END

# Inicia a aplicação
exec flask run --host=0.0.0.0 --port=5000