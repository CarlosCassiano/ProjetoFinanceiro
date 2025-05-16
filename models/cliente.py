from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy import func
from db import db

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=func.uuid_generate_v4())
    nome = db.Column(TEXT, nullable=False)
    cpf = db.Column(TEXT, nullable=False)
    cnpj = db.Column(TEXT, nullable=False)
    vendedor = db.Column(TEXT, nullable=False)
    data = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    localizacao = db.Column(TEXT, nullable=False)
    situacao = db.Column(TEXT, nullable=False)
    score = db.Column(db.Float, nullable=False)
    consultor = db.Column(TEXT, nullable=False)
    observacao = db.Column(TEXT, nullable=True)

    def as_dict(self):
        return{
            'id': str(self.id),
            'nome': self.nome,
            'cpf': self.cpf,
            'cnpj': self.cnpj,
            'vendedor': self.vendedor,
            'data': str(self.data),
            'localizacao': self.localizacao,
            'situacao': self.situacao,
            'score': self.score,
            'consultor': self.consultor,
            'observacao': self.observacao
        }