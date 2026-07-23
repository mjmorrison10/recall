---
approved: 2026-07-23
---

# RECALL Top Clips: make token-limit truncation non-fatal + roomier

## Goal
On a dense podcast the AI pass throws "Response hit the token limit and was
truncated" (llm.js:194) and discards the ENTIRE response — only offline PROOF
cards remain. With thinking now ON, thinking tokens + the verbose selection JSON
(up to ~40 clips) exceed maxOutputTokens 8000, and MAX_TOKENS is treated as a
hard error even though most clips arrived. Make truncation yield the clips that
came through, and make it rare.

## Changes
### llm.js
- Honor `opts.thinkingBudget` (number) → `thinkingConfig.thinkingBudget = n`
  (bounded thinking); keep `!opts.thinking → 0` default.
- `extractGeminiText(res, partialOnTruncate)`: on `finishReason==="MAX_TOKENS"`
  WITH text present AND partialOnTruncate → return the partial text instead of
  throwing. `geminiGenerateText` passes `opts.partialOnTruncate`. Empty-text
  MAX_TOKENS still throws. Other callers unaffected (default false).

### topclips.js
- aiPass: `maxTokens 16000`, `thinkingBudget: 4096`, `partialOnTruncate: true`.
- `salvageClips(text)`: string/escape-aware scan of the `clips` array, JSON.parse
  each COMPLETE `{…}`, drop a truncated final object. Parse flow: full parse →
  clipsFrom; on failure → salvageClips + `truncated=true`. aiPass returns
  `{merged, stats, raw, truncated}`.
- enter(): truncation is not an error. Append to the normal note
  " (hit the token limit — showing what came through; RE-SCAN, or split very
  long sources, for the rest)". Cards render from salvaged merge; don't record
  duration on a truncated run.
- buildAIPrompt rule 3: "echo hooks for at most the 12 strongest proof
  candidates" (matches display cap; smaller output).

## Files
`llm.js`, `topclips.js`; this plan. No schema change; RE-SCAN picks it up.

## Verification (headless Playwright, Gemini stubbed)
1. aiPass request: thinkingBudget 4096, maxOutputTokens 16000; a default text
   call still sends thinkingBudget 0.
2. Truncated response (MAX_TOKENS, valid clips-array prefix cut mid-object) →
   complete clips render; note has "hit the token limit — showing what came
   through"; no failure toast; no page error.
3. Truncated with zero complete clips → graceful empty note (no throw).
4. Empty-text MAX_TOKENS → still the loud "AI pass failed" path (regression).
5. Prompt has "at most the 12 strongest proof".
6. Suites aipass/noise/hooks green (maxTokens assertions 8000→16000); real-srt
   clean.

## Rollback
Revert the squash commit. No storage change.

## Audit
- PLAN: approved (this file). PASS
- EXECUTE: llm.js bounded thinkingBudget + partialOnTruncate; aiPass
  16000/thinkingBudget 4096/partialOnTruncate + salvageClips + truncated flag;
  enter() appends truncation note and skips duration on truncated runs; prompt
  echo cap 12. PASS
- VERIFY: aipass suite (thinkingBudget 4096 + maxOutputTokens 16000; truncated
  response salvages the complete clip + soft note, not a failure; zero-salvage
  truncation graceful; empty-text MAX_TOKENS still loud; echo cap in prompt).
  Regression noise 13/13, hooks 26/26, real-srt clean. PASS
- SHIP: push → PR → squash-merge → live poll (below).
