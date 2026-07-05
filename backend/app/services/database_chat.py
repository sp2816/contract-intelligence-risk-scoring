from models.contract import Contract, Clause, Entity
from sqlalchemy import func
from extensions import db
import re

def get_contracts_by_risk(user_id, minimum=None, maximum=None):

    query = (
        Contract.query
        .filter_by(user_id=user_id)
        .filter(Contract.risk_score.isnot(None))
    )

    if minimum is not None:
        query = query.filter(Contract.risk_score >= minimum)

    if maximum is not None:
        query = query.filter(Contract.risk_score < maximum)

    return query.order_by(
        Contract.risk_score.desc()
    ).all()

def answer_database_question(question, user_id):

    q = question.lower()

    # ---------------- Highest Risk ----------------
    if "highest" in q and "risk" in q:

        contract = (
            Contract.query
            .filter_by(user_id=user_id)
            .filter(Contract.risk_score.isnot(None))
            .order_by(Contract.risk_score.desc())
            .first()
        )

        if not contract:
            return "No analyzed contracts found."

        return (
            f"Highest Risk Contract\n\n"
            f"• {contract.original_filename}\n"
            f"Risk Score: {contract.risk_score:.0f}"
        )

    # ---------------- Lowest Risk ----------------
    if "lowest" in q and "risk" in q:

        contract = (
            Contract.query
            .filter_by(user_id=user_id)
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
            .filter(Contract.user_id == user_id)
            .filter(Contract.risk_score.isnot(None))
            .scalar()
        )

        if avg is None:
            return "No analyzed contracts."

        return f"The average risk score is {avg:.1f}."
    

    # ---------------- Contracts with Exact Risk Score ----------------
    match = re.search(
        r"(?:how many|count).*(?:risk score|score)\s*(?:of\s*)?(\d+)",
        q
    )

    if match:

        score = int(match.group(1))

        contracts = (
            Contract.query
            .filter_by(user_id=user_id)
            .filter(Contract.risk_score == score)
            .order_by(Contract.original_filename)
            .all()
        )

        if not contracts:
            return (
                f"You don't have any analyzed contracts with a risk score of {score}."
            )

        response = (
            f"You have {len(contracts)} "
            f"contract{'s' if len(contracts) > 1 else ''} "
            f"with a risk score of {score}:\n\n"
        )

        for c in contracts:
            response += f"• {c.original_filename}\n"

        return response    
    
    # ---------------- Count Contracts above the Risk Score ----------------
    match = re.search(
        r"(?:how many|count).*(?:above|greater than|over)\s+(\d+)",
        q
    )

    if match:

        score = int(match.group(1))

        total = (
            Contract.query
            .filter_by(user_id=user_id)
            .filter(Contract.risk_score > score)
            .count()
        )

        return (
            f"There {'is' if total == 1 else 'are'} "
            f"{total} contract{'s' if total != 1 else ''} "
            f"with a risk score above {score}."
        )
    
    # ---------------- Count Contracts below the Risk Score ----------------
    match = re.search(
        r"(?:how many|count).*(?:below|less than|under)\s+(\d+)",
        q
    )

    if match:

        score = int(match.group(1))

        total = (
            Contract.query
            .filter_by(user_id=user_id)
            .filter(Contract.risk_score < score)
            .count()
        )

        return (
            f"There {'is' if total == 1 else 'are'} "
            f"{total} contract{'s' if total != 1 else ''} "
            f"with a risk score below {score}."
        )

    # ---------------- Number of Uploaded Contracts ----------------
    if (
        ("how many" in q or "count" in q)
        and "risk score" not in q
        and "score" not in q
        and "above" not in q
        and "below" not in q
        and "greater than" not in q
        and "less than" not in q
        and "over" not in q
        and "under" not in q
    ):

        total = Contract.query.filter_by(user_id=user_id).count()

        return (
            f"You have {total} uploaded "
            f"contract{'s' if total != 1 else ''}."
        )

    # ---------------- High Risk ----------------
    if "high risk" in q:

        contracts = get_contracts_by_risk(
            user_id,
            minimum=70
        )
        if not contracts:
            return (
                "You haven't analyzed any high-risk contracts yet.\n\n"
                "High-risk contracts are those with a risk score of 70 or above."
            )

        response = "High Risk Contracts:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.risk_score:.0f})\n"

        return response

    # ---------------- Medium Risk ----------------
    if "medium risk" in q:

        contracts = get_contracts_by_risk(
            user_id,
            minimum=40,
            maximum=70
        )

        if not contracts:
            return (
                "You haven't analyzed any medium-risk contracts yet.\n\n"
                "Medium-risk contracts have a risk score between 40 and 69."
            )

        response = "Medium Risk Contracts:\n\n"

        for c in contracts:
            response += f"• {c.original_filename} ({c.risk_score:.0f})\n"

        return response

    # ---------------- Low Risk ----------------
    if "low risk" in q:

        contracts = get_contracts_by_risk(
            user_id,
            maximum=40
        )

        if not contracts:
            return (
                "You haven't analyzed any low-risk contracts yet.\n\n"
                "Low-risk contracts have a risk score below 40."
            )

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
            .filter_by(user_id=user_id)
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
            .filter_by(user_id=user_id)
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
            .filter_by(user_id=user_id)
            .order_by(Contract.upload_date.desc())
            .limit(5)
            .all()
        )

        if not contracts:
            return "No uploaded contracts."

        response = "Your 5 most recent contracts:\n\n"

        for c in contracts:

            risk = (
                f"Risk: {c.risk_score:.0f}"
                if c.risk_score is not None
                else "Not analyzed"
            )

            response += (
                f"• {c.original_filename}\n"
                f"  Status: {c.status}\n"
                f"  {risk}\n\n"
            )

        return response

    # ---------------- Contract Summary ----------------
    if "summary" in q:

        for contract in Contract.query.filter_by(user_id=user_id).all():

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
                db.session.query(Clause)
                .join(Contract, Clause.contract_id == Contract.id)
                .filter(Contract.user_id == user_id)
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
            db.session.query(Entity)
            .join(Contract, Entity.contract_id == Contract.id)
            .filter(Contract.user_id == user_id)
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