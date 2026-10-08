# Kali — start a call, no fuss

A friendly Zoom clone. Next.js 16 (App Router, TypeScript) + Tailwind v4 + LiveKit Cloud (SFU) +
Neon Postgres (Drizzle) + Neon Auth. Deploy target: Vercel.

## Features

- **Auth** — sign up / sign in / sign out via Neon Auth (`@neondatabase/auth`). Guests join by link with a display name.
- **Dashboard** — instant meeting, scheduling, join-with-code, upcoming + past lists.
- **Shareable rooms** — short `xxx-xxx-xxx` room codes, links at `/m/[room_code]`.
- **Pre-join lobby** — camera/mic preview, live mic meter, device pickers, display name.
- **Meeting room** — speaker-highlighted video grid, floating pill control bar (mic, camera,
  screen share, chat, people, leave), per-participant connection quality, audio-only
  low-bandwidth mode, copy-link. Simulcast + adaptive stream + dynacast enabled.
- **Chat** — LiveKit data channel (`useChat`) for live delivery, persisted to Postgres so history survives refresh.
- **Host controls** — mute / remove participant, end for everyone. All enforced server-side
  with the LiveKit server SDK; host flag is derived from `meetings.host_user_id`, never from client claims.
- **Ended handling** — "call has ended" screen, 15s ended-polling + disconnect routing for guests.

## Quick start

1. Copy env and fill it in:

```bash
cp .env.example .env.local
```

| Var | Where from |
| --- | --- |
| `DATABASE_URL` | Neon Console → project → connection string |
| `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` | Neon Console → Auth → Enable Auth → Configuration (`openssl rand -base64 32` for the secret) |
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | LiveKit Cloud → project → Keys (see `LIVEKIT_SETUP.md`) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, your Vercel URL in prod |

2. Install + push schema + run:

```bash
npm install
npm run db:push
npm run dev
```

Auth tables are managed by Neon Auth itself — Kali creates
`meetings`, `participants`, `messages` (see `lib/db/schema.ts`).

## Deploy to Vercel

1. Push to GitHub (already at `github.com/luisjjj/Kali`).
2. Vercel → Add New Project → import the repo.
3. Add all env vars from the table above (production values).
4. Deploy. No build config needed (`next build`).

## Project map

- `app/page.tsx` — landing page (pink hero, chunky cards)
- `app/auth/sign-in|sign-up` — Neon Auth email/password forms (zod-validated)
- `app/dashboard` — New / Schedule / Join + meeting lists
- `app/m/[roomCode]` — lobby → room → left/ended flow
- `app/api/meetings` — create/list (auth), meeting info (public), end-for-all (host), chat history/persist (public, code-gated)
- `app/api/livekit/token|mute|remove` — signed JWTs + server-side host controls
- `components/ui` — Kali design system: `button`, `card`, `input`, `badge`,
  `brand` (wordmark + video tile), `states` (loader/empty/error)
- `components/meeting` — `lobby`, `room`, `video grid`, `chat-panel`, `participants-panel`, `ended-screen`
- `lib/db` — Drizzle schema + Neon HTTP client
- `lib/auth` — Neon Auth server/client (follows current `@neondatabase/auth` docs)
- `lib/livekit.ts` — server-only token signing + `RoomServiceClient`
- `proxy.ts` — protects `/dashboard/*` (meeting APIs auth themselves so guests work)

## Design tokens

Palette (`app/globals.css` + Tailwind `@theme`): `kali-pink #FFA8CD`,
`kali-ink #17120F`, `kali-paper #FFFBF9`, `kali-pink-hover #FF8CBF`,
`kali-pink-pale #FFE3EF`, success green, danger red. Dark mode uses the
near-black base with pink accents. Type: Plus Jakarta Sans. Shapes: pills +
24–28px radii, soft fills over outlines.
