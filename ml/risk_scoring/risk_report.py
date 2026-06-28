def generate_risk_report(
    score,
    level,
    reasons
):

    report = []

    report.append(
        "CONTRACT RISK ASSESSMENT"
    )

    report.append(
        "=" * 40
    )

    report.append(
        f"Risk Score: {score}"
    )

    report.append(
        f"Risk Level: {level}"
    )

    report.append("")

    report.append(
        "Detected Clauses:"
    )

    for reason in reasons:

        report.append(
            f"- {reason}"
        )

    report.append("")

    report.append(
        "Recommendations:"
    )

    if level == "HIGH":

        report.append(
            "- Immediate legal review recommended."
        )

    elif level == "MEDIUM":

        report.append(
            "- Review highlighted clauses before signing."
        )

    else:

        report.append(
            "- No major contractual risks detected."
        )

    return "\n".join(
        report
    )