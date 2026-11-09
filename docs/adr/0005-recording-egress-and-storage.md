# ADR 0005: Recording, Egress, and storage

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/audit.md` section 7, `docs/unit-economics.md` section 12
- Decision needed: confirm R2 and the Pro Plus recording bundle

## Context

Pro Plus lists recordings, but no recording code exists. The brief requires server-side recording through LiveKit Egress to object storage, with lifecycle rules and per-plan retention. Recording is the most expensive feature in the unit model: about $1.21 per hour of video, dominated by Egress transcode at $0.02 per minute.

Client-side recording is not acceptable for a paid promise. It depends on the tab staying open, varies by device, and cannot record a room reliably.

## Decision

Use LiveKit Egress:

- **Video recording**: room composite Egress, 720p, 30 fps, H.264 MP4, audio mixed.
- **Audio-only recording**: track Egress for the mixed audio or per-participant audio, depending on the use case.
- **Storage**: Cloudflare R2 in production, MinIO for self-host, S3-compatible interface.
- **Retention**: 30 days on Pro Plus by default, configurable per workspace, with a lifecycle rule that deletes expired objects.
- **Access**: signed, short-lived download URLs. Buckets are private.
- **Consent**: a visible banner when recording starts, a participant notification, and a host-only control.
- **Lifecycle**: `egress_started` creates the row, `egress_updated` updates progress, `egress_ended` finalizes duration, size, storage key, and retention.
- **Plan**: Pro Plus includes 3 hours of video recording per month. Additional hours are metered at $3 per hour. Audio-only recording is a separate, cheaper add-on.
- **Self-host**: Egress and MinIO are optional compose services. Recording is disabled if they are not configured.

Recording must never block a call. If Egress is unavailable, the call continues and the host sees a clear "recording unavailable" message.

## Options considered

| Option | Cost | Pros | Cons |
| --- | --- | --- | --- |
| A. Client MediaRecorder | Free | No server cost, simple | Tab must stay open, quality varies, cannot capture all participants reliably, no server truth |
| B. LiveKit Egress to R2 | $0.02/min video, $0.015/GB-month, no egress fee | Reliable, server-side, S3-compatible, cheap storage egress | Transcode cost, Egress concurrency limits |
| C. LiveKit Egress to S3 | $0.02/min plus about $0.023/GB-month and egress | Mature ecosystem | Higher storage and egress cost, more setup |
| D. Self-hosted Egress to MinIO | Compute and bandwidth only | Cheapest at scale, private | Operational burden, Chrome in containers, scaling |

Recommendation: **B** for hosted, **D** as the self-host path.

## Consequences

Positive:

- Recording is reliable and attachable to a session.
- Retention and deletion are enforceable.
- R2 keeps storage egress free, which matters for downloads and playback.

Negative:

- Video recording is expensive. It cannot be unlimited on any plan.
- Egress needs capacity planning and concurrency limits.
- Consent, retention, and deletion add product and legal work.
- R2 credentials must be scoped to a bucket and rotated.

## Cost impact

| Item | Cost |
| --- | --- |
| 1 hour video Egress | $1.20 |
| 1 hour video storage at 0.6 GB | about $0.009 per month |
| 3 hours included on Pro Plus | about $3.63 |
| 1 hour audio track Egress | $0.06 |
| 3 hours of audio storage | negligible |

At $3 per additional video hour, the gross margin is about 60 percent before payment fees. Do not bundle more than 3 hours on the $15 plan without re-running the model.

## Open questions

1. Should the default layout be speaker view, grid, or a custom layout? Recommendation: grid with active speaker emphasis.
2. Should screen share be included in the composite? Recommendation: yes for video, with a separate track option later.
3. Is 30 days the right default retention? Recommendation: 30 days, with 90 days as a Pro Plus option if storage cost stays low.
4. Should participants be able to request a copy? Recommendation: host-controlled download link only in the first release.
5. Is per-participant local recording part of Creator mode? Recommendation: defer to Phase 6, and treat it as an upload feature with its own bandwidth cost.
