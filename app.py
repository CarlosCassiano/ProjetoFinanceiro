from flask import Flask, request, jsonify, render_template
from flask_migrate import Migrate
from flask_cors import CORS
from db import db
from models.cliente import Cliente
from models.vendedores import Vendedor
from models.cidades import Cidade
import os

app = Flask(__name__)
CORS(app)

# Roda no docker
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/clientes')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Rodando localmente no pc
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost:5432/clientes'
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

#Index
@app.route('/')
def index():
    return render_template('index.html')


#Cadastrar cliente
@app.route('/clientes', methods=['POST'])
def cadastrar_cliente():
    data = request.get_json()
    novo_cliente = Cliente(
        nome=data['nome'],
        cpf=data['cpf'],
        cnpj=data['cnpj'],
        vendedor=data['vendedor'],
        localizacao=data['localizacao'],
        situacao=data['situacao'],
        score=data['score'],
        consultor=data['consultor'],
        observacao=data.get('observacao')
    )
    db.session.add(novo_cliente)
    db.session.commit()
    return jsonify({'message': 'Cliente cadastrado com sucesso!'}), 201

#Consultar cliente
@app.route('/clientes', methods=['GET'])
def consultar_clientes():
    clientes = Cliente.query.all()
    return jsonify([cliente.as_dict() for cliente in clientes]), 200

#Listar apenas um cliente
@app.route('/clientes/<uuid:cliente_id>', methods=['GET'])
def consultar_cliente(cliente_id):
    cliente = Cliente.query.get_or_404(cliente_id)
    return jsonify(cliente.as_dict()), 200

#Atualizar cliente
@app.route('/clientes/<uuid:cliente_id>', methods=['PATCH'])
def atualizar_cliente(cliente_id):
    cliente = Cliente.query.get_or_404(cliente_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(cliente, key, value)
    db.session.commit()
    return jsonify({'message': 'Cliente atualizado com sucesso!'}), 200

#Deletar cliente
@app.route('/clientes/<uuid:cliente_id>', methods=['DELETE'])
def deletar_cliente(cliente_id):
    cliente = Cliente.query.get_or_404(cliente_id)
    db.session.delete(cliente)
    db.session.commit()
    return jsonify({'message': 'Cliente deletado com sucesso!'}), 200

#Cadastrar vendedor
@app.route('/adicionar-vendedor', methods=['POST'])
def adicionar_vendedor():
    data = request.get_json()
    nome_vendedor = data.get('vendedor')

    # Verifica se o vendedor já existe
    if Vendedor.query.filter_by(nome=nome_vendedor).first():
        return jsonify({'message': 'Vendedor já existe!'}), 400

    # Cria e adiciona um novo vendedor
    novo_vendedor = Vendedor(nome=nome_vendedor)
    db.session.add(novo_vendedor)
    db.session.commit()

    return jsonify({'message': 'Vendedor adicionado com sucesso!'}), 201

#Listar vendedores
@app.route('/vendedores', methods=['GET'])
def listar_vendedores():
    vendedores = Vendedor.query.all()
    return jsonify([vendedor.as_dict() for vendedor in vendedores]), 200

#Cadastrar cidade
@app.route('/adicionar-cidade', methods=['POST'])
def adicionar_cidade():
    data = request.get_json()
    nome_cidade = data.get('cidade')

    # Verifica se a cidade já existe
    if Cidade.query.filter_by(cidade=nome_cidade).first():
        return jsonify({'message': 'Cidade já existe!'}), 400

    # Cria e adiciona uma nova cidade
    nova_cidade = Cidade(cidade=nome_cidade)
    db.session.add(nova_cidade)
    db.session.commit()

    return jsonify({'message': 'Cidade adicionada com sucesso!'}), 201

#Listar cidades
@app.route('/cidades', methods=['GET'])
def listar_cidades():
    cidades = Cidade.query.all()
    return jsonify([cidade.as_dict() for cidade in cidades]), 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')