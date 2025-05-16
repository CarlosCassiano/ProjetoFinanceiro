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

#Inicializar/migrar banco de dados
if [ ! -d "migrations" ]; then
    echo "Initializing database..."
    flask db init
fi

flask db migrate -m "Initial tables"
flask db upgrade

# Cria usuário admin se não existir
python << END
import os
from app import app, db
from models.usuariosLogin import UsuarioLogin

with app.app_context():
    admin_user = os.getenv('FLASK_ADMIN_USER', 'admin')
    admin_pass = os.getenv('FLASK_ADMIN_PASSWORD', 'admin')
    
    if not UsuarioLogin.query.filter_by(usuario=admin_user).first():
        admin = UsuarioLogin(
            usuario=admin_user,
            tipo='admin'
        )
        admin.senha = admin_pass  # Isso vai gerar o hash automaticamente
        db.session.add(admin)
        db.session.commit()
        print(f"[SUCCESS] Usuário admin criado: {admin_user}")
    else:
        print("[INFO] Usuário admin já existe")
END

# Inicia a aplicação
exec flask run --host=0.0.0.0 --port=5000