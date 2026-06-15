import spacy

nlp = spacy.load("en_core_web_sm")


TARGET_ENTITIES = {
    "ORG",
    "DATE",
    "MONEY",
    "PERSON",
    "GPE"
}


def extract_entities(text):

    doc = nlp(text)

    results = []

    for ent in doc.ents:

        if ent.label_ in TARGET_ENTITIES:

            results.append({
                "text": ent.text,
                "label": ent.label_
            })

    return results