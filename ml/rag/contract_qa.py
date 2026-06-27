from ml.rag.retriever import (
    retrieve_context
)

from ml.rag.simple_summarizer import (
    summarize_context
)

def answer_question(
    question
):

    context = retrieve_context(
        question,
        top_k=3
    )

    summary = summarize_context(
        context
    )

    return {

        "question": question,

        "retrieved_chunks":
        len(context),

        "answer":
        summary
    }