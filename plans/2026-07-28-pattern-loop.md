---
approved: 2026-07-28
---

# RECALL: stop dropping the pattern, and put your own proven formulas first

## Goal
Two requests, one root cause.

1. "I want that proof to take priority when selecting clips now. It's backed by
   pulse statistics and historical data. List any clips with this formula top of
   the list."
2. HOOKLAB's auto-promoted entry had no pattern family. "Shouldn't that be
   automated because it's already based on an actual pattern that RECALL
   discovered?" — yes. RECALL discovered it and then threw it away.

## What was actually wrong
RECALL computes `match` for every candidate (`{kind:"pattern", patternId,
patternName, scaffold}`) and renders it on the card — the "matches: Starving
Crowd Specificity" line. But `queueToBlast` never copied it into the clip
record, so BLAST received the fact that a clip was proof-backed and not *which*
pattern backed it. PULSE, at the end of that chain, hardcoded
`patternId: "", family: "unknown"` because nothing else was available.

Separately, Top Clips treated all PROOF equally. A pattern that has already
produced a 65,700-view winner ranked no higher than a pattern that is merely
strong in general.

## Changes

### The pattern travels (topclips.js, app.js)
- `clipHandoff(c)` flattens a candidate's `match` into `patternId`,
  `patternName`, `patternFamily` (family looked up in the loaded bank).
  `sendAllToBlast` maps through it.
- `toggleBin(srcId, idx, extra)` takes optional card metadata. Binning from a
  Top Clips card now keeps `hookText`, `label` and the pattern; binning from
  plain search passes nothing and behaves exactly as before. Bin → BLAST
  forwards whatever it has.
- `queueToBlast` **backfills**: a clip already in the queue whose twin is
  missing metadata the incoming copy has gets filled in and `updatedAt` bumped,
  instead of being silently skipped. This is the heal path for clips queued
  before this shipped — re-send them from Top Clips.

### Personal proof outranks general proof (topclips.js)
- `winnerPatternSet(winners)` — the pattern ids named by ledger winners. PULSE
  stamps `patternId` on auto-promoted entries, so this set fills itself as
  breakouts land.
- A candidate is `personalProof` when it matches a winner hook directly (the
  existing ledger route) **or** when its matched pattern is in that set.
- `personalProof` gets evidence weight 1.0 and, more importantly, becomes the
  PRIMARY sort key in all three ordering stages (offline feed, post-AI merge,
  display mix). Within it, offline-verified proof still beats an AI-claimed
  match, then rank.
- The card says why: "you have already won with this pattern".

## Files
`recall/topclips.js`, `recall/app.js`, `recall/style.css`

## Rollback
Revert the commit. Every new field is additive; clips and bin items without
them behave exactly as today.

## Verification
`pattern-loop-verify.mjs` (new), R1–R4.

## Audit — 2026-07-28

| Step | Result |
|---|---|
| R1 a personally-won pattern sorts FIRST, above a general-proof match that out-RANKS it | PASS |
| R1 the card explains why it is on top; a general match does not claim a personal win | PASS |
| R1 the matched pattern is still named on the card | PASS |
| R2 patternId / patternName / patternFamily reach the BLAST queue | PASS |
| R2 a different match carries its own pattern, not the winner's | PASS |
| R3 re-sending an already-queued clip backfills the missing pattern, bumps updatedAt, and says so | PASS |
| R3 re-sending does not duplicate the clip | PASS |
| R4 binning from a Top Clips card keeps the pattern and the proof label | PASS |
| R4 bin → BLAST carries the pattern the rest of the way | PASS |
| Pre-fix proof: every one of the above fails on the previous code (personal proof rendered second) | PASS |
| Regression: recall-verify, recall-topclips-verify | PASS (topclips has one pre-existing failure, "output cap raised to 8000", verified failing with these changes stashed) |
