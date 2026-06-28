def generate_summary(
    score,
    level,
    reasons
):

    summary = []

    summary.append(
        f"Risk Score: {score}"
    )

    summary.append(
        f"Risk Level: {level}"
    )

    summary.append(
        "\nReasons:"
    )

    for reason in reasons:

        summary.append(
            f"- {reason}"
        )

    return "\n".join(
        summary
    )