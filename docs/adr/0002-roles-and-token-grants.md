# ADR 0002: Roles, token grants, and revocation

- Status: Accepted (Phase 1 lean override applies)
- Date: 2026-11-09
- Related: `docs/audit.md` section 4, `docs/architecture.md` section 4.1
- Decision needed: confirm the role model, token lifetime, and the lean Phase 1 revocation gap

## Phase 1 lean override

ADR 0001 keeps rooms terminal in Phase 1. Until durable rooms ship:

- The token endpoint targets the current `meetings` room code. It does not use a session-scoped LiveKit room name.
- `sessionId` in token metadata points to the 1:1 session record, but the LiveKit `room` claim is the room code.
- "End session" means "End call" and ends the room.
- Remove disconnects the participant and writes a room ban. The old token can reconnect until it expires. A host who needs immediate revocation ends the call. Session rotation is deferred.
- Workspace limits are applied to the host account.

The rest of this ADR is the target for durable rooms.

## Context

The current token route derives a single `isHost` flag and mints a token with a six-hour lifetime. Hosts get `roomAdmin`; everyone else gets publish, subscribe, and data. Host-only routes re-check the session. The model has no cohost, member, or guest role, no workspace roles, and no way to revoke a token. A removed participant can reconnect with the same token for up to six hours.

The brief requires grants scoped per role (host, cohost, member, guest) and rate limiting on token and room creation. It also requires host removal that actually revokes the token.

## Decision

Create one token service at `POST /api/v1/rooms/:slug/tokens`. All media access goes through it.

Roles and grants:

| Capability | Owner | Cohost | Member | Guest |
| --- | --- | --- | --- | --- |
| Join, subscribe, publish, data | yes | yes | yes | yes |
| `roomAdmin` grant | yes | yes | no | no |
| End call | yes | yes | no | no |
| Mute or remove others | yes | yes | no | no |
| Ban identity | yes | yes | no | no |
| Change room policy | yes | no | no | no |
| Start recording | yes | yes, if entitled | no | no |
| Start captions | yes | yes | yes, if entitled | yes, if entitled |
| Invite | yes | yes | yes, if allowed | no |

The server still checks every host action on the route. The LiveKit grant is convenience and defense in depth, not the only boundary.

Token rules:

- Identity is stable for signed-in users (`user-<id>`) and random per guest connection (`guest-<uuid>`).
- Display name is a label only. It is not authorization and it is not unique.
- Normal token TTL: 2 hours.
- Embed token TTL: 15 minutes.
- The token's `room` claim is the current room code in Phase 1. It becomes a session-scoped name only when durable rooms ship.
- Metadata includes `{ role, sessionId, userId?, guest }`.
- The token response includes the resolved policy and deadline.

Revocation:

- **Remove** adds the identity to `room_bans` and removes the participant. In Phase 1 the room stays live, so the old token can reconnect until it expires. A host who needs immediate revocation ends the call, which ends the room.
- **Mute** is not removal. It changes the track state and nothing else.
- **Durable-room target:** remove ends the current session and creates a new session with a new LiveKit room name. Remaining participants receive a new token and reconnect. The removed client's old token is bound to the old room name and cannot rejoin.
- A "kick with rejoin allowed" is not offered in the first release. If it is needed later, a short ban plus the token TTL can approximate it, but it is not a security boundary.
- Because rotation reconnects everyone, the UI must warn the host. Use it for removal and bans, never for mute. Do not ship rotation until the durable-room ADR is accepted.
- The 2-hour TTL bounds the residual window in other cases, for example a leaked token for a session that is still live.

Rate limits:

- Token mint: per IP, per user, and per room.
- Room create: per user. Per workspace is added with durable rooms.
- Invite accept: per IP and per invite.
- Report: per user and per room.
- Store counters in Redis with a fixed window or token bucket.

Join gates:

- Public room: anyone with the slug can request a token, subject to rate limits and display-name rules.
- Unlisted room: the slug is required, but the room is not listed anywhere.
- Private room: an invite token or a knock approval is required.
- Optional lobby: the guest gets a waiting state, the host approves, then the token is minted.

## Options considered

| Option | Effort | Pros | Cons |
| --- | --- | --- | --- |
| A. Keep per-route checks and 6-hour tokens | 0 | No work | Bypassable cap, no roles, removal does not revoke, no plan enforcement |
| B. Central token service, role grants, 2-hour tokens, ban plus session rotation | 5 to 7 days | Server truth, bounded revocation, room for plan limits | Token route becomes critical, session rotation reconnects everyone |
| C. 15-minute tokens with frequent refresh for all calls | 7 to 9 days | Strong revocation window | Reconnect every 15 minutes is bad for long calls; more token traffic |

Recommendation: **B**. Use 15-minute tokens only for embed, where a reconnect is acceptable and the host owns the session.

## Consequences

Positive:

- Roles are explicit and testable.
- Plan limits and bans have one enforcement point.
- Removal can actually revoke access.
- The client can render the right controls without becoming the authority.

Negative:

- Token issuance becomes the highest-traffic critical path. Cache room and policy reads for a few seconds, and keep p95 under 300 ms.
- Session rotation is disruptive. It must be rare and clearly labeled.
- The UI needs role badges and a cohost management surface.

## Cost impact

No new provider cost. The token endpoint does more database reads, so add a short cache. Rate limiting adds Redis operations, which are already budgeted for presence.

## Open questions

1. Is 2 hours the right normal TTL, or should it be shorter and accept hourly reconnects? Recommendation: 2 hours, with session rotation for immediate revocation.
2. Can a cohost end a session? Recommendation: yes, but not change billing or delete the room.
3. Should guest display names be unique within a room? Recommendation: no, but show a role badge and disambiguate in the participant list.
4. Should a remove always rotate the session? Recommendation: not in Phase 1. Use a ban plus the token TTL, and end the call for immediate revocation. Revisit rotation when durable rooms ship.
