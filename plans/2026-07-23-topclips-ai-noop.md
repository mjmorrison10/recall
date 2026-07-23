---
approved: 2026-07-23
---

# RECALL Top Clips: fix silent AI-pass no-op + honest progress UX

## Goal
Since the stack-wide speed-up (thinkingBudget:0 + tighter maxTokens), Top Clips'
AI pass "runs, finishes, then nothing" — zero ai/ai_proof cards, no console
errors, even on a 3-hour podcast. Restore it and add progress feedback.

## Root cause (traced)
The speed-up disabled Gemini "thinking" on EVERY text call. Fine for
transcription/captions/compose, but the Top Clips aiPass is the one genuinely
hard task (select + label 45 candidates in a strict JSON shape). Without
thinking it returns HTTP 200 with valid-but-useless JSON (`{"clips":[]}` or a
wrong shape — jsonMode forces valid JSON, not OUR shape). That RESOLVED-but-empty
path is the ONLY silent one: it funnels through `mergeAIResults` (`var clips =
(parsed && parsed.clips) || []`), adds no labels, clears `aiNote` to "", and
renders proof-only — identical to "nothing more to find." Every THROWING path
(MAX_TOKENS, empty parts, bad HTTP, unparseable) is already caught + toasted.

## Changes
1. **llm.js (recall) — thinking opt-in per call.** `geminiGenerateText`: only set
   `thinkingConfig={thinkingBudget:0}` when `!opts.thinking`. Default stays
   thinking-OFF everywhere (keeps the speed win); media path unchanged.
2. **topclips.js aiPass — thinking back on for THIS call.** `thinking:true`,
   `maxTokens 5000→8000` (thinking tokens count against output budget; restores
   pre-speed-up headroom — a cap, not a spend), and pass an `onPhase` through so
   llm.js's existing retry notices surface.
3. **Never silent again.** Shape-tolerant parse (accept `parsed.clips`, a bare
   array, or `parsed.result`). aiPass returns `{merged, added, raw}`; the
   success branch counts `added` (ai+ai_proof) and when 0 sets a VISIBLE aiNote
   ("AI pass finished but added no clips beyond the offline PROOF matches —
   RE-SCAN to retry.") + `console.info` with a raw snippet. No toast (soft
   outcome, not an error).
4. **Elapsed timer + learned ETA.** Around the aiPass call, a 1s interval updates
   the `.tchint` node in place ("AI pass running… 12s", "(typically ~34s)" when
   history exists). History in localStorage `recall_tc_ai_ms_v1` (last 5
   successful durations). Interval cleared in both `.then` and `.catch`, guarded
   by runSeq. Retry `onPhase` text replaces the timer text while active.

## Files
`llm.js`, `topclips.js`, this plan. No schema/parse change; no re-import (RE-SCAN
frozen per-source scans).

## Verification (headless Playwright, Gemini stubbed via page.route)
1. Top Clips aiPass request has NO thinkingConfig + maxOutputTokens 8000; an AI
   Compose request still has thinkingBudget:0 (opt-in works).
2. Canned `{"clips":[]}` → proof cards + visible "added no clips … RE-SCAN"
   note, no failure toast, console.info present, no page errors.
3. Canned bare-array response → ai card renders (shape tolerance).
4. Normal canned clips → ai cards render; aiNote cleared; duration recorded in
   `recall_tc_ai_ms_v1`.
5. Delayed stub (~3s) → aiNote ticks the elapsed seconds; second run shows
   "(typically ~Ns)".
6. Regression: recall-noise-verify (13), recall-hooks-verify (26) still green;
   real-srt-check still clean.

## Rollback
Revert the squash commit. Additive localStorage key only.

## Audit (post-execution)
- PLAN: written + approved (this file). PASS
- EXECUTE: llm.js conditional thinkingConfig; topclips.js aiPass thinking:true +
  maxTokens 8000 + onPhase + shape-tolerant parse + {merged,added,raw} return;
  enter() timer + zero-added visible note; duration-history helpers. PASS
- VERIFY: new aiPass suite 14/14 (thinking-on + 8000 for aiPass, thinking-off
  default preserved, empty-result now visible + logged, bare-array shape
  tolerated, timer ticks, learned ETA on 2nd run). Regression: hooks 26/26,
  noise 13/13, real-srt clean (two stale 5000-token assertions updated to
  8000). PASS
- SHIP: push → PR → squash-merge → live poll (below).
