# pyrefly: ignore [missing-import]
from flask_sqlalchemy import SQLAlchemy
# pyrefly: ignore [missing-import]
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()
