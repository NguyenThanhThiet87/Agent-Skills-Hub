---
name: deep-learning-debugger
description: >-
  Diagnose and resolve deep learning training failures: NaN loss, exploding gradients,
  overfitting, data leakage, and learning rate scheduler synchronization.
category: Vision AI
trigger: always_on
parameters:
  max_norm:
    type: float
    description: Gradient clipping norm threshold
    default: 1.0
---

# Deep Learning Debugger Runbook

Systematic troubleshooting guide for neural network training instabilities and silent failures.

## 1. Resolving NaN Loss & Exploding Gradients
```python
import torch

# Step A: Enable PyTorch anomaly detection to pinpoint exact failing tensor operation
torch.autograd.set_detect_anomaly(True)

# Step B: Clip gradient norm prior to optimizer step
loss.backward()
grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
if torch.isnan(grad_norm) or torch.isinf(grad_norm):
    print("WARNING: Encountered NaN/Inf gradient! Skipping batch...")
    optimizer.zero_grad()
else:
    optimizer.step()
```

## 2. Common Causes of NaN Loss in Vision Models
1. **Unbounded Bounding Box Coordinates**: Negative width/height or `x2 < x1` in regression targets (CIoU / GIoU losses divide by zero when union area is zero).
2. **Logit Saturation in Mixed Precision**: `float16` overflows to `inf` when logits exceed 65504. Use `bfloat16` on modern Ampere/Hopper GPUs or clamp logits.
3. **Log of Zero in CrossEntropy**: Verify that background class weights are strictly positive and targets do not contain `-1` or out-of-range class indices.

## 3. Detecting Train-Validation Data Leakage
- Compute perceptual hashes (pHash) across dataset splits to verify zero duplicate frames from video sequence captures exist across train and validation sets.
