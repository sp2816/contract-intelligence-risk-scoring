import json

from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer
)

MODEL_NAME = "nlpaueb/legal-bert-base-uncased"

with open(
    "ml/data/processed/clause_dataset_41.json",
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)

# Create label mappings
labels = sorted({

    item["label"]

    for item in data
})

label2id = {

    label: idx

    for idx, label in enumerate(labels)
}

id2label = {

    idx: label

    for label, idx in label2id.items()
}

# Convert labels to integers
for item in data:

    item["label"] = label2id[
        item["label"]
    ]

dataset = Dataset.from_list(data)

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
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

print(
    "Number of Labels:",
    len(labels)
)

print(
    "Training Samples:",
    len(dataset["train"])
)

print(
    "Testing Samples:",
    len(dataset["test"])
)

model = AutoModelForSequenceClassification.from_pretrained(

    MODEL_NAME,

    num_labels=len(labels),

    id2label=id2label,

    label2id=label2id
)

training_args = TrainingArguments(

    output_dir="ml/transformers/models",

    eval_strategy="epoch",

    save_strategy="epoch",

    num_train_epochs=3,

    per_device_train_batch_size=8,

    per_device_eval_batch_size=8,

    logging_steps=20
)

trainer = Trainer(

    model=model,

    args=training_args,

    train_dataset=dataset["train"],

    eval_dataset=dataset["test"]
)

MODEL_PATH = (
    "ml/transformers/models/clause_classifier_40"
)

trainer.train()

trainer.save_model(
    MODEL_PATH
)

tokenizer.save_pretrained(
    MODEL_PATH
)

print(
    "\nModel Saved Successfully"
)

print(
    "Path:",
    MODEL_PATH
)