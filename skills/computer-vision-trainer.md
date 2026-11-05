---
name: computer-vision-trainer
description: >-
  Train and fine-tune modern computer vision models (YOLOv8/v11, RT-DETR, Vision Transformers, ConvNeXt)
  using transfer learning, AMP fp16, and Cosine Annealing learning rate schedules.
category: Vision AI
trigger: on_demand
parameters:
  model_architecture:
    type: string
    description: Target CV backbone (yolov8x, rt_detr_l, vit_base_patch16_224, convnext_base)
    default: yolov8x
  batch_size:
    type: integer
    description: GPU batch size per replica
    default: 16
---

# Computer Vision Trainer Runbook

End-to-end training procedure for state-of-the-art object detection and image classification backbones.

## 1. Ultralytics YOLOv8 / YOLOv11 Training Script
```python
from ultralytics import YOLO

def train_detector(data_yaml="dataset.yaml", epochs=150, imgsz=640):
    model = YOLO("yolov8m.pt")  # Pretrained backbone
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=16,
        patience=20,
        save=True,
        device=0,
        amp=True,              # Automatic Mixed Precision fp16
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,              # Cosine decay down to 1% of lr0
        weight_decay=0.0005,
        warmup_epochs=3.0,
        cos_lr=True,
        close_mosaic=10        # Disable mosaic for last 10 epochs for fine gradient convergence
    )
    return results
```

## 2. Vision Transformer (ViT) & Timm Fine-Tuning
- Freeze early patch embedding layers for the first 3 epochs:
  `for p in model.patch_embed.parameters(): p.requires_grad = False`
- Employ Exponential Moving Average (EMA) with decay rate `0.999` to stabilize validation weights.
