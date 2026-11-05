---
name: docstring-generator
description: >-
  Inspect undocumented functions, classes, and types to generate comprehensive
  Google-style or JSDoc docstrings with parameter types and return contracts.
category: Coding
trigger: on_demand
parameters:
  style:
    type: string
    description: Docstring convention (google, numpy, jsdoc)
    default: google
---

# Docstring Generator Runbook

Enforce documentation standards across codebases without altering logic.

## Guidelines
1. Parse AST to locate public functions lacking docstrings.
2. Infer types from type annotations and default values.
3. Formulate concise one-line summary followed by parameter descriptions and returns clause.
