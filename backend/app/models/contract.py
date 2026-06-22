from datetime import datetime
from extensions import db


class Contract(db.Model):
    """
    Represents an uploaded contract document.
    Matches the `contracts` table in schema.sql.
    """
    __tablename__ = 'contracts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255))
    file_path = db.Column(db.Text)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='uploaded')
    risk_score = db.Column(db.Float, nullable=True)   # 0.0 – 100.0; set by ML pipeline
    total_pages = db.Column(db.Integer)
    extracted_text = db.Column(db.Text)
    contract_summary = db.Column(db.Text)

    # Relationship back to User (optional, for joins)
    user = db.relationship('User', backref=db.backref('contracts', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_path': self.file_path,
            'upload_date': (self.upload_date.isoformat() + 'Z') if self.upload_date else None,
            'status': self.status,
            'risk_score': round(self.risk_score, 1) if self.risk_score is not None else None,
            'total_pages': self.total_pages,
            'contract_summary': self.contract_summary,
        }


class Clause(db.Model):
    """
    Represents an extracted clause from a contract.
    Matches the `clauses` table in schema.sql.
    """
    __tablename__ = 'clauses'

    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    clause_type = db.Column(db.String(255), nullable=False)
    clause_text = db.Column(db.Text, nullable=False)
    confidence_score = db.Column(db.Float)
    risk_level = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'contract_id': self.contract_id,
            'clause_type': self.clause_type,
            'clause_text': self.clause_text,
            'confidence_score': self.confidence_score,
            'risk_level': self.risk_level,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
        }


class RiskReport(db.Model):
    """
    Represents the risk assessment report generated for a contract.
    Matches the `risk_reports` table in schema.sql.
    """
    __tablename__ = 'risk_reports'

    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    overall_risk_score = db.Column(db.Integer)
    risk_summary = db.Column(db.Text)
    high_risk_clauses = db.Column(db.Integer, default=0)
    medium_risk_clauses = db.Column(db.Integer, default=0)
    low_risk_clauses = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'contract_id': self.contract_id,
            'overall_risk_score': self.overall_risk_score,
            'risk_summary': self.risk_summary,
            'high_risk_clauses': self.high_risk_clauses,
            'medium_risk_clauses': self.medium_risk_clauses,
            'low_risk_clauses': self.low_risk_clauses,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
        }


class Entity(db.Model):
    """
    Represents an extracted entity (e.g. contracting company) from a contract.
    Matches the `entities` table in schema.sql.
    """
    __tablename__ = 'entities'

    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    entity_type = db.Column(db.String(100), nullable=False)
    entity_value = db.Column(db.Text, nullable=False)
    confidence_score = db.Column(db.Float)
    page_number = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'contract_id': self.contract_id,
            'entity_type': self.entity_type,
            'entity_value': self.entity_value,
            'confidence_score': self.confidence_score,
            'page_number': self.page_number,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
        }

