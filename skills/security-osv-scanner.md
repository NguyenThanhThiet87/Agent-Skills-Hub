---
name: security-osv-scanner
description: >-
  Scan package lockfiles against the Open Source Vulnerabilities (OSV) database
  to identify CVEs, unpatched dependencies, and remediation diffs.
category: Security
trigger: always_on
parameters:
  severity_threshold:
    type: string
    description: Minimum CVE severity to flag (LOW, MEDIUM, HIGH, CRITICAL)
    default: HIGH
---

# Security OSV Scanner Runbook

Proactively scan software bills of materials (SBOM) and dependency locks for known CVEs.

## Detection & Remediation
1. Run local scanner against lockfiles: `osv-scanner --lockfile=package-lock.json`
2. Cross-reference CVE IDs against upstream advisories.
3. Propose minimal version bumps that patch vulnerabilities without breaking API changes.
