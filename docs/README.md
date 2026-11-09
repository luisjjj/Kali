# Kali engineering docs

This is the Phase 0 package for the transition from a casual meeting app to a durable, low-data, monetizable platform.

No feature code is included. The purpose is to agree on the shape of the system before changing it.

Phase 1 is deliberately lean. The full architecture is the target, but durable rooms and workspaces are deferred. For now, a room is a single call: ending the call ends the room. The one addition is a 1:1 session record so metering, recordings, and transcripts have a stable id.

## Read in this order

1. [Audit](audit.md): what exists today, confirmed from code, and what is missing.
2. [Architecture](architecture.md): the target control plane, data plane, schema, API, security, migration, and phase plan.
3. [Unit economics](unit-economics.md): cost per participant-hour by profile, plan margins, free-tier risk, and plan selection.
4. [ADRs](adr/README.md): the nine decisions that need confirmation before implementation.

## Phase 0 deliverables

| Deliverable | Status |
| --- | --- |
| Code-grounded repo audit | Done |
| Architecture proposal | Done |
| ADRs in `/docs/adr` | Done, all Proposed |
| Unit economics draft | Done, estimates labeled |
| Feature code | None, by design |

## What the audit found

- The app is a working one-hour meeting MVP with guest links, chat, host controls, screen share, and a Windows shell.
- The backend is meeting-shaped: `meetings.ended_at` is terminal, `participants` rows are token requests, and `left_at` is never written.
- There are no LiveKit webhooks. The one-hour cap is a client timer plus a best-effort `expire` call, while tokens stay valid for six hours.
- There are no migrations, tests, web CI, rate limits, structured logs, or error tracking.
- There is no data meter, no 240p or 360p profile, and no measurement that could validate the 15 MB or 100 MB targets.
- Pricing is marketing copy. There are no plans, entitlements, subscriptions, or usage events.

## Decisions needed before Phase 1

| # | Decision | Recommendation | ADR |
| --- | --- | --- | --- |
| 1 | Room and session shape | Keep `meetings` terminal; add a 1:1 session record for metering; defer durable rooms and workspaces | 0001 |
| 2 | Token lifetime and revocation | Central token service, 2-hour tokens; remove uses a ban plus the token TTL; rotation deferred | 0002 |
| 3 | Presence and worker hosting | LiveKit webhooks, deadline worker, usage events; Redis presence deferred | 0003 |
| 4 | Data saver target | 240p for the 100 MB claim, 360p as an adaptive step | 0004 |
| 5 | Recording storage and bundle | R2, 3 hours included on Pro Plus, $3 per extra hour | 0005 |
| 6 | Captions provider | Self-hosted agent, evaluate AssemblyAI and Deepgram on Nigerian English and Pidgin | 0006 |
| 7 | Plan limits and billing | Host-account entitlements now, workspaces later; Paystack first, Stripe second, remove the per-call cap, soft fair use | 0007 |
| 8 | Self-host scope and auth | MIT, compose stack, Better Auth adapter in Phase 6 | 0008 |
| 9 | Embed surface | Iframe first, server-to-server API, 1,000 API minutes on Pro Plus | 0009 |

## Phase plan

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 0 | Docs only | Decisions confirmed |
| 1 | Metering, entitlements, observability, webhooks, session records | Webhook-driven sessions, usage events, SLOs measured, tests green, no behavior regression; ending a call still ends the room |
| 2 | Low-data profiles, meter, auto-fallback, harness | Published MB per participant-hour at 3G with 5 to 10 percent loss |
| 3 | Durable rooms, cross-call chat, presence, knock, lobby, social layer | Rooms survive empty only after the durable-room ADR is accepted; dashboard presence under 5 seconds |
| 4 | Paystack, plan enforcement, remove the free cap | Billing webhooks idempotent, plans enforced at token issue, no plan loses money at modeled usage |
| 5 | Captions and summaries, embed SDK and API | Accuracy report, graceful degradation, embed demo with API keys |
| 6 | Self-host compose, docs, community mode | One-command compose, feature flags, contribution and security docs |

## Measurement status

Nothing has been measured yet. The unit economics use labeled estimates for bytes per participant-hour:

- Audio only: about 15 MB per hour.
- Data saver: about 100 MB per hour at 240p.
- Normal: about 500 MB per hour at 720p.

Phase 2 must replace these with real numbers on a throttled 3G profile with 5 to 10 percent packet loss. Do not publish low-data claims before that table exists.

## Phase 0 close-out

**What shipped:** the audit, architecture proposal, nine ADRs, and the unit economics draft. No feature code.

**What was measured:** nothing. There is no production telemetry for bytes, loss, jitter, join time, recording cost, or caption accuracy. The 15 MB, 100 MB, and 500 MB per participant-hour figures are estimates and are labeled as such.

**What is risky:**

- The schema migration in Phase 1 is the highest-risk change, but the lean model keeps it additive: sessions, usage, webhooks, bans, and entitlements only. It still needs a flag, a backfill, and a snapshot.
- Free-tier cost is unbounded by calls and bounded only by participants and fair use. Data saver defaults and conversion rates decide whether it is affordable.
- Recording is expensive. Any unlimited recording bundle loses money.
- Caption accuracy for Nigerian English and Pidgin is unproven. The provider evaluation must happen before the feature is marketed.
- The auth stack is a beta managed service. The adapter boundary is needed before self-hosting is credible.
- Naira revenue against USD infrastructure costs needs a quarterly price review.

**What is proposed next:** confirm the nine decisions in `docs/adr/README.md`, then start Phase 1 with the webhook pipeline, session records, entitlements foundation, observability, and tests. The Phase 1 schema is the lean subset in `docs/architecture.md` section 6. Do not start low-data profiles until the measurement harness exists.

## Working agreement

- One concern per pull request.
- Keep guest join, chat for the life of the room, screen share, and host controls working at every step.
- Add a reversible migration for every schema change.
- Present two or three options with costs when a decision has real tradeoffs.
- Report misses and wrong assumptions with numbers, not adjectives.
