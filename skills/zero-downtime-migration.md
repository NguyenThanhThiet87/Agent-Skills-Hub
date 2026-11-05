---
name: zero-downtime-migration
description: >-
  Execute zero-downtime database schema migrations for PostgreSQL and MongoDB
  using the Expand and Contract (Parallel Run) pattern.
category: Fullstack
trigger: on_demand
parameters:
  database_type:
    type: string
    description: Target database engine (postgresql, mongodb)
    default: postgresql
---

# Zero-Downtime Database Migration Runbook

Eliminate service outages during major database schema transformations.

## The 4-Phase Expand & Contract Pattern

### Phase 1: Expand (Additive Schema Change)
- Create new column/collection alongside old one without removing anything.
- Example: `ALTER TABLE users ADD COLUMN phone_e164 VARCHAR(20);`

### Phase 2: Dual-Writing (Application Layer)
- Deploy application update:
  - Write new data to BOTH old column and new column.
  - Read from old column as source of truth.

### Phase 3: Backfill Background Job
- Run batch script to copy historical data from old column to new column in chunks:
  `UPDATE users SET phone_e164 = format_phone(phone_old) WHERE phone_e164 IS NULL LIMIT 1000;`

### Phase 4: Contract (Switch & Prune)
- Switch application read pointer to new column.
- Verify stability for 48 hours.
- Prune/drop old column safely without locking active transactions.
