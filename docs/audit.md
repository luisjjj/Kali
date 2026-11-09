# Kali Phase 0 audit

- Date: 2026-11-09
- Commit: `55e8ebc` (main)
- Scope: application code, schema, auth, LiveKit integration, deployment, desktop shell, tests, and operations
- Method: read the repository and confirm every claim from code. No stack assumptions.

This audit is deliberately blunt. The current app is a clean casual-call MVP. The target product is a durable, low-data, monetizable platform. Those are different shapes.

## 1. Executive summary

What exists today is a good-looking, working one-hour meeting app with guest links, chat, host controls, screen share, a Windows shell, and sensible media defaults. The brand and the client experience are ahead of the backend model.

The three biggest gaps against the brief:

1. **The media layer has no server-side source of truth.** There are no LiveKit webhooks. Session records are inferred from token requests, `participants.left_at` is never written, and the one-hour cap is enforced by a client timer plus a best-effort `expire` call. A token stays valid for six hours. A modified client can ignore the cap.
2. **The data model is meeting-shaped, not room-shaped.** `meetings.ended_at` is terminal. A room cannot be rejoined after it ends, cannot sit empty, and has no session history. There is no users, workspaces, roles, plans, entitlements, subscriptions, usage, recordings, transcripts, or summaries model.
3. **There is no measurement or safety net.** No tests, no web CI, no committed migrations, no error tracking, no structured metrics, no rate limiting. The low-data targets (15 MB and 100 MB per participant-hour) cannot currently be measured, let alone validated.

Do not start Phase 2 (low-data mode) before Phase 1. Building profiles without a meter and a session model would produce unverifiable claims.

What should be kept: the visual system, the lobby and join flow, the LiveKit client tuning, screen share, host controls, guest access, Drizzle, the Electron shell, and the validation layer.

## 2. Confirmed stack

| Layer | What the code uses | Evidence |
| --- | --- | --- |
| Framework | Next.js 16.4.0 App Router, React 19.3, TypeScript, Tailwind v4 | `package.json`, `app/` |
| Hosting | Vercel (production alias `kali-one-snowy.vercel.app`) | repo config, prior deploys |
| Media | LiveKit Cloud, `livekit-client` 2.22.3, `@livekit/components-react` 2.9.24 | `components/meeting/room.tsx` |
| Server media SDK | `livekit-server-sdk` 2.19.1 | `lib/livekit.ts`, API routes |
| Database | Neon Postgres over HTTP, Drizzle ORM 0.45 | `lib/db/client.ts`, `lib/db/schema.ts` |
| Auth | Neon Auth 0.5.0-beta, email and password, cookie sessions | `lib/auth/server.ts`, `app/api/auth/[...path]/route.ts` |
| Billing | None. Pricing is marketing copy only | `app/page.tsx` |
| Desktop | Electron 45, electron-builder NSIS, GitHub Actions | `electron/`, `.github/workflows/desktop.yml` |
| Tests | None in the product | no test files outside `node_modules` |
| Observability | `console.warn` only | `lib/db/client.ts`, `lib/auth/server.ts`, API routes |

Runtime shape:

```text
Browser or Electron shell
  |  HTTPS (app, chat, tokens)
  v
Next.js on Vercel  --->  Neon Postgres (app tables + Neon Auth)
  |  server SDK (REST)
  v
LiveKit Cloud  <--- WebRTC media --->  Browser or Electron
```

Media does not pass through Vercel. That is correct and should stay.

There is no inbound path from LiveKit to the app today. Adding `/api/webhooks/livekit` is the single highest-leverage backend change.

## 3. Current data model

Three application tables in `lib/db/schema.ts`:

| Table | Columns | Notes |
| --- | --- | --- |
| `meetings` | `id`, `host_user_id`, `title`, `room_code` unique, `scheduled_at`, `created_at`, `ended_at` | A meeting is both the durable link and the live occurrence. `ended_at` is terminal. |
| `participants` | `id`, `meeting_id` FK cascade, `user_id` nullable, `display_name`, `joined_at`, `left_at` | One row is inserted on every token request. `left_at` is never written anywhere. |
| `messages` | `id`, `meeting_id` FK cascade, `sender_name`, `body`, `created_at` | Indexed on `meeting_id` only. No retention, pagination, or deletion path. |

Neon Auth owns its own tables in the same database. The app does not mirror users into an app table.

Concrete problems:

- A `participants` row means "a token was minted", not "a person joined". Lobby retries, reloads, and rejoins create duplicates. The one-hour anchor is `min(participants.joined_at)`, so the clock starts when the first token is minted, even if that person never connects.
- There is no distinction between a room and a session. Ending a meeting permanently kills the link. This directly blocks pillar 2 (persistent hangout rooms).
- There is no `users` profile table, no `workspaces` or `workspace_members`, and therefore no place to attach roles, plans, entitlements, retention, or usage.
- No `recordings`, `transcripts`, or `summaries` tables, despite the Pro Plus page listing recordings.
- No append-only `usage_events`. There is no way to answer "how many participant-minutes did this workspace use" or "what did this call cost".
- No migration history. There is no `drizzle/` directory and the README tells contributors to run `npm run db:push`. This is unsafe in a database that also contains Neon Auth and `playing_with_neon`.

## 4. Authentication and authorization

What is done well:

- The host flag is derived server-side from `meetings.host_user_id` in `app/api/livekit/token/route.ts`. Client claims are not trusted.
- The host token gets `roomAdmin`; guests do not.
- Host-only routes re-check the session and host id (`end`, `mute`, `remove`).
- LiveKit API credentials are read only on the server. No secret appears in the client bundle.
- The Electron shell allow-lists permissions to the app origin only.

Gaps:

| Gap | Evidence | Impact |
| --- | --- | --- |
| No role model | Only `isHost` boolean | No cohost, member, or guest distinction beyond host. No workspace roles. |
| Guest display name is unverified | `tokenRequestSchema` accepts any name | A guest can join as "Ada" or as the host's name. No unique display name in a room. |
| No join gate | Anyone with the three-group code gets a token | Private rooms and lobbies are impossible without invites or a knock flow. |
| No rate limiting | Token, create, chat, expire endpoints | Code guessing, room spam, token minting, chat flooding. |
| Long token lifetime | `ttl: "6h"` in `lib/livekit.ts` | A removed or banned participant can reconnect with the same token for up to six hours. |
| Removal does not revoke the token | `remove` calls LiveKit remove only | The removed client can reconnect. "Remove" is not a security boundary today. |
| Chat sender is client-supplied | `chat-panel.tsx` posts `senderName`; route trusts it | Anyone with the room code can post as any name, with no auth. |
| Auth build fallback is dangerous in production | `lib/auth/server.ts` falls back to a hard-coded cookie secret and only warns | A missing production env var silently uses a public placeholder secret. |
| Beta auth dependency | `@neondatabase/auth` 0.5.0-beta | Breaking changes and migration risk. Needs an auth adapter boundary. |
| No account deletion or data export | no route or UI | Privacy and compliance gap. |
| No report or block | no tables or UI | No abuse controls. |

The sign-up "invalid origin" issue is an environment configuration problem (Neon Auth allowed domains), not an application bug. It should be closed before any auth work.

## 5. LiveKit integration points

### Token issuance

`app/api/livekit/token/route.ts`:

- Looks up the meeting by code and rejects if `ended_at` is set.
- Derives host, identity (`user-<id>` or `guest-<8 chars>`), and display name.
- Mints a token with `roomJoin`, `canPublish`, `canSubscribe`, `canPublishData`, and host-only `roomAdmin`.
- Inserts a `participants` row on every request.
- Computes `endsAt` from the earliest participant row plus 60 minutes. If already past, stamps `ended_at` and returns 410.
- Returns `serverUrl`, token, identity, host flag, room code, and `endsAt`.

This is the most important route to replace. It mixes authentication, policy, session creation, metering, and time enforcement.

### Room configuration

`components/meeting/room.tsx`:

- `adaptiveStream: true`, `dynacast: true`.
- Capture 720p at 30 fps.
- VP9 with SVC, VP8 simulcast fallback.
- Camera top layer 2.5 Mbps, 30 fps, `maintain-framerate`.
- Screen share 3 Mbps, 15 fps.
- Opus speech preset (24 kbps), DTX and RED, mono.
- Browser echo cancellation, noise suppression, auto gain, voice isolation.
- Local quality indicator; a poor-quality nudge after 10 seconds.
- Audio-only toggle unsubscribes video (including screen share) and turns the camera off.
- WebGL sharpening on by default on desktop, stored per device.
- Krisp noise filter lazy-loaded on first join (about 6 MB model download).
- Screen share is pinned to the HIGH layer when sharpening is on.

These are reasonable defaults. They are not profiles, and none of them are measured.

### Chat

`components/meeting/chat-panel.tsx` uses LiveKit's data channel for live delivery and `POST /api/meetings/[roomCode]/messages` for persistence. History is loaded in full on mount. The POST route requires only the room code and a client-provided `senderName`; it has no session or auth check. Live and persisted messages are deduplicated by mount timestamp, which is fragile across reconnects.

### Lifecycle and enforcement

- Join: lobby, token, connect.
- Timer: `endsAt` from the token; reminder at 55 minutes; client calls host `end` or guest `expire` at 60 minutes.
- Host end: stamps `ended_at`, calls `deleteRoom`.
- Guest expire: server re-checks the anchor, stamps `ended_at`, calls `deleteRoom`.
- Ended detection: every participant polls `GET /api/meetings/[roomCode]` every 15 seconds.

What is missing:

- No `room_started`, `room_finished`, `participant_joined`, `participant_left`, `track_published`, or `egress_*` handling.
- No server-side max duration. The 6-hour token outlives the 60-minute cap.
- No session id, so recordings and usage cannot be attached to an occurrence.
- No reconnect semantics beyond the client library. Chat and presence are not resumed by the app.

## 6. Low-data posture

Current state:

- Audio is already efficient: 24 kbps Opus speech, DTX, RED. Audio-only is a client toggle that stops publishing camera and unsubscribes all remote video, including screen share.
- Video has one profile: 720p30, 2.5 Mbps top layer. There is no 240p or 360p profile, no lower frame rate, and no host-set room default.
- There is no data usage meter, no pre-join estimate, and no automatic profile switch. The poor-quality nudge is advisory only.
- No bytes, bitrate, loss, jitter, or join-time telemetry is recorded. The only signal is a local connection quality enum.
- The Krisp model downloads about 6 MB on first join, which works against a low-data first experience. It should be deferred on cellular or in data saver.
- Screen share at 3 Mbps can consume more than a normal call.

Targets from the brief cannot be verified today. The model in `docs/unit-economics.md` uses estimates and explicitly marks them as unmeasured.

A useful early finding for Phase 2: at 100 MB per participant-hour, the total budget is about 233 kbps. After Opus and WebRTC overhead (about 30 kbps), video has roughly 200 kbps. That is realistic at 240p and 12 to 15 fps, not at 360p for motion-heavy content. The brief's "240p to 360p" should be treated as a range, with 240p as the profile that meets 100 MB per hour and 360p as an adaptive step when the network allows.

## 7. Monetization

- The landing page shows Free, Pro ($7), and Pro Plus ($15, "Soon"). The buttons are disabled. There is no billing provider, no plan table, no subscription, no entitlement check, no receipt, no tax handling, and no reconciliation.
- The 60-minute cap is global and hard-coded in `lib/limits.ts`. It applies to every plan and every room.
- Pro Plus lists recordings, but there is no recording implementation.
- There is no usage record that could support metering or invoicing.
- Paystack and Stripe are both absent. Nothing in the app is naira-aware.

## 8. Deployment and operations

- Vercel hosts the Next app. Neon hosts Postgres and Neon Auth. LiveKit Cloud carries media.
- The only CI workflow builds the Windows installer. There is no web build, lint, typecheck, test, or migration check on pull requests.
- No tests exist. There are no unit tests for permissions or entitlements, no integration tests for token issuance or webhooks, and no end-to-end tests for join, chat, or host controls.
- No migration history. `db:push` against a shared database is the documented workflow, which risks dropping tables owned by Neon Auth.
- No structured logs, request ids, error tracking, metrics, health endpoint, or alerting.
- No rate limiting on any endpoint.
- No backups or restore runbook documented.
- `.env.example` is not tracked. `.gitignore` ignores `.env*` with no exception, so a fresh clone has no example despite the README referring to one. The local file currently contains values that look like live credentials. It is not in git history (verified), but it should be sanitized and the credentials rotated if the file was ever shared.
- A Next 16.4.3 security upgrade exists in an unmerged branch. Main is on 16.4.0.
- The desktop installer is unsigned, has no auto-update, and has no deep links. That is acceptable for an optional shell, but it must be stated on the download page.

## 9. Security and privacy review

Positives:

- Server-side host derivation and server-side host checks.
- LiveKit secrets are server-only.
- Electron navigation and permission allow-lists.
- Zod validation at API boundaries.
- Sessions are HTTP-only cookies managed by Neon Auth.

Risks, ordered by severity:

| Severity | Risk | Evidence | Mitigation |
| --- | --- | --- | --- |
| High | One-hour cap can be bypassed; token valid 6 hours | `lib/livekit.ts`, client timer | Webhooks, session deadline worker, shorter tokens |
| High | Host removal does not revoke reconnect | `remove/route.ts` | Ban list, shorter tokens, end the call for immediate revocation; session rotation deferred with durable rooms |
| High | Production auth can fall back to a public cookie secret | `lib/auth/server.ts` | Fail closed when `NODE_ENV=production` |
| High | No rate limits on token, room creation, chat, or expire | API routes | Redis token bucket per IP, user, and room |
| Medium | Chat identity spoofing | `messages/route.ts` POST | Bind sender to session identity; reject mismatches |
| Medium | Room codes are the only join secret | Three groups of three characters, no gate | Invite tokens, private rooms, optional lobby, rate limiting |
| Medium | No data deletion path | no account or meeting delete | Account deletion, room deletion, retention jobs |
| Medium | No security headers or CSP | `next.config.ts` | CSP, Permissions-Policy, HSTS, frame-ancestors for embed |
| Medium | Local `.env.example` contains real-looking keys | local file, untracked | Sanitize; rotate if shared; commit a placeholder example |
| Low | No audit log for host actions | host routes | `audit_log` table |
| Low | Unsigned desktop installer | electron-builder config | Sign when volume justifies it; document SmartScreen; portable ZIP fallback |

## 10. Debt register

| Priority | Item | Why it matters | Phase |
| --- | --- | --- | --- |
| P0 | Webhook receiver and session enforcement | Without it, limits, presence, metering, and recordings are guesses | 1 |
| P0 | Committed, reversible migrations | `db:push` can damage a shared Neon database | 1 |
| P0 | Tests and web CI | Permissions and billing cannot be changed safely without them | 1 |
| P0 | Structured logs, metrics, error tracking | Cannot improve low-data quality or prove SLOs | 1 |
| P0 | Rate limiting | Token and room creation are unauthenticated or cheap to abuse | 1 |
| P0 | Fail-closed production config | Placeholder auth secret is unacceptable in production | 1 |
| P1 | Rooms, sessions, participants, users, workspaces | Persistent rooms, history, presence, and usage all depend on it | 1 and 3 |
| P1 | Entitlements and usage events | Billing and plan enforcement depend on it | 1 and 4 |
| P1 | Data profiles and meter | Core differentiator; cannot claim targets without it | 2 |
| P1 | Presence and knock | Pillar 2 | 3 |
| P1 | Abuse controls | Report, block, ban, token revocation | 3 |
| P2 | Recording | Pro Plus promise; meaningful cost | 5 |
| P2 | Captions and summaries | Differentiator; provider and accuracy risk | 5 |
| P2 | Embed SDK and API | B2B surface | 5 |
| P2 | Self-host compose and auth portability | Open-source credibility | 6 |
| P2 | Desktop signing and auto-update | Optional distribution polish | later |

## 11. What to keep

- The brand, color system, typography, doodles, and theme toggle.
- The lobby, device checks, join flow, and guest access.
- The LiveKit client tuning (VP9 SVC, simulcast fallback, 24 kbps speech, DTX, RED).
- Screen share with spotlight, host mute, remove, and end.
- Krisp and sharpening as optional client enhancements, with data-cost guardrails.
- Drizzle and Neon. Keep the HTTP driver for serverless reads and writes; add a pooled driver only if a worker needs long transactions.
- The Electron shell and its permission allow-list.
- Zod schemas and the existing API error style.

## 12. What must be measured before Phase 2 claims

Phase 0 makes no performance claims. The following baseline must be captured in Phase 1 and used in Phase 2:

- Bytes sent and received per participant per hour, by profile, measured from `RTCPeerConnection.getStats()` and the LiveKit client stats API.
- Join time from link click to first remote frame, p50 and p95, on a mid-range Android phone over throttled 4G.
- Packet loss, jitter, RTT, and freeze rate per participant, sampled every 10 seconds and aggregated per session.
- Audio-only, data saver, and normal quality on a 3G profile with 5 to 10 percent packet loss.
- Recording and caption costs per session, reconciled against provider invoices.

The harness and the first results belong in Phase 2. Until then, the unit economics model is a set of labeled estimates, not facts.
