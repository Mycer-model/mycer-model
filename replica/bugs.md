# Bugs

Only reproduced bugs are listed. All three were found by the first test run, fixed in the same change with the test kept.

| id | severity | title | status |
| --- | --- | --- | --- |
| B-001 | S1 | An emoji at the caption cut crashes the mock provider and breaks the home page for everyone | fixed |
| B-002 | S3 | A prompt over the model limit is not blocked in the form | fixed |
| B-003 | S3 | Home page scrolls sideways on a phone when a prompt has a long unbroken word | fixed |

## B-001 (S1)

Steps: create an image with a prompt of 59 accented characters followed by an emoji, then open the home page.
Expected: the result appears and the home page lists it.
Actual: the poll threw `URIError: URI malformed` (the 60 character caption cut split the emoji). The generation stayed "running" and every load of the home page threw, so the core list was blocked for all users until restart.
Cause: `slice(0, 60)` cuts by UTF-16 unit. Also, one failing provider call was able to break the whole list.
Fix: cut by code point; a provider error now fails only that generation and returns its credits. Tests: `tests/provider.test.ts` (failed before the fix, passes after), e2e `F01-E3`.

## B-002 (S3)

Steps: pick Draft video (limit 800), paste 900 characters.
Expected: Create is disabled and the counter is red.
Actual: Create stayed enabled; the server refused it after a round trip.
Fix: the button is disabled over the limit. Test: e2e `F01-E2`.

## B-003 (S3)

Steps: at 390px width, have a creation whose prompt is 120 characters with no spaces, open the home page.
Expected: no sideways scroll.
Actual: the grid column grew to 959px; `break-words` does not lower a grid item's minimum width.
Fix: `min-w-0` on the grid item and `overflow-wrap:anywhere` on prompt text. Test: e2e `F01-E9`.

## To check (not reproduced, not fixed)

- The rate limit key falls back to one shared value when there is no `x-forwarded-for`. Fine locally; with auth it must key on the user id.
- Pressing Stop after the provider has finished but before the next poll refunds the credits although an output exists. It cannot be triggered from the UI in the mock (4 second window), but a real provider can race. Settle in one transaction when jobs exist.
- Dark theme is in the tokens but not switchable in the app; not scanned by axe.
