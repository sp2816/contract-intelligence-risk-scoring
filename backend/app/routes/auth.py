# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify
# pyrefly: ignore [missing-import] 
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.auth import AuthService
from models.user import User
from extensions import db
import logging
import os
import secrets
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Create auth failure logger
auth_logger = logging.getLogger('auth_failures')
auth_logger.setLevel(logging.INFO)

# Ensure the log folder exists
backend_dir = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
log_dir = os.path.join(backend_dir, 'instance')
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, 'auth_failures.log')

# Avoid adding multiple handlers if they already exist
if not auth_logger.handlers:
    file_handler = logging.FileHandler(log_file)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    auth_logger.addHandler(file_handler)
    
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    auth_logger.addHandler(stream_handler)

# Sign Up Route
@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
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

# Login Route
@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with email and password"""
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

# Forgot Password Route
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset link"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
        
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        
        reset_link = f"http://localhost:5173/reset-password?token={token}&email={email}"
        auth_logger.warning(f"[PASSWORD RESET] Generated reset link for '{email}': {reset_link}")
    else:
        auth_logger.warning(f"Password reset requested for non-existent email '{email}'")
        
    return jsonify({'message': 'If the email exists in our system, a password reset link has been generated. Please check the logs.'}), 200

# Reset Password Route
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password using token"""
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



# Get Current User
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

# Logout Route
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (token-based, just return success)"""
    return jsonify({'message': 'Logged out successfully'}), 200

# Update User Preferences
@auth_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update preferences for the current user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
        
    import json
    # Merge existing preferences or set new ones
    current_prefs = {}
    if user.preferences:
        try:
            current_prefs = json.loads(user.preferences)
        except Exception:
            pass
            
    # Update preferences dictionary with new values
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
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()

    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not current_password or not new_password:
        return jsonify({"message": "Missing fields"}), 400

    if not user.check_password(current_password):
        return jsonify({"message": "Current password is incorrect"}), 400

    if len(new_password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    user.set_password(new_password)

    db.session.commit()

    return jsonify({
        "message": "Password updated successfully"
    }), 200
