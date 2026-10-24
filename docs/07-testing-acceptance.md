# 07 — Testing and Acceptance Plan

## Test philosophy

Tests must prove behavior and guardrails, not merely that pages render. Keep deterministic domain tests separate from real provider smoke tests; mocks cannot prove endpoint compatibility. Never place sensitive real calls in CI, repo fixtures or screenshots.

## Test levels

| Level | Purpose | Constraint |
|---|---|---|
| Unit/domain | Run deterministic pure tests with schema/provider repositories mocked, without network. | No external provider bill; cases assert domain invariants. |
| API/storage integration | Run against a test database/bucket with separate test users and isolated credentials. | Authorization, persistence and Storage assertions inspect actual outcomes. |
| Browser/E2E | Use seeded synthetic fixture and test browser permissions/network interception where possible. | Visible UI state must reconcile with persisted server state. |

## Core test catalogue — cross-layer views
### TEST-001-UNIT — Session expiry / Unit/domain
- **Precondition:** Auth
- **Expected result:** Expired token
- **Priority:** Protected request rejected
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-001-INT — Session expiry / API/storage integration
- **Precondition:** Auth
- **Expected result:** Expired token
- **Priority:** Protected request rejected
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-001-E2E — Session expiry / Browser/E2E
- **Precondition:** Auth
- **Expected result:** Expired token
- **Priority:** Protected request rejected
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-002-UNIT — Cross-user case / Unit/domain
- **Precondition:** Authorization
- **Expected result:** Two users and one case
- **Priority:** Other user cannot read or mutate
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-002-INT — Cross-user case / API/storage integration
- **Precondition:** Authorization
- **Expected result:** Two users and one case
- **Priority:** Other user cannot read or mutate
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-002-E2E — Cross-user case / Browser/E2E
- **Precondition:** Authorization
- **Expected result:** Two users and one case
- **Priority:** Other user cannot read or mutate
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-003-UNIT — Cross-user audio / Unit/domain
- **Precondition:** Storage
- **Expected result:** Different user requests object
- **Priority:** Download denied
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-003-INT — Cross-user audio / API/storage integration
- **Precondition:** Storage
- **Expected result:** Different user requests object
- **Priority:** Download denied
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-003-E2E — Cross-user audio / Browser/E2E
- **Precondition:** Storage
- **Expected result:** Different user requests object
- **Priority:** Download denied
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-004-UNIT — Public bucket / Unit/domain
- **Precondition:** Storage
- **Expected result:** Anonymous request
- **Priority:** No object bytes returned
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-004-INT — Public bucket / API/storage integration
- **Precondition:** Storage
- **Expected result:** Anonymous request
- **Priority:** No object bytes returned
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-004-E2E — Public bucket / Browser/E2E
- **Precondition:** Storage
- **Expected result:** Anonymous request
- **Priority:** No object bytes returned
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-005-UNIT — Forged actor / Unit/domain
- **Precondition:** Review
- **Expected result:** Body contains another actor ID
- **Priority:** Server uses session actor
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-005-INT — Forged actor / API/storage integration
- **Precondition:** Review
- **Expected result:** Body contains another actor ID
- **Priority:** Server uses session actor
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-005-E2E — Forged actor / Browser/E2E
- **Precondition:** Review
- **Expected result:** Body contains another actor ID
- **Priority:** Server uses session actor
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-006-UNIT — Upload extension spoof / Unit/domain
- **Precondition:** Media
- **Expected result:** Allowed suffix but invalid bytes
- **Priority:** Reject before provider call
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-006-INT — Upload extension spoof / API/storage integration
- **Precondition:** Media
- **Expected result:** Allowed suffix but invalid bytes
- **Priority:** Reject before provider call
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-006-E2E — Upload extension spoof / Browser/E2E
- **Precondition:** Media
- **Expected result:** Allowed suffix but invalid bytes
- **Priority:** Reject before provider call
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-007-UNIT — Oversized media / Unit/domain
- **Precondition:** Media
- **Expected result:** Bytes/duration exceed policy
- **Priority:** 413 or defined validation error
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-007-INT — Oversized media / API/storage integration
- **Precondition:** Media
- **Expected result:** Bytes/duration exceed policy
- **Priority:** 413 or defined validation error
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-007-E2E — Oversized media / Browser/E2E
- **Precondition:** Media
- **Expected result:** Bytes/duration exceed policy
- **Priority:** 413 or defined validation error
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-008-UNIT — Interrupted upload / Unit/domain
- **Precondition:** Storage
- **Expected result:** Network abort mid-transfer
- **Priority:** Not marked verified; cleanup path
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-008-INT — Interrupted upload / API/storage integration
- **Precondition:** Storage
- **Expected result:** Network abort mid-transfer
- **Priority:** Not marked verified; cleanup path
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-008-E2E — Interrupted upload / Browser/E2E
- **Precondition:** Storage
- **Expected result:** Network abort mid-transfer
- **Priority:** Not marked verified; cleanup path
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-009-UNIT — Invalid timestamp / Unit/domain
- **Precondition:** Schema
- **Expected result:** Negative/reversed/out-of-duration offsets
- **Priority:** Reject or flag partial
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-009-INT — Invalid timestamp / API/storage integration
- **Precondition:** Schema
- **Expected result:** Negative/reversed/out-of-duration offsets
- **Priority:** Reject or flag partial
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-009-E2E — Invalid timestamp / Browser/E2E
- **Precondition:** Schema
- **Expected result:** Negative/reversed/out-of-duration offsets
- **Priority:** Reject or flag partial
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-010-UNIT — Cross-run evidence / Unit/domain
- **Precondition:** Domain
- **Expected result:** Finding refers to other run segment
- **Priority:** Reject result
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-010-INT — Cross-run evidence / API/storage integration
- **Precondition:** Domain
- **Expected result:** Finding refers to other run segment
- **Priority:** Reject result
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-010-E2E — Cross-run evidence / Browser/E2E
- **Precondition:** Domain
- **Expected result:** Finding refers to other run segment
- **Priority:** Reject result
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-011-UNIT — No evidence finding / Unit/domain
- **Precondition:** Domain
- **Expected result:** Material finding lacks source
- **Priority:** Reject/label non-evidentiary
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-011-INT — No evidence finding / API/storage integration
- **Precondition:** Domain
- **Expected result:** Material finding lacks source
- **Priority:** Reject/label non-evidentiary
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-011-E2E — No evidence finding / Browser/E2E
- **Precondition:** Domain
- **Expected result:** Material finding lacks source
- **Priority:** Reject/label non-evidentiary
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-012-UNIT — Unknown enum / Unit/domain
- **Precondition:** Schema
- **Expected result:** Provider emits unsupported category
- **Priority:** Fail adapter safely
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-012-INT — Unknown enum / API/storage integration
- **Precondition:** Schema
- **Expected result:** Provider emits unsupported category
- **Priority:** Fail adapter safely
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-012-E2E — Unknown enum / Browser/E2E
- **Precondition:** Schema
- **Expected result:** Provider emits unsupported category
- **Priority:** Fail adapter safely
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-013-UNIT — Huge output / Unit/domain
- **Precondition:** Resource
- **Expected result:** Oversized arrays/body/text
- **Priority:** Bounded failure
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-013-INT — Huge output / API/storage integration
- **Precondition:** Resource
- **Expected result:** Oversized arrays/body/text
- **Priority:** Bounded failure
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-013-E2E — Huge output / Browser/E2E
- **Precondition:** Resource
- **Expected result:** Oversized arrays/body/text
- **Priority:** Bounded failure
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-014-UNIT — Prompt injection audio / Unit/domain
- **Precondition:** AI safety
- **Expected result:** Speech asks for secret/system change
- **Priority:** Treated as untrusted quote
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-014-INT — Prompt injection audio / API/storage integration
- **Precondition:** AI safety
- **Expected result:** Speech asks for secret/system change
- **Priority:** Treated as untrusted quote
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-014-E2E — Prompt injection audio / Browser/E2E
- **Precondition:** AI safety
- **Expected result:** Speech asks for secret/system change
- **Priority:** Treated as untrusted quote
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-015-UNIT — Negated trigger / Unit/domain
- **Precondition:** AI quality
- **Expected result:** Says event is not happening
- **Priority:** No keyword-only positive trigger
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-015-INT — Negated trigger / API/storage integration
- **Precondition:** AI quality
- **Expected result:** Says event is not happening
- **Priority:** No keyword-only positive trigger
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-015-E2E — Negated trigger / Browser/E2E
- **Precondition:** AI quality
- **Expected result:** Says event is not happening
- **Priority:** No keyword-only positive trigger
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-016-UNIT — Historical trigger / Unit/domain
- **Precondition:** AI quality
- **Expected result:** Past event referenced
- **Priority:** Past/report context retained
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-016-INT — Historical trigger / API/storage integration
- **Precondition:** AI quality
- **Expected result:** Past event referenced
- **Priority:** Past/report context retained
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-016-E2E — Historical trigger / Browser/E2E
- **Precondition:** AI quality
- **Expected result:** Past event referenced
- **Priority:** Past/report context retained
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-017-UNIT — Hypothetical trigger / Unit/domain
- **Precondition:** AI quality
- **Expected result:** Conditional event
- **Priority:** No confirmed current event
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-017-INT — Hypothetical trigger / API/storage integration
- **Precondition:** AI quality
- **Expected result:** Conditional event
- **Priority:** No confirmed current event
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-017-E2E — Hypothetical trigger / Browser/E2E
- **Precondition:** AI quality
- **Expected result:** Conditional event
- **Priority:** No confirmed current event
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-018-UNIT — Quoted threat / Unit/domain
- **Precondition:** AI quality
- **Expected result:** Threat attributed to another person
- **Priority:** Attribution remains cautious
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-018-INT — Quoted threat / API/storage integration
- **Precondition:** AI quality
- **Expected result:** Threat attributed to another person
- **Priority:** Attribution remains cautious
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-018-E2E — Quoted threat / Browser/E2E
- **Precondition:** AI quality
- **Expected result:** Threat attributed to another person
- **Priority:** Attribution remains cautious
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-019-UNIT — Guilt/deception output / Unit/domain
- **Precondition:** Safety
- **Expected result:** Provider returns prohibited interpretation
- **Priority:** Reject or suppress field
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-019-INT — Guilt/deception output / API/storage integration
- **Precondition:** Safety
- **Expected result:** Provider returns prohibited interpretation
- **Priority:** Reject or suppress field
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-019-E2E — Guilt/deception output / Browser/E2E
- **Precondition:** Safety
- **Expected result:** Provider returns prohibited interpretation
- **Priority:** Reject or suppress field
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-020-UNIT — Cue abstention / Unit/domain
- **Precondition:** Model evaluation
- **Expected result:** Short/noisy audio
- **Priority:** Can return insufficient evidence
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-020-INT — Cue abstention / API/storage integration
- **Precondition:** Model evaluation
- **Expected result:** Short/noisy audio
- **Priority:** Can return insufficient evidence
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-020-E2E — Cue abstention / Browser/E2E
- **Precondition:** Model evaluation
- **Expected result:** Short/noisy audio
- **Priority:** Can return insufficient evidence
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-021-UNIT — Semantic leakage / Unit/domain
- **Precondition:** Model evaluation
- **Expected result:** Words angry, voice neutral
- **Priority:** Acoustic cue doesn't rely on text alone
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-021-INT — Semantic leakage / API/storage integration
- **Precondition:** Model evaluation
- **Expected result:** Words angry, voice neutral
- **Priority:** Acoustic cue doesn't rely on text alone
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-021-E2E — Semantic leakage / Browser/E2E
- **Precondition:** Model evaluation
- **Expected result:** Words angry, voice neutral
- **Priority:** Acoustic cue doesn't rely on text alone
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-022-UNIT — Repeated model run / Unit/domain
- **Precondition:** Evaluation
- **Expected result:** Same fixture repeated
- **Priority:** Runs separate; variation recorded
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-022-INT — Repeated model run / API/storage integration
- **Precondition:** Evaluation
- **Expected result:** Same fixture repeated
- **Priority:** Runs separate; variation recorded
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-022-E2E — Repeated model run / Browser/E2E
- **Precondition:** Evaluation
- **Expected result:** Same fixture repeated
- **Priority:** Runs separate; variation recorded
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-023-UNIT — Transcript correction / Unit/domain
- **Precondition:** Review
- **Expected result:** Officer edits a segment
- **Priority:** Original preserved and edit attributed
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-023-INT — Transcript correction / API/storage integration
- **Precondition:** Review
- **Expected result:** Officer edits a segment
- **Priority:** Original preserved and edit attributed
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-023-E2E — Transcript correction / Browser/E2E
- **Precondition:** Review
- **Expected result:** Officer edits a segment
- **Priority:** Original preserved and edit attributed
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-024-UNIT — Concurrent review / Unit/domain
- **Precondition:** Concurrency
- **Expected result:** Two reviewers edit same version
- **Priority:** One conflicts; no silent overwrite
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-024-INT — Concurrent review / API/storage integration
- **Precondition:** Concurrency
- **Expected result:** Two reviewers edit same version
- **Priority:** One conflicts; no silent overwrite
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-024-E2E — Concurrent review / Browser/E2E
- **Precondition:** Concurrency
- **Expected result:** Two reviewers edit same version
- **Priority:** One conflicts; no silent overwrite
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-025-UNIT — Double create run / Unit/domain
- **Precondition:** Idempotency
- **Expected result:** Repeated request with same key
- **Priority:** No unintended duplicate run
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-025-INT — Double create run / API/storage integration
- **Precondition:** Idempotency
- **Expected result:** Repeated request with same key
- **Priority:** No unintended duplicate run
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-025-E2E — Double create run / Browser/E2E
- **Precondition:** Idempotency
- **Expected result:** Repeated request with same key
- **Priority:** No unintended duplicate run
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-026-UNIT — Rate burst / Unit/domain
- **Precondition:** Abuse
- **Expected result:** Requests exceed per-user cap
- **Priority:** Server returns bounded rate error
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-026-INT — Rate burst / API/storage integration
- **Precondition:** Abuse
- **Expected result:** Requests exceed per-user cap
- **Priority:** Server returns bounded rate error
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-026-E2E — Rate burst / Browser/E2E
- **Precondition:** Abuse
- **Expected result:** Requests exceed per-user cap
- **Priority:** Server returns bounded rate error
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-027-UNIT — Provider 429 / Unit/domain
- **Precondition:** Integration
- **Expected result:** Model returns quota error
- **Priority:** No retry storm
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-027-INT — Provider 429 / API/storage integration
- **Precondition:** Integration
- **Expected result:** Model returns quota error
- **Priority:** No retry storm
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-027-E2E — Provider 429 / Browser/E2E
- **Precondition:** Integration
- **Expected result:** Model returns quota error
- **Priority:** No retry storm
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-028-UNIT — Provider timeout / Unit/domain
- **Precondition:** Integration
- **Expected result:** Request expires after some output
- **Priority:** Correct partial/failed status
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-028-INT — Provider timeout / API/storage integration
- **Precondition:** Integration
- **Expected result:** Request expires after some output
- **Priority:** Correct partial/failed status
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-028-E2E — Provider timeout / Browser/E2E
- **Precondition:** Integration
- **Expected result:** Request expires after some output
- **Priority:** Correct partial/failed status
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-029-UNIT — Live permission deny / Unit/domain
- **Precondition:** Browser E2E
- **Expected result:** Mic permission denied
- **Priority:** Recorded alternative offered
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-029-INT — Live permission deny / API/storage integration
- **Precondition:** Browser E2E
- **Expected result:** Mic permission denied
- **Priority:** Recorded alternative offered
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-029-E2E — Live permission deny / Browser/E2E
- **Precondition:** Browser E2E
- **Expected result:** Mic permission denied
- **Priority:** Recorded alternative offered
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-030-UNIT — Live disconnect / Unit/domain
- **Precondition:** Browser E2E
- **Expected result:** Socket drops during stream
- **Priority:** True reconnect/partial/failure state
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-030-INT — Live disconnect / API/storage integration
- **Precondition:** Browser E2E
- **Expected result:** Socket drops during stream
- **Priority:** True reconnect/partial/failure state
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-030-E2E — Live disconnect / Browser/E2E
- **Precondition:** Browser E2E
- **Expected result:** Socket drops during stream
- **Priority:** True reconnect/partial/failure state
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-031-UNIT — Live duplicate event / Unit/domain
- **Precondition:** Live adapter
- **Expected result:** Same interim/final event repeated
- **Priority:** No duplicate transcript segment
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-031-INT — Live duplicate event / API/storage integration
- **Precondition:** Live adapter
- **Expected result:** Same interim/final event repeated
- **Priority:** No duplicate transcript segment
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-031-E2E — Live duplicate event / Browser/E2E
- **Precondition:** Live adapter
- **Expected result:** Same interim/final event repeated
- **Priority:** No duplicate transcript segment
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-032-UNIT — Late live event / Unit/domain
- **Precondition:** Live adapter
- **Expected result:** Event arrives after stop
- **Priority:** Close/finalization boundary respected
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-032-INT — Late live event / API/storage integration
- **Precondition:** Live adapter
- **Expected result:** Event arrives after stop
- **Priority:** Close/finalization boundary respected
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-032-E2E — Late live event / Browser/E2E
- **Precondition:** Live adapter
- **Expected result:** Event arrives after stop
- **Priority:** Close/finalization boundary respected
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-033-UNIT — Live stop twice / Unit/domain
- **Precondition:** Live adapter
- **Expected result:** Repeated stop request
- **Priority:** Idempotent finalization
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-033-INT — Live stop twice / API/storage integration
- **Precondition:** Live adapter
- **Expected result:** Repeated stop request
- **Priority:** Idempotent finalization
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-033-E2E — Live stop twice / Browser/E2E
- **Precondition:** Live adapter
- **Expected result:** Repeated stop request
- **Priority:** Idempotent finalization
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-034-UNIT — Audio seek / Unit/domain
- **Precondition:** Browser E2E
- **Expected result:** Select source timestamp
- **Priority:** Player seeks to correct offset
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-034-INT — Audio seek / API/storage integration
- **Precondition:** Browser E2E
- **Expected result:** Select source timestamp
- **Priority:** Player seeks to correct offset
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-034-E2E — Audio seek / Browser/E2E
- **Precondition:** Browser E2E
- **Expected result:** Select source timestamp
- **Priority:** Player seeks to correct offset
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-035-UNIT — Transcript search / Unit/domain
- **Precondition:** Browser E2E
- **Expected result:** Search authorized transcript
- **Priority:** Matches/time or no-match state
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-035-INT — Transcript search / API/storage integration
- **Precondition:** Browser E2E
- **Expected result:** Search authorized transcript
- **Priority:** Matches/time or no-match state
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-035-E2E — Transcript search / Browser/E2E
- **Precondition:** Browser E2E
- **Expected result:** Search authorized transcript
- **Priority:** Matches/time or no-match state
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-036-UNIT — Expired source UI / Unit/domain
- **Precondition:** Browser E2E
- **Expected result:** Media object deleted
- **Priority:** Player disabled, message truthful
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-036-INT — Expired source UI / API/storage integration
- **Precondition:** Browser E2E
- **Expected result:** Media object deleted
- **Priority:** Player disabled, message truthful
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-036-E2E — Expired source UI / Browser/E2E
- **Precondition:** Browser E2E
- **Expected result:** Media object deleted
- **Priority:** Player disabled, message truthful
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-037-UNIT — CSV formula injection / Unit/domain
- **Precondition:** Export
- **Expected result:** Cell begins formula marker
- **Priority:** Payload escaped/inert
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-037-INT — CSV formula injection / API/storage integration
- **Precondition:** Export
- **Expected result:** Cell begins formula marker
- **Priority:** Payload escaped/inert
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-037-E2E — CSV formula injection / Browser/E2E
- **Precondition:** Export
- **Expected result:** Cell begins formula marker
- **Priority:** Payload escaped/inert
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-038-UNIT — Report run pin / Unit/domain
- **Precondition:** Export
- **Expected result:** Two analysis runs exist
- **Priority:** Report matches selected run only
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-038-INT — Report run pin / API/storage integration
- **Precondition:** Export
- **Expected result:** Two analysis runs exist
- **Priority:** Report matches selected run only
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-038-E2E — Report run pin / Browser/E2E
- **Precondition:** Export
- **Expected result:** Two analysis runs exist
- **Priority:** Report matches selected run only
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-039-UNIT — Report caveat / Unit/domain
- **Precondition:** Export
- **Expected result:** Generate print output
- **Priority:** Limits and provenance visible
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-039-INT — Report caveat / API/storage integration
- **Precondition:** Export
- **Expected result:** Generate print output
- **Priority:** Limits and provenance visible
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-039-E2E — Report caveat / Browser/E2E
- **Precondition:** Export
- **Expected result:** Generate print output
- **Priority:** Limits and provenance visible
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-040-UNIT — Provider key scan / Unit/domain
- **Precondition:** Build security
- **Expected result:** Build and browser assets inspected
- **Priority:** No secret exposed
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-040-INT — Provider key scan / API/storage integration
- **Precondition:** Build security
- **Expected result:** Build and browser assets inspected
- **Priority:** No secret exposed
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-040-E2E — Provider key scan / Browser/E2E
- **Precondition:** Build security
- **Expected result:** Build and browser assets inspected
- **Priority:** No secret exposed
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-041-UNIT — Log privacy / Unit/domain
- **Precondition:** Operations
- **Expected result:** Known synthetic secret/phrase used
- **Priority:** Sensitive text absent from logs
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-041-INT — Log privacy / API/storage integration
- **Precondition:** Operations
- **Expected result:** Known synthetic secret/phrase used
- **Priority:** Sensitive text absent from logs
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-041-E2E — Log privacy / Browser/E2E
- **Precondition:** Operations
- **Expected result:** Known synthetic secret/phrase used
- **Priority:** Sensitive text absent from logs
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-042-UNIT — Retention deletion / Unit/domain
- **Precondition:** Storage integration
- **Expected result:** Test object reaches expiry
- **Priority:** Object deletion confirmed
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-042-INT — Retention deletion / API/storage integration
- **Precondition:** Storage integration
- **Expected result:** Test object reaches expiry
- **Priority:** Object deletion confirmed
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-042-E2E — Retention deletion / Browser/E2E
- **Precondition:** Storage integration
- **Expected result:** Test object reaches expiry
- **Priority:** Object deletion confirmed
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-043-UNIT — Deletion failure / Unit/domain
- **Precondition:** Retention
- **Expected result:** Storage returns error
- **Priority:** State remains pending/failed
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-043-INT — Deletion failure / API/storage integration
- **Precondition:** Retention
- **Expected result:** Storage returns error
- **Priority:** State remains pending/failed
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-043-E2E — Deletion failure / Browser/E2E
- **Precondition:** Retention
- **Expected result:** Storage returns error
- **Priority:** State remains pending/failed
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-044-UNIT — Remote file lifecycle / Unit/domain
- **Precondition:** Provider compliance
- **Expected result:** File API creates remote artefact
- **Priority:** Behavior verified/documented
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-044-INT — Remote file lifecycle / API/storage integration
- **Precondition:** Provider compliance
- **Expected result:** File API creates remote artefact
- **Priority:** Behavior verified/documented
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-044-E2E — Remote file lifecycle / Browser/E2E
- **Precondition:** Provider compliance
- **Expected result:** File API creates remote artefact
- **Priority:** Behavior verified/documented
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-045-UNIT — Demo fixture isolation / Unit/domain
- **Precondition:** Demo
- **Expected result:** Synthetic recording selected
- **Priority:** Visible label and isolated list
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-045-INT — Demo fixture isolation / API/storage integration
- **Precondition:** Demo
- **Expected result:** Synthetic recording selected
- **Priority:** Visible label and isolated list
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-045-E2E — Demo fixture isolation / Browser/E2E
- **Precondition:** Demo
- **Expected result:** Synthetic recording selected
- **Priority:** Visible label and isolated list
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-046-UNIT — Unknown language / Unit/domain
- **Precondition:** AI quality
- **Expected result:** Unsupported language sample
- **Priority:** Unknown/manual review, no guessed prose
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-046-INT — Unknown language / API/storage integration
- **Precondition:** AI quality
- **Expected result:** Unsupported language sample
- **Priority:** Unknown/manual review, no guessed prose
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-046-E2E — Unknown language / Browser/E2E
- **Precondition:** AI quality
- **Expected result:** Unsupported language sample
- **Priority:** Unknown/manual review, no guessed prose
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-047-UNIT — No transcript / Unit/domain
- **Precondition:** AI quality
- **Expected result:** Empty valid provider result
- **Priority:** Distinct from failed/no trigger
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-047-INT — No transcript / API/storage integration
- **Precondition:** AI quality
- **Expected result:** Empty valid provider result
- **Priority:** Distinct from failed/no trigger
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-047-E2E — No transcript / Browser/E2E
- **Precondition:** AI quality
- **Expected result:** Empty valid provider result
- **Priority:** Distinct from failed/no trigger
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-048-UNIT — No triggers / Unit/domain
- **Precondition:** AI quality
- **Expected result:** Successful result with none
- **Priority:** Never labelled safe
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-048-INT — No triggers / API/storage integration
- **Precondition:** AI quality
- **Expected result:** Successful result with none
- **Priority:** Never labelled safe
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-048-E2E — No triggers / Browser/E2E
- **Precondition:** AI quality
- **Expected result:** Successful result with none
- **Priority:** Never labelled safe
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-049-UNIT — Migration RLS / Unit/domain
- **Precondition:** Database
- **Expected result:** Build from empty DB
- **Priority:** All private table policies active
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-049-INT — Migration RLS / API/storage integration
- **Precondition:** Database
- **Expected result:** Build from empty DB
- **Priority:** All private table policies active
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-049-E2E — Migration RLS / Browser/E2E
- **Precondition:** Database
- **Expected result:** Build from empty DB
- **Priority:** All private table policies active
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-050-UNIT — Logout cache / Unit/domain
- **Precondition:** Browser E2E
- **Expected result:** Sign out after reviewing case
- **Priority:** Sensitive client state cleared
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-050-INT — Logout cache / API/storage integration
- **Precondition:** Browser E2E
- **Expected result:** Sign out after reviewing case
- **Priority:** Sensitive client state cleared
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-050-E2E — Logout cache / Browser/E2E
- **Precondition:** Browser E2E
- **Expected result:** Sign out after reviewing case
- **Priority:** Sensitive client state cleared
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-051-UNIT — Responsive Stop / Unit/domain
- **Precondition:** Accessibility
- **Expected result:** Live page narrow viewport
- **Priority:** Stop and evidence remain usable
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-051-INT — Responsive Stop / API/storage integration
- **Precondition:** Accessibility
- **Expected result:** Live page narrow viewport
- **Priority:** Stop and evidence remain usable
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-051-E2E — Responsive Stop / Browser/E2E
- **Precondition:** Accessibility
- **Expected result:** Live page narrow viewport
- **Priority:** Stop and evidence remain usable
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-052-UNIT — Keyboard review / Unit/domain
- **Precondition:** Accessibility
- **Expected result:** No mouse available
- **Priority:** Core flow completable
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-052-INT — Keyboard review / API/storage integration
- **Precondition:** Accessibility
- **Expected result:** No mouse available
- **Priority:** Core flow completable
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-052-E2E — Keyboard review / Browser/E2E
- **Precondition:** Accessibility
- **Expected result:** No mouse available
- **Priority:** Core flow completable
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

### TEST-053-UNIT — Source label / Unit/domain
- **Precondition:** Report
- **Expected result:** Entity extracted from speech
- **Priority:** Unverified claim is labelled
- **Method:** Run deterministic pure tests with schema/provider repositories mocked, without network.

### TEST-053-INT — Source label / API/storage integration
- **Precondition:** Report
- **Expected result:** Entity extracted from speech
- **Priority:** Unverified claim is labelled
- **Method:** Run against a test database/bucket with separate test users and isolated credentials.

### TEST-053-E2E — Source label / Browser/E2E
- **Precondition:** Report
- **Expected result:** Entity extracted from speech
- **Priority:** Unverified claim is labelled
- **Method:** Use seeded synthetic fixture and test browser permissions/network interception where possible.

## Evidence required for each executed test

- Test ID and test level.
- Commit/build identifier and environment label.
- Fixture ID and authorization basis; don't attach sensitive source media.
- Exact action/request made and expected result.
- Actual result with relevant safe status/request ID.
- Whether the test passed, failed, blocked or was not run.
- If failed, a minimal reproducible case using synthetic data.
- For model checks: model ID, prompt/schema version, sample count, reference annotations, observed latency and reviewer judgment.
- For deletion checks: evidence that the actual test object is absent, not just a database flag.

## Release acceptance gates
### GATE-01 — Recorded path
- **Pass condition:** One authorized synthetic clip finishes upload, transcript, findings, review and export
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-02 — Source mapping
- **Pass condition:** Transcript and findings seek to correct media interval where available
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-03 — Transcript integrity
- **Pass condition:** Unclear terms and invalid times stay explicit
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-04 — Trigger context
- **Pass condition:** Positive, negated, historical and hypothetical fixtures handled contextually
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-05 — Vocal cue
- **Pass condition:** Feature gated by audio grounding and abstention test; otherwise disabled
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-06 — Live path
- **Pass condition:** Real microphone/socket path works or feature explicitly disabled
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-07 — Authorization
- **Pass condition:** Cross-user reads/mutations/exports/deletes denied
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-08 — Secret hygiene
- **Pass condition:** No credential in browser bundle, response or logs
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-09 — Private media
- **Pass condition:** Anonymous/wrong-user access refused
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-10 — Retention
- **Pass condition:** Audio object expiry/deletion outcome verified
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-11 — Review provenance
- **Pass condition:** Correction/dismissal persists with actor and history
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-12 — Report consistency
- **Pass condition:** Export matches selected run and includes limitations
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-13 — Failure honesty
- **Pass condition:** Empty, failed, partial and abstained outcomes distinct
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-14 — Cost safety
- **Pass condition:** Upload/concurrency/rate/retry bounds enforced server-side
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-15 — Demo hygiene
- **Pass condition:** Fixture source authorized and synthetic badge visible
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-16 — Accessibility
- **Pass condition:** Primary path keyboard-usable with visible focus
- **Priority:** P1
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-17 — Responsive layout
- **Pass condition:** Evidence and Stop controls remain available at test widths
- **Priority:** P1
- **Evidence:** Attach test result; authoring the document is not a pass.

### GATE-18 — Documentation parity
- **Pass condition:** Untested/experimental capabilities labelled accurately
- **Priority:** P0
- **Evidence:** Attach test result; authoring the document is not a pass.

## Model evaluation scoreboard

Track independent dimensions rather than a single summary accuracy number.

| Dimension | Measurement approach | Caution |
|---|---|---|
| Transcript content | Compare normalized transcript with human-checked reference | Report language, sample size and normalization |
| Time alignment | Absolute offset error on annotated spans | Do not infer precision from rounded UI timestamps |
| Entity grounding | Fraction of candidates with correct source phrase plus hallucination count | False positive and false negative both matter |
| Trigger context | Positive/negative contextual scenario outcomes | Keyword recall alone is not enough |
| Cue grounding | Human review of acoustic basis and interval | Small fixture set isn't scientific validation |
| Abstention | Whether low-evidence samples can return insufficient evidence | No forced class |
| Repeatability | Difference across repeated runs | Model nondeterminism may be expected |
| Latency | Upload, provider, normalization and persistence stage times | Include media duration and environment |
| Failure recovery | Outcome of timeout, quota, socket and storage faults | No fake complete state |
| Fairness coverage | Language/dialect/sample coverage inventory | Don't claim broad fairness from a small sample |

## Regression policy

- Every model ID, prompt, schema, parser, timestamp mapping or provider SDK change runs relevant regression tests.
- Maintain a small synthetic holdout set not used for routine prompt tuning.
- Keep golden outputs as acceptance bands/required invariants rather than brittle exact match for all model prose.
- Any change causing a prohibited inference is a release blocker even if other metrics improve.
- Any unsupported trigger/emotion result without evidence requires feature hold or rollback.
- Keep previous run outputs isolated for reproducibility.
- Re-run security-negative tests after changes to auth, RLS, storage paths or exports.
- Re-run media deletion tests after Storage, provider-file or scheduler changes.
- Mark unknown/untested as Pending; never silently mark as Passed.

## Runbook for a failing test

1. Record test ID, commit, fixture ID and safe request ID.
2. Reproduce with the same synthetic fixture and configuration.
3. Identify the failing boundary: browser, route validation, authorization, storage, provider, normalization, persistence or export.
4. Do not paste secrets, raw sensitive audio or live transcripts into logs/issues.
5. Fix the narrow failing boundary and preserve the regression fixture.
6. Re-run the failing test and nearby contract tests.
7. Update the traceability matrix and evidence record.
8. If risk is high, disable the related feature until regression passes.

## Official references

- https://nextjs.org/docs/app/building-your-application/testing
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://ai.google.dev/gemini-api/docs/transcribe

## Acceptance rule

Only tests actually executed in a named environment can be marked passed. A mocked provider test is not evidence that a real API key/model/endpoint works.
