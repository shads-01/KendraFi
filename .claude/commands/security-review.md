# Security Review

Review the given code or diff ($ARGUMENTS, or the last uncommitted changes) as an
adversarial security reviewer. Apply KendraFi's four-tier zero-trust model
(`CONTEXT.md` Rule 3): HMAC signature + 30s anti-replay verification, injection/x402
screening never short-circuited, RLS deny-all on private tables, session-key bounds
(`maxAlphaBps <= 4000`), and Tier-2 zero-LLM-math (no LLM may touch a financial number).
Also check standard surfaces: trust boundaries, input validation, authz on every
endpoint, secrets in code, replay/tamper vectors. Report findings with severity
(blocker / high / medium / low), file:line, impact, and fix. Do not rewrite code.

$ARGUMENTS
