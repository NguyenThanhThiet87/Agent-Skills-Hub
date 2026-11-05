---
name: vector-search-tuner
description: >-
  Tune vector similarity indices (HNSW efSearch & M), configure Hybrid Search (BM25 + Dense embeddings),
  and apply Cross-Encoder Re-rankers to maximize Top-K relevance.
category: RAG & LLM
trigger: on_demand
parameters:
  top_k:
    type: integer
    description: Initial dense vector retrieval candidate count
    default: 20
  rerank_top_n:
    type: integer
    description: Filtered candidates after Cross-Encoder scoring
    default: 5
---

# Vector Search Tuner Runbook

Overcome semantic retrieval blindness using two-stage hybrid retrieval pipelines.

## 1. HNSW Index Tuning (Hierarchical Navigable Small World)
- **`M` (Max bidirectional links per node)**: Default `16`. Increase to `32` or `64` for high-dimensional vectors (>1024 dims).
- **`efConstruction`**: Size of dynamic candidate list during indexing. Set `200` for higher recall.
- **`efSearch`**: Exploration budget during query time. Increase from `40` to `100` if precision drops on dense clusters.

## 2. Reciprocal Rank Fusion (RRF) for Hybrid Search
```python
def reciprocal_rank_fusion(dense_ranks, bm25_ranks, k=60):
    rrf_scores = {}
    for rank, doc_id in enumerate(dense_ranks):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(bm25_ranks):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    
    # Sort descending by fused score
    return sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
```

## 3. Cross-Encoder Re-ranking
- Pass top-20 RRF candidates into `BAAI/bge-reranker-large`.
- Cut off at top-5 results; feed into LLM context window.
