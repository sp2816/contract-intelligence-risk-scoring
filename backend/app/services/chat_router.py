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

GREETINGS = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "greetings"
]

THANKS = [
    "thanks",
    "thank you",
    "thankyou",
    "thanks a lot"
]

GOODBYES = [
    "bye",
    "goodbye",
    "see you",
    "see ya",
    "take care"
]

LEGAL_KEYWORDS = [
    "contract",
    "agreement",
    "clause",
    "termination",
    "confidentiality",
    "nda",
    "indemnification",
    "liability",
    "payment",
    "force majeure",
    "risk",
    "legal",
    "compliance",
    "entity",
    "party",
    "obligation",
    "governing law",
    "breach",
    "summary",
    "analyze",
    "analyse"
]

def is_database_question(question):
    q = question.lower()
    return any(keyword in q for keyword in DATABASE_KEYWORDS)


def is_greeting(question):
    q = question.lower()
    return any(word in q for word in GREETINGS)


def is_legal_question(question):
    q = question.lower()
    return any(word in q for word in LEGAL_KEYWORDS)

def is_thanks(question):
    q = question.lower()
    return any(word in q for word in THANKS)


def is_goodbye(question):
    q = question.lower()
    return any(word in q for word in GOODBYES)

def greeting_response(question):

    q = question.lower()

    if "good morning" in q:
        return (
            "Good morning! ☀️\n\n"
            "Welcome to ContractMind AI Legal Assistant.\n\n"
            "How can I help you with your contracts today?"
        )

    if "good afternoon" in q:
        return (
            "Good afternoon! 🌤️\n\n"
            "I'm ready to assist you with contract analysis, clause explanations, and legal insights."
        )

    if "good evening" in q:
        return (
            "Good evening! 🌙\n\n"
            "How can I assist you with your legal documents today?"
        )

    return (
        "Hello! 👋\n\n"
        "I'm your AI Legal Assistant.\n\n"
        "I can help analyze contracts, explain clauses, review risks, summarize agreements, and answer questions about the contracts stored in your workspace."
    )

def route_question(question):

    if is_greeting(question):

        return {
            "type": "greeting",
            "answer": greeting_response(question)
        }

    if is_thanks(question):

        return {
            "type": "thanks",
            "answer":
                "You're welcome! 😊\n\n"
                "I'm always here if you need help reviewing contracts or understanding legal clauses."
        }

    if is_goodbye(question):

        return {
            "type": "goodbye",
            "answer":
                "Goodbye! 👋\n\n"
                "Thank you for using ContractMind AI Legal Assistant.\n"
                "Have a wonderful day, and feel free to return whenever you need help with contracts."
        }

    if is_database_question(question):

        return {
            "type": "database",
            "answer": answer_database_question(question)
        }

    if is_legal_question(question):

        return {
            "type": "rag"
        }

    return {
        "type": "out_of_domain",
        "answer":
            "I'm specialized in **Contract Intelligence and Legal Document Analysis**.\n\n"
            "I can't answer general questions outside this domain.\n\n"
            "You can ask me things like:\n\n"
            "• Explain the termination clause\n"
            "• Summarize confidentiality obligations\n"
            "• Draft a compliance checklist\n"
            "• Which contract has the highest risk score?\n"
            "• Show recent contracts\n"
            "• Compare two agreements\n"
            "• Explain indemnification clauses"
    }