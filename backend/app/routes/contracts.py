import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models.contract import Contract
from extensions import db

contracts_bp = Blueprint('contracts', __name__)

# ─── Configuration ──────────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


def _allowed_file(filename):
    """Check if the file extension is in the allowed set."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _get_upload_dir(user_id):
    """Return (and create) the per-user upload directory."""
    base = os.path.join(current_app.root_path, '..', 'uploads', str(user_id))
    os.makedirs(base, exist_ok=True)
    return os.path.abspath(base)


# ─── Upload Endpoint ────────────────────────────────────────────────────────

@contracts_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_contract():
    """
    POST /api/contracts/upload
    Accepts multipart/form-data with a `file` field.
    Returns the created Contract record.
    """
    user_id = get_jwt_identity()

    # --- Validate file presence ------------------------------------------------
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request.'}), 400

    file = request.files['file']

    if file.filename == '' or not file.filename:
        return jsonify({'message': 'No file selected.'}), 400

    # --- Validate extension ----------------------------------------------------
    if not _allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else '(none)'
        return jsonify({
            'message': f'Unsupported file type: .{ext}. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400

    # --- Validate size (belt-and-suspenders; Flask MAX_CONTENT_LENGTH also enforces) --
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)

    if size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE // (1024 * 1024)
        return jsonify({
            'message': f'File exceeds the {max_mb} MB size limit ({size / (1024 * 1024):.1f} MB).'
        }), 413

    if size == 0:
        return jsonify({'message': 'Uploaded file is empty.'}), 400

    # --- Save to disk ----------------------------------------------------------
    original = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{original}"
    upload_dir = _get_upload_dir(user_id)
    save_path = os.path.join(upload_dir, unique_name)

    file.save(save_path)

    # --- Create DB record ------------------------------------------------------
    contract = Contract(
        user_id=user_id,
        filename=unique_name,
        original_filename=original,
        file_path=save_path,
        status='uploaded',
    )
    db.session.add(contract)
    db.session.commit()

    return jsonify({
        'message': 'Contract uploaded successfully.',
        'contract': contract.to_dict(),
    }), 201


# ─── List User Contracts ────────────────────────────────────────────────────

@contracts_bp.route('/', methods=['GET'])
@jwt_required()
def list_contracts():
    """
    GET /api/contracts/
    Returns all contracts for the authenticated user.
    """
    user_id = get_jwt_identity()
    contracts = Contract.query.filter_by(user_id=user_id) \
                              .order_by(Contract.upload_date.desc()) \
                              .all()
    return jsonify({
        'contracts': [c.to_dict() for c in contracts],
        'total': len(contracts),
    }), 200
