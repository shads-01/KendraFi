# System-Design Stress Test

Stress-test the system design or architecture in $ARGUMENTS (or the current plan in
`docs/plans/`). Challenge it hard on: production vs toy scale (concurrency, year-one
load), multi-tenancy and data isolation (Supabase RLS), failure modes (what happens if
the chain, FastAPI, or Supabase is down mid-settlement), cost at scale, over- and
under-engineering, plus KendraFi-specific hazards: locked constants drift
(`CONTEXT.md`), LLM math leakage into risk numbers, FISCO BCOS `paris`-EVM breaks.
For every "it will fail" claim, say what observable test would catch it. End with a
verdict: ship / fix-before-build / redesign, and log the verdict in `docs/decisions/`.

$ARGUMENTS
