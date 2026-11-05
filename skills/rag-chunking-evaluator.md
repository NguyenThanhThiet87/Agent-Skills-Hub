---
name: rag-chunking-evaluator
description: >-
  Evaluate chunking strategies (Fixed, Recursive, Semantic Chunking) for Retrieval-Augmented Generation (RAG)
  and benchmark retrieval precision against vector databases.
category: RAG & LLM
trigger: on_demand
parameters:
  chunk_size:
    type: integer
    description: Maximum characters per chunk
    default: 512
  chunk_overlap:
    type: integer
    description: Character overlap window between sequential chunks
    default: 64
---

# RAG Chunking Evaluator Runbook

Select optimal document slicing boundaries to preserve semantic context in vector search.

## 1. Chunking Strategy Comparison
- **Fixed-Size (Character/Token)**: Fast but frequently severs sentences in half.
- **Recursive Character**: Splits on `["\n\n", "\n", " ", ""]` successively. Standard baseline for technical documentation.
- **Semantic Chunking**: Computes cosine distance between sequential sentences; places split boundary where semantic distance exceeds the 95th percentile threshold.

## 2. Python Semantic Splitter Implementation
```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
semantic_splitter = SemanticChunker(
    embeddings, 
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=90
)
chunks = semantic_splitter.split_text(raw_document)
```

## 3. Precision Recall Evaluation
- Benchmark with synthetic question-answer pairs: Verify that the ground-truth document chunk ranks in the Top-3 results of vector retrieval.
