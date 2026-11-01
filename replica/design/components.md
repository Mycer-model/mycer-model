# Component specs

Tokens: `tokens.json`. Not measured from the original (no screenshots); values are neutral placeholders that
`replica-brand` replaces. Icons: Lucide (MIT). Base: shadcn/ui on Radix. Every interactive part has a visible
focus (2px ring, `accent`, 2px offset) and works by keyboard.

```
Button
  variants  primary, secondary, ghost, danger
  sizes     sm 32px, md 40px, lg 48px
  states    default, hover, active, focus-visible, disabled, loading
  tokens    primary: bg accent, text on-accent; radius md; font sm/600
  a11y      real <button>; loading keeps the label for screen readers (aria-busy)
  used on   all

Input / Textarea
  states    default, hover, focus, error, disabled
  tokens    border border-input, radius md, text base, height 40px
  a11y      label always visible, error text linked with aria-describedby
  used on   S01, S03, S04, S12

Prompt box (with reference slots)
  variants  text only, with image/video/audio reference slots
  states    empty, filled, over length limit, uploading, upload error
  tokens    surface-raised, border, radius lg, shadow card
  a11y      character counter announced politely; slots are buttons with labels
  used on   S02, S03, S04

Model picker
  variants  grouped by capability; shows credit cost per generation
  states    default, open, locked by plan (with upgrade hint), retired
  tokens    popover shadow pop, radius md
  a11y      combobox pattern (Radix Select/Command), arrow keys, type-ahead
  used on   S03

Generation card
  variants  video, image, audio
  states    pending, throttled, running (progress or spinner), succeeded, failed (reason), cancelled, moderated
  tokens    media-bg behind the player, on-media text, danger for failed
  a11y      status announced with aria-live; no meaning by colour alone (icon + text)
  used on   S02, S06, S07

Asset grid and player
  variants  grid, list; video, image, audio
  states    loading skeleton, empty, filled, error
  a11y      native <video controls>; captions slot; arrow-key navigation in grid
  used on   S06, S07

Comment thread
  states    empty, filled, posting, error
  a11y      list semantics; composer is a labelled textarea
  used on   S07

Plan card and credit meter
  variants  free, standard, pro, max, team; current, upgrade
  states    default, selected, current, disabled
  a11y      meter has role=meter with value and max; prices as text not images
  used on   S12, S16

Workflow node (later milestone)
  variants  input, model, compositing, output
  states    idle, running, error, selected
  a11y      canvas has a keyboard-accessible list view of the same nodes
  used on   S05

Modal / Dialog, Dropdown menu, Tabs, Tooltip, Toast
  base      Radix primitives
  states    open, closed, destructive confirm (modal), success/error (toast)
  a11y      focus trap and return focus (modal), Esc closes, toasts do not hold focus
  used on   all

Empty states
  rule      each list screen has its own: one line of copy written fresh, one primary action
  used on   S02, S06, S07, S09
```
