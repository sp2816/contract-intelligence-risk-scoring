from ml.ner.contract_entities import (
    extract_entities
)

text = """
This Agreement was entered into on
May 8, 2014 between Microsoft Corporation
and Google LLC.
"""

entities = extract_entities(text)

for entity in entities:

    print(entity)