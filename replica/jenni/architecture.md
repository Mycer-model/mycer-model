# Architecture: Jenni AI clone

Inputs: `recon.md`, `features.csv`, plus the second pass over help.jenni.ai (autocomplete, chat, AI edit, reviews,
section prompts, sharing, plans, editor). Schema: `schema.sql` (26 tables, checked on Postgres 16 with a stubbed
auth schema and without pgvector; the `vector` column and HNSW index still need a Supabase run).
Never use Jenni's private endpoints. Open data only (OpenAlex, Crossref, Unpaywall, Semantic Scholar with their own keys and terms).

## Stack (one line): Next.js + TypeScript + Tiptap/Yjs on Supabase (Postgres, pgvector, Auth, Storage) + Claude API + Stripe, hosted on Vercel with one Hocuspocus worker on Fly.

| layer | choice | why |
| --- | --- | --- |
| web app | Next.js App Router + TS | boring, one codebase for UI and API routes |
| editor | Tiptap (ProseMirror) + custom nodes: citation, cross-ref, chart, table caption | matches the block list in the editor help page |
| realtime | Yjs + Hocuspocus on Fly (max 10 editors per doc) | needs a long-lived websocket, Vercel cannot hold it |
| database | Supabase Postgres + pgvector | one database; embeddings next to the data |
| auth | Supabase Auth | email + Google, RLS uses `auth.uid()` |
| files | Supabase Storage (PDFs, images, CSL) | signed URLs, size limit per plan checked server side |
| PDF processing | Inngest job: pdf text + page bboxes, OCR fallback (Tesseract/ocrmypdf on the Fly worker) | async, retries |
| LLM | Claude API (`claude-sonnet-5-5` default, haiku for cheap steps like autocomplete ranking); embeddings via a hosted embedding model | autocomplete needs low latency, chat needs quality |
| paper search | OpenAlex + Crossref (DOI/metadata) + Unpaywall (open PDFs) | replaces the 200M index legally |
| citations | citeproc-js with Zotero CSL styles (10,000+; ship 5 defaults, lazy load the rest; keep CC BY-SA attribution) | no custom formatter |
| export | docx (`docx` lib, native Word citation fields where possible), LaTeX zip with `.bib`, HTML | export page presets |
| payments | Stripe Checkout + Billing portal | plans Free/Plus/Pro, PPP coupons |
| email | Resend | invites, workflow done |
| jobs | Inngest | PDF ingest, reviews, workflows (3 to 20 min), usage resets |
| hosting | Vercel + Fly (collab worker) | |

## Schema notes (see schema.sql)

- Access: **row level security** on all 24 user tables. Shared docs go through `doc_role(doc)`
  (owner > editor > commenter > viewer; link access folds in). Writes to `subscriptions` and `usage_counters`
  are service role only, so users cannot give themselves quota.
- Document body is a Yjs blob (`document_snapshots.ydoc`) plus plain `text_content` for search. `citations`
  is a derived index rebuilt from the doc, used for bibliography, "used in" and exports.
- Hard constraints in the database: one running review per user (`one_running_review`), prompt text <= 5,000 chars,
  chat message <= 50,000 chars, one invite per (doc, email), one section prompt per heading.
- Usage metering: `usage_counters(user, feature, window_kind, window_start)`; day window (free autocomplete,
  midnight UTC), period window (Plus), lifetime (free chat/edit/workflow). Increment with
  `insert ... on conflict do update set used = used + 1 ... where used < limit returning` so two requests cannot both pass the limit.

## Limits (plans page is authoritative; conflict noted)

| feature | Free | Plus $12 | Pro $29 |
| --- | --- | --- | --- |
| autocomplete | 10/day | 5,000/mo | unlimited |
| AI edits | 5 lifetime | 500/mo | unlimited |
| chat messages | 5 lifetime | 500/mo | unlimited |
| reviews (each type counts, re-runs count) | 3/mo | 10/mo | unlimited |
| workflows | 3 lifetime | 10/mo | unlimited |
| PDF uploads | 10 | unlimited | unlimited |
| PDF size / pages | 25 MB / 150 | 100 MB / 500 | 100 MB (docs conflict: "unlimited") / 1,000 |
| full export + bibliography | no | yes | yes |

Your own pricing is a later decision (`/replica-launch`); keep limits in a `plans` config file, not hard-coded.

## API

Server actions or route handlers. Auth: Supabase session. "owner/editor/..." = `doc_role`.

| method path | what | who | flow |
| --- | --- | --- | --- |
| POST /api/documents | create doc (blank, or import docx/bib/DOI) | user | F01 |
| PATCH /api/documents/:id | title, language, style, locale, prompts, access | editor (access: owner) | F02 F06 |
| POST /api/documents/:id/archive, /restore | archive with 8 s undo, restore | owner | F01 |
| WS /collab/:id | Yjs sync (Hocuspocus; token carries role; viewers read-only) | any role | F06 |
| GET/POST /api/documents/:id/versions | list, restore | viewer / editor | F06 |
| POST /api/library/upload | signed upload URL, plan size/page check, queue ingest | user | F01 F03 |
| POST /api/library/import | bib, ris, DOI/PMID/ISBN, Zotero/Mendeley (one-way) | user | F04 |
| GET/PATCH/DELETE /api/sources/:id | metadata, collections | user | F04 |
| CRUD /api/collections | nested folders | user | F04 |
| GET /api/sources/:id/file | signed PDF URL + chunk bboxes | user | F03 F05 |
| GET /api/search/papers?q&year&minCitations&tab | OpenAlex search, All/Discover/Library | user | F04 |
| POST /api/autocomplete (stream) | suggestion from heading context + retrieved chunks; meters 1 on accept | editor | F01 |
| POST /api/chat/threads, /:id/messages (stream), /:id/cancel | chat with @mentions, web/library modes, code run, charts | user | F03 |
| POST /api/ai-edit | command + selection -> diff; accept meters | editor | F01 |
| POST /api/reviews, /:id/stop, PATCH /suggestions/:id | five review types, review mode actions | editor | F05 |
| POST /api/workflows, /:id/cancel | literature review, gap analysis | user | F05 |
| POST /api/documents/:id/invites, PATCH/DELETE | invite, role, resend, cancel | owner | F06 |
| POST /api/documents/:id/access-requests | request access | any signed in | F06 |
| POST /api/documents/:id/export?format=docx|tex|html&preset | export | viewer+ (bibliography: paid) | F07 |
| POST /api/billing/checkout, /portal | Stripe | user | F08 |
| GET /api/usage | counters for settings | user | F08 |
| webhook POST /api/webhooks/stripe | subscription lifecycle; dedupe on `stripe_events.id` | Stripe | F08 |

Background jobs: `ingest-pdf` (extract, OCR, chunk, embed, set `source_files.status`), `run-review`, `run-workflow`
(email on completion), `reset-usage` (daily 00:00 UTC for free autocomplete), `sync-subscription` (nightly reconcile with Stripe),
`purge-archived` (user-requested hard delete).

## Parts that bite

- **Grounding and trust:** every AI sentence must carry the chunk it came from (`citations.source_chunk_id`).
  Generate only from retrieved chunks; reject output whose quote does not appear in the chunk. Without this the headline feature is fake.
- **Metering races:** atomic conditional increment (above). Count autocomplete on accept, reviews per type per run.
- **Realtime:** Hocuspocus persists snapshots every N seconds and on last disconnect; offline queue is client side; role changes force a reconnect.
- **PDFs:** encrypted PDFs fail with a clear status; OCR is slow, so show `processing`; chat must refuse sources that are `queued`/`processing`.
- **Idempotency:** Stripe webhooks arrive twice; Inngest steps retry, so jobs write results with upserts.
- **Time zones:** all UTC; "free day" resets at midnight UTC, shown in the user's zone.
- **Copyright:** uploaded PDFs are the user's own copies, private to them. Never share chunks across users. Open-access full text only from Unpaywall.
- **Privacy/GDPR:** delete cascades from `profiles`; storage objects deleted by job; LLM provider must not train on user text.
- **Cost:** retrieval first, small model for ranking, cache embeddings per file, cap chat context.
- **Export fidelity:** Word native citation fields are fiddly; ship "hyperlink citations" first, native fields second.

## Build order

1. **Vertical slice (ugly):** S01 sign up -> S02 new doc -> S03 editor (Tiptap, autosave Yjs-less first) -> S08 upload one PDF
   (`ingest-pdf`) -> autocomplete suggests one sentence from that PDF with a citation chip -> bibliography under the text
   -> S14 export docx. Tables: profiles, documents, document_snapshots, sources, source_files, source_chunks, citations.
2. **Must-haves:** editor blocks, inline citations in 5 CSL styles + auto bibliography, library + collections, PDF reader with jump-to-passage (S09), paper search (S07), AI chat with @mentions (S05), usage metering + Stripe plans (S16), docx export.
3. **Should-haves:** AI edit with diff (S06), section prompts + outline builder (S04), Reviews (S11), sharing + roles + comments + version history (S12 S13), LaTeX export, 10,000 styles, Zotero/Mendeley import, OCR, math.
4. **Could-haves:** workflows (literature review, gap analysis), charts and code execution in chat, clipper (S17), realtime cursors polish, publishing, cloning, mobile.
5. **Fixes from `/replica-entrepreneur`** once it has run.

## Summary

Stack: Next.js + Tiptap/Yjs + Supabase (Postgres/pgvector) + Claude API + Stripe. 26 tables, about 25 routes plus 1 websocket and 1 webhook.
Riskiest: (1) grounded, traceable citations, (2) realtime editor with citeproc and docx fidelity, (3) metering and cost control for AI features.
Next: `/replica-design`.
