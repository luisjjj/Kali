# ADR 0006: Captions and summaries

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/audit.md` section 6, `docs/unit-economics.md` section 13
- Decision needed: confirm the provider evaluation and the self-hosted agent

## Context

There are no captions or transcripts today. The brief requires live captions streamed over the data channel, a language setting, explicit evaluation of Nigerian English and Pidgin, and a post-call transcript and summary stored against the session. Cost is metered per minute and gated by plan.

Two cost structures are possible:

- A LiveKit Cloud-hosted agent adds about $0.01 per agent minute on top of speech. At 10 hours per month, that is about $6.00 before speech, which is too much for a $15 plan.
- A self-hosted agent on a small worker avoids the agent session fee and pays only for speech, about $0.15 to $0.29 per hour.

## Decision

Build a small caption agent service with a swappable speech interface:

```text
transcribe(audioStream, { language }) -> partial and final segments
```

Initial providers to evaluate:

- AssemblyAI Universal-Streaming at $0.0025 per minute.
- Deepgram Nova-3 at $0.0048 per minute.
- LiveKit Inference as a managed fallback.

Self-host the agent on a small worker (Fly, Railway, or a container in the self-host compose). It joins the session as a hidden participant with subscribe-only grants, receives audio, and publishes partial and final segments over the LiveKit data channel.

Storage:

- `transcripts` stores final segments with language, provider, and timestamps.
- `summaries` stores a post-call summary with decisions and action items.
- Retention follows the plan, same as chat and recordings.
- Transcript text is PII. Restrict access to the workspace and the session participants who are entitled.

Product behavior:

- A participant can toggle captions for themselves without forcing them on others.
- The host can enable captions for the room if the plan allows it.
- Language is selectable, with a default from the browser locale.
- If the agent is unavailable, the call continues and the UI says captions are unavailable.
- Captions are displayed as a live overlay and stored as a transcript after the call.

Evaluation:

- Build a two-hour evaluation set of Nigerian English and Pidgin audio, with clean and noisy samples.
- Measure word error rate, proper noun handling, code-switching, and latency for each provider.
- Publish the results. If Pidgin quality is poor, say so and scope the first release to Nigerian English with a clear limitation.

Plan:

- Pro includes 5 hours of live captions.
- Pro Plus includes 10 hours of captions, transcripts, and summaries.
- Additional caption hours are metered or require an upgrade.
- Live captions for accessibility may get a limited free allowance later. This is a product decision, not a default.

## Options considered

| Option | Cost | Pros | Cons |
| --- | --- | --- | --- |
| A. Browser Web Speech API | Free | No server | Chrome-only, poor accuracy, no transcript retention, no language control |
| B. LiveKit-hosted agent plus inference | about $0.75 to $0.89 per hour | Fastest to ship, managed scaling | Too expensive to bundle at $7 or $15 |
| C. Self-hosted agent plus inference STT | about $0.15 to $0.29 per hour | Affordable, provider-swappable, works in self-host | New deployable, concurrency planning |
| D. Self-hosted Whisper on GPU | GPU cost, about $0.10 to $0.30 per hour at low utilization | Private, no per-minute STT fee | Latency, GPU ops, worse streaming behavior |

Recommendation: **C**, with **B** as a short-lived development path and **D** as a self-host option later.

## Consequences

Positive:

- Captions and summaries fit the Pro Plus margin.
- The provider can change without rewriting the room.
- Transcripts and summaries attach to sessions and support retention.

Negative:

- A new service to deploy, monitor, and scale.
- Accuracy risk, especially for Pidgin and code-switching.
- Privacy risk: transcripts contain everything said in a call.
- Concurrency limits on a small worker. Plan for one worker per N concurrent rooms and backpressure.

## Cost impact

- Self-hosted agent host: $5 to $20 per month at MVP concurrency.
- Speech: $0.15 to $0.29 per hour.
- Summaries: about $0.01 to $0.05 per session.
- 10 hours included on Pro Plus: about $1.50 to $2.90, or 10 to 19 percent of the plan price.
- Hosted agent: about $7.50 to $8.90 per 10 hours, which breaks the Pro Plus margin.

## Open questions

1. Which provider wins the Nigerian English and Pidgin evaluation? Decide with data, not preference.
2. Should live captions be free for accessibility? Recommendation: a limited free allowance, reviewed after cost data.
3. Which languages ship first? Recommendation: English (Nigeria) first, then French and Swahili if the provider supports them well.
4. How long are transcripts retained? Recommendation: same as chat, 7 days on Free, 90 days on Pro, 30 days on Pro Plus for recordings, with a workspace setting.
5. Should summaries use a hosted LLM or a self-hosted model? Recommendation: hosted LLM behind an interface, with a self-host option.
