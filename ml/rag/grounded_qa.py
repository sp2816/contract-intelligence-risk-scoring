from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM
)

from ml.rag.retriever import (
    retrieve_context
)

model_name = "google/flan-t5-base"

tokenizer = AutoTokenizer.from_pretrained(
    model_name
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    model_name
)


def answer_question(
    question
):

    context = retrieve_context(
        question,
        top_k=5
    )

    question_lower = question.lower()

    if "termination" in question_lower:

        filtered_context = []

        for chunk in context:

            chunk_lower = chunk.lower()

            if (
                "terminate" in chunk_lower
                or "termination" in chunk_lower
                or "cancel" in chunk_lower
                or "breach" in chunk_lower
            ):

                filtered_context.append(
                    chunk
                )

        if filtered_context:

            context = filtered_context

    context_text = "\n\n".join(
        context
    )

    prompt = f"""
You are a legal contract assistant.

Using ONLY the provided contract context,
answer the question in a concise bullet list.

Do not make up information.

If the answer is not found in the context,
say "Information not found in provided context."

Question:
{question}

Contract Context:
{context_text}

Answer:
"""

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )

    outputs = model.generate(
        **inputs,
        max_new_tokens=200,
        num_beams=4,
        early_stopping=True
    )

    answer = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    return {

        "question":
        question,

        "retrieved_chunks":
        len(context),

        "answer":
        answer,

        "sources":
        context
    }