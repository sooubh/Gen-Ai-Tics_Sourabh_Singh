# VECNAVERSE — Voice-to-Investigation AI

> **Status:** **Fully Implemented & Verified Application.** All 11 test suites (113/113 automated tests) pass cleanly. Production build (`npm run build`) compiles with zero TypeScript errors.

## Purpose

VECNAVERSE is an AI-assisted speech emotion recognition (SER) and cybercrime call triage workspace for law enforcement and cybercrime helpline officers. It analyzes incoming and recorded distress calls, extracting critical fraud entities (bank accounts, UPI handles, transaction IDs, impersonation tactics), assessing distress/urgency indicators, and structuring evidence into tamper-evident case dockets.

> [!IMPORTANT]
> **Responsible AI Boundary:** VECNAVERSE is an investigative assistance tool, NOT a lie detector, emergency 911 dispatch automation, forensic acoustic laboratory, or guilt/intent inference engine. Vocal indicators are advisory signals only. Final investigative decisions always remain with authorized human officers.

---

## Verified Capabilities & Implementation Truth

In compliance with the comprehensive engineering audit ([`docs/12-repository-audit-report.md`](docs/12-repository-audit-report.md)), all misleading prototype artifacts and simulations have been remediated:

1. **Genuine Audio Upload & Private Storage:**
   - Real multipart audio ingestion via `/api/upload` (supporting `.wav`, `.mp3`, `.m4a`, `.flac`, `.ogg`, `.webm`, `.aac`).
   - Magic bytes / audio header inspection and 100MB file size ceiling.
   - Real cryptographic SHA-256 calculation from actual file bytes using Node `crypto`.
   - Private storage isolated outside public web root (`uploads/audio/`) with strict path traversal defenses.
2. **AI Analysis & Evidentiary Integrity:**
   - Real Gemini audio processing using `@google/genai` (defaulting to validated `gemini-2.5-flash`).
   - **Zero Fabricated Metrics:** Pseudo-scientific pitch jitter, vocal tremor, and energy spikes derived from trigger labels have been completely removed. LLM vocal indicators carry mandatory forensic DSP disclaimers.
   - **Zero Failure Concealment:** Gemini API failures (missing key, quota limits, upstream errors) are never masked behind synthetic fixture successes. Provider errors are truthfully recorded with status `FAILED`.
   - **Transparent Demo Mode:** Offline synthetic fixtures are explicitly isolated behind clear provenance flags (`isSyntheticDemo: true`, `analysisProvider: 'synthetic-fixture'`) with persistent UI badges.
3. **Authentication, Authorization & PostgreSQL / RLS Architecture:**
   - Server-side session verification via `getServerSession` (Bearer JWT and session cookies).
   - Discards untrusted client-submitted attribution (`officerId`, `officerName`) in favor of verified session identity.
   - Production PostgreSQL schema with Row Level Security (RLS) in `supabase/migrations/20261024_init.sql`.
   - Multi-tenant case isolation preventing cross-officer case manipulation.
   - Immutable audit logs with database-level tamper prevention triggers.
4. **Verified Retention & Chain of Custody:**
   - Confirmed filesystem unlinking before cases are marked `purged = true`. Unconfirmed deletions return HTTP 500 and keep records unpurged.
5. **Truthful Telemetry & Live Monitor Preview:**
   - Deceptive CJIS compliance assertions removed from `/api/telemetry`; returns live storage write probes, system memory telemetry, and formal audit disclaimers.
   - Live Monitor displays persistent `SIMULATION PREVIEW` disclaimer banners indicating that microphone streaming is in demonstration preview.

---

## Quick Start

### Prerequisites
- Node.js >= 20.x
- Google Gemini API Key (optional for synthetic demo mode; required for real audio processing)

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/sooubh/Gen-Ai-Tics_Sourabh_Singh.git
cd Gen-Ai-Tics_Sourabh_Singh

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Set GEMINI_API_KEY=your_key_here
```

### Run Automated Test Suite
```bash
npm test
# Runs 113 tests across 11 test suites covering uploads, auth, AI integrity, store, and export
```

### Production Build
```bash
npm run build
npm start
```

### Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## Documentation Index

| File | Scope |
|---|---|
| [12 — Repository Audit Report](docs/12-repository-audit-report.md) | Comprehensive engineering audit, gap analysis, and repair checklist |
| [01 — Product requirements](docs/01-product-requirements.md) | Problem, users, scope, workflows, functional/non-functional requirements, acceptance criteria |
| [02 — Architecture and technology](docs/02-architecture-tech-stack.md) | System boundaries, chosen stack, components, integration options, architectural decisions |
| [03 — Dashboard and UX](docs/03-dashboard-ux.md) | Navigation, screen specifications, states, interaction contracts, accessibility and visual system |
| [04 — AI and audio pipelines](docs/04-ai-audio-pipelines.md) | Recorded/live pipelines, transcription, emotion indicators, event extraction, schemas and fallback logic |
| [05 — Data model and API contracts](docs/05-data-model-api-contracts.md) | Entities, relations, endpoint contracts, validation, idempotency and error envelopes |
| [06 — Security privacy and retention](docs/06-security-privacy-retention.md) | Threat model, access control, secret management, retention, auditability and incident response |
| [07 — Testing and acceptance](docs/07-testing-acceptance.md) | Strategy, test matrix, quality gates, edge cases, demo reliability and evidence |
| [08 — Delivery workstreams and dependencies](docs/08-delivery-workstreams.md) | Implementation sequence, dependency graph, task boundaries, solo-developer operating rules |
| [09 — Deployment and operations](docs/09-deployment-operations.md) | Environments, configuration, observability, quotas, failure handling and release gates |
| [10 — Demo and evaluation plan](docs/10-demo-evaluation.md) | Demo narrative, synthetic cases, test protocol, judging evidence and limitations |
| [11 — Traceability and decision log](docs/11-traceability-decision-log.md) | Requirement-to-test traceability, ADRs, assumptions, open decisions and change control |

---

## Non-negotiable System Principles

1. **Evidence-linked output:** Every material finding references a transcript segment and timestamp; audio playback seeks to the corresponding position when audio remains available.
2. **No unsupported claims:** An extracted statement remains an attributed claim unless verified independently. A model score is not a fact.
3. **Emotion is not intent:** Vocal patterns may be reported as uncertain indicators only. They are never proof of honesty, guilt, deception, danger, or criminal intent.
4. **No inference from silence:** A calm voice, missing emotion output, or model abstention does not demonstrate safety.
5. **Human authority:** No automatic dispatch, accusation, case closure, or high-impact decision from a model output.
6. **Privacy by default:** Private buckets, least-privilege access, short-lived access, limited logs, and an enforceable audio-expiration path.
7. **Recoverability:** API, network, microphone, storage, or model failure must create an honest recoverable state rather than simulated success.
8. **Model outputs are untrusted input:** Validate structure, enum values, sizes, timestamps and references before persisting or rendering them.
9. **Recorded and live flows remain independently testable:** A failure in live streaming must not destroy the recorded workflow.
10. **No fake demo data in operational views:** Clearly labelled synthetic demo mode is provided; real case views reflect stored records and actual processing.
