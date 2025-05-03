from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy import func
from db import db
from datetime import datetime

class Evento(db.Model):
    __tablename__ = 'eventos'
    id = db.Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    titulo = db.Column(TEXT, nullable=False)
    descricao = db.Column(TEXT, nullable=False)
    inicio = db.Column(db.DateTime, nullable=False)
    fim = db.Column(db.DateTime, nullable=False)
    color = db.Column(TEXT)
    cidade_id = db.Column(UUID(as_uuid=True), db.ForeignKey('cidades.id'), nullable=False)

    def as_dict(self):
        return {
        'id': self.id,
        'title': self.titulo,
        'start': self.inicio.isoformat(),
        'end': self.fim.isoformat(),
        'description': self.descricao,
        'color': self.color,
        'cidade_id': self.cidade_id
    }