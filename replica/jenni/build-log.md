# Build log: Jenni clone ("Draftbook" is a placeholder name)

App: `apps/writer` (Next.js 15, Tiptap 3, Tailwind on the design tokens). Run: `cd apps/writer && npm install && npm run dev` (port 3100).
Data layer is fake (browser localStorage, `src/lib/store.ts`) with mutator names a real backend will keep. Seed sources are fictional and labelled "sample".
Tested by a Playwright click-through of F01 (16 checks, no console errors) at 1440px and 390px.

| ID | date | status | missing / notes |
| --- | --- | --- | --- |
| shell | 2026-11-01 | done | sidebar, mobile menu, auth guard, toast with 8 s undo |
| S01 login | 2026-11-01 | partial | stub sign-in; no social login, no verify-email state |
| S02 documents | 2026-11-01 | done | empty, loading, filled, archive+undo; no archived list or restore screen |
| S03 editor | 2026-11-01 | partial | headings, lists, bold, italic; ghost-text suggestions; @ and Cite picker; references block. Missing: tables, code, images, math, comments, selection toolbar, offline banner |
| S08 library | 2026-11-01 | partial | add by PDF or text, remove with undo. Missing: collections, filters, duplicates, PDF reader (S09) |
| S10 style | 2026-11-01 | partial | APA, IEEE selector in the document header; no locale or page-number toggle |
| S14 export | 2026-11-01 | partial | docx only; plain-text citations |
| S15 settings | 2026-11-01 | partial | switch + usage |
| S16 plans | 2026-11-01 | partial | limits page and local plan switch, no checkout |
| S04-S07, S09, S11-S13, S17 | - | not started | chat, AI edit, find papers, PDF reader, reviews, sharing, comments, clipper |

## Harder than it looked
- **Grounded suggestions need a model.** The stand-in only matches words, so it can suggest a sentence that is on-topic but not what the user means. The honest version needs retrieval + an LLM that must quote the chunk. Still the riskiest part.
- **Export read stale data:** saving is debounced, so the first export missed last edits. Fixed by exporting from the live editor.
- **PDF text extraction runs in the browser**, which is fine for a prototype but does not scale to OCR or 1,000-page files. Moves to the ingest job in /replica-backend.
- Fonts are system fallbacks for now (Inter and Source Serif 4 to be self-hosted).

## Next
`/replica-backend` (Supabase auth, schema.sql, storage, ingest job, real retrieval + model), then AI chat (S05), PDF reader (S09), find papers (S07).
