from flask import Flask, request, jsonify, render_template, session, redirect
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import db
from models.cliente import Cliente
from models.cidades import Cidade
from models.equipamentos import Equipamento
from models.tipo_equipamento import TipoEquipamento
from models.usuariosLogin import UsuarioLogin
from models.agenda import Evento
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'testando_chave_secreta'  # Chave secreta para sessões
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
    # Verifica se o usuário está logado (na session)
    if 'usuario_id' not in session:
        return render_template('login.html')
    return render_template('inicial.html')

@app.route('/inicial.html')
def inicial():
    if 'usuario_id' not in session:
        return redirect('/')

    tipo_usuario = session.get('tipo_usuario')
    nome_usuario = session.get('usuario_nome')
    
    return render_template(
        'inicial.html',
        tipo_usuario=tipo_usuario,
        nome_usuario=nome_usuario
    )

@app.route('/analise_credito')
def analise_credito():
    if 'usuario_id' not in session:
        return redirect('/')
    return render_template('analise_credito.html')

@app.route('/equipamentos')
def equipamentos():
    if 'usuario_id' not in session:
        return redirect('/')
    return render_template('equipamentos.html')

@app.route('/cadastro-usuario')
def cadastro_usuario():
    if 'usuario_id' not in session or session.get('tipo_usuario') != 'admin':
        return redirect('/')
    return render_template('cadastro_usuario.html')


@app.route('/cadastro-cidades')
def cadastro_cidades():
    if 'usuario_id' not in session or session.get('tipo_usuario') != 'admin':
        return redirect('/')
    return render_template('cadastro_cidades.html')

@app.route('/cadastro-equipamento')
def cadastro_equipamento():
    if 'usuario_id' not in session or session.get('tipo_usuario') != 'admin':
        return redirect('/')
    return render_template('cadastro_equipamento.html')


###################################################################################################

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


###################################################################################################

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

#Deletar cidade
@app.route('/deletar-cidade/<uuid:cidade_id>', methods=['DELETE'])
def deletar_cidade(cidade_id):
    try:
        cidade = Cidade.query.get_or_404(cidade_id)

        # Verifica se há eventos associados
        if cidade.eventos:  # Supondo que a relação esteja definida como cidade.eventos
            return jsonify({'message': 'Não é possível excluir: há eventos associados a esta cidade.'}), 400
        
        db.session.delete(cidade)
        db.session.commit()
        return jsonify({'message': 'Cidade deletada com sucesso!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

#Listar cidades
@app.route('/cidades', methods=['GET'])
def listar_cidades():
    cidades = Cidade.query.all()
    return jsonify([cidade.as_dict() for cidade in cidades]), 200

###################################################################################################

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
        rede_wifi=data['rede_wifi'],
        senha_wifi=data['senha_wifi'],
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

###################################################################################################

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

#Deletar tipo de equipamento
@app.route('/tipo_equipamento/<uuid:id>', methods=['DELETE'])
def deletar_tipo_equipamento(id):
    try:
        tipo = TipoEquipamento.query.get_or_404(id)
        db.session.delete(tipo)
        db.session.commit()
        return jsonify({'message': 'Tipo de equipamento excluído com sucesso!'}), 200
    except Exception as e:
        return jsonify({'message': f'Erro ao excluir tipo de equipamento: {str(e)}'}), 500

###################################################################################################

# Cadastrar usuario
@app.route('/usuarios', methods=['POST'])
def cadastrar_usuario():
    #Verifica se o usuario é admin
    if session.get('tipo_usuario') != 'admin':
        return jsonify({'message': 'Acesso negado! Somente administradores podem cadastrar usuários.'}), 403

    data = request.get_json()
    
    # Validação básica
    if not all(field in data for field in ['usuario', 'senha', 'tipo']):
        return jsonify({'message': 'Dados incompletos'}), 400
    
    # Verifica se usuário já existe
    if UsuarioLogin.query.filter_by(usuario=data['usuario']).first():
        return jsonify({'message': 'Usuário já existe'}), 409
    
    # Cria usuário com senha hasheada
    novo_usuario = UsuarioLogin(
        usuario=data['usuario'],
        tipo=data['tipo']
    )
    novo_usuario.senha = data['senha']  # Usa o setter que faz o hash automaticamente
    
    db.session.add(novo_usuario)
    db.session.commit()
    
    return jsonify({
        'message': 'Usuário cadastrado com sucesso!',
        'usuario': novo_usuario.as_dict()
    }), 201

# Consultar usuarios 
@app.route('/usuarios', methods=['GET'])
def consultar_usuarios():
    usuarios = UsuarioLogin.query.all()
    return jsonify([usuario.as_dict() for usuario in usuarios]), 200

# Listar apenas um usuario 
@app.route('/usuarios/<uuid:usuario_id>', methods=['GET'])
def consultar_usuario(usuario_id):
    usuario = UsuarioLogin.query.get_or_404(usuario_id)
    return jsonify(usuario.as_dict()), 200

# Atualizar usuario 
@app.route('/usuarios/<uuid:usuario_id>', methods=['PATCH'])
def atualizar_usuario(usuario_id):
    usuario = UsuarioLogin.query.get_or_404(usuario_id)
    data = request.get_json()
    
    # Atualiza campos, tratando senha separadamente
    for key, value in data.items():
        if key == 'senha':
            usuario.senha = value  # Usa o setter que faz o hash
        elif key in ['usuario', 'tipo']:
            setattr(usuario, key, value)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Usuário atualizado com sucesso!',
        'usuario': usuario.as_dict()
    }), 200

# Deletar usuario 
@app.route('/usuarios/<uuid:usuario_id>', methods=['DELETE'])
def deletar_usuario(usuario_id):
    usuario = UsuarioLogin.query.get_or_404(usuario_id)
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'message': 'Usuário deletado com sucesso!'}), 200

###################################################################################################

# Autenticação
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(field in data for field in ['usuario', 'senha']):
        return jsonify({'message': 'Usuário e senha são obrigatórios'}), 400
    
    usuario = UsuarioLogin.query.filter_by(usuario=data['usuario']).first()
    
    if usuario and usuario.verificar_senha(data['senha']):
        # Cria a sessão do usuário
        session['usuario_id'] = str(usuario.id)
        session['usuario_nome'] = usuario.usuario
        session['tipo_usuario'] = usuario.tipo
        
        return jsonify({
            'message': 'Login bem-sucedido',
            'usuario': usuario.as_dict(),
            'redirect': '/inicial.html'  # Adiciona URL para redirecionamento
        }), 200
    
    return jsonify({'message': 'Credenciais inválidas'}), 401

# Logout
@app.route('/logout', methods=['POST'])
def logout():
    # Remove os dados da sessão
    session.pop('usuario_id', None)
    session.pop('usuario_nome', None)
    session.pop('tipo_usuario', None)
    return jsonify({'message': 'Logout realizado com sucesso', 'redirect': '/'}), 200

###################################################################################################

# Lista usuários por tipo
@app.route('/usuarios/tipo/<tipo_usuario>', methods=['GET'])
def listar_usuarios_por_tipo(tipo_usuario):
    usuarios = UsuarioLogin.query.filter_by(tipo=tipo_usuario).all()
    return jsonify([usuario.as_dict() for usuario in usuarios]), 200


###################################################################################################

@app.route('/agenda')
def agenda():
    if 'usuario_id' not in session:
        return redirect('/')
    return render_template('agenda.html')

@app.route('/api/eventos', methods=['GET'])
def listar_eventos():
    eventos = Evento.query.all()
    return jsonify([{
        'id': e.id,
        'title': e.titulo,
        'start': e.inicio.isoformat(),
        'end': e.fim.isoformat(),
        'description': e.descricao,
        'color': e.color,
        'cidade_id': e.cidade_id
    } for e in eventos]), 200

@app.route('/api/eventos', methods=['POST'])
def criar_evento():
    data = request.get_json()

    # Verifica se 'cidade_id' está presente no corpo da requisição
    if 'cidade_id' not in data:
        return jsonify({'error': 'cidade_id é obrigatório!'}), 400

    evento = Evento(
        titulo=data['title'],
        descricao=data.get('description', ''),
        inicio=datetime.fromisoformat(data['start']),
        fim=datetime.fromisoformat(data['end']),
        color=data.get('color', '#3788d8'),  # Adiciona a cor padrão
        cidade_id=data['cidade_id']  # Adiciona o ID da cidade
    )
    db.session.add(evento)
    db.session.commit()
    return jsonify({'message': 'Evento criado com sucesso!'}), 201

@app.route('/api/eventos/<uuid:evento_id>', methods=['PUT'])
def atualizar_evento(evento_id):
    data = request.get_json()

    evento = Evento.query.get_or_404(evento_id)
    evento.titulo = data['title']
    evento.descricao = data.get('description', '')
    # Converte as strings ISO para datetime (UTC)
    evento.inicio = datetime.fromisoformat(data['start'].replace('Z', ''))
    if data['end']:
        evento.fim = datetime.fromisoformat(data['end'].replace('Z', ''))
    evento.color = data.get('color', '#3788d8')
    evento.cidade_id = data['cidade_id']
    
    db.session.commit()
    return jsonify({'message': 'Evento atualizado com sucesso!'}), 200

@app.route('/api/eventos/cidade/<uuid:cidade_id>', methods=['GET'])
def listar_eventos_por_cidade(cidade_id):
    try:
        eventos = Evento.query.filter_by(cidade_id=cidade_id).all()
        if not eventos:
            return jsonify([]), 200  # Retorna array vazio com status 200
            
        return jsonify([{
            'id': str(e.id),
            'title': e.titulo,
            'start': e.inicio.isoformat(),
            'end': e.fim.isoformat(),
            'description': e.descricao,
            'color': e.color,
            'cidade_id': str(e.cidade_id)
        } for e in eventos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

#Deletar evento
@app.route('/api/eventos/<uuid:evento_id>', methods=['DELETE'])
def excluir_evento(evento_id):
    evento = Evento.query.get_or_404(evento_id)
    db.session.delete(evento)
    db.session.commit()
    return jsonify({'message': 'Evento excluído com sucesso!'}), 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')

# app.run(debug=True, host='0.0.0.0', port=8080) # Para rodar localmente, descomente esta linha e comente a linha acima