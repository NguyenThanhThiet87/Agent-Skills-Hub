---
name: jwt-security-audit
description: >-
  Audit JWT and OAuth 2.0 authentication flows: implement Refresh Token Rotation,
  detect token theft/reuse, and configure secure HTTP-only cookies.
category: Fullstack
trigger: always_on
parameters:
  access_token_ttl_seconds:
    type: integer
    description: Expiration duration for access tokens
    default: 900
---

# JWT Security Audit Runbook

Harden authentication architectures against token hijacking and replay attacks.

## 1. Refresh Token Rotation with Reuse Detection
1. Issue short-lived `access_token` (15 mins) and one-time-use `refresh_token` (7 days).
2. Store `refresh_token` family IDs in database.
3. When client refreshes: Invalidate old token and issue new token pair.
4. **Breach Detection**: If an invalidated refresh token is ever submitted again, IMMEDIATELY revoke all tokens in the entire family ID (assumes attacker intercepted token).

## 2. Cookie Security Flags
Always set:
- `HttpOnly: true` (prevents XSS theft via JavaScript).
- `Secure: true` (transmitted only over HTTPS).
- `SameSite: Strict` (eliminates Cross-Site Request Forgery).
