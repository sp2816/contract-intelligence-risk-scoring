import spacy

nlp = spacy.load("en_core_web_sm")

text = """
This Agreement is entered into on June 21, 1999
between I-ESCROW, INC. and 2THEMART.COM, INC.
for $50,000.
"""

doc = nlp(text)

for ent in doc.ents:
    print(ent.text, "->", ent.label_)