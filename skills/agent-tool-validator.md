---
name: agent-tool-validator
description: >-
  Validate AI Agent Tool schemas (MCP / Model Context Protocol), implement robust error
  recovery protocols, and prevent catastrophic hallucinated function calls.
category: RAG & LLM
trigger: on_demand
parameters:
  strict_validation:
    type: boolean
    description: Reject extra undefined properties in tool calls
    default: true
---

# Agent Tool Validator Runbook

Harden tool definitions and handle tool execution exceptions for autonomous agents.

## 1. Tool Schema Best Practices
- Every tool parameter MUST have a clear `description` explaining units, formatting, and expected bounds.
- Use `enum` fields whenever the allowed values are finite (e.g. `['json', 'yaml', 'table']`).
- Provide explicit fallback instructions: If input is ambiguous, instruct tool to return a helpful error rather than guessing.

## 2. Defensive Tool Execution Wrapper
```javascript
export async function executeSafeTool(toolFn, args, schema) {
  try {
    // 1. Zod schema validation
    const parsedArgs = schema.parse(args);
    return await toolFn(parsedArgs);
  } catch (err) {
    // 2. Return constructive guidance instead of crashing the agent loop
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Tool call failed: ${err.message}. Please verify the required parameters and try again.`
      }]
    };
  }
}
```
