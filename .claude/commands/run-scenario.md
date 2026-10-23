# Run CNP Scenario

Execute one of the demo scenarios against the running stack and verify the full FSM
trace. $ARGUMENTS is one of: `A` (valid 45,000 BDT rice restock → full CNP → on-chain
settle → repay sweep), `B` (red-team poisoned invoice → BLOCKED_ADVERSARIAL with both
TIER0_PROMPT_INJECTION_DETECTED and X402_UNVERIFIED_SUPPLIER_ADDRESS), `C` (Sybil +
wash ring hold, then monsoon shock → FLASH_BAILOUT_ACTIVE), `repay` (30-day MFS sweep
+ 1% peer yield).

Steps: 1) confirm dev server + Supabase env are up; 2) trigger via the BFF route
(`src/app/api/kendra/*/route.ts`) — never call FastAPI directly from here; 3) verify
every locked constant in `CONTEXT.md` appears unchanged in the result (45,462.33 BDT,
DSCR 1.6800, stakes 40/35/25/0); 4) export/check the trace JSON in `docs/traces/`;
5) report tx_mode honestly — LIVE vs REPLAY must never be disguised.

$ARGUMENTS
