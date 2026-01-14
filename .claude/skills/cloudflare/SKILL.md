---
name: cloudflare
description: Comprehensive Cloudflare platform skill covering Workers, Pages, storage (KV, D1, R2), AI (Workers AI, Vectorize, Agents SDK), networking (Tunnel, Spectrum), security (WAF, DDoS), and infrastructure-as-code (Terraform, Pulumi). Use for any Cloudflare development task.
---

# Cloudflare Platform Skill

Consolidated skill for building on the Cloudflare platform.

**Reference files located at:** `~/.config/opencode/skill/cloudflare/references/`

## How to Use This Skill

### Reference File Structure

Each product in `references/<product>/` contains a `README.md` as entry point:

**Multi-file format:**
| File | Purpose | When to Read |
|------|---------|--------------|
| `README.md` | Overview, when to use, getting started | **Always read first** |
| `api.md` | Runtime API, types, method signatures | Writing code |
| `configuration.md` | wrangler.toml, bindings, setup | Configuring a project |
| `patterns.md` | Common patterns, best practices | Implementation guidance |
| `gotchas.md` | Pitfalls, limitations, edge cases | Debugging, avoiding mistakes |

### Reading Order

1. Start with `README.md`
2. Then read additional files relevant to your task:
   - Building feature → `api.md` + `patterns.md`
   - Setting up project → `configuration.md`
   - Troubleshooting → `gotchas.md`

## Quick Decision Trees

### "I need to run code"

```
├─ Serverless functions at the edge → workers/
├─ Full-stack web app with Git deploys → pages/
├─ Stateful coordination/real-time → durable-objects/
├─ Long-running multi-step jobs → workflows/
├─ Run containers → containers/
├─ Multi-tenant (customers deploy code) → workers-for-platforms/
└─ Scheduled tasks (cron) → cron-triggers/
```

### "I need to store data"

```
├─ Key-value (config, sessions, cache) → kv/
├─ Relational SQL → d1/ (SQLite) or hyperdrive/ (existing Postgres/MySQL)
├─ Object/file storage (S3-compatible) → r2/
├─ Message queue (async processing) → queues/
├─ Vector embeddings (AI/semantic search) → vectorize/
├─ Strongly-consistent per-entity state → durable-objects/
└─ Secrets management → secrets-store/
```

### "I need AI/ML"

```
├─ Run inference (LLMs, embeddings, images) → workers-ai/
├─ Vector database for RAG/search → vectorize/
├─ Build stateful AI agents → agents-sdk/
├─ Gateway for any AI provider (caching, routing) → ai-gateway/
└─ AI-powered search widget → ai-search/
```

### "I need networking/connectivity"

```
├─ Expose local service to internet → tunnel/
├─ TCP/UDP proxy (non-HTTP) → spectrum/
├─ WebRTC TURN server → turn/
└─ Optimize routing → argo-smart-routing/
```

### "I need security"

```
├─ Web Application Firewall → waf/
├─ DDoS protection → ddos/
├─ Bot detection/management → bot-management/
├─ API protection → api-shield/
└─ CAPTCHA alternative → turnstile/
```

### "I need infrastructure-as-code"

```
├─ Pulumi → pulumi/
├─ Terraform → terraform/
└─ Direct API → api/
```
