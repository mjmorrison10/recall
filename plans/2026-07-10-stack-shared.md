---
approved: 2026-07-10
---

# One suite: shared API keys + full-stack export/import (RECALL side)

## Goal

Make the four same-origin apps (RECALL, HOOKLAB, BLAST, PULSE) behave as one
suite: (1) an API key saved in any app works in all of them, and (2) one
export/import backs up and restores every app's data — including RECALL's
IndexedDB library — in a single file. Keep four focused apps; the suite
behavior comes from shared origin storage, not a merge.

## Steps (RECALL)

1. Vendor `stackdata.js` (byte-identical copy shared across all four apps). It
   exposes `window.StackData` as a classic script so it loads the same way in
   RECALL's classic app and the module apps. It provides:
   - Shared keys: `resolveKeys`, `writeSharedKeys`, `clearSharedKey`,
     `readSharedKeys` over `stack_settings_v1` (write-through skips empty
     values; clear is explicit; legacy local keys promote into the store).
   - Full-stack backup: `exportAll`/`importAll` over every `^(recall|hooklab|
     blast|pulse|stack)[-_]` localStorage key plus RECALL's IndexedDB
     `recall → library → current` record; `summary`, `isStackBackup`,
     `exportToFile`, `importFromFile`.
2. `index.html`: load `stackdata.js` before `llm.js`; add a shared-keys hint in
   Settings; add a "Whole-stack backup" block (export / import + hidden file
   input) in the library section.
3. `app.js`: `loadSettings` merges shared keys via `resolveKeys`; `#keysave`
   write-throughs `writeSharedKeys`; `#keyclear` calls `clearSharedKey` and
   toasts "Key cleared everywhere"; wire `#stackexport`/`#stackimport`/
   `#stackfile` to `StackData.exportToFile`/`importFromFile`.

## Files touched

- `stackdata.js` (new, vendored)
- `index.html`
- `app.js`

## Rollback

Revert the branch; the three files above are the only changes. No llm.js, no
storage-schema changes (shared store is additive; apps keep their own settings
keys).

## Verification

Same-origin headless Chromium harness (serve `/home/user` as one origin):
shared key set in RECALL is resolved by HOOKLAB/BLAST; legacy promotion; PULSE
ytKey shares; clear propagates; empty saves don't clobber other keys; full-stack
export→import round-trip restores localStorage + RECALL IDB; format detection.
Result: 33 substantive assertions pass (the one non-pass is the HOOKLAB app
self-seeding its own state key on boot, not a stackdata issue).
