import json
import logging
import os
import secrets
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models.user import User
from services.auth import AuthService

auth_bp = Blueprint('auth', __name__)


def setup_auth_logger():
    logger = logging.getLogger('auth_failures')
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger

    backend_dir = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    log_dir = os.path.join(backend_dir, 'instance')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'auth_failures.log')

    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    return logger


auth_logger = setup_auth_logger()


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No data provided'}), 400

    fullname = data.get('fullname', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not fullname or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400

    result, error = AuthService.signup(fullname, email, password)

    if error:
        auth_logger.warning(f"Registration failed for email='{email}'. Reason: {error}")
        return jsonify({'message': error}), 400

    return jsonify(result), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400

    result, error = AuthService.login(email, password)

    if error:
        ip_addr = request.remote_addr
        auth_logger.warning(f"Failed login attempt for email='{email}' from IP={ip_addr}. Reason: {error}")
        return jsonify({'message': error}), 401

    return jsonify(result), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'message': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        auth_logger.warning(f"Password reset requested for non-existent email '{email}'")
        return jsonify({'message': 'No account found with this email address.'}), 404

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()

    auth_logger.info(f"[PASSWORD RESET] Token generated for '{email}'")

    return jsonify({
        'message': 'Account verified. You can now reset your password.',
        'token': token,
        'email': email,
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    token = data.get('token', '').strip()
    new_password = data.get('password', '').strip()

    if not email or not token or not new_password:
        return jsonify({'message': 'Missing required fields'}), 400

    if len(new_password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or user.reset_token != token:
        auth_logger.warning(f"Invalid reset token or email provided for '{email}'")
        return jsonify({'message': 'Invalid token or email'}), 400

    if user.reset_token_expiry < datetime.utcnow():
        auth_logger.warning(f"Expired reset token used for '{email}'")
        return jsonify({'message': 'Reset token has expired'}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    auth_logger.warning(f"Password successfully reset for '{email}'")
    return jsonify({'message': 'Password has been reset successfully.'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify(user.to_dict()), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    current_prefs = {}
    if user.preferences:
        try:
            current_prefs = json.loads(user.preferences)
        except Exception:
            pass

    current_prefs.update(data)

    user.preferences = json.dumps(current_prefs)
    db.session.commit()

    return jsonify(user.to_dict()), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()

    new_password = data.get('newPassword')

    if not new_password:
        return jsonify({'message': 'New password is required'}), 400

    if len(new_password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200
