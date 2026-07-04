import json
from datetime import timedelta

from flask_jwt_extended import create_access_token

from extensions import db
from models.user import User


class AuthService:
    @staticmethod
    def signup(fullname, email, password):
        email = email.strip().lower()

        if User.query.filter_by(email=email).first():
            return None, 'Email already registered'

        default_prefs = json.dumps({
            'theme': 'dark',
            'notifications': True,
            'defaultView': 'dashboard',
        })
        user = User(fullname=fullname, email=email, preferences=default_prefs)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=30),
        )

        return {
            'token': access_token,
            'user': user.to_dict(),
        }, None

    @staticmethod
    def login(email, password):
        email = email.strip().lower()
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return None, 'Invalid email or password'

        if not user.is_active:
            return None, 'Account is inactive'

        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=30),
        )

        return {
            'token': access_token,
            'user': user.to_dict(),
        }, None
