---
name: k8s-pod-diagnostics
description: >-
  Inspect Kubernetes pod crash loops, analyze live stderr container logs,
  describe failed deployments, and suggest corrective pod spec mutations.
category: DevOps
trigger: on_demand
parameters:
  namespace:
    type: string
    description: The Kubernetes namespace
    default: default
  pod_name:
    type: string
    description: Target pod name
---

# Kubernetes Pod Diagnostics Skill

Use this skill when diagnosing pods in `CrashLoopBackOff`, `ImagePullBackOff`, or `Pending` states.

## Runbook
1. Check pod status: `kubectl get pod <pod_name> -n <namespace> -o wide`
2. Inspect pod events: `kubectl describe pod <pod_name> -n <namespace>`
3. Fetch container termination logs: `kubectl logs <pod_name> -n <namespace> --previous`
4. Summarize root cause and generate patch diff.
