---
name: api-rate-limiter-redis
description: >-
  Implement distributed API rate limiting with Redis using Sliding Window Log and Token Bucket
  algorithms to prevent DDoS and API abuse.
category: Fullstack
trigger: always_on
parameters:
  max_requests:
    type: integer
    description: Maximum allowed requests within window
    default: 100
  window_seconds:
    type: integer
    description: Rate limit window duration in seconds
    default: 60
---

# API Rate Limiter Redis Runbook

Protect backend services from brute force, scraping, and downstream saturation.

## 1. Sliding Window Log Algorithm (Atomic Redis Pipeline)
```javascript
export async function checkRateLimit(redis, ip, maxRequests = 100, windowSeconds = 60) {
  const key = `rate:${ip}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);

  const pipeline = redis.pipeline();
  // 1. Remove timestamps older than current window
  pipeline.zremrangebyscore(key, 0, windowStart);
  // 2. Count requests in active window
  pipeline.zcard(key);
  // 3. Add current timestamp
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  // 4. Set TTL
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const requestCount = results[1][1];

  if (requestCount >= maxRequests) {
    return { allowed: false, remaining: 0, retryAfter: windowSeconds };
  }
  return { allowed: true, remaining: maxRequests - requestCount };
}
```

## 2. Standard HTTP 429 Response Headers
Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After: <seconds>` to inform clients.
