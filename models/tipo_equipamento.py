from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy import func
from db import db

class TipoEquipamento(db.Model):
    __tablename__ = 'tipo_equipamento'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=func.uuid_generate_v4())
    tipo_equipamento = db.Column(TEXT, nullable=False)

    def as_dict(self):
        return {
            'id': str(self.id),
            'tipo_equipamento': self.tipo_equipamento
        }