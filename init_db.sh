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

# Executa a verificação
check_db_connection

# Executa migrações
flask db upgrade

# Inicia a aplicação
exec flask run --host=0.0.0.0 --port=5000