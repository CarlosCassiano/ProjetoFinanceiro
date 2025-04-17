from flask import Flask, request, jsonify
from flask_migrate import Migrate
from db import db
from models.cliente import Cliente

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost:5432/clientes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)


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



if __name__ == '__main__':
    app.run(debug=True, port=8080, host='0.0.0.0')