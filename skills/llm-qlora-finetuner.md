---
name: llm-qlora-finetuner
description: >-
  Fine-tune open LLMs (Llama 3, Qwen 2.5, Mistral, Gemma 2) using 4-bit QLoRA,
  PEFT LoRA adapters, Unsloth, and Hugging Face TRL to minimize VRAM consumption.
category: Training
trigger: on_demand
parameters:
  base_model:
    type: string
    description: HuggingFace model repo ID
    default: unsloth/Qwen2.5-7B-Instruct-bnb-4bit
  lora_r:
    type: integer
    description: LoRA rank dimension
    default: 16
  lora_alpha:
    type: integer
    description: LoRA scaling factor (typically 2x rank)
    default: 32
---

# LLM QLoRA Fine-Tuner Runbook

Memory-efficient parameter-efficient fine-tuning protocol for generative language models.

## 1. Fast QLoRA Setup with Unsloth / TRL
```python
from unsloth import FastLanguageModel
import torch

def setup_qlora_model(model_name="unsloth/Qwen2.5-7B-Instruct-bnb-4bit", max_seq_length=2048):
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=model_name,
        max_seq_length=max_seq_length,
        load_in_4bit=True,
        dtype=None
    )
    
    # Configure LoRA targets
    model = FastLanguageModel.get_peft_model(
        model,
        r=16,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_alpha=32,
        lora_dropout=0,      # Set 0 when using Unsloth kernel optimizations
        bias="none",
        use_gradient_checkpointing="unsloth"
    )
    return model, tokenizer
```

## 2. Supervised Training Loop Configuration
- **Optimizer**: `paged_adamw_8bit` (offloads optimizer states during high batch peaks).
- **Learning Rate**: `2e-4` with warmup for 5% of total steps and cosine decay down to `1e-5`.
- **Packing**: Enable `dataset_text_field="text", packing=True` to eliminate waste on padding tokens.
