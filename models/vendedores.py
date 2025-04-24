from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy import func
from db import db

class Vendedor(db.Model):
    __tablename__ = 'vendedores'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=func.uuid_generate_v4())
    nome = db.Column(TEXT, nullable=False, unique=True)

    def as_dict(self):
        return {
            'id': str(self.id),
            'nome': self.nome
        }
