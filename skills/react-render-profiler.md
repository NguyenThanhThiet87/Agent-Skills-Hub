---
name: react-render-profiler
description: >-
  Profile React application rendering performance using React DevTools Flamegraphs,
  diagnose memory leaks, and eliminate unnecessary component re-renders.
category: Fullstack
trigger: on_demand
parameters:
  inspect_hooks:
    type: boolean
    description: Enable deep inspection of useCallback/useMemo dependency arrays
    default: true
---

# React Render Profiler Runbook

Eliminate UI jank, frame drops, and memory accumulation in production React applications.

## 1. Top 3 Re-render Culprits
1. **Unstable Object/Array Literals in Props**: Passing `<Component style={{ margin: 10 }} />` creates a new object reference on every render, invalidating `React.memo`.
2. **Missing Cleanup in `useEffect`**: Event listeners, intervals, and WebSocket subscriptions not cleared on unmount.
3. **Over-Broad State Context**: Placing rapidly changing state (e.g. mouse position, scroll progress) into top-level context triggers full component tree re-renders.

## 2. Flamegraph Profiling Protocol
- Record user interaction in React DevTools Profiler.
- Look for wide yellow bars indicating long render times.
- Check "Why did this render?" badge to identify the specific prop that changed reference.
