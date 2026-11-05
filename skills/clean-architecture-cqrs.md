---
name: clean-architecture-cqrs
description: >-
  Structure enterprise software services with Clean Architecture and CQRS:
  separate Command (mutations) and Query (reads), decouple domain entities, and invert dependencies.
category: Fullstack
trigger: on_demand
parameters:
  pattern:
    type: string
    description: Architectural pattern (clean_architecture, cqrs, hexagonal)
    default: clean_architecture
---

# Clean Architecture & CQRS Runbook

Ensure codebase maintainability, decoupling business domains from external frameworks.

## 1. Directory Structure Layers
```
src/
├── core/                  # Pure business rules (no external framework imports)
│   ├── entities/          # Domain models (e.g. User, Skill)
│   └── use_cases/         # Application logic (e.g. CreateSkill, AuthenticateUser)
├── ports/                 # Interfaces & contracts
│   ├── repositories/      # ISkillRepository, IUserRepository
│   └── services/          # IMessageQueue, IMailer
└── adapters/              # Implementation of ports (pluggable infrastructure)
    ├── database/          # MongoSkillRepository, PostgresSkillRepository
    └── controllers/       # Express / Fastify / GraphQL controllers
```

## 2. CQRS Segregation Rule
- **Command Handlers**: Mutate state. Return minimal result (e.g. `{ id, status }`). Never return deep aggregated object graphs.
- **Query Handlers**: Read-only projections. Bypass heavy domain logic to read directly from denormalized read-models or database views for maximum throughput.
