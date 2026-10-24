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


## Extended negative and recovery test matrix

This appendix is a repeatable test inventory. One scenario is intentionally verified at separate layers because a unit test cannot prove authorization, real storage behavior or browser state.

### EXT-Test01-UNIT — Wrong-case ID read
- **Precondition:** Wrong-case ID read
- **Expected invariant:** No metadata and no body returned
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test01-API_INT — Wrong-case ID read
- **Precondition:** Wrong-case ID read
- **Expected invariant:** No metadata and no body returned
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test01-BROWSER_E2E — Wrong-case ID read
- **Precondition:** Wrong-case ID read
- **Expected invariant:** No metadata and no body returned
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test01-OPS_NEGATIVE — Wrong-case ID read
- **Precondition:** Wrong-case ID read
- **Expected invariant:** No metadata and no body returned
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test02-UNIT — Wrong-case ID mutate
- **Precondition:** Wrong-case ID mutate
- **Expected invariant:** No state changed
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test02-API_INT — Wrong-case ID mutate
- **Precondition:** Wrong-case ID mutate
- **Expected invariant:** No state changed
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test02-BROWSER_E2E — Wrong-case ID mutate
- **Precondition:** Wrong-case ID mutate
- **Expected invariant:** No state changed
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test02-OPS_NEGATIVE — Wrong-case ID mutate
- **Precondition:** Wrong-case ID mutate
- **Expected invariant:** No state changed
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test03-UNIT — Wrong-case audio download
- **Precondition:** Wrong-case audio download
- **Expected invariant:** No media bytes
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test03-API_INT — Wrong-case audio download
- **Precondition:** Wrong-case audio download
- **Expected invariant:** No media bytes
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test03-BROWSER_E2E — Wrong-case audio download
- **Precondition:** Wrong-case audio download
- **Expected invariant:** No media bytes
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test03-OPS_NEGATIVE — Wrong-case audio download
- **Precondition:** Wrong-case audio download
- **Expected invariant:** No media bytes
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test04-UNIT — Wrong-case report export
- **Precondition:** Wrong-case report export
- **Expected invariant:** No report emitted
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test04-API_INT — Wrong-case report export
- **Precondition:** Wrong-case report export
- **Expected invariant:** No report emitted
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test04-BROWSER_E2E — Wrong-case report export
- **Precondition:** Wrong-case report export
- **Expected invariant:** No report emitted
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test04-OPS_NEGATIVE — Wrong-case report export
- **Precondition:** Wrong-case report export
- **Expected invariant:** No report emitted
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test05-UNIT — Wrong-case delete
- **Precondition:** Wrong-case delete
- **Expected invariant:** No object deleted
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test05-API_INT — Wrong-case delete
- **Precondition:** Wrong-case delete
- **Expected invariant:** No object deleted
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test05-BROWSER_E2E — Wrong-case delete
- **Precondition:** Wrong-case delete
- **Expected invariant:** No object deleted
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test05-OPS_NEGATIVE — Wrong-case delete
- **Precondition:** Wrong-case delete
- **Expected invariant:** No object deleted
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test06-UNIT — Anonymous request
- **Precondition:** Anonymous request
- **Expected invariant:** 401 or policy-consistent denial
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test06-API_INT — Anonymous request
- **Precondition:** Anonymous request
- **Expected invariant:** 401 or policy-consistent denial
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test06-BROWSER_E2E — Anonymous request
- **Precondition:** Anonymous request
- **Expected invariant:** 401 or policy-consistent denial
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test06-OPS_NEGATIVE — Anonymous request
- **Precondition:** Anonymous request
- **Expected invariant:** 401 or policy-consistent denial
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test07-UNIT — Expired session
- **Precondition:** Expired session
- **Expected invariant:** Protected endpoint denied and client cache cleared
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test07-API_INT — Expired session
- **Precondition:** Expired session
- **Expected invariant:** Protected endpoint denied and client cache cleared
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test07-BROWSER_E2E — Expired session
- **Precondition:** Expired session
- **Expected invariant:** Protected endpoint denied and client cache cleared
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test07-OPS_NEGATIVE — Expired session
- **Precondition:** Expired session
- **Expected invariant:** Protected endpoint denied and client cache cleared
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test08-UNIT — Forged actor in JSON
- **Precondition:** Forged actor in JSON
- **Expected invariant:** Session actor wins; forged actor ignored/rejected
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test08-API_INT — Forged actor in JSON
- **Precondition:** Forged actor in JSON
- **Expected invariant:** Session actor wins; forged actor ignored/rejected
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test08-BROWSER_E2E — Forged actor in JSON
- **Precondition:** Forged actor in JSON
- **Expected invariant:** Session actor wins; forged actor ignored/rejected
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test08-OPS_NEGATIVE — Forged actor in JSON
- **Precondition:** Forged actor in JSON
- **Expected invariant:** Session actor wins; forged actor ignored/rejected
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test09-UNIT — Arbitrary storage key
- **Precondition:** Arbitrary storage key
- **Expected invariant:** Upload/download/delete scope rejected
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test09-API_INT — Arbitrary storage key
- **Precondition:** Arbitrary storage key
- **Expected invariant:** Upload/download/delete scope rejected
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test09-BROWSER_E2E — Arbitrary storage key
- **Precondition:** Arbitrary storage key
- **Expected invariant:** Upload/download/delete scope rejected
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test09-OPS_NEGATIVE — Arbitrary storage key
- **Precondition:** Arbitrary storage key
- **Expected invariant:** Upload/download/delete scope rejected
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test10-UNIT — Expired signed grant
- **Precondition:** Expired signed grant
- **Expected invariant:** Operation rejected; re-authorize if allowed
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test10-API_INT — Expired signed grant
- **Precondition:** Expired signed grant
- **Expected invariant:** Operation rejected; re-authorize if allowed
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test10-BROWSER_E2E — Expired signed grant
- **Precondition:** Expired signed grant
- **Expected invariant:** Operation rejected; re-authorize if allowed
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test10-OPS_NEGATIVE — Expired signed grant
- **Precondition:** Expired signed grant
- **Expected invariant:** Operation rejected; re-authorize if allowed
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test11-UNIT — Extension/media mismatch
- **Precondition:** Extension/media mismatch
- **Expected invariant:** Reject before paid provider request
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test11-API_INT — Extension/media mismatch
- **Precondition:** Extension/media mismatch
- **Expected invariant:** Reject before paid provider request
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test11-BROWSER_E2E — Extension/media mismatch
- **Precondition:** Extension/media mismatch
- **Expected invariant:** Reject before paid provider request
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test11-OPS_NEGATIVE — Extension/media mismatch
- **Precondition:** Extension/media mismatch
- **Expected invariant:** Reject before paid provider request
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test12-UNIT — Oversized upload
- **Precondition:** Oversized upload
- **Expected invariant:** Reject at server boundary
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test12-API_INT — Oversized upload
- **Precondition:** Oversized upload
- **Expected invariant:** Reject at server boundary
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test12-BROWSER_E2E — Oversized upload
- **Precondition:** Oversized upload
- **Expected invariant:** Reject at server boundary
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test12-OPS_NEGATIVE — Oversized upload
- **Precondition:** Oversized upload
- **Expected invariant:** Reject at server boundary
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test13-UNIT — Duration over limit
- **Precondition:** Duration over limit
- **Expected invariant:** Reject or documented supported segmentation
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test13-API_INT — Duration over limit
- **Precondition:** Duration over limit
- **Expected invariant:** Reject or documented supported segmentation
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test13-BROWSER_E2E — Duration over limit
- **Precondition:** Duration over limit
- **Expected invariant:** Reject or documented supported segmentation
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test13-OPS_NEGATIVE — Duration over limit
- **Precondition:** Duration over limit
- **Expected invariant:** Reject or documented supported segmentation
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test14-UNIT — Duplicate analysis POST
- **Precondition:** Duplicate analysis POST
- **Expected invariant:** Defined idempotent or explicitly separate run
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test14-API_INT — Duplicate analysis POST
- **Precondition:** Duplicate analysis POST
- **Expected invariant:** Defined idempotent or explicitly separate run
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test14-BROWSER_E2E — Duplicate analysis POST
- **Precondition:** Duplicate analysis POST
- **Expected invariant:** Defined idempotent or explicitly separate run
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test14-OPS_NEGATIVE — Duplicate analysis POST
- **Precondition:** Duplicate analysis POST
- **Expected invariant:** Defined idempotent or explicitly separate run
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test15-UNIT — Replay same key different payload
- **Precondition:** Replay same key different payload
- **Expected invariant:** Conflict
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test15-API_INT — Replay same key different payload
- **Precondition:** Replay same key different payload
- **Expected invariant:** Conflict
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test15-BROWSER_E2E — Replay same key different payload
- **Precondition:** Replay same key different payload
- **Expected invariant:** Conflict
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test15-OPS_NEGATIVE — Replay same key different payload
- **Precondition:** Replay same key different payload
- **Expected invariant:** Conflict
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test16-UNIT — Provider 429
- **Precondition:** Provider 429
- **Expected invariant:** Bounded retry; no retry storm
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test16-API_INT — Provider 429
- **Precondition:** Provider 429
- **Expected invariant:** Bounded retry; no retry storm
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test16-BROWSER_E2E — Provider 429
- **Precondition:** Provider 429
- **Expected invariant:** Bounded retry; no retry storm
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test16-OPS_NEGATIVE — Provider 429
- **Precondition:** Provider 429
- **Expected invariant:** Bounded retry; no retry storm
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test17-UNIT — Provider timeout after partial output
- **Precondition:** Provider timeout after partial output
- **Expected invariant:** Honest partial/failure state
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test17-API_INT — Provider timeout after partial output
- **Precondition:** Provider timeout after partial output
- **Expected invariant:** Honest partial/failure state
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test17-BROWSER_E2E — Provider timeout after partial output
- **Precondition:** Provider timeout after partial output
- **Expected invariant:** Honest partial/failure state
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test17-OPS_NEGATIVE — Provider timeout after partial output
- **Precondition:** Provider timeout after partial output
- **Expected invariant:** Honest partial/failure state
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test18-UNIT — Provider schema change
- **Precondition:** Provider schema change
- **Expected invariant:** Validation error and adapter gate
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test18-API_INT — Provider schema change
- **Precondition:** Provider schema change
- **Expected invariant:** Validation error and adapter gate
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test18-BROWSER_E2E — Provider schema change
- **Precondition:** Provider schema change
- **Expected invariant:** Validation error and adapter gate
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test18-OPS_NEGATIVE — Provider schema change
- **Precondition:** Provider schema change
- **Expected invariant:** Validation error and adapter gate
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test19-UNIT — No transcript segments
- **Precondition:** No transcript segments
- **Expected invariant:** No-transcript state, not safe result
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test19-API_INT — No transcript segments
- **Precondition:** No transcript segments
- **Expected invariant:** No-transcript state, not safe result
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test19-BROWSER_E2E — No transcript segments
- **Precondition:** No transcript segments
- **Expected invariant:** No-transcript state, not safe result
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test19-OPS_NEGATIVE — No transcript segments
- **Precondition:** No transcript segments
- **Expected invariant:** No-transcript state, not safe result
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test20-UNIT — No trigger candidates
- **Precondition:** No trigger candidates
- **Expected invariant:** Neutral empty candidate list
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test20-API_INT — No trigger candidates
- **Precondition:** No trigger candidates
- **Expected invariant:** Neutral empty candidate list
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test20-BROWSER_E2E — No trigger candidates
- **Precondition:** No trigger candidates
- **Expected invariant:** Neutral empty candidate list
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test20-OPS_NEGATIVE — No trigger candidates
- **Precondition:** No trigger candidates
- **Expected invariant:** Neutral empty candidate list
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test21-UNIT — Negative threat context
- **Precondition:** Negative threat context
- **Expected invariant:** No keyword-only trigger
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test21-API_INT — Negative threat context
- **Precondition:** Negative threat context
- **Expected invariant:** No keyword-only trigger
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test21-BROWSER_E2E — Negative threat context
- **Precondition:** Negative threat context
- **Expected invariant:** No keyword-only trigger
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test21-OPS_NEGATIVE — Negative threat context
- **Precondition:** Negative threat context
- **Expected invariant:** No keyword-only trigger
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test22-UNIT — Historical threat context
- **Precondition:** Historical threat context
- **Expected invariant:** Past/report attribution retained
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test22-API_INT — Historical threat context
- **Precondition:** Historical threat context
- **Expected invariant:** Past/report attribution retained
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test22-BROWSER_E2E — Historical threat context
- **Precondition:** Historical threat context
- **Expected invariant:** Past/report attribution retained
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test22-OPS_NEGATIVE — Historical threat context
- **Precondition:** Historical threat context
- **Expected invariant:** Past/report attribution retained
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test23-UNIT — Hypothetical threat context
- **Precondition:** Hypothetical threat context
- **Expected invariant:** Conditional status preserved
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test23-API_INT — Hypothetical threat context
- **Precondition:** Hypothetical threat context
- **Expected invariant:** Conditional status preserved
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test23-BROWSER_E2E — Hypothetical threat context
- **Precondition:** Hypothetical threat context
- **Expected invariant:** Conditional status preserved
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test23-OPS_NEGATIVE — Hypothetical threat context
- **Precondition:** Hypothetical threat context
- **Expected invariant:** Conditional status preserved
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test24-UNIT — Quote attribution
- **Precondition:** Quote attribution
- **Expected invariant:** Reported words not assigned as intent automatically
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test24-API_INT — Quote attribution
- **Precondition:** Quote attribution
- **Expected invariant:** Reported words not assigned as intent automatically
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test24-BROWSER_E2E — Quote attribution
- **Precondition:** Quote attribution
- **Expected invariant:** Reported words not assigned as intent automatically
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test24-OPS_NEGATIVE — Quote attribution
- **Precondition:** Quote attribution
- **Expected invariant:** Reported words not assigned as intent automatically
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test25-UNIT — Model omits confidence
- **Precondition:** Model omits confidence
- **Expected invariant:** Null/not-provided
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test25-API_INT — Model omits confidence
- **Precondition:** Model omits confidence
- **Expected invariant:** Null/not-provided
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test25-BROWSER_E2E — Model omits confidence
- **Precondition:** Model omits confidence
- **Expected invariant:** Null/not-provided
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test25-OPS_NEGATIVE — Model omits confidence
- **Precondition:** Model omits confidence
- **Expected invariant:** Null/not-provided
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test26-UNIT — Model emits unsupported identity field
- **Precondition:** Model emits unsupported identity field
- **Expected invariant:** Field rejected/removed
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test26-API_INT — Model emits unsupported identity field
- **Precondition:** Model emits unsupported identity field
- **Expected invariant:** Field rejected/removed
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test26-BROWSER_E2E — Model emits unsupported identity field
- **Precondition:** Model emits unsupported identity field
- **Expected invariant:** Field rejected/removed
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test26-OPS_NEGATIVE — Model emits unsupported identity field
- **Precondition:** Model emits unsupported identity field
- **Expected invariant:** Field rejected/removed
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test27-UNIT — Finding references other run
- **Precondition:** Finding references other run
- **Expected invariant:** Persist rejected
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test27-API_INT — Finding references other run
- **Precondition:** Finding references other run
- **Expected invariant:** Persist rejected
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test27-BROWSER_E2E — Finding references other run
- **Precondition:** Finding references other run
- **Expected invariant:** Persist rejected
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test27-OPS_NEGATIVE — Finding references other run
- **Precondition:** Finding references other run
- **Expected invariant:** Persist rejected
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test28-UNIT — Finding has no evidence
- **Precondition:** Finding has no evidence
- **Expected invariant:** Reject or explicitly non-evidentiary type
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test28-API_INT — Finding has no evidence
- **Precondition:** Finding has no evidence
- **Expected invariant:** Reject or explicitly non-evidentiary type
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test28-BROWSER_E2E — Finding has no evidence
- **Precondition:** Finding has no evidence
- **Expected invariant:** Reject or explicitly non-evidentiary type
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test28-OPS_NEGATIVE — Finding has no evidence
- **Precondition:** Finding has no evidence
- **Expected invariant:** Reject or explicitly non-evidentiary type
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test29-UNIT — Negative time offset
- **Precondition:** Negative time offset
- **Expected invariant:** Invalid
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test29-API_INT — Negative time offset
- **Precondition:** Negative time offset
- **Expected invariant:** Invalid
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test29-BROWSER_E2E — Negative time offset
- **Precondition:** Negative time offset
- **Expected invariant:** Invalid
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test29-OPS_NEGATIVE — Negative time offset
- **Precondition:** Negative time offset
- **Expected invariant:** Invalid
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test30-UNIT — Offset beyond recording
- **Precondition:** Offset beyond recording
- **Expected invariant:** Reject/flag
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test30-API_INT — Offset beyond recording
- **Precondition:** Offset beyond recording
- **Expected invariant:** Reject/flag
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test30-BROWSER_E2E — Offset beyond recording
- **Precondition:** Offset beyond recording
- **Expected invariant:** Reject/flag
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test30-OPS_NEGATIVE — Offset beyond recording
- **Precondition:** Offset beyond recording
- **Expected invariant:** Reject/flag
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test31-UNIT — Transcript correction
- **Precondition:** Transcript correction
- **Expected invariant:** Original preserved and correction attributed
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test31-API_INT — Transcript correction
- **Precondition:** Transcript correction
- **Expected invariant:** Original preserved and correction attributed
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test31-BROWSER_E2E — Transcript correction
- **Precondition:** Transcript correction
- **Expected invariant:** Original preserved and correction attributed
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test31-OPS_NEGATIVE — Transcript correction
- **Precondition:** Transcript correction
- **Expected invariant:** Original preserved and correction attributed
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test32-UNIT — Late model write after correction
- **Precondition:** Late model write after correction
- **Expected invariant:** No silent overwrite
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test32-API_INT — Late model write after correction
- **Precondition:** Late model write after correction
- **Expected invariant:** No silent overwrite
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test32-BROWSER_E2E — Late model write after correction
- **Precondition:** Late model write after correction
- **Expected invariant:** No silent overwrite
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test32-OPS_NEGATIVE — Late model write after correction
- **Precondition:** Late model write after correction
- **Expected invariant:** No silent overwrite
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test33-UNIT — Concurrent review update
- **Precondition:** Concurrent review update
- **Expected invariant:** Stale version conflict
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test33-API_INT — Concurrent review update
- **Precondition:** Concurrent review update
- **Expected invariant:** Stale version conflict
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test33-BROWSER_E2E — Concurrent review update
- **Precondition:** Concurrent review update
- **Expected invariant:** Stale version conflict
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test33-OPS_NEGATIVE — Concurrent review update
- **Precondition:** Concurrent review update
- **Expected invariant:** Stale version conflict
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test34-UNIT — CSV formula starts with equals
- **Precondition:** CSV formula starts with equals
- **Expected invariant:** Escaped/inert cell
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test34-API_INT — CSV formula starts with equals
- **Precondition:** CSV formula starts with equals
- **Expected invariant:** Escaped/inert cell
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test34-BROWSER_E2E — CSV formula starts with equals
- **Precondition:** CSV formula starts with equals
- **Expected invariant:** Escaped/inert cell
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test34-OPS_NEGATIVE — CSV formula starts with equals
- **Precondition:** CSV formula starts with equals
- **Expected invariant:** Escaped/inert cell
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test35-UNIT — Export selected older run
- **Precondition:** Export selected older run
- **Expected invariant:** Output matches older run only
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test35-API_INT — Export selected older run
- **Precondition:** Export selected older run
- **Expected invariant:** Output matches older run only
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test35-BROWSER_E2E — Export selected older run
- **Precondition:** Export selected older run
- **Expected invariant:** Output matches older run only
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test35-OPS_NEGATIVE — Export selected older run
- **Precondition:** Export selected older run
- **Expected invariant:** Output matches older run only
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test36-UNIT — Delete storage failure
- **Precondition:** Delete storage failure
- **Expected invariant:** State remains pending/failed
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test36-API_INT — Delete storage failure
- **Precondition:** Delete storage failure
- **Expected invariant:** State remains pending/failed
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test36-BROWSER_E2E — Delete storage failure
- **Precondition:** Delete storage failure
- **Expected invariant:** State remains pending/failed
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test36-OPS_NEGATIVE — Delete storage failure
- **Precondition:** Delete storage failure
- **Expected invariant:** State remains pending/failed
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test37-UNIT — Provider remote file
- **Precondition:** Provider remote file
- **Expected invariant:** Lifecycle status independently verified
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test37-API_INT — Provider remote file
- **Precondition:** Provider remote file
- **Expected invariant:** Lifecycle status independently verified
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test37-BROWSER_E2E — Provider remote file
- **Precondition:** Provider remote file
- **Expected invariant:** Lifecycle status independently verified
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test37-OPS_NEGATIVE — Provider remote file
- **Precondition:** Provider remote file
- **Expected invariant:** Lifecycle status independently verified
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test38-UNIT — Repeated live interim event
- **Precondition:** Repeated live interim event
- **Expected invariant:** No duplicate segment
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test38-API_INT — Repeated live interim event
- **Precondition:** Repeated live interim event
- **Expected invariant:** No duplicate segment
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test38-BROWSER_E2E — Repeated live interim event
- **Precondition:** Repeated live interim event
- **Expected invariant:** No duplicate segment
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test38-OPS_NEGATIVE — Repeated live interim event
- **Precondition:** Repeated live interim event
- **Expected invariant:** No duplicate segment
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test39-UNIT — Late event after stop
- **Precondition:** Late event after stop
- **Expected invariant:** Close/finalization rule enforced
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test39-API_INT — Late event after stop
- **Precondition:** Late event after stop
- **Expected invariant:** Close/finalization rule enforced
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test39-BROWSER_E2E — Late event after stop
- **Precondition:** Late event after stop
- **Expected invariant:** Close/finalization rule enforced
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test39-OPS_NEGATIVE — Late event after stop
- **Precondition:** Late event after stop
- **Expected invariant:** Close/finalization rule enforced
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test40-UNIT — Mic permission denied
- **Precondition:** Mic permission denied
- **Expected invariant:** Recorded audio option available
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test40-API_INT — Mic permission denied
- **Precondition:** Mic permission denied
- **Expected invariant:** Recorded audio option available
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test40-BROWSER_E2E — Mic permission denied
- **Precondition:** Mic permission denied
- **Expected invariant:** Recorded audio option available
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test40-OPS_NEGATIVE — Mic permission denied
- **Precondition:** Mic permission denied
- **Expected invariant:** Recorded audio option available
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test41-UNIT — Live socket close
- **Precondition:** Live socket close
- **Expected invariant:** No false connected state
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test41-API_INT — Live socket close
- **Precondition:** Live socket close
- **Expected invariant:** No false connected state
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test41-BROWSER_E2E — Live socket close
- **Precondition:** Live socket close
- **Expected invariant:** No false connected state
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test41-OPS_NEGATIVE — Live socket close
- **Precondition:** Live socket close
- **Expected invariant:** No false connected state
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test42-UNIT — Cue feature flag off
- **Precondition:** Cue feature flag off
- **Expected invariant:** No cue output and recorded pipeline works
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test42-API_INT — Cue feature flag off
- **Precondition:** Cue feature flag off
- **Expected invariant:** No cue output and recorded pipeline works
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test42-BROWSER_E2E — Cue feature flag off
- **Precondition:** Cue feature flag off
- **Expected invariant:** No cue output and recorded pipeline works
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test42-OPS_NEGATIVE — Cue feature flag off
- **Precondition:** Cue feature flag off
- **Expected invariant:** No cue output and recorded pipeline works
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test43-UNIT — Prompt injection spoken
- **Precondition:** Prompt injection spoken
- **Expected invariant:** Treated as data, not instructions
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test43-API_INT — Prompt injection spoken
- **Precondition:** Prompt injection spoken
- **Expected invariant:** Treated as data, not instructions
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test43-BROWSER_E2E — Prompt injection spoken
- **Precondition:** Prompt injection spoken
- **Expected invariant:** Treated as data, not instructions
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test43-OPS_NEGATIVE — Prompt injection spoken
- **Precondition:** Prompt injection spoken
- **Expected invariant:** Treated as data, not instructions
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test44-UNIT — Log inspect after known phrase
- **Precondition:** Log inspect after known phrase
- **Expected invariant:** Transcript/phone absent by default
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test44-API_INT — Log inspect after known phrase
- **Precondition:** Log inspect after known phrase
- **Expected invariant:** Transcript/phone absent by default
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test44-BROWSER_E2E — Log inspect after known phrase
- **Precondition:** Log inspect after known phrase
- **Expected invariant:** Transcript/phone absent by default
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test44-OPS_NEGATIVE — Log inspect after known phrase
- **Precondition:** Log inspect after known phrase
- **Expected invariant:** Transcript/phone absent by default
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test45-UNIT — Secret string in environment
- **Precondition:** Secret string in environment
- **Expected invariant:** No echo in error/build output
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test45-API_INT — Secret string in environment
- **Precondition:** Secret string in environment
- **Expected invariant:** No echo in error/build output
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test45-BROWSER_E2E — Secret string in environment
- **Precondition:** Secret string in environment
- **Expected invariant:** No echo in error/build output
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test45-OPS_NEGATIVE — Secret string in environment
- **Precondition:** Secret string in environment
- **Expected invariant:** No echo in error/build output
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test46-UNIT — RLS disabled/new table
- **Precondition:** RLS disabled/new table
- **Expected invariant:** Migration gate catches policy gap
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test46-API_INT — RLS disabled/new table
- **Precondition:** RLS disabled/new table
- **Expected invariant:** Migration gate catches policy gap
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test46-BROWSER_E2E — RLS disabled/new table
- **Precondition:** RLS disabled/new table
- **Expected invariant:** Migration gate catches policy gap
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test46-OPS_NEGATIVE — RLS disabled/new table
- **Precondition:** RLS disabled/new table
- **Expected invariant:** Migration gate catches policy gap
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test47-UNIT — Storage public policy accidentally enabled
- **Precondition:** Storage public policy accidentally enabled
- **Expected invariant:** Release gate fails
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test47-API_INT — Storage public policy accidentally enabled
- **Precondition:** Storage public policy accidentally enabled
- **Expected invariant:** Release gate fails
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test47-BROWSER_E2E — Storage public policy accidentally enabled
- **Precondition:** Storage public policy accidentally enabled
- **Expected invariant:** Release gate fails
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test47-OPS_NEGATIVE — Storage public policy accidentally enabled
- **Precondition:** Storage public policy accidentally enabled
- **Expected invariant:** Release gate fails
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test48-UNIT — Large output arrays
- **Precondition:** Large output arrays
- **Expected invariant:** Safe size bound
- **Priority:** P0
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test48-API_INT — Large output arrays
- **Precondition:** Large output arrays
- **Expected invariant:** Safe size bound
- **Priority:** P0
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test48-BROWSER_E2E — Large output arrays
- **Precondition:** Large output arrays
- **Expected invariant:** Safe size bound
- **Priority:** P0
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test48-OPS_NEGATIVE — Large output arrays
- **Precondition:** Large output arrays
- **Expected invariant:** Safe size bound
- **Priority:** P0
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test49-UNIT — Long transcript UI
- **Precondition:** Long transcript UI
- **Expected invariant:** No silent truncation
- **Priority:** P1
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test49-API_INT — Long transcript UI
- **Precondition:** Long transcript UI
- **Expected invariant:** No silent truncation
- **Priority:** P1
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test49-BROWSER_E2E — Long transcript UI
- **Precondition:** Long transcript UI
- **Expected invariant:** No silent truncation
- **Priority:** P1
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test49-OPS_NEGATIVE — Long transcript UI
- **Precondition:** Long transcript UI
- **Expected invariant:** No silent truncation
- **Priority:** P1
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

### EXT-Test50-UNIT — Keyboard-only review
- **Precondition:** Keyboard-only review
- **Expected invariant:** Core flow remains operable
- **Priority:** P1
- **Layer:** Pure domain and schema checks
- **Evidence artifact:** Assertion output and test ID

### EXT-Test50-API_INT — Keyboard-only review
- **Precondition:** Keyboard-only review
- **Expected invariant:** Core flow remains operable
- **Priority:** P1
- **Layer:** API + test DB/Storage boundary
- **Evidence artifact:** Safe request ID plus observed persistence/access result

### EXT-Test50-BROWSER_E2E — Keyboard-only review
- **Precondition:** Keyboard-only review
- **Expected invariant:** Core flow remains operable
- **Priority:** P1
- **Layer:** Browser-level user workflow
- **Evidence artifact:** Build ID and synthetic fixture ID

### EXT-Test50-OPS_NEGATIVE — Keyboard-only review
- **Precondition:** Keyboard-only review
- **Expected invariant:** Core flow remains operable
- **Priority:** P1
- **Layer:** Failure, cost, retention or authorization path
- **Evidence artifact:** Fault-injection/config and final state evidence

## Test execution record

| Field | Required value |
|---|---|
| Test ID | Stable ID from the catalog |
| Commit/build | Exact tested revision |
| Environment | Local/test/demo and configuration fingerprint without secret values |
| Fixture | Approved synthetic/consented fixture ID |
| Expected | Observable acceptance condition |
| Actual | Observed status/body/state, redacted |
| Outcome | Pass/fail/blocked/not run |
| Defect | Linked issue/decision ID when failed |
| Regression | Test rerun after remediation |

## Evidence quality rules

- Mocked success does not prove a live provider or remote Storage behavior.
- A test that executes without assertion does not count as evidence.
- A screenshot alone does not prove server-side authorization.
- A DB status flag does not prove object deletion; inspect the storage object.
- A provider output label does not prove acoustic grounding; inspect source interval and evaluator notes.
- Failed, blocked and unrun tests must not be counted as passed.
- Use sanitized request IDs and synthetic content in test reports.
