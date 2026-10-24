# 04 ai audio pipelines

AI/audio pipeline

Model IDs are candidates; validate request/response and source-time mapping.

## Required behavior
### REC-01 — Preflight
- **Intent:** Validate actual media and duration
- **Control:** Reject before cost
- **Acceptance:** Test evidence required

### REC-02 — Transcript
- **Intent:** Normalize text and timestamps
- **Control:** No guessed words
- **Acceptance:** Test evidence required

### REC-03 — Entity
- **Intent:** Require explicit mention and evidence
- **Control:** No external lookup
- **Acceptance:** Test evidence required

### REC-04 — Trigger
- **Intent:** Preserve negation/history/hypothetical
- **Control:** No keyword-only decision
- **Acceptance:** Test evidence required

### REC-05 — Acoustic cue
- **Intent:** Source-local and uncertain
- **Control:** No guilt or deception inference
- **Acceptance:** Test evidence required

### REC-06 — Abstention
- **Intent:** Allow no supported output
- **Control:** No forced class
- **Acceptance:** Test evidence required

### REC-07 — Live event
- **Intent:** Deduplicate interim/final
- **Control:** No duplicate transcript
- **Acceptance:** Test evidence required

### REC-08 — Output schema
- **Intent:** Runtime validation and limits
- **Control:** Reject unsupported enums
- **Acceptance:** Test evidence required

### REC-09 — Failure
- **Intent:** Persist failed/partial result
- **Control:** No empty-success
- **Acceptance:** Test evidence required

### REC-10 — Retention
- **Intent:** Delete private object and verify
- **Control:** DB-only deletion not enough
- **Acceptance:** Test evidence required

### REC-11 — Fixture
- **Intent:** Synthetic or authorized audio
- **Control:** No real sensitive calls
- **Acceptance:** Test evidence required

### REC-12 — Evaluation
- **Intent:** Measure grounding/abstention/repeatability
- **Control:** No broad claim from small set
- **Acceptance:** Test evidence required

### REC-13 — Run version
- **Intent:** Persist model/prompt/schema IDs
- **Control:** No silent merge
- **Acceptance:** Test evidence required

### REC-14 — Source link
- **Intent:** Same-run evidence only
- **Control:** Reject orphan finding
- **Acceptance:** Test evidence required

### REC-15 — Timeline
- **Intent:** Order by source offsets
- **Control:** Don't fabricate timestamps
- **Acceptance:** Test evidence required

### REC-16 — Language
- **Intent:** Unknown/unsupported state
- **Control:** No invented fluent transcript
- **Acceptance:** Test evidence required

### REC-17 — Prompt injection
- **Intent:** Treat speech as content
- **Control:** No tool/system override
- **Acceptance:** Test evidence required

### REC-18 — Rate limit
- **Intent:** Bound retries and concurrency
- **Control:** No retry storm
- **Acceptance:** Test evidence required

### REC-19 — Provider error
- **Intent:** Stable safe category
- **Control:** No raw error payload
- **Acceptance:** Test evidence required

## References

- https://ai.google.dev/gemini-api/docs/models
- https://nextjs.org/docs/app
- https://supabase.com/docs/guides/database/postgres/row-level-security

This is a fallback planning specification. Replace no existing rich document; expand with actual evidence before implementation.