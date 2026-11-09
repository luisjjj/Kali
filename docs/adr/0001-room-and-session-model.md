# ADR 0001: Durable rooms and session records

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/audit.md` section 3, `docs/architecture.md` sections 4.2 and 4.3
- Decision needed: confirm the schema shape and the timing of workspaces

## Context

Today a `meetings` row is both the shareable link and the live call. `meetings.ended_at` is terminal. `participants` rows are created on every token request, not on join, and `left_at` is never written. There is no distinction between a room that sits empty and a call that happened.

The brief requires durable rooms that can sit empty and be rejoined, sessions as live occurrences, participant records per session, and room-scoped messages with plan-based retention. Recording, transcripts, presence, and usage all need a session id.

Constraints:

- Guest join by link must keep working.
- Existing chat, screen share, and host controls must keep working during the migration.
- Every schema change needs a reversible migration.
- One concern per pull request.

## Decision

Introduce three concepts:

1. **Room**: the durable space. It has a slug, a name, a type (`instant`, `persistent`, or `embedded`), a visibility (`public`, `unlisted`, or `private`), an owner and/or workspace, and a validated policy object.
2. **Session**: one live occurrence of a room. It has a unique LiveKit room name, a status, `started_at`, `ended_at`, `deadline_at`, `peak_participants`, and `minutes_by_participant`.
3. **Session participant**: one identity in one session, with join and leave times, a role, and a network summary.

A room can have many sessions. Ending a session never deletes or disables the room. An instant room archives after 30 days without a session, but it can be restored. A persistent room stays until the owner archives or deletes it.

Every signed-in host gets a personal workspace on first sign-in, created behind the scenes. Rooms belong to that workspace, or to a team workspace later. The UI can stay host-centric; the data model is ready for billing and seats.

LiveKit room names are session-scoped: `<room-slug>--<session-short-id>`. The public URL keeps the room slug. The token's `room` claim points at the session-scoped name. This is what makes immediate bans possible without rotating API keys.

## Options considered

| Option | Effort | Pros | Cons |
| --- | --- | --- | --- |
| A. Keep `meetings`, reset `ended_at` on rejoin | 1 day | Smallest change | No session history, no per-occurrence recording or usage, race conditions on reset, presence still impossible |
| B. Add rooms, sessions, session participants, personal workspace | 4 to 6 days backend, 2 days UI and migration | Matches the brief, unlocks presence, recording, usage, and plan limits; reversible | Dual-write during migration, more tables, a one-time backfill |
| C. Full workspace-first model now (workspaces, members, roles, invites, seats) | 2 to 3 weeks | No later workspace migration | Delays Phase 1, adds UI complexity before it is needed |

Recommendation: **B**, with a personal workspace created from day one. It avoids the painful workspace migration later without building team UI now.

## Consequences

Positive:

- A room survives an empty call and can be rejoined.
- Every call has a session id that recordings, transcripts, summaries, and usage can reference.
- Presence and "3 in the study room" become possible.
- Ending a call is no longer destructive.
- Plan limits can be attached to a workspace.

Negative:

- The migration is the riskiest part of Phase 1. It needs a flag, a backfill, and a rollback plan.
- The client and API must move from `meeting` language to `room` and `session` language. Keep a compatibility adapter.
- Hosts may be confused by "end call" versus "delete room". The UI must make the distinction clear.

Compatibility:

- Existing room codes remain valid and become instant room slugs.
- `POST /api/livekit/token` and `/api/meetings/*` stay as aliases until the cutover is verified.
- Messages move from meeting scope to room scope with an optional session id. Old messages are backfilled to their room.

## Migration

1. Baseline the three current tables with an idempotent SQL migration. Stop using `db:push`.
2. Add the new tables. No destructive changes.
3. Backfill each meeting into a room and one legacy session. Collapse duplicate participant rows by `(meeting, identity, day)` and mark them `legacy`.
4. Dual-write behind `DATA_MODEL=v2`.
5. Cut over reads gradually.
6. Drop the legacy tables after two releases, after a Neon branch snapshot.

The down path is the feature flag plus the snapshot, not an in-place destructive rewrite.

## Cost impact

Database rows grow, but the volume is small: a room, a session per call, and one participant row per real join. Session-scoped LiveKit room names have no extra provider cost. Personal workspaces add one row per user.

## Open questions

1. Should the personal workspace be visible in the UI from day one, or hidden until team features ship? Recommendation: hidden, with a settings page later.
2. Is 30 days the right archive window for an unused instant room? Recommendation: 30 days, with a restore option.
3. Can guests create rooms? Recommendation: no in Phase 1. Guests join by link. Guest-created rooms can be added with a stricter policy later.
4. Should persistent rooms use human-readable slugs or the existing three-group code? Recommendation: human-readable slug for persistent rooms, keep the code format for instant rooms, and keep a unique alias map.
