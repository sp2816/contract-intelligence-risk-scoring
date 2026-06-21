from ml.risk_scoring.risk_rules import (
    HIGH_RISK,
    MEDIUM_RISK,
    LOW_RISK
)


def calculate_risk_score(
    clause_predictions
):

    score = 0

    reasons = []

    seen_clauses = set()

    high_risk_found = []
    medium_risk_found = []

    for item in clause_predictions:

        clause = item["prediction"]

        if clause in seen_clauses:
            continue

        seen_clauses.add(clause)

        HIGH_RISK_WEIGHT = 15
        MEDIUM_RISK_WEIGHT = 8
        LOW_RISK_WEIGHT = 2

        if clause in HIGH_RISK:

            score += HIGH_RISK_WEIGHT

            high_risk_found.append(clause)

        elif clause in MEDIUM_RISK:

            score += MEDIUM_RISK_WEIGHT

            medium_risk_found.append(clause)

        elif clause in LOW_RISK:

            score += LOW_RISK_WEIGHT

    score = min(score, 100)

    if high_risk_found:
        reasons.append(
            f"High-risk clauses detected: {', '.join(high_risk_found[:5])}"
        )

    if medium_risk_found:
        reasons.append(
            f"Medium-risk clauses detected: {', '.join(medium_risk_found[:5])}"
        )

    reasons.append(
        f"{len(seen_clauses)} unique clauses identified"
    )

    return score, reasons

def risk_level(
    score
):

    if score >= 70:

        return "HIGH"

    elif score >= 40:

        return "MEDIUM"

    return "LOW"