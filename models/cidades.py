from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy import func
from db import db

class Cidade(db.Model):
    __tablename__ = 'cidades'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=func.uuid_generate_v4())
    cidade = db.Column(TEXT, nullable=False)

    def as_dict(self):
        return {
            'id': str(self.id),
            'cidade': self.cidade
        }
