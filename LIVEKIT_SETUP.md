# LiveKit Cloud setup for Kali (do this before the next step)

Kali uses **LiveKit Cloud (SFU)** for audio/video. We use `livekit-client` +
`@livekit/components-react` in the browser and `livekit-server-sdk` on the server.
We never hand-roll WebRTC.

## 1. Create a LiveKit Cloud project

1. Go to https://cloud.livekit.io and sign in (or create an account).
2. Create a new project, e.g. `kali`.
3. Pick the region closest to your users.

## 2. Get your credentials

In the LiveKit Cloud dashboard go to **Project → Keys** (sometimes labelled
**Settings → Keys**) and copy:

- `LIVEKIT_URL` — looks like `wss://kali-xxxx.livekit.cloud`
- `LIVEKIT_API_KEY` — starts with `API...`
- `LIVEKIT_API_SECRET` — long random string, keep it secret

Add them to `.env.local` (see `.env.example`):

```bash
LIVEKIT_URL="wss://your-project.livekit.cloud"
LIVEKIT_API_KEY="APIxxxxxxxx"
LIVEKIT_API_SECRET="your-livekit-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Only `NEXT_PUBLIC_*` vars are exposed to the browser. `LIVEKIT_API_SECRET`
stays server-side — the token endpoint (next step) signs JWTs with it.

## 3. Optional: local dev without Cloud

If you prefer, run a self-hosted SFU locally with Docker:

```bash
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server --dev
```

Then `LIVEKIT_URL="ws://localhost:7880"`, `LIVEKIT_API_KEY="devkey"`,
`LIVEKIT_API_SECRET="secret"`.

## 4. What I build next (after you confirm)

- `POST /api/livekit/token` — validates the session (or guest display name),
  checks the meeting exists and hasn't ended, returns a signed LiveKit JWT with
  `roomJoin: true`, `canPublish/canSubscribe/canPublishData: true`, and host
  metadata. Host identity is derived server-side from `meetings.host_user_id` —
  never trusted from the client.
- Pre-join lobby (`/m/[room_code]`) with camera/mic preview + device pickers.
- Meeting room with `LiveKitRoom` (`simulcast`, `adaptiveStream`, `dynacast`),
  active-speaker grid, connection-quality indicators, low-bandwidth toggle.

Reply "continue" once your LiveKit project + keys exist (or tell me your
`LIVEKIT_URL` region and I'll keep going with placeholders).
