---
name: model-architecture-analyzer
description: >-
  Profile deep learning neural architectures: calculate FLOPs, MACs, parameter budgets,
  benchmark GPU inference latency, and visualize attention heatmaps with Grad-CAM.
category: Vision AI
trigger: on_demand
parameters:
  input_shape:
    type: string
    description: Input tensor dimensions (e.g. 1, 3, 640, 640)
    default: 1, 3, 640, 640
---

# Model Architecture Analyzer Runbook

Measure computational footprint and inspect latent feature representations before production deployment.

## 1. FLOPs & Parameter Budget Profiling
```python
import torch
from torchinfo import summary

def profile_model_complexity(model, input_size=(1, 3, 640, 640)):
    stats = summary(
        model, 
        input_size=input_size, 
        col_names=["num_params", "params_percent", "mult_adds", "trainable"],
        verbose=1
    )
    total_flops = stats.total_mult_adds
    total_params = stats.total_params
    print(f"Total Params: {total_params / 1e6:.2f}M | Total MACs: {total_flops / 1e9:.2f} GFLOPs")
    return stats
```

## 2. P50 / P95 Latency Benchmarking with CUDA Sync
```python
import time

def benchmark_inference(model, sample_tensor, iterations=200):
    model.eval()
    # Warm-up GPU cache
    with torch.no_grad():
        for _ in range(20):
            _ = model(sample_tensor)
    
    timings = []
    with torch.no_grad():
        for _ in range(iterations):
            torch.cuda.synchronize()
            t0 = time.perf_counter()
            _ = model(sample_tensor)
            torch.cuda.synchronize()
            timings.append((time.perf_counter() - t0) * 1000)
    
    print(f"P50: {np.percentile(timings, 50):.2f}ms | P95: {np.percentile(timings, 95):.2f}ms")
```

## 3. Grad-CAM Attention Map Visualization
- Hook into the final convolutional bottleneck layer (e.g., `model.backbone[-1]`).
- Compute gradient of score w.r.t. feature map activations to generate visual spatial importance heatmaps.
