from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy import func
from db import db
from werkzeug.security import generate_password_hash, check_password_hash

class UsuarioLogin(db.Model):
    __tablename__ = 'usuarios_login'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=func.uuid_generate_v4())
    usuario = db.Column(TEXT, nullable=False, unique=True)
    senha_hash = db.Column('senha', TEXT, nullable=False)  # Renomeado para senha_hash (mas mantém 'senha' na coluna)
    tipo = db.Column(TEXT, nullable=False) # Texto de apresentação do usuário
    ativo = db.Column(db.Boolean, default=True)

    @property
    def senha(self):
        raise AttributeError('A senha não é um atributo legível')

    @senha.setter
    def senha(self, senha):
        """Automaticamente gera um hash quando a senha é definida"""
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha):
        """Verifica se a senha fornecida corresponde ao hash armazenado"""
        return check_password_hash(self.senha_hash, senha)

    def as_dict(self):
        """Retorna os dados do usuário SEM a senha/hash"""
        return {
            'id': str(self.id),
            'usuario': self.usuario,
            'tipo': self.tipo,
            'ativo': self.ativo
            # Removido o campo senha/senha_hash por segurança
        }