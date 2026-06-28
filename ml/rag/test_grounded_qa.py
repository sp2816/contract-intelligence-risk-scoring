from ml.rag.grounded_qa import (
    answer_question
)

questions = [

    "What are the termination conditions?",

    "Who are the parties?",

    "What licenses are granted?",

    "Is there an exclusivity clause?",

    "What is the governing law?"
]

for question in questions:

    result = answer_question(
        question
    )

    print("\n" + "=" * 80)

    print(
        "\nQuestion:"
    )

    print(
        result["question"]
    )

    print(
        "\nRetrieved Chunks:"
    )

    print(
        result["retrieved_chunks"]
    )

    print(
        "\nAnswer:"
    )

    print(
        result["answer"]
    )