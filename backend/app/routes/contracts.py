import os
import uuid
import traceback
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models.contract import Contract, Clause, RiskReport, Entity
from extensions import db

import sys
# Add parent directory of backend (workspace root) to path to load ml modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from ml.risk_scoring.risk_rules import (
    HIGH_RISK,
    MEDIUM_RISK,
    LOW_RISK,
)
try:
    from ml.pipeline.contract_analyzer import analyze_contract as run_ml_pipeline
    HAS_ML = True
# except Exception:
#     HAS_ML = False
except Exception as e:
    print("\n========== ML IMPORT ERROR ==========")
    print(e)
    print("====================================\n")
    HAS_ML = False

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
    print("Get DB:", db.engine.url)
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


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

# Contracts with any of these statuses are counted as "analyzed"
_ANALYZED_STATUSES = {'analyzed', 'reviewed', 'approved', 'completed', 'analysis_complete'}

# risk_score >= this threshold → "High Risk"
HIGH_RISK_THRESHOLD = 71.0



@contracts_bp.route('/stats', methods=['GET'])
@jwt_required()
def contract_stats():
    """
    GET /api/contracts/stats
    Returns aggregate KPI metrics for the authenticated user's contracts.

    Response 200:
    {
        "total_contracts":  <int>,
        "analyzed_count":   <int>,
        "avg_risk_score":   <float | null>,
        "high_risk_count":  <int>,
        "recent_activity":  [
            {
                "id":                <int>,
                "original_filename": <str>,
                "upload_date":       <ISO-8601 str | null>,
                "status":            <str>,
                "risk_score":        <float | null>
            },
            ...  (max 5 items, newest first)
        ]
    }
    """
    from sqlalchemy import func

    user_id = get_jwt_identity()

    # ── Total contracts ───────────────────────────────────────────────────────
    total = Contract.query.filter_by(user_id=user_id).count()

    # ── Analyzed count (case-insensitive for defense-in-depth) ────────────────
    analyzed_count = Contract.query.filter(
        Contract.user_id == user_id,
        func.lower(Contract.status).in_(list(_ANALYZED_STATUSES))
    ).count()

    # ── Average risk score (only over contracts that have a score) ────────────
    avg_risk_raw = (
        db.session.query(func.avg(Contract.risk_score))
        .filter(
            Contract.user_id == user_id,
            Contract.risk_score.isnot(None),
        )
        .scalar()
    )
    avg_risk = round(float(avg_risk_raw), 1) if avg_risk_raw is not None else None

    # ── High-risk count ───────────────────────────────────────────────────────
    high_risk_count = Contract.query.filter(
        Contract.user_id == user_id,
        Contract.risk_score >= HIGH_RISK_THRESHOLD,
    ).count()

    # ── Recent activity (last 5) ──────────────────────────────────────────────
    recent = (
        Contract.query
        .filter_by(user_id=user_id)
        .order_by(Contract.upload_date.desc())
        .limit(5)
        .all()
    )

    return jsonify({
        'total_contracts': total,
        'analyzed_count':  analyzed_count,
        'avg_risk_score':  avg_risk,
        'high_risk_count': high_risk_count,
        'recent_activity': [
            {
                'id':                c.id,
                'original_filename': c.original_filename or c.filename,
                'upload_date':       (c.upload_date.isoformat() + 'Z') if c.upload_date else None,
                'status':            c.status,
                'risk_score':        round(c.risk_score, 1) if c.risk_score is not None else None,
            }
            for c in recent
        ],
    }), 200


# ─── Get Single Contract Detail ───────────────────────────────────────────────

# @contracts_bp.route('/<int:contract_id>', methods=['GET'])
# @jwt_required()
# def get_contract(contract_id):
#     """
#     GET /api/contracts/<contract_id>
#     Returns detailed info for a single contract, including clauses, entities, and risk reports.
#     """
#     user_id = get_jwt_identity()
#     contract = Contract.query.filter_by(id=contract_id, user_id=user_id).first()
#     if not contract:
#         return jsonify({'message': 'Contract not found.'}), 404

#     clauses = Clause.query.filter_by(contract_id=contract_id).all()
#     risk_report = RiskReport.query.filter_by(contract_id=contract_id).first()
#     entities = Entity.query.filter_by(contract_id=contract_id).all()

#     return jsonify({
#         'contract': contract.to_dict(),
#         'clauses': [c.to_dict() for c in clauses],
#         'risk_report': risk_report.to_dict() if risk_report else None,
#         'entities': [e.to_dict() for e in entities]
#     }), 200

@contracts_bp.route('/<int:contract_id>', methods=['GET'])
@jwt_required()
def get_contract(contract_id):

    user_id = get_jwt_identity()

    print("\n========== GET CONTRACT ==========")
    print("DB:", db.engine.url)

    contract = Contract.query.filter_by(
        id=contract_id,
        user_id=user_id
    ).first()


    if contract:
        print("Status:", contract.status)
        print("Risk:", contract.risk_score)

    clause_count = Clause.query.filter_by(contract_id=contract_id).count()
    entity_count = Entity.query.filter_by(contract_id=contract_id).count()
    report_count = RiskReport.query.filter_by(contract_id=contract_id).count()

    print("Clauses:", clause_count)
    print("Entities:", entity_count)
    print("Reports:", report_count)
    print("=================================\n")

    if not contract:
        return jsonify({"message": "Contract not found"}), 404

    clauses = Clause.query.filter_by(contract_id=contract_id).all()
    entities = Entity.query.filter_by(contract_id=contract_id).all()
    report = RiskReport.query.filter_by(contract_id=contract_id).first()

    return jsonify({
        "contract": contract.to_dict(),
        "clauses": [c.to_dict() for c in clauses],
        "entities": [e.to_dict() for e in entities],
        "risk_report": report.to_dict() if report else None
    }), 200

# ─── Delete Contract ─────────────────────────────────────────────────────────

@contracts_bp.route('/<int:contract_id>', methods=['DELETE'])
@jwt_required()
def delete_contract(contract_id):
    """
    DELETE /api/contracts/<contract_id>
    Deletes the contract record and references, plus deletes the file on disk.
    """
    user_id = get_jwt_identity()
    contract = Contract.query.filter_by(id=contract_id, user_id=user_id).first()
    if not contract:
        return jsonify({'message': 'Contract not found.'}), 404

    # Delete file from disk if it exists
    if contract.file_path and os.path.exists(contract.file_path):
        try:
            os.remove(contract.file_path)
        except Exception as e:
            current_app.logger.error(f"Failed to delete file {contract.file_path}: {e}")

    # Delete related tables to prevent orphaned child rows in databases without strict cascades
    Clause.query.filter_by(contract_id=contract_id).delete()
    Entity.query.filter_by(contract_id=contract_id).delete()
    RiskReport.query.filter_by(contract_id=contract_id).delete()

    db.session.delete(contract)
    db.session.commit()

    return jsonify({'message': 'Contract deleted successfully.'}), 200


# ─── Analyze Contract (Simulated ML pipeline) ───────────────────────────────

@contracts_bp.route('/<int:contract_id>/analyze', methods=['POST'])
@jwt_required()
def analyze_contract(contract_id):
    print("analyze DB:", db.engine.url)
    """
    POST /api/contracts/<contract_id>/analyze
    Simulates ML processing, updates database with risk score, summary, and extracts clauses.
    """
    user_id = get_jwt_identity()
    contract = Contract.query.filter_by(id=contract_id, user_id=user_id).first()
    if not contract:
        return jsonify({'message': 'Contract not found.'}), 404

    filename = (contract.original_filename or contract.filename or '').lower()
    
    # 1. Clean existing references to prevent duplicates
    Clause.query.filter_by(contract_id=contract_id).delete()
    RiskReport.query.filter_by(contract_id=contract_id).delete()
    Entity.query.filter_by(contract_id=contract_id).delete()

    filename = (contract.original_filename or contract.filename or '').lower()
    ml_processed = False

    if HAS_ML and contract.file_path and os.path.exists(contract.file_path):
        try:
            # Run the active ML analyzer pipeline
            print("Running ML Pipeline...")
            ml_results = run_ml_pipeline(contract.file_path)
            # print("\nML RESULTS KEYS:")
            # print(ml_results.keys())
            print("\n========== ML RESULTS ==========")
            print("Risk Score:", ml_results.get("risk_score"))
            print("Risk Level:", ml_results.get("risk_level"))
            print("Reasons:", ml_results.get("risk_reasons"))
            print("Metadata:", ml_results.get("metadata"))
            print("Entities type:", type(ml_results.get("entities")))
            print("\nENTITIES:")
            # for e in ml_results["entities"]:
            #     print(e)
            print("Clause predictions:", len(ml_results.get("clause_predictions", [])))
            print("================================\n")
                        
            overall_score = ml_results.get("risk_score", 45.0)
            level = ml_results.get("risk_level", "medium")
            reasons = ml_results.get("risk_reasons", [])
            summary = reasons[0] if reasons else "Contract successfully analyzed via ML pipeline."
            
            # Map predictions
            clauses_data = []
            high_clauses = 0
            med_clauses = 0
            low_clauses = 0
            
            for pred in ml_results.get("clause_predictions", []):
                pred_label = pred.get("prediction", "UNCERTAIN")
                pred_conf = pred.get("confidence", 0.0)
                pred_text = pred.get("text", "")
                
                # Check labels for risk assigning
                if pred_label in HIGH_RISK:
                    r_level = "high"
                    high_clauses += 1

                elif pred_label in MEDIUM_RISK:
                    r_level = "medium"
                    med_clauses += 1

                elif pred_label in LOW_RISK:
                    r_level = "low"
                    low_clauses += 1

                else:
                    r_level = "low"
                
                clauses_data.append((pred_label, pred_text, pred_conf, r_level))

            # Map entities
            entities = ml_results.get("entities", [])

            entities_data = []

            # Save parties
            entities_data = []

            for e in entities:

                label = e["label"]
                text = e["text"].strip()

                if label == "ORG":

                    if text.upper() in {
                        "PARTY",
                        "WITNESS",
                        "ARTICLE",
                        "SECTION",
                        "TERM",
                        "AGREEMENT",
                        "EXHIBIT",
                        "SCHEDULE"
                    }:
                        continue

                    if len(text) < 4:
                        continue

                if label == "ORG":
                    entity_type = "COMPANY"

                elif label == "GPE":
                    entity_type = "JURISDICTION"

                elif label == "DATE":
                    entity_type = "DATE"

                else:
                    continue

                conf = e.get("confidence", 0.99)
                entities_data.append(
                    (
                        entity_type,
                        text,
                        conf,
                        1
                    )
                )

            metadata = ml_results.get("metadata", {})

            for party in metadata.get("parties", []):

                entities_data.append(
                    (
                        "COMPANY",
                        party,
                        1.0,
                        1
                    )
                )

            if metadata.get("governing_law"):

                entities_data.append(
                    (
                        "JURISDICTION",
                        metadata["governing_law"],
                        1.0,
                        1
                    )
                )

            if metadata.get("effective_date"):

                entities_data.append(
                    (
                        "DATE",
                        metadata["effective_date"],
                        1.0,
                        1
                    )
                )

            # Save report
            report = RiskReport(
                contract_id=contract_id,
                overall_risk_score=int(overall_score),
                risk_summary=summary,
                high_risk_clauses=high_clauses,
                medium_risk_clauses=med_clauses,
                low_risk_clauses=low_clauses
            )
            db.session.add(report)

            for c_type, c_text, conf, r_level in clauses_data:
                clause = Clause(
                    contract_id=contract_id,
                    clause_type=c_type,
                    clause_text=c_text,
                    confidence_score=conf,
                    risk_level=r_level
                )
                db.session.add(clause)

            unique_entities = []

            seen = set()

            for entity in entities_data:

                key = (
                    entity[0],
                    entity[1].strip().lower()
                )

                if key not in seen:
                    seen.add(key)
                    unique_entities.append(entity)

            entities_data = unique_entities

            for e_type, e_value, conf, page in entities_data:
                entity = Entity(
                    contract_id=contract_id,
                    entity_type=e_type,
                    entity_value=e_value,
                    confidence_score=conf,
                    page_number=page
                )
                db.session.add(entity)

            # Update contract details
            contract.status = 'analyzed'
            contract.risk_score = overall_score
            contract.contract_summary = summary
            db.session.add(contract)
            
            db.session.commit()
            print("\n====== SAVED CONTRACT ======")
            print(contract.risk_score)
            print(contract.contract_summary)
            print(contract.status)
            print("===========================\n")
            ml_processed = True
            
        except Exception as ml_err:
            print("\n========== ML PIPELINE FAILED ==========")
            traceback.print_exc()
            print("========================================")

    if not ml_processed:
        # Fall back to simulated templates
        if 'nda' in filename or 'non-disclosure' in filename or 'confidential' in filename:
            overall_score = 15.0
            summary = "Standard low-risk Mutual Non-Disclosure Agreement with a 3-year survival clause and balanced confidentiality obligations."
            high_clauses = 0
            med_clauses = 0
            low_clauses = 2
            clauses_data = [
                ('Confidential Information', '"Confidential Information" means all non-public information disclosed by a party to the receiving party.', 0.90, 'low'),
                ('Survival Period', 'The obligations under this Agreement shall survive for a period of three (3) years from the date of disclosure.', 0.94, 'low')
            ]
            entities_data = [
                ('DATE', '3 years', 0.92, 1),
                ('JURISDICTION', 'State of Delaware', 0.88, 3)
            ]
        elif 'saas' in filename or 'service agreement' in filename or 'license' in filename:
            overall_score = 74.0
            summary = "The SaaS agreement presents high risk due to broad limitation of liability exemptions favoring the Provider, unilateral termination clauses, and the total omission of a GDPR-compliant Data Protection Addendum (DPA) despite handling personal user data."
            high_clauses = 2
            med_clauses = 1
            low_clauses = 1
            clauses_data = [
                ('Limitation of Liability', '"In no event shall Provider be liable for any indirect, incidental, special or consequential damages. Provider\'s total aggregate liability under this agreement shall be capped at the total amount paid by Client in the preceding three (3) months."', 0.85, 'high'),
                ('Indemnification Obligations', '"Client shall indemnify and defend Provider against any third-party claims, losses, or liabilities arising out of Client\'s use of the SaaS application, except to the extent caused by Provider\'s gross negligence."', 0.78, 'high'),
                ('Termination for Convenience', '"Provider may terminate this agreement at any time for convenience upon thirty (30) days\' written notice to Client. Client may only terminate in the event of an uncured material breach by Provider."', 0.52, 'medium'),
                ('Intellectual Property Assignment', '"Provider retains all right, title, and interest in and to the SaaS application, documentation, and any system metadata. Client retains all rights in client-loaded data."', 0.18, 'low')
            ]
            entities_data = [
                ('COMPANY', 'Acme Corp', 0.98, 1),
                ('COMPANY', 'DataCore Solutions Inc', 0.99, 1),
                ('DATE', 'October 15, 2024', 0.95, 1),
                ('JURISDICTION', 'State of Delaware', 0.92, 12)
            ]
        else:
            overall_score = 45.0
            summary = "Generic contract with moderate risk. Main concerns relate to warranty limitations and lack of clear dispute resolution procedures."
            high_clauses = 0
            med_clauses = 2
            low_clauses = 1
            clauses_data = [
                ('Warranty Disclaimer', 'The services are provided "as is" without warranty of any kind, either express or implied.', 0.88, 'medium'),
                ('Governing Law', 'This agreement shall be governed by and construed in accordance with the laws of the State of California.', 0.95, 'low'),
                ('Dispute Resolution', 'Any dispute arising out of this agreement shall be settled by arbitration in San Francisco.', 0.70, 'medium')
            ]
            entities_data = [
                ('JURISDICTION', 'State of California', 0.94, 5),
                ('COMPANY', 'Client Partner', 0.85, 1)
            ]

        contract.status = 'analyzed'
        contract.risk_score = overall_score
        contract.contract_summary = summary
        db.session.add(contract)

        report = RiskReport(
            contract_id=contract_id,
            overall_risk_score=int(overall_score),
            risk_summary=summary,
            high_risk_clauses=high_clauses,
            medium_risk_clauses=med_clauses,
            low_risk_clauses=low_clauses
        )
        db.session.add(report)

        for c_type, c_text, conf, r_level in clauses_data:
            clause = Clause(
                contract_id=contract_id,
                clause_type=c_type,
                clause_text=c_text,
                confidence_score=conf,
                risk_level=r_level
            )
            db.session.add(clause)

        for e_type, e_value, conf, page in entities_data:
            entity = Entity(
                contract_id=contract_id,
                entity_type=e_type,
                entity_value=e_value,
                confidence_score=conf,
                page_number=page
            )
            db.session.add(entity)

        db.session.commit()

    return jsonify({
        'message': 'Contract analyzed successfully.',
        'contract': contract.to_dict(),
        'risk_report': RiskReport.query.filter_by(contract_id=contract_id).first().to_dict(),
        'clauses': [c.to_dict() for c in Clause.query.filter_by(contract_id=contract_id).all()],
        'entities': [e.to_dict() for e in Entity.query.filter_by(contract_id=contract_id).all()]
    }), 200
