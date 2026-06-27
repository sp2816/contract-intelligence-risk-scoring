def summarize_context(
    chunks
):

    summary = ""

    for chunk in chunks:

        summary += chunk[:300]

        summary += "\n\n"

    return summary