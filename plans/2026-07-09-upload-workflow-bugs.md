---
task: Fix RECALL upload / Top Clips workflow bugs
date: 2026-07-09
approved: 2026-07-09
---

# RECALL upload-workflow bug fixes

## Goal

Unblock the real creator workflow (podcast video → audio export → upload to
RECALL → Top Clips → edit clip). Reported symptoms: "Add to library" can't be
clicked, no processing indicator, Gemini 429s kill the AI pass, OpenRouter 404s
on a dead model slug, TurboScribe transcripts don't parse, Cancel button has no
hover.

## Changes

### llm.js — rate-limit resilience + current model
- Added `fetchWithRetry()` (retry on HTTP 429, up to 3 attempts, 4s/12s backoff,
  honoring Google's `RetryInfo` delay, capped at 20s). Wrapped every
  `generateContent` call (Gemini text + media) plus the Gemini Files upload-start
  and both OpenRouter calls.
- Upgraded the Gemini endpoint from `gemini-2.0-flash` → `gemini-2.5-flash`.
- Map OpenRouter 404 / "no endpoints found" to an actionable message.
- Retry status is surfaced through the existing `onPhase` hook where present.

### app.js — add-source UX + OpenRouter slug migration
- `chk()` now also calls `updateModalHint()`: tells the user *why* Add is
  disabled ("Add a title…") and warns up front when the active provider has no
  API key (was only a post-click toast).
- `setPendingFile()` auto-fills the Title from the file name (extension stripped)
  so the button enables on file pick — the empty-title requirement was the #1
  "why can't I click Add?".
- Real progress row in the modal footer (`#mstatus` + spinner), driven by the
  transcription `onPhase` phases, instead of button-text-only.
- Cancel stays usable during upload; an `uploadToken` invalidates a stale
  in-flight transcription so cancelling can't add a source after the fact.
- Missing-key click is caught before transcribe with an actionable message; on
  error the file is kept for retry instead of being wiped.
- OpenRouter default model → `google/gemini-2.5-flash`; `loadSettings()`
  silently upgrades retired slugs (`google/gemini-2.0-flash-001`, `…-flash`).
- Transcript parser (`parse()` + `parseChunked()`) refactored onto shared
  `pushLine()` / `splitLongSegments()` helpers:
  - Accepts TurboScribe range headers `(0:04 - 0:23)` (parens/brackets, en/em
    dash) with the paragraph on the following line(s); start time wins.
  - Splits any >40-word moment into sentence-packed pieces inheriting the start
    time, so Top Clips' 4–40-word scan window doesn't skip fat blocks and
    mid/end-block hooks surface as their own candidates.

### topclips.js — honest HOOKLAB ledger messaging
- `loadLedgerWinners()` returns a `reason` (`absent` / `empty` / `no-winners` /
  `ok`). The Top Clips banner now gives the right nudge for each and links the
  full HOOKLAB app (`https://mjmorrison10.github.io/Hooklabs/`), noting the
  embedded mjmorrisonusa.com demo uses separate (partitioned) storage.

### index.html / style.css
- Title marked required; footer status line; paste-zone help documents the range
  format; fixed the contradictory "~9.5 hrs" vs "2 GB" hint.
- Moved `#audiofile` OUT of `#uploadzone` (which gets its innerHTML rewritten)
  so the input stays attached to the DOM.
- Added `.btn:hover / .btn.ghost:hover / .btn.primary:hover` (+ `:focus-visible`)
  — the Cancel button (and all footer buttons) now respond to hover.

## Verification (headless Chromium, network stubbed) — PASS

Two Playwright suites, 24 checks, all passing:
- endpoint upgraded to 2.5-flash; `fetchWithRetry` present.
- Add modal: empty-title hint, save gating, title auto-fill from filename.
- TurboScribe excerpt parses into segments; range start times (4s, 24s)
  captured; long first block split to ≤40 words.
- 429-then-200 stub: transcription succeeds via retry (≥2 Gemini calls).
- OpenRouter dead slug migrated in the settings UI.
- Ledger banner copy correct for absent / empty / no-winners / winner.
- Cancel `.btn.ghost` has a `:hover` rule and its background changes on hover.

## Rollback

Revert this branch; all changes are confined to `app.js`, `llm.js`,
`topclips.js`, `index.html`, `style.css`. No data migrations.
