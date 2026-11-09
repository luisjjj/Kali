# ADR 0009: Embeddable SDK and API

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/architecture.md` section 7, `docs/unit-economics.md` section 6
- Decision needed: confirm the iframe-first surface and API pricing

## Context

The brief describes an embeddable layer as the main route from a casual tool to a business: a small JS SDK and iframe embed with `Kali.mount(el, { roomToken })`, theming, event callbacks, and a server-to-server API for creating rooms and minting tokens for a customer's own users. Target use cases are support calls, tutoring, consultations, and telehealth-adjacent bookings.

There is no API key model, no embed surface, no signed room token for third parties, and no way to scope a room to an external user.

## Decision

Ship an iframe-first embed:

```js
const kali = Kali.mount(document.querySelector("#call"), {
  roomToken,          // short-lived, signed, one room
  theme: "light",     // light or dark
  on: {
    ready: () => {},
    joined: (participant) => {},
    left: () => {},
    error: (err) => {},
  },
});
```

The loader creates an iframe at `https://app.kali.../embed?token=...`, sets `allow="camera; microphone; display-capture; fullscreen"`, and communicates over `postMessage` with strict origin checks.

Server-to-server API:

- `POST /api/v1/services/rooms` creates a room with a policy and metadata.
- `POST /api/v1/services/rooms/:id/embed-tokens` mints a 15-minute embed token for one external user and role.
- `GET /api/v1/services/rooms/:id` returns status and usage.
- `DELETE /api/v1/services/rooms/:id` closes the room.
- API keys are workspace-scoped, hashed at rest, shown once, and rate limited.
- Every request has an idempotency key for create and token mint.

Security:

- The API secret never reaches the browser.
- Embed tokens are short-lived, one room, one identity, one role, and optionally one origin.
- The iframe page validates the token server-side before connecting.
- `frame-ancestors` is an allowlist per workspace. No wildcard by default.
- `postMessage` checks both origin and message shape.
- The embed cannot use host-only controls unless the token grants them.
- Recording and captions are controlled by the room policy and the embedding workspace's plan.

Metering and pricing:

- Pro Plus includes 1,000 API participant minutes per month.
- Overage is metered at $0.01 per participant minute, or a volume tier.
- Rooms and tokens are rate limited per API key.
- Usage appears in the workspace dashboard and the monthly invoice.

Documentation and demo:

- A static demo page that creates a room through a test key and mounts the iframe.
- Event reference, error codes, CSP examples, and a security checklist.
- A note that telehealth-adjacent use requires the customer's own compliance review.

## Options considered

| Option | Effort | Pros | Cons |
| --- | --- | --- | --- |
| A. Iframe plus loader | 2 to 3 weeks | Origin isolation, easy versioning, CSP, camera permissions work with `allow` | Less styling control, postMessage protocol, some Safari quirks |
| B. Web Component with shadow DOM | 4 to 5 weeks | Deeper integration, shared DOM | CSS and permission complexity, harder to isolate failures |
| C. Headless SDK | 6 to 8 weeks | Maximum flexibility | Highest support burden, customers can build broken media stacks |

Recommendation: **A** for the first release. Add a headless SDK only after the API and event contract are stable.

## Consequences

Positive:

- A real B2B surface with a clear security boundary.
- The iframe can be versioned independently of the host page.
- API usage becomes a metered revenue line.

Negative:

- Third-party cookie and storage restrictions vary by browser. Design for no third-party cookies.
- Customers will ask for white-labeling, custom CSS, and deep hooks. Set expectations early.
- Support load grows because the embed runs in environments Kali does not control.
- Abuse controls and API key rotation are mandatory before launch.

## Cost impact

- Engineering: 2 to 3 weeks.
- Infrastructure: negligible beyond the existing app and database. Embed sessions consume the same LiveKit minutes and data.
- Metering: API participant minutes must be recorded separately so they can be billed.
- Support: the main ongoing cost.

## Open questions

1. Should the first release support a fully white-label domain? Recommendation: no, start with an allowlisted iframe and a "Powered by Kali" badge.
2. Should the SDK expose a headless mode? Recommendation: later, after the event contract is stable.
3. What is the API overage price? Recommendation: $0.01 per participant minute, reviewed after the first 10 customers.
4. Should embed recordings be available? Recommendation: only if the embedding workspace is entitled and the room policy allows it.
5. How are abuse reports handled for embedded rooms? Recommendation: an API event and a workspace admin queue, with a documented response time.
