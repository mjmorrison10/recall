---
approved: 2026-07-23
---

# RECALL Top Clips: stop the validator discarding real AI responses

## Goal
After PR #36 the empty AI pass is VISIBLE, and the owner immediately hit
"AI pass finished but added no clips…" on the 3-hour podcast WITH thinking on.
So the model is responding and OUR `mergeAIResults` validation is discarding it.
Validate defensively (coerce/normalize/rescue) instead of dropping, and when a
pass still adds nothing, say exactly WHY.

## Root causes (topclips.js mergeAIResults)
1. String indices dropped: `typeof cl.i !== "number"` rejects Gemini's common
   `"i":"0"`.
2. Exact label match: non-proof picks only accept "ai"/"ai_proof"; a model that
   labels its picks "proof" (PR #35 prompt hammers the word "proof") loses ALL.
3. Miscount: proof echoes WITH hooks (the #35 behavior) counted as zero added →
   misleading note.

## Changes (topclips.js only)
- `mergeAIResults` returns `{merged, stats}`:
  - index coercion `Math.trunc(Number(cl.i))` with finite/range guard →
    else `stats.badIndex++`.
  - label normalize `String(cl.label||"").toLowerCase().replace(/[^a-z_]/g,"")`,
    map `aiproof`→`ai_proof`; a NON-proof candidate labeled `proof` is treated
    as `ai_proof` and demoted by the EXISTING grounding check when it doesn't
    hold (rescue, not trust); unrecognized → `stats.badLabel++`.
  - count `stats.aiAdded` (new ai/ai_proof) and `stats.hooksAdded` (hookText set
    where none, incl. proof cards); `stats.returned` = clips length.
- `aiPass` returns `{merged, stats, raw}` (keeps `added = stats.aiAdded`).
- `enter()` success branch, honest notes:
  - aiAdded>0 → success (clear note, record duration).
  - aiAdded==0 && hooksAdded>0 → "AI pass refined N PROOF hooks but added no new
    clips — the offline matches already cover this source." (success; record
    duration).
  - returned>0 && aiAdded==0 && hooksAdded==0 → "AI pass returned R clips but
    none were usable (X bad index, Y bad label) — run it again to retry." +
    console.info(raw snippet).
  - returned==0 → existing "added no clips … run it again" + console.info.
- `buildAIPrompt` two surgical lines: `"i"` must be an INTEGER JSON number; and
  `"proof"` is ONLY for echoing offlineProof:true candidates — label new picks
  "ai"/"ai_proof", never "proof".

## Files
`topclips.js`; this plan. No schema/parse change; RE-SCAN picks it up.

## Verification (headless Playwright, Gemini stubbed; extend recall-aipass-verify.mjs)
1. String indices ("i":"0") + label variants ("AI","ai proof") → cards render.
2. Non-proof picks labeled "proof" w/o valid grounding → render as AI (rescued).
3. Only proof echoes with hooks → "refined N PROOF hooks" success note, duration
   recorded, no failure toast.
4. All-bad indices → note names counts, console.info fires.
5. Empty clips → existing note (regression).
6. Suites recall-aipass (14), recall-noise (13), recall-hooks (26) green;
   real-srt clean.

## Rollback
Revert the squash commit. No storage change.

## Audit
- PLAN: approved (this file). PASS
- EXECUTE: mergeAIResults returns {merged, stats} with index coercion, label
  normalization + "proof"-on-nonproof rescue, and drop accounting; aiPass
  returns {merged, stats, raw}; enter() gives four honest notes; prompt adds the
  integer-index rule and the proof-only-for-echo rule. PASS
- VERIFY: extended aipass suite 17/17 (string indices + label casing/spacing
  render; mislabeled-"proof" pick rescued; all-bad indices names the counts +
  logs; empty-branch note). Regression noise 13/13, hooks 26/26, real-srt clean
  (2 stale test assertions updated for reworded prompt/log). PASS
- SHIP: push → PR → squash-merge → live poll (below).
