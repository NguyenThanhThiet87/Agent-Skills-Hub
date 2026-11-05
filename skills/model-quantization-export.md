---
name: model-quantization-export
description: >-
  Merge PEFT LoRA weights into base models and quantize for production deployment:
  GGUF (for Ollama / llama.cpp) and AWQ / GPTQ (for high-throughput vLLM serving).
category: Training
trigger: on_demand
parameters:
  quant_method:
    type: string
    description: Quantization target (gguf_q4_k_m, awq_4bit, gptq_4bit)
    default: gguf_q4_k_m
---

# Model Quantization & Export Runbook

Convert trained PyTorch checkpoints into high-throughput inference artifacts.

## 1. Merge LoRA Adapter into 16-bit Base Model
```python
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B-Instruct")
model = PeftModel.from_pretrained(base_model, "./my_lora_checkpoint")

# Permanently fuse weights into floating point tensor
merged_model = model.merge_and_unload()
merged_model.save_pretrained("./merged_model_16bit")
```

## 2. Exporting to GGUF (for Ollama & Local CPU/GPU)
```bash
# 1. Convert Hugging Face weights to raw GGUF
python llama.cpp/convert_hf_to_gguf.py ./merged_model_16bit --outfile model.fp16.gguf

# 2. Quantize to Q4_K_M (optimal balance between perplexity and speed)
./llama.cpp/llama-quantize model.fp16.gguf model.Q4_K_M.gguf Q4_K_M

# 3. Create Ollama Model file:
# FROM ./model.Q4_K_M.gguf
# ollama create my-assistant -f Modelfile
```

## 3. AutoAWQ 4-bit Quantization (for vLLM)
- Reduces latency by 3x on NVIDIA GPUs while retaining full KV Cache paging via vLLM PagedAttention.
