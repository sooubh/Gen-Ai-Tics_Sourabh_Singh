# 08 — Delivery Workstreams and Implementation Plan

This is dependency-driven implementation planning, not a 24-hour schedule. Complete the smallest evidence-backed workflow first. No source implementation was performed by creating this plan.

## Workstream order

1. Scope and API feasibility.
2. Security/data foundation.
3. Recorded audio end-to-end path.
4. Evidence-linked review/dashboard.
5. Export and retention proof.
6. Live transcription, if its gate passes.
7. Vocal cues, only if the evaluation gate passes.
8. Regression, deployment and demo rehearsal.

## Task catalogue
### PLAN-T01 — Repository audit and branch check
- **Scope/constraint:** No file assumptions
- **Required evidence:** Capture actual tree and latest commit
- **Deliverable/gate:** Planning baseline

### PLAN-T02 — Confirm problem statement scope
- **Scope/constraint:** Exclude SOS/dispatch and unrelated UX
- **Required evidence:** PRD owner review
- **Deliverable/gate:** Scope locked

### PLAN-T03 — Check current Gemini model catalogue
- **Scope/constraint:** Verify project region/access, model IDs and quotas
- **Required evidence:** Official docs plus minimal test
- **Deliverable/gate:** Model decision note

### PLAN-T04 — Recorded transcription spike
- **Scope/constraint:** Authorized short synthetic clip
- **Required evidence:** Request and response inspected
- **Deliverable/gate:** Recorded STT gate

### PLAN-T05 — Timestamp alignment spike
- **Scope/constraint:** Compare returned offsets with source
- **Required evidence:** Measured seek test
- **Deliverable/gate:** Timing contract

### PLAN-T06 — Language smoke set
- **Scope/constraint:** Hindi, English, Hinglish and unknown clip
- **Required evidence:** Reference notes and failure captured
- **Deliverable/gate:** Language coverage notes

### PLAN-T07 — Vocal cue feasibility spike
- **Scope/constraint:** Compare audio analysis with transcript-only control
- **Required evidence:** Human inspect cue grounding/abstention
- **Deliverable/gate:** Enable/hold/disable decision

### PLAN-T08 — Live handshake spike
- **Scope/constraint:** Mic permission, socket/auth, one short session
- **Required evidence:** Verify codec/event/stop lifecycle
- **Deliverable/gate:** Live gate

### PLAN-T09 — Confirm auth tenancy
- **Scope/constraint:** Choose actual Supabase auth and user-scope model
- **Required evidence:** Threat model and RLS test
- **Deliverable/gate:** Data ownership decision

### PLAN-T10 — Confirm audio retention
- **Scope/constraint:** Pick exact duration and remote-file policy
- **Required evidence:** Test object delete on test project
- **Deliverable/gate:** Retention decision

### PLAN-T11 — Initialize typed domain types
- **Scope/constraint:** Case/recording/run/segment/finding/review types
- **Required evidence:** Unit tests independent of vendor SDK
- **Deliverable/gate:** Domain base

### PLAN-T12 — Runtime validation setup
- **Scope/constraint:** Request and response schemas
- **Required evidence:** Positive/negative fixtures
- **Deliverable/gate:** Boundary contracts

### PLAN-T13 — Environment preflight
- **Scope/constraint:** Validate keys, model IDs and limits
- **Required evidence:** Missing-key test without secret output
- **Deliverable/gate:** Safe configuration

### PLAN-T14 — Database migration design
- **Scope/constraint:** Versioned case/run/segment/finding tables
- **Required evidence:** Fresh-project schema and RLS review
- **Deliverable/gate:** Data base

### PLAN-T15 — Private storage policies
- **Scope/constraint:** Private bucket and parent-case scope
- **Required evidence:** Anonymous/two-user tests
- **Deliverable/gate:** Storage gate

### PLAN-T16 — Case CRUD API
- **Scope/constraint:** Create, list, detail and notes
- **Required evidence:** Owner scope and validation
- **Deliverable/gate:** Case workflow

### PLAN-T17 — Upload authorization API
- **Scope/constraint:** Generated key and short-lived grant
- **Required evidence:** Arbitrary path/expired grant tests
- **Deliverable/gate:** Upload grant

### PLAN-T18 — Upload completion API
- **Scope/constraint:** Verify object and media metadata
- **Required evidence:** Interrupted and mismatched object tests
- **Deliverable/gate:** Verified source

### PLAN-T19 — Media preflight
- **Scope/constraint:** Type, bytes, duration, decode validity
- **Required evidence:** Malformed and limit tests
- **Deliverable/gate:** Supported input policy

### PLAN-T20 — Run manager
- **Scope/constraint:** Create stage states and run ID
- **Required evidence:** Double-submit/retry tests
- **Deliverable/gate:** Durable orchestration

### PLAN-T21 — Recorded transcription adapter
- **Scope/constraint:** Provider request and normalization
- **Required evidence:** Integration smoke plus schema tests
- **Deliverable/gate:** Transcript service

### PLAN-T22 — Transcript persistence
- **Scope/constraint:** Segments, timing, language and uncertainty
- **Required evidence:** Same-run integrity checks
- **Deliverable/gate:** Readable transcript

### PLAN-T23 — Audio player and segment seek
- **Scope/constraint:** Play/pause/seek/time state
- **Required evidence:** Time offset tests
- **Deliverable/gate:** Evidence navigation

### PLAN-T24 — Entity extraction
- **Scope/constraint:** Names/places/phones/time with spans
- **Required evidence:** Ambiguous and hallucination fixtures
- **Deliverable/gate:** Candidate data

### PLAN-T25 — Trigger extraction
- **Scope/constraint:** Contextual trigger with quote/context
- **Required evidence:** Negation/historical/hypothetical fixtures
- **Deliverable/gate:** Potential trigger list

### PLAN-T26 — Finding evidence linking
- **Scope/constraint:** Connect result to source segment/interval
- **Required evidence:** Orphan/cross-run test
- **Deliverable/gate:** Grounded findings

### PLAN-T27 — Timeline view
- **Scope/constraint:** Chronological source events
- **Required evidence:** Equal/missing time checks
- **Deliverable/gate:** Incident timeline

### PLAN-T28 — Case list and filters
- **Scope/constraint:** Authorized query and pagination
- **Required evidence:** Cross-user/no-match tests
- **Deliverable/gate:** Case navigation

### PLAN-T29 — Officer review UI/API
- **Scope/constraint:** Confirm/correct/dismiss
- **Required evidence:** Concurrency and history tests
- **Deliverable/gate:** Review workflow

### PLAN-T30 — Transcript correction
- **Scope/constraint:** Preserve original and edited version
- **Required evidence:** Late model output cannot overwrite
- **Deliverable/gate:** Correction traceability

### PLAN-T31 — Report snapshot service
- **Scope/constraint:** Selected run and review state
- **Required evidence:** Reconcile row IDs and limitations
- **Deliverable/gate:** Report source

### PLAN-T32 — CSV output
- **Scope/constraint:** Allowlist and formula escaping
- **Required evidence:** Malicious cell fixture
- **Deliverable/gate:** Safe data export

### PLAN-T33 — Print report
- **Scope/constraint:** Readable report layout/caveat
- **Required evidence:** Browser print preview
- **Deliverable/gate:** Shareable report

### PLAN-T34 — Live session manager
- **Scope/constraint:** Explicit states and cleanup
- **Required evidence:** Stop/reconnect/finalize tests
- **Deliverable/gate:** Live lifecycle

### PLAN-T35 — Live event normalizer
- **Scope/constraint:** Interim/final/dedup/out-of-order
- **Required evidence:** Event fixtures
- **Deliverable/gate:** Live transcript

### PLAN-T36 — Live UI
- **Scope/constraint:** Mic status, transcript, stop controls
- **Required evidence:** Permission deny/socket drop
- **Deliverable/gate:** Live demo

### PLAN-T37 — Retention scheduler
- **Scope/constraint:** Select due objects and confirm deletion
- **Required evidence:** Storage state/deletion failure test
- **Deliverable/gate:** Audio lifecycle

### PLAN-T38 — Orphan cleanup
- **Scope/constraint:** Safe grace period and report
- **Required evidence:** Dry-run inventory before delete
- **Deliverable/gate:** Cleanup safety

### PLAN-T39 — Authorization audit
- **Scope/constraint:** Review every route and child lookup
- **Required evidence:** Cross-user matrix
- **Deliverable/gate:** Security gate

### PLAN-T40 — Rate/cost limits
- **Scope/constraint:** Server-side user/project quotas
- **Required evidence:** Direct HTTP burst tests
- **Deliverable/gate:** Cost gate

### PLAN-T41 — Error normalization
- **Scope/constraint:** Safe error codes and request IDs
- **Required evidence:** Fault injection per stage
- **Deliverable/gate:** Failure UX

### PLAN-T42 — Operational logging
- **Scope/constraint:** Safe stage metadata only
- **Required evidence:** Sensitive fixture scan
- **Deliverable/gate:** Diagnostic baseline

### PLAN-T43 — Accessibility pass
- **Scope/constraint:** Keyboard, focus, contrast and semantic controls
- **Required evidence:** Keyboard-only task
- **Deliverable/gate:** Accessibility gate

### PLAN-T44 — Responsive pass
- **Scope/constraint:** Desktop-first with small viewport fallback
- **Required evidence:** 1024/768/390 widths
- **Deliverable/gate:** Layout gate

### PLAN-T45 — Model regression suite
- **Scope/constraint:** Reference clips and contextual cases
- **Required evidence:** Run after adapter/prompt changes
- **Deliverable/gate:** Model change gate

### PLAN-T46 — Browser end-to-end suite
- **Scope/constraint:** Upload to report with synthetic fixture
- **Required evidence:** Clean test database and user
- **Deliverable/gate:** E2E gate

### PLAN-T47 — Live end-to-end check
- **Scope/constraint:** Short real mic session
- **Required evidence:** Only enable if real session passes
- **Deliverable/gate:** Live acceptance

### PLAN-T48 — Report privacy review
- **Scope/constraint:** Allowlisted data and redaction
- **Required evidence:** Field-by-field output audit
- **Deliverable/gate:** Export gate

### PLAN-T49 — Deployment preflight
- **Scope/constraint:** Auth/storage/model/env/capability checks
- **Required evidence:** Missing config simulation
- **Deliverable/gate:** Release readiness

### PLAN-T50 — Demo fixture inventory
- **Scope/constraint:** Authorization and synthetic label
- **Required evidence:** Pre-demo source check
- **Deliverable/gate:** Demo safety

### PLAN-T51 — Demo backup path
- **Scope/constraint:** Recorded clip backup if live provider fails
- **Required evidence:** Rehearse switch honestly
- **Deliverable/gate:** Demo resilience

### PLAN-T52 — Repo documentation parity
- **Scope/constraint:** Update model IDs, limits and test status
- **Required evidence:** Read README and linked plans
- **Deliverable/gate:** Traceability

### PLAN-T53 — Dependency audit
- **Scope/constraint:** Minimum package set and lockfile
- **Required evidence:** Clean install/security scan
- **Deliverable/gate:** Supply chain

### PLAN-T54 — Runbook rehearsal
- **Scope/constraint:** Quota, timeout, delete failure and key rotation
- **Required evidence:** Safe synthetic/test environment
- **Deliverable/gate:** Ops readiness

### PLAN-T55 — Owner release review
- **Scope/constraint:** Review open risks and feature flags
- **Required evidence:** No unverified claim
- **Deliverable/gate:** Decision recorded

## Dependency gates
### PLAN-G01 — Provider feasibility
- **Pass condition:** Recorded endpoint returns usable output with source timing
- **Dependency rule:** Required before recorded adapter

### PLAN-G02 — Storage security
- **Pass condition:** RLS and private media policy pass negative tests
- **Dependency rule:** Required before storing case audio

### PLAN-G03 — Evidence integrity
- **Pass condition:** Cross-run/source refs rejected
- **Dependency rule:** Required before finding UI

### PLAN-G04 — Recorded E2E
- **Pass condition:** Synthetic sample reaches report and review
- **Dependency rule:** Required for demo

### PLAN-G05 — Live feasibility
- **Pass condition:** Real auth/session/codec/stop behavior verified
- **Dependency rule:** Required before live demo

### PLAN-G06 — Vocal cue quality
- **Pass condition:** Source-grounding/abstention review supports cautious display
- **Dependency rule:** Otherwise keep disabled

### PLAN-G07 — Deletion proof
- **Pass condition:** Test object is absent after expiry worker reports success
- **Dependency rule:** Required before policy promise

### PLAN-G08 — Report audit
- **Pass condition:** Output matches selected run and includes limitation
- **Dependency rule:** Required before export demo

### PLAN-G09 — Access denial
- **Pass condition:** Cross-user read/edit/download/export/delete all denied
- **Dependency rule:** Release blocker

### PLAN-G10 — Secret scan
- **Pass condition:** No key in browser bundle/log
- **Dependency rule:** Release blocker

### PLAN-G11 — Demo source
- **Pass condition:** All fixtures authorized and synthetic/consented
- **Dependency rule:** Release blocker

### PLAN-G12 — Scope review
- **Pass condition:** No dispatch, identity, guilt or lie detection feature
- **Dependency rule:** Release blocker

## Work item definitions
### PLAN-STATE-01 — Ready
- **Definition:** User problem, owner, input/output, dependency, risk and acceptance evidence are defined
- **Rule:** Work can be started safely

### PLAN-STATE-02 — Done
- **Definition:** Behavior implemented, runtime schema/authorization/failure state tested, docs updated
- **Rule:** Not merely code merged

### PLAN-STATE-03 — Blocked
- **Definition:** Named external decision/access/failure prevents progress
- **Rule:** State blocker and unblocking action; don't conceal

### PLAN-STATE-04 — Deferred
- **Definition:** Not required for credible core workflow
- **Rule:** Record reason and revisit condition

### PLAN-STATE-05 — Accepted risk
- **Definition:** Explicitly approved bounded risk with owner and mitigation
- **Rule:** Not equivalent to passing a failed gate

## Delivery sequencing principles

### Critical-path rule

Recorded audio is the core product. It must work without live sessions or vocal-emotion output. Do not build the full dashboard against mocked models first and postpone all integration validation until the end.

### Parallelism rule

The user is a solo developer. Multiple parallel coding agents are not assumed for this plan. Parallel work can be represented as independent task branches, but conflicting migrations, provider adapter changes and UI/API contract changes need a single integrated owner and sequential merge.

### Safe order

- Verify the model request/response before building a generalized adapter around assumptions.
- Finalize owner/case tenancy and storage policies before uploading any sensitive audio.
- Define domain schemas before writing results into the database.
- Persist stage statuses before adding frontend progress elements.
- Add source references alongside findings at extraction time, not retroactively.
- Add officer corrections only after original model output has its own immutable representation.
- Build report output from persisted results rather than a separate AI summary that can drift.
- Prove Storage deletion before showing a successful deletion claim.
- Add the live path as a second workflow, not a replacement for recorded processing.
- Treat emotion cues as optional until evaluation passes.

## Definition of Ready checklist
- [ ] READY-01: User need is explicit and linked to PRD requirement.
- [ ] READY-02: Input and output fields are named.
- [ ] READY-03: Authorization boundary is defined.
- [ ] READY-04: Success and failure states are listed.
- [ ] READY-05: Data lifecycle impact is understood.
- [ ] READY-06: Dependencies and model/API assumptions are identified.
- [ ] READY-07: Acceptance test exists before implementation.
- [ ] READY-08: Test fixture is authorized/synthetic.
- [ ] READY-09: Sensitive data isn't required in issue text.
- [ ] READY-10: Feature flag/rollback plan exists for experimental feature.
## Definition of Done checklist
- [ ] DONE-01: Core behavior runs against the real chosen service where integration is claimed.
- [ ] DONE-02: Runtime schema validates input and provider output.
- [ ] DONE-03: Server authorization is tested on read and mutation.
- [ ] DONE-04: Empty, loading, partial, failed and expired states are honest.
- [ ] DONE-05: Source references survive persistence and export.
- [ ] DONE-06: Unit and integration tests cover core path.
- [ ] DONE-07: Fault or limit scenario is covered.
- [ ] DONE-08: Secrets and sensitive content are absent from logs/client bundle.
- [ ] DONE-09: Retention behavior matches verified system behavior.
- [ ] DONE-10: Documentation and traceability matrix updated.
- [ ] DONE-11: Feature capability status reflects tested result.
- [ ] DONE-12: Unrun tests are marked pending.
- [ ] DONE-13: No out-of-scope functionality was added.
## Solo developer integration policy

- Keep one integration branch stable for demo at any time.
- Small isolated changes are easier to test than a whole-feature rewrite.
- Don't merge simultaneous conflicting changes in schema/API/provider contract.
- Freeze schema versions for a demo candidate; changes require focused regression.
- Reserve a stable known-good deployment/commit and preserve fixture IDs.
- Use feature flags to disable a failed experimental path.
- Keep issues focused on one observable acceptance goal.
- No background worker or queue is introduced unless measured runtime behavior requires it.

## Change control

Every scope change records: requirement, reason, dependencies, added data, privacy/security impact, failure states, acceptance tests, cost/performance effect and reason it cannot be deferred.

## Status board template

| Work item | Status | Evidence | Blocker | Next action |
|---|---|---|---|---|
| Recorded API smoke | Pending | Attach sanitized response/metrics | Model access/API shape | Run synthetic sample |
| Auth/RLS | Pending | Attach negative-test output | Tenant model | Verify test project |
| Recorded E2E | Pending | Link test run and fixture ID | Core integration | Build after gates |
| Live path | Pending | Link session/codec/stop test | API/session behavior | Enable only after verified |
| Cue feature | Pending | Evaluation scorecard | Grounding/abstention | Enable/hold/disable decision |
| Retention | Pending | Confirm object absence | Storage/provider lifecycle | Execute test deletion |
| Report | Pending | Export reconciliation | Run snapshot | Compare with DB |
| Release | Pending | Gate checklist | Open P0 risks | Owner decision |

## References

- https://nextjs.org/docs/app
- https://ai.google.dev/gemini-api/docs/transcribe
- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Planning boundary

This file does not schedule background work, run tests, modify application code or claim any task is complete. Use evidence to move each item from Pending to Pass/Done.
