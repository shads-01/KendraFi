# CI has no .env (gitignored by design); zerotrust_guard validates these at import.
# setdefault so explicit per-test values (e.g. refusal tests in test_prompt02_security_audit.py) win.
import os

os.environ.setdefault("ZEROTRUST_INTERNAL_HMAC_SECRET", "kendra-test-secret-32-chars-long-1234")
os.environ.setdefault("TEST_BYPASS_AUTH", "false")
