# ADR 0003: Webhooks, presence, and metering

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/audit.md` sections 5 and 6, `docs/architecture.md` sections 4.4 to 4.6
- Decision needed: confirm Redis and the worker hosting model

## Context

There are no LiveKit webhooks. Session records are inferred from token requests. `participants.left_at` is never written. Presence is not shown on the dashboard. Ended calls are detected by polling the app database every 15 seconds. The one-hour cap is enforced by a client timer and a best-effort `expire` endpoint, while the token remains valid for six hours.

Without webhooks there is no reliable answer to: who joined, when did they leave, how long did the call last, how many participant minutes were used, and is the room live right now.

## Decision

### Webhook receiver

Add `POST /api/v1/webhooks/livekit`:

- Verify every request with the LiveKit `WebhookReceiver`.
- Store every event in `webhook_events`, keyed by the provider event id.
- Process idempotently in a transaction; duplicates are no-ops.
- Handle `room_started`, `room_finished`, `participant_joined`, `participant_left`, `track_published`, `track_unpublished`, `egress_started`, `egress_updated`, and `egress_ended`.
- Ignore stale updates using the event timestamp.
- Return 5xx on processing failure so LiveKit retries.
- Keep the raw payload for 30 days for replay and debugging, with restricted access.

The receiver records; the worker does slow work. Recording finalization, transcript processing, and usage rollups are queued.

### Session enforcement

- A session gets a `deadline_at` from the room policy and plan entitlements.
- A worker runs every minute and calls `RoomService.deleteRoom` for expired sessions.
- The client timer stays for the countdown and reminder, but it is not enforcement.
- Host end sets `ended_at` and deletes the room immediately.
- The `room_finished` webhook closes open participant rows and computes minutes.

Hosted recommendation: Vercel Pro cron at one-minute granularity. Self-host: a worker container.

### Presence

- Webhooks update `presence:<roomId>` in Redis with a 90-second TTL.
- The client sends a heartbeat every 30 seconds.
- `participant_left` removes the entry immediately.
- `GET /api/v1/rooms/:slug/presence` is a Server-Sent Events stream. The server reads Redis and pushes diffs every 5 seconds, or uses Redis pub/sub when available.
- If Redis is down, fall back to a 10-second Postgres query with a short cache. The call never depends on presence.

In-room participant lists still come from LiveKit. Presence is for the dashboard, the room page before joining, and the lobby.

### Metering

- `usage_events` is append-only and idempotent.
- Participant minutes come from join and leave times, with a heartbeat fallback for crashed clients.
- Recording and transcript minutes come from provider events.
- API participant minutes come from embed sessions.
- A daily reconciliation compares database totals with LiveKit's usage dashboard and flags drift above 2 percent.

## Options considered

### Presence

| Option | Cost | Pros | Cons |
| --- | --- | --- | --- |
| A. Postgres polling every 10 to 15 seconds | No new vendor | Simple, works today | O(clients) queries, stale, no dashboard scale |
| B. Webhooks plus Redis TTL plus SSE | About $10/mo at MVP | Low latency, cheap, survives crashes via TTL | New dependency, SSE reconnect handling |
| C. LiveKit data channel only | Free | Instant in-room | No dashboard or lobby presence, no offline state |

Recommendation: **B**, with a Postgres fallback. Use LiveKit's participant list for the in-call UI.

### Enforcement

| Option | Cost | Pros | Cons |
| --- | --- | --- | --- |
| A. Client timer plus `expire` | Free | Already built | Bypassable, no enforcement if everyone disconnects |
| B. Deadline worker plus `deleteRoom` | Vercel Pro or a small worker | Server-authoritative, one-minute granularity | New job infrastructure |
| C. Custom LiveKit patch or plugin | High | Exact | Not a LiveKit primitive, maintenance burden |

Recommendation: **B**.

### Worker hosting

| Option | Cost | Pros | Cons |
| --- | --- | --- | --- |
| A. Vercel Pro cron | $20/mo | No new service, easy deploy | One-minute minimum, function duration limits |
| B. Always-on worker on Fly or Railway | $5 to $20/mo | Long jobs, retries, works for self-host | Another deploy target |
| C. Database-only scheduled queries | Low | Simple | No reliable scheduler |

Recommendation: **A** for the hosted MVP, **B** for self-host and for heavy reconciliation later.

## Consequences

Positive:

- One source of truth for sessions, presence, and usage.
- The cap is enforced even if the client is modified.
- Recording and transcripts can attach to a session.
- Usage becomes billable and auditable.

Negative:

- A public webhook endpoint must be protected and monitored.
- Event ordering and duplicates need tests.
- Raw payloads contain participant names and IP-related data. Retention and access must be tight.
- Redis is a new failure mode. It must never take down a call.

## Cost impact

- Upstash Redis: about $10/mo at MVP.
- Vercel Pro: $20/mo, also required for minute cron and better observability.
- Worker: $0 to $20/mo.
- Database writes: a few rows per participant event, negligible.
- No LiveKit webhook fee.

## Open questions

1. Upstash Redis or a self-hosted Redis container? Recommendation: Upstash for hosted, Redis container for self-host.
2. Should raw webhook payloads be kept for 30 days or 7? Recommendation: 7 days for PII minimization, with sampled payload retention for debugging.
3. Should the deadline worker delete the room or revoke publish grants first? Recommendation: delete, then let `room_finished` close records.
4. Is a one-minute cron precise enough for a 60-minute limit? Recommendation: yes, with a client-side reminder at 55 minutes.
