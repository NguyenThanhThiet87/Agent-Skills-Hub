---
name: docker-multistage-optimizer
description: >-
  Optimize Docker containers using multi-stage builds, Distroless and Alpine base images,
  caching layers, and non-root security enforcement to shrink image size from 1.2GB to <90MB.
category: Fullstack
trigger: on_demand
parameters:
  runtime_base:
    type: string
    description: Production container base image (gcr.io/distroless/nodejs20-debian12, node:20-alpine)
    default: gcr.io/distroless/nodejs20-debian12
---

# Docker Multi-Stage Optimizer Runbook

Shrink container attack surfaces and build times for cloud deployment.

## Production Node.js Dockerfile
```dockerfile
# Stage 1: Dependency resolution & build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && cp -R node_modules /prod_node_modules
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimalist Distroless runtime (< 90MB)
FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /app
COPY --from=builder /prod_node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER nonroot
EXPOSE 8080
ENV NODE_ENV=production
CMD ["dist/server.js"]
```
