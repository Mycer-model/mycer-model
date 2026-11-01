# Backend status

Rule from the skill: **you** create the Supabase, Stripe, Resend and provider accounts and put the keys in `replica-app/.env.local`. Nothing here used a real key. `replica-app/.env.example` lists every variable.

## Done and verified

- **Migration** `replica-app/db/migrations/0001_init.sql`: 12 tables, 1 view, row level security on every table.
- **RLS test** `replica-app/db/test/run.sh`: runs against a scratch Postgres with a stub of Supabase's `auth` schema. Two users: the second sees nothing of the first, cannot update or delete across workspaces, cannot insert into another workspace, and members cannot write `credit_ledger` or `generations`. A deliberately broken policy made the test fail, so it catches real mistakes. It found and fixed four gaps in my first schema (no RLS on `workspaces`, `members`, `brand_kit_items`, `comments`; members could write money tables; the balance view bypassed RLS).
- **Stripe webhook** `app/api/webhooks/stripe`: verifies the signature on the raw body, records the event id, idempotent handlers for subscription updated/deleted, `invoice.paid` (plan credit grant), `invoice.payment_failed`, and top-up checkout. Tested: no signature, wrong secret and tampered body are rejected (400); a valid event is handled once and a repeat is a no-op. Unit tests cover the handlers.
- **Server validation** with zod on `POST /api/generations`; bad bodies get 400.
- **Rate limit** on generation creation (20 per minute per client, in memory).
- **Dependencies**: `npm audit --omit=dev` reports 0 vulnerabilities. This needed Next 16 and React 19 (the 14.x line has an open critical advisory). A regression from that upgrade (the mock provider's task table living in a module copy) was found by the browser test and fixed.

## Not done: needs you

| item | what you do | then |
| --- | --- | --- |
| Supabase project | create it, put URL, anon key, service key, `DATABASE_URL` in `.env.local` | I apply the migration, add Auth (email + Google), swap the fake data layer for Postgres |
| Stripe (test mode) | create products and prices for Standard, Pro, Max, Team and a 1,000-credit top-up; add the price ids and webhook secret | I add Checkout and Customer Portal routes and connect the webhook to Postgres |
| Resend | create an account, verify a sending domain | I add receipts, low-credit and failure emails |
| Generation provider | choose one and read its terms on resale | I add the adapter behind `lib/providers/types.ts` |
| Inngest | create an account | I move polling and credit settlement to durable jobs |
| Google OAuth | create your own OAuth app | sign in with Google |

## Not built yet

Auth, account deletion, roles in code, uploads with size and type limits, email, jobs with retries, content moderation, seed script, Postgres-backed data layer, public API with keys. The data layer is still in memory.

## Security checklist

- [x] secrets only in env vars, `.env*` ignored (`.env.example` has names only)
- [x] input validated on the server on the one write route that exists
- [ ] input validation on every route (only the routes that exist so far)
- [x] authorisation tested with a second user (at the database level; no app auth yet)
- [~] rate limits: generation creation only; auth and email limits come with those features
- [x] webhook verifies signatures
- [ ] uploads: size and type limits (no uploads yet)
- [x] no user data in URLs or logs (prompts are never logged)
- [x] dependencies audited
- [ ] privacy policy listing every processor
- [ ] backups enabled on the host (check in Supabase once the project exists)

## Early lead-time warning

Google OAuth verification (for sign in beyond basic scopes) and any ad-platform API review take weeks. Start those before you need them.
