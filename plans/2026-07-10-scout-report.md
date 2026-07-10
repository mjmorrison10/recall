---
task: Scout report on ingest
date: 2026-07-10
approved: 2026-07-10
---

# RECALL: scout report

Turns a freshly added source into a ranked "scouting report" instead of a cold
transcript. Reuses the Top Clips engine scoped to one source.

- `scanLibrary(..., onlySrcId)` can scan a single source (even if not enabled).
- `enter({srcId, srcTitle})` drives a scoped scan; `lastMeta.scout` flips the
  header to SCOUT and shows the source title. Exposed as `window.TopClips.scout`.
- After add-source succeeds, auto-runs the scout on the new source (toast:
  "N moments added — scouting for hooks…").
- A `⌕` SCOUT icon on each source chip re-runs it on demand.
- "⧉ COPY SHOT LIST" in the header copies a plain-text `[t] line — why` list for
  the edit session. AI pass still runs only when a key is present (offline-first).

Verified in the shared same-origin harness (TurboScribe sample -> scout report
with timestamps + why-notes; copy shot list).
