from ml.rag.contract_qa import (
    answer_question
)

result = answer_question(
    "What are the termination conditions?"
)

print()

print(
    "Question:"
)

print(
    result["question"]
)

print()

print(
    "Retrieved Chunks:"
)

print(
    result["retrieved_chunks"]
)

print()

print(
    result["answer"]
)