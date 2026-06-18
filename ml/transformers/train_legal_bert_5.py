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
    "ml/data/processed/clause_dataset.json",
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)

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


dataset = dataset.map(tokenize)

dataset = dataset.train_test_split(
    test_size=0.2,
    seed=42
)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=5
)

training_args = TrainingArguments(

    output_dir="ml/transformers/models",

    eval_strategy="epoch",

    save_strategy="epoch",

    num_train_epochs=2,

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
    "ml/transformers/models/clause_classifier"
)

trainer.train()

trainer.save_model(
    MODEL_PATH
)

tokenizer.save_pretrained(
    MODEL_PATH
)