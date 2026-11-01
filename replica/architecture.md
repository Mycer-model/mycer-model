# Architecture: Runway clone

Inputs: `replica/recon.md`, `replica/features.csv`. Scope after rescope: **core loop + credits + projects**, with
Brand Kits, comments and the API as the second wave. Workflows editor, Agent, Characters, Ads, App Studio and
enterprise are later milestones. Size: M to L.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web app | Next.js (App Router) + TypeScript | one codebase for UI and server routes |
| styling | Tailwind with tokens from replica-design | |
| database | Postgres on Supabase | auth, storage and RLS in one managed service |
| ORM | Drizzle | typed, close to SQL |
| auth | Supabase Auth | email and Google, ties into RLS |
| payments | Stripe Checkout + Billing | subscriptions and one-off credit top-ups |
| jobs | Inngest | durable steps for generation polling, retries and refunds |
| files | Supabase Storage | provider output URLs are temporary, so copy them |
| email | Resend | receipts, low-credit and failure notices |
| hosting | Vercel | |
| generation | **provider adapter** (one interface, several providers) | see risks |

One database. No microservices. Mobile (Expo) is a later milestone and reuses the same API.

## Schema

See `replica/schema.sql` (10 tables, 1 view). Key decisions:

- `workspaces` own everything. Solo users get a workspace of one, so Team plan needs no migration.
- `generations` is a job. `request` is jsonb, validated per model in code, because valid ratio, duration and
  fields differ by model. The partial index serves the poller.
- **Credits are an append-only ledger.** Balance is a sum. `unique (generation_id, reason)` for generation and
  refund rows means a retry cannot double charge or double refund. `stripe_event_id` unique makes webhooks idempotent.
- Reserve credits when the job starts (negative ledger row), refund on failure or cancel. Whether to refund
  moderated failures is a product decision: the original does not.
- `assets` are our copies. `deleted_at` soft delete for the library, hard delete for GDPR requests.
- Access: **row level security**, member of workspace. The server (service role) writes `credit_ledger` and
  `generations`. Members only read.
- Plan rules live in code (credit grants, parallel generation limit, storage cap), not in the schema.

## API

Server actions for the app, plus a public REST API later.

| route | what it does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| POST /api/generations | validate per model, reserve credits, enqueue | member | model, request, project_id, idempotency key | generation id | F01 |
| GET /api/generations/:id | status and output | member | id | generation, assets | F01 |
| DELETE /api/generations/:id | cancel or delete, refund if cancelled | member | id | ok | F01 |
| POST /api/generations/:id/enhance | enhance a draft to full quality | member | id | generation id | F02 |
| GET /api/assets, GET /api/assets/:id | list and read | member | filters | assets | F01 |
| POST /api/uploads | signed upload for reference media | member | filename, type | upload url | F01 |
| CRUD /api/projects | projects, credit cap | member | | | F06 |
| CRUD /api/brand-kits | kits and items | member | | | F03 |
| POST /api/assets/:id/comments | comment | member | body | comment | F06 |
| POST /api/billing/checkout | start plan or top-up checkout | owner/admin | plan or credits | Stripe URL | F05 |
| POST /api/webhooks/stripe | grants, renewals, top-ups | Stripe signature | event | 200 | F05 |
| GET /api/credits | balance and usage | member | | balance | F05 |
| /v1/* public API | same generations contract with API keys | api key | | | F04 |

Jobs (Inngest): `generation.poll` (poll provider with backoff, copy output to storage, settle credits),
`credits.grant` (monthly plan grant, rollover for the top plan), `storage.cleanup`, `email.low_credit`.
Webhooks in: Stripe. Webhooks out: later, for the public API.

## Parts that bite

- **Generation is async and per-model.** Never reuse ratio or duration across models. Keep a model catalog table or file with the schema per model and its credit cost.
- **Idempotency.** Stripe webhooks and the poller both retry. Use the unique constraints above.
- **Credits vs failure.** Reserve first, settle after. A crash between reserve and enqueue must not lose credits: do both in one transaction.
- **Temporary provider URLs.** Copy to storage before the URL expires.
- **Rate limits and queueing.** A per-workspace parallel limit by plan. Queue the rest as `throttled`.
- **Content moderation.** Check the prompt before spending; the provider also moderates.
- **Storage cost.** Video is big. Enforce per-plan storage caps and a retention rule for free users.
- **Time zones.** Store timestamptz in UTC, render client-side.
- **GDPR deletion.** Delete assets and storage objects, anonymise ledger rows rather than deleting them.

## Risks (the three riskiest)

1. **Model supply.** Runway's models cannot be cloned. You need provider APIs under their terms. Some providers forbid resale or competing products, so check terms before building. The adapter keeps you from locking in.
2. **Unit economics.** Video generation is expensive per second. Credit prices must cover provider cost plus failures. Model the margin before choosing plan prices.
3. **Credit ledger correctness.** Money-like logic with retries, refunds and webhooks. Test it harder than anything else.

## Build order

1. **Vertical slice (ugly).** S01 sign up, S03 generate one video with one model, S07 see and download it. Tables: workspaces, members, generations, assets. Routes: POST/GET generations, uploads. Jobs: generation.poll. Free tier with a fixed credit grant. Proves stack, queue, storage and one provider.
2. **Credits and billing (musts).** credit_ledger, S12, Stripe checkout and webhook, plan grants, top-up. Image generation, model picker with cost, per-model schema, moderation, cancel and refund.
3. **Projects and library (musts).** S02 home, S06 projects, S07 asset page, delete, storage caps.
4. **Should-haves.** Draft and enhance, references, audio, upscaling, Brand Kits (S09), comments, team plan (S13), public API and keys (S15).
5. **Could-haves.** Workflows (S05), Agent (S04), Characters, Ads, App Studio, enterprise (S14), mobile (S17).
6. **The fixes** replica-entrepreneur finds, once it has run.

| milestone | screens | tables | routes |
| --- | --- | --- | --- |
| 1 slice | S01 S03 S07 | workspaces, members, generations, assets | 5 |
| 2 billing | S12 | credit_ledger | 4 |
| 3 library | S02 S06 | projects | 2 |
| 4 should | S09 S13 S15 | brand_kits, brand_kit_items, comments, api_keys | 5 |
