# 03 — Dashboard and UX Specification

Design principle: dark-navy, evidence-centred, readable and restrained. UI should look professional without pretending that unsupported analysis or real-time events exist.

## Navigation

- Overview: saved-case counts and real recent activity.
- Analyze Audio: separate recorded and live entry points.
- Cases: authorized paginated list, detail, review, notes and report.
- Account/privacy controls are secondary; reports are contextual to cases.

## Screen specifications
### UX-SCR-01 — Overview
- **Purpose:** Saved case counts, recent authorized cases, New Analysis and Start Live actions
- **Interaction:** Counts come from persisted records, not placeholder metrics
- **Acceptance:** Empty, loading and error states are distinct

### UX-SCR-02 — Analyze entry
- **Purpose:** Explicit recorded/live mode choice and visible media limits
- **Interaction:** No model call or mic permission prompt before an explicit action
- **Acceptance:** Invalid media rejected before provider usage

### UX-SCR-03 — Recorded workspace
- **Purpose:** Player, transcript, findings, entities, timeline and review controls
- **Interaction:** Evidence stays adjacent to each finding
- **Acceptance:** Selecting source seeks accurately or explains unavailability

### UX-SCR-04 — Live workspace
- **Purpose:** Permission gate, actual socket state, interim/final transcript and Stop
- **Interaction:** No simulated connection or timer-based text
- **Acceptance:** Disconnect yields recovery or truthful partial state

### UX-SCR-05 — Cases list
- **Purpose:** Authorized paginated cases with mode, status and update time
- **Interaction:** Filtering is server-side
- **Acceptance:** Cross-user record isn't listed or queryable

### UX-SCR-06 — Case detail
- **Purpose:** Metadata, recordings, runs, findings, notes and review history
- **Interaction:** Reports pin to a selected analysis run
- **Acceptance:** Reload shows persisted data

### UX-SCR-07 — Evidence drawer
- **Purpose:** Supporting phrase, context, time and media availability
- **Interaction:** Reported/unverified state remains clear
- **Acceptance:** Every material finding opens source or states why unavailable

### UX-SCR-08 — Correction screen
- **Purpose:** Original model transcript beside reviewed text
- **Interaction:** Edits do not erase source/model provenance
- **Acceptance:** Reviewer and correction time survive reload

### UX-SCR-09 — Report preview
- **Purpose:** Neutral summary, timeline, evidence, reviewed findings and limitations
- **Interaction:** Partial stages and uncertain claims remain labelled
- **Acceptance:** Export reconciles to saved run

### UX-SCR-10 — Account/privacy
- **Purpose:** Session state, sign out and retention notice
- **Interaction:** No secret or sensitive debug console
- **Acceptance:** Protected client state clears on logout

## Component specifications
### UX-CMP-01 — App shell
- **Behavior:** Primary navigation and route loading/error boundaries
- **Guardrail:** No authoritative case state in local component memory only
- **Verification:** Refresh/direct route tests

### UX-CMP-02 — Primary navigation
- **Behavior:** Overview, Analyze Audio, Cases
- **Guardrail:** Reports remain inside case context
- **Verification:** Keyboard navigation works

### UX-CMP-03 — Page heading
- **Behavior:** One clear task heading and concise context
- **Guardrail:** Avoid duplicate decorative title blocks
- **Verification:** Semantic heading tree is valid

### UX-CMP-04 — Status badge
- **Behavior:** Pending, processing, partial, complete, failed, expired
- **Guardrail:** Text label in addition to color
- **Verification:** Screen reader can identify status

### UX-CMP-05 — Case list
- **Behavior:** Server-side paginated authorized records
- **Guardrail:** Do not fetch all content for local filtering
- **Verification:** Paging plus cross-user tests

### UX-CMP-06 — Case row
- **Behavior:** Case ID, concise title, mode, updated time and state
- **Guardrail:** No unverified severity rank
- **Verification:** Keyboard opens correct case

### UX-CMP-07 — Search field
- **Behavior:** Search current authorized scope
- **Guardrail:** No global sensitive transcript search by default
- **Verification:** Query bound and no-match state tested

### UX-CMP-08 — Status filter
- **Behavior:** Allowed state enum options only
- **Guardrail:** Unknown values rejected at API
- **Verification:** Invalid filter returns safe error

### UX-CMP-09 — Date filter
- **Behavior:** Bounded date/time interval
- **Guardrail:** UTC storage and local display rules documented
- **Verification:** Timezone boundary tests pass

### UX-CMP-10 — Pagination
- **Behavior:** Bounded page size and stable sort key
- **Guardrail:** No unlimited page parameter
- **Verification:** Boundary queries tested

### UX-CMP-11 — Upload dropzone
- **Behavior:** Pick or drop supported audio
- **Guardrail:** Client-side validation isn't authority
- **Verification:** Server rejects invalid content

### UX-CMP-12 — File policy text
- **Behavior:** Accepted types, configured size/duration limits and retention
- **Guardrail:** Copy matches server config
- **Verification:** Policy/config parity review

### UX-CMP-13 — Upload progress
- **Behavior:** Real transfer progress or indeterminate state
- **Guardrail:** Never use a timer to fake percentage
- **Verification:** Network failure test

### UX-CMP-14 — Cancel upload
- **Behavior:** Actually stop transfer and schedule cleanup
- **Guardrail:** Not just hide the progress widget
- **Verification:** Partial object cleanup tested

### UX-CMP-15 — File metadata card
- **Behavior:** Verified type, bytes, duration and lifecycle status
- **Guardrail:** Avoid unnecessary original filename retention
- **Verification:** Displayed values match object

### UX-CMP-16 — Audio player
- **Behavior:** Play, pause, seek and source time
- **Guardrail:** Disabled when expired or inaccessible
- **Verification:** Keyboard player test

### UX-CMP-17 — Waveform
- **Behavior:** Actual decoded waveform if available
- **Guardrail:** No decorative fake signal presented as source
- **Verification:** Marker offset verified

### UX-CMP-18 — Transcript list
- **Behavior:** Stable chronological validated segments
- **Guardrail:** Bound rendering for huge transcript
- **Verification:** Large transcript stays responsive

### UX-CMP-19 — Transcript segment
- **Behavior:** Text, time, neutral speaker tag and uncertainty
- **Guardrail:** Original and reviewed text are distinct
- **Verification:** Click-to-seek test

### UX-CMP-20 — Interim segment
- **Behavior:** Provisional live event
- **Guardrail:** Not styled like final/officer-approved text
- **Verification:** Final event updates same segment

### UX-CMP-21 — Unclear speech marker
- **Behavior:** Uncertain or inaudible span marker
- **Guardrail:** Don't fill guessed words inside a quote
- **Verification:** Export preserves uncertainty

### UX-CMP-22 — Transcript search
- **Behavior:** Search current case transcript
- **Guardrail:** No implicit cross-case search
- **Verification:** Matching and zero-match tests

### UX-CMP-23 — Transcript editor
- **Behavior:** Review/correct a segment
- **Guardrail:** Preserve model output and reviewer metadata
- **Verification:** Revision is auditable

### UX-CMP-24 — Evidence drawer
- **Behavior:** Phrase, context, source offset and availability
- **Guardrail:** No unrelated-case lookup
- **Verification:** Same-run evidence link verified

### UX-CMP-25 — Entity card
- **Behavior:** Type, spoken form, normalized candidate and status
- **Guardrail:** No guessed geocoordinates or identity
- **Verification:** Unverified label visible

### UX-CMP-26 — Trigger card
- **Behavior:** Potential event category, phrase and context
- **Guardrail:** No global danger score or dispatch action
- **Verification:** Negation/history test

### UX-CMP-27 — Vocal cue card
- **Behavior:** Possible acoustic cue with interval and uncertainty
- **Guardrail:** No guilt, deception, truthfulness or intent claim
- **Verification:** Gate-off and abstention state tested

### UX-CMP-28 — Review action bar
- **Behavior:** Confirm, correct, dismiss, optional note
- **Guardrail:** Requires deliberate user action
- **Verification:** Unauthorized action rejected

### UX-CMP-29 — Review history
- **Behavior:** Actor, time, action, old/new state
- **Guardrail:** No destructive edit of past actions
- **Verification:** Audit matches current finding state

### UX-CMP-30 — Timeline panel
- **Behavior:** Events in source-time order
- **Guardrail:** Unknown timestamp is not invented
- **Verification:** Equal and missing times handled

### UX-CMP-31 — Follow-up suggestion
- **Behavior:** Question about a missing/unclear detail
- **Guardrail:** Suggestion doesn't become a fact
- **Verification:** Dismissal state is separate

### UX-CMP-32 — Contradiction panel
- **Behavior:** Both conflicting claims and separate source times
- **Guardrail:** No automatic credibility ranking
- **Verification:** Both claims remain accessible

### UX-CMP-33 — Analysis stage list
- **Behavior:** Persisted upload/transcribe/extract/save stages
- **Guardrail:** No stage advances due to elapsed-time animation
- **Verification:** Refresh reports true stage

### UX-CMP-34 — Retry control
- **Behavior:** Retry eligible failure only
- **Guardrail:** Bound attempts and use idempotency
- **Verification:** Double click doesn't duplicate work

### UX-CMP-35 — Error banner
- **Behavior:** Safe error category and recovery action
- **Guardrail:** No stack trace, raw provider response, signed URL or key
- **Verification:** Fault injection leaks no secret

### UX-CMP-36 — Empty state
- **Behavior:** Actionable message for no data/result
- **Guardrail:** Not a disguise for failed request
- **Verification:** State tests distinguish error from empty

### UX-CMP-37 — Loading skeleton
- **Behavior:** Show data is pending
- **Guardrail:** Doesn't imply results exist
- **Verification:** Slow response test

### UX-CMP-38 — Mic permission gate
- **Behavior:** Request mic after explicit Start
- **Guardrail:** No background/page-load capture
- **Verification:** Denied permission handled

### UX-CMP-39 — Connection indicator
- **Behavior:** Connecting/connected/reconnecting/disconnected
- **Guardrail:** Must reflect actual session state
- **Verification:** Socket loss test

### UX-CMP-40 — Live controls
- **Behavior:** Start/Stop/Finalize as allowed by state
- **Guardrail:** Stop remains reachable during capture
- **Verification:** Keyboard and narrow-screen test

### UX-CMP-41 — Live announcement region
- **Behavior:** Announce meaningful status/final updates
- **Guardrail:** No screen reader flood per audio packet
- **Verification:** Assistive review

### UX-CMP-42 — Session timer
- **Behavior:** Elapsed duration from actual session clock
- **Guardrail:** Saved duration only after finalization
- **Verification:** Stop/reload reconciliation

### UX-CMP-43 — Report summary
- **Behavior:** Neutral selected-run synthesis
- **Guardrail:** Unverified source remains attributed
- **Verification:** Copy review

### UX-CMP-44 — Report table
- **Behavior:** Segments, entities, findings and review status
- **Guardrail:** Stable IDs/time included
- **Verification:** Export compared to DB snapshot

### UX-CMP-45 — CSV export
- **Behavior:** Allowlisted structured columns
- **Guardrail:** Escape formula-leading input
- **Verification:** Malicious cell test

### UX-CMP-46 — Print control
- **Behavior:** Print-friendly report
- **Guardrail:** Caveat not only tooltip/color
- **Verification:** Print preview review

### UX-CMP-47 — Retention notice
- **Behavior:** Explain temporary audio expiry
- **Guardrail:** Must match deployed policy/provider limits
- **Verification:** Visible before upload

### UX-CMP-48 — Expired media notice
- **Behavior:** Explain playback unavailable
- **Guardrail:** No dead control pretending to work
- **Verification:** Expired-source test

### UX-CMP-49 — Demo banner
- **Behavior:** Persistent synthetic/fixture marker
- **Guardrail:** Include in report when fixture content used
- **Verification:** No fixture mistaken for real incident

### UX-CMP-50 — Methodology notice
- **Behavior:** Model/run/version and limitations
- **Guardrail:** No forensic certified claim
- **Verification:** Visible on screen and export

### UX-CMP-51 — Confirmation dialog
- **Behavior:** Delete/discard consequence
- **Guardrail:** No ambiguous destructive label
- **Verification:** Focus and cancel tested

### UX-CMP-52 — Toast message
- **Behavior:** Brief success/failure feedback
- **Guardrail:** Critical state also changes durably
- **Verification:** Failed mutation never says success

### UX-CMP-53 — Skip link
- **Behavior:** Move focus to main content
- **Guardrail:** No inaccessible route shortcut
- **Verification:** Keyboard navigation test

### UX-CMP-54 — Responsive panel
- **Behavior:** Stack secondary details on small view
- **Guardrail:** Keep evidence and Stop visible
- **Verification:** 1024/768/390 widths reviewed

### UX-CMP-55 — Privacy panel
- **Behavior:** Authorized use and retention explanation
- **Guardrail:** No unsupported legal promise
- **Verification:** Copy compared with policy

### UX-CMP-56 — Build label
- **Behavior:** Safe build and fixture ID
- **Guardrail:** No secret or internal key exposure
- **Verification:** Matches deployment metadata

### UX-CMP-57 — Unavailable feature panel
- **Behavior:** Explain disabled/experimental capability
- **Guardrail:** Never return a fake fallback finding
- **Verification:** Recorded path still works

### UX-CMP-58 — Speaker chip
- **Behavior:** Recording-local neutral label
- **Guardrail:** No identity or demographic inference
- **Verification:** Diarization caveat visible

### UX-CMP-59 — Audio quality warning
- **Behavior:** Supported signal-quality issue and time if available
- **Guardrail:** Noise/clipping isn't emotion evidence
- **Verification:** Negative artefact fixture passes

### UX-CMP-60 — Correction diff
- **Behavior:** Show officer's reviewed change
- **Guardrail:** No provider raw payload exposure
- **Verification:** Revision history retained

### UX-CMP-61 — Case note editor
- **Behavior:** Officer-authored note and save status
- **Guardrail:** Separate from model statements
- **Verification:** Author/date retained

### UX-CMP-62 — Case delete dialog
- **Behavior:** Explain deletion scope and retention caveats
- **Guardrail:** No promise before asynchronous deletion is verified
- **Verification:** Partial failure visible

### UX-CMP-63 — Capability panel
- **Behavior:** Server-configured feature availability
- **Guardrail:** Client cannot enable disabled function
- **Verification:** Tamper test

### UX-CMP-64 — Session-expiry notice
- **Behavior:** Sign-in prompt and unsaved work explanation
- **Guardrail:** Clear sensitive UI state
- **Verification:** Expiry test

### UX-CMP-65 — No-transcript view
- **Behavior:** Explain no valid segment returned
- **Guardrail:** Distinct from no trigger and provider failure
- **Verification:** Empty-response test

### UX-CMP-66 — Partial-analysis view
- **Behavior:** List completed and missing stages
- **Guardrail:** Missing stage is never green/completed
- **Verification:** Report matches partial state

### UX-CMP-67 — Source availability chip
- **Behavior:** Available, expired, denied or temporarily unavailable
- **Guardrail:** Statuses represent actual source state
- **Verification:** Each state has correct playback behavior

## State matrix
### UX-STATE-01 — Initial load
- **Trigger:** No server result yet
- **Display:** Show loading
- **Exit:** Data or safe error
- **Rule:** Never show zero before response

### UX-STATE-02 — Empty cases
- **Trigger:** Authorized query has no rows
- **Display:** Offer create action
- **Exit:** Create/refresh
- **Rule:** No sample rows in real mode

### UX-STATE-03 — Unsupported type
- **Trigger:** Type outside allowlist
- **Display:** Explain accepted types
- **Exit:** Choose another file
- **Rule:** No provider call

### UX-STATE-04 — Invalid bytes
- **Trigger:** Extension valid but content invalid
- **Display:** Reject with reason
- **Exit:** Choose valid file
- **Rule:** Server validation rules

### UX-STATE-05 — Uploading
- **Trigger:** Transfer active
- **Display:** Real progress or indeterminate
- **Exit:** Complete/cancel/fail
- **Rule:** No fake percentage

### UX-STATE-06 — Cancelled upload
- **Trigger:** User stopped transfer
- **Display:** Cancelled state
- **Exit:** Retry/leave
- **Rule:** Cleanup partial object

### UX-STATE-07 — Upload error
- **Trigger:** Network/storage failure
- **Display:** Safe retry state
- **Exit:** Retry with fresh grant
- **Rule:** Not analysed

### UX-STATE-08 — Queued run
- **Trigger:** Run persisted, not started
- **Display:** Queued label
- **Exit:** Start/fail
- **Rule:** Not complete

### UX-STATE-09 — Transcribing
- **Trigger:** STT stage active
- **Display:** Show stage
- **Exit:** Complete/partial/fail
- **Rule:** Persist status

### UX-STATE-10 — Extracting
- **Trigger:** Validated text is being analyzed
- **Display:** Show stage
- **Exit:** Complete/partial/fail
- **Rule:** No early completion

### UX-STATE-11 — Completed
- **Trigger:** Required stages persisted
- **Display:** Review-needed/completed
- **Exit:** Review/export
- **Rule:** Persistence first

### UX-STATE-12 — Partial
- **Trigger:** Some stages saved
- **Display:** List missing output
- **Exit:** Review/retry if safe
- **Rule:** Never called complete

### UX-STATE-13 — Failed
- **Trigger:** Required stage failed
- **Display:** Error and eligible retry
- **Exit:** Retry/return
- **Rule:** Not an empty result

### UX-STATE-14 — Abstained
- **Trigger:** Insufficient evidence or cue disabled
- **Display:** Explain unavailable result
- **Exit:** Continue review
- **Rule:** Not an all-clear

### UX-STATE-15 — No transcript
- **Trigger:** No valid segments returned
- **Display:** Explain no transcript
- **Exit:** Retry/manual listen
- **Rule:** Not interpreted as safe

### UX-STATE-16 — No triggers
- **Trigger:** Successful run found no candidate
- **Display:** Neutral empty result
- **Exit:** Continue review
- **Rule:** No green safety badge

### UX-STATE-17 — Audio expired
- **Trigger:** Object deleted/expired
- **Display:** Disable player
- **Exit:** Review allowed data
- **Rule:** No fake playback

### UX-STATE-18 — Storage unavailable
- **Trigger:** Object not currently accessible
- **Display:** Retryable unavailable
- **Exit:** Retry/access review
- **Rule:** Don't claim deleted

### UX-STATE-19 — Final segment
- **Trigger:** Segment is finalized and persisted
- **Display:** Final styling
- **Exit:** Search/review
- **Rule:** Stable after reload

### UX-STATE-20 — Interim segment
- **Trigger:** Live event is provisional
- **Display:** Interim tag
- **Exit:** Finalization/stop
- **Rule:** Not reviewed evidence yet

### UX-STATE-21 — Uncertain words
- **Trigger:** Transcript unclear
- **Display:** Uncertainty marker
- **Exit:** Listen/correct
- **Rule:** No guess

### UX-STATE-22 — Finding pending
- **Trigger:** No reviewer action
- **Display:** Pending/evidence link
- **Exit:** Review
- **Rule:** No auto-confirm

### UX-STATE-23 — Finding confirmed
- **Trigger:** Officer accepted suggestion
- **Display:** Actor and time visible
- **Exit:** Allowed future review
- **Rule:** Not independently verified

### UX-STATE-24 — Finding corrected
- **Trigger:** Officer revised candidate
- **Display:** Corrected/history
- **Exit:** Inspect/export
- **Rule:** Original retained

### UX-STATE-25 — Finding dismissed
- **Trigger:** Officer rejects suggestion
- **Display:** Dismissed state
- **Exit:** History view
- **Rule:** Not erased silently

### UX-STATE-26 — Review save failed
- **Trigger:** Server didn't persist
- **Display:** Unsaved warning
- **Exit:** Retry/reload
- **Rule:** No success toast

### UX-STATE-27 — Review conflict
- **Trigger:** Version changed concurrently
- **Display:** Conflict/reload
- **Exit:** Refresh/review
- **Rule:** No silent overwrite

### UX-STATE-28 — Mic permission
- **Trigger:** Explicit Start clicked
- **Display:** Ask browser permission
- **Exit:** Grant/deny
- **Rule:** No capture before grant

### UX-STATE-29 — Permission denied
- **Trigger:** Browser blocked microphone
- **Display:** Explain/recorded route
- **Exit:** Retry/upload
- **Rule:** No hidden capture

### UX-STATE-30 — Live connecting
- **Trigger:** Handshake pending
- **Display:** Connecting indicator
- **Exit:** Connect/fail/stop
- **Rule:** No fake Connected

### UX-STATE-31 — Live connected
- **Trigger:** Valid session active
- **Display:** Persistent capture state
- **Exit:** Stop/reconnect/fail
- **Rule:** Stop reachable

### UX-STATE-32 — Live reconnecting
- **Trigger:** Socket dropped
- **Display:** Banner and bounded retry
- **Exit:** Reconnect/partial/fail
- **Rule:** No infinite loop

### UX-STATE-33 — Live disconnected
- **Trigger:** No active socket
- **Display:** Disconnected state
- **Exit:** Finalize/restart
- **Rule:** No active capture claim

### UX-STATE-34 — Live stopping
- **Trigger:** Stop requested
- **Display:** Finalizing state
- **Exit:** Final/partial/fail
- **Rule:** Idempotent stop

### UX-STATE-35 — Live partial
- **Trigger:** Some data persisted
- **Display:** Partial label and gaps
- **Exit:** Review/retry
- **Rule:** No false full success

### UX-STATE-36 — Live failed
- **Trigger:** Session unusable
- **Display:** Safe error/recorded fallback
- **Exit:** Restart/upload
- **Rule:** No fake events

### UX-STATE-37 — Search empty
- **Trigger:** No match in current transcript
- **Display:** No-match prompt
- **Exit:** Edit query
- **Rule:** Transcript exists

### UX-STATE-38 — Filter empty
- **Trigger:** Filter result empty
- **Display:** Clear filter action
- **Exit:** Adjust filter
- **Rule:** Not access denial

### UX-STATE-39 — Forbidden case
- **Trigger:** Actor lacks permission
- **Display:** Generic safe denial
- **Exit:** Return to allowed cases
- **Rule:** No metadata leak

### UX-STATE-40 — Session expired
- **Trigger:** Auth context invalid
- **Display:** Sign-in notice
- **Exit:** Authenticate
- **Rule:** Clear protected state

### UX-STATE-41 — Provider rate limit
- **Trigger:** Quota/rate response
- **Display:** Bounded retry guidance
- **Exit:** Retry after window
- **Rule:** No retry storm

### UX-STATE-42 — Schema failure
- **Trigger:** Provider result invalid
- **Display:** Safe partial/error
- **Exit:** Fix adapter or safe retry
- **Rule:** No raw payload display

### UX-STATE-43 — Report building
- **Trigger:** Snapshot is being generated
- **Display:** Honest busy state
- **Exit:** Download/fail
- **Rule:** Specific run pinned

### UX-STATE-44 — Report failed
- **Trigger:** Render/authorization failed
- **Display:** Safe recovery state
- **Exit:** Retry/filter
- **Rule:** No blank success file

### UX-STATE-45 — Delete pending
- **Trigger:** Deletion not confirmed
- **Display:** Pending label
- **Exit:** Worker/retry
- **Rule:** Don't say deleted

### UX-STATE-46 — Delete failed
- **Trigger:** Storage deletion failed
- **Display:** Failure/retry
- **Exit:** Retry/ops
- **Rule:** Not terminal success

### UX-STATE-47 — Demo active
- **Trigger:** Synthetic fixture selected
- **Display:** Persistent demo marker
- **Exit:** Exit demo
- **Rule:** Do not mix real cases

### UX-STATE-48 — Feature disabled
- **Trigger:** Flag disabled capability
- **Display:** Unavailable explanation
- **Exit:** Use supported path
- **Rule:** No fake output

### UX-STATE-49 — Narrow viewport
- **Trigger:** Width constrained
- **Display:** Stack panels
- **Exit:** Continue work
- **Rule:** Keep evidence/Stop

### UX-STATE-50 — Keyboard focus
- **Trigger:** User tabs through UI
- **Display:** Visible logical focus
- **Exit:** Activate controls
- **Rule:** No hover-only critical actions

### UX-STATE-51 — Offline
- **Trigger:** Server unreachable
- **Display:** Connection banner
- **Exit:** Retry/refetch
- **Rule:** No optimistic success

### UX-STATE-52 — Decode error
- **Trigger:** Browser cannot play audio
- **Display:** Playback issue
- **Exit:** Alternative browser/file
- **Rule:** Transcript remains usable

### UX-STATE-53 — Unknown language
- **Trigger:** Detection unreliable
- **Display:** Unknown/unsupported
- **Exit:** Manual review
- **Rule:** No fluent guess

### UX-STATE-54 — No speaker labels
- **Trigger:** Diarization omitted
- **Display:** Unknown/omit label
- **Exit:** Continue
- **Rule:** No identity invention

### UX-STATE-55 — Unknown time
- **Trigger:** No valid offset
- **Display:** Untimed group
- **Exit:** Review context
- **Rule:** No fake milliseconds

### UX-STATE-56 — Large transcript
- **Trigger:** Many segments
- **Display:** Paginate/virtualize where needed
- **Exit:** Navigate all
- **Rule:** No silent truncation

### UX-STATE-57 — Large export
- **Trigger:** Over configured limit
- **Display:** Filter/paginate message
- **Exit:** Narrow request
- **Rule:** No partial file labelled complete

## Accessibility matrix
### UX-A11Y-01 — Contrast
- **Requirement:** Text, evidence, warning and error colors meet the selected target
- **Test:** Measure actual rendered combinations

### UX-A11Y-02 — Keyboard
- **Requirement:** Upload, transcript, evidence, review and export complete without mouse
- **Test:** Record keyboard-only path

### UX-A11Y-03 — Focus
- **Requirement:** Visible ring and logical order for route, modal and error transitions
- **Test:** Test focus return

### UX-A11Y-04 — Screen reader
- **Requirement:** Meaningful labels and polite status updates
- **Test:** Avoid announcing every audio packet

### UX-A11Y-05 — Motion
- **Requirement:** No required state depends on animation; reduced motion respected
- **Test:** Test OS setting

### UX-A11Y-06 — Zoom
- **Requirement:** Core functions usable at 200 percent browser zoom
- **Test:** Manual zoom review

### UX-A11Y-07 — Language
- **Requirement:** UI locale differs from transcript language metadata
- **Test:** Test mixed-language fixture

### UX-A11Y-08 — Time labels
- **Requirement:** Media offset and wall-clock time use distinct labels
- **Test:** Inspect screen and report

### UX-A11Y-09 — Uncertainty copy
- **Requirement:** Possible/unverified/unclear language is beside the result
- **Test:** Review every finding type

### UX-A11Y-10 — Destructive action
- **Requirement:** Delete/discard outcome is explicit and confirmed
- **Test:** Keyboard and screen-reader review

### UX-A11Y-11 — Error copy
- **Requirement:** Explain failure and next action without internal details
- **Test:** Fault injection

### UX-A11Y-12 — Tables
- **Requirement:** Semantic column headers and readable print output
- **Test:** Report accessibility review

### UX-A11Y-13 — Small screens
- **Requirement:** Evidence and Stop remain reachable
- **Test:** Test 1024/768/390 widths

### UX-A11Y-14 — Live status
- **Requirement:** Active/stopped/disconnected state persists visually and textually
- **Test:** Walk through all states

### UX-A11Y-15 — Demo status
- **Requirement:** Synthetic marker is text and survives exports
- **Test:** Inspect report

### UX-A11Y-16 — Player labels
- **Requirement:** Audio controls have accessible action names
- **Test:** Keyboard player review

### UX-A11Y-17 — Transcript selection
- **Requirement:** Current segment discernible without color alone
- **Test:** Keyboard/screen reader test

### UX-A11Y-18 — Dialogs
- **Requirement:** Focus stays contained and returns after close
- **Test:** Dialog test

### UX-A11Y-19 — Empty states
- **Requirement:** Next action clear and error not disguised
- **Test:** State copy review

### UX-A11Y-20 — Field errors
- **Requirement:** Errors are associated with their labelled field
- **Test:** Form validation check

## Review contracts

- Finding selection opens its supporting source excerpt and source availability state.
- Transcript selection highlights the segment and seeks the player to a validated offset where possible.
- Expired media disables playback and explains why; it does not disable permitted case metadata review.
- Review buttons update durable state only after server confirmation.
- Conflicting review versions prompt reload/review instead of silent last-write-wins.
- Live interim events remain provisional until finalization.
- Every core action is keyboard-accessible and has a semantic label.
- No button initiates dispatch or claims guilt/deception/identity.

## Report contracts

- User selects an exact case and analysis run.
- Report includes method note, source anchors, review status and uncertainty.
- Partial processing and unavailable media are explicit.
- Unverified statements remain attributed, not asserted as external fact.
- CSV uses a field allowlist and escapes formula-leading text.
- Failed export cannot masquerade as a blank successful artifact.

## Visual tokens

| Token | Usage | Constraint |
|---|---|---|
| Canvas | Deep navy | Contrast checked |
| Surface | Lighter navy panels | No excessive nested cards |
| Accent | Blue/teal | Action/focus, never probability |
| Warning | Amber + text | Not colour-only |
| Error | Accessible red + recovery text | No provider stack trace |
| Type | Legible sans serif | Avoid tiny transcript |
| Spacing | Consistent rhythm | Keep finding and source close |
| Motion | Minimal | Never fake progress |
| Divider | Subtle boundary | Avoid low-contrast evidence groups |

## UX acceptance checklist
- [ ] UX-CHECK-01: Overview data reconciles to persisted authorized records
- [ ] UX-CHECK-02: Only three primary navigation sections exist
- [ ] UX-CHECK-03: Upload limits reflect server configuration
- [ ] UX-CHECK-04: Mic permission requires explicit user action
- [ ] UX-CHECK-05: Connection state reflects real session
- [ ] UX-CHECK-06: Audio player disabled after expiry
- [ ] UX-CHECK-07: Transcript time seek tested
- [ ] UX-CHECK-08: Interim/final segments distinct
- [ ] UX-CHECK-09: Unclear speech not guessed
- [ ] UX-CHECK-10: Entities show source wording/status
- [ ] UX-CHECK-11: Trigger context is visible
- [ ] UX-CHECK-12: Vocal cue panel can be disabled
- [ ] UX-CHECK-13: No global danger score or lie detector
- [ ] UX-CHECK-14: Review changes only after server success
- [ ] UX-CHECK-15: Concurrency conflict is visible
- [ ] UX-CHECK-16: Unknown timestamps shown separately
- [ ] UX-CHECK-17: Conflicting statements remain separate
- [ ] UX-CHECK-18: Export is pinned to a run
- [ ] UX-CHECK-19: Method note survives print
- [ ] UX-CHECK-20: CSV formula input escaped
- [ ] UX-CHECK-21: Empty differs from failure
- [ ] UX-CHECK-22: Partial state names missing stages
- [ ] UX-CHECK-23: Provider raw error is hidden
- [ ] UX-CHECK-24: Focus ring remains visible
- [ ] UX-CHECK-25: 200% zoom usable
- [ ] UX-CHECK-26: Small viewport keeps Stop and evidence
- [ ] UX-CHECK-27: Status not conveyed by colour only
- [ ] UX-CHECK-28: Logout clears protected content
- [ ] UX-CHECK-29: Demo marker persists through export
- [ ] UX-CHECK-30: Fixture not presented as real incident
- [ ] UX-CHECK-31: Expired media reflected in report
- [ ] UX-CHECK-32: Speaker labels stay neutral
- [ ] UX-CHECK-33: Unknown language isn't fluent guesswork
- [ ] UX-CHECK-34: Address mention does not create GPS pin
- [ ] UX-CHECK-35: No emergency action is exposed
- [ ] UX-CHECK-36: Disabled capability doesn't fabricate result
- [ ] UX-CHECK-37: Retry only when eligible
- [ ] UX-CHECK-38: Progress reflects actual state
- [ ] UX-CHECK-39: Search scope is explicit
- [ ] UX-CHECK-40: Report table has headers
- [ ] UX-CHECK-41: Dialog focus returns correctly

## References

- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- https://supabase.com/docs/guides/storage/buckets/fundamentals

## Definition of done

A visual control is functional only when it has real behavior, server authorization where needed, failure/empty states and a test. Mocked progress or fabricated model output does not satisfy acceptance.
