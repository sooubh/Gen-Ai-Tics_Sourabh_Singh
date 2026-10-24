# 02 — Architecture and Technology Stack

## Recommended stack

| Layer | Choice | Reason | Condition |
|---|---|---|---|
| Web UI/API | Next.js App Router, React, TypeScript | One maintainable full-stack application | Verify hosting runtime |
| Styling | Tailwind CSS, shadcn/ui, Lucide | Small, consistent accessible components | Review contrast/focus after customization |
| Audio | Native HTML audio first | Playback/seek before another dependency | Add waveform package only if needed |
| Recorded STT | Gemini `gemini-3.5-transcribe` candidate | Dedicated transcription path in current catalog | Confirm current request/response with test clip |
| Live STT | Gemini `gemini-3.5-transcribe-live` candidate | Dedicated streaming transcription model | Verify handshake/auth/events/codec |
| Audio analysis | Gemini `gemini-3.8-flash` candidate | General audio understanding candidate | Experimental quality gate |
| Data/Auth | Supabase PostgreSQL + Auth + RLS | Relational records and scoped identity | Two-user policy test |
| Storage | Supabase private Storage | Controlled audio access | Verify expiry and actual object deletion |
| Deployment | Vercel for web/light APIs | Fits Next.js | Direct upload for large audio; measure timeouts |
| Validation | Zod/runtime schema | External JSON is untrusted | Include semantic checks |
| Export | CSV + printable report | Useful with few dependencies | Formula escaping and data reconciliation |
| Tests | Unit, API/storage integration, browser E2E, model evaluation | Actual behavior over mock-only confidence | P0 test evidence required |

## Trust boundaries

1. Browser input is untrusted. Validate every request at server boundary.
2. Gemini calls use server-held credentials, except a supported short-lived live token when current docs authorize that precise flow.
3. Supabase access uses authenticated scope and private storage rules; service role is not a normal browser credential.
4. Raw model output is untrusted until schema and semantic validation pass.
5. Spoken instructions are audio evidence, not trusted instructions to the application.
6. Report and logs are separate output surfaces with their own authorization/sanitization.
7. Scheduled deletion uses restricted authority and records actual object-delete results.

## Component inventory
### ARCH-C-01 — App shell
- **Responsibility:** Compose route layout, navigation, loading and error boundaries.
- **Boundary:** Must not pretend a request is complete based on client time.
- **Verification:** Refresh each route and verify current server state.

### ARCH-C-02 — Authentication
- **Responsibility:** Resolve signed-in subject from trusted session.
- **Boundary:** Never trust a user/actor ID sent in request JSON.
- **Verification:** Test anonymous, valid and expired session.

### ARCH-C-03 — Authorization guard
- **Responsibility:** Check access to each case and child entity.
- **Boundary:** Unpredictable UUID is not authorization.
- **Verification:** Two-account read/write/export/delete denial test.

### ARCH-C-04 — Route handlers
- **Responsibility:** Parse request, validate, authorize, invoke service, map safe response.
- **Boundary:** Keep provider orchestration out of UI components.
- **Verification:** Contract test each handler.

### ARCH-C-05 — Domain service layer
- **Responsibility:** Own lifecycle transitions and business rules.
- **Boundary:** Must not import vendor SDK response classes.
- **Verification:** Unit tests run without external network.

### ARCH-C-06 — Gemini transcription adapter
- **Responsibility:** Call current documented recorded transcription API.
- **Boundary:** Model ID and response schema are explicit config/version.
- **Verification:** Use a named synthetic clip in integration smoke.

### ARCH-C-07 — Gemini live adapter
- **Responsibility:** Translate WebSocket/SDK events into internal live events.
- **Boundary:** Do not expose permanent provider key to browser.
- **Verification:** Test handshake, event order and close.

### ARCH-C-08 — Audio interpretation adapter
- **Responsibility:** Request only allowed acoustic/event fields.
- **Boundary:** Vocal-cue output may be disabled/abstained.
- **Verification:** Evaluate source grounding before enabling.

### ARCH-C-09 — Provider error mapper
- **Responsibility:** Convert provider failure to stable internal category.
- **Boundary:** Raw exception and request bodies must not reach the UI.
- **Verification:** Inject 429, timeout, invalid request and unknown response.

### ARCH-C-10 — Runtime schema layer
- **Responsibility:** Validate user requests and provider response at runtime.
- **Boundary:** TypeScript types do not validate external JSON.
- **Verification:** Fuzz malformed and oversized values.

### ARCH-C-11 — Case repository
- **Responsibility:** Create/list/read/update authorized case data.
- **Boundary:** Apply server-side scoping and RLS.
- **Verification:** Cross-user test covers every route.

### ARCH-C-12 — Recording repository
- **Responsibility:** Track audio metadata, object path, expiry and status.
- **Boundary:** No public URL is a canonical evidence reference.
- **Verification:** Verify object belongs to parent case.

### ARCH-C-13 — Analysis run repository
- **Responsibility:** Persist each attempt and stage state.
- **Boundary:** No implicit merge of prior and current run outputs.
- **Verification:** Retry/reanalysis reconciliation test.

### ARCH-C-14 — Transcript repository
- **Responsibility:** Store validated segments under one analysis run.
- **Boundary:** Preserve model text and reviewed text distinction.
- **Verification:** Order/time/ref integrity tests.

### ARCH-C-15 — Finding repository
- **Responsibility:** Store candidate category, uncertainty and source refs.
- **Boundary:** No direct model setter for external verification.
- **Verification:** Invalid type and cross-run ref tests.

### ARCH-C-16 — Review repository
- **Responsibility:** Append officer confirmation/correction/dismissal actions.
- **Boundary:** No destructive loss of prior action history.
- **Verification:** Stale version conflict test.

### ARCH-C-17 — Case notes
- **Responsibility:** Store user-authored notes separately from AI statements.
- **Boundary:** Do not let AI text masquerade as officer note.
- **Verification:** Author and timestamps persist.

### ARCH-C-18 — Upload authorization
- **Responsibility:** Issue scoped, short-lived permission to unique object path.
- **Boundary:** Client cannot select arbitrary storage path.
- **Verification:** Wrong path, expiry and replay tests.

### ARCH-C-19 — Upload finalizer
- **Responsibility:** Verify private object existence/type/size before processing.
- **Boundary:** Completion callback alone is insufficient.
- **Verification:** Missing/mismatched object rejected.

### ARCH-C-20 — Media preflight
- **Responsibility:** Validate supported format, duration and decode characteristics.
- **Boundary:** Quality warning is not an emotion judgment.
- **Verification:** Malformed, silence, clipping and long-clip fixtures.

### ARCH-C-21 — Live state machine
- **Responsibility:** Track idle/permission/connecting/active/reconnecting/stopping/final states.
- **Boundary:** State reflects real microphone/socket lifecycle.
- **Verification:** Exercise every transition and forbidden transition.

### ARCH-C-22 — Live event normalizer
- **Responsibility:** Deduplicate interim/final messages, preserve event sequence/time.
- **Boundary:** Arrival order may differ from speech order.
- **Verification:** Replay duplicate and out-of-order events.

### ARCH-C-23 — Source linker
- **Responsibility:** Resolve finding to same-run segment IDs or explicit audio offsets.
- **Boundary:** No unsupported source-less evidence finding.
- **Verification:** Foreign key plus semantic ownership checks.

### ARCH-C-24 — Transcript normalizer
- **Responsibility:** Standardize times, speaker IDs, language and uncertainty.
- **Boundary:** Reject invalid values rather than silently coercing.
- **Verification:** Negative/reversed/out-of-range timestamps test.

### ARCH-C-25 — Timeline service
- **Responsibility:** Order source events with stable time-based sorting.
- **Boundary:** Unknown time remains unknown.
- **Verification:** Test equal, missing and conflicting offsets.

### ARCH-C-26 — Entity extraction service
- **Responsibility:** Extract explicitly mentioned values and link evidence.
- **Boundary:** No outside identity or location lookup.
- **Verification:** Ambiguous place/phone test.

### ARCH-C-27 — Trigger extraction service
- **Responsibility:** Context-check possible threats, help requests and incidents.
- **Boundary:** Negation/hypothetical/history/quoted speech matter.
- **Verification:** Balanced positive/negative fixtures.

### ARCH-C-28 — Vocal cue gate
- **Responsibility:** Enable cues only after feature quality gate.
- **Boundary:** No guilt/deception/intent field or global risk score.
- **Verification:** Flag-off and abstention tests.

### ARCH-C-29 — Report service
- **Responsibility:** Snapshot selected analysis run and reviewed findings.
- **Boundary:** No mixing records from different runs.
- **Verification:** Compare output IDs with selected DB state.

### ARCH-C-30 — CSV writer
- **Responsibility:** Serialize allowlisted columns with safe escaping.
- **Boundary:** Formula-leading untrusted content must be neutralized.
- **Verification:** Formula/XSS/newline/unicode test.

### ARCH-C-31 — Print renderer
- **Responsibility:** Render semantic headings, evidence tables and caveat.
- **Boundary:** No essential warning only in tooltip/color.
- **Verification:** Print and 200% zoom review.

### ARCH-C-32 — Retention scheduler
- **Responsibility:** Find due audio and request actual Storage deletion.
- **Boundary:** DB flag alone does not mean delete succeeded.
- **Verification:** Test real object deletion in non-sensitive environment.

### ARCH-C-33 — Orphan cleanup
- **Responsibility:** Find upload objects with no valid DB owner after grace period.
- **Boundary:** Do not delete active uploads or referenced media.
- **Verification:** Dry-run inventory plus delete verification.

### ARCH-C-34 — Private bucket
- **Responsibility:** Store source audio in non-public bucket.
- **Boundary:** Anonymous access and wrong-user access must fail.
- **Verification:** Direct object URL tests.

### ARCH-C-35 — RLS policies
- **Responsibility:** Constrain all case-scoped tables by authenticated user and parent relation.
- **Boundary:** No broad USING true shortcuts for private rows.
- **Verification:** Migrations and two-account negative tests.

### ARCH-C-36 — Rate limiter
- **Responsibility:** Bound uploads, AI requests, exports and concurrency.
- **Boundary:** Enforcement occurs server-side.
- **Verification:** Direct API burst test.

### ARCH-C-37 — Idempotency guard
- **Responsibility:** Protect create/complete/analysis/finalize/delete retries.
- **Boundary:** Same key with different request returns conflict.
- **Verification:** Double-click/network replay tests.

### ARCH-C-38 — Optimistic concurrency
- **Responsibility:** Check current finding version/state before review update.
- **Boundary:** No silent last-write-wins correction loss.
- **Verification:** Simultaneous action test.

### ARCH-C-39 — Configuration preflight
- **Responsibility:** Validate keys, model IDs, limits and feature flags.
- **Boundary:** Never print values of secrets.
- **Verification:** Missing config returns not-ready state.

### ARCH-C-40 — Capability registry
- **Responsibility:** Publish enabled/disabled product paths to UI safely.
- **Boundary:** Only server config decides a high-cost feature is on.
- **Verification:** Disabled cue/live UI remains honest.

### ARCH-C-41 — Structured logger
- **Responsibility:** Emit request ID, stage, duration, status and safe error class.
- **Boundary:** No audio/transcript/phone/address/signed URL.
- **Verification:** Fixture content absent from logs.

### ARCH-C-42 — Audit event service
- **Responsibility:** Record review, export, delete and operator actions minimally.
- **Boundary:** Don't persist whole provider payload in audit metadata.
- **Verification:** Reconcile action history with DB state.

### ARCH-C-43 — Session cleanup
- **Responsibility:** Clear protected client state on logout/session expiry.
- **Boundary:** Browser cache must not become a second case database.
- **Verification:** Logout and expiry E2E test.

### ARCH-C-44 — Search/pagination
- **Responsibility:** Query only authorized case scope with stable ordering.
- **Boundary:** No unlimited results or implicit global transcript search.
- **Verification:** Paging/filter and cross-user tests.

### ARCH-C-45 — Health endpoint
- **Responsibility:** Return safe readiness/capability flags.
- **Boundary:** No secret/config values or expensive provider call every ping.
- **Verification:** Missing-key and database-unavailable tests.

### ARCH-C-46 — Demo fixture registry
- **Responsibility:** Define named synthetic clips, references and expiry.
- **Boundary:** No real sensitive call audio in fixtures by default.
- **Verification:** Review fixture authorization register.

### ARCH-C-47 — Testing harness
- **Responsibility:** Separate deterministic unit tests from live provider smoke tests.
- **Boundary:** Mocks alone don't prove model integration works.
- **Verification:** CI has unit suite; manual evidence has real smoke test.

### ARCH-C-48 — Feature flag evaluator
- **Responsibility:** Gate live and vocal cues by tested capability configuration.
- **Boundary:** Client cannot enable disabled feature.
- **Verification:** Flag tamper test and fallback.

### ARCH-C-49 — Remote provider file cleaner
- **Responsibility:** Delete or expire uploaded provider artifacts where supported.
- **Boundary:** Local file removal is not remote deletion.
- **Verification:** Provider lifecycle test and documented limitations.

### ARCH-C-50 — Background task supervisor
- **Responsibility:** Reconcile jobs interrupted by restart or timeout.
- **Boundary:** Elapsed timer cannot change state to complete.
- **Verification:** Restart/fault-injection test.

### ARCH-C-51 — API response envelope
- **Responsibility:** Use stable success/error payload shape.
- **Boundary:** No raw vendor messages or stack traces.
- **Verification:** Contract snapshot tests.

### ARCH-C-52 — Database migrations
- **Responsibility:** Version tables, indexes, constraints and RLS together.
- **Boundary:** No undocumented manual schema changes.
- **Verification:** Fresh-project bootstrap test.

### ARCH-C-53 — Data minimizer
- **Responsibility:** Store only fields necessary for review and report.
- **Boundary:** No global person profiles or sensitive analytics.
- **Verification:** Schema/privacy review.

### ARCH-C-54 — Build metadata
- **Responsibility:** Expose safe build SHA and environment label to operator.
- **Boundary:** Never expose credentials or internal infrastructure secrets.
- **Verification:** Demo footer matches deployed commit.

### ARCH-C-55 — Dependency manager
- **Responsibility:** Keep reproducible lockfile and minimal libraries.
- **Boundary:** No additional AI/orchestration framework without requirement.
- **Verification:** Clean install/build and dependency audit.

## Architecture decisions
### ADR-01 — One Next.js application
- **Status:** Accepted
- **Context:** Solo maintainability and simpler deploy.
- **Decision:** Add a worker only after measured runtime needs require it.

### ADR-02 — TypeScript plus runtime schema
- **Status:** Accepted
- **Context:** Static types don't validate network/model output.
- **Decision:** Validate every external boundary.

### ADR-03 — Supabase relational data
- **Status:** Proposed
- **Context:** Case, transcript, finding and review relations are structured.
- **Decision:** Verify RLS, region and project settings.

### ADR-04 — Supabase private Storage
- **Status:** Proposed
- **Context:** Audio requires non-public controlled access.
- **Decision:** Prove access/expiry/deletion behavior.

### ADR-05 — Gemini initial provider
- **Status:** Proposed
- **Context:** Avoid multiple vendor integrations until first path works.
- **Decision:** Verify entitlement, model, quota, cost and output.

### ADR-06 — Recorded and live pipelines separate
- **Status:** Accepted
- **Context:** Streaming and file analysis differ in protocol and lifecycle.
- **Decision:** Test each independently.

### ADR-07 — gemini-3.5-transcribe candidate
- **Status:** Proposed
- **Context:** Dedicated transcription model is listed by official docs.
- **Decision:** Run real synthetic request before implementation lock.

### ADR-08 — gemini-3.5-transcribe-live candidate
- **Status:** Proposed
- **Context:** Dedicated live speech-to-text model is listed in official docs.
- **Decision:** Verify exact auth, socket and event contract.

### ADR-09 — gemini-3.8-flash audio analysis candidate
- **Status:** Experimental
- **Context:** General audio understanding is not forensic validation.
- **Decision:** Cue feature remains gated.

### ADR-10 — Direct-to-private-storage upload
- **Status:** Accepted
- **Context:** Vercel documents a 4.5 MB function payload limit.
- **Decision:** Do not proxy large audio body through Route Handler.

### ADR-11 — Bounded Route Handlers
- **Status:** Accepted
- **Context:** Native App Router API mechanism.
- **Decision:** Move long work to worker only if runtime requires.

### ADR-12 — No queue at the beginning
- **Status:** Proposed
- **Context:** Queue adds operational complexity to short prototype.
- **Decision:** Revisit after measuring longest clip and stage time.

### ADR-13 — Three primary nav items
- **Status:** Accepted
- **Context:** Overview, Analyze Audio, Cases map to actual work.
- **Decision:** Reports stay inside case detail.

### ADR-14 — Native audio before waveform dependency
- **Status:** Proposed
- **Context:** Native player may satisfy playback and seek need.
- **Decision:** Add waveform library only after acceptance need.

### ADR-15 — Tailwind plus shadcn/ui
- **Status:** Accepted
- **Context:** Consistent accessible UI without another design framework.
- **Decision:** Manually check customized component semantics.

### ADR-16 — Provider-neutral domain schema
- **Status:** Accepted
- **Context:** Model SDK contracts may change.
- **Decision:** Adapter shields UI/data layer.

### ADR-17 — Model/prompt/schema versioning
- **Status:** Accepted
- **Context:** Explains output provenance and regression.
- **Decision:** Store IDs/hashes rather than sensitive prompt.

### ADR-18 — Human review first-class
- **Status:** Accepted
- **Context:** AI output is a suggestion, not confirmed truth.
- **Decision:** Persist review action and state history.

### ADR-19 — CSV/print before specialized PDF
- **Status:** Accepted
- **Context:** Lower dependency count and straightforward validation.
- **Decision:** Add PDF generator if print output fails requirements.

### ADR-20 — No vector database or RAG
- **Status:** Accepted
- **Context:** Case-scoped search meets current scope.
- **Decision:** Require concrete later retrieval problem to revisit.

### ADR-21 — No emergency dispatch action
- **Status:** Accepted
- **Context:** No institutional integration/authority exists in prototype.
- **Decision:** Keep external action APIs absent.

### ADR-22 — No voice identity matching
- **Status:** Accepted
- **Context:** Biometric identification is outside safe scope.
- **Decision:** Neutral per-recording speaker labels only.

### ADR-23 — Synthetic deterministic demo fixtures
- **Status:** Accepted
- **Context:** Repeatability and privacy.
- **Decision:** Persistent synthetic label in UI/export.

### ADR-24 — No permanent key in browser
- **Status:** Accepted
- **Context:** Browser artifacts are inspectable.
- **Decision:** Ephemeral token only if current API supports chosen flow.

### ADR-25 — Disable vocal cues on failed evaluation
- **Status:** Accepted
- **Context:** Unsupported claim undermines safety and credibility.
- **Decision:** Flag off or persistent experimental state.

## Main system flows
### ARCH-FLOW-01 — Recorded upload
- **Sequence:** Allocate recording; issue scoped upload permission; upload private object; verify object; then create run.
- **Invariant:** Client file selection alone never means uploaded or analyzed.

### ARCH-FLOW-02 — Recorded pipeline
- **Sequence:** Transcribe; validate segments; extract events/entities; check optional cue gate; persist stage status.
- **Invariant:** Output not valid until schema and source-reference validation pass.

### ARCH-FLOW-03 — Live pipeline
- **Sequence:** Explicit mic start; permission; session handshake; chunk stream; normalize event; finalize and close.
- **Invariant:** Socket state and persisted state remain separate concepts.

### ARCH-FLOW-04 — Review pipeline
- **Sequence:** Read evidence; authorize action; check version; append action; update projection.
- **Invariant:** Stale or unauthorized mutation never succeeds silently.

### ARCH-FLOW-05 — Export pipeline
- **Sequence:** Authorize case/run; snapshot review state; sanitize text; generate file; record audit event.
- **Invariant:** No mixed-run data or public access URL.

### ARCH-FLOW-06 — Retention pipeline
- **Sequence:** Due scan; recheck eligibility; delete trusted object; verify; record result; retry.
- **Invariant:** A failed delete remains pending/failed.

## Proposed source layout after explicit implementation authorization

```text
app/
  (workspace)/overview/page.tsx
  (workspace)/analyze/page.tsx
  (workspace)/cases/page.tsx
  (workspace)/cases/[caseId]/page.tsx
  api/cases/route.ts
  api/recordings/authorize-upload/route.ts
  api/recordings/[id]/complete/route.ts
  api/analyses/route.ts
  api/analyses/[id]/route.ts
  api/findings/[id]/review/route.ts
  api/reports/[caseId]/route.ts
lib/
  domain/
  validators/
  auth/
  services/
  providers/gemini/
  storage/
  retention/
  exports/
components/
  layout/
  audio/
  transcript/
  findings/
supabase/
  migrations/
tests/
docs/
```

This is an architecture proposal only; no product source files were added.

## Architecture validation checklist
- [ ] ARCH-CHECK-01: Every route uses the shared authentication resolver.
- [ ] ARCH-CHECK-02: Every child record query validates parent ownership.
- [ ] ARCH-CHECK-03: RLS is enabled on every exposed case-scoped table.
- [ ] ARCH-CHECK-04: Private audio bucket rejects anonymous access.
- [ ] ARCH-CHECK-05: Browser bundle excludes Gemini and service-role secrets.
- [ ] ARCH-CHECK-06: Provider requests are made only through authorized adapters.
- [ ] ARCH-CHECK-07: Request and response bodies have runtime schemas.
- [ ] ARCH-CHECK-08: All analysis runs are source-recording scoped.
- [ ] ARCH-CHECK-09: Every transcript segment belongs to one run.
- [ ] ARCH-CHECK-10: Offsets have one unit and validated range.
- [ ] ARCH-CHECK-11: Speaker labels are neutral and recording-scoped.
- [ ] ARCH-CHECK-12: Entities require source span and claim status.
- [ ] ARCH-CHECK-13: Trigger candidates preserve context and review state.
- [ ] ARCH-CHECK-14: Vocal cues are time-local and evidence-linked.
- [ ] ARCH-CHECK-15: Unsupported guilt/identity fields are rejected.
- [ ] ARCH-CHECK-16: Empty result differs from provider failure.
- [ ] ARCH-CHECK-17: Partial run status survives refresh.
- [ ] ARCH-CHECK-18: Retry behavior is bounded and idempotent.
- [ ] ARCH-CHECK-19: Large audio does not proxy through oversized function request.
- [ ] ARCH-CHECK-20: Upload URL has limited lifetime and scope.
- [ ] ARCH-CHECK-21: Object path is server generated.
- [ ] ARCH-CHECK-22: Storage completion checks object existence.
- [ ] ARCH-CHECK-23: Remote provider files have a separate lifecycle plan.
- [ ] ARCH-CHECK-24: Deletion status follows Storage delete confirmation.
- [ ] ARCH-CHECK-25: Orphan cleanup uses a grace period and dry-run inventory.
- [ ] ARCH-CHECK-26: CSV uses safe escaping of untrusted cells.
- [ ] ARCH-CHECK-27: Report is pinned to exact run ID.
- [ ] ARCH-CHECK-28: Transcript correction preserves original text.
- [ ] ARCH-CHECK-29: Review action uses server-derived actor.
- [ ] ARCH-CHECK-30: Concurrent edit has defined conflict behavior.
- [ ] ARCH-CHECK-31: Live interim event is not duplicated when finalized.
- [ ] ARCH-CHECK-32: Late live events obey session-closed guard.
- [ ] ARCH-CHECK-33: Socket failure does not masquerade as connected.
- [ ] ARCH-CHECK-34: Mic capture begins only after explicit action.
- [ ] ARCH-CHECK-35: Stop and finalization are idempotent.
- [ ] ARCH-CHECK-36: Provider errors map to stable safe codes.
- [ ] ARCH-CHECK-37: Logs omit transcript/audio/secrets and signed URLs.
- [ ] ARCH-CHECK-38: Health endpoint doesn't call the model on every ping.
- [ ] ARCH-CHECK-39: Configuration preflight doesn't reveal key values.
- [ ] ARCH-CHECK-40: Disabled feature doesn't show fabricated output.
- [ ] ARCH-CHECK-41: Recorded workflow works with live feature disabled.
- [ ] ARCH-CHECK-42: Model/prompt/schema versions are saved per run.
- [ ] ARCH-CHECK-43: Analysis output validates array/text resource bounds.
- [ ] ARCH-CHECK-44: Unknown enum values fail safe.
- [ ] ARCH-CHECK-45: Export checks authorization independently of page access.
- [ ] ARCH-CHECK-46: Analytics cannot receive transcript or phone/address fields.
- [ ] ARCH-CHECK-47: Session logout clears protected client state.
- [ ] ARCH-CHECK-48: Schema migrations include RLS policies and indexes.
- [ ] ARCH-CHECK-49: Build metadata uses non-secret identifiers.
- [ ] ARCH-CHECK-50: Dependency lockfile reproduces install/build.
- [ ] ARCH-CHECK-51: Demo mode is separate from normal cases.
- [ ] ARCH-CHECK-52: Report method note stays visible in print view.
- [ ] ARCH-CHECK-53: Localization is not inferred from browser locale.
- [ ] ARCH-CHECK-54: External enrichment APIs are absent by default.
- [ ] ARCH-CHECK-55: Scope changes require acceptance test and risk review.
- [ ] ARCH-CHECK-56: Current model docs are rechecked before implementation.

## Official references
- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/transcribe
- https://ai.google.dev/gemini-api/docs/audio
- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/storage/serving/downloads
- https://vercel.com/docs/errors/function_payload_too_large

## Implementation gate

Before building, demonstrate a real recorded transcription request on approved synthetic audio, test live auth/session/codec where enabled, decide the vocal-cue feature gate, verify private Storage/RLS and prove configured audio expiry/deletion.


## Expanded architecture verification matrix

For each boundary, test layers prove different things. Unit tests do not prove RLS, a real provider request or browser session behavior. Keep evidence and status separate.

### ARCH-VERIFY-01-UNIT — Boundary validation
- **Boundary under test:** Reject malformed route body and unknown fields
- **Expected verification:** Input-schema unit test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-01-INTEGRATION — Boundary validation
- **Boundary under test:** Reject malformed route body and unknown fields
- **Expected verification:** Input-schema unit test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-01-E2E — Boundary validation
- **Boundary under test:** Reject malformed route body and unknown fields
- **Expected verification:** Input-schema unit test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-02-UNIT — Authentication
- **Boundary under test:** Resolve actor from trusted session
- **Expected verification:** Anonymous/expired API test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-02-INTEGRATION — Authentication
- **Boundary under test:** Resolve actor from trusted session
- **Expected verification:** Anonymous/expired API test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-02-E2E — Authentication
- **Boundary under test:** Resolve actor from trusted session
- **Expected verification:** Anonymous/expired API test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-03-UNIT — Authorization
- **Boundary under test:** Scope every child query to parent case
- **Expected verification:** Two-user negative test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-03-INTEGRATION — Authorization
- **Boundary under test:** Scope every child query to parent case
- **Expected verification:** Two-user negative test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-03-E2E — Authorization
- **Boundary under test:** Scope every child query to parent case
- **Expected verification:** Two-user negative test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-04-UNIT — RLS
- **Boundary under test:** Enforce row ownership at database
- **Expected verification:** Fresh-project policy test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-04-INTEGRATION — RLS
- **Boundary under test:** Enforce row ownership at database
- **Expected verification:** Fresh-project policy test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-04-E2E — RLS
- **Boundary under test:** Enforce row ownership at database
- **Expected verification:** Fresh-project policy test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-05-UNIT — Private bucket
- **Boundary under test:** Deny public and wrong-user media read
- **Expected verification:** Actual Storage test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-05-INTEGRATION — Private bucket
- **Boundary under test:** Deny public and wrong-user media read
- **Expected verification:** Actual Storage test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-05-E2E — Private bucket
- **Boundary under test:** Deny public and wrong-user media read
- **Expected verification:** Actual Storage test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-06-UNIT — Upload grant
- **Boundary under test:** Server creates narrow object path/TTL
- **Expected verification:** Wrong path and expiry test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-06-INTEGRATION — Upload grant
- **Boundary under test:** Server creates narrow object path/TTL
- **Expected verification:** Wrong path and expiry test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-06-E2E — Upload grant
- **Boundary under test:** Server creates narrow object path/TTL
- **Expected verification:** Wrong path and expiry test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-07-UNIT — Upload finalize
- **Boundary under test:** Check actual object and metadata
- **Expected verification:** Missing/mismatched object test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-07-INTEGRATION — Upload finalize
- **Boundary under test:** Check actual object and metadata
- **Expected verification:** Missing/mismatched object test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-07-E2E — Upload finalize
- **Boundary under test:** Check actual object and metadata
- **Expected verification:** Missing/mismatched object test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-08-UNIT — Run isolation
- **Boundary under test:** One source may have distinct runs
- **Expected verification:** Reanalysis repository test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-08-INTEGRATION — Run isolation
- **Boundary under test:** One source may have distinct runs
- **Expected verification:** Reanalysis repository test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-08-E2E — Run isolation
- **Boundary under test:** One source may have distinct runs
- **Expected verification:** Reanalysis repository test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-09-UNIT — Segment normalization
- **Boundary under test:** Normalize and validate time offsets
- **Expected verification:** Negative/out-of-range offset test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-09-INTEGRATION — Segment normalization
- **Boundary under test:** Normalize and validate time offsets
- **Expected verification:** Negative/out-of-range offset test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-09-E2E — Segment normalization
- **Boundary under test:** Normalize and validate time offsets
- **Expected verification:** Negative/out-of-range offset test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-10-UNIT — Finding normalization
- **Boundary under test:** Reject unsupported category/fields
- **Expected verification:** Unknown enum test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-10-INTEGRATION — Finding normalization
- **Boundary under test:** Reject unsupported category/fields
- **Expected verification:** Unknown enum test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-10-E2E — Finding normalization
- **Boundary under test:** Reject unsupported category/fields
- **Expected verification:** Unknown enum test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-11-UNIT — Evidence link
- **Boundary under test:** Same-run evidence only
- **Expected verification:** Cross-run foreign ref test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-11-INTEGRATION — Evidence link
- **Boundary under test:** Same-run evidence only
- **Expected verification:** Cross-run foreign ref test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-11-E2E — Evidence link
- **Boundary under test:** Same-run evidence only
- **Expected verification:** Cross-run foreign ref test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-12-UNIT — Provider adapter
- **Boundary under test:** Shield domain from SDK response type
- **Expected verification:** Adapter contract fixture
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-12-INTEGRATION — Provider adapter
- **Boundary under test:** Shield domain from SDK response type
- **Expected verification:** Adapter contract fixture
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-12-E2E — Provider adapter
- **Boundary under test:** Shield domain from SDK response type
- **Expected verification:** Adapter contract fixture
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-13-UNIT — Provider errors
- **Boundary under test:** Normalize 400/429/timeout/5xx
- **Expected verification:** Fault injection
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-13-INTEGRATION — Provider errors
- **Boundary under test:** Normalize 400/429/timeout/5xx
- **Expected verification:** Fault injection
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-13-E2E — Provider errors
- **Boundary under test:** Normalize 400/429/timeout/5xx
- **Expected verification:** Fault injection
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-14-UNIT — Idempotency
- **Boundary under test:** Duplicate operation key doesn't create duplicate work
- **Expected verification:** Replay test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-14-INTEGRATION — Idempotency
- **Boundary under test:** Duplicate operation key doesn't create duplicate work
- **Expected verification:** Replay test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-14-E2E — Idempotency
- **Boundary under test:** Duplicate operation key doesn't create duplicate work
- **Expected verification:** Replay test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-15-UNIT — Concurrency
- **Boundary under test:** Stale finding version returns conflict
- **Expected verification:** Parallel review test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-15-INTEGRATION — Concurrency
- **Boundary under test:** Stale finding version returns conflict
- **Expected verification:** Parallel review test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-15-E2E — Concurrency
- **Boundary under test:** Stale finding version returns conflict
- **Expected verification:** Parallel review test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-16-UNIT — Review history
- **Boundary under test:** Append actor/time/old-new state
- **Expected verification:** Audit reconciliation
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-16-INTEGRATION — Review history
- **Boundary under test:** Append actor/time/old-new state
- **Expected verification:** Audit reconciliation
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-16-E2E — Review history
- **Boundary under test:** Append actor/time/old-new state
- **Expected verification:** Audit reconciliation
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-17-UNIT — Transcript correction
- **Boundary under test:** Preserve model text and reviewed text
- **Expected verification:** Revision test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-17-INTEGRATION — Transcript correction
- **Boundary under test:** Preserve model text and reviewed text
- **Expected verification:** Revision test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-17-E2E — Transcript correction
- **Boundary under test:** Preserve model text and reviewed text
- **Expected verification:** Revision test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-18-UNIT — Timeline
- **Boundary under test:** Stable time sorting and untimed bucket
- **Expected verification:** Equal/missing timestamp test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-18-INTEGRATION — Timeline
- **Boundary under test:** Stable time sorting and untimed bucket
- **Expected verification:** Equal/missing timestamp test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-18-E2E — Timeline
- **Boundary under test:** Stable time sorting and untimed bucket
- **Expected verification:** Equal/missing timestamp test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-19-UNIT — Report snapshot
- **Boundary under test:** Use selected run only
- **Expected verification:** Report/DB reconciliation
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-19-INTEGRATION — Report snapshot
- **Boundary under test:** Use selected run only
- **Expected verification:** Report/DB reconciliation
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-19-E2E — Report snapshot
- **Boundary under test:** Use selected run only
- **Expected verification:** Report/DB reconciliation
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-20-UNIT — CSV serializer
- **Boundary under test:** Escape formula-like untrusted text
- **Expected verification:** Malicious cell test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-20-INTEGRATION — CSV serializer
- **Boundary under test:** Escape formula-like untrusted text
- **Expected verification:** Malicious cell test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-20-E2E — CSV serializer
- **Boundary under test:** Escape formula-like untrusted text
- **Expected verification:** Malicious cell test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-21-UNIT — Retention worker
- **Boundary under test:** Delete Storage object and verify absence
- **Expected verification:** Actual test object check
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-21-INTEGRATION — Retention worker
- **Boundary under test:** Delete Storage object and verify absence
- **Expected verification:** Actual test object check
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-21-E2E — Retention worker
- **Boundary under test:** Delete Storage object and verify absence
- **Expected verification:** Actual test object check
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-22-UNIT — Orphan cleanup
- **Boundary under test:** Grace period protects in-progress upload
- **Expected verification:** Dry-run and active upload test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-22-INTEGRATION — Orphan cleanup
- **Boundary under test:** Grace period protects in-progress upload
- **Expected verification:** Dry-run and active upload test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-22-E2E — Orphan cleanup
- **Boundary under test:** Grace period protects in-progress upload
- **Expected verification:** Dry-run and active upload test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-23-UNIT — Remote provider file
- **Boundary under test:** Independent provider lifecycle tracking
- **Expected verification:** Provider policy/cleanup test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-23-INTEGRATION — Remote provider file
- **Boundary under test:** Independent provider lifecycle tracking
- **Expected verification:** Provider policy/cleanup test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-23-E2E — Remote provider file
- **Boundary under test:** Independent provider lifecycle tracking
- **Expected verification:** Provider policy/cleanup test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-24-UNIT — Rate limiter
- **Boundary under test:** Server enforces per-user and project caps
- **Expected verification:** Direct HTTP burst
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-24-INTEGRATION — Rate limiter
- **Boundary under test:** Server enforces per-user and project caps
- **Expected verification:** Direct HTTP burst
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-24-E2E — Rate limiter
- **Boundary under test:** Server enforces per-user and project caps
- **Expected verification:** Direct HTTP burst
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-25-UNIT — Resource bounds
- **Boundary under test:** Cap output bytes, counts and text
- **Expected verification:** Oversized response test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-25-INTEGRATION — Resource bounds
- **Boundary under test:** Cap output bytes, counts and text
- **Expected verification:** Oversized response test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-25-E2E — Resource bounds
- **Boundary under test:** Cap output bytes, counts and text
- **Expected verification:** Oversized response test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-26-UNIT — Live event dedup
- **Boundary under test:** Merge interim/final events by tested key
- **Expected verification:** Duplicate event fixture
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-26-INTEGRATION — Live event dedup
- **Boundary under test:** Merge interim/final events by tested key
- **Expected verification:** Duplicate event fixture
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-26-E2E — Live event dedup
- **Boundary under test:** Merge interim/final events by tested key
- **Expected verification:** Duplicate event fixture
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-27-UNIT — Live close guard
- **Boundary under test:** Reject late event outside finalization rules
- **Expected verification:** Post-stop event test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-27-INTEGRATION — Live close guard
- **Boundary under test:** Reject late event outside finalization rules
- **Expected verification:** Post-stop event test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-27-E2E — Live close guard
- **Boundary under test:** Reject late event outside finalization rules
- **Expected verification:** Post-stop event test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-28-UNIT — Session state machine
- **Boundary under test:** Permit only documented transitions
- **Expected verification:** Transition unit tests
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-28-INTEGRATION — Session state machine
- **Boundary under test:** Permit only documented transitions
- **Expected verification:** Transition unit tests
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-28-E2E — Session state machine
- **Boundary under test:** Permit only documented transitions
- **Expected verification:** Transition unit tests
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-29-UNIT — Session cleanup
- **Boundary under test:** Stop captures/close socket and persist state
- **Expected verification:** Browser stop/reload test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-29-INTEGRATION — Session cleanup
- **Boundary under test:** Stop captures/close socket and persist state
- **Expected verification:** Browser stop/reload test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-29-E2E — Session cleanup
- **Boundary under test:** Stop captures/close socket and persist state
- **Expected verification:** Browser stop/reload test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-30-UNIT — Capabilities
- **Boundary under test:** Server flags control experimental functions
- **Expected verification:** Client-flag tampering test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-30-INTEGRATION — Capabilities
- **Boundary under test:** Server flags control experimental functions
- **Expected verification:** Client-flag tampering test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-30-E2E — Capabilities
- **Boundary under test:** Server flags control experimental functions
- **Expected verification:** Client-flag tampering test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-31-UNIT — Config preflight
- **Boundary under test:** Missing key/model/bucket prevents feature
- **Expected verification:** Safe missing-config test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-31-INTEGRATION — Config preflight
- **Boundary under test:** Missing key/model/bucket prevents feature
- **Expected verification:** Safe missing-config test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-31-E2E — Config preflight
- **Boundary under test:** Missing key/model/bucket prevents feature
- **Expected verification:** Safe missing-config test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-32-UNIT — Structured logs
- **Boundary under test:** Record metadata only
- **Expected verification:** Search for fixture text
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-32-INTEGRATION — Structured logs
- **Boundary under test:** Record metadata only
- **Expected verification:** Search for fixture text
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-32-E2E — Structured logs
- **Boundary under test:** Record metadata only
- **Expected verification:** Search for fixture text
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-33-UNIT — Client cache
- **Boundary under test:** Clear protected data after logout
- **Expected verification:** Browser logout test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-33-INTEGRATION — Client cache
- **Boundary under test:** Clear protected data after logout
- **Expected verification:** Browser logout test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-33-E2E — Client cache
- **Boundary under test:** Clear protected data after logout
- **Expected verification:** Browser logout test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-34-UNIT — Search scope
- **Boundary under test:** Authorized per-case query
- **Expected verification:** Cross-case text leak test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-34-INTEGRATION — Search scope
- **Boundary under test:** Authorized per-case query
- **Expected verification:** Cross-case text leak test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-34-E2E — Search scope
- **Boundary under test:** Authorized per-case query
- **Expected verification:** Cross-case text leak test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-35-UNIT — Pagination
- **Boundary under test:** Bounded stable cursor/page
- **Expected verification:** Boundary pagination test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-35-INTEGRATION — Pagination
- **Boundary under test:** Bounded stable cursor/page
- **Expected verification:** Boundary pagination test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-35-E2E — Pagination
- **Boundary under test:** Bounded stable cursor/page
- **Expected verification:** Boundary pagination test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-36-UNIT — Output schema
- **Boundary under test:** Runtime parse all provider responses
- **Expected verification:** Malformed provider fixture
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-36-INTEGRATION — Output schema
- **Boundary under test:** Runtime parse all provider responses
- **Expected verification:** Malformed provider fixture
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-36-E2E — Output schema
- **Boundary under test:** Runtime parse all provider responses
- **Expected verification:** Malformed provider fixture
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-37-UNIT — Model metadata
- **Boundary under test:** Record model/prompt/schema version
- **Expected verification:** Saved run introspection
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-37-INTEGRATION — Model metadata
- **Boundary under test:** Record model/prompt/schema version
- **Expected verification:** Saved run introspection
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-37-E2E — Model metadata
- **Boundary under test:** Record model/prompt/schema version
- **Expected verification:** Saved run introspection
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-38-UNIT — Feature-off workflow
- **Boundary under test:** Recorded pipeline works with live/cue off
- **Expected verification:** Feature-flag E2E
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-38-INTEGRATION — Feature-off workflow
- **Boundary under test:** Recorded pipeline works with live/cue off
- **Expected verification:** Feature-flag E2E
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-38-E2E — Feature-off workflow
- **Boundary under test:** Recorded pipeline works with live/cue off
- **Expected verification:** Feature-flag E2E
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-39-UNIT — Deployment limits
- **Boundary under test:** Large media doesn't proxy through unsupported request body
- **Expected verification:** Test payload path
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-39-INTEGRATION — Deployment limits
- **Boundary under test:** Large media doesn't proxy through unsupported request body
- **Expected verification:** Test payload path
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-39-E2E — Deployment limits
- **Boundary under test:** Large media doesn't proxy through unsupported request body
- **Expected verification:** Test payload path
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-40-UNIT — Migrations
- **Boundary under test:** Schema and policies deploy from clean state
- **Expected verification:** Fresh DB smoke test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-40-INTEGRATION — Migrations
- **Boundary under test:** Schema and policies deploy from clean state
- **Expected verification:** Fresh DB smoke test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-40-E2E — Migrations
- **Boundary under test:** Schema and policies deploy from clean state
- **Expected verification:** Fresh DB smoke test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-41-UNIT — Health route
- **Boundary under test:** No secret values/model bill per ping
- **Expected verification:** Readiness test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-41-INTEGRATION — Health route
- **Boundary under test:** No secret values/model bill per ping
- **Expected verification:** Readiness test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-41-E2E — Health route
- **Boundary under test:** No secret values/model bill per ping
- **Expected verification:** Readiness test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

### ARCH-VERIFY-42-UNIT — Logging request ID
- **Boundary under test:** Correlate route and provider stage
- **Expected verification:** Request correlation test
- **Level:** Pure schema/domain/state tests
- **Evidence:** No network or live credentials required.
- **Status:** Pending until test executed.

### ARCH-VERIFY-42-INTEGRATION — Logging request ID
- **Boundary under test:** Correlate route and provider stage
- **Expected verification:** Request correlation test
- **Level:** Test DB/storage/provider adapter boundaries
- **Evidence:** Use isolated credentials and synthetic fixture.
- **Status:** Pending until test executed.

### ARCH-VERIFY-42-E2E — Logging request ID
- **Boundary under test:** Correlate route and provider stage
- **Expected verification:** Request correlation test
- **Level:** End-user workflow and durable state
- **Evidence:** Use named fixture and recorded build/environment.
- **Status:** Pending until test executed.

## Architecture invariants

- Route handlers validate input before invoking costly operations.
- Service methods accept trusted actor context separately from request payload.
- All persistent writes occur through a transaction or explicit state transition where correctness depends on several records.
- Child entities are scoped through their parent record and run relationships.
- Provider response data is converted to domain DTOs at the adapter boundary.
- Media URLs are temporary transport capabilities, not permanent identifiers.
- Analysis run states are durable and auditable.
- Review state uses versioning or transaction semantics to avoid silent clobbering.
- Stage retry is narrow and cannot reset unrelated successful output.
- Logs are a separate security boundary; don't rely on UI hiding to protect sensitive values.
- Database RLS supplements API checks; neither replaces the other.
- A feature flag is not security unless checked server-side.
- The web UI must reflect persisted states, not speculative timers.
- Cleanup is an operation with its own success/failure lifecycle.
- Any split worker/queue requires a measurable runtime justification and a new operational plan.

## Service ownership map

| Concern | Authoritative owner | Consumers |
|---|---|---|
| User identity | Authentication session | API guard, audit history |
| Case access | Server authorization + RLS | Case service, storage grant service |
| Audio object lifetime | Retention policy + Storage confirmation | Player UI, case status, operations |
| Run status | Analysis-run repository | Dashboard, report builder, retries |
| Transcript source text | Model output record | Evidence navigation, review UI |
| Officer correction | Review/correction repository | Transcript display, report |
| Finding review state | Finding/review service | Timeline, overview, report |
| Model capability | Server-side config and evaluation evidence | UI, API handlers, preflight |
| Export content | Report snapshot/allowlist | CSV/print rendering |
| Failure diagnosis | Safe error mapper and request ID | UI, operations logging |

## API contract review checklist

- [ ] Route uses schema validation.
- [ ] Actor comes from trusted auth context.
- [ ] Resource access checked before returning details.
- [ ] Request size, media limits and query limits apply.
- [ ] State transition is checked server-side.
- [ ] Idempotency/replay behavior is defined for mutation.
- [ ] Provider failures map to stable error classes.
- [ ] Partial/empty/failure responses are different.
- [ ] No secret or raw provider payload is returned.
- [ ] Operation logs carry safe request ID.
- [ ] Integration test checks persisted outcome.
- [ ] Negative authorization test exists.

## Reference boundary

Architecture verification supports planning, not proof of compliance. All Passed statuses require actual output from the named environment/commit.
