from flask import Flask, request, jsonify, render_template
from flask_migrate import Migrate
from flask_cors import CORS
from db import db
from models.cliente import Cliente
from models.vendedores import Vendedor
from models.cidades import Cidade
from models.equipamentos import Equipamento
from models.tipo_equipamento import TipoEquipamento
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
    return render_template('inicial.html')

@app.route('/analise_credito')
def analise_credito():
    return render_template('analise_credito.html')

@app.route('/equipamentos')
def equipamentos():
    return render_template('equipamentos.html')


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


#Cadastrar equipamento
@app.route('/equipamento', methods=['POST'])
def cadastrar_equipamento():
    data = request.get_json()
    novo_equipamento = Equipamento(
        usuario=data['usuario'],
        nome_cliente=data['nome_cliente'],
        equipamento=data['equipamento'],
        quantidade=data['quantidade'],
        onu=data['onu'],
        rede_wifi=data['rede'],
        senha_wifi=data['senha'],
        teste=data['teste'],
        status=data['status'],
        cidade=data['cidade'],
        tipo=data['tipo'],
        faturado=data['faturado'],
        nota_fiscal=data['nota_fiscal'],
        observacao=data.get('observacao')
    )
    db.session.add(novo_equipamento)
    db.session.commit()
    return jsonify({'message': 'Equipamento cadastrado com sucesso!'}), 201

#Consultar equipamentos
@app.route('/equipamento', methods=['GET'])
def consultar_equipamentos():
    equipamentos = Equipamento.query.all()
    return jsonify([equipamento.as_dict() for equipamento in equipamentos]), 200

#Listar apenas um equipamento
@app.route('/equipamento/<uuid:equipamento_id>', methods=['GET'])
def consultar_equipamento(equipamento_id):
    equipamento = Equipamento.query.get_or_404(equipamento_id)
    return jsonify(equipamento.as_dict()), 200

#Atualizar equipamento
@app.route('/equipamento/<uuid:equipamento_id>', methods=['PATCH'])
def atualizar_equipamento(equipamento_id):
    equipamento = Equipamento.query.get_or_404(equipamento_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(equipamento, key, value)
    db.session.commit()
    return jsonify({'message': 'Equipamento atualizado com sucesso!'}), 200

#Deletar equipamento
@app.route('/equipamento/<uuid:equipamento_id>', methods=['DELETE'])
def deletar_equipamento(equipamento_id):
    equipamento = Equipamento.query.get_or_404(equipamento_id)
    db.session.delete(equipamento)
    db.session.commit()
    return jsonify({'message': 'Equipamento deletado com sucesso!'}), 200

#Cadastrar tipo de equipamento
@app.route('/tipo_equipamento', methods=['POST'])
def cadastrar_tipo_equipamento():
    data = request.get_json()
    novo_tipo_equipamento = TipoEquipamento(
        tipo_equipamento=data['tipo_equipamento']
    )
    db.session.add(novo_tipo_equipamento)
    db.session.commit()
    return jsonify({'message': 'Tipo de equipamento cadastrado com sucesso!'}), 201

#Consultar tipos de equipamentos
@app.route('/tipo_equipamento', methods=['GET'])
def consultar_tipos_equipamentos():
    tipos_equipamentos = TipoEquipamento.query.all()
    return jsonify([tipo_equipamento.as_dict() for tipo_equipamento in tipos_equipamentos]), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)