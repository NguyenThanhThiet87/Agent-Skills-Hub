---
name: llm-dpo-alignment
description: >-
  Align LLMs to follow organizational style and safety constraints using Direct Preference
  Optimization (DPO) and Odds Ratio Preference Optimization (ORPO) without reward models.
category: Training
trigger: on_demand
parameters:
  beta:
    type: float
    description: DPO temperature hyperparameter controlling divergence penalty
    default: 0.1
---

# LLM DPO Alignment Runbook

Direct Preference Optimization protocol for aligning supervised fine-tuned models to human preferences.

## 1. Preference Dataset Triplet Structure
Every record requires prompt, chosen answer, and rejected answer:
```json
{
  "prompt": "Write a concise explanation of TCP 3-way handshake.",
  "chosen": "TCP establishes a connection via SYN, SYN-ACK, and ACK packets...",
  "rejected": "Sure! I would be delighted to help you understand computer networking in great detail. The internet was invented..."
}
```

## 2. DPOTrainer Setup (HuggingFace TRL)
```python
from trl import DPOTrainer, DPOConfig

training_args = DPOConfig(
    learning_rate=5e-7,
    beta=0.1,                 # Regularization constraint against reference model
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    warmup_ratio=0.1,
    logging_steps=10,
    output_dir="./dpo_aligned_model"
)

dpo_trainer = DPOTrainer(
    model=model,
    ref_model=None,           # Automatically creates reference copy when PEFT is enabled
    args=training_args,
    train_dataset=dpo_dataset,
    tokenizer=tokenizer
)
dpo_trainer.train()
```
