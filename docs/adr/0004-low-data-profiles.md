# ADR 0004: Low-data profiles and measurement

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/audit.md` section 6, `docs/architecture.md` section 5.1
- Decision needed: confirm the 240p target and the auto-switch behavior

## Context

The current client has one video profile: 720p at 30 fps with a 2.5 Mbps top layer. Audio is already efficient at 24 kbps Opus with DTX and RED. The only lighter mode is an audio-only toggle that stops the camera and unsubscribes remote video.

There is no data usage meter, no pre-join estimate, no room default, and no automatic fallback. The brief sets targets of about 15 MB per participant-hour for audio and about 100 MB per participant-hour for data saver, to be validated by measurement.

At 100 MB per participant-hour, the total budget is about 233 kbps. Audio and WebRTC overhead consume about 30 kbps, leaving about 200 kbps for video. That is realistic at 240p and 12 to 15 fps, not at 360p for motion-heavy content.

## Decision

Ship three profiles:

| Profile | Video | Audio | Default use |
| --- | --- | --- | --- |
| Normal | 720p30, 2.5 Mbps top layer, VP9 SVC with VP8 fallback | 24 kbps Opus, DTX, RED | Wi-Fi and good 4G |
| Data saver | 240p, 12 to 15 fps, about 200 kbps video | 24 kbps Opus | Cellular and constrained networks |
| Audio only | none, screen share disabled | 24 kbps Opus | Very weak networks, voice-first calls |

360p is an adaptive step at about 350 kbps, not the default data saver. It can be used when the network supports it and the content needs more detail. The 100 MB target is reported for 240p.

Behavior:

- The profile is switchable mid-call without leaving the room.
- The host can set a room default. A participant can choose a lighter profile than the default, never a heavier one.
- New rooms default to data saver when the browser reports a cellular connection (`navigator.connection.effectiveType` or `saveData`) or when the user has `prefers-reduced-data`.
- The choice is remembered per device.
- Audio-only disables the camera and screen share, and unsubscribes remote video. The audio path stays.
- Data saver caps screen share at 1.5 Mbps and 5 fps, or disables it if the room policy says so.
- Krisp is deferred on cellular and in data saver. The about 6 MB model download must not be part of a first low-data join. It can load later on Wi-Fi or on request.
- Sharpening is off on mobile and in data saver. It is a GPU and battery feature, not a bandwidth feature.

Data meter:

- Pre-join estimate per profile, shown in the lobby.
- Live meter per participant: MB sent and received this call, updated every 5 seconds.
- Post-call summary: total MB, profile, duration, and an estimate of what the call would have used at normal quality.
- Source: `RTCPeerConnection.getStats()` byte counters, cross-checked with LiveKit's stats API. The meter is a UX estimate, not a billing meter.
- Telemetry: one sampled event per call with profile, device class, network type, bytes, join time, and quality summary. No message contents, no raw IP.

Automatic fallback:

- Detect sustained outgoing packet loss above 5 percent, available outgoing bitrate below 250 kbps, or a freeze rate above a threshold for 10 seconds.
- Suggest a lighter profile. Auto-switch only when the user has enabled "adjust automatically" or the room policy requires it.
- Recover after 60 seconds of stable conditions, with hysteresis to avoid flapping.
- Audio-only is never automatic without consent; audio is the last thing to degrade.

Measurement harness:

- Chromium with CDP network emulation for bandwidth and latency.
- Linux `tc netem` for 5 to 10 percent packet loss, or a Windows tool such as Clumsy for manual runs.
- A mid-range Android phone and a low-end laptop as the reference devices.
- Profiles: 3G (about 1.5 Mbps down, 750 kbps up, 300 ms RTT), 4G (about 10 Mbps down, 5 Mbps up), and a lossy 4G case.
- Metrics: bytes per participant-hour, join time to first remote frame, resolution, FPS, freeze rate, packet loss, jitter, RTT, and audio interruptions.
- Publish a table in the repo with the actual numbers. Do not claim the targets until the table exists.

## Options considered

| Option | Effort | Pros | Cons |
| --- | --- | --- | --- |
| A. Keep the audio-only toggle | 0 | No work | No 240p or 360p, no meter, no targets, no differentiation |
| B. Three profiles, meter, auto-fallback, harness | 2 weeks plus device testing | Meets the brief, measurable, reduces data cost | Client complexity, more QA, risk of quality complaints |
| C. Server-forced profiles through room metadata | 3 weeks | Stronger consistency | Client still controls encoding; cannot truly enforce bitrate without custom media code |

Recommendation: **B** now, with the room policy able to set a maximum profile. Treat **C** as an enterprise consistency feature later, not a hard bandwidth guarantee.

## Consequences

Positive:

- The core differentiator becomes real and measurable.
- Data saver cuts LiveKit downstream cost by about 80 percent versus normal video.
- Users see what a call costs them in MB, in plain language.
- The room default gives hosts control over community data budgets.

Negative:

- 240p will look soft on large screens. The UI must explain the tradeoff without jargon.
- Auto-switching can be surprising. Default it to suggest, not switch, until the measurements prove it is reliable.
- The data meter adds client work and telemetry. Keep it sampled and privacy-preserving.
- Low-end Android devices need testing; WebGL sharpening and Krisp can be too expensive.

## Cost impact

- No new infrastructure cost. Telemetry is a small number of events per call.
- Data saver reduces the largest variable cost in the model, LiveKit downstream data.
- The meter is client-side and does not affect billing. Usage billing remains server-side participant minutes.

## Open questions

1. Is 240p acceptable as the default saver, or should 360p be the default with a higher target? Recommendation: 240p for the 100 MB claim, 360p as an adaptive step.
2. Should auto-switch be opt-in or on by default? Recommendation: suggest by default, auto-switch opt-in.
3. Should free rooms default to data saver on all networks, not just cellular? Recommendation: cellular and `prefers-reduced-data` first, then evaluate free-tier cost after 30 days.
4. Should screen share be disabled entirely in audio-only? Recommendation: yes, with a clear message.
