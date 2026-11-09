# ADR 0008: Self-hosting, license, and auth portability

- Status: Proposed
- Date: 2026-11-09
- Related: `docs/architecture.md` sections 3 and 12, `docs/audit.md` section 8
- Decision needed: confirm MIT, the compose scope, and the auth adapter

## Context

Kali is already MIT licensed. The brief requires an open and self-hostable product, a documented `docker compose` path, feature flags for paid external services, and a license decision.

The current auth stack is Neon Auth, which is a managed service. A self-hoster cannot use it without Neon. The app calls `auth.getSession`, `auth.signUp.email`, `auth.handler`, and `auth.middleware` directly from `@neondatabase/auth/next`. That coupling must be reduced before a credible self-host path exists.

## Decision

Keep **MIT**. Do not gate core features behind a commercial license. Monetize the hosted service, support, and managed operations, not the source.

Self-host bundle:

```text
docker compose up
  app          Next.js standalone
  postgres     Postgres 16
  livekit      LiveKit server
  redis        Redis 7
  minio        object storage (recording, transcripts)
  egress       optional LiveKit Egress
  agent        optional caption agent
  caddy        TLS and reverse proxy
```

Feature flags:

- `BILLING_PROVIDER=none|paystack|stripe`
- `CAPTIONS_PROVIDER=none|assemblyai|deepgram|local`
- `STORAGE_DRIVER=minio|r2|s3`
- `AUTH_DRIVER=neon|better-auth`
- `TELEMETRY=enabled|disabled`, default disabled for self-host
- `RECORDING=enabled|disabled`
- `EMBED=enabled|disabled`

Auth adapter:

- Define a small internal interface: `getSession`, `requireUser`, `signUpWithEmail`, `signInWithEmail`, `signOut`, `handler`, and `middleware`.
- Hosted implementation wraps Neon Auth.
- Self-host implementation uses Better Auth against the same Postgres, or an OIDC provider.
- Keep the auth user id as the stable `users.id`. Do not leak provider-specific fields into the app.
- Implement the boundary in Phase 1, and the Better Auth implementation in Phase 6.

Self-host constraints to document honestly:

- LiveKit needs UDP and TCP ports, TURN, and TLS. A single container is not enough for real networks.
- Egress needs Chrome and capacity; recording is optional.
- The caption agent needs a speech provider key or a local model.
- Vercel cron is replaced by a worker container.
- Paystack and Stripe webhooks need a public HTTPS URL.
- Object storage must be private and backed up.
- Upgrades need migrations and a rollback path.

## Options considered

| Option | License | Pros | Cons |
| --- | --- | --- | --- |
| A. MIT, hosted SaaS, paid support | MIT | Trust, adoption, schools and communities can self-host, matches the brief | No license revenue, competitors can host it |
| B. Open core, gate SSO and audit | MIT plus commercial | License revenue, enterprise features | Community friction, more product surface, unclear at this stage |
| C. AGPL | AGPL | Forces hosted derivatives to publish changes | Deters commercial embedding, conflicts with the B2B embed thesis |

Recommendation: **A**. The embeddable SDK is the business surface. A permissive license makes it credible for schools, clinics, and small businesses to adopt and extend.

## Consequences

Positive:

- The open-source claim is real and demonstrable.
- Schools and communities can run Kali without a US cloud bill.
- The auth boundary improves testability even for the hosted product.
- A compose path becomes a sales asset for the embed and support business.

Negative:

- Self-host support can consume engineering time. Publish a support policy and a community channel.
- The auth adapter adds work before it pays off.
- Self-host deployments will hit LiveKit networking issues. The docs need a troubleshooting section, not just a compose file.
- Telemetry is off by default, so self-host performance data is limited.

## Cost impact

- No license cost.
- Compose images and CI smoke tests add build time, not runtime cost.
- Documentation and support are the real cost.
- A self-host reference deployment can run on a small VPS plus LiveKit's UDP/TURN requirements. Estimate $20 to $60 per month for a small community.

## Open questions

1. What is the support policy for self-host? Recommendation: community support only, with a paid support option later.
2. Should a Helm chart ship with the compose path? Recommendation: compose first, Helm after demand.
3. Is Better Auth the right self-host default, or should the first path support generic OIDC? Recommendation: Better Auth first, OIDC later.
4. Should telemetry be opt-in for self-host? Recommendation: yes, off by default, with a clear prompt.
5. Should enterprise SSO be open source too? Recommendation: yes, but not in the first self-host release.
