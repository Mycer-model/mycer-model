# Test plan

Scope: what exists in `replica-app/` today (data layer is in memory, generation provider is a mock). Flows that are not built yet are listed at the end, not tested. Tests run only against the local clone, never the original.

Run: `cd replica-app && npm run build && PW_CHROMIUM_PATH=<chromium> npm run e2e` (the variable is only needed in this sandbox). Unit tests: `npm test`. Database RLS: `db/test/run.sh` (needs a scratch Postgres).

Every spec fails on console errors and on any 5xx response. `F01-A1` runs an axe scan (WCAG 2 A/AA) on every screen.

## F01 Create something and see the result

| id | case | automated | result |
| --- | --- | --- | --- |
| F01-H1 | create an image, see running state, then the image and a download link | e2e | pass |
| F01-E1 | empty or blank prompt cannot be submitted | e2e | pass |
| F01-E2 | prompt over the model limit is blocked before sending | e2e | pass (after B-002) |
| F01-E3 | emoji and accents in the prompt still give a result | e2e + unit | pass (after B-001) |
| F01-E4 | double click on Create makes one charge | e2e | pass |
| F01-E5 | failed generation returns the credits | e2e | pass |
| F01-E6 | stopping a running generation returns the credits | e2e | pass |
| F01-E7 | switching model keeps the shape and length valid | e2e | pass |
| F01-E8 | not enough credits: button disabled, server answers 402 | e2e | pass |
| F01-E9 | no horizontal scroll at 390px, with a long unbroken prompt | e2e | pass (after B-003) |
| F01-E10 | keyboard only: fill the prompt, tab to Create, press Enter | e2e | pass |
| F01-N1 | invalid bodies, bad ratio, unknown model, unknown id | e2e | pass |
| F01-N2 | unknown asset id shows a not-found page (404) | e2e | pass |
| F01-N3 | refresh in the middle of a generation still ends in a result | e2e | pass |
| F01-A1 | axe scan on all 8 screens | e2e | pass |

## F05 Plans and credits (partial)

| id | case | automated | result |
| --- | --- | --- | --- |
| F05-H1 | billing page shows balance and ledger | e2e | pass |
| F05-N1 | webhook refuses unsigned requests | e2e | pass |
| F05-U | ledger reserve and refund are idempotent; webhook events handled once | unit (13 tests) | pass |
| F05-DB | second user sees and changes nothing; members cannot write money tables | SQL | pass |

## Not testable yet (feature not built)

F02 draft then enhance, F03 Agent, F04 Workflows, F06 team and comments, F07 MCP and plugins; sign in, account deletion, uploads, email. Payments end to end need your Stripe test keys; use test card `4000 0000 0000 0002` for the declined case when they exist.

## Manual checklist (needs a person or real services)

- [ ] a real provider returns a real video and the player works
- [ ] receipts and failure emails arrive
- [ ] Stripe Checkout in test mode, card declined, Customer Portal cancel
- [ ] dark theme in the app (tokens exist, not wired into a switch)
- [ ] screen reader pass on the generate form and the asset page
- [ ] slow network and offline behaviour
