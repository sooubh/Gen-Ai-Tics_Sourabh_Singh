# Voice-to-Investigation AI — Planning Repository

> **Status:** Planning documentation only. No application implementation is included in this documentation pack.

## Purpose

This repository holds the product, architecture, UX, AI/audio, data, privacy/security, validation, delivery, and demonstration specifications for a hackathon prototype that helps authorized officers review recorded or live audio. It is an investigation-assistance workspace, not an emergency dispatch service, forensic certification system, lie detector, or automated decision-maker.

## Locked product direction

- **Product concept:** Voice-to-Investigation AI.
- **Primary user:** an authorized investigation/call-review officer.
- **Audio modes:** recorded audio is the first validated workflow; live microphone transcription is also in scope, with independent failure and recovery paths.
- **AI provider candidate:** Google Gemini API. Exact model/endpoint behavior must be checked against official documentation and a real feasibility test before implementation.
- **Recorded transcription candidate:** `gemini-3.5-transcribe`.
- **Live transcription candidate:** `gemini-3.5-transcribe-live`.
- **Audio analysis candidate:** `gemini-3.8-flash`, subject to documented feature checks, measured testing, and the right to abstain.
- **Web stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, and Lucide icons.
- **Case data and private temporary audio:** Supabase PostgreSQL, Auth, RLS, and private Storage.
- **Deployment candidate:** Vercel for the web application and lightweight APIs; direct-to-private-storage upload is preferred for sizeable audio rather than proxying large bodies through a function.
- **Audio retention:** temporary and policy-controlled; no indefinite audio retention by default.
- **Decision authority:** human officer reviews and corrects findings.
- **Planning boundary:** this repository's initial scope is documentation. Do not create product code, mutate other projects, create cloud resources, configure production secrets, or process real sensitive call recordings without explicit authorization.

## Documentation index

| File | Scope |
|---|---|
| [01 — Product requirements](docs/01-product-requirements.md) | Problem, users, scope, workflows, functional/non-functional requirements, acceptance criteria |
| [02 — Architecture and technology](docs/02-architecture-tech-stack.md) | system boundaries, chosen stack, components, integration options, architectural decisions |
| [03 — Dashboard and UX](docs/03-dashboard-ux.md) | navigation, screen specifications, states, interaction contracts, accessibility and visual system |
| [04 — AI and audio pipelines](docs/04-ai-audio-pipelines.md) | recorded/live pipelines, transcription, emotion indicators, event extraction, schemas and fallback logic |
| [05 — Data model and API contracts](docs/05-data-model-api-contracts.md) | entities, relations, endpoint contracts, validation, idempotency and error envelopes |
| [06 — Security privacy and retention](docs/06-security-privacy-retention.md) | threat model, access control, secret management, retention, auditability and incident response |
| [07 — Testing and acceptance](docs/07-testing-acceptance.md) | strategy, test matrix, quality gates, edge cases, demo reliability and evidence |
| [08 — Delivery workstreams and dependencies](docs/08-delivery-workstreams.md) | implementation sequence, dependency graph, task boundaries, solo-developer operating rules |
| [09 — Deployment and operations](docs/09-deployment-operations.md) | environments, configuration, observability, quotas, failure handling and release gates |
| [10 — Demo and evaluation plan](docs/10-demo-evaluation.md) | demo narrative, synthetic cases, test protocol, judging evidence and limitations |
| [11 — Traceability and decision log](docs/11-traceability-decision-log.md) | requirement-to-test traceability, ADRs, assumptions, open decisions and change control |

## Non-negotiable system principles

1. **Evidence-linked output:** every material finding should reference a transcript segment and timestamp; audio playback should seek to the corresponding position when audio remains available.
2. **No unsupported claims:** an extracted statement remains an attributed claim unless verified independently. A model score is not a fact.
3. **Emotion is not intent:** vocal patterns may be reported as uncertain indicators only. They are never proof of honesty, guilt, deception, danger, or criminal intent.
4. **No inference from silence:** a calm voice, missing emotion output, or model abstention does not demonstrate safety.
5. **Human authority:** no automatic dispatch, accusation, case closure, or high-impact decision from a model output.
6. **Privacy by default:** private buckets, least-privilege access, short-lived access, limited logs, and an enforceable audio-expiration path.
7. **Recoverability:** API, network, microphone, storage, or model failure must create an honest recoverable state rather than simulated success.
8. **Model outputs are untrusted input:** validate structure, enum values, sizes, timestamps and references before persisting or rendering them.
9. **Recorded and live flows remain independently testable:** a failure in live streaming must not destroy the recorded workflow.
10. **No fake demo data in operational views:** clearly labelled synthetic demo mode is allowed; real case views must reflect stored records and actual processing.

## Official references checked during planning

- Gemini model catalogue: https://ai.google.dev/gemini-api/docs/models
- Gemini recorded transcription: https://ai.google.dev/gemini-api/docs/transcribe
- Gemini audio understanding: https://ai.google.dev/gemini-api/docs/audio
- Gemini live transcription: https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Supabase Storage buckets: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase private downloads: https://supabase.com/docs/guides/storage/serving/downloads
- Vercel function payload limit: https://vercel.com/docs/errors/function_payload_too_large

Official docs can change. Before implementing, verify current model availability, API shapes, quotas, pricing, retention behavior, and regional availability; record the verification date and test result in the relevant document.

## Planning status

- [x] Repository metadata inspected.
- [x] Confirmed repository is empty before the documentation bootstrap.
- [x] Product direction and planning-only boundary documented.
- [ ] Feasibility tests performed (not yet; requires actual authorized/synthetic audio and API access).
- [ ] Application implementation started (intentionally not part of this documentation-only action).

## Documentation Inventory (verified)

Inventory is refreshed from the files accessible in the repository. Blank lines and Markdown markup are counted.

| File | Lines | Characters |
|---|---:|---:|
| [01-product-requirements.md](docs/01-product-requirements.md) | 1398 | 65534 |
| [02-architecture-tech-stack.md](docs/02-architecture-tech-stack.md) | 1505 | 69847 |
| [03-dashboard-ux.md](docs/03-dashboard-ux.md) | 910 | 32159 |
| [04-ai-audio-pipelines.md](docs/04-ai-audio-pipelines.md) | 109 | 3237 |
| [05-data-model-api-contracts.md](docs/05-data-model-api-contracts.md) | 755 | 25552 |
| [06-security-privacy-retention.md](docs/06-security-privacy-retention.md) | 667 | 27082 |
| [07-testing-acceptance.md](docs/07-testing-acceptance.md) | 2551 | 111790 |
| [08-delivery-workstreams.md](docs/08-delivery-workstreams.md) | 1102 | 42675 |
| [09-deployment-operations.md](docs/09-deployment-operations.md) | 336 | 14977 |
| [10-demo-evaluation.md](docs/10-demo-evaluation.md) | 1148 | 50017 |
| [11-traceability-decision-log.md](docs/11-traceability-decision-log.md) | 134 | 3266 |

**Planning document subtotal (11 files): 10615 lines**

**Total Markdown line count including README: 10712 lines**

Counts describe documentation size only. They do not mean product behavior is implemented or a test has passed.
