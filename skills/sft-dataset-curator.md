---
name: sft-dataset-curator
description: >-
  Curate, clean, deduplicate (MinHash LSH), and format conversational SFT datasets
  into ShareGPT and ChatML structures with token packing.
category: Training
trigger: on_demand
parameters:
  format:
    type: string
    description: Target conversation format (sharegpt, chatml)
    default: sharegpt
---

# SFT Dataset Curator Runbook

Filter low-quality data and structure multi-turn dialogues for supervised fine-tuning.

## 1. ChatML / ShareGPT Conversation Schema
```json
{
  "conversations": [
    { "from": "system", "value": "You are a senior systems engineer specializing in Kubernetes." },
    { "from": "human", "value": "Why is my deployment in ImagePullBackOff?" },
    { "from": "gpt", "value": "ImagePullBackOff indicates that Kubelet failed to pull the specified container image..." }
  ]
}
```

## 2. MinHash LSH Near-Duplicate Removal
- Generate 128 MinHash permutations per document.
- Deduplicate pairs with Jaccard similarity > 0.85 to avoid training memorization and synthetic repetition loops.

## 3. Sequence Length Bucketing & Token Packing
- Group sequences of similar length into uniform batches to avoid excessive padding tokens.
- Concatenate multiple short dialogues with EOS delimiter `<|im_end|>` up to the maximum context length (4096 tokens).
