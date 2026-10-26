"""
api/core/logging_mw.py
Structured JSON Request Logging Middleware for KendraFi FastAPI serverless engine.
Generates request IDs and logs structured telemetry to stdout without logging sensitive request bodies.
"""

from __future__ import annotations

import json
import sys
import time
import uuid
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-ID"


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware emitting exactly ONE structured JSON line per request to stdout.
    Attaches X-Request-ID to response headers and redacts all request bodies.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming_id = request.headers.get("x-request-id")
        request_id = incoming_id.strip() if incoming_id else uuid.uuid4().hex[:12]
        request.state.request_id = request_id

        start_time = time.perf_counter()
        status_code = 500

        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers[REQUEST_ID_HEADER] = request_id
            return response
        except Exception as exc:
            status_code = 500
            raise exc
        finally:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            level = "ERROR" if status_code >= 500 else ("WARN" if status_code >= 400 else "INFO")

            log_entry = {
                "ts": datetime.now(timezone.utc).isoformat(),
                "level": level,
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status": status_code,
                "duration_ms": duration_ms,
            }

            # Emits ONE structured JSON line to stdout (Vercel runtime native log ingestion)
            sys.stdout.write(json.dumps(log_entry) + "\n")
            sys.stdout.flush()
