---
name: gpu-oom-debugger
description: >-
  Calculate GPU VRAM requirements, profile memory allocation, and resolve CUDA Out of Memory
  errors during deep learning and LLM training using DeepSpeed ZeRO and PyTorch FSDP.
category: Training
trigger: always_on
parameters:
  model_params_billions:
    type: float
    description: Model size in billions of parameters (e.g. 7.0)
    default: 7.0
---

# GPU VRAM & OOM Debugger Runbook

Formulaic guide to calculating training VRAM budgets and eliminating memory fragmentation.

## 1. VRAM Consumption Formulas (Full 16-bit Training)
- **Model Weights (fp16)**: `params_billions * 2 GB` (e.g. 7B = 14 GB)
- **Gradients (fp16)**: `params_billions * 2 GB` (14 GB)
- **Optimizer States (AdamW fp32)**: `params_billions * 12 GB` (84 GB!)
- **Total Static Weights**: `params_billions * 16 GB` -> **112 GB** for a 7B model before activations!

## 2. Strategies to Fit into Consumer / Single GPUs
| Technique | Reduction Factor | VRAM for 7B |
| :--- | :--- | :--- |
| **Vanilla fp16** | 1.0x | ~120 GB |
| **LoRA (r=16)** | Keeps base model frozen | ~18 GB |
| **QLoRA (4-bit NF4)** | Weights in 4-bit + 8-bit Adam | **~5.5 GB** (Fits 8GB RTX GPU!) |
| **DeepSpeed ZeRO-3** | Shards weights/optimizer across N GPUs | Linear scaling |

## 3. Immediate PyTorch OOM Remediation
```python
import torch

# 1. Enable activation checkpointing (saves activations to recalculate on backward pass)
model.gradient_checkpointing_enable()

# 2. Free up PyTorch memory allocator cache
torch.cuda.empty_cache()

# 3. Configure PyTorch memory allocator to avoid fragmentation in ~/.bashrc or script
import os
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
```
