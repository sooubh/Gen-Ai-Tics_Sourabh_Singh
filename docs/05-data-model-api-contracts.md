# 05 — Data Model and API Contracts


## Expanded API negative test matrix

Run each relevant scenario at multiple layers. A mocked repository passing does not prove authorization, RLS or object storage behavior.

### API-X-API01-UNIT — Create case without session
- **Expected:** Deny, no case created
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API01-INTEGRATION — Create case without session
- **Expected:** Deny, no case created
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API01-E2E — Create case without session
- **Expected:** Deny, no case created
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API02-UNIT — Create case with invalid title
- **Expected:** Validation error
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API02-INTEGRATION — Create case with invalid title
- **Expected:** Validation error
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API02-E2E — Create case with invalid title
- **Expected:** Validation error
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API03-UNIT — Read another user's case
- **Expected:** Deny without metadata leak
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API03-INTEGRATION — Read another user's case
- **Expected:** Deny without metadata leak
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API03-E2E — Read another user's case
- **Expected:** Deny without metadata leak
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API04-UNIT — Update case by untrusted actor ID
- **Expected:** Use session actor or reject field
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API04-INTEGRATION — Update case by untrusted actor ID
- **Expected:** Use session actor or reject field
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API04-E2E — Update case by untrusted actor ID
- **Expected:** Use session actor or reject field
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API05-UNIT — List cases with huge page size
- **Expected:** Clamp/reject
- **Priority:** P1
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API05-INTEGRATION — List cases with huge page size
- **Expected:** Clamp/reject
- **Priority:** P1
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API05-E2E — List cases with huge page size
- **Expected:** Clamp/reject
- **Priority:** P1
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API06-UNIT — Filter with unknown status enum
- **Expected:** Reject safely
- **Priority:** P1
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API06-INTEGRATION — Filter with unknown status enum
- **Expected:** Reject safely
- **Priority:** P1
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API06-E2E — Filter with unknown status enum
- **Expected:** Reject safely
- **Priority:** P1
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API07-UNIT — Authorize upload for wrong case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API07-INTEGRATION — Authorize upload for wrong case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API07-E2E — Authorize upload for wrong case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API08-UNIT — Upload to arbitrary object key
- **Expected:** Reject path
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API08-INTEGRATION — Upload to arbitrary object key
- **Expected:** Reject path
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API08-E2E — Upload to arbitrary object key
- **Expected:** Reject path
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API09-UNIT — Complete nonexistent upload
- **Expected:** Reject; no model call
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API09-INTEGRATION — Complete nonexistent upload
- **Expected:** Reject; no model call
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API09-E2E — Complete nonexistent upload
- **Expected:** Reject; no model call
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API10-UNIT — Complete incomplete upload
- **Expected:** Not verified
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API10-INTEGRATION — Complete incomplete upload
- **Expected:** Not verified
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API10-E2E — Complete incomplete upload
- **Expected:** Not verified
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API11-UNIT — Complete mismatched MIME/size
- **Expected:** Reject
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API11-INTEGRATION — Complete mismatched MIME/size
- **Expected:** Reject
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API11-E2E — Complete mismatched MIME/size
- **Expected:** Reject
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API12-UNIT — Create analysis twice with same idempotency key
- **Expected:** Defined duplicate handling
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API12-INTEGRATION — Create analysis twice with same idempotency key
- **Expected:** Defined duplicate handling
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API12-E2E — Create analysis twice with same idempotency key
- **Expected:** Defined duplicate handling
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API13-UNIT — Create analysis on expired source
- **Expected:** Reject or policy-defined state
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API13-INTEGRATION — Create analysis on expired source
- **Expected:** Reject or policy-defined state
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API13-E2E — Create analysis on expired source
- **Expected:** Reject or policy-defined state
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API14-UNIT — Read another user's run
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API14-INTEGRATION — Read another user's run
- **Expected:** Deny
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API14-E2E — Read another user's run
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API15-UNIT — Retry a completed run
- **Expected:** Conflict/allowed new run explicitly
- **Priority:** P1
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API15-INTEGRATION — Retry a completed run
- **Expected:** Conflict/allowed new run explicitly
- **Priority:** P1
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API15-E2E — Retry a completed run
- **Expected:** Conflict/allowed new run explicitly
- **Priority:** P1
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API16-UNIT — Retry permanent validation error
- **Expected:** No blind provider retry
- **Priority:** P1
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API16-INTEGRATION — Retry permanent validation error
- **Expected:** No blind provider retry
- **Priority:** P1
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API16-E2E — Retry permanent validation error
- **Expected:** No blind provider retry
- **Priority:** P1
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API17-UNIT — Review finding with no permission
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API17-INTEGRATION — Review finding with no permission
- **Expected:** Deny
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API17-E2E — Review finding with no permission
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API18-UNIT — Review finding with stale version
- **Expected:** Conflict
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API18-INTEGRATION — Review finding with stale version
- **Expected:** Conflict
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API18-E2E — Review finding with stale version
- **Expected:** Conflict
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API19-UNIT — Review finding with unsupported action
- **Expected:** Validation error
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API19-INTEGRATION — Review finding with unsupported action
- **Expected:** Validation error
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API19-E2E — Review finding with unsupported action
- **Expected:** Validation error
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API20-UNIT — Set actor ID in review JSON
- **Expected:** Ignore/reject spoof
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API20-INTEGRATION — Set actor ID in review JSON
- **Expected:** Ignore/reject spoof
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API20-E2E — Set actor ID in review JSON
- **Expected:** Ignore/reject spoof
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API21-UNIT — Correct transcript outside source run
- **Expected:** Reject
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API21-INTEGRATION — Correct transcript outside source run
- **Expected:** Reject
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API21-E2E — Correct transcript outside source run
- **Expected:** Reject
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API22-UNIT — Attach foreign segment to finding
- **Expected:** Reject
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API22-INTEGRATION — Attach foreign segment to finding
- **Expected:** Reject
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API22-E2E — Attach foreign segment to finding
- **Expected:** Reject
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API23-UNIT — Export report for inaccessible case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API23-INTEGRATION — Export report for inaccessible case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API23-E2E — Export report for inaccessible case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API24-UNIT — Export wrong run ID
- **Expected:** Deny or validate belongs to case
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API24-INTEGRATION — Export wrong run ID
- **Expected:** Deny or validate belongs to case
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API24-E2E — Export wrong run ID
- **Expected:** Deny or validate belongs to case
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API25-UNIT — CSV note contains formula marker
- **Expected:** Escape
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API25-INTEGRATION — CSV note contains formula marker
- **Expected:** Escape
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API25-E2E — CSV note contains formula marker
- **Expected:** Escape
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API26-UNIT — Download expired audio
- **Expected:** Unavailable state
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API26-INTEGRATION — Download expired audio
- **Expected:** Unavailable state
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API26-E2E — Download expired audio
- **Expected:** Unavailable state
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API27-UNIT — Delete audio outside case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API27-INTEGRATION — Delete audio outside case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API27-E2E — Delete audio outside case
- **Expected:** Deny
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API28-UNIT — Delete same source twice
- **Expected:** Idempotent state response
- **Priority:** P1
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API28-INTEGRATION — Delete same source twice
- **Expected:** Idempotent state response
- **Priority:** P1
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API28-E2E — Delete same source twice
- **Expected:** Idempotent state response
- **Priority:** P1
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API29-UNIT — Retention job uses client path
- **Expected:** Ignore client path; trusted DB key
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API29-INTEGRATION — Retention job uses client path
- **Expected:** Ignore client path; trusted DB key
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API29-E2E — Retention job uses client path
- **Expected:** Ignore client path; trusted DB key
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API30-UNIT — Report contains model-invented verification
- **Expected:** Reject/label unverified
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API30-INTEGRATION — Report contains model-invented verification
- **Expected:** Reject/label unverified
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API30-E2E — Report contains model-invented verification
- **Expected:** Reject/label unverified
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API31-UNIT — Transcript query spans cases
- **Expected:** Scope to authorized case
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API31-INTEGRATION — Transcript query spans cases
- **Expected:** Scope to authorized case
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API31-E2E — Transcript query spans cases
- **Expected:** Scope to authorized case
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API32-UNIT — Transcript query huge string
- **Expected:** Reject/bound
- **Priority:** P1
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API32-INTEGRATION — Transcript query huge string
- **Expected:** Reject/bound
- **Priority:** P1
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API32-E2E — Transcript query huge string
- **Expected:** Reject/bound
- **Priority:** P1
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API33-UNIT — Rate limit exceeded
- **Expected:** 429 and no provider call
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API33-INTEGRATION — Rate limit exceeded
- **Expected:** 429 and no provider call
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API33-E2E — Rate limit exceeded
- **Expected:** 429 and no provider call
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API34-UNIT — Provider key absent
- **Expected:** Not ready; no secret echoed
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API34-INTEGRATION — Provider key absent
- **Expected:** Not ready; no secret echoed
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API34-E2E — Provider key absent
- **Expected:** Not ready; no secret echoed
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

### API-X-API35-UNIT — Unknown run status stored
- **Expected:** Constraint/schema rejects
- **Priority:** P0
- **Layer:** Domain/schema test, no network
- **Evidence:** Assertion evidence
- **Status:** Pending until executed.

### API-X-API35-INTEGRATION — Unknown run status stored
- **Expected:** Constraint/schema rejects
- **Priority:** P0
- **Layer:** API with test auth and DB/Storage
- **Evidence:** Request ID and stored outcome
- **Status:** Pending until executed.

### API-X-API35-E2E — Unknown run status stored
- **Expected:** Constraint/schema rejects
- **Priority:** P0
- **Layer:** Browser-visible action and result
- **Evidence:** Build ID and synthetic fixture
- **Status:** Pending until executed.

## API reviewer checklist

- [ ] Request body has runtime schema.
- [ ] Actor is derived from session.
- [ ] Resource and parent scope are validated.
- [ ] Rate, size and concurrency limits enforced on server.
- [ ] Idempotency/version check applied where needed.
- [ ] Provider result normalized before persistence.
- [ ] Empty, partial, failed and successful outcomes differ.
- [ ] Sensitive data is absent from safe errors.
- [ ] Integration test inspects actual persisted outcome.
- [ ] Cross-user negative test exists.
