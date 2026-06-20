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
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'status': self.status,
            'risk_score': round(self.risk_score, 1) if self.risk_score is not None else None,
            'total_pages': self.total_pages,
            'contract_summary': self.contract_summary,
        }
