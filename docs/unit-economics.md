# Kali unit economics (Phase 0 draft)

- Status: draft for review, not a forecast
- Date: 2026-11-09
- Currency: USD unless marked NGN
- FX assumption: NGN 1,550 per USD. This is an assumption, not a quoted rate.
- Important: every usage number in this document is an estimate. Phase 2 must replace the bandwidth estimates with measurements. The model is built so those inputs can be swapped without changing the structure.
- Phase 1 uses the host account as the billing account. The word "workspace" below means one billing account. Until workspaces ship, one host maps to one workspace and the numbers do not change.

## 1. What this model answers

1. What does one participant-hour cost on LiveKit Cloud, by quality profile?
2. Which plan limits keep a plan profitable at realistic and heavy usage?
3. Where does the free tier lose money?
4. Which paid features (recording, captions) can be bundled, and which must be metered?
5. When does LiveKit Scale become cheaper than Ship?

It does not include salaries, support staff, taxes, refunds, chargebacks, legal, or marketing. Those belong in a company financial model, not a product unit model.

## 2. Price inputs

All provider prices were checked on 2026-11-09.

| Input | Price | Source |
| --- | --- | --- |
| LiveKit Build | $0, 5,000 participant minutes, 50 GB downstream | livekit.io/pricing.md |
| LiveKit Ship | $50/mo, 150,000 participant minutes, 250 GB downstream | livekit.io/pricing.md |
| Ship overage | $0.0005 per participant minute, $0.12 per GB | livekit.io/pricing.md |
| LiveKit Scale | $500/mo, 1.5M participant minutes, 3 TB downstream | livekit.io/pricing.md |
| Scale overage | $0.0004 per participant minute, $0.10 per GB | livekit.io/pricing.md |
| Video recording (transcode) | $0.02 per minute | livekit.io/pricing.md |
| Audio-only recording (transcode) | $0.005 per minute | livekit.io/pricing.md |
| Track egress | $0.001 per minute | livekit.io/pricing.md |
| LiveKit-hosted agent session | $0.01 per agent minute | livekit.io/pricing.md |
| AssemblyAI Universal-Streaming | $0.0025 per minute ($0.15 per hour) | livekit.io/pricing.md |
| Deepgram Nova-3 | $0.0048 per minute ($0.29 per hour) | livekit.io/pricing.md |
| Vercel Pro | $20/mo | vercel.com/pricing |
| Neon Launch | about $15/mo typical small database; model uses $20 | neon.com/pricing |
| Cloudflare R2 | $0.015 per GB-month, no egress fee | developers.cloudflare.com/r2/pricing |
| Upstash Redis | about $10/mo assumed at MVP volume | assumption |
| Paystack local card | 1.5% + NGN 100, capped at NGN 2,000 | paystack.com/pricing |
| Paystack international card | 3.9% + NGN 100 | paystack.com/pricing |
| Stripe domestic | 2.9% + $0.30 | stripe.com/pricing |
| Stripe international | +1.5% on international cards, +1% currency conversion | stripe.com/pricing |

The model uses Ship, not Build, for production. Build is a development sandbox. A real free tier on Build would exhaust its 5,000 minutes quickly and has no team or support features.

## 3. Bandwidth assumptions

These are the numbers Phase 2 must validate. They are not measurements.

| Profile | Video | Audio | Estimated total | Why |
| --- | --- | --- | --- | --- |
| Audio only | none | 24 kbps Opus, DTX, RED | about 15 MB per participant-hour | 15 MB per hour is about 35 kbps including WebRTC overhead |
| Data saver | 240p, 12 to 15 fps, about 200 kbps | 24 kbps | about 100 MB per participant-hour | 100 MB per hour is about 233 kbps total; video gets about 200 kbps |
| Normal | 720p30, 2.5 Mbps top layer, adaptive | 24 kbps | about 500 MB per participant-hour | average downstream around 1 Mbps after SVC and dynacast |

Two consequences:

- 360p at 100 MB per hour is not realistic for motion-heavy video. The 100 MB target maps to 240p. Treat 360p as an adaptive step around 150 to 180 MB per hour, and report it honestly.
- Normal video hits the Ship data allowance before the minute allowance. Total data is the binding constraint, not participant minutes.

## 4. Variable cost per participant-hour

Minutes: $0.0005 per minute, so $0.03 per participant-hour. Data: $0.12 per GB after the included allowance.

| Profile | Data per hour | Data cost | Minutes cost | Total variable cost |
| --- | --- | --- | --- | --- |
| Audio only | 15 MB | $0.0018 | $0.0300 | $0.0318 |
| Data saver | 100 MB | $0.0120 | $0.0300 | $0.0420 |
| Normal | 500 MB | $0.0600 | $0.0300 | $0.0900 |

These are marginal costs after the included allowance. At low volume, the $50 base fee is the real cost, and the marginal rate overstates the per-hour cost. The model uses marginal cost for plan margin and the base fee for break-even.

## 5. Included allowance and the binding constraint

Ship includes 150,000 participant minutes and 250 GB downstream.

| Profile | Participant-hours covered by minutes | Participant-hours covered by data | Binding limit |
| --- | --- | --- | --- |
| Audio only | 2,500 | 16,667 | Minutes |
| Data saver | 2,500 | 2,500 | Both at the same point |
| Normal | 2,500 | 500 | Data |

At normal quality, the 250 GB allowance covers about 500 participant-hours, or 250 two-person hours. The remaining 2,000 participant-hours are unused. This is why the low-data profile is not just a user feature; it is the main lever on gross margin.

## 6. Plan proposal used in the model

This is a starting proposal, not a final price card. Limits are fair-use, not per-call caps. The one-hour cap is removed.

| Plan | Price | Participants | Fair-use participant-hours | Recording | Captions and transcripts | Other |
| --- | --- | --- | --- | --- | --- | --- |
| Free | $0 | 8 | 30 per workspace per month, soft | none | none | Data saver default on cellular, 7-day chat |
| Pro | $7/mo | 25 | 60 per workspace per month, soft | none | 5 hours live captions | 90-day chat, custom room slug |
| Pro Plus | $15/mo | 100 | 100 per workspace per month, soft | 3 hours video per month | 10 hours captions and transcripts | Custom domains, 1,000 API participant minutes, 30-day recording retention |

Fair-use limits are communicated in plain language and enforced softly first: warn, then throttle new sessions, then require an upgrade. They are not a return to the hidden 60-minute cap.

## 7. Plan margin at modeled usage

Assumptions:

- Pro mix: 60% normal, 30% data saver, 10% audio.
- Pro Plus mix: 50% normal, 40% data saver, 10% audio.
- Captions at AssemblyAI rate ($0.15 per hour) with a self-hosted agent.
- Recording at $0.02 per minute plus R2 storage at 0.6 GB per hour.
- Payment fees: Paystack local card, 1.5% + NGN 100.

| Plan and usage | Net revenue | Calls | Recording | Captions | Variable cost | Contribution | Margin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Free, 5 hours, mixed | $0 | $0.25 to $0.65 | $0 | $0 | $0.25 to $0.65 | negative | negative |
| Pro, 20 hours | $6.83 | $1.40 | $0 | $0.75 | $2.15 | $4.68 | 68% |
| Pro, 50 hours | $6.83 | $3.49 | $0 | $0.75 | $4.24 | $2.59 | 38% |
| Pro, 100 hours (above fair use) | $6.83 | $6.98 | $0 | $0.75 | $7.73 | -$0.90 | negative |
| Pro Plus, 40 hours + 3 hours recording + 10 hours captions | $14.75 | $2.60 | $3.63 | $1.50 | $7.73 | $7.02 | 48% |
| Pro Plus, 80 hours + 3 hours recording + 10 hours captions | $14.75 | $5.20 | $3.63 | $1.50 | $10.33 | $4.42 | 30% |
| Pro Plus, 100 hours + 3 hours recording + 10 hours captions | $14.75 | $6.50 | $3.63 | $1.50 | $11.63 | $3.12 | 21% |

Extra recording hours are billed at $3 per hour. A fifth hour adds about $6 of revenue against about $2.42 of marginal Egress and storage cost, so the table uses only the included 3 hours and treats overage as a separate, healthier line.

Findings:

- Pro is healthy at typical usage and still positive at 50 participant-hours. It loses money somewhere above 70 to 80 hours with captions.
- Pro Plus is healthy at typical usage but thin at 80 hours, especially if recording and captions are both used heavily.
- Any "unlimited recording" plan loses money. Recording is the most expensive feature in the product.
- Captions are cheap compared with recording, but only if the agent is self-hosted. A LiveKit-hosted agent adds $0.60 per hour, which makes a 10-hour Pro Plus caption bundle cost $6.00 and pushes Pro Plus close to break-even at typical usage.

## 8. Free tier cost

Free is the largest unbounded risk because it has no revenue. The 8-participant cap and the data saver default are the controls.

| Monthly usage per active free workspace | Mix | Estimated cost |
| --- | --- | --- |
| 2 hours | 40% normal, 40% saver, 20% audio | about $0.26 |
| 5 hours | 50% normal, 40% saver, 10% audio | about $0.65 |
| 10 hours | 60% normal, 30% saver, 10% audio | about $1.30 |

At 1,000 active free workspaces and 5 hours average, the cost is about $650 per month. At a 3% conversion to Pro, 30 subscribers contribute about $204. Free loses money at that conversion and usage level. At 5 hours with a saver-heavy mix (70% saver, 20% normal, 10% audio), the cost drops to about $0.25 per workspace, or $250 per 1,000, which 3% conversion covers before fixed costs.

The free tier works if:

- Data saver is the default on cellular.
- Audio-first onboarding is prominent.
- The 8-participant cap is enforced.
- Free does not include recording or transcripts.
- Fair-use limits stop a single workspace from consuming hundreds of hours.
- Conversion is above 4 to 5 percent, or paid plans carry enough margin to subsidize free.

If free usage averages 10 hours per workspace and conversion is 3%, the free tier is a cash loss. That is a deliberate decision to revisit after 90 days, not a surprise to discover later.

## 9. Fixed costs and break-even

| Item | Monthly |
| --- | --- |
| LiveKit Ship | $50 |
| Vercel Pro | $20 |
| Neon Launch | $20 |
| Upstash Redis | $10 |
| R2 storage | $2 |
| Domain and email | $2 |
| Total | $104 |

Break-even before salaries and marketing:

| Mix | Weighted contribution per subscriber | Subscribers to cover $104 |
| --- | --- | --- |
| 100% Pro at 20 hours | $4.68 | 23 |
| 100% Pro Plus at typical usage | $7.02 | 15 |
| 70% Pro, 30% Pro Plus | $5.38 | 20 |

At 100 subscribers (70/30 mix), MRR is $940, variable cost is about $382, fixed cost is $104, contribution is about $454, or 48%. At 1,000 subscribers, MRR is $9,400, variable cost is about $3,824, fixed cost is about $300 with volume discounts, contribution is about $5,276, or 56%. These are simple models, not a P&L.

## 10. LiveKit plan selection

The crossover between Ship and Scale depends on normal-video usage. The table assumes 20 participant-hours per user per month and 500 MB per hour.

| Paying users | Participant-hours | Participant minutes | Downstream data | Ship cost | Scale cost | Cheaper |
| --- | --- | --- | --- | --- | --- | --- |
| 100 | 2,000 | 120,000 | 1,000 GB | $140 | $500 | Ship |
| 300 | 6,000 | 360,000 | 3,000 GB | $485 | $500 | Ship, barely |
| 500 | 10,000 | 600,000 | 5,000 GB | $845 | $700 | Scale |
| 1,000 | 20,000 | 1,200,000 | 10,000 GB | $1,745 | $1,200 | Scale |

The crossover is around 300 to 400 paying users at normal-video usage. If the customer base uses data saver and audio more, the crossover moves later because the downstream allowance stretches further. Recalculate quarterly with measured data.

## 11. Naira pricing

At NGN 1,550 per USD, the USD prices convert to about NGN 10,850 for Pro and NGN 23,250 for Pro Plus. Round to customer-friendly prices:

| Plan | USD | Naira proposal | Paystack fee | Net naira | Net USD equivalent |
| --- | --- | --- | --- | --- | --- |
| Pro | $7 | NGN 10,900/mo | NGN 263.50 | NGN 10,636.50 | $6.86 |
| Pro Plus | $15 | NGN 22,900/mo | NGN 443.50 | NGN 22,456.50 | $14.49 |

Paystack is cheaper than Stripe at these ticket sizes:

| Plan | Paystack effective fee | Stripe effective fee | Difference |
| --- | --- | --- | --- |
| Pro $7 | about 2.4% | about 7.1% | Paystack saves about $0.33 |
| Pro Plus $15 | about 1.9% | about 4.9% | Paystack saves about $0.49 |

For international customers, Stripe is the better experience despite the higher fee. For Nigerian customers, Paystack local cards and bank transfer are materially cheaper.

FX sensitivity:

| FX | NGN 10,900 in USD | Pro contribution at 20 hours | Pro contribution at 50 hours |
| --- | --- | --- | --- |
| NGN 1,300 | $8.38 | $6.23 | $4.14 |
| NGN 1,550 | $7.03 | $4.88 | $2.79 |
| NGN 1,800 | $6.06 | $3.91 | $1.82 |
| NGN 2,000 | $5.45 | $3.30 | $1.21 |

The naira price should be reviewed quarterly, or priced with a buffer (for example NGN 11,900 for Pro) so a depreciation does not erase the margin. A fixed naira price is a promise to local customers; a buffer is how the business survives the promise.

A lower local price, for example NGN 7,900, improves adoption but cuts Pro contribution to about $2.80 at 20 hours, or 40%. That may be a deliberate growth bet, but it should be a decision, not a default.

## 12. Recording economics

| Item | Cost |
| --- | --- |
| 1 hour video recording, Egress transcode | $1.20 |
| Storage for 1 hour at 0.6 GB, R2 | $0.009 per month |
| Total first month | about $1.21 |
| 1 hour audio-only track, Egress | $0.06 |
| Storage for audio at 0.05 GB, R2 | about $0.001 per month |
| Total audio | about $0.06 |

Video recording is about 20 times more expensive than audio recording. Bundle video recording only on Pro Plus, keep the included hours small (3 per month), and price overage at $3 per hour or more. Audio recording can be a cheaper add-on for notes and podcasts.

Do not include unlimited recording on any plan. The Egress cost scales linearly with usage and has no data-transfer offset.

## 13. Captions and summaries economics

| Configuration | Cost per hour | 10 hours per month |
| --- | --- | --- |
| Self-hosted agent + AssemblyAI | $0.15 | $1.50 |
| Self-hosted agent + Deepgram | $0.29 | $2.90 |
| LiveKit-hosted agent + AssemblyAI | $0.75 | $7.50 |
| LiveKit-hosted agent + Deepgram | $0.89 | $8.90 |

The agent host itself (a small VPS or Fly machine) costs about $5 to $20 per month and can serve multiple rooms. That is negligible per hour unless concurrency is high.

Summaries add an LLM pass over the transcript, roughly $0.01 to $0.05 per session. This is not a material cost.

Implication: Pro Plus can include 10 hours of self-hosted captions and transcripts for about $1.50. The same bundle at LiveKit-hosted agent pricing is about $7.50 and destroys the margin. Self-hosting the agent is an economic requirement, not a preference.

## 14. Scenarios that lose money

| Scenario | Why it loses | Control |
| --- | --- | --- |
| Free workspace with heavy normal-video use | No revenue, data overage | Data saver default, 8-participant cap, fair use |
| Pro user above 70 to 80 participant-hours (above the 60-hour fair-use cap) | Variable cost approaches price | Fair-use warning, upgrade prompt |
| Pro Plus with hosted captions and heavy usage | Agent fee stacks on recording and calls | 3-hour recording bundle, self-hosted agent, overage pricing |
| Unlimited recording on any plan | Linear Egress cost | Never offer it |
| International customer paying in naira heavily devalued | USD costs, naira revenue | Quarterly price review, buffer, Stripe for international |
| High caption attach rate on Pro | 5 hours included, but heavy users exceed it | Meter caption minutes, overage or upgrade |

## 15. Recommendations

1. Keep the public prices at $7 and $15. Price naira at NGN 10,900 and NGN 22,900, with an annual plan at 10 months for 12.
2. Free: 8 participants, no per-call cap, 30 participant-hours per workspace per month soft fair use, no recording or transcripts, data saver default on cellular.
3. Pro: 25 participants, 60 fair-use hours, 5 caption hours, 90-day chat, no recording.
4. Pro Plus: 100 participants, 100 fair-use hours, 3 recording hours, 10 caption and transcript hours, 1,000 API participant minutes, custom domains.
5. Self-host the caption agent from the first release. Do not use LiveKit-hosted agent minutes for the bundled caption allowance.
6. Meter recording at $3 per hour after the included 3 hours. Meter additional caption hours at $0.50 per hour or require an upgrade.
7. Review free-tier cost per active workspace monthly. If it exceeds $1, tighten the fair-use limit or make data saver the default for all new free rooms.
8. Re-run this model after Phase 2 measurements. Replace every bandwidth estimate with a measured number before publishing any low-data claim.

## 16. What is still unknown

- Actual bytes per participant-hour on real Nigerian networks and devices.
- Actual average participant-hours per plan.
- Actual caption attach rate and provider accuracy.
- Actual recording attach rate.
- Paystack subscription success rates, renewal failures, and chargeback behavior.
- Naira volatility and the right review cadence.
- LiveKit price changes.
- Support cost per workspace, which is often larger than infrastructure at small scale.

The model is useful because it makes the assumptions explicit. It is not useful as a promise until the measurements replace the estimates.
