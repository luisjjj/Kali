# Architecture decisions

This directory records the decisions that shape Kali's backend, media, billing, and open-source posture.

Status values:

- **Proposed**: written for Phase 0 review. Not implemented. Open questions remain.
- **Accepted**: confirmed by the maintainer. Implementation may begin.
- **Superseded**: replaced by a later ADR. Keep the original for history.
- **Rejected**: considered and not chosen.

| ADR | Decision | Status | Needs confirmation |
| --- | --- | --- | --- |
| [0001](0001-room-and-session-model.md) | Terminal rooms, 1:1 session records, durable rooms deferred | Proposed | Confirm terminal room model; session record only; workspaces deferred |
| [0002](0002-roles-and-token-grants.md) | Central token service, role grants, 2-hour tokens, lean revocation | Proposed | Role matrix, token TTL, removal gap, rotation deferred |
| [0003](0003-webhooks-presence-and-metering.md) | LiveKit webhooks, deadlines, usage events; presence deferred | Proposed | Worker hosting, presence timing |
| [0004](0004-low-data-profiles.md) | Normal, data saver, and audio-only profiles with a meter and harness | Proposed | 240p target, auto-switch behavior |
| [0005](0005-recording-egress-and-storage.md) | Egress to R2, retention, Pro Plus recording bundle | Proposed | R2, bundle size, retention |
| [0006](0006-captions-and-summaries.md) | Self-hosted caption agent with a swappable speech provider | Proposed | Provider, free allowance, languages |
| [0007](0007-plans-entitlements-and-billing.md) | Host-account entitlements now, workspaces later; Paystack first, Stripe second | Proposed | Limits, prices, annual plans, workspace timing |
| [0008](0008-self-hosting-license-and-auth.md) | MIT, compose stack, auth adapter, no open-core gating | Proposed | Support policy, Better Auth |
| [0009](0009-embeddable-sdk.md) | Iframe embed, server-to-server API, signed tokens | Proposed | API pricing, white-label |

## How to add a decision

1. Copy the structure of an existing ADR.
2. State the context and the decision in plain language.
3. Include at least two options, with cost and tradeoffs.
4. Mark the status as Proposed.
5. Link the ADR from this table and from `docs/README.md`.
6. After the maintainer confirms, change the status to Accepted in a separate commit.

## What is not an ADR

- A bug fix.
- A visual change.
- A library version bump with no architectural effect.
- A reversible experiment behind a feature flag with no data model impact.
