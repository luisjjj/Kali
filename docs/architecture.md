# Kali target architecture

- Status: proposed for Phase 0 review
- Date: 2026-11-09
- Related: `docs/adr/*`, `docs/audit.md`, `docs/unit-economics.md`

## 1. Design tenets

1. **The server owns permissions and time.** The UI is a convenience. Every token, room policy, duration, recording, transcript, and plan limit is resolved on the server.
2. **Media stays on LiveKit.** No media through Vercel, no custom SFU, no custom TURN, no custom signaling.
3. **A room is durable; a session is disposable.** The link people share is a room. A call is a session inside it. Ending a call does not kill the room.
4. **Webhooks are the source of truth for what happened.** Token requests express intent. Webhooks record reality. Usage and presence derive from events, not from polling the media server.
5. **Every feature declares its bandwidth and infrastructure cost.** A feature that cannot be metered cannot be priced.
6. **Additive, reversible migrations.** Guest join, chat, screen share, and host controls keep working during every step.
7. **Low-data is a measured property, not a marketing claim.** Profiles ship with a harness and published numbers.

## 2. Context

```text
                    +-----------------------------+
                    |  Browser, Electron, embed   |
                    +--------------+--------------+
                                   |
                    HTTPS API      |      WebRTC media
                                   v              |
                    +-----------------------------+     +----------------+
                    |  Next.js app on Vercel      |     |  LiveKit Cloud |
                    |  control plane              |---->|  or self-host  |
                    +----+----------+----------+-----+     +--------+-------+
                         |          |          |                    |
                         v          v          v                    v
                    Postgres    Redis     Object storage       Egress / Agents
                    (Neon)      (presence, (R2 or MinIO)        (record, captions)
                                limits)
                         ^
                         |
                    Webhooks, cron worker, billing webhooks
```

The control plane is the Next app plus Postgres, Redis, webhooks, and scheduled jobs. The data plane is LiveKit, Egress, Agents, and object storage. Media never traverses the control plane.

## 3. Components

| Component | Responsibility | Hosted | Self-host |
| --- | --- | --- | --- |
| Web app | Lobby, room UI, dashboard, marketing, embed page | Vercel | Next standalone container |
| API v1 | Tokens, rooms, presence, messages, billing, admin | Vercel functions | same container |
| Webhook receiver | LiveKit and payment events, idempotent | Vercel function | same container |
| Session worker | Deadline enforcement, stale presence, usage rollup, reconciliation | Vercel cron (1 minute) | worker container |
| Postgres | Durable state and usage ledger | Neon | Postgres 16 |
| Redis | Presence TTL, rate limits, short caches | Upstash | Redis 7 |
| Object storage | Recordings, transcripts, exports | Cloudflare R2 | MinIO |
| LiveKit | SFU, TURN, room lifecycle | LiveKit Cloud | LiveKit server |
| Egress | Room and track recording | LiveKit Cloud | Egress container |
| Agent | Captions and summaries | Small worker (Fly/Railway) | Agent container |
| Billing | Paystack and Stripe adapters | Paystack, Stripe | disabled by default |

The worker is not optional. Client timers cannot enforce a duration, and Vercel cron on the Hobby plan runs at most once per day. Production needs Vercel Pro (minute cron) or an always-on worker.

## 4. Control plane

### 4.1 Token service

All media access goes through `POST /api/v1/rooms/:slug/tokens`.

Inputs:

- Session cookie for signed-in users, or an invite token, or a guest name for public rooms.
- Optional `profile` hint (`normal`, `saver`, `audio`). The server may lower it, never raise it above the room or plan limit.
- Optional `embedToken` for the embed surface.

Resolution order:

1. Rate limit by IP, user, room, and workspace.
2. Resolve the room by slug and check `archived_at` and `deleted_at`.
3. Resolve the caller: workspace member, invited guest, or public guest.
4. Check the ban list for this room and identity.
5. Resolve role: owner, cohost, member, or guest.
6. Resolve the room policy and the workspace entitlements.
7. Find or create the live session for the room, under a Postgres advisory lock on `room_id`.
8. Check the session deadline, participant cap, and plan limits.
9. Mint a LiveKit token scoped to the session's LiveKit room name.
10. Return the token, server URL, identity, role, session id, deadline, policy, and ICE configuration if LiveKit requires it.

Token claims:

- `room`: session-scoped LiveKit room name, not the public slug.
- `identity`: stable per user (`user-<id>`) or per guest connection (`guest-<uuid>`).
- `name`: display label only, never an authorization input.
- `ttl`: 2 hours for normal calls, 15 minutes for embed tokens. A long call may reconnect once at the TTL boundary. Session rotation is the immediate revocation path.
- Grants: `roomJoin`, `canSubscribe`, `canPublish`, `canPublishData` for all roles. `roomAdmin` only for owner and cohost. `canPublishSources` can be narrowed for audio-only or view-only roles later.
- Metadata: `{ role, sessionId, userId?, guest: boolean }` for client UI and server-side webhook correlation.

Why session-scoped room names: a ban can end the session and create a new LiveKit room with a new name. The banned token is bound to the old name and cannot be used to rejoin. This closes the "removed but reconnects" gap without rotating API keys.

### 4.2 Room service

A room owns:

- `slug` (memorable, unique, used in the URL)
- `name`
- `room_type`: `instant`, `persistent`, or `embedded`
- `visibility`: `public`, `unlisted`, or `private`
- `owner_user_id` and/or `workspace_id`
- `policy` JSON, validated by Zod:
  - `max_participants`
  - `max_duration_minutes` (null means no per-call cap)
  - `default_profile`
  - `allow_recording`
  - `allow_captions`
  - `allow_guests`
  - `lobby_enabled`
  - `chat_retention_days`
  - `mode` (`standard`, `study`, `creator`; the mode registry from the brief)
- `archived_at` and `deleted_at`

Lifecycle:

- **Instant room**: created by a signed-in host, joinable by link, persists for 30 days after the last session, then archives. It can be rejoined while active.
- **Persistent room**: created by a host or workspace, sits empty indefinitely, appears on the dashboard with presence, supports invites and a lobby.
- **Embedded room**: created through the API by a workspace, used only through the embed surface, policy controlled by the API caller.

The room service also owns invites (`room_invites`), bans (`room_bans`), and the room-level audit log.

### 4.3 Session lifecycle

A session is one live occurrence of a room.

States: `pending`, `live`, `ended`, `expired`.

1. Token issuance creates a `pending` session with a unique LiveKit room name and a deadline.
2. The first `participant_joined` webhook moves it to `live` and sets `started_at`.
3. Presence heartbeats and webhooks keep participant rows current.
4. A host end, the deadline worker, or `room_finished` moves it to `ended`.
5. A `pending` session with no join within 5 minutes becomes `expired`.

The deadline is `started_at + min(room policy, plan limit)`. If there is no cap, the deadline is the maximum session length allowed by the plan, or null for unlimited. The worker runs every minute, finds `deadline_at < now()`, calls `RoomService.deleteRoom`, and lets the webhook close the session. The client timer remains for UX, but it is not the enforcement.

### 4.4 Webhooks

`POST /api/v1/webhooks/livekit`:

- Verify with `WebhookReceiver` and the API key/secret. Reject unsigned or invalid requests.
- Store every event in `webhook_events` keyed by the LiveKit event id. Duplicate delivery is a no-op.
- Process in a transaction, then mark `processed_at`.
- Handle `room_started`, `room_finished`, `participant_joined`, `participant_left`, `track_published`, `track_unpublished`, `egress_started`, `egress_updated`, `egress_ended`.
- Use event timestamps to ignore stale updates.
- Store the raw payload for 30 days for debugging. Treat it as PII and restrict access.
- On processing failure, return 5xx so LiveKit retries. After the retry window, alert and replay from the stored payload.

The receiver does not block on slow work. Recording finalization, transcript processing, and usage rollups are queued as database jobs or handled by the worker.

### 4.5 Presence

Presence has two layers:

- **In-room**: LiveKit's participant list is authoritative for the call UI.
- **Room-level and dashboard**: webhooks write `presence:<roomId>` hashes in Redis with a 90-second TTL. The client heartbeat (`POST /api/v1/rooms/:slug/heartbeat` every 30 seconds) refreshes the TTL. `participant_left` removes the entry immediately.
- `GET /api/v1/rooms/:slug/presence` is a Server-Sent Events stream. The server reads Redis and pushes diffs every 5 seconds, or subscribes to a Redis pub/sub channel if available. SSE connections reconnect with `Last-Event-ID`. If Redis is unavailable, fall back to a 10-second Postgres query with a short cache; the call itself never depends on presence.

Presence entries: `{ identity, displayName, role, joinedAt, lastSeen }`. No email or user id is exposed to other participants.

### 4.6 Metering and entitlements

`usage_events` is append-only:

- `participant_minute`
- `recording_minute`
- `transcript_minute`
- `storage_byte_hour`
- `api_participant_minute`

Each event has an idempotency key (`livekit:<eventId>` or `session:<id>:participant:<identity>:<minute>`), a workspace id, a session id, a quantity, and a timestamp.

Participant minutes are computed from `participants.joined_at` and `left_at`, with a heartbeat fallback for crashed clients. LiveKit's own usage dashboard is the reconciliation source, not the primary meter.

Entitlements resolve from the workspace plan plus overrides:

```text
resolveEntitlements(workspaceId) -> {
  maxParticipants, maxDurationMinutes, recordingMinutes, transcriptMinutes,
  retentionDays, customDomains, apiParticipantMinutes, seats
}
```

Enforcement points:

- Token issuance: participant cap, duration cap, recording/caption permissions.
- Recording start: remaining recording minutes and storage policy.
- Caption start: remaining transcript minutes.
- Message read/write: retention window and room status.
- Invites and API keys: seat and API limits.
- Embed: participant minutes and origin allowlist.

The token response includes the resolved policy so the client can render the right UI, but the client never decides entitlement.

## 5. Data plane

### 5.1 Video

- Normal: 720p30 capture, VP9 SVC with VP8 simulcast fallback, 2.5 Mbps top layer, `maintain-framerate`, adaptive stream, dynacast.
- Data saver: 240p at 12 to 15 fps, about 200 kbps video, 24 kbps audio. 360p is an adaptive step at about 350 kbps, not the default for the 100 MB per hour target.
- Audio only: no camera, no screen share, 24 kbps Opus, DTX, RED.
- Screen share: 1.5 Mbps in saver, 3 Mbps in normal, 15 fps, high layer pinned only when the viewer can afford it.
- Fallback: sustained loss or low available bitrate triggers a suggestion after 10 seconds. Auto-switch only when the user has enabled it or the room policy says so. Recover with hysteresis, not a flip-flop.

### 5.2 Recording

- LiveKit Egress room composite for video and audio, track egress for audio-only.
- Storage in R2 (hosted) or MinIO (self-host), with a per-plan retention lifecycle.
- Host-only start and stop, visible consent banner, participant notification.
- `recordings` rows are created on `egress_started` and finalized on `egress_ended`.
- Signed, short-lived download URLs. No public bucket.

### 5.3 Captions and summaries

- A small agent worker joins as a hidden participant, subscribes to audio, and streams partial and final transcript segments over the data channel.
- The speech provider sits behind an interface (`transcribe(stream) -> segments`). Initial candidates: AssemblyAI Universal-Streaming, Deepgram Nova-3, LiveKit Inference. Self-host can use a local Whisper container.
- Transcript segments are stored against the session with language and provider metadata.
- A post-call summary job turns the transcript into decisions and action items.
- Captions degrade gracefully: if the agent is down, the call continues without captions and the UI says captions are unavailable.

Cost note: a LiveKit Cloud-hosted agent adds about $0.01 per agent minute on top of speech. Self-hosting the agent avoids that and is required for the Pro Plus margin in the current model.

## 6. Target schema

Names follow the brief where practical. `session_participants` is the brief's `participants` per session; the name avoids colliding with the current `participants` table during migration.

```text
users
  id text pk (Neon Auth subject or Better Auth id)
  display_name text
  email text null
  created_at, deleted_at

workspaces
  id uuid pk
  name text
  slug text unique
  owner_user_id text
  created_at, deleted_at

workspace_members
  workspace_id uuid fk
  user_id text fk
  role owner | admin | member
  created_at
  pk (workspace_id, user_id)

rooms
  id uuid pk
  workspace_id uuid null
  owner_user_id text null
  slug text unique
  name text
  room_type instant | persistent | embedded
  visibility public | unlisted | private
  policy jsonb
  created_at, archived_at, deleted_at
  check (workspace_id is not null or owner_user_id is not null)

room_invites
  id uuid pk
  room_id uuid fk
  token_hash text unique
  role guest | member
  expires_at, max_uses, uses
  created_by text
  created_at

sessions
  id uuid pk
  room_id uuid fk
  livekit_room_name text unique
  status pending | live | ended | expired
  started_at, ended_at, deadline_at
  peak_participants int
  minutes_by_participant jsonb
  end_reason text
  created_at

session_participants
  id uuid pk
  session_id uuid fk
  identity text
  user_id text null
  display_name text
  role owner | cohost | member | guest
  guest boolean
  joined_at, left_at
  minutes numeric
  network_summary jsonb
  created_at
  unique (session_id, identity)

messages
  id uuid pk
  room_id uuid fk
  session_id uuid null
  sender_user_id text null
  sender_name text
  body text
  created_at, deleted_at

recordings
  id uuid pk
  session_id uuid fk
  egress_id text unique
  status text
  layout text
  storage_driver text
  storage_key text
  duration_seconds int
  size_bytes bigint
  started_at, ended_at
  retention_until
  created_at

transcripts
  id uuid pk
  session_id uuid fk
  language text
  provider text
  status text
  segments jsonb
  minutes numeric
  created_at

summaries
  id uuid pk
  session_id uuid fk
  model text
  text text
  created_at

plans
  code text pk (free, pro, pro_plus)
  name text
  price_naira int
  price_usd int
  limits jsonb
  active boolean

subscriptions
  id uuid pk
  workspace_id uuid fk
  plan_code text fk
  provider paystack | stripe
  provider_ref text unique
  status active | past_due | canceled | trialing
  current_period_start, current_period_end, cancel_at
  created_at

entitlements
  id uuid pk
  workspace_id uuid fk
  key text
  value jsonb
  source plan | override | trial
  expires_at
  unique (workspace_id, key)

usage_events
  id bigserial pk
  workspace_id uuid fk
  session_id uuid null
  kind participant_minute | recording_minute | transcript_minute | storage_byte_hour | api_participant_minute
  quantity numeric
  occurred_at
  idempotency_key text unique
  metadata jsonb

webhook_events
  id text
  provider livekit | paystack | stripe
  type text
  payload jsonb
  received_at, processed_at, attempts, error
  unique (provider, id)

api_keys
  id uuid pk
  workspace_id uuid fk
  name text
  key_hash text unique
  prefix text
  scopes text[]
  last_used_at, created_at, revoked_at

room_bans
  id uuid pk
  room_id uuid fk
  identity text null
  user_id text null
  created_by text
  created_at, expires_at

reports
  id uuid pk
  room_id uuid fk
  reporter_user_id text null
  target_identity text
  reason text
  created_at, status

audit_log
  id bigserial pk
  workspace_id uuid null
  actor_user_id text null
  action text
  target text
  metadata jsonb
  created_at
```

Indexes:

- `rooms(slug)` unique
- `sessions(room_id, status)`, `sessions(deadline_at)` where status in (`pending`, `live`)
- `session_participants(session_id, identity)` unique, `session_participants(session_id)`
- `messages(room_id, created_at desc)`
- `usage_events(workspace_id, occurred_at)`, `usage_events(session_id)`
- `subscriptions(workspace_id)`, `entitlements(workspace_id, key)`
- `webhook_events(provider, processed_at)`
- `room_bans(room_id, identity)`

## 7. API surface

Public app:

- `POST /api/v1/rooms` create a room
- `GET /api/v1/rooms/:slug` public room metadata and policy
- `PATCH /api/v1/rooms/:slug` update policy (owner)
- `POST /api/v1/rooms/:slug/tokens` mint a join token
- `POST /api/v1/rooms/:slug/heartbeat` presence refresh
- `GET /api/v1/rooms/:slug/presence` SSE presence
- `GET|POST /api/v1/rooms/:slug/messages` chat history and send
- `POST /api/v1/rooms/:slug/end` end the live session (host)
- `POST /api/v1/rooms/:slug/ban` ban an identity (host)
- `POST /api/v1/rooms/:slug/recordings` start or stop recording (host, entitled)
- `POST /api/v1/rooms/:slug/captions` start or stop captions (host or participant, entitled)
- `GET /api/v1/rooms/:slug/transcript` fetch a transcript (entitled)
- `POST /api/v1/rooms/:slug/summary` generate or fetch a summary (entitled)

Service-to-service:

- `POST /api/v1/services/rooms` create an embedded room with an API key
- `POST /api/v1/services/rooms/:id/embed-tokens` mint a short-lived embed token
- `GET /api/v1/services/rooms/:id` room status and usage
- `DELETE /api/v1/services/rooms/:id` close an embedded room
- `POST /api/v1/webhooks/livekit`
- `POST /api/v1/webhooks/paystack`
- `POST /api/v1/webhooks/stripe`

Compatibility:

- Keep `/api/meetings/*` and `/api/livekit/*` as aliases during the migration. They call the same service layer. Remove them after two releases and a verified cutover.
- Keep the existing `roomCode` format (`xxx-xxx-xxx`) for instant rooms so old links keep working. New persistent rooms may use memorable slugs, with a migration map from old codes.

## 8. Security boundaries

- LiveKit API secret and database URL are server-only. Never expose them in `NEXT_PUBLIC_*`.
- API keys are stored as hashes, shown once, scoped per workspace, and rate limited.
- Embed tokens are short-lived (15 minutes), one room, one role, and one origin.
- CSP and `frame-ancestors` allow the app origin plus the workspace's verified embed origins.
- `Permissions-Policy` allows camera, microphone, display capture, and fullscreen only for the app and verified embed origins.
- Host actions write to `audit_log`.
- Rate limits: token mint, room create, chat send, invite accept, report, and API key use.
- Ban flow: add to `room_bans`, remove the participant, end the session, create a new session with a new LiveKit room name, and issue new tokens to remaining participants. The banned token is bound to the old room name.
- Data deletion: account deletion removes profile and auth identity, anonymizes messages (or deletes them per retention), deletes recordings and transcripts, and keeps billing records for the legally required period.
- Fail closed in production: missing `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `DATABASE_URL`, or LiveKit credentials must stop the app from serving, not fall back to placeholders.

## 9. Observability and SLOs

Structured logs (JSON) with:

- `request_id`, `route`, `status`, `duration_ms`
- `workspace_id`, `room_id`, `session_id`, `participant_identity_hash`
- `event` for webhook type and processing time
- no raw email, token, or message body

Metrics:

- Token latency p50/p95, token error rate by reason
- Join success rate and time to first remote frame (client event)
- Per-session packet loss, jitter, RTT, bitrate, freeze rate, profile
- Webhook lag and failure rate
- Egress start failures, recording minutes, storage bytes
- Caption latency and provider errors
- Free-tier participant minutes per workspace
- Billing webhook failures and entitlement drift

SLOs:

- Token issuance: p95 under 300 ms, 99.5% success.
- Join: p95 under 3 seconds from link click to media on a mid-range phone and 4G.
- Webhook processing: p95 under 2 seconds, zero lost events after retries.
- Presence: under 5 seconds from join to dashboard visibility.
- Calls continue when presence, captions, egress, or billing are down.

Error tracking: Sentry or OpenTelemetry, with a self-host opt-out. Start with structured logs plus a small internal dashboard; add a vendor when the first real users arrive.

## 10. Testing

- Unit: entitlement resolution, role-to-grant mapping, room policy validation, time math, retention cutoffs.
- Integration: token issuance for host, member, guest, banned user, cap reached, plan limit reached; webhook signature, idempotency, replay, out-of-order events; billing webhook idempotency; end and deadline worker.
- End-to-end: two browser contexts join, chat, host mute, host remove, reconnect, room persists after everyone leaves, rejoin works.
- Network harness: Chromium with CDP network emulation for bandwidth and latency; `tc netem` on Linux for 5 to 10 percent packet loss; measure bytes with `RTCPeerConnection.getStats()`. Document results per profile.
- CI: lint, typecheck, unit, integration with a Postgres service, build, and a migration check. The Windows desktop workflow stays separate.

## 11. Migration plan

The migration must not break guest join, chat, screen share, or host controls.

1. **Baseline the current schema.** Create `drizzle/0000_baseline.sql` with `CREATE TABLE IF NOT EXISTS` for `meetings`, `participants`, and `messages`; record it in the Drizzle journal. Stop using `db:push` against the shared database. Verify that Neon Auth tables are untouched.
2. **Add new tables.** `users`, `workspaces`, `workspace_members`, `rooms`, `room_invites`, `sessions`, `session_participants`, `recordings`, `transcripts`, `summaries`, `plans`, `entitlements`, `subscriptions`, `usage_events`, `webhook_events`, `api_keys`, `room_bans`, `reports`, `audit_log`. All additive. No column drops.
3. **Backfill.** For each meeting, create a `room` (slug = room code, type `instant`, owner = host), a `session` (started at the earliest participant join, ended at `meetings.ended_at`), and `session_participants` from the participant rows. Collapse duplicates by `(meeting, identity, day)` and mark them `legacy` in metadata. Backfill messages to the room. Do not lose the original rows.
4. **Dual-write behind a flag.** `DATA_MODEL=v2` makes new code write rooms, sessions, participants, and messages. Old endpoints keep working through an adapter. Reads default to v1 until the backfill is verified.
5. **Cut over reads.** Enable v2 reads for internal users, then 10 percent, then 100 percent. Keep the rollback flag for one release.
6. **Remove legacy.** After two releases, drop the old tables and columns. Take a Neon branch snapshot first. The down migration restores the old schema and data from the snapshot, not from a destructive rewrite.

Reversibility: every new table is additive; every old table remains until the final step; the feature flag is the rollback path; the snapshot is the last resort.

## 12. Delivery plan and exit criteria

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 0 | Audit, architecture, ADRs, unit economics | Docs reviewed; decisions confirmed |
| 1 | Metering and entitlements foundation, observability, webhook pipeline, sessions and participants | Webhook-driven session records; usage events; token latency and join SLOs measured; tests green; no regression in guest join, chat, or host controls |
| 2 | Low-data profiles, data meter, auto-fallback, measurement harness | Published MB per participant-hour for all three profiles on 3G with 5 to 10 percent loss; audio at or below 15 MB per hour; saver at or below 100 MB per hour or a documented reason |
| 3 | Persistent rooms, presence, knock, lobby, social layer | Room survives empty; dashboard presence under 5 seconds; guest lobby; invites; reactions and hand raise within bandwidth budget |
| 4 | Paystack, entitlements enforcement, removal of the free cap | Paid plans change limits at token issue; billing webhooks idempotent; free cap removed; no plan loses money at the modeled usage |
| 5 | Captions and summaries, embed SDK and API | Accuracy report for Nigerian English and Pidgin; captions degrade gracefully; embed demo with API keys, events, and origin allowlist |
| 6 | Self-host packaging, docs, community mode | One-command compose; app, Postgres, LiveKit, optional Egress and agent; feature flags for paid services; contribution and security docs |

## 13. Open decisions

These are the decisions with real tradeoffs. Each is documented in an ADR and should be confirmed before implementation.

1. **Schema shape:** rooms plus sessions plus a personal workspace from day one, or defer workspaces. Recommendation: personal workspace from day one, hidden in the UI.
2. **Presence cache:** Upstash Redis, or Postgres-only polling. Recommendation: Redis with a Postgres fallback.
3. **Recording storage:** Cloudflare R2, or S3. Recommendation: R2.
4. **Speech provider:** AssemblyAI, Deepgram, LiveKit Inference, or self-hosted Whisper. Recommendation: evaluate two on Nigerian English and Pidgin, keep the interface swappable, self-host the agent.
5. **Self-host auth:** keep Neon Auth only, or add a Better Auth adapter. Recommendation: add the adapter boundary in Phase 1, implement in Phase 6.
6. **Free plan cost control:** no monthly cap with monitoring, or a soft fair-use cap. Recommendation: no per-call cap, with a soft monthly fair-use cap and an 8-participant limit.
7. **Worker hosting:** Vercel Pro cron, or an always-on worker. Recommendation: Vercel Pro cron for the hosted MVP, worker container for self-host.
8. **Embed surface:** iframe first, or a Web Component. Recommendation: iframe first, headless SDK later.
