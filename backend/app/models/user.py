from datetime import datetime
# pyrefly: ignore [missing-import]
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255))
    oauth_id = db.Column(db.String(255), unique=True, nullable=True)
    oauth_provider = db.Column(db.String(50), nullable=True)  # 'google', 'github'
    is_active = db.Column(db.Boolean, default=True)
    preferences = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        import json
        prefs = {}
        if self.preferences:
            try:
                prefs = json.loads(self.preferences)
            except Exception:
                pass
        return {
            'id': self.id,
            'fullname': self.fullname,
            'email': self.email,
            'oauth_provider': self.oauth_provider,
            'preferences': prefs,
            'created_at': self.created_at.isoformat()
        }
