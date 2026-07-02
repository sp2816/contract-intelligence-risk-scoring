from models.contract import Contract, Clause, Entity
from sqlalchemy import func
from extensions import db
import re


def answer_database_question(question):

    q = question.lower()

    # ---------------- Highest Risk ----------------
    if "highest" in q and "risk" in q:

        contract = (
            Contract.query
            .filter(Contract.risk_score.isnot(None))
            .order_by(Contract.risk_score.desc())
            .first()
        )

        if not contract:
            return "No analyzed contracts found."

        return (
            f"The contract with the highest risk score is "
            f"'{contract.original_filename}' "
            f"with a risk score of {contract.risk_score:.0f}."
        )

    # ---------------- Lowest Risk ----------------
    if "lowest" in q and "risk" in q:

        contract = (
            Contract.query
            .filter(Contract.risk_score.isnot(None))
            .order_by(Contract.risk_score.asc())
            .first()
        )

        if not contract:
            return "No analyzed contracts found."

        return (
            f"The safest contract is "
            f"'{contract.original_filename}' "
            f"with a risk score of {contract.risk_score:.0f}."
        )

    # ---------------- Average Risk ----------------
    if "average" in q and "risk" in q:

        avg = (
            db.session.query(func.avg(Contract.risk_score))
            .filter(Contract.risk_score.isnot(None))
            .scalar()
        )

        if avg is None:
            return "No analyzed contracts."

        return f"The average risk score is {avg:.1f}."

    # ---------------- Number of Contracts ----------------
    if "how many" in q or "count" in q:

        total = Contract.query.count()

        return f"There are {total} uploaded contracts."

    # ---------------- High Risk ----------------
    if "high risk" in q:

        contracts = (
            Contract.query
            .filter(Contract.risk_score >= 70)
            .order_by(Contract.risk_score.desc())
            .all()
        )

        if not contracts:
            return "No high-risk contracts found."

        response = "High Risk Contracts:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.risk_score:.0f})\n"

        return response

    # ---------------- Medium Risk ----------------
    if "medium risk" in q:

        contracts = (
            Contract.query
            .filter(Contract.risk_score >= 40)
            .filter(Contract.risk_score < 70)
            .order_by(Contract.risk_score.desc())
            .all()
        )

        if not contracts:
            return "No medium-risk contracts."

        response = "Medium Risk Contracts:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.risk_score:.0f})\n"

        return response

    # ---------------- Low Risk ----------------
    if "low risk" in q:

        contracts = (
            Contract.query
            .filter(Contract.risk_score < 40)
            .order_by(Contract.risk_score.asc())
            .all()
        )

        if not contracts:
            return "No low-risk contracts."

        response = "Low Risk Contracts:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.risk_score:.0f})\n"

        return response

    # ---------------- Above X ----------------
    match = re.search(r"above\s+(\d+)", q)

    if match:

        score = int(match.group(1))

        contracts = (
            Contract.query
            .filter(Contract.risk_score >= score)
            .order_by(Contract.risk_score.desc())
            .all()
        )

        if not contracts:
            return f"No contracts above risk score {score}."

        response = f"Contracts above risk score {score}:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.risk_score:.0f})\n"

        return response

    # ---------------- Below X ----------------
    match = re.search(r"below\s+(\d+)", q)

    if match:

        score = int(match.group(1))

        contracts = (
            Contract.query
            .filter(Contract.risk_score <= score)
            .order_by(Contract.risk_score.asc())
            .all()
        )

        if not contracts:
            return f"No contracts below risk score {score}."

        response = f"Contracts below risk score {score}:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.risk_score:.0f})\n"

        return response

    # ---------------- Recent ----------------
    if "recent" in q:

        contracts = (
            Contract.query
            .order_by(Contract.upload_date.desc())
            .limit(5)
            .all()
        )

        if not contracts:
            return "No uploaded contracts."

        response = "Recent Contracts:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.status})\n"

        return response

    # ---------------- Contract Summary ----------------
    if "summary" in q:

        for contract in Contract.query.all():

            name = contract.original_filename.lower()

            if any(word in name for word in q.split()):

                return contract.contract_summary or "Summary not available."

    # ---------------- Clause Search ----------------
    clause_types = [
        "termination",
        "confidentiality",
        "payment",
        "liability",
        "governing",
        "force majeure",
        "indemnification"
    ]

    for clause_name in clause_types:

        if clause_name in q:

            clauses = (
                Clause.query
                .filter(Clause.clause_type.ilike(f"%{clause_name}%"))
                .limit(3)
                .all()
            )

            if not clauses:
                return f"No {clause_name} clauses found."

            response = f"{clause_name.title()} Clauses\n\n"

            for c in clauses:

                response += (
                    f"{c.clause_text[:350]}...\n\n"
                )

            return response

    # ---------------- Entity Search ----------------
    if "party" in q or "entity" in q or "company" in q:

        entities = (
            Entity.query
            .limit(20)
            .all()
        )

        if not entities:
            return "No entities found."

        response = "Entities Found:\n\n"

        for e in entities:

            response += (
                f"• {e.entity_type}: {e.entity_value}\n"
            )

        return response

    return (
        "I couldn't understand that question.\n\n"
        "You can ask things like:\n"
        "• Highest risk contract\n"
        "• Lowest risk contract\n"
        "• High risk contracts\n"
        "• Contracts above 60\n"
        "• Average risk\n"
        "• Recent contracts\n"
        "• Termination clause\n"
        "• Confidentiality clause\n"
        "• Contract summary\n"
        "• Show entities"
    )