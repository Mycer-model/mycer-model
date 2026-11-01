# Build log

App: `replica-app/` (Next.js 14, TypeScript, Tailwind with the tokens from `replica/design`). Run: `npm install && npm run dev`. Tests: `npm test`.
Data layer is fake and in memory (`lib/data.ts`) with a mock generation provider (`lib/providers/mock.ts`). Swapping in the real backend and a real provider changes no screen code.

| screen | date | status | missing / notes |
| --- | --- | --- | --- |
| shell (nav, layout, tokens) | 2026-11-01 | done | credit balance shown in the sidebar |
| S02 home | 2026-11-01 | done | empty state and grid; no recents filter |
| S03 generate | 2026-11-01 | partial | no reference uploads, no moderation, no draft mode |
| S07 asset page | 2026-11-01 | partial | running, ready, failed, cancelled states; no comments; no video player (mock returns an image) |
| S12 plans and credits | 2026-11-01 | partial | shows balance and ledger only; no Stripe |
| S06, S09, S13, S15 | 2026-11-01 | stub | placeholder pages |
| S01 sign in | 2026-11-01 | stub | accounts arrive with replica-backend |

Verified: typecheck, `npm test` (6 pass), production build, headless browser run at 1440 and 390 wide covering create, ready and failed (with refund) with no console errors. Screenshots in `replica/clone-screens/`.
Harder than expected: none yet. Bigger than it looked: durable queue and credit settlement need a real job runner (Inngest) in the backend step.
Not checked: full keyboard-only pass on every screen, dark theme in the app, screenshot diff against the original (no reference screenshots exist).
