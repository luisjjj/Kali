# Kali — start a call, no fuss

A friendly Zoom clone. Next.js (App Router, TypeScript) + Tailwind + LiveKit Cloud +
Neon Postgres (Drizzle) + Neon Auth. Deploy target: Vercel.

## Quick start

1. Copy env and fill it in:

```bash
cp .env.example .env.local
```

Required: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`.
Meeting/video features (next step) also need `LIVEKIT_URL`, `LIVEKIT_API_KEY`,
`LIVEKIT_API_SECRET`. See `LIVEKIT_SETUP.md` for the LiveKit Cloud walkthrough.

2. Install + run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

3. Database:

```bash
npm run db:push     # push drizzle schema to Neon (needs DATABASE_URL)
```

Auth tables are managed by Neon Auth itself — Kali only creates
`meetings`, `participants`, `messages` (see `lib/db/schema.ts`).

## Project map

- `app/page.tsx` — landing page (pink hero, chunky cards)
- `app/auth/sign-in|sign-up` — Neon Auth email/password forms (zod-validated)
- `app/dashboard` — protected placeholder (meetings list lands next)
- `components/ui` — Kali design system: `button`, `card`, `input`, `badge`,
  `brand` (wordmark + video tile), `states` (loader/empty/error)
- `lib/db` — Drizzle schema + Neon HTTP client
- `lib/auth` — Neon Auth server/client (follows current `@neondatabase/auth` docs)
- `proxy.ts` — protects `/dashboard/*` + `/api/meetings/*`
- `LIVEKIT_SETUP.md` — what to do in the LiveKit Cloud dashboard before we wire video

## Design tokens

Palette (`app/globals.css` + Tailwind `@theme`): `kali-pink #FFA8CD`,
`kali-ink #17120F`, `kali-paper #FFFBF9`, `kali-pink-hover #FF8CBF`,
`kali-pink-pale #FFE3EF`, success green, danger red. Dark mode uses the
near-black base with pink accents. Type: Plus Jakarta Sans. Shapes: pills +
24–28px radii, soft fills over outlines.
