# Component specs: Jenni clone

Tokens: `tokens.json` (light), `tokens.dark.json` (dark); `tokens.css` and `tailwind.tokens.js` expose them as roles.
Theme follows the system and can be forced with `data-theme`. Motion respects `prefers-reduced-motion`.
Not measured from the original (editor is behind a login; Jenni's terms forbid using it to build a competitor), so values are
neutral placeholders chosen for long-form writing. `replica-brand` replaces them. No assets or copy taken.
Icons: Lucide (MIT). Base: shadcn/ui on Radix, Tiptap for the editor. Fonts: Inter (UI), Source Serif 4 (document body), both open (OFL).
Every interactive part: visible focus (2px `focus-ring`, 2px offset), full keyboard use. Contrast: 30 pairs per theme, 0 AA failures.

Layout: sidebar 240px, header 56px, right panel (chat, library, find papers) 380px, document page 760px centred on `canvas`.
Below 900px the sidebar becomes a drawer and the right panel a bottom sheet.

```
Button
  variants  primary, secondary, ghost, danger
  sizes     sm 32px, md 40px, lg 48px
  states    default, hover, active, focus-visible, disabled, loading
  tokens    primary: bg accent (hover accent-hover, active accent-active), text on-accent; danger: bg danger; disabled: disabled-bg + disabled-text; radius md; font sm/600
  a11y      real <button>; loading keeps the label (aria-busy)
  used on   all

Input / Textarea / Search field
  states    default, hover, focus, error, disabled
  tokens    border border-input, radius md, height 40px, text base
  a11y      visible label, error linked by aria-describedby
  used on   S01, S07, S08, S12

Editor page
  parts     canvas background, white page (bg) 760px wide, serif doc-body, doc-h1..h4
  states    empty (placeholder + "type / for blocks, @ to cite"), typing, readonly (viewer), commenting (commenter), offline (queued edits banner), failed to connect
  tokens    canvas, bg, text, font serif, shadow card
  a11y      role=textbox, aria-multiline; headings real h1..h4; Esc leaves menus
  used on   S03

Editor toolbar
  controls  undo/redo, block type, bold/italic/underline/strike, highlight (3 colours), link, lists, table, image, code, Cite, Autocomplete switch
  states    default, active mark, disabled (viewer), overflow menu on small widths
  a11y      Radix Toolbar, roving tabindex, shortcuts listed in tooltips
  used on   S03

Selection toolbar
  actions   Cite, Chat, AI Edit, Review
  tokens    surface-raised, shadow pop, radius md
  a11y      appears on selection, reachable by shortcut (Ctrl/Cmd+J edit, Ctrl/Cmd+Y chat)
  used on   S03

Ghost text suggestion (autocomplete)
  states    hidden, loading (quiet dots), shown, refine bar open, limit reached
  tokens    ghost-text colour, citation chips inline in citation-bg
  keys      Tab/Right accept, Alt+Right one word, Esc dismiss, Ctrl/Cmd+/ force
  a11y      suggestion mirrored in an aria-live=polite region; never steals focus
  used on   S03

Citation chip
  variants  parenthetical (Author, 2021), narrative, multiple, grouped
  states    default, hover (preview card with source + "Open PDF"), selected, broken (source deleted, danger underline)
  tokens    citation-bg, citation-text, radius sm
  a11y      button with accessible name = full reference; Enter opens the popover
  used on   S03, S05

Bibliography block
  states    empty, filled, style changed; heading follows style (References / Works Cited / Bibliography)
  a11y      semantic list; hanging indent by style
  used on   S03, S10

Chat panel
  parts     thread header (history, new), message list, composer with context pills, Web/Library mode pills (Off/Ask/On)
  states    empty, streaming, answer with citations, clarifying-question buttons, cancelled, failed (retry), limit reached (upgrade banner), source still processing
  tokens    surface, user message accent-soft, assistant message surface-raised
  a11y      list is aria-live=polite; stop button during streaming; composer announces character limit
  used on   S05

Mention menu (@ sources, / prompts)
  states    open, filtering, empty result
  a11y      combobox/listbox pattern, arrows + Enter
  used on   S05, S03

AI edit popover and diff
  states    command list, custom instruction, loading, diff shown, accepted, discarded, failed
  tokens    diff-add-bg/text, diff-remove-bg/text (never colour alone: also + and - markers or strike/underline)
  actions   Replace selection, Insert below, Try again, Discard
  used on   S06

Review panel and Review Mode
  panel     five review types, Run, stop, summary, category filters, Configure sources
  mode      editor locked, floating bar "3/15", Y accept, N reject, arrows move, Esc exits; Accept all / Reject all
  states    idle, running, no suggestions (not an error), results, running for another document, limit reached
  tokens    suggestion marks use highlight-1..3 plus an icon per category
  a11y      counter announced; every action reachable by keyboard
  used on   S11

Source card
  states    queued, processing, ready, failed, encrypted, duplicate warning, retracted/preprint badges
  parts     title, authors, year, journal, citation count, OA badge, Cite button, Add to library, collections menu
  used on   S07, S08

Collection tree
  states    collapsed, expanded, drag-over, renamed inline, delete with 8 s undo toast
  a11y      Radix tree pattern, arrows to move, F2 rename
  used on   S08

Upload dropzone
  states    idle, drag-over, uploading (progress), rejected (too large / too many pages / encrypted), done
  a11y      also a real file button; errors in text with the limit named
  used on   S08, S05

PDF viewer
  states    loading, processing OCR, ready, search results, jumped-to-passage highlight (highlight-1), error
  a11y      page landmarks, find with Ctrl/Cmd+F, zoom by keyboard
  used on   S09

Share dialog
  parts     email invite with role, people list with role menu, general access (Restricted / Anyone with link + role), copy link
  states    private, shared, pending invite (resend, cancel), request-access view for visitors
  a11y      Radix Dialog, focus trap, role menu as listbox
  used on   S12

Comment thread and margin marker
  states    open, resolved, editing, readonly (viewer cannot comment)
  tokens    comment-bg, on-comment
  used on   S13

Export dialog
  parts     format (Word, LaTeX, copy), layout preset, citation mode, include comments
  states    default, free plan (bibliography omitted notice with upgrade link), generating, done, failed
  used on   S14

Usage meter and upgrade banner
  states    ok, near limit (80%), at limit (AI paused), trial days left
  tokens    warning/danger with text, not colour alone
  a11y      progress role with value text
  used on   S16, every AI panel

Plan card
  states    current, recommended, monthly/annual toggle
  used on   S16

Modal, popover, tooltip, toast (with Undo), badge, tabs, switch, select, skeleton, empty state
  base      Radix; toast Undo lasts 8 s; skeleton respects reduced motion; every empty state = icon + one line + one action
```
