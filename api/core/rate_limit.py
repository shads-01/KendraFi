"""
api/core/rate_limit.py
Lightweight in-memory fixed-window rate limiter for KendraFi FastAPI endpoints.
Enforces per-IP, per-scope limits and emits HTTP 429 with Retry-After header.
"""

from __future__ import annotations

import time
from typing import Callable, Dict, Tuple
from fastapi import HTTPException, Request, status

# In-memory storage: key -> (window_start_epoch, count)
_RATE_LIMIT_STORE: Dict[str, Tuple[float, int]] = {}


def clear_rate_limits() -> None:
    """Resets all in-memory rate limit counters (useful for tests)."""
    _RATE_LIMIT_STORE.clear()


def get_client_ip(request: Request) -> str:
    """Extracts client IP address safely, checking x-forwarded-for header first."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


def rate_limit(scope: str, limit: int, per_seconds: int = 60) -> Callable:
    """
    FastAPI dependency factory enforcing a fixed-window request count per client IP.
    """
    async def dependency(request: Request) -> None:
        client_ip = get_client_ip(request)
        key = f"{scope}:{client_ip}"
        now = time.time()

        window_start, count = _RATE_LIMIT_STORE.get(key, (now, 0))

        if now - window_start >= per_seconds:
            _RATE_LIMIT_STORE[key] = (now, 1)
        else:
            if count >= limit:
                retry_after = max(1, int(per_seconds - (now - window_start)))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded for scope '{scope}'. Max {limit} requests per {per_seconds}s. Retry after {retry_after}s.",
                    headers={"Retry-After": str(retry_after)},
                )
            _RATE_LIMIT_STORE[key] = (window_start, count + 1)

    return dependency
