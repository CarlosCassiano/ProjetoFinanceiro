from flask import Flask, request, jsonify, render_template
from flask_migrate import Migrate
from db import db
from models.cliente import Cliente

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost:5432/clientes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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


if __name__ == '__main__':
    app.run(debug=True, port=8080, host='0.0.0.0')