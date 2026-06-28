# ml/data/inspect_labels.py

import os

folder = "ml/data/processed"

for file in os.listdir(folder):

    if file.endswith(".json"):

        print(file)