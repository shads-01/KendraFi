"""
api/core/zerotrust_guard.py
Zero-Trust HMAC-SHA256 Inter-Service Authentication & Anti-Replay Guard.
Enforces cryptographic integrity between Next.js BFF and FastAPI backend.
Rejects all unsigned, tampered, or replayed requests exceeding 30-second window.
"""

import hashlib
import hmac
import math
import os
import time
from typing import Tuple, Union
from fastapi import HTTPException, Request, Security, status
from fastapi.security.api_key import APIKeyHeader

SIGNATURE_HEADER_NAME = "X-ZeroTrust-Signature"
TIMESTAMP_HEADER_NAME = "X-ZeroTrust-Timestamp"

MAX_ALLOWED_TIMESTAMP_SKEW_SECONDS = 30.0

sig_header = APIKeyHeader(name=SIGNATURE_HEADER_NAME, auto_error=False)
ts_header = APIKeyHeader(name=TIMESTAMP_HEADER_NAME, auto_error=False)


def _load_env_hmac_secret() -> str:
    try:
        env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("ZEROTRUST_INTERNAL_HMAC_SECRET="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            return val
    except Exception:
        pass
    return ""


def get_hmac_secret() -> str:
    """
    Retrieves the inter-service HMAC secret from environment variables or .env.
    """
    secret = (
        os.getenv("ZEROTRUST_INTERNAL_HMAC_SECRET")
        or os.getenv("ZEROTRUST_HMAC_SECRET")
        or _load_env_hmac_secret()
    )
    if not secret:
        raise ValueError("ZeroTrust security error: ZEROTRUST_INTERNAL_HMAC_SECRET environment variable is missing.")
    return secret


def compute_hmac_signature(secret: str, timestamp: str, body: Union[bytes, str]) -> str:
    """
    Computes HMAC-SHA256 signature over timestamp + '.' + body.
    Canonical format: HMAC-SHA256(timestamp + "." + body)
    """
    if isinstance(body, str):
        body_bytes = body.encode("utf-8")
    else:
        body_bytes = body

    message = f"{timestamp}.".encode("utf-8") + body_bytes
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def verify_hmac_signature(
    secret: str,
    timestamp: str,
    body: Union[bytes, str],
    incoming_signature: str
) -> bool:
    """
    Constant-time verification of HMAC-SHA256 signature to prevent timing attacks.
    """
    if not incoming_signature:
        return False
    expected_sig = compute_hmac_signature(secret, timestamp, body)
    return hmac.compare_digest(expected_sig.lower(), incoming_signature.strip().lower())


def verify_timestamp_freshness(
    timestamp: Union[str, float, int],
    max_skew_seconds: float = MAX_ALLOWED_TIMESTAMP_SKEW_SECONDS
) -> Tuple[bool, float]:
    """
    Enforces a strict 30-second anti-replay window against UTC epoch time.
    Returns (is_valid, skew_seconds).
    Safely rejects non-numeric, NaN, and Infinite timestamp representations.
    """
    try:
        ts_float = float(timestamp)
        if math.isnan(ts_float) or math.isinf(ts_float):
            return False, float("inf")
    except (ValueError, TypeError):
        return False, float("inf")

    current_time = time.time()
    skew = abs(current_time - ts_float)
    return skew <= max_skew_seconds, skew


async def verify_zerotrust_hmac(request: Request) -> bool:
    """
    FastAPI dependency that validates incoming requests from Next.js BFF.
    Enforces:
      1. Presence of X-ZeroTrust-Signature and X-ZeroTrust-Timestamp
      2. Anti-replay freshness: |time.time() - timestamp| <= 30.0s
      3. Valid HMAC-SHA256 signature over timestamp + '.' + body
    """
    incoming_signature = request.headers.get(SIGNATURE_HEADER_NAME)
    incoming_timestamp = request.headers.get(TIMESTAMP_HEADER_NAME)

    if not incoming_signature or not incoming_timestamp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "ZEROTRUST_AUTH_ERROR: Missing required inter-service headers. "
                f"Both '{SIGNATURE_HEADER_NAME}' and '{TIMESTAMP_HEADER_NAME}' are required."
            )
        )

    # 1. Anti-replay verification
    is_fresh, skew = verify_timestamp_freshness(incoming_timestamp)
    if not is_fresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                f"ZEROTRUST_AUTH_ERROR: Replay attack detected or clock skew exceeded. "
                f"Timestamp skew of {skew:.2f}s exceeds maximum allowed limit of {MAX_ALLOWED_TIMESTAMP_SKEW_SECONDS}s."
            )
        )

    # 2. Cryptographic signature verification
    body = await request.body()
    secret = get_hmac_secret()

    if not verify_hmac_signature(secret, incoming_timestamp, body, incoming_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ZEROTRUST_AUTH_ERROR: Invalid HMAC-SHA256 signature. Request payload may have been tampered with."
        )

    return True
