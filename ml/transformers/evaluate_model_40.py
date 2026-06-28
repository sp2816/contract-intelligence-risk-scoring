import json

from datasets import Dataset

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer
)

from sklearn.metrics import (

    accuracy_score,

    precision_recall_fscore_support
)

MODEL_PATH = (
    "ml/transformers/models/clause_classifier_40"
)

with open(
    "ml/data/processed/clause_dataset_40.json",
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)

labels = sorted({

    item["label"]

    for item in data
})

label2id = {

    label: idx

    for idx, label in enumerate(labels)
}

for item in data:

    item["label"] = label2id[
        item["label"]
    ]

dataset = Dataset.from_list(data)

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH
)


def tokenize(batch):

    return tokenizer(

        batch["text"],

        truncation=True,

        padding="max_length",

        max_length=256
    )


dataset = dataset.map(
    tokenize
)

dataset = dataset.rename_column(
    "label",
    "labels"
)

dataset.set_format(
    "torch",
    columns=[
        "input_ids",
        "attention_mask",
        "labels"
    ]
)

dataset = dataset.train_test_split(

    test_size=0.2,

    seed=42
)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH
)

trainer = Trainer(
    model=model
)

predictions = trainer.predict(
    dataset["test"]
)

preds = predictions.predictions.argmax(-1)

labels = predictions.label_ids

accuracy = accuracy_score(
    labels,
    preds
)

precision, recall, f1, _ = (

    precision_recall_fscore_support(

        labels,

        preds,

        average="weighted"
    )
)

print("\nAccuracy :", round(accuracy, 4))

print("Precision:", round(precision, 4))

print("Recall   :", round(recall, 4))

print("F1 Score :", round(f1, 4))