---
approved: 2026-07-21
---

# RECALL: SRT/VTT + TurboScribe inline timestamp parsing

## Goal
TurboScribe can export finer timing than the paragraph format the owner pastes:
(A) SRT/VTT cues (~2s each, text fragmented mid-sentence) and (B) inline
`(0:00) text (0:04) text` web-copy (~4s, sentences intact). RECALL parsed
neither — `.srt` cue lines matched no regex (garbage), and `(0:00)` paren-stamps
were rejected — so a whole podcast collapsed into one range-header block
(owner saw 2:20–18:24 as a single timestamp), making hook-finding useless.
Owner's constraint: raw SRT fragments would break cross-sentence search context.

## What changed (app.js, index.html)
- **`detectFormat(raw)`** — `-->` → SRT/VTT; ≥3 `(0:00)`-followed-by-text →
  inline; else legacy (untouched).
- **`parseSRT`** — cue-block parser → fragments → `mergeToSentences`.
- **`parseInline`** — split on `(m:ss)` stamps → fragments → `mergeToSentences`.
- **`mergeToSentences`** — the context fix: joins consecutive fragments into
  full sentences, each anchored to the timestamp of the fragment where the
  sentence started. Flushes on terminal punctuation or >40 words; result runs
  through the existing `splitLongSegments`.
- **`stripNoise`** — removes `(Transcribed by TurboScribe…)` lines that
  previously polluted segments; applied on every parse path.
- `parse` + `parseChunked` dispatch through `detectFormat`; SRT/inline are a
  fast single regex pass, legacy keeps the chunked yield loop.
- index.html: paste-box help text + upload hint updated to name the new formats.
- New parsers emit the same `{t, sec, text}` shape → zero downstream/storage
  changes.

## Files touched
`app.js` (parsing block ~line 114-185 + `parseChunked`), `index.html`
(paste-box hint, upload hint). No schema/storage/search changes.

## Rollback
Revert the two files (or the squash-merge commit). Storage schema unchanged, so
existing user libraries are unaffected either way.

## Verification — PASS (headless Playwright, 2026-07-21)
Drove the real app served locally; all green:
- SRT sample re-joins "Welcome…for the month of July." into ONE sentence at
  ~0:00; cross-cue phrase search works.
- Inline sample: a phrase spanning a `(0:04)` stamp is searchable.
- Legacy `[00:01:23]` + `(2:20 - 5:00)` range header both still work (regression).
- `(Transcribed by TurboScribe…)` stripped from all segments.
- No page errors.
Script: scratchpad/recall-parse-verify.mjs.

## Audit (post-execution)
- PLAN: written + approved (this file). PASS
- EXECUTE: app.js + index.html edited exactly as planned. PASS
- VERIFY: 9/9 headless assertions green. PASS
- SHIP: pushed → PR → squash-merge → live-URL cache-busted poll (below).
