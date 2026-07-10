---
approved: 2026-07-10
---

# Data hygiene: RECALL source rename + bin-note edit + clear bin

## Goal

RECALL could delete sources and bin items but couldn't edit anything and had no
bulk clear. Add the missing edit/clear affordances for mistakes and tests.

## Steps (`recall/`)

1. `app.js` `renderChips`: add a `✎` control (`data-ren`) on each source chip
   (next to `⌕` and `×`); the toggle handler ignores clicks on it. Handler:
   `prompt("Rename source", s.title)`, on a non-empty trimmed value update
   `s.title` AND cascade `srcTitle` to that source's bin entries, then
   `save()` + re-render.
2. `app.js` `renderBin`: wrap the per-item controls in `.bacts` and add a `✎`
   `.edit` (`data-ek`) before the existing `×`. Handler: `prompt` to edit
   `b.text`, save + renderBin.
3. `index.html`: a `#clearbin` button in the bin header; `app.js` declares it,
   disables it with the export buttons when the bin is empty, and wires it to a
   confirm ("Empty the clip bin? (n moments)") → `state.bin = []` + save +
   re-render.
4. `style.css`: `.chip .ren` (mirrors `.scout`) and `.binitem .bacts` /
   `.binitem .edit` (mirrors `.rm`).

## Files touched

`recall/app.js`, `recall/index.html`, `recall/style.css`.

## Verification

Headless (IndexedDB seeded with a source + 2 bin items): rename via prompt
updates the source title and cascades to bin `srcTitle`, persists in IDB;
editing a bin item's text persists; Clear bin (confirm) empties the bin and
disables the button. 26/26 hygiene assertions pass.

## Rollback

Revert the branch; additive UI + guarded IndexedDB writes, no schema change.
