---
task: Persist Top Clips per source, auto-show on toggle, bin -> BLAST
date: 2026-07-15
approved: 2026-07-15
---

# Top Clips persistence + bin handoff

## Goal
Top Clips results lived only in module RAM, so any refresh/toggle wiped them
and forced an API-spending re-run. The clip bin had no Send to BLAST. Owner's
decisions: manual re-scan only; per-clip bin send; toggling a source ON
auto-opens its saved Top Clips.

## Design
- `localStorage["recall_topclips_v1"] = { [srcId]: {savedAt, meta, candidates} }`.
  Candidates verified pure-JSON; renderTopClips cold-renders them (reads
  neither `bank` nor `active`). Stack backup auto-sweeps recall_* keys.
- Persist only single-source runs: scout always; global #topclips only when
  exactly one source enabled. Save the offline scan on resolve AND overwrite
  after the AI merge, both BEFORE the liveness guard (paid-for results are
  never dropped by an early Back).
- Persisted meta cleaned (aiNote stripped) + normalized to scout shape with
  `scoutSrcId` (needed by Re-scan) — design-review holes H1/H2.
- `runSeq` token invalidates in-flight continuations on exit()/showSaved()
  so a dead run can't clobber a saved view in RAM or LS (H3). H4 = persist
  before guard.
- Public API additions: hasSaved / showSaved / dropSaved / renameSaved.
- Header: "⟳ RE-SCAN (uses AI)" when meta.scout && scoutSrcId; "scanned <rel>"
  when meta.savedAt. Bound in bindHead -> scout(scoutSrcId).
- app.js: toggle-ON with saved -> showSaved(id) instead of search(); delete
  prunes store; rename patches entry titles; bin items get a "->B" button that
  writes blast_handoff_v1 {caption: b.text, source:"recall-bin", createdAt}
  directly (one-directional dependency; BLAST reads only caption).
- init(): orphan GC for store entries whose source no longer exists.

## Files touched
recall/topclips.js, recall/app.js, recall/style.css.

## Rollback
Revert the commit. New LS key is additive; delete it to fully reset.

## Verification (headless Playwright, provider stubbed)
1. Scout src A -> store entry (savedAt, meta.scoutSrcId=A, candidates); 1 call.
2. Reload -> 0 calls; toggle A off/on -> saved SCOUT auto-opens, "Saved scan"
   note, 0 calls.
3. RE-SCAN -> exactly 1 new call, savedAt increases.
4. Two enabled + global run -> no entries; exactly one enabled -> persists.
5. Provider 500 -> "AI pass failed" note but offline results saved.
6. Bin ->B writes blast_handoff_v1.caption === bin text.
7. Delete source prunes entry. 8. Rename patches titles.
9. +BIN works inside a cold-rendered saved view.
Deploy: branch -> PR -> squash-merge -> poll live app.js.

## Execution log (2026-07-15)
- Implemented as designed (storage layer, runSeq, persist-before-guard,
  saved-view API, Re-scan header, app.js toggle/delete/rename/bin hooks, CSS).
- Headless verification: 17/17 PASS, covering all 9 planned checks — scout
  persists (1 call), reload + toggle auto-open with ZERO provider calls,
  re-scan exactly 1 new call + savedAt increases, multi-source global run
  ephemeral / single-enabled persists, AI-500 still saves offline results,
  bin ->B handoff consumed end-to-end by the real BLAST app (#caption
  imported), delete prunes, rename patches, +BIN works in a cold-rendered
  saved view, no page errors.
- No divergences from plan.
