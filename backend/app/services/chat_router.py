from services.database_chat import answer_database_question

DATABASE_KEYWORDS = [
    "highest risk",
    "lowest risk",
    "highest",
    "lowest",
    "average",
    "average risk",
    "risk score",
    "contracts",
    "uploaded",
    "how many",
    "count",
    "statistics",
    "dashboard",
    "recent",
    "list contracts",
    "total contracts"
]


def is_database_question(question: str):
    q = question.lower()

    return any(keyword in q for keyword in DATABASE_KEYWORDS)


def route_question(question: str):
    """
    Returns:
        {
            "type": "database" | "rag",
            "answer": ...
        }
    """

    if is_database_question(question):
        return {
            "type": "database",
            "answer": answer_database_question(question)
        }

    return {
        "type": "rag"
    }