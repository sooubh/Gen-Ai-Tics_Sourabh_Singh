# 09 — Deployment and Operations

## Deployment approach

Use one Next.js application for UI and bounded APIs. Store sensitive audio in private object Storage and avoid proxying large audio through serverless request bodies when platform payload limits apply. Measure runtime constraints before considering a worker/queue. Use separate environments and credentials for local, test and demo.

## Environment configuration inventory

Values are names and intended use, not actual credentials. Populate them through an approved local secret file or hosting environment settings; never commit secret values.

| Variable | Exposure | Purpose | Validation |
|---|---|---|---|
| `GEMINI_API_KEY` | Server-only | Provider credential | Never prefix with NEXT_PUBLIC; test bundle scan |
| `GEMINI_RECORDED_MODEL` | Server-only config | Approved recorded STT model ID | Must match verified project/model |
| `GEMINI_LIVE_MODEL` | Server-only config | Approved live STT model ID | Feature gate off if unverified |
| `GEMINI_AUDIO_ANALYSIS_MODEL` | Server-only config | Optional audio analysis candidate | No cue use before evaluation |
| `GEMINI_CUE_ENABLED` | Server-only boolean | Enable cue UI only after gate | Client cannot self-enable |
| `LIVE_TRANSCRIPTION_ENABLED` | Server-only boolean | Enable real verified live flow | Client cannot self-enable |
| `NEXT_PUBLIC_SUPABASE_URL` | Public configuration | Supabase project URL | Not a secret, but environment-specific |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public configuration | Restricted public client key when RLS is correct | RLS still mandatory |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret | Privileged server DB/Storage operations only where needed | Never client exposed |
| `SUPABASE_DB_URL` | Server-only secret | Migration/worker connection if selected | Restrict pool/permissions |
| `AUDIO_BUCKET_NAME` | Server-only config | Private bucket identifier | Validate expected bucket is private |
| `MAX_UPLOAD_BYTES` | Server-only config | Enforced maximum upload bytes | Must match upload UX copy |
| `MAX_AUDIO_DURATION_SECONDS` | Server-only config | Enforced duration limit | Measured and tested |
| `MAX_ANALYSIS_CONCURRENCY` | Server-only config | Project/user concurrent-run budget | Server enforcement |
| `MAX_RETRY_ATTEMPTS` | Server-only config | Bounded retry budget | No nested independent retry loops |
| `SIGNED_UPLOAD_TTL_SECONDS` | Server-only config | Short-lived upload grant duration | Narrow resource scope |
| `AUDIO_RETENTION_HOURS` | Server-only config | Chosen audio lifetime for demo/prototype | Policy copy matches deployed value |
| `RETENTION_JOB_SECRET` | Server-only secret if HTTP-triggered | Restrict scheduled-job endpoint | Rotate and never log |
| `ALLOWED_UPLOAD_ORIGINS` | Server-only config | CORS/upload source allowlist if used | Exact origins only |
| `APP_ENV` | Server-only config | local/test/demo/production label | Separate credentials/data |

## Deployment sequence
### DEPLOY-01 — Inspect current repo
- **Action:** Review actual files and existing branch before changes
- **Guardrail:** No source overwrite
- **Completion evidence:** File inventory noted

### DEPLOY-02 — Validate model IDs
- **Action:** Check official docs and console access
- **Guardrail:** No implementation against assumptions
- **Completion evidence:** Decision recorded

### DEPLOY-03 — Create isolated test environment
- **Action:** Separate synthetic fixtures and credentials
- **Guardrail:** No production data
- **Completion evidence:** Env isolation test

### DEPLOY-04 — Configure auth
- **Action:** Validate user/session mechanism
- **Guardrail:** Session actor server derived
- **Completion evidence:** Anonymous request denied

### DEPLOY-05 — Create tables/migrations
- **Action:** Schema and RLS versioned
- **Guardrail:** No manual-only schema drift
- **Completion evidence:** Fresh-db migration test

### DEPLOY-06 — Create private bucket
- **Action:** Policy scoped to authenticated case access
- **Guardrail:** No public bucket
- **Completion evidence:** Anonymous fetch denied

### DEPLOY-07 — Set environment variables
- **Action:** Use platform/secret manager
- **Guardrail:** Never echo values in CI
- **Completion evidence:** Secret scan passes

### DEPLOY-08 — Configure upload path
- **Action:** Direct private Storage upload if file size requires
- **Guardrail:** Avoid serverless body-size cap
- **Completion evidence:** Configured limit test

### DEPLOY-09 — Set runtime budgets
- **Action:** Request/runtime and provider stage limits
- **Guardrail:** No assumed unlimited job duration
- **Completion evidence:** Largest demo clip test

### DEPLOY-10 — Configure app domain/TLS
- **Action:** HTTPS and secure cookie/origin settings
- **Guardrail:** No mixed content
- **Completion evidence:** Browser preflight

### DEPLOY-11 — Set CORS/CSRF strategy
- **Action:** Match actual session/auth design
- **Guardrail:** No wildcard protected credentialed origin
- **Completion evidence:** Origin tests

### DEPLOY-12 — Run migration
- **Action:** Deploy schema and policy together
- **Guardrail:** Rollback strategy documented
- **Completion evidence:** Smoke test

### DEPLOY-13 — Run unit tests
- **Action:** Validate domain invariants
- **Guardrail:** No external provider required
- **Completion evidence:** CI result archived

### DEPLOY-14 — Run integration suite
- **Action:** Test RLS/storage using separate actors
- **Guardrail:** No mocks for access proof
- **Completion evidence:** Negative suite passes

### DEPLOY-15 — Run provider smoke
- **Action:** Use synthetic clip and one controlled call
- **Guardrail:** Budget and request ID recorded
- **Completion evidence:** Real output checked

### DEPLOY-16 — Deploy preview
- **Action:** Confirm config maps to intended test environment
- **Guardrail:** No sensitive data in preview
- **Completion evidence:** Preflight status

### DEPLOY-17 — Verify report export
- **Action:** Compare report with selected database run
- **Guardrail:** CSV safe
- **Completion evidence:** Export reconciliation

### DEPLOY-18 — Verify delete expiry
- **Action:** Delete test object and inspect storage
- **Guardrail:** Provider file behavior separately
- **Completion evidence:** Lifecycle evidence

### DEPLOY-19 — Promote demo candidate
- **Action:** Pin tested commit and fixture set
- **Guardrail:** No unreviewed model/schema changes
- **Completion evidence:** Release gate signed

## Operational runbooks
### OPS-01 — Provider 401/403
- **Diagnosis:** Credential/project access check
- **Safety rule:** No raw headers/log secrets
- **Recovery:** Fix config; rerun one smoke request

### OPS-02 — Provider 429
- **Diagnosis:** Check quota and request budgets
- **Safety rule:** Bound backoff
- **Recovery:** Wait/adjust quota; no retry storm

### OPS-03 — Provider timeout
- **Diagnosis:** Check stage duration and media size
- **Safety rule:** Record partial/failure honestly
- **Recovery:** Retry only eligible stage

### OPS-04 — Recorded transcript empty
- **Diagnosis:** Inspect test fixture, language and API result shape
- **Safety rule:** No auto-interpret as safe
- **Recovery:** Capture sanitized request ID/diagnosis

### OPS-05 — Live socket won't connect
- **Diagnosis:** Check model/auth/codec/origin
- **Safety rule:** No false Connected badge
- **Recovery:** Use recorded path until fixed

### OPS-06 — Live transcript duplicates
- **Diagnosis:** Inspect event IDs/final event merge
- **Safety rule:** No repeated output in report
- **Recovery:** Add event fixture regression

### OPS-07 — Upload 413/body limit
- **Diagnosis:** Check direct-storage upload approach and configured cap
- **Safety rule:** Don't bypass by increasing arbitrary payload
- **Recovery:** Correct architecture/limit

### OPS-08 — Supabase RLS denial
- **Diagnosis:** Check actor/case parent relation
- **Safety rule:** Never disable RLS to debug
- **Recovery:** Fix scoped policy and rerun negative test

### OPS-09 — Storage download denied
- **Diagnosis:** Verify private policy and grant lifetime
- **Safety rule:** No public bucket workaround
- **Recovery:** Issue scoped grant after auth

### OPS-10 — Deletion stuck
- **Diagnosis:** Inspect job attempts and actual object state
- **Safety rule:** Don't label deleted
- **Recovery:** Retry/reconcile and alert after cap

### OPS-11 — Malformed model output
- **Diagnosis:** Check model ID and adapter schema version
- **Safety rule:** No raw JSON client leak
- **Recovery:** Hold adapter and test parser

### OPS-12 — Cost spike
- **Diagnosis:** Check aggregate request count/duration/error/retry metrics
- **Safety rule:** Avoid transcript logging
- **Recovery:** Throttle and investigate synthetic request IDs

### OPS-13 — Client secret found
- **Diagnosis:** Rotate credential immediately
- **Safety rule:** Remove log/artifact exposure
- **Recovery:** Rebuild and repeat full scan

### OPS-14 — CSV opens formula
- **Diagnosis:** Disable unsafe export
- **Safety rule:** No distribution until fixed
- **Recovery:** Patch sanitizer and regression test

### OPS-15 — Session leaks old case
- **Diagnosis:** Review cache/state cleanup
- **Safety rule:** Don't clear evidence logs by dumping transcript
- **Recovery:** Clear protected cache and run logout test

### OPS-16 — Stale finding edit
- **Diagnosis:** Inspect version/current state
- **Safety rule:** No overwrite
- **Recovery:** Reload and resolve conflict

### OPS-17 — Model behavior drift
- **Diagnosis:** Compare version metadata/evaluation
- **Safety rule:** No unreviewed promotion
- **Recovery:** Hold feature/model change

### OPS-18 — Audio decode error
- **Diagnosis:** Inspect actual type/codec browser support
- **Safety rule:** No fake waveform
- **Recovery:** Reject/convert only via tested path

## Alert and dashboard definitions
### OBS-01 — Provider error-rate spike
- **Metric:** Aggregate error code counts
- **Privacy rule:** No transcript/phone/address labels
- **Action:** Throttle/triage

### OBS-02 — Rate-limit surge
- **Metric:** Rejected requests and user-level counts
- **Privacy rule:** Only aggregate identifiers
- **Action:** Inspect abuse pattern

### OBS-03 — Analysis latency spike
- **Metric:** Stage latency percentiles and clip duration
- **Privacy rule:** No raw text needed
- **Action:** Check provider/model/runtime

### OBS-04 — Cost budget threshold
- **Metric:** Provider billing aggregate and call counts
- **Privacy rule:** Restrict access to billing metadata
- **Action:** Throttle feature

### OBS-05 — Retention job backlog
- **Metric:** Due versus successfully deleted object count
- **Privacy rule:** No object keys in broad log
- **Action:** Investigate job health

### OBS-06 — Deletion failure count
- **Metric:** Normalized error and retry age
- **Privacy rule:** Don't claim deletion
- **Action:** Escalate owner

### OBS-07 — Storage usage anomaly
- **Metric:** Aggregate bucket bytes/count
- **Privacy rule:** No public enumeration
- **Action:** Run scoped inventory

### OBS-08 — Unauthorized requests
- **Metric:** Denied count by safe route/request IDs
- **Privacy rule:** No sensitive target metadata
- **Action:** Inspect abuse/access

### OBS-09 — Malformed model response
- **Metric:** Schema failure count by model version
- **Privacy rule:** No full provider content
- **Action:** Pause model rollout

### OBS-10 — Live disconnect rate
- **Metric:** Session status counts and duration
- **Privacy rule:** No captured audio telemetry
- **Action:** Check codec/connectivity

### OBS-11 — Prompt/schema change
- **Metric:** Config/build SHA
- **Privacy rule:** No private prompt text
- **Action:** Run regression suite

### OBS-12 — Export failure
- **Metric:** Format/status/latency counts
- **Privacy rule:** No report body logging
- **Action:** Investigate sanitizer/rendering

## Metrics and logging

Recommended aggregate signals: analysis stage duration, provider status code category, upload failure count, active live-session count, retry count, quota rejection count, storage cleanup attempts, deletion confirmations and export failures. Use request IDs for diagnosis.

Do not log raw audio, full transcript, phone numbers, addresses, signed media URLs, API keys, raw provider request bodies or full provider response JSON. Do not add transcript content to product analytics by default.

## Readiness checks

- [ ] App config validation runs without echoing secrets.
- [ ] Target Supabase project and hosting environment match.
- [ ] Auth works for valid, anonymous and expired sessions.
- [ ] RLS is active and cross-user negative suite passes.
- [ ] Bucket is private and object grants are scoped.
- [ ] Real synthetic transcription smoke test passes.
- [ ] Live feature flag matches verified live capability.
- [ ] Cue feature flag matches evaluation decision.
- [ ] Media limits are enforced server-side and match UI copy.
- [ ] CSV export escaping is tested.
- [ ] Audio retention job has run on a test object and deletion was confirmed.
- [ ] Remote provider file policy is checked if file upload API is used.
- [ ] Error monitoring excludes raw transcript/media.
- [ ] Tested commit/build SHA is recorded.
- [ ] Known-good recorded demo fallback is available.
- [ ] Demo fixture authorization list is reviewed.

## Rollback strategy

1. Disable the affected live/cue feature flag if quality or availability fails.
2. Revert the smallest faulty application change; don't roll back into weaker RLS or public storage.
3. Keep previous analysis runs immutable and report which model version generated each result.
4. Pause a migration only under an explicit rollback plan; avoid manual schema drift.
5. Rotate exposed credentials immediately and rebuild after exposure remediation.
6. If deletion is uncertain, disclose pending/failed deletion rather than claiming success.
7. Preserve safe request IDs and minimal diagnostics; do not export sensitive payloads to debug.

## Platform notes

- Vercel documents a 4.5 MB request payload limit for Functions; direct upload to private Storage is the recommended design for larger audio payloads.
- Route Handlers are appropriate for bounded application requests, not an assumption of an unlimited long-running worker.
- Model IDs, API request shapes and quotas must be verified against current official provider documentation and the configured project.
- Signed URL TTL and cookie/CORS rules should be selected to match the actual authentication strategy.

## Official references

- https://vercel.com/docs/errors/function_payload_too_large
- https://vercel.com/docs/functions
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://ai.google.dev/gemini-api/docs/models
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Status

This is an operations plan. It does not mean the environment is configured, metrics are collecting, secrets are set, or deployment/rollback has been tested.
