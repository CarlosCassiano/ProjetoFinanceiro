from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy import func
from db import db

class Equipamento(db.Model):
    __tablename__ = 'equipamentos'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=func.uuid_generate_v4())
    usuario = db.Column(TEXT, nullable=False)
    nome_cliente = db.Column(TEXT, nullable=False)
    equipamento = db.Column(TEXT, nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    onu = db.Column(TEXT, nullable=False)
    data = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    rede_wifi = db.Column(TEXT, nullable=False)
    senha_wifi = db.Column(TEXT, nullable=False)
    teste = db.Column(TEXT, nullable=False)
    status = db.Column(TEXT, nullable=False)
    cidade = db.Column(TEXT, nullable=False)
    tipo = db.Column(TEXT, nullable=False)
    faturado = db.Column(TEXT, nullable=False)
    nota_fiscal = db.Column(TEXT, nullable=False)
    observacao = db.Column(TEXT, nullable=True)

    def as_dict(self):
        return {
            'id': str(self.id),
            'usuario': self.usuario,
            'nome_cliente': self.nome_cliente,
            'equipamento': self.equipamento,
            'quantidade': self.quantidade,
            'onu': self.onu,
            'data': str(self.data),
            'rede_wifi': self.rede_wifi,
            'senha_wifi': self.senha_wifi,
            'teste': self.teste,
            'status': self.status,
            'cidade': self.cidade,
            'tipo': self.tipo,
            'faturado': self.faturado,
            'nota_fiscal': self.nota_fiscal,
            'observacao': self.observacao  
        }