---
approved: 2026-07-23
---

# RECALL Top Clips: survive garbled transcripts

## Goal
After PR #34, segments no longer LEAD with ASR sentence-tails, but garbage now
sits mid-segment and Top Clips still recommended "Me too. enslaves. This crap
happens. Maybe in Romania, it's not a big thing." Owner's stance: garbled
transcripts are normal (Whisper large-v2 territory); RECALL must work despite
them. Make hook trimming actually fire on garbled lines, and rank clean lines
above noisy ones without ever hiding a noisy line (a garbled Tate line can still
be a great clip).

## Root causes (all in topclips.js, shipped in #34)
1. The offending card is an OFFLINE pattern proof. The AI prompt says proof lines
   may be echoed "or omitted"; when omitted, `acceptHook` never runs, so proof
   cards (the most-surfaced kind) almost never get a hook trim.
2. `"hook"` is optional and the prompt says nothing about ASR artifacts, so the
   model has no mandate to cut around "enslaves." / "broLilly" / "HeGülme".
3. Offline ranking has no noise signal — a garbled candidate ranks equal to clean.

## Changes (topclips.js only)
- **noiseScore(text)** helper near wordCount: counts mid-word case-joins
  (`[a-z][A-Z]` → broLilly, HeGülme) and isolated 1-2-word lowercase sentence
  fragments. Cheap, conservative.
- **scanLibrary**: `cand.noise = noiseScore(text)`; after the rank formula,
  `cand.rank -= Math.min(0.3, 0.15 * cand.noise)` — down-rank, never filter.
- **buildAIPrompt**: candidates gain `noisy: c.noise > 0`. Rule 3 → proof lines
  must be ECHOED as "proof" WITH a hook (never omitted/relabeled). Rule 5 → teach
  the model that transcripts are auto-transcribed and contain artifacts (mid-word
  splits, duplicated words, stray tails like "enslaves." that belong to nothing);
  a hook must never include an artifact; `"hook"` is REQUIRED when `noisy` is true
  or any part is filler, optional only for clean end-to-end lines; still a verbatim
  exact substring of that candidate's text.
- **mergeAIResults**: no logic change — `acceptHook` already runs in both the
  proof branch and the labeled branch; once proofs are echoed, proof cards get
  hooks.

## Files touched
`topclips.js`. Additive JSON field (`noise`); no schema/parse change.

## Rollback
Revert the squash commit. Old saved scans render fine (extra field ignored).

## No re-import needed
Parsing is untouched — owner just re-runs Top Clips (the saved scan re-computes).

## Verification — headless Playwright (before push)
Extend scratchpad/recall-hooks-verify.mjs + re-run real-srt-check.mjs:
- Prompt body contains `"noisy"`, "REQUIRED", the artifact instruction, and the
  echo-proof-with-hook rule; maxOutputTokens still 5000.
- Canned AI echoes a proof clip with a valid hook → the PROOF card renders
  `<mark class="tchook">`.
- Two same-pattern candidates, one garbled → clean ranks first in render order;
  noisy one still shown.
- noiseScore via page.evaluate: "Me too. enslaves. This crap happens." ≥1,
  a clean sentence = 0, "broLilly" ≥1, "HeGülme 2011" ≥1.
- Full existing 26-assertion suite still green; real-file check still zero
  tail-leading segments.

## Audit (post-execution)
- PLAN: written + approved (this file). PASS
- EXECUTE: topclips.js edited exactly as planned (noiseScore, rank penalty,
  noisy flag, rules 3+5). No logic change needed in mergeAIResults. PASS
- VERIFY: new noise suite 13/13 green (proof echoed with a clean hook → mark
  rendered with garbage trimmed; noisy line ranks below clean near-duplicate;
  noisy flags correct; prompt carries all new rules). Full #34 suite 26/26
  (one stale test assertion updated for the new prompt wording). Real-file
  check: still zero tail-leading segments. PASS
- SHIP: push → PR → squash-merge → live poll (below).

## Out of scope (noted)
Hooks that should SPAN into the next segment ("…But in America, this is happens
all the time") — a hook must stay inside one segment's verbatim text. If misses
persist, the next step is candidate windows joining adjacent segments (bigger
change).
