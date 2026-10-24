# 10 — Demo Plan and Evaluation Rubric

## Demo objective

Demonstrate a trustworthy workflow on synthetic or authorized audio: ingest, transcribe, inspect source, review candidate findings and export an honest report. The product is a hackathon decision-support prototype, not an emergency service or certified forensic system.

## Demo data policy

- Use synthetic or explicitly authorized and consented sample audio only.
- Never place real sensitive police/cybercrime calls in repo, public issue, slides or screenshots.
- Give every fixture a stable ID, duration/codec/language note, authorization basis, expected span and expiry decision.
- Keep the synthetic/demo banner visible through case detail and exported report.
- Keep fixture data separate from real case lists/environments.

## Repeatable fixture catalogue
### DEMO-F01-UNIT — Explicit help request
- **Scenario:** A synthetic caller asks for help and mentions a landmark
- **Expected:** Transcript and possible trigger reference same source interval
- **Boundary:** No outbound dispatch
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F01-INT — Explicit help request
- **Scenario:** A synthetic caller asks for help and mentions a landmark
- **Expected:** Transcript and possible trigger reference same source interval
- **Boundary:** No outbound dispatch
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F01-E2E — Explicit help request
- **Scenario:** A synthetic caller asks for help and mentions a landmark
- **Expected:** Transcript and possible trigger reference same source interval
- **Boundary:** No outbound dispatch
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F02-UNIT — Negated threat
- **Scenario:** Speaker says nobody is threatening them now
- **Expected:** Negation suppresses keyword-only trigger
- **Boundary:** No false urgent claim
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F02-INT — Negated threat
- **Scenario:** Speaker says nobody is threatening them now
- **Expected:** Negation suppresses keyword-only trigger
- **Boundary:** No false urgent claim
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F02-E2E — Negated threat
- **Scenario:** Speaker says nobody is threatening them now
- **Expected:** Negation suppresses keyword-only trigger
- **Boundary:** No false urgent claim
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F03-UNIT — Past threat
- **Scenario:** Speaker says threat occurred yesterday
- **Expected:** Label historical/reported
- **Boundary:** No current-state inference
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F03-INT — Past threat
- **Scenario:** Speaker says threat occurred yesterday
- **Expected:** Label historical/reported
- **Boundary:** No current-state inference
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F03-E2E — Past threat
- **Scenario:** Speaker says threat occurred yesterday
- **Expected:** Label historical/reported
- **Boundary:** No current-state inference
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F04-UNIT — Hypothetical threat
- **Scenario:** Conditional phrase describes what might happen
- **Expected:** Preserve hypothetical context
- **Boundary:** No confirmed event
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F04-INT — Hypothetical threat
- **Scenario:** Conditional phrase describes what might happen
- **Expected:** Preserve hypothetical context
- **Boundary:** No confirmed event
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F04-E2E — Hypothetical threat
- **Scenario:** Conditional phrase describes what might happen
- **Expected:** Preserve hypothetical context
- **Boundary:** No confirmed event
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F05-UNIT — Quoted threat
- **Scenario:** Speaker quotes another person
- **Expected:** Keep reported attribution
- **Boundary:** No intent inference
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F05-INT — Quoted threat
- **Scenario:** Speaker quotes another person
- **Expected:** Keep reported attribution
- **Boundary:** No intent inference
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F05-E2E — Quoted threat
- **Scenario:** Speaker quotes another person
- **Expected:** Keep reported attribution
- **Boundary:** No intent inference
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F06-UNIT — Ambiguous landmark
- **Scenario:** Noisy place name has two plausible readings
- **Expected:** Uncertain entity with quote
- **Boundary:** No guessed address
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F06-INT — Ambiguous landmark
- **Scenario:** Noisy place name has two plausible readings
- **Expected:** Uncertain entity with quote
- **Boundary:** No guessed address
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F06-E2E — Ambiguous landmark
- **Scenario:** Noisy place name has two plausible readings
- **Expected:** Uncertain entity with quote
- **Boundary:** No guessed address
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F07-UNIT — Partial phone digit
- **Scenario:** One digit is masked in sample
- **Expected:** Store partial/uncertain or omit
- **Boundary:** Never complete digit
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F07-INT — Partial phone digit
- **Scenario:** One digit is masked in sample
- **Expected:** Store partial/uncertain or omit
- **Boundary:** Never complete digit
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F07-E2E — Partial phone digit
- **Scenario:** One digit is masked in sample
- **Expected:** Store partial/uncertain or omit
- **Boundary:** Never complete digit
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F08-UNIT — Calm urgent speech
- **Scenario:** Urgent text spoken calmly
- **Expected:** Text trigger separate from acoustic cue
- **Boundary:** Calm isn't safe
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F08-INT — Calm urgent speech
- **Scenario:** Urgent text spoken calmly
- **Expected:** Text trigger separate from acoustic cue
- **Boundary:** Calm isn't safe
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F08-E2E — Calm urgent speech
- **Scenario:** Urgent text spoken calmly
- **Expected:** Text trigger separate from acoustic cue
- **Boundary:** Calm isn't safe
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F09-UNIT — Angry phrase neutral tone
- **Scenario:** Insulting words delivered neutrally
- **Expected:** Transcript sentiment not vocal emotion
- **Boundary:** No lexicon-only anger
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F09-INT — Angry phrase neutral tone
- **Scenario:** Insulting words delivered neutrally
- **Expected:** Transcript sentiment not vocal emotion
- **Boundary:** No lexicon-only anger
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F09-E2E — Angry phrase neutral tone
- **Scenario:** Insulting words delivered neutrally
- **Expected:** Transcript sentiment not vocal emotion
- **Boundary:** No lexicon-only anger
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F10-UNIT — Crying-like cue
- **Scenario:** Synthetic audio contains possible cry-like feature
- **Expected:** Local cautious cue or abstain
- **Boundary:** Not proof of fear/truth
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F10-INT — Crying-like cue
- **Scenario:** Synthetic audio contains possible cry-like feature
- **Expected:** Local cautious cue or abstain
- **Boundary:** Not proof of fear/truth
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F10-E2E — Crying-like cue
- **Scenario:** Synthetic audio contains possible cry-like feature
- **Expected:** Local cautious cue or abstain
- **Boundary:** Not proof of fear/truth
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F11-UNIT — Low quality
- **Scenario:** Noise masks words
- **Expected:** Uncertain transcript/abstention
- **Boundary:** No forced output
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F11-INT — Low quality
- **Scenario:** Noise masks words
- **Expected:** Uncertain transcript/abstention
- **Boundary:** No forced output
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F11-E2E — Low quality
- **Scenario:** Noise masks words
- **Expected:** Uncertain transcript/abstention
- **Boundary:** No forced output
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F12-UNIT — Silence
- **Scenario:** Sample contains a pause
- **Expected:** Silence metadata only where measured
- **Boundary:** No safety inference
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F12-INT — Silence
- **Scenario:** Sample contains a pause
- **Expected:** Silence metadata only where measured
- **Boundary:** No safety inference
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F12-E2E — Silence
- **Scenario:** Sample contains a pause
- **Expected:** Silence metadata only where measured
- **Boundary:** No safety inference
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F13-UNIT — Overlapping speakers
- **Scenario:** Two voices overlap
- **Expected:** Provisional labels/uncertainty
- **Boundary:** No identity matching
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F13-INT — Overlapping speakers
- **Scenario:** Two voices overlap
- **Expected:** Provisional labels/uncertainty
- **Boundary:** No identity matching
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F13-E2E — Overlapping speakers
- **Scenario:** Two voices overlap
- **Expected:** Provisional labels/uncertainty
- **Boundary:** No identity matching
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F14-UNIT — Mixed Hindi-English
- **Scenario:** Hinglish utterance with landmark
- **Expected:** Preserve supported words and language metadata
- **Boundary:** No silent translation
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F14-INT — Mixed Hindi-English
- **Scenario:** Hinglish utterance with landmark
- **Expected:** Preserve supported words and language metadata
- **Boundary:** No silent translation
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F14-E2E — Mixed Hindi-English
- **Scenario:** Hinglish utterance with landmark
- **Expected:** Preserve supported words and language metadata
- **Boundary:** No silent translation
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F15-UNIT — Background TV
- **Scenario:** Speech is from media in background
- **Expected:** Speaker/source uncertain
- **Boundary:** No automatic participant
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F15-INT — Background TV
- **Scenario:** Speech is from media in background
- **Expected:** Speaker/source uncertain
- **Boundary:** No automatic participant
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F15-E2E — Background TV
- **Scenario:** Speech is from media in background
- **Expected:** Speaker/source uncertain
- **Boundary:** No automatic participant
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F16-UNIT — Fictional weapon
- **Scenario:** Dialogue mentions weapon in a story
- **Expected:** Context suppresses current incident
- **Boundary:** No keyword-only trigger
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F16-INT — Fictional weapon
- **Scenario:** Dialogue mentions weapon in a story
- **Expected:** Context suppresses current incident
- **Boundary:** No keyword-only trigger
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F16-E2E — Fictional weapon
- **Scenario:** Dialogue mentions weapon in a story
- **Expected:** Context suppresses current incident
- **Boundary:** No keyword-only trigger
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F17-UNIT — Reported medical symptom
- **Scenario:** Speaker mentions breathing difficulty
- **Expected:** Potential reported event with source
- **Boundary:** No diagnosis
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F17-INT — Reported medical symptom
- **Scenario:** Speaker mentions breathing difficulty
- **Expected:** Potential reported event with source
- **Boundary:** No diagnosis
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F17-E2E — Reported medical symptom
- **Scenario:** Speaker mentions breathing difficulty
- **Expected:** Potential reported event with source
- **Boundary:** No diagnosis
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F18-UNIT — Conflicting locations
- **Scenario:** Two landmark mentions differ
- **Expected:** Keep both with separate timestamps
- **Boundary:** No deception score
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F18-INT — Conflicting locations
- **Scenario:** Two landmark mentions differ
- **Expected:** Keep both with separate timestamps
- **Boundary:** No deception score
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F18-E2E — Conflicting locations
- **Scenario:** Two landmark mentions differ
- **Expected:** Keep both with separate timestamps
- **Boundary:** No deception score
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F19-UNIT — Prompt injection spoken
- **Scenario:** Audio tells model to reveal secrets
- **Expected:** Only transcribe as source content
- **Boundary:** No prompt override
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F19-INT — Prompt injection spoken
- **Scenario:** Audio tells model to reveal secrets
- **Expected:** Only transcribe as source content
- **Boundary:** No prompt override
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F19-E2E — Prompt injection spoken
- **Scenario:** Audio tells model to reveal secrets
- **Expected:** Only transcribe as source content
- **Boundary:** No prompt override
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F20-UNIT — Unknown language
- **Scenario:** Fixture not in validated support
- **Expected:** Unknown/unsupported state
- **Boundary:** No hallucinated translation
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F20-INT — Unknown language
- **Scenario:** Fixture not in validated support
- **Expected:** Unknown/unsupported state
- **Boundary:** No hallucinated translation
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F20-E2E — Unknown language
- **Scenario:** Fixture not in validated support
- **Expected:** Unknown/unsupported state
- **Boundary:** No hallucinated translation
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F21-UNIT — Long clip over limit
- **Scenario:** Fixture exceeds configured bounds
- **Expected:** Reject or explicitly tested split
- **Boundary:** No silent truncation
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F21-INT — Long clip over limit
- **Scenario:** Fixture exceeds configured bounds
- **Expected:** Reject or explicitly tested split
- **Boundary:** No silent truncation
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F21-E2E — Long clip over limit
- **Scenario:** Fixture exceeds configured bounds
- **Expected:** Reject or explicitly tested split
- **Boundary:** No silent truncation
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F22-UNIT — Corrupt audio bytes
- **Scenario:** Rename invalid file to accepted suffix
- **Expected:** Reject before model call
- **Boundary:** No parser crash
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F22-INT — Corrupt audio bytes
- **Scenario:** Rename invalid file to accepted suffix
- **Expected:** Reject before model call
- **Boundary:** No parser crash
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F22-E2E — Corrupt audio bytes
- **Scenario:** Rename invalid file to accepted suffix
- **Expected:** Reject before model call
- **Boundary:** No parser crash
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F23-UNIT — Upload interrupted
- **Scenario:** Network cuts transfer
- **Expected:** Not verified/analysed until finalizer passes
- **Boundary:** Cleanup path
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F23-INT — Upload interrupted
- **Scenario:** Network cuts transfer
- **Expected:** Not verified/analysed until finalizer passes
- **Boundary:** Cleanup path
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F23-E2E — Upload interrupted
- **Scenario:** Network cuts transfer
- **Expected:** Not verified/analysed until finalizer passes
- **Boundary:** Cleanup path
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F24-UNIT — Provider timeout
- **Scenario:** Test call times out
- **Expected:** Partial/fail state persisted
- **Boundary:** No empty-success
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F24-INT — Provider timeout
- **Scenario:** Test call times out
- **Expected:** Partial/fail state persisted
- **Boundary:** No empty-success
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F24-E2E — Provider timeout
- **Scenario:** Test call times out
- **Expected:** Partial/fail state persisted
- **Boundary:** No empty-success
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F25-UNIT — Provider 429
- **Scenario:** Synthetic quota response
- **Expected:** Bounded retry and safe message
- **Boundary:** No retry storm
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F25-INT — Provider 429
- **Scenario:** Synthetic quota response
- **Expected:** Bounded retry and safe message
- **Boundary:** No retry storm
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F25-E2E — Provider 429
- **Scenario:** Synthetic quota response
- **Expected:** Bounded retry and safe message
- **Boundary:** No retry storm
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F26-UNIT — Malformed output
- **Scenario:** Adapter receives missing required fields
- **Expected:** Reject schema
- **Boundary:** No raw JSON UI
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F26-INT — Malformed output
- **Scenario:** Adapter receives missing required fields
- **Expected:** Reject schema
- **Boundary:** No raw JSON UI
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F26-E2E — Malformed output
- **Scenario:** Adapter receives missing required fields
- **Expected:** Reject schema
- **Boundary:** No raw JSON UI
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F27-UNIT — No finding support
- **Scenario:** Valid transcript has no supported trigger
- **Expected:** Neutral empty list
- **Boundary:** No safe badge
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F27-INT — No finding support
- **Scenario:** Valid transcript has no supported trigger
- **Expected:** Neutral empty list
- **Boundary:** No safe badge
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F27-E2E — No finding support
- **Scenario:** Valid transcript has no supported trigger
- **Expected:** Neutral empty list
- **Boundary:** No safe badge
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F28-UNIT — Missing timestamp
- **Scenario:** Provider omits source time
- **Expected:** Untimed/unavailable label
- **Boundary:** No invented offset
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F28-INT — Missing timestamp
- **Scenario:** Provider omits source time
- **Expected:** Untimed/unavailable label
- **Boundary:** No invented offset
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F28-E2E — Missing timestamp
- **Scenario:** Provider omits source time
- **Expected:** Untimed/unavailable label
- **Boundary:** No invented offset
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F29-UNIT — Repeated live event
- **Scenario:** Same interim event is delivered twice
- **Expected:** One coherent segment
- **Boundary:** No duplicate phrase
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F29-INT — Repeated live event
- **Scenario:** Same interim event is delivered twice
- **Expected:** One coherent segment
- **Boundary:** No duplicate phrase
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F29-E2E — Repeated live event
- **Scenario:** Same interim event is delivered twice
- **Expected:** One coherent segment
- **Boundary:** No duplicate phrase
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F30-UNIT — Late live event
- **Scenario:** Event comes after Stop request
- **Expected:** Close protocol enforced
- **Boundary:** No session extension
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F30-INT — Late live event
- **Scenario:** Event comes after Stop request
- **Expected:** Close protocol enforced
- **Boundary:** No session extension
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F30-E2E — Late live event
- **Scenario:** Event comes after Stop request
- **Expected:** Close protocol enforced
- **Boundary:** No session extension
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F31-UNIT — Mic permission denied
- **Scenario:** Browser blocks access
- **Expected:** Recorded upload option shown
- **Boundary:** No hidden capture
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F31-INT — Mic permission denied
- **Scenario:** Browser blocks access
- **Expected:** Recorded upload option shown
- **Boundary:** No hidden capture
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F31-E2E — Mic permission denied
- **Scenario:** Browser blocks access
- **Expected:** Recorded upload option shown
- **Boundary:** No hidden capture
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F32-UNIT — Socket disconnect
- **Scenario:** Network drops during stream
- **Expected:** Bound recovery or partial
- **Boundary:** No fake connected badge
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F32-INT — Socket disconnect
- **Scenario:** Network drops during stream
- **Expected:** Bound recovery or partial
- **Boundary:** No fake connected badge
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F32-E2E — Socket disconnect
- **Scenario:** Network drops during stream
- **Expected:** Bound recovery or partial
- **Boundary:** No fake connected badge
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F33-UNIT — Expired audio
- **Scenario:** Stored fixture is deleted
- **Expected:** Player disabled and explanation shown
- **Boundary:** No fake playback
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F33-INT — Expired audio
- **Scenario:** Stored fixture is deleted
- **Expected:** Player disabled and explanation shown
- **Boundary:** No fake playback
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F33-E2E — Expired audio
- **Scenario:** Stored fixture is deleted
- **Expected:** Player disabled and explanation shown
- **Boundary:** No fake playback
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F34-UNIT — Cross-user access
- **Scenario:** Second account guesses resource ID
- **Expected:** Deny without metadata leak
- **Boundary:** Authorization gate
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F34-INT — Cross-user access
- **Scenario:** Second account guesses resource ID
- **Expected:** Deny without metadata leak
- **Boundary:** Authorization gate
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F34-E2E — Cross-user access
- **Scenario:** Second account guesses resource ID
- **Expected:** Deny without metadata leak
- **Boundary:** Authorization gate
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F35-UNIT — CSV formula payload
- **Scenario:** Note starts with formula marker
- **Expected:** Escaped inert cell
- **Boundary:** No spreadsheet execution
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F35-INT — CSV formula payload
- **Scenario:** Note starts with formula marker
- **Expected:** Escaped inert cell
- **Boundary:** No spreadsheet execution
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F35-E2E — CSV formula payload
- **Scenario:** Note starts with formula marker
- **Expected:** Escaped inert cell
- **Boundary:** No spreadsheet execution
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F36-UNIT — Officer correction
- **Scenario:** Reviewer changes landmark text
- **Expected:** Original/reviewed value plus actor history
- **Boundary:** No destructive overwrite
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F36-INT — Officer correction
- **Scenario:** Reviewer changes landmark text
- **Expected:** Original/reviewed value plus actor history
- **Boundary:** No destructive overwrite
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F36-E2E — Officer correction
- **Scenario:** Reviewer changes landmark text
- **Expected:** Original/reviewed value plus actor history
- **Boundary:** No destructive overwrite
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F37-UNIT — Stale review
- **Scenario:** Two actors submit same finding version
- **Expected:** One conflict outcome
- **Boundary:** No last-write-wins
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F37-INT — Stale review
- **Scenario:** Two actors submit same finding version
- **Expected:** One conflict outcome
- **Boundary:** No last-write-wins
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F37-E2E — Stale review
- **Scenario:** Two actors submit same finding version
- **Expected:** One conflict outcome
- **Boundary:** No last-write-wins
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F38-UNIT — Report selected run
- **Scenario:** Two runs exist for source
- **Expected:** Export matches explicit run ID
- **Boundary:** No run blending
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F38-INT — Report selected run
- **Scenario:** Two runs exist for source
- **Expected:** Export matches explicit run ID
- **Boundary:** No run blending
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F38-E2E — Report selected run
- **Scenario:** Two runs exist for source
- **Expected:** Export matches explicit run ID
- **Boundary:** No run blending
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F39-UNIT — Deletion error
- **Scenario:** Storage delete request fails
- **Expected:** Pending/failed state
- **Boundary:** No deletion claim
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F39-INT — Deletion error
- **Scenario:** Storage delete request fails
- **Expected:** Pending/failed state
- **Boundary:** No deletion claim
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F39-E2E — Deletion error
- **Scenario:** Storage delete request fails
- **Expected:** Pending/failed state
- **Boundary:** No deletion claim
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

### DEMO-F40-UNIT — Cue flag disabled
- **Scenario:** Server gate is false
- **Expected:** Cue panel unavailable with rationale
- **Boundary:** No fabricated cue
- **Level:** Unit
- **Method:** Validate parser/domain expectations offline using deterministic fixture metadata.
- **Evidence:** No network/provider claim is inferred.

### DEMO-F40-INT — Cue flag disabled
- **Scenario:** Server gate is false
- **Expected:** Cue panel unavailable with rationale
- **Boundary:** No fabricated cue
- **Level:** Integration
- **Method:** Run through test storage, provider adapter and persistence with synthetic inputs.
- **Evidence:** Record model/config, request ID and actual outcome.

### DEMO-F40-E2E — Cue flag disabled
- **Scenario:** Server gate is false
- **Expected:** Cue panel unavailable with rationale
- **Boundary:** No fabricated cue
- **Level:** Demo/E2E
- **Method:** Play the result in UI and inspect report/source navigation.
- **Evidence:** Only actual observed outputs are shown.

## Suggested screen walkthrough

1. Open Overview and show real saved data/counts.
2. Select the labelled synthetic recording and show accepted media metadata.
3. Run recorded transcription and wait for actual backend stage state.
4. Click a transcript time to open the audio at that interval.
5. Inspect an entity and confirm its source words are labelled unverified.
6. Inspect a possible trigger and its context; do not imply automatic dispatch.
7. Show the separate vocal cue panel only if the feasibility gate allows it; otherwise show that the feature is disabled/experimental.
8. Correct or dismiss one finding and prove that the reviewed state persists after refresh.
9. Generate report for an explicit run and compare evidence/status with the UI.
10. Explain configured retention, show a test deletion outcome and state provider-side limits honestly.
11. If live is enabled, start a new synthetic/consented live session, show actual connection/transcript, stop and finalize; if it fails, use the recorded fallback without pretending it worked.

## Evaluator questions and evidence
### DEMO-Q-01 — What exact endpoint and model ID actually worked?
- **Evidence to show:** Show sanitized request/response evidence and current-doc link
- **Avoid:** Don't rely only on the planned model name

### DEMO-Q-02 — Which clip was used?
- **Evidence to show:** Show fixture ID, authorization basis, duration and format
- **Avoid:** No sensitive real-call evidence

### DEMO-Q-03 — Where can this finding be heard?
- **Evidence to show:** Click source time and play the clip
- **Avoid:** A static timestamp without navigation is incomplete

### DEMO-Q-04 — How are claims distinguished from facts?
- **Evidence to show:** Show reported/unverified/reviewed fields
- **Avoid:** No claim becomes verified by model wording

### DEMO-Q-05 — What happens when the model is unsure?
- **Evidence to show:** Demonstrate abstention or uncertainty
- **Avoid:** No forced emotion class

### DEMO-Q-06 — How is emotion interpreted?
- **Evidence to show:** Show audio-based cue evidence and transcript-only control result
- **Avoid:** No guilt/deception inference

### DEMO-Q-07 — What if no trigger is found?
- **Evidence to show:** Show neutral no-candidate state
- **Avoid:** Don't say incident is safe

### DEMO-Q-08 — How is context handled?
- **Evidence to show:** Run negated/historical/hypothetical fixture
- **Avoid:** No keyword-only detection

### DEMO-Q-09 — What if API fails?
- **Evidence to show:** Show stable error and recorded fallback
- **Avoid:** No mock output as live result

### DEMO-Q-10 — What if live socket drops?
- **Evidence to show:** Show reconnect/partial/failed status
- **Avoid:** No fake connection

### DEMO-Q-11 — What is retained?
- **Evidence to show:** Show configured policy and actual object deletion test
- **Avoid:** Don't promise unverified deletion

### DEMO-Q-12 — Are API keys visible?
- **Evidence to show:** Explain server/short-lived auth and show secret scan
- **Avoid:** Don't reveal key itself

### DEMO-Q-13 — Can one user see another case?
- **Evidence to show:** Show denial test using two accounts
- **Avoid:** No production personal data in test

### DEMO-Q-14 — Can a finding be corrected?
- **Evidence to show:** Show original, revised value and audit event
- **Avoid:** No original destruction

### DEMO-Q-15 — What does report contain?
- **Evidence to show:** Show chosen run, evidence, caveat and reviewer state
- **Avoid:** No unreviewed finding posed as fact

### DEMO-Q-16 — How is latency reported?
- **Evidence to show:** Measure real stage times and clip length
- **Avoid:** Don't invent benchmark

### DEMO-Q-17 — How does language support work?
- **Evidence to show:** Show tested languages/limitations table
- **Avoid:** No claim of universal support

### DEMO-Q-18 — Is this for official deployment?
- **Evidence to show:** State hackathon decision-support prototype
- **Avoid:** No forensic certification claim

### DEMO-Q-19 — What happens when audio expires?
- **Evidence to show:** Show media unavailable and retained metadata separately
- **Avoid:** Don't show fake playback

### DEMO-Q-20 — How were cue quality and fairness validated?
- **Evidence to show:** Show actual sample count and limits
- **Avoid:** No statistical claims from 3 clips

### DEMO-Q-21 — 
- **Evidence to show:** undefined
- **Avoid:** undefined

## Evaluation rubric

| Dimension | Weight | Strong evidence | Weak/failing evidence |
|---|---:|---|---|
| Problem fit | 15 | Officer audio review and investigation support is core workflow | Consumer SOS app replaces speech analysis |
| Recorded pipeline | 20 | Real upload/transcription/extraction/persistence | Static fake transcript |
| Evidence quality | 15 | Findings link to phrase/time and can be corrected | Unsupported AI summary |
| Live path | 10 | Real mic/session events and correct close/recovery | Hardcoded simulated live text |
| Safety/privacy | 15 | No keys exposed, scoped access and tested retention | Public audio bucket or guilt claims |
| UI/UX | 10 | Usable evidence-centred workflow and truthful states | Decorative dashboard with dead controls |
| Evaluation | 10 | Synthetic fixture register, limitations and repeatability | Accuracy claims without references |
| Delivery/demo | 5 | Clear story, known-good fallback, reproducible steps | Demo depends on untested network/model |
| **Total** | **100** | | |

## Demo script contract

- State that the recording is synthetic/authorized before playback.
- Avoid real phone/address or personal details in the screen and report.
- Explain that transcript, extracted details and triggers are model-generated candidates.
- Show a negative/context test, not only a positive trigger, to demonstrate nuance.
- Explain the emotion output limitation and abstention behavior.
- Show an actual failure/partial state if relevant rather than pretending every call succeeds.
- State exact model ID and test conditions only if verified.
- Keep claims proportional to test sample count.
- Do not claim forensic certification, guilt detection, deception detection or autonomous emergency response.

## Fallback plan

| Failed dependency | Honest fallback | Not allowed |
|---|---|---|
| Live API unavailable | Recorded synthetic clip path | Fake live transcript |
| Vocal cue gate fails | Disable or mark experimental | Hardcoded fear/anger result |
| Provider transient error | Show failed/partial state, retry if safe | Fixed canned provider success |
| Audio playback unsupported | Explain source/player limitation; show transcript only | Fake waveform/audio |
| Report library unavailable | Printable HTML/CSV if tested | Empty file presented as report |
| Storage deletion uncertain | Mark deletion pending/failed | Claim all copies deleted |
| No trigger candidate | Neutral empty result | Label case safe |

## Pre-demo technical checklist

- [ ] Confirm deployed commit/build ID.
- [ ] Confirm exact model IDs and current API access.
- [ ] Run one real synthetic recorded clip end-to-end.
- [ ] Check timestamp seek and source evidence.
- [ ] Verify cue gate and caveat state.
- [ ] Test live session only if its gate is passed.
- [ ] Verify stop/finalization and disconnection behavior.
- [ ] Verify no secret in bundle, browser network or logs.
- [ ] Verify private media access with unauthorized account.
- [ ] Verify retention on a test object.
- [ ] Verify report matches selected run and includes limitations.
- [ ] Inspect demo data for sensitive content.
- [ ] Keep an offline copy of synthetic fixture and expected notes.
- [ ] Make clear which tests passed, failed, blocked or remain pending.

## Post-demo evidence checklist

- [ ] Capture fixture ID and actual run/model metadata.
- [ ] Save sanitized stage latency and error categories.
- [ ] Link test results to release/test matrix.
- [ ] Record evaluator feedback separately from factual product claims.
- [ ] Remove expired demo audio under policy.
- [ ] Record open defects and feature-flag decisions.

## References

- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/transcribe
- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe

## Status

This plan does not imply that a live demo was executed or that any score/feature passed. Only recorded evidence can promote a checklist item to Pass.
