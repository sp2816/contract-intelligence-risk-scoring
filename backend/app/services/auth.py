from datetime import timedelta
from flask_jwt_extended import create_access_token
from main import db
from models.user import User

class AuthService:
    
    @staticmethod
    def signup(fullname, email, password):
        """Register a new user with email and password"""
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return None, 'Email already registered'
        
        # Create new user
        user = User(fullname=fullname, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return {
            'token': access_token,
            'user': user.to_dict()
        }, None
    
    @staticmethod
    def login(email, password):
        """Login user with email and password"""
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return None, 'Invalid email or password'
        
        if not user.is_active:
            return None, 'Account is inactive'
        
        # Generate token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return {
            'token': access_token,
            'user': user.to_dict()
        }, None

