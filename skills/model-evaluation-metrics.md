---
name: model-evaluation-metrics
description: >-
  Evaluate computer vision and deep learning models with mAP@50, mAP@50:95, IoU,
  Normalized Confusion Matrices, and hard-example mining.
category: Vision AI
trigger: on_demand
parameters:
  iou_threshold:
    type: float
    description: Minimum Intersection over Union for true positive
    default: 0.50
---

# Model Evaluation Metrics Runbook

Rigorous auditing protocols for classification, object detection, and segmentation models.

## 1. Object Detection Metrics Protocol
- **mAP@50**: Mean Average Precision calculated at IoU threshold = 0.50 (General detection capability).
- **mAP@50:95**: Averaged mAP over 10 IoU steps (0.50 to 0.95 with step 0.05). Essential for localization precision.
- **Per-Class Precision-Recall Curve**: Inspect classes where AUC dips below 0.70 to diagnose class imbalance.

## 2. Normalized Confusion Matrix & Hard-Example Mining
```python
import numpy as np

def extract_hard_negative_indices(predictions, ground_truths, loss_fn, top_k=50):
    losses = []
    for pred, gt in zip(predictions, ground_truths):
        l = loss_fn(pred, gt).item()
        losses.append(l)
    
    # Sort samples by descending loss
    hardest_indices = np.argsort(losses)[::-1][:top_k]
    return hardest_indices
```

## 3. Decision Boundary Calibration
- Plot Reliability Diagram (Observed Frequency vs Confidence Bin).
- Apply Temperature Scaling if the model demonstrates overconfidence on out-of-distribution test sets.
