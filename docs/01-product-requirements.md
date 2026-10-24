# 01 — Product Requirements and Scope

> Planning specification only. Writing this file does not mean the listed behaviors have been implemented or tested.

## Product definition

Voice-to-Investigation AI is an officer-facing review workspace for authorized recorded audio and, subject to verified integration, live microphone audio. It transcribes speech, structures explicitly mentioned details, surfaces possible incident triggers, optionally shows experimental source-linked vocal cues and supports human review/export.

### Problem to solve

Audio review involves repetitive listening, note taking, transcript navigation and manual extraction. This prototype should reduce navigation/structuring overhead while preserving provenance, uncertainty and human authority.

### Product promise

- Find a statement in the source audio faster.
- Link every material AI finding to a source time and excerpt.
- Separate model output, officer correction and external verification.
- Show honest partial/error/abstention states.
- Minimize raw audio retention and avoid unsupported high-impact inference.

### Explicit non-goals

- No SOS consumer app, GPS tracker, trusted-contact SMS or emergency dispatch integration.
- No automated calling, police/112/911 dispatch or external side effect.
- No lie detection, guilt/deception/intent prediction or psychological diagnosis.
- No voiceprint identity, person search or demographic inference from voice.
- No vector database, RAG, multi-agent framework, custom model training or unrelated chatbot.
- No claim of forensic certification or operational suitability.

## Users and success outcomes

### PRD-PER-1 — Primary officer
- **Need:** Needs to scan speech, inspect important intervals, validate candidate details and produce neutral report.
- **Success:** Success means findings are source-linked and correctable.

### PRD-PER-2 — Reviewer
- **Need:** Needs to see model suggestions, officer corrections and dismissed items separately.
- **Success:** Success means current state and prior review actions are traceable.

### PRD-PER-3 — Developer/operator
- **Need:** Needs debuggable provider boundaries, bounded cost, recovery and retention.
- **Success:** Success means failures are reproducible without logging private audio.

### PRD-PER-4 — Hackathon evaluator
- **Need:** Needs a demonstrably working recorded path and a truthful live demo/fallback.
- **Success:** Success means claims shown on screen match tested capability.

## Functional requirements

### PRD-FR-001 — Audio upload
- **Requirement:** Accept configured MP3/WAV formats; validate extension, declared/detected type, size and duration server-side.
- **Guardrail:** Invalid media rejected before model calls; no arbitrary client storage paths.
- **Acceptance:** Pass: valid file enters pipeline, malformed/unsupported file gets a stable error.
- **Priority:** P0

### PRD-FR-002 — Upload lifecycle
- **Requirement:** Use a server-generated private object path; verify object after transfer; support real progress/cancel.
- **Guardrail:** Client-reported size/MIME is not proof; partial uploads must be cleaned up.
- **Acceptance:** Pass: interruption and cancellation do not leave a false completed recording.
- **Priority:** P0

### PRD-FR-003 — Recorded transcription
- **Requirement:** Use the verified transcription endpoint; normalize text/time/speaker/language into internal segments.
- **Guardrail:** Do not invent words or make unclear speech fluent.
- **Acceptance:** Pass: transcript from a synthetic clip has source-anchored segments.
- **Priority:** P0

### PRD-FR-004 — Transcript uncertainty
- **Requirement:** Mark unclear regions, uncertain names and partial phone digits explicitly.
- **Guardrail:** No contextual guessing that appears verbatim.
- **Acceptance:** Pass: unclear fixture stays uncertain in UI and export.
- **Priority:** P0

### PRD-FR-005 — Language metadata
- **Requirement:** Store detected/selected language plus source and uncertainty.
- **Guardrail:** Do not use browser locale as transcript language; keep translation separate.
- **Acceptance:** Pass: Hindi, English, Hinglish and unknown-language fixtures remain honest.
- **Priority:** P0

### PRD-FR-006 — Speaker labels
- **Requirement:** Use provider labels only where returned and validated; scope them to the recording/run.
- **Guardrail:** No identity, gender or age inference from voice.
- **Acceptance:** Pass: overlap case is labelled provisional or uncertain.
- **Priority:** P0

### PRD-FR-007 — Entity extraction
- **Requirement:** Extract explicitly spoken names, places, landmarks, phones, dates, vehicles and roles with evidence references.
- **Guardrail:** No geocoding, reverse-phone lookup, external identity enrichment or inferred address.
- **Acceptance:** Pass: ambiguous values are uncertain or omitted.
- **Priority:** P0

### PRD-FR-008 — Reported roles
- **Requirement:** Suggest caller/victim/witness/alleged aggressor only with supporting context.
- **Guardrail:** Allegations must stay attributed, not promoted to fact.
- **Acceptance:** Pass: role can be reviewed, corrected or dismissed.
- **Priority:** P0

### PRD-FR-009 — Contextual trigger detection
- **Requirement:** Find potential help requests, threats and reported urgent events, with quote and source interval.
- **Guardrail:** Handle negation, historical statements, hypotheticals, quotations and reported speech.
- **Acceptance:** Pass: positive and negative examples produce context-aware output.
- **Priority:** P0

### PRD-FR-010 — Empty trigger result
- **Requirement:** Represent no supported candidates as an empty result after successful analysis.
- **Guardrail:** Never label a clip safe or emergency-free.
- **Acceptance:** Pass: empty, failed and no-transcript states are distinct.
- **Priority:** P0

### PRD-FR-011 — Vocal cues
- **Requirement:** Optionally report possible fear/anger/distress/nervousness or observable acoustic cues with time and caveat.
- **Guardrail:** Never infer guilt, deception, honesty, intent or diagnosis.
- **Acceptance:** Pass: feature enabled only after evaluation gate, otherwise disabled/experimental.
- **Priority:** P0

### PRD-FR-012 — Acoustic/semantic separation
- **Requirement:** Keep possible sound properties distinct from transcript sentiment/meaning.
- **Guardrail:** Do not label vocal anger solely from insulting words.
- **Acceptance:** Pass: calm urgent speech and angry-neutral speech remain distinct channels.
- **Priority:** P0

### PRD-FR-013 — Abstention
- **Requirement:** Permit insufficient-evidence/no-output for silence, short, noisy or ambiguous audio.
- **Guardrail:** No forced class and no made-up confidence percentage.
- **Acceptance:** Pass: low-evidence fixture can abstain.
- **Priority:** P0

### PRD-FR-014 — Audio player
- **Requirement:** Provide play/pause/seek/time and source availability state.
- **Guardrail:** Don't show fake waveform if signal data isn't available.
- **Acceptance:** Pass: transcript/finding selection seeks to source time or explains unavailability.
- **Priority:** P0

### PRD-FR-015 — Transcript navigation
- **Requirement:** Chronological segments with time and provisional speaker labels where available.
- **Guardrail:** Live interim content must not appear final/reviewed.
- **Acceptance:** Pass: event updates modify segments rather than duplicate them.
- **Priority:** P0

### PRD-FR-016 — Transcript search
- **Requirement:** Search only within authorized current case and paginate/bound result count.
- **Guardrail:** No global sensitive transcript search by default.
- **Acceptance:** Pass: match, no-match, and missing-transcript states differ.
- **Priority:** P0

### PRD-FR-017 — Transcript correction
- **Requirement:** Store officer-reviewed text while preserving original model output and actor/time.
- **Guardrail:** No destructive silent overwrite.
- **Acceptance:** Pass: report identifies correction/provenance.
- **Priority:** P0

### PRD-FR-018 — Finding review
- **Requirement:** Allow confirm/correct/dismiss with review status, actor, time and optional reason.
- **Guardrail:** No automatic confirmation of high-impact findings.
- **Acceptance:** Pass: action persists after reload; unauthorized mutations fail.
- **Priority:** P0

### PRD-FR-019 — Finding evidence
- **Requirement:** Material findings reference source segment IDs or explicit audio time ranges.
- **Guardrail:** No source-less factual finding unless explicitly general, non-evidentiary summary.
- **Acceptance:** Pass: broken/cross-run references are rejected.
- **Priority:** P0

### PRD-FR-020 — Timeline
- **Requirement:** Chronological events with stable tie-breaking and a separate untimed group.
- **Guardrail:** No fabricated timestamps.
- **Acceptance:** Pass: equal, missing, negative and out-of-range times are tested.
- **Priority:** P0

### PRD-FR-021 — Follow-up suggestions
- **Requirement:** Suggest questions about unclear/missing details and keep them separate from facts.
- **Guardrail:** Never invent an answer or infer safety from silence.
- **Acceptance:** Pass: suggestion can be dismissed without changing findings.
- **Priority:** P0

### PRD-FR-022 — Contradictions
- **Requirement:** Show both conflicting claims and source intervals using neutral language.
- **Guardrail:** Do not rank credibility or infer deception.
- **Acceptance:** Pass: unresolved claims remain visible until human action.
- **Priority:** P0

### PRD-FR-023 — Case creation
- **Requirement:** Generate case ID/server timestamps; validate title and notes; bind creator to session.
- **Guardrail:** Never trust actor ID from request payload.
- **Acceptance:** Pass: double submit has defined idempotent behavior.
- **Priority:** P0

### PRD-FR-024 — Case list
- **Requirement:** Server-side paging and status/date/mode filters over authorized cases.
- **Guardrail:** Client-side hiding is not authorization.
- **Acceptance:** Pass: two-user test reveals no cross-case data.
- **Priority:** P0

### PRD-FR-025 — Analysis runs
- **Requirement:** Store each processing attempt, stage status, provider/model IDs and prompt/schema versions.
- **Guardrail:** Never silently merge results between runs.
- **Acceptance:** Pass: refresh returns durable status and selected run.
- **Priority:** P0

### PRD-FR-026 — Retry
- **Requirement:** Retry only known-retryable stages with bounded attempts/idempotency.
- **Guardrail:** No nested retry storm or duplicate billing without traceability.
- **Acceptance:** Pass: repeated requests follow documented contract.
- **Priority:** P0

### PRD-FR-027 — Partial processing
- **Requirement:** Keep usable stage output only when consistent and clearly label missing stages.
- **Guardrail:** Partial transcript is not represented complete.
- **Acceptance:** Pass: partial report names failed/unavailable stages.
- **Priority:** P0

### PRD-FR-028 — Case notes
- **Requirement:** Keep officer notes distinct from AI-generated text and findings.
- **Guardrail:** No unlabelled merge into model narrative.
- **Acceptance:** Pass: notes persist and export separately.
- **Priority:** P0

### PRD-FR-029 — Reports
- **Requirement:** Render neutral summary, run metadata, timeline, evidence, reviewed findings and caveats.
- **Guardrail:** Pin report to one run/review snapshot; no unsupported factual claim.
- **Acceptance:** Pass: exported content reconciles to stored records.
- **Priority:** P0

### PRD-FR-030 — CSV export
- **Requirement:** Allowlist fields, escape formula-leading cells, quote safely and bound rows.
- **Guardrail:** No secrets, raw provider payloads or signed URLs.
- **Acceptance:** Pass: malicious spreadsheet payload remains inert.
- **Priority:** P0

### PRD-FR-031 — Print/PDF
- **Requirement:** Start with printable report; add PDF library only if justified.
- **Guardrail:** Include method limitation and provenance; no forensic-certification claim.
- **Acceptance:** Pass: print output includes caveats and readable tables.
- **Priority:** P0

### PRD-FR-032 — Microphone start
- **Requirement:** Request browser microphone permission only after explicit user action.
- **Guardrail:** No background or page-load recording.
- **Acceptance:** Pass: permission denial offers recorded path.
- **Priority:** P0

### PRD-FR-033 — Live transcription
- **Requirement:** Use verified live transcription protocol; reflect actual incremental/final events.
- **Guardrail:** Never simulate transcript updates without provider events.
- **Acceptance:** Pass: live sample creates real incremental text and finalized state.
- **Priority:** P0

### PRD-FR-034 — Live stop/finalize
- **Requirement:** Stop capture and close session; persist final/partial state before claiming save.
- **Guardrail:** Repeated stop is idempotent; late events obey closed-session rules.
- **Acceptance:** Pass: reload shows persisted final/partial state.
- **Priority:** P0

### PRD-FR-035 — Live reconnect
- **Requirement:** Bound retries and represent connecting/connected/reconnecting/disconnected truthfully.
- **Guardrail:** No endless socket retry or false connected badge.
- **Acceptance:** Pass: network fault yields recoverable or terminal state.
- **Priority:** P0

### PRD-FR-036 — Temporary audio retention
- **Requirement:** Private storage, explicit bounded policy and real object deletion.
- **Guardrail:** DB row removal alone is not proof media was removed.
- **Acceptance:** Pass: storage object absence is checked; failure remains retryable.
- **Priority:** P0

### PRD-FR-037 — Provider-file lifecycle
- **Requirement:** If provider upload/file API is used, separately track remote object expiry/deletion.
- **Guardrail:** Local delete doesn't establish provider-side delete.
- **Acceptance:** Pass: provider data lifetime is verified/documented.
- **Priority:** P0

### PRD-FR-038 — Access isolation
- **Requirement:** Authorize all case/recording/segment/finding/export/delete operations at server and RLS/storage layers.
- **Guardrail:** UUID obscurity is not a security mechanism.
- **Acceptance:** Pass: two-account negative suite passes.
- **Priority:** P0

### PRD-FR-039 — Secrets
- **Requirement:** Keep Gemini/service-role secrets server-only; validate presence without printing values.
- **Guardrail:** No `.env` or secret in browser-visible config.
- **Acceptance:** Pass: bundle and network scan show no privileged key.
- **Priority:** P1

### PRD-FR-040 — Rate and cost limits
- **Requirement:** Bound bytes, duration, user requests, concurrency and retries server-side.
- **Guardrail:** UI-only rate limit is not enough.
- **Acceptance:** Pass: direct API burst is rejected predictably.
- **Priority:** P1

### PRD-FR-041 — Privacy disclosure
- **Requirement:** Explain intended authorized use and actual temporary-audio policy before upload/capture.
- **Guardrail:** No absolute deletion promise beyond verifiable platform/provider behavior.
- **Acceptance:** Pass: copy matches implemented policy.
- **Priority:** P1

### PRD-FR-042 — Demo data
- **Requirement:** Only synthetic or explicitly consented/authorized audio; persistent Demo/Synthetic badge.
- **Guardrail:** No sensitive real calls in repo/issues/screenshots.
- **Acceptance:** Pass: fixture register reviewed before demo.
- **Priority:** P1

### PRD-FR-043 — Errors
- **Requirement:** Use safe error code, request ID and recovery action; log minimal diagnostics.
- **Guardrail:** Never expose stack trace, raw provider response or secrets.
- **Acceptance:** Pass: injected errors pass output/log leak review.
- **Priority:** P1

### PRD-FR-044 — Accessibility
- **Requirement:** Keyboard navigation, visible focus, semantic labels, contrast and textual status.
- **Guardrail:** No color-only status or hover-only critical action.
- **Acceptance:** Pass: keyboard-only and zoom checks pass.
- **Priority:** P1

### PRD-FR-045 — Responsive UI
- **Requirement:** Desktop-first; collapse/stack secondary panels on tablet widths.
- **Guardrail:** Don't hide source evidence or live Stop control at narrow widths.
- **Acceptance:** Pass: 1024px and 768px screenshots reviewed.
- **Priority:** P1

### PRD-FR-046 — Truthful progress
- **Requirement:** Use persisted job state and actual upload/socket events.
- **Guardrail:** No timer-generated progress/success.
- **Acceptance:** Pass: refresh reproduces true state.
- **Priority:** P1

### PRD-FR-047 — Unknown language
- **Requirement:** Mark unsupported/uncertain state and offer manual review if implemented.
- **Guardrail:** No hallucinated transcript or silent translation.
- **Acceptance:** Pass: unknown-language fixture behaves explicitly.
- **Priority:** P1

### PRD-FR-048 — Output bounds
- **Requirement:** Bound model response bytes, array counts, text lengths, segments and export rows.
- **Guardrail:** No unbounded render/storage path.
- **Acceptance:** Pass: oversized provider response fails safely.
- **Priority:** P1

### PRD-FR-049 — Model traceability
- **Requirement:** Store model IDs, prompt/schema versions, run ID and stage times.
- **Guardrail:** Do not log sensitive prompt content for traceability.
- **Acceptance:** Pass: results can be tied to config/version.
- **Priority:** P1

### PRD-FR-050 — No dispatch
- **Requirement:** No calling, SMS, dispatch endpoint or hidden outbound webhook.
- **Guardrail:** Model cues only support officer review.
- **Acceptance:** Pass: API/routes inventory contains no external emergency action.
- **Priority:** P1

### PRD-FR-051 — No identity matching
- **Requirement:** No voiceprint/biometric identity search or public-record enrichment.
- **Guardrail:** Use neutral recording-scoped speaker labels only.
- **Acceptance:** Pass: schema/dependencies exclude identity resolution.
- **Priority:** P1

### PRD-FR-052 — Expired source UI
- **Requirement:** Retain permitted metadata while clearly marking media expired/unavailable.
- **Guardrail:** Don't present disabled/broken player as working.
- **Acceptance:** Pass: report and case views explain source state.
- **Priority:** P1

### PRD-FR-053 — Session expiry
- **Requirement:** Clear protected UI state and revalidate server access after logout/expiry.
- **Guardrail:** Don't expose cached case text to next session.
- **Acceptance:** Pass: protected calls are denied after sign-out.
- **Priority:** P1

### PRD-FR-054 — Migrations
- **Requirement:** Version tables, constraints, indexes and RLS; test clean installation.
- **Guardrail:** No manual-only schema changes.
- **Acceptance:** Pass: clean project matches tracked migrations.
- **Priority:** P1

### PRD-FR-055 — Analytics
- **Requirement:** Default to no transcript, phone, address, case title or audio content in analytics.
- **Guardrail:** Use only an approved allowlist of aggregate events.
- **Acceptance:** Pass: browser analytics payload inspection passes.
- **Priority:** P1

### PRD-FR-056 — Deployment limits
- **Requirement:** Use direct private-storage upload when payload/function constraints require it.
- **Guardrail:** No assumption that large audio can pass through a serverless body.
- **Acceptance:** Pass: chosen clip fits measured runtime limits.
- **Priority:** P2

### PRD-FR-057 — Capability flags
- **Requirement:** Disable live or vocal-cue feature when its feasibility/security gate fails.
- **Guardrail:** Never substitute fake result.
- **Acceptance:** Pass: disabling experimental feature leaves recorded flow usable.
- **Priority:** P2

### PRD-FR-058 — Re-analysis
- **Requirement:** Keep every analysis run isolated and intentionally select active run.
- **Guardrail:** No implicit merging of old/new findings.
- **Acceptance:** Pass: selected-run export matches displayed run.
- **Priority:** P2

### PRD-FR-059 — External sources
- **Requirement:** Out-of-scope until explicitly authorized; any verification needs its own provenance.
- **Guardrail:** No implicit search/geocoding/reverse-phone integration.
- **Acceptance:** Pass: no hidden enrichment API.
- **Priority:** P2

### PRD-FR-060 — Operational diagnostics
- **Requirement:** Capture request IDs, stage duration and normalized error categories.
- **Guardrail:** Exclude raw transcript/audio and credentials by default.
- **Acceptance:** Pass: logs aid debugging with no sensitive fixture strings.
- **Priority:** P2

### PRD-FR-061 — Scope control
- **Requirement:** Each feature maps to need, data impact, failure modes and acceptance test.
- **Guardrail:** Defer decorative charts, unrelated app concepts and redundant infrastructure.
- **Acceptance:** Pass: change request contains user value and verifiable result.
- **Priority:** P2

### PRD-FR-062 — Release caveat
- **Requirement:** Call this a hackathon decision-support prototype; list tested and untested capability.
- **Guardrail:** No official/forensic operational claims.
- **Acceptance:** Pass: README/report/demo states limitation.
- **Priority:** P2

## User stories

### PRD-US-01 — Officer — Upload an authorized recording
- **Outcome:** Review a transcript, findings and source moments in one place
- **Acceptance:** Valid sample is processed and invalid input rejected before provider call.

### PRD-US-02 — Officer — Click a timestamp
- **Outcome:** Replay the relevant source span
- **Acceptance:** Playback seeks accurately or shows source unavailable.

### PRD-US-03 — Reviewer — Correct a mistranscribed location
- **Outcome:** Preserve model and reviewed text separately
- **Acceptance:** Correction actor/time and report provenance remain.

### PRD-US-04 — Officer — Inspect a possible help request
- **Outcome:** See phrase, context and timestamp
- **Acceptance:** It remains a candidate and never triggers dispatch.

### PRD-US-05 — Reviewer — Dismiss an unsupported cue
- **Outcome:** Reject it without destroying history
- **Acceptance:** Dismissed status persists and is excluded from confirmed summary.

### PRD-US-06 — Officer — Start live transcription
- **Outcome:** Know whether microphone is actually active
- **Acceptance:** Permission is explicit; socket status is truthful.

### PRD-US-07 — Officer — Review a mentioned address
- **Outcome:** Distinguish spoken claim from verified location
- **Acceptance:** No GPS coordinates are inferred.

### PRD-US-08 — Operator — Expire temporary audio
- **Outcome:** Know whether object deletion completed
- **Acceptance:** Pending/failed/deleted status reflects actual result.

### PRD-US-09 — Presenter — Show a named synthetic fixture
- **Outcome:** Demonstrate repeatable pipeline and report
- **Acceptance:** Synthetic label remains visible.

### PRD-US-10 — Developer — Change provider model
- **Outcome:** Re-test adapter without changing UI contract
- **Acceptance:** Versioned fixture suite surfaces response differences.

## End-to-end workflows

### PRD-WF-01 — Create case
- **Happy path:** Validate bounded title/notes, authorize actor, persist generated ID/server timestamp, open case detail.
- **Failure contract:** Invalid fields fail clearly; duplicate submit follows idempotency rule.

### PRD-WF-02 — Recorded analysis
- **Happy path:** Authorize upload, upload privately, verify object, create run, transcribe, validate, extract, persist, review.
- **Failure contract:** Each stage has durable state; partial failure is explicit.

### PRD-WF-03 — Finding review
- **Happy path:** Load evidence, replay source, submit explicit action, validate state/version, append audit action and refresh.
- **Failure contract:** No mutation on unauthorized or stale state.

### PRD-WF-04 — Live session
- **Happy path:** Explicit start, permission prompt, session handshake, stream, normalize events, stop, finalize and close capture.
- **Failure contract:** Connection loss/denial cannot be labelled successful live analysis.

### PRD-WF-05 — Report export
- **Happy path:** Authorize selected run, snapshot reviewed data, escape content, render CSV/print, audit event.
- **Failure contract:** No mixed-run content; method and limits included.

### PRD-WF-06 — Audio expiry
- **Happy path:** Select due row, verify policy, delete trusted storage object, confirm absence, record outcome and retry errors.
- **Failure contract:** Never label deleted before confirmation.

## Non-functional quality attributes

### PRD-NFR-1 — Privacy
- **Requirement:** Minimal retention and verified object cleanup.
- **Evidence:** Check actual Storage object and provider-file lifecycle.

### PRD-NFR-2 — Authorization
- **Requirement:** Protect every case/recording/segment/finding/export/delete call.
- **Evidence:** Two-account negative tests cover API, DB and Storage.

### PRD-NFR-3 — Reliability
- **Requirement:** Durable stage states and safe retries.
- **Evidence:** Refresh/network faults never show fake completion.

### PRD-NFR-4 — Evidence fidelity
- **Requirement:** Source timestamps and provenance for material claims.
- **Evidence:** Every finding anchors to valid evidence.

### PRD-NFR-5 — Model honesty
- **Requirement:** Unknown, partial and abstained states are supported.
- **Evidence:** No forced emotion output or fabricated confidence.

### PRD-NFR-6 — Performance
- **Requirement:** Latency and resource use are measured against named fixtures.
- **Evidence:** Record model ID, clip duration and environment.

### PRD-NFR-7 — Cost control
- **Requirement:** Input size/duration, concurrency and retry counts are bounded.
- **Evidence:** Direct API burst is limited on server.

### PRD-NFR-8 — Accessibility
- **Requirement:** Keyboard, focus, labels, contrast and narrow-screen support.
- **Evidence:** Keyboard-only and zoom test.

### PRD-NFR-9 — Maintainability
- **Requirement:** Provider SDK data stays inside adapters.
- **Evidence:** Domain types are vendor-neutral.

### PRD-NFR-10 — Portability
- **Requirement:** Environment setup is documented and validated.
- **Evidence:** Clean config smoke test succeeds.

## Domain glossary

| Term | Meaning | Does not mean |
|---|---|---|
| Candidate entity | Explicit spoken detail surfaced for review | Verified identity or geolocation |
| Trigger candidate | Contextual utterance/event needing officer attention | Confirmed emergency or dispatch instruction |
| Vocal cue | Possible acoustic observation localized to a source interval | Proof of emotion, intent, guilt or honesty |
| Officer-confirmed | A reviewer accepted a candidate | Independently verified fact unless a separate source is recorded |
| Abstention | Evidence is insufficient for a supported label | Evidence that no problem exists |
| Partial analysis | Some stages succeeded and some did not | Complete result |
| Demo fixture | Named synthetic/authorized sample | Real police evidence |
| Analysis run | Versioned attempt tied to one recording | A mix of earlier/current outputs |

## Release gates

### PRD-GATE-1 — Recorded end-to-end
- **Pass criteria:** Authorized synthetic clip uploads, transcribes, normalizes, persists, can be reviewed and exported.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

### PRD-GATE-2 — Evidence traceability
- **Pass criteria:** Transcript, entity and trigger findings open their source time or explicitly explain missing source.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

### PRD-GATE-3 — Vocal cue gate
- **Pass criteria:** Feature is enabled only if evaluation supports grounded, cautious output and abstention; otherwise disabled/experimental.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

### PRD-GATE-4 — Live gate
- **Pass criteria:** Actual mic session shows real connection/events; otherwise it is disabled and recorded fallback is used.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

### PRD-GATE-5 — Security gate
- **Pass criteria:** No browser secret; private audio; RLS and cross-user tests pass.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

### PRD-GATE-6 — Retention gate
- **Pass criteria:** Storage object is actually deleted and failure remains retryable.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

### PRD-GATE-7 — Report gate
- **Pass criteria:** One run is selected; provenance, review state, uncertainty and limits included.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

### PRD-GATE-8 — Demo gate
- **Pass criteria:** Only synthetic/authorized clips; no dispatch or guilt/deception claim.
- **Status:** Not evaluated by authoring this document; attach evidence before passing.

## Detailed acceptance checklist

- [ ] PRD-CHECK-01: Product scope remains consistent across UI, report and narration.
- [ ] PRD-CHECK-02: Recorded and live flows have separate success/error states.
- [ ] PRD-CHECK-03: Transcript offsets are valid relative to the source media.
- [ ] PRD-CHECK-04: Unclear speech, digits, names and locations remain uncertain rather than guessed.
- [ ] PRD-CHECK-05: Claims are labelled reported/unverified until a distinct verification action is recorded.
- [ ] PRD-CHECK-06: Entities are not externally enriched with identity lookup or GPS inference.
- [ ] PRD-CHECK-07: Trigger logic covers negation, historical speech, hypotheticals and quotations.
- [ ] PRD-CHECK-08: Empty trigger list does not imply safety.
- [ ] PRD-CHECK-09: Acoustic observation remains separate from transcript sentiment.
- [ ] PRD-CHECK-10: Vocal-cue pipeline can abstain and be disabled.
- [ ] PRD-CHECK-11: Every material finding has a valid source anchor or explicit exception.
- [ ] PRD-CHECK-12: Officer corrections preserve source/model provenance.
- [ ] PRD-CHECK-13: Case filters/exports/deletes are server authorized.
- [ ] PRD-CHECK-14: Audio retention uses a bounded and implemented expiry policy.
- [ ] PRD-CHECK-15: Provider-uploaded remote files are covered by separate lifecycle rules.
- [ ] PRD-CHECK-16: CSV formula-leading content is escaped.
- [ ] PRD-CHECK-17: Report is pinned to a run and includes limitations.
- [ ] PRD-CHECK-18: Loading, empty, partial, failure, expired and denied states are distinct.
- [ ] PRD-CHECK-19: Provider raw exceptions and secrets are not returned to browser.
- [ ] PRD-CHECK-20: Upload bytes/duration, output items, concurrent calls and retries are bounded.
- [ ] PRD-CHECK-21: Demo fixture label appears on every relevant screen and export.
- [ ] PRD-CHECK-22: No dispatch action is triggered by AI output.
- [ ] PRD-CHECK-23: No global danger score, lie detector or guilt classification exists.
- [ ] PRD-CHECK-24: Language claims match actual test coverage.
- [ ] PRD-CHECK-25: Preflight catches missing configuration without printing secret values.
- [ ] PRD-CHECK-26: Core UI actions work by keyboard and readable contrast.
- [ ] PRD-CHECK-27: Changing model/prompt/schema triggers evaluation/regression.
- [ ] PRD-CHECK-28: Documentation is updated after observed API behavior changes.
- [ ] PRD-CHECK-29: Untested capabilities remain pending/experimental, not passed.
- [ ] PRD-CHECK-30: Planning edits do not modify product code until explicitly authorized.

## Scope change rule

Every feature addition needs a user problem, data/safety impact, dependency, failure path and observable acceptance test. Decorative analytics, unrelated consumer features and redundant infrastructure are deferred.

## References
- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/transcribe
- https://ai.google.dev/gemini-api/docs/audio
- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- https://nextjs.org/docs/app
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://vercel.com/docs/errors/function_payload_too_large
