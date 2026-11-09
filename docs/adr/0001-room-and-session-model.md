# ADR 0001: Lean room and session model

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/audit.md` section 3, `docs/architecture.md` sections 4.1 to 4.3
- Decision needed: confirm that Phase 1 keeps the terminal room model and defers durable rooms and workspaces

## Context

Today a `meetings` row is both the shareable link and the live call. `meetings.ended_at` is terminal. `participants` rows are created on every token request, not on join, and `left_at` is never written. There is no distinction between a room that sits empty and a call that happened.

The brief wants durable rooms that can sit empty and be rejoined, sessions as live occurrences, participant records per session, and room-scoped messages with plan-based retention. Recording, transcripts, presence, and usage all need a stable session id, but they do not all need durable rooms on day one.

The product decision for now is simpler: ending a call ends the room. A room is single use. That keeps the current guest link, chat, screen share, and host controls intact while we add metering and the data work.

Constraints:

- Guest join by link must keep working.
- Existing chat, screen share, and host controls must keep working.
- Every schema change needs a reversible migration.
- One concern per pull request.
- Ending a call ends the room for everyone. There is no rejoin after end.

## Decision

Phase 1 keeps the current room model and adds a session record for metering:

1. **Room**: the current `meetings` row. It is the shareable link and the call. `ended_at` is terminal. Ending the call ends the room for everyone. A new call gets a new room code.
2. **Session**: a new 1:1 record for the call. It exists so webhooks, usage events, recordings, transcripts, and summaries have a stable id. It does not make the room durable.
3. **Participant**: the current `participants` row, extended with `session_id`, `left_at`, `role`, and a network summary. It is written on join and updated by webhooks.

One room has exactly one session in Phase 1. The session ends when the room ends. The LiveKit room name stays the public room code.

Deferred until a later ADR:

- Durable rooms, room types, persistent or embedded rooms.
- Personal workspaces. The host user is the billing account until team features ship.
- Cross-call chat history and room-scoped retention. Chat stays scoped to the room and call.
- Dashboard presence, lobby, invites, and room-level social features.
- Session-scoped LiveKit room names and session rotation.

Removal is lean in Phase 1. A host remove disconnects the participant and records a room ban. The old token can still reconnect until it expires, so a host who needs immediate revocation ends the call. If that gap becomes a real problem, Phase 2 can add session rotation.

## Options considered

| Option | Effort | Pros | Cons |
| --- | --- | --- | --- |
| A. Keep `meetings`, add no session record | 0.5 day | Smallest change; current behavior preserved | No stable id for usage, recordings, transcripts, or summaries; webhook work still needs one |
| B. Keep terminal `meetings`, add 1:1 `sessions` and usage tables | 2 to 3 days backend | Lean; preserves current UX; gives metering and future features a session id; no workspace migration | No durable rooms, no cross-call chat, no presence beyond the call; a future durable-room migration is still needed |
| C. Durable rooms, sessions, and a personal workspace now | 4 to 6 days backend, 2 days UI | Matches the full brief; unlocks presence, recording, usage, and plan limits; one migration | Delays Phase 1; dual-write and backfill; ending a call would not end the room, which the product does not want yet |

Recommendation: **B**. It is the smallest model that still lets us meter, enforce plans, and add recordings and captions later. It keeps the end-call behavior users already understand.

## Consequences

Positive:

- End call keeps its current meaning: the room is over.
- Every call has a session id for usage, recordings, transcripts, and summaries.
- Guest links, chat, screen share, and host controls keep working.
- No workspace or room-type migration in Phase 1.
- The schema change is small enough to test and reverse.

Negative:

- No durable rooms, so no rejoin, no cross-call chat, and no dashboard presence.
- A room code is single use; hosts create a new room for the next call.
- Billing is tied to the host user until workspaces exist.
- Removal cannot revoke an already-issued token; ending the call is the hard revocation path.
- Phase 3 still needs a durable-room migration, but it will be a deliberate product change, not a hidden one.

Compatibility:

- Existing room codes remain valid and become the room code and LiveKit room name.
- `POST /api/livekit/token` and `/api/meetings/*` stay.
- `messages` stay scoped to the meeting id.
- The client keeps the current ended screen.

## Migration

1. Baseline the current three tables with an idempotent SQL migration. Stop using `db:push`.
2. Add `sessions`, `usage_events`, `webhook_events`, `room_bans`, `plans`, and `entitlements` keyed by host user id. Add nullable `session_id`, `left_at`, `role`, and network columns to `participants`. No destructive changes.
3. Create one session per new meeting when the first token is issued. Backfill one `legacy` session for each existing meeting that has participants, using the earliest join and `meetings.ended_at`.
4. Write sessions, participants, and usage events behind a flag. Keep the current read path until the new path is verified.
5. Drop nothing in Phase 1. The down path is the flag plus a snapshot.

## Cost impact

- One session row per call and one participant row per real join. The volume is small.
- No extra LiveKit cost. The LiveKit room name is unchanged.
- No Redis or worker cost for presence in Phase 1. The deadline worker still runs for the call cap.
- The migration is cheaper than option C: no rooms, workspaces, room members, invites, or dual-write of messages.

## Open questions

1. Should the session row be created on token issuance or on the first join? Recommendation: token issuance, then expire the session if no join arrives within 5 minutes.
2. Should the room code be reusable after end? Recommendation: no, not until durable rooms. A new call gets a new code.
3. Should chat be readable after the call ends? Recommendation: keep the current read path for the ended screen. Cross-call history waits for durable rooms.
4. When should workspaces arrive? Recommendation: with team seats or billing, whichever comes first. Use the host user as the billing account until then.
