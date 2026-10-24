# 06 — Security, Privacy and Retention Plan

## Security principles

Audio is sensitive data. Use private storage, scoped authorization, minimal logs, finite resource budgets, explicit retention and human review. No dispatch, voice identity, guilt/deception inference or broad external enrichment is in scope.


## Expanded security abuse-test catalogue

Each scenario is tested at both design-review and runtime-test levels. Mark each result independently; documentation alone is not evidence.

### SEC-X-SEC01-DESIGN — Leaked model key
- **Scenario/control:** Rotate key, scan build/logs
- **Required invariant:** No secret client/log
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC01-TEST — Leaked model key
- **Scenario/control:** Rotate key, scan build/logs
- **Required invariant:** No secret client/log
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC02-DESIGN — Leaked service role
- **Scenario/control:** Rotate credential, inspect privilege exposure
- **Required invariant:** Service role never browser-exposed
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC02-TEST — Leaked service role
- **Scenario/control:** Rotate credential, inspect privilege exposure
- **Required invariant:** Service role never browser-exposed
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC03-DESIGN — Cross-user case access
- **Scenario/control:** Test other user's known resource ID
- **Required invariant:** No data leak/mutation
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC03-TEST — Cross-user case access
- **Scenario/control:** Test other user's known resource ID
- **Required invariant:** No data leak/mutation
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC04-DESIGN — Public audio bucket
- **Scenario/control:** Anonymous download attempt
- **Required invariant:** No object bytes returned
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC04-TEST — Public audio bucket
- **Scenario/control:** Anonymous download attempt
- **Required invariant:** No object bytes returned
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC05-DESIGN — Arbitrary storage path
- **Scenario/control:** Client requests foreign object key
- **Required invariant:** Reject out-of-scope path
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC05-TEST — Arbitrary storage path
- **Scenario/control:** Client requests foreign object key
- **Required invariant:** Reject out-of-scope path
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC06-DESIGN — Oversized audio
- **Scenario/control:** Direct API request over limit
- **Required invariant:** Reject before AI call
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC06-TEST — Oversized audio
- **Scenario/control:** Direct API request over limit
- **Required invariant:** Reject before AI call
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC07-DESIGN — MIME spoof
- **Scenario/control:** Mislabel invalid content
- **Required invariant:** Media inspection rejects
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC07-TEST — MIME spoof
- **Scenario/control:** Mislabel invalid content
- **Required invariant:** Media inspection rejects
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC08-DESIGN — Prompt injection in speech
- **Scenario/control:** Fixture requests secret/rule override
- **Required invariant:** Treated only as source content
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC08-TEST — Prompt injection in speech
- **Scenario/control:** Fixture requests secret/rule override
- **Required invariant:** Treated only as source content
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC09-DESIGN — Hallucinated place
- **Scenario/control:** Model invents unsupported location
- **Required invariant:** Reject/unverified without source
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC09-TEST — Hallucinated place
- **Scenario/control:** Model invents unsupported location
- **Required invariant:** Reject/unverified without source
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC10-DESIGN — Emotion overclaim
- **Scenario/control:** Result says guilt/deception
- **Required invariant:** Suppress/reject; cue feature gate fails
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC10-TEST — Emotion overclaim
- **Scenario/control:** Result says guilt/deception
- **Required invariant:** Suppress/reject; cue feature gate fails
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC11-DESIGN — Automatic dispatch path
- **Scenario/control:** Search routes/dependencies for call/SMS/webhook
- **Required invariant:** None exists in scope
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC11-TEST — Automatic dispatch path
- **Scenario/control:** Search routes/dependencies for call/SMS/webhook
- **Required invariant:** None exists in scope
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC12-DESIGN — Cross-run evidence
- **Scenario/control:** Attach finding to foreign segment
- **Required invariant:** Persistence rejected
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC12-TEST — Cross-run evidence
- **Scenario/control:** Attach finding to foreign segment
- **Required invariant:** Persistence rejected
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC13-DESIGN — IDOR export
- **Scenario/control:** Other user requests report ID
- **Required invariant:** Denied with safe response
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC13-TEST — IDOR export
- **Scenario/control:** Other user requests report ID
- **Required invariant:** Denied with safe response
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC14-DESIGN — IDOR delete
- **Scenario/control:** Unauthorized deletion attempt
- **Required invariant:** Denied; object remains
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC14-TEST — IDOR delete
- **Scenario/control:** Unauthorized deletion attempt
- **Required invariant:** Denied; object remains
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC15-DESIGN — RLS missing
- **Scenario/control:** Fresh migration table policy scan
- **Required invariant:** Private access policy mandatory
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC15-TEST — RLS missing
- **Scenario/control:** Fresh migration table policy scan
- **Required invariant:** Private access policy mandatory
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC16-DESIGN — Stored XSS
- **Scenario/control:** Transcript includes markup payload
- **Required invariant:** Rendered as text
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC16-TEST — Stored XSS
- **Scenario/control:** Transcript includes markup payload
- **Required invariant:** Rendered as text
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC17-DESIGN — CSV formula injection
- **Scenario/control:** Cell begins formula marker
- **Required invariant:** Escaped inert cell
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC17-TEST — CSV formula injection
- **Scenario/control:** Cell begins formula marker
- **Required invariant:** Escaped inert cell
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC18-DESIGN — Log transcript leak
- **Scenario/control:** Use unique synthetic canary phrase
- **Required invariant:** Canary absent from logs
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC18-TEST — Log transcript leak
- **Scenario/control:** Use unique synthetic canary phrase
- **Required invariant:** Canary absent from logs
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC19-DESIGN — Analytics evidence leak
- **Scenario/control:** Inspect event payload/network
- **Required invariant:** No transcript/phone/address
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC19-TEST — Analytics evidence leak
- **Scenario/control:** Inspect event payload/network
- **Required invariant:** No transcript/phone/address
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC20-DESIGN — Raw error leak
- **Scenario/control:** Inject provider stack/secret in fault
- **Required invariant:** Safe code only
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC20-TEST — Raw error leak
- **Scenario/control:** Inject provider stack/secret in fault
- **Required invariant:** Safe code only
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC21-DESIGN — Signed URL leak
- **Scenario/control:** Check app logs/exports/referrer
- **Required invariant:** URL absent outside required response
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC21-TEST — Signed URL leak
- **Scenario/control:** Check app logs/exports/referrer
- **Required invariant:** URL absent outside required response
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC22-DESIGN — Replay attack
- **Scenario/control:** Replay same mutation
- **Required invariant:** Idempotent/conflict behavior
- **Priority:** P1
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC22-TEST — Replay attack
- **Scenario/control:** Replay same mutation
- **Required invariant:** Idempotent/conflict behavior
- **Priority:** P1
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC23-DESIGN — Retry storm
- **Scenario/control:** Simulate repeated transient provider failures
- **Required invariant:** Bound retry count
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC23-TEST — Retry storm
- **Scenario/control:** Simulate repeated transient provider failures
- **Required invariant:** Bound retry count
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC24-DESIGN — Quota exhaustion
- **Scenario/control:** Burst beyond user limit
- **Required invariant:** Server limiter rejects
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC24-TEST — Quota exhaustion
- **Scenario/control:** Burst beyond user limit
- **Required invariant:** Server limiter rejects
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC25-DESIGN — Unbounded response
- **Scenario/control:** Oversize model arrays/text
- **Required invariant:** Bounded parse failure
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC25-TEST — Unbounded response
- **Scenario/control:** Oversize model arrays/text
- **Required invariant:** Bounded parse failure
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC26-DESIGN — Retention drift
- **Scenario/control:** Expire an object in test bucket
- **Required invariant:** Object really deleted or failure shown
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC26-TEST — Retention drift
- **Scenario/control:** Expire an object in test bucket
- **Required invariant:** Object really deleted or failure shown
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC27-DESIGN — Row-only deletion
- **Scenario/control:** Delete DB row but leave object in test
- **Required invariant:** Test detects orphan
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC27-TEST — Row-only deletion
- **Scenario/control:** Delete DB row but leave object in test
- **Required invariant:** Test detects orphan
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC28-DESIGN — Provider remote file
- **Scenario/control:** Use file-upload path where applicable
- **Required invariant:** Lifecycle/expiry documented separately
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC28-TEST — Provider remote file
- **Scenario/control:** Use file-upload path where applicable
- **Required invariant:** Lifecycle/expiry documented separately
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC29-DESIGN — Orphan upload
- **Scenario/control:** Abort transfer
- **Required invariant:** Grace-period cleanup works
- **Priority:** P1
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC29-TEST — Orphan upload
- **Scenario/control:** Abort transfer
- **Required invariant:** Grace-period cleanup works
- **Priority:** P1
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC30-DESIGN — CSRF/origin abuse
- **Scenario/control:** Cross-origin mutation attempt suited to auth
- **Required invariant:** Rejected/mitigated
- **Priority:** P1
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC30-TEST — CSRF/origin abuse
- **Scenario/control:** Cross-origin mutation attempt suited to auth
- **Required invariant:** Rejected/mitigated
- **Priority:** P1
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC31-DESIGN — Overbroad CORS
- **Scenario/control:** Untrusted origin attempt
- **Required invariant:** Not allowed
- **Priority:** P1
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC31-TEST — Overbroad CORS
- **Scenario/control:** Untrusted origin attempt
- **Required invariant:** Not allowed
- **Priority:** P1
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC32-DESIGN — Weak token scope
- **Scenario/control:** Reuse token for another path
- **Required invariant:** Access denied
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC32-TEST — Weak token scope
- **Scenario/control:** Reuse token for another path
- **Required invariant:** Access denied
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC33-DESIGN — Open redirect
- **Scenario/control:** Attacker return URL
- **Required invariant:** Invalid URL rejected
- **Priority:** P1
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC33-TEST — Open redirect
- **Scenario/control:** Attacker return URL
- **Required invariant:** Invalid URL rejected
- **Priority:** P1
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC34-DESIGN — Dependency script risk
- **Scenario/control:** Review install scripts/dependency tree
- **Required invariant:** Unneeded deps removed
- **Priority:** P1
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC34-TEST — Dependency script risk
- **Scenario/control:** Review install scripts/dependency tree
- **Required invariant:** Unneeded deps removed
- **Priority:** P1
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC35-DESIGN — Build secret in log
- **Scenario/control:** Inspect workflow logs after preflight
- **Required invariant:** Secret never echoed
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC35-TEST — Build secret in log
- **Scenario/control:** Inspect workflow logs after preflight
- **Required invariant:** Secret never echoed
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC36-DESIGN — Environment mix-up
- **Scenario/control:** Attempt demo config with production identifiers
- **Required invariant:** Preflight fails/isolates environment
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC36-TEST — Environment mix-up
- **Scenario/control:** Attempt demo config with production identifiers
- **Required invariant:** Preflight fails/isolates environment
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC37-DESIGN — Overprivileged operator
- **Scenario/control:** Normal account changes capability flags
- **Required invariant:** Denied
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC37-TEST — Overprivileged operator
- **Scenario/control:** Normal account changes capability flags
- **Required invariant:** Denied
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC38-DESIGN — Review history tamper
- **Scenario/control:** Attempt destructive audit edit
- **Required invariant:** Denied/history preserved
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC38-TEST — Review history tamper
- **Scenario/control:** Attempt destructive audit edit
- **Required invariant:** Denied/history preserved
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC39-DESIGN — Client timestamp forgery
- **Scenario/control:** Submit manipulated review time
- **Required invariant:** Server time used
- **Priority:** P1
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC39-TEST — Client timestamp forgery
- **Scenario/control:** Submit manipulated review time
- **Required invariant:** Server time used
- **Priority:** P1
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

### SEC-X-SEC40-DESIGN — Real-call demo leak
- **Scenario/control:** Audit fixture/screenshots/repo artifacts
- **Required invariant:** Synthetic/authorized sources only
- **Priority:** P0
- **Level:** Review code/data flow and identify the control
- **Evidence:** Threat/control owner record
- **Status:** Pending until executed

### SEC-X-SEC40-TEST — Real-call demo leak
- **Scenario/control:** Audit fixture/screenshots/repo artifacts
- **Required invariant:** Synthetic/authorized sources only
- **Priority:** P0
- **Level:** Execute a negative test in a non-production environment
- **Evidence:** Safe test ID, outcome and build reference
- **Status:** Pending until executed

## Security review sign-off

| Area | Reviewer evidence | Decision |
|---|---|---|
| Authentication/authorization | Route inventory + cross-user test output | Pending |
| Storage/RLS | Private bucket config + RLS negative tests | Pending |
| Secrets | Build scan and workflow log check | Pending |
| Provider/audio | Current data handling and remote-file lifecycle review | Pending |
| Retention | Actual object deletion check, including failure injection | Pending |
| Export | Formula injection and report authorization tests | Pending |
| Abuse/cost | Direct API rate-limit tests | Pending |
| Sensitive logging | Log scan with synthetic canary | Pending |
| Demo fixture authorization | Fixture register | Pending |

No row is automatically passed by being listed here.
