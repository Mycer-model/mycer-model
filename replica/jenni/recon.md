# Recon map: Jenni AI (web app)

Scope: core loop only. Library + cited writing + AI chat/autocomplete + export. Teams/institutions, SEO tool pages and mobile are out.
For: the user's own product (proposed default, confirm)
Date: 2026-11-01
Output folder: `replica/jenni/` (the Runway recon already owns `replica/recon.md`).

## Confidence note (read first)

The editor itself sits behind a login (app.jenni.ai) and was NOT opened. Everything below comes from public pages.
Feature list and limits: high confidence (pricing page + help center). Screen list and layouts: inferred, unverified.
**Terms warning:** jenni.ai/terms (section 7) forbids using the Services "as part of any effort to compete with us".
So do NOT sign in to a Jenni account to study it for this clone. Public sources only. Screenshots in `screens/` must be public ones.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing site | https://jenni.ai/ | core loop, feature claims |
| 2 | pricing | https://jenni.ai/pricing | Free / Plus $12 / Pro $29; comparison table checkmarks did not extract |
| 3 | help center | https://help.jenni.ai/ | most complete feature list; only 5 pages read |
| 4 | citation management | https://help.jenni.ai/docs/research/citation-management/ | read |
| 5 | library | https://help.jenni.ai/docs/research/library/ | read |
| 6 | PDF reader | https://help.jenni.ai/docs/research/pdf-reader/ | read |
| 7 | browser extension | https://help.jenni.ai/docs/research/browser-extension/ | read |
| 8 | exporting | https://help.jenni.ai/docs/export-and-import/exporting/ | read |
| 9 | changelog | https://jenni.ai/changelog | Aug-Oct 2026 |
| 10 | terms | https://jenni.ai/terms | competing-use clause |
| 11 | unread help pages | ai-autocomplete, ai-chat, ai-editing, reviews, sharing, document-editor, importing, plans-and-billing, settings under help.jenni.ai/docs/ | read these next |

## Core loop

Import sources (PDF upload, Zotero/Mendeley/BibTeX/RIS, DOI, or search 200M+ papers) -> write in the editor while
AI autocomplete suggests cited sentences grounded in those sources -> insert one-click citations, verify claims
against the source PDF -> export to .docx / LaTeX / HTML.

## Screens (unverified: inferred)

| ID | screen | route / how to reach | purpose | key components | states |
| --- | --- | --- | --- | --- | --- |
| S01 | Sign up / login | /register, app root | account | form, social login | error, verify email |
| S02 | Documents home | after login | list/create documents | doc list, new doc, search | empty, filled |
| S03 | Editor | open doc | rich-text writing, tables, code blocks, math, images | toolbar, Cite button, autocomplete ghost text, side panels | empty, typing, suggestion shown, offline/saving |
| S04 | Outline builder | editor, Generate Headings | headings from a topic | prompt, heading list | empty, generating |
| S05 | AI chat panel | editor sidebar | cited answers over library; `@` mentions PDFs, `/` prompts; code run, charts | chat, attachments, saved prompts | empty, streaming, limit reached |
| S06 | AI edit | select text | rewrite/expand/paraphrase selection | inline menu, diff accept/reject | loading, limit reached |
| S07 | Find papers | editor sidebar | search academic index; tabs All/Discover/Library | filters (year, citations), result card, Cite | empty, results, none |
| S08 | Library | Library tab | sources, collections | list, collection tree, filters, upload menu, Library Issues (duplicates) | empty, filled, upload error |
| S09 | PDF reader | open source | read PDF, text search, jump from claim to source passage | viewer, search, highlights | processing (OCR), encrypted error |
| S10 | Citation style / bibliography settings | editor | style, locale, page numbers, bibliography | style picker | default |
| S11 | Reviews | editor | claim analysis: Misrepresented, Contradicted, Unsupported, Weakly Supported, Overstated; proofreading | issue list, inline feedback | running, results, limit reached |
| S12 | Share dialog | Share | roles editor/commenter/viewer, link access, read-only publish | invite, role select | private, shared |
| S13 | Comments + version history | editor | comments, restore versions | thread, version list | empty, filled |
| S14 | Export dialog | three-dot menu | docx/LaTeX/clipboard, presets, comments toggle | preset select | free (no bibliography), paid |
| S15 | Settings + connections | account | Zotero/Mendeley, language, privacy | form | default |
| S16 | Pricing + billing | /pricing | plans and limits | plan cards | free, paid |
| S17 | Browser clipper | extension popup | save paper to collections from a page | popup, collection picker | supported/unsupported page |

## Flows

- F01 First paper: S01 -> S02 -> S03 -> S08 (upload PDF) -> S03 (autocomplete cited sentence) -> S14. Happy path ~10 clicks. edge: PDF too big, scanned PDF, daily autocomplete limit.
- F02 Add a citation: S03 (type `@` or Cite) -> pick source -> inline citation + auto bibliography. edge: DOI paste (citation/link/text), no page number.
- F03 Ask the library: S05 -> `@PDF` -> cited answer -> open passage in S09. edge: encrypted PDF, chat limit.
- F04 Find and add papers: S07 -> filter -> Cite or add to library (S08). edge: preprints toggle, no results.
- F05 Verify claims: S11 -> issue -> jump to source passage. edge: unsupported claim with no source.
- F06 Share and collaborate: S12 -> invite -> S13 comments. edge: viewer cannot edit.
- F07 Export: S14 -> docx (native Word citations or hyperlinks) / LaTeX zip. edge: free plan omits bibliography.
- F08 Upgrade: any limit hit -> S16.

## Components

Rich-text editor with toolbar, ghost-text autocomplete, Cite popover, citation chip, bibliography block, side panel
tabs, chat composer with `@`/`/` menus, source card, collection tree, filter bar, upload dropzone, PDF viewer,
modal/dialog, toast with undo (8 s), role selector, limit/paywall banner, plan card.

## Inferred data model (guesses unless noted)

- User, Plan, UsageCounter(user, feature, period, used) high (limits are per day/month)
- Document(id, owner, title, content json, citation_style, locale) high
- DocumentVersion(doc, content, created_at) high
- Collaborator(doc, user/email, role: editor|commenter|viewer) high
- Comment(doc, anchor, author, body, resolved) medium
- Source(id, user, type 35+, title, authors, year, doi/pmid/isbn, metadata json, open_access, impact_factor) high
- SourceFile(source, storage_key, pages, ocr_status) high
- Collection(id, user, parent_id) + CollectionSource(m2m) high
- Citation(doc, source, position, kind: parenthetical|narrative|multiple|grouped, page) high
- ChatThread / ChatMessage(role, body, cited passages, attachments) medium
- SavedPrompt(user, text) medium
- Review(doc, run_at) / ReviewIssue(category, range, source_passage, message) medium
- ShareLink(doc, access) medium
- CitationStyle (bundled CSL files, 10,000+) high; PaperIndex (external search, not stored) high

## Hard parts

1. Grounded generation with traceable citations: retrieval over uploaded PDFs, sentence -> source passage mapping.
2. Academic paper search (200M+ papers): rely on open indexes (OpenAlex, Crossref, Semantic Scholar APIs, check their terms), not a copy of Jenni's index.
3. Rich-text editor with realtime collaboration and CSL citation rendering (Tiptap/ProseMirror + Yjs, citeproc-js).
Also: PDF parsing + OCR, docx/LaTeX export with native Word citations, per-plan usage metering.

## What cannot be cloned (skip)

- Jenni's 200M-paper index and 10M full-text corpus (use open APIs instead)
- Jenni's trained models, prompts and tuning
- Its users, brand and published-papers pages
- Their fixed claim "8M users"; Zotero CSL files are open (CC BY-SA, keep attribution)

## Size

16 screens, 8 flows, ~14 entities. **Size: L** (a quarter) for parity on core loop; **M** if v1 drops Reviews, collaboration and the clipper.

## Next

Read the unread help pages (autocomplete, chat, reviews, sharing, plans), then `/replica-architect`.
