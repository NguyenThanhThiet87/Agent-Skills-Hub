---
name: vision-data-augmentation
description: >-
  Build robust computer vision data augmentation pipelines with Albumentations,
  preserving bounding boxes and segmentation masks using Mosaic, MixUp, and CLAHE.
category: Vision AI
trigger: on_demand
parameters:
  format:
    type: string
    description: Bounding box format (yolo, pascal_voc, coco)
    default: yolo
  use_mosaic:
    type: boolean
    description: Enable 4-image mosaic compositing
    default: true
---

# Vision Data Augmentation Runbook

Design high-variance image augmentation pipelines to prevent overfitting on small vision datasets.

## 1. Albumentations Pipeline Configuration
```python
import albumentations as A
import cv2

def get_train_pipeline(img_size=640, bbox_format='yolo'):
    return A.Compose([
        A.RandomResizedCrop(img_size, img_size, scale=(0.8, 1.0), p=1.0),
        A.HorizontalFlip(p=0.5),
        A.OneOf([
            A.MotionBlur(blur_limit=5, p=0.5),
            A.GaussianBlur(blur_limit=(3, 7), p=0.5),
            A.GaussNoise(var_limit=(10.0, 50.0), p=0.5),
        ], p=0.4),
        A.OneOf([
            A.CLAHE(clip_limit=3.0, tile_grid_size=(8, 8), p=0.5),
            A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05, p=0.5),
        ], p=0.5),
        A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.1, rotate_limit=15, border_mode=cv2.BORDER_CONSTANT, p=0.5)
    ], bbox_params=A.BboxParams(format=bbox_format, label_fields=['class_labels'], min_visibility=0.25))
```

## 2. Advanced Mosaic 4-Image Composition
1. Load 4 random images and scale onto a `2 * img_size` canvas around an offset center point.
2. Clip bounding coordinates within the merged canvas frame.
3. Apply random perspective jitter to reduce spatial bias.

## 3. Mask & Keypoint Preservation Rule
- Always specify `min_visibility=0.2` to automatically drop bounding boxes truncated by edge cropping.
