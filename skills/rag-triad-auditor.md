---
name: rag-triad-auditor
description: >-
  Audit RAG systems using the Ragas Triad metrics: Context Relevance, Groundedness
  (Faithfulness / Hallucination Detection), and Answer Relevance.
category: RAG & LLM
trigger: always_on
parameters:
  min_faithfulness_score:
    type: float
    description: Minimum score (0.0 - 1.0) required to pass audit
    default: 0.85
---

# RAG Triad Auditor Runbook

Automated evaluation framework for measuring RAG quality before deploying to end users.

## 1. The Three RAG Pillars
1. **Context Relevance**: Did the vector retrieval fetch context that actually pertains to the user's question?
2. **Groundedness (Faithfulness)**: Can every factual claim in the LLM's answer be directly verified by the retrieved context? (Measures hallucination rate).
3. **Answer Relevance**: Did the final response directly answer what the user asked without rambling?

## 2. Ragas Evaluation Implementation
```python
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision

def audit_rag_pipeline(test_records):
    # test_records: {"question": [...], "contexts": [...], "answer": [...], "ground_truth": [...]}
    dataset = Dataset.from_dict(test_records)
    scores = evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_precision]
    )
    print(f"Faithfulness: {scores['faithfulness']:.3f}")
    print(f"Answer Relevance: {scores['answer_relevancy']:.3f}")
    return scores
```
