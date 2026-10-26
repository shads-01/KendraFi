# ADR-0003: Serverless BFF ↔ FastAPI split bridged by HMAC-SHA256 Zero-Trust headers

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

Zero-LLM-math and zero-trust rules require Python (NumPy + Gemini/Whisper) for the core loop, while the judge UI is Next.js. Browser → Python directly is unacceptable (secret exposure, injection surface).

## Decision

Keep a **Next.js BFF** (`src/app/api/kendra/*`) that signs every outbound call with **HMAC-SHA256** over `timestamp.body` (`X-ZeroTrust-Signature`, `X-ZeroTrust-Timestamp`, 30 s anti-replay) and calls **FastAPI** (`api/index.py`) at `PYTHON_RISK_ENGINE_URL`.

## Alternatives

- Direct browser → FastAPI: rejected — key management / CORS / audit complexity.
- Node backend only: rejected — NumPy / Python required by RULE 1 and Tier-0 multimodal stack.

## Consequences

Easier: judge-facing surface stays static; audit + replay protection in one place.
Harder: two runtimes to operate; secret handling must be explicit (BFF reads `ZEROTRUST_INTERNAL_HMAC_SECRET` with env fallback).
Follow-up: managed secret store before any real multi-tenant auth (Part 4).
