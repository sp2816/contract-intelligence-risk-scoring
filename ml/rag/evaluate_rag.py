from ml.rag.grounded_qa import (
    answer_question
)

from ml.rag.test_questions import (
    QUESTIONS
)

for question in QUESTIONS:

    result = answer_question(
        question
    )

    print("\n" + "=" * 80)

    print("QUESTION:")
    print(question)

    print("\nANSWER:")
    print(result["answer"])

    print("\nRETRIEVED CHUNKS:")
    print(result["retrieved_chunks"])

    print("\nSOURCES:")

    for i, source in enumerate(
        result["sources"],
        start=1
    ):

        print(f"\nSource {i}")

        print(source[:300])