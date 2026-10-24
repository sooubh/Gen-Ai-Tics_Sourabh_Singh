# 11 traceability decision log

Traceability and decision log

Every planned capability maps to a risk, decision and observable acceptance test.

## Required behavior
### REC-01 — Scope
- **Intent:** Officer investigation helper, not dispatch
- **Control:** Product review
- **Acceptance:** P0

### REC-02 — Recorded path
- **Intent:** Transcript and analysis on approved clip
- **Control:** Provider smoke + E2E
- **Acceptance:** P0

### REC-03 — Live path
- **Intent:** Real microphone/socket state
- **Control:** Session test
- **Acceptance:** P0 if enabled

### REC-04 — Evidence
- **Intent:** Each finding has source anchor
- **Control:** Schema and source seek test
- **Acceptance:** P0

### REC-05 — Uncertainty
- **Intent:** Ambiguity preserved
- **Control:** Golden fixture
- **Acceptance:** P0

### REC-06 — Trigger context
- **Intent:** Negation/history/hypothesis tested
- **Control:** Context suite
- **Acceptance:** P0

### REC-07 — Cue feature
- **Intent:** Requires grounding/abstention
- **Control:** Eval decision
- **Acceptance:** P0

### REC-08 — RLS
- **Intent:** Cross-user denied
- **Control:** DB/storage integration
- **Acceptance:** P0

### REC-09 — Secrets
- **Intent:** No client leakage
- **Control:** Bundle scan
- **Acceptance:** P0

### REC-10 — Retention
- **Intent:** Object deletion confirmed
- **Control:** Storage test
- **Acceptance:** P0

### REC-11 — Export
- **Intent:** Selected run only
- **Control:** Reconciliation test
- **Acceptance:** P0

### REC-12 — CSV
- **Intent:** Formula cells escaped
- **Control:** Export fixture
- **Acceptance:** P0

### REC-13 — Review
- **Intent:** Actor/time/history retained
- **Control:** Concurrency test
- **Acceptance:** P0

### REC-14 — Retry
- **Intent:** Bounded and idempotent
- **Control:** Replay test
- **Acceptance:** P0

### REC-15 — Failure
- **Intent:** Partial differs from complete
- **Control:** Fault injection
- **Acceptance:** P0

### REC-16 — Language
- **Intent:** Unknown supported honestly
- **Control:** Fixture test
- **Acceptance:** P1

### REC-17 — Demo
- **Intent:** Synthetic/authorized content
- **Control:** Fixture register
- **Acceptance:** P0

### REC-18 — Deployment
- **Intent:** Current model/access verified
- **Control:** Preflight
- **Acceptance:** P0

### REC-19 — Documentation
- **Intent:** Change requires matrix update
- **Control:** Review template
- **Acceptance:** P1

### REC-20 — Provider drift
- **Intent:** Regression before promotion
- **Control:** Model change gate
- **Acceptance:** P1

### REC-21 — Accessibility
- **Intent:** Keyboard core flow
- **Control:** Browser test
- **Acceptance:** P1

### REC-22 — Latency
- **Intent:** Measured stage timing
- **Control:** Synthetic benchmark
- **Acceptance:** P1

### REC-23 — Deletion failure
- **Intent:** Failure stays visible
- **Control:** Fault injection
- **Acceptance:** P0

### REC-24 — No dispatch
- **Intent:** Route audit
- **Control:** No outbound action
- **Acceptance:** P0

## References

- https://ai.google.dev/gemini-api/docs/models
- https://nextjs.org/docs/app
- https://supabase.com/docs/guides/database/postgres/row-level-security

This is a fallback planning specification. Replace no existing rich document; expand with actual evidence before implementation.