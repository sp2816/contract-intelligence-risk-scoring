# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify
# pyrefly: ignore [missing-import] 
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.auth import AuthService
from models.user import User
from extensions import db

auth_bp = Blueprint('auth', __name__)

# Sign Up Route
@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    fullname = data.get('fullname', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    
    if not fullname or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400
    
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400
    
    result, error = AuthService.signup(fullname, email, password)
    
    if error:
        return jsonify({'message': error}), 400
    
    return jsonify(result), 201

# Login Route
@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with email and password"""
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    
    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400
    
    result, error = AuthService.login(email, password)
    
    if error:
        return jsonify({'message': error}), 401
    
    return jsonify(result), 200



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
