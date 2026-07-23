---
approved: 2026-07-23
---

# RECALL: .srt click-upload + sentence-aware merge + Top Clips hook precision

## Goal
Owner imported a real TurboScribe SRT and hit three problems:
1. The file picker greys out `.srt` (the `accept` attr never got text extensions
   when SRT parsing shipped; the JS routing already handled them, drag-drop worked).
2. A Top Clips hook rendered as "enslaves. This crap happens…" — the orphan tail
   of the previous sentence led the segment, because `mergeToSentences` only
   tested whether a whole cue ENDS with punctuation and never split inside one.
3. Hook selection was coarse: candidates are whole segments, and the AI pass was
   labeling-only — no neighbor context, no way to point at the sharpest sentence.

## What changed
- **index.html** — `#audiofile` accept gains `.txt,.srt,.vtt,.md,text/plain`
  (extensions are load-bearing; .srt MIME is inconsistent across OSes). Hint
  wording updated here and in `renderUploadZone` (app.js), which rewrites the
  zone HTML on every modal open.
- **app.js** — new shared `sentenceChunks` tokenizer (also used by
  `splitLongSegments`); `mergeToSentences` rewritten sentence-aware:
  - cue text is split into sentence chunks; completed sentences accumulate into
    a segment that flushes at ≥`SEG_MIN_WORDS` (8) and caps at `SEG_MAX_WORDS`
    (40), with the partial sentence CARRIED across the cap flush — so segments
    always start at sentence starts;
  - a hard mid-sentence cut (single >40-word run-on / punctuation-free stream)
    sets a deterministic `brokenTail` flag; the sentence's short remainder
    (≤`TAIL_GLUE_MAX` 12 words) then glues backward instead of leading;
  - mangled-cue orphans (real transcripts contain lone 1-2-word lowercase tails
    in their own cue — "relaxing.", even mid-word "atility.") glue backward when
    they would otherwise LEAD a segment. This last rule was added during
    verification against the owner's real 1,795-segment transcript, which
    surfaced 36 such cues my synthetic fixtures couldn't predict.
  - Applies to both parseSRT and parseInline; legacy path untouched.
- **topclips.js** — candidates now carry `ctxPrev`/`ctxNext` (12 words of each
  neighbor); the AI prompt includes them as context-only and may return an
  optional `"hook"`: a VERBATIM substring of the candidate line (validated:
  exact substring, ≥3 words, shorter than the line — else silently ignored).
  Accepted hooks render as a gold `<mark>` inside the full line, flow into the
  X/Threads compose quote, the AI compose prompt, and the shot list
  (`— hook: "…"`). aiPass maxTokens 4000 → 5000 (hook strings need output
  headroom; thinking stays disabled). Neighbor-REDIRECT was considered and
  rejected — every 4-40-word segment is already ranked.
- **style.css** — one `.tchook` rule (gold-ghost highlight).

## Files touched
`index.html`, `app.js`, `topclips.js`, `style.css`. Segment schema `{t,sec,text}`
unchanged; new candidate fields (ctxPrev/ctxNext/hookText) are additive JSON.

## Migration
None possible: raw cues are discarded at parse time, so existing sources keep
their old segmentation. **Re-import affected SRT/inline sources** (delete +
re-add the .srt) to pick up sentence-aligned segments; saved Top Clips scans for
the old source are garbage-collected automatically.

## Rollback
Revert the squash commit. Old code ignores the additive fields.

## Verification — PASS (headless Playwright, 2026-07-23)
Suite (26/26 green, Gemini stubbed via route interception):
- accept attr lists .srt/.vtt/.txt/.md; picking a real .srt loads it into the
  paste textarea.
- Owner's exact repro cues: no segment starts "enslaves."; one starts "This
  crap happens."; one ends "debt that enslaves."; hook segment anchored at the
  15:13 cue.
- Short beats merge forward (no <4-word segments); cross-cue phrases stay
  searchable in one segment; punctuation-free streams hard-cut with all words
  preserved (legacy parity); 45-word run-on + orphan tail glues backward.
- Regressions: inline (0:00), legacy [00:01:23], range headers, TurboScribe
  notice-stripping.
- Top Clips: AI request carries prev/next + maxOutputTokens 5000 + the hook
  instruction; a valid hook renders as `<mark class="tchook">` with the full
  line intact; an invalid hook falls back silently; the shot list includes the
  hook note; the mark survives reload (saved scan); offline path clean; zero
  page errors.
Real-file check (owner's actual 1h40m transcript, 1,795 segments): zero
segments lead with a sentence tail (was the "enslaves." bug + 35 more); the
1:39:20 area now yields exactly the hooks the owner wanted as their own
segments ("It doesn't say. I said, where? It doesn't say." / "So I was like,
well, then how the fuck do I defend myself?").
Scripts: scratchpad/recall-hooks-verify.mjs, scratchpad/real-srt-check.mjs.

## Audit (post-execution)
- PLAN: written + approved (this file). PASS
- EXECUTE: four files edited as planned; one addition beyond the approved
  design (the mangled-cue orphan glue), driven by real-data verification and
  consistent with the plan's stated invariant. PASS
- VERIFY: 26/26 suite + real-file check green. PASS
- SHIP: push → PR (with re-import note) → squash-merge → live-URL poll (below).
