# ADR 0007: Plans, entitlements, and billing

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/audit.md` section 7, `docs/unit-economics.md`
- Decision needed: confirm the plan limits, the host-account billing owner, and the Paystack-first rollout

## Phase 1 lean override

ADR 0001 defers workspaces. Until workspaces ship:

- The billing account is the host user.
- `subscriptions`, `entitlements`, and `usage_events` key on `owner_user_id`.
- Seats and team workspaces are deferred. Keep the seat value in the plan catalog for later, but do not enforce it.
- When workspaces ship, migrate owner rows to workspace rows with a reversible backfill.

The rest of this ADR is the workspace target.

## Context

Pricing is marketing copy. There is no plan, entitlement, subscription, or usage table. The one-hour cap is a hard-coded constant applied to every call. Pro Plus lists recordings that do not exist. There is no payment provider, no renewal, no receipt, no tax handling, and no reconciliation.

The brief requires an entitlements layer that replaces hard-coded tier checks, removes the one-hour cap, gates recordings, transcripts, custom domains, workspace seats, and API volume, and supports Paystack first with Stripe as a second provider behind the same interface.

## Decision

Use one entitlements model with a swappable owner:

- `plans` defines the catalog and default limits.
- `subscriptions` records the provider, status, and billing period.
- `entitlements` stores the resolved values for an owner, including overrides and trials. The owner is a host user in Phase 1 and a workspace later.
- `usage_events` is the append-only meter.
- A resolver returns the effective limits and is cached for 60 seconds.

Plans:

| Limit | Free | Pro | Pro Plus |
| --- | --- | --- | --- |
| Price | $0 | $7/mo | $15/mo |
| Participants per room | 8 | 25 | 100 |
| Per-call duration cap | none | none | none |
| Fair-use participant-hours per month | 30, soft | 60, soft | 100, soft |
| Video recording | none | none | 3 hours/mo, then $3/hour |
| Live captions | none | 5 hours/mo | 10 hours/mo |
| Transcripts and summaries | none | none | 10 hours/mo |
| Chat retention | 7 days | 90 days | 180 days or account setting later |
| Recording retention | not applicable | not applicable | 30 days |
| Custom room slug | no | yes | yes |
| Custom domain | no | no | yes |
| API and embed | no | no | 1,000 participant minutes/mo, then metered |
| Team seats (deferred until workspaces) | 1 | 3 | 10 |
| Support | community | email | priority email |

Enforcement:

- At token issue: participant cap, duration cap, recording and caption flags, seat and API limits.
- At feature start: recording minutes, caption minutes, storage, custom domain.
- At read: message retention window.
- At invite: seat count.
- At API key creation: plan and scope.
- No client-side entitlement is trusted.

Billing:

- Paystack first for naira, local cards, and bank transfer.
- Stripe second for international cards and customers who prefer it.
- One internal `BillingProvider` interface: create checkout, cancel, resume, verify webhook, map subscription status.
- Webhooks are idempotent and stored in `webhook_events`.
- A daily reconciliation compares provider subscriptions with the local table and flags drift.
- Grace period: 3 days past due, then downgrade to Free. Do not delete data on downgrade.
- Cancel at period end, not immediately.
- Receipts and tax: Paystack handles naira receipts; Stripe Tax can be enabled for international. Legal review before launch.

Removal of the one-hour cap:

- Delete `CALL_LIMIT_MS` as a product rule.
- Replace it with an optional per-room `max_duration_minutes` policy and a plan fair-use limit.
- Keep the client reminder for hosts who set a cap.
- The deadline worker enforces any configured cap.

Fair use:

- Communicate the monthly participant-hour allowance in plain language.
- Warn at 80 percent, then require an upgrade or throttle new sessions at 100 percent.
- Do not reintroduce a hidden per-call cap.
- Review the limits after 90 days of real usage.

## Options considered

| Option | Effort | Pros | Cons |
| --- | --- | --- | --- |
| A. Keep hard-coded tier checks and add more `if` statements | 2 days | Fast | Brittle, impossible to audit, no overrides or trials, billing drift |
| B. Plans, entitlements, subscriptions, usage events, provider adapters | 2 to 3 weeks | Auditable, testable, supports Paystack and Stripe, enables seats and API | More schema and admin UI, webhook handling |
| C. Merchant of record (Paddle or Lemon Squeezy) | 1 week | Tax and compliance handled | Higher fees, weaker Paystack support, less control in Nigeria |

Recommendation: **B**. Use Paystack for Nigeria and Stripe for international. A merchant of record can be reconsidered for markets where tax complexity is high, but it does not solve the Nigeria-first payment requirement.

## Consequences

Positive:

- One place to answer "what is this account allowed to do".
- Billing and usage can be reconciled.
- Trials, overrides, and support credits are possible.
- The free cap can be removed without losing cost control.

Negative:

- More tables, more tests, and an admin surface.
- Payment webhooks are a new reliability boundary.
- Fair-use limits need careful copy to avoid feeling like the old hidden cap.
- Naira pricing needs a review cadence because infrastructure costs are in USD.

## Cost impact

- Paystack: 1.5% + NGN 100 locally, capped at NGN 2,000; 3.9% + NGN 100 for international cards.
- Stripe: 2.9% + $0.30 domestic, plus 1.5% for international cards and 1% for currency conversion.
- No new infrastructure beyond the existing database and worker.
- Engineering: 2 to 3 weeks including tests and admin.

## Open questions

1. Are the participant and fair-use limits above the right starting point? Recommendation: ship them, measure, and adjust after 90 days.
2. Should the free plan have live captions for accessibility? Recommendation: a limited allowance, decided after the caption cost data.
3. Should annual plans be 10 months for 12? Recommendation: yes, for cash flow and retention.
4. Should Pro Plus include 3 or 5 recording hours? Recommendation: 3, because 5 pushes the plan close to break-even at heavy usage.
5. Who handles refunds and chargebacks? Recommendation: a written policy and an admin action before launch.
