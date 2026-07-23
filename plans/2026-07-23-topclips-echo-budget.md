---
approved: 2026-07-23
---

# RECALL Top Clips: proof echoes must not crowd out new AI picks

## Goal
On the owner's 3-hour podcast, the AI pass now reports "returned 20 clips but
none were usable (0 bad index, 0 bad label)". With valid indices+labels and
every counter zero, the only path is: all 20 clips landed on candidates already
labeled offline "proof" (the proof branch counts neither aiAdded nor badLabel),
and all 20 hooks failed the strict verbatim check. Root causes:
1. Rule 3 commands "echo every offlineProof line WITH a hook"; feed is sorted
   proofs-first; rule 7 caps "at most 20 TOTAL" — on a proof-rich source the
   mandatory echoes eat the entire budget, zero left for new picks.
2. renderTopClips sorts proof→ai and slices to DISPLAY_CAP 20 — with ≥20 proofs
   even a perfect AI pass would add cards that never display.
3. acceptHook uses exact case/quote-sensitive `indexOf` — a case-shifted or
   curly-quoted echo hook is rejected (all 20 died here).

## Changes (topclips.js only)
1. buildAIPrompt: rule 3 gains "echoed proof lines do NOT count toward the
   selection limit"; rule 7 → "Select up to 20 NEW clips (label ai/ai_proof)
   from candidates with offlineProof:false, in addition to the proof echoes."
2. acceptHook: normalize both sides (lowercase + straight-quote the curly
   quotes) to locate the substring, then slice the ORIGINAL c.text so hookText
   stays verbatim; keep ≥3 words + strictly-shorter; count stats.hookRejected
   when a non-empty hook string fails.
3. mergeAIResults stats: proofEchoes (clip landed on an offline-proof
   candidate), hookRejected.
4. enter() note: when returned>0 && aiAdded==0 && hooksAdded==0 &&
   proofEchoes===returned → "AI pass only re-confirmed the offline PROOF
   matches (N echoes, M hooks rejected as non-verbatim) — no new clips this
   run. Run it again to retry." (bad-index/label wording kept for the other
   case); console.info includes the full stats.
5. renderTopClips display mix: when ai/ai_proof cards exist, cap proofs at
   PROOF_DISPLAY_MAX=12 and fill remaining slots (to DISPLAY_CAP 20) with
   ai_proof/ai in rank order; when no AI cards, keep today's up-to-20 proofs.

## Files
`topclips.js`; this plan. No schema change; RE-SCAN picks it up.

## Verification (headless Playwright, Gemini stubbed; extend recall-aipass-verify.mjs)
1. Prompt has "do NOT count toward" + "up to 20 NEW clips" + offlineProof:false.
2. 25 proof candidates + response echoing 20 with paraphrased hooks, 0 new →
   note "only re-confirmed the offline PROOF matches (20 echoes, 20 hooks
   rejected…)".
3. Echo with a case-shifted-but-verbatim hook → accepted; mark renders;
   hookText is the original-case segment substring.
4. ≥20 proofs + 4 new "ai" clips → the 4 AI cards render (proofs capped 12,
   total ≤20); zero AI clips → 20 proofs render (regression).
5. Suites aipass/noise/hooks green; real-srt clean.

## Rollback
Revert the squash commit. No storage change.

## Audit
- PLAN: approved (this file). PASS
- EXECUTE: prompt rule 3 (echoes don't count) + rule 7 (up to 20 NEW,
  offlineProof:false); acceptHook normalized case/quote matching with verbatim
  slice; stats.proofEchoes + hookRejected; echo-only note; renderTopClips proof
  cap when AI cards exist. PASS
- VERIFY: extended aipass suite (proof echoes don't consume budget; proof-only
  paraphrased echoes → echo-only note w/ counts; case-shifted verbatim hook
  accepted with original-case slice; display mix shows AI cards with proofs
  capped at 12). Regression noise 13/13, hooks 26/26, real-srt clean. PASS
- SHIP: push → PR → squash-merge → live poll (below).
