# VECNAVERSE — Repository Audit Report

**Repository:** https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh  
**Branch inspected:** main  
**Audit date:** 2026-10-24  
**Method:** Static review of repository tree, README, planning specifications, selected source modules and tests. The application/test suite was not executed; no provider smoke test, browser E2E, Supabase integration test or deployed runtime validation was performed.

## Executive summary

The repository contains a substantial Next.js/React/TypeScript application, shared UI components, API routes, a Gemini adapter, deterministic synthetic fixtures and five Vitest test files. It is not documentation-only despite README still claiming no application implementation is included.

**Verdict: NOT READY to claim fully functional real-time speech emotion analysis.** Critical gaps exist in recorded-audio upload, live microphone streaming, emotion values, data persistence, authentication/authorization, and verified retention. This is a static audit; unexecuted behavior is marked unverified rather than failed.

## 1. Repository inventory

- README, `.env.example`, package files and TypeScript/Tailwind configuration.
- `docs/`: 11 specifications for product, architecture, UX, AI/audio, data/API, security/retention, testing, workstreams, deployment, demo and traceability.
- `screens/`: four UI references with PNG and HTML, plus `warm_obsidian_intelligence/DESIGN.md`.
- `src/app/`: overview, cases list/details, audio analysis, live monitor, audit logs and case CRUD/analyze/review/export/retention/telemetry routes.
- `src/components/`: audio player, synchronized transcript, entity/trigger/timeline/vocal panels, review bar, report modal, header/sidebar and live monitor.
- `src/lib/`: Gemini adapter, types/schemas, synthetic fixtures, local store, audio preflight and retention.
- `test/`: `api-routes.test.ts`, `audio-preflight.test.ts`, `case-store.test.ts`, `export.test.ts`, `gemini-adapter.test.ts`.
- `package.json` defines `dev`, `build`, `start` and `test`. These commands were not run in this audit.
- GitHub Actions endpoint returned zero workflow runs, so no CI result was available.

## 2. Requirement/status matrix

| Requirement | Evidence observed | Status |
|---|---|---|
| Overview dashboard and case list | `src/app/page.tsx`, `src/app/cases/page.tsx` | UI exists; data truth and claims need correction |
| Case details workspace | `src/app/cases/[id]/page.tsx` and reusable components | UI exists; runtime data/evidence flow not verified |
| Custom audio upload | `src/app/new-audio-analysis/page.tsx` | Partial/critical gap: selected File is not uploaded |
| Recorded real-audio analysis | Gemini adapter and analyze route | Partial/blocked: route reads a storage path; upload flow sets preset path/fabricated metadata |
| Transcript timestamps/source linkage | Schemas, mappings and transcript component | Partial; source timing accuracy not tested |
| Named entities | Gemini prompt/schema and EntityList | Partial; end-to-end grounding not tested |
| Context-aware triggers | DIRECT/NEGATED/HYPOTHETICAL/HISTORICAL/QUOTED schema and fixture tests | Partial; real-provider validation not established |
| Actual acoustic SER | UI and emotion profile exist | Not credible yet: route assigns fixed metrics from triggers/caller category |
| Real microphone/live stream | LiveMonitorView | Missing; hard-coded transcript and simulated timer/pitch |
| Case CRUD | API routes and local store | Partial; planned tenant-scoped database absent from inspected tree |
| Officer review | UI, review route and store methods | Partial; actor identity is request-provided/defaulted |
| Reports/CSV export | Report modal and export route | Partial; source-run binding and result reconciliation unverified |
| Audio retention | Helper and purge route | Partial/unsafe; no scheduled sweep found and delete failure can be marked purged |
| Supabase Auth/Postgres/RLS/private Storage | Specified by architecture docs; placeholders in `.env.example` | Implementation not found in source tree |
| Authentication/per-case authorization | Reviewed API routes have no visible session/ownership guard | Missing/unverified; block sensitive-data use |
| Telemetry honesty | `/api/telemetry` returns fixed operational/compliance claims | Unsupported hard-coded claims |
| Automated tests | Five test files present | Tests exist; pass/fail unconfirmed |
| Deployment/CI | Scripts/config present; no Actions runs returned | Not verified |

## 3. Critical findings

### P0 — Custom audio is not actually uploaded

**Evidence:** `src/app/new-audio-analysis/page.tsx`, `handleCustomFileUpload` and `handleStartAnalysis`. The handler updates title/description based on the chosen file but does not upload the File. The analysis flow creates a case using preset scenario fields, a predetermined storage path, hard-coded size and hard-coded SHA-256, then invokes analysis.

**Impact:** UI may imply the user recording was analyzed when it can operate on a preset/fixture path.

**Fix:** Upload actual bytes to private storage; validate format/size/duration server-side; calculate SHA-256 from actual bytes; inspect metadata and verify object existence. Prevent analysis until upload succeeds. Keep synthetic cases behind an explicit demo choice.

### P0 — Live Monitor is simulated

**Evidence:** `src/components/LiveMonitorView.tsx` initializes recording as active, displays static transcript entries, increments a timer using `setInterval`, varies pitch using `Math.random`, and draws waveform bars from a sine function. No `getUserMedia`, `MediaRecorder`, live session or WebSocket streaming logic was found in that component/route.

**Impact:** Simulated content is presented as live capture.

**Fix:** Replace the simulation with a real, capability-tested live integration. Until then, label it “Demo simulation — no microphone connected” and never present its numbers as evidence. Keep live and recorded paths independent.

### P0 — Emotion values are derived from labels, not measured voice

**Evidence:** `src/app/api/cases/[id]/analyze/route.ts` selects `primaryEmotion` from trigger categories and `callerCategory`, then assigns fixed emotion values and acoustic metrics (pitch jitter, speech rate, tremor and energy). These values are persisted.

**Impact:** Numeric UI implies real acoustic inference, while the code derives values from categories and constants.

**Fix:** Remove these derived acoustic measurements and confidence-like percentages, or clearly label them as synthetic demo data. Keep transcript sentiment separate from acoustic cues. Enable vocal indicators only after an independent evaluation gate; allow abstention and require source intervals/caveats.

### P0 — Gemini failure can be hidden behind synthetic success

**Evidence:** The analyze route catches Gemini errors, runs `executeSyntheticRun(fixtureId)`, labels the result `synthetic-fallback-fixture`, and can still return `success: true`.

**Impact:** Users can confuse fixture output with analysis of their recording.

**Fix:** Make fallback an explicit demo choice or return a distinct failure/partial state. Persist provenance accurately. Never mark real-file analysis complete if a fixture was substituted.

### P0 — Data layer is local, not the planned production database

**Evidence:** `src/lib/data/store.ts` uses browser `localStorage` and `process.cwd()/data/db.json`. No Supabase client, migration, RLS policy or private-storage adapter was found in the source tree.

**Impact:** Browser/server data may diverge; local files are not reliable shared persistence on serverless hosting; the store has no ownership boundary.

**Fix:** Implement planned Supabase Auth, PostgreSQL, RLS and private Storage with migrations, user-scoped repositories and authorization tests. Never expose a service-role key in the browser.

### P0 — Authentication/authorization and actor identity are unproven

**Evidence:** Reviewed case, analyze, review, export and retention handlers call the store without a visible session/ownership check. Review API accepts `officerId` and `officerName` from request JSON with a hard-coded default; store code also uses hard-coded actor IDs.

**Impact:** Sensitive case data could be read, exported, changed or purged by ID without verified access control; audit attribution can be spoofed.

**Fix:** Authenticate protected requests, derive actor identity from a verified session, authorize every case/run/note/review/export/purge action and pass two-user negative tests before processing sensitive information.

### P0 — Retention can claim deletion without confirmation

**Evidence:** `store.purgeAudio` catches disk-delete errors but continues to set `purged = true`, clears the storage path and logs deletion. Retention route returns a purge message. No scheduled retention worker was found.

**Impact:** The application may report deletion even if the audio object remains.

**Fix:** Do not mark purged until storage confirms deletion/object absence. Keep failures visible, retry safely, audit outcomes, implement a scheduler and test actual storage state.

### P0 — Unsupported compliance/operational telemetry

**Evidence:** `src/app/api/telemetry/route.ts` returns fixed `status: 'OPERATIONAL'`, `cjisCompliant: true` and `isolatedDiskBacking: true` regardless of verified controls. Its model label may differ from adapter configuration.

**Impact:** The dashboard can overclaim compliance/security or report the wrong model.

**Fix:** Remove compliance/certification claims unless independently verified. Report measurable health checks only and use the same validated model configuration as the adapter.

### P1 — Upload UI ignores HTTP failure

**Evidence:** `handleStartAnalysis` awaits `fetch()` but does not inspect `response.ok` or parse the result before navigating to case details.

**Fix:** Model uploading/analyzing/completed/partial/failed states; inspect HTTP status/body; show recoverable errors and retry only idempotent operations.

### P1 — API boundary validation is inconsistent

**Evidence:** Case PATCH passes JSON into `store.updateCase`; review validates presence of fields but not valid enums, access or trusted actor; analyze accepts `useSynthetic` and `fixtureId`. Defining schemas is not enough unless routes enforce them.

**Fix:** Validate request bodies, enum values, lifecycle transitions, object ownership, source references, payload sizes and retry budgets at server boundaries. Return normalized errors without internal details.

### P1 — Synthetic content can look operational

**Evidence:** `INITIAL_CASES`, `PRESET_SCENARIOS` and LiveMonitorView seed identities, phone numbers, transcripts, emotion and urgency values. Synthetic fixtures are useful for offline testing but must be separate from real cases.

**Fix:** Display a persistent “Synthetic Demo Data” indicator on overview, case detail and export. Never silently mix synthetic results into real-case views.

### P1 — README/spec drift

**Evidence:** README still says “Planning documentation only” and lists candidate model names that differ from adapter defaults (`gemini-2.5-flash`). README specifies Supabase while code currently uses a local store.

**Fix:** Update README only after implementation facts are tested. Distinguish planned, implemented and verified capabilities; record dated provider/model verification.

## 4. Keep, refine, replace

### Keep/refine
- `Sidebar.tsx`, `Header.tsx`
- `AudioPlayer.tsx`, `SynchronizedTranscript.tsx`
- `EntityList.tsx`, `TriggerList.tsx`, `TimelineView.tsx`
- `CaseReviewBar.tsx`, `ReportModal.tsx`, export route
- `src/lib/ai/types.ts` and Zod schemas; strengthen semantic validation
- `src/lib/audio/preflight.ts`; add byte-signature and duration inspection and enforce it server-side
- `src/lib/ai/synthetic-fixtures.ts` for offline tests and explicit demo mode
- Screen HTML/PNG under `screens/` as visual references

### Replace/materially rework
- `src/components/LiveMonitorView.tsx`: replace simulated feed
- `src/lib/data/store.ts`: replace as production persistence
- `src/app/new-audio-analysis/page.tsx`: actual File upload and verified metadata
- `src/app/api/cases/[id]/analyze/route.ts`: correct provenance, remove fabricated acoustic metrics, stop synthetic-success concealment
- Review/API routes: trusted identity and authorization
- Retention helper/route: confirmed deletion and scheduled expiry
- `/api/telemetry`: remove hard-coded compliance/operational assertions
- README/env docs: reflect verified truth

## 5. Remove or disable now

1. Fake live transcript, simulated waveform presented as real audio, random pitch changes.
2. Fixed emotion percentages/acoustic measurements derived from caller or trigger labels.
3. Fake hash and preset file size/duration/path treated as actual uploaded metadata.
4. Hard-coded OPERATIONAL/CJIS/secure-enclave claims without evidence.
5. Automatic Gemini failure fallback that returns a successful-looking synthetic result.
6. “Prioritize for immediate dispatch” and dispatch-style recommendations; this product is not dispatch software.
7. Hard-coded officer identity as substitute for authenticated identity.
8. “Permanently purged” success when deletion is unconfirmed.

Keep the useful case workspace, player/transcript, entity/trigger/timeline views, review/export foundation, schemas, preflight helper and synthetic fixtures. Do not restart from scratch unnecessarily.

## 6. Implementation order

### Phase 1 — Truthful demo and safety corrections (P0)
- Clearly label synthetic demo mode and provenance throughout UI/export.
- Disable simulated Live Monitor or label it as preview only.
- Remove fixed emotion scores and unsupported acoustic claims.
- Remove hard-coded compliance/operational assertions.
- Correct response/error handling and API validation.

### Phase 2 — Recorded audio end-to-end (P0)
- Actual upload to private storage and server-side format/size/duration validation.
- SHA-256 from actual bytes and object verification.
- Verify current official Gemini SDK/API; smoke-test a permitted synthetic clip.
- Normalize timestamps/language/uncertainty; anchor entities/triggers to source segments.
- Persist analysis runs/results with provider/model/prompt/schema provenance.
- Allow playback seeking to timestamps.
- Provider failure must create visible failed/partial state, not a fixture.

### Phase 3 — Trusted auth, persistence and access (P0)
- Supabase Auth, PostgreSQL, RLS and private Storage.
- Actor derived from verified session; authorize all case/run/review/export/purge routes.
- Two-user cross-case denial tests; service-role secret checks.

### Phase 4 — Review and reporting (P0/P1)
- Preserve original/corrected transcript separately with reviewer/time/reason.
- Bind report to selected analysis run and export only stored results.
- Distinguish AI suggestions, unverified claims and officer-verified findings.
- Reconcile CSV and test formula injection defenses.

### Phase 5 — Retention and operations (P0)
- Scheduled expiry and orphan cleanup.
- Confirm deletion before success; surface/retry failures.
- Add rate/cost limits, safe logs and normalized provider errors.

### Phase 6 — Live transcription (P0 if enabled)
- Verify current official Gemini Live API model, endpoint, handshake, authentication, media framing and events.
- Implement microphone permission, session lifecycle, interim/final deduplication, stop/cancel, reconnect and timeout states.
- Run a real mic/provider smoke test. If it does not pass, show Live Monitor as unavailable, not simulated.

### Phase 7 — Verification/release
- Run `npm test`, `npm run build`, and available lint/type checks.
- Run provider smoke test on synthetic/authorized audio.
- Browser E2E: upload → analyze → review → export.
- Cross-user denial, storage policy and deletion-failure tests.
- Verify environment/deployment and update README/traceability with evidence.

## 7. Tests and evidence

Five test files exist: `api-routes.test.ts`, `audio-preflight.test.ts`, `case-store.test.ts`, `export.test.ts`, and `gemini-adapter.test.ts`. They cover synthetic fixtures, some API behavior, local store, preflight and CSV escaping. Their existence does not prove they pass. No GitHub Actions runs were returned by the repository Actions endpoint. Run the suite in a configured environment and record exact outcomes.

## 8. Gemini/model verification

The adapter defaults to `gemini-2.5-flash`; README lists other candidates. Do not assume any model ID/endpoint is still available. Verify official docs and the actual request/response using a small permitted test clip, then record date, endpoint, schema, quota/cost and smoke-test result.

- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/transcribe
- https://ai.google.dev/gemini-api/docs/audio
- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe

Audio understanding does not prove reliable forensic speech-emotion recognition. Evaluate vocal indicators separately, allow abstention and keep them advisory.

## 9. Overall risk

**Current classification: Prototype with substantial simulation and architecture gaps.** Do not use real sensitive call audio or claim production readiness. Prioritize truthful demo provenance and a real recorded-audio path; next add auth/persistence/retention; only then invest in live streaming and optional vocal indicators.

## Appendix: key files

- README: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/README.md
- Product requirements: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/docs/01-product-requirements.md
- Architecture: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/docs/02-architecture-tech-stack.md
- Security/retention: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/docs/06-security-privacy-retention.md
- Test plan: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/docs/07-testing-acceptance.md
- Workstreams: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/docs/08-delivery-workstreams.md
- Demo plan: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/docs/10-demo-evaluation.md
- Analysis route: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/src/app/api/cases/%5Bid%5D/analyze/route.ts
- Upload page: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/src/app/new-audio-analysis/page.tsx
- Live monitor: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/src/components/LiveMonitorView.tsx
- Data store: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/src/lib/data/store.ts
- Telemetry: https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh/blob/main/src/app/api/telemetry/route.ts
