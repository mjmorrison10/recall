---
approved: 2026-07-21
---

# RECALL: bounded, collapsible source-chip tray (mobile overflow fix)

## Goal
With ~15 sources, RECALL's source chips fill multiple phone screens and paint
OVER the page footer. Root cause: chips were injected into `#chips`
(`display:contents`) inside `.meta` inside `.searchrow`, which is
`position:sticky; top:0; z-index:20` with a background gradient fading to
**transparent** at the bottom. `.meta` has `flex-wrap:wrap` and no height cap,
so the pinned header grew unbounded and scrolled content (the footer) slid
underneath and showed through the transparent band while opaque chips overlapped
it. Owner picked: **capped scrollable strip + one-tap collapse toggle;
collapsed by default on mobile, open on desktop; choice persisted.**

## What changed
- **index.html** — `.meta` gains two static elements: `#srctoggle` (the collapse
  toggle, label filled by JS as "▾ sources 12/15") and `#addchip` moved here so
  adding a source stays one tap even when collapsed. `#chips` becomes a real
  container `<div id="chips" class="chiptray">` placed after `.meta`, still
  inside `.searchrow`.
- **style.css** — `.searchrow` background made **opaque** (`background:var(--ground)`),
  killing show-through for good regardless of height. New `.chiptray`:
  `display:flex; flex-wrap:wrap; gap:8px 10px; margin-top:10px; max-height:96px;
  overflow-y:auto` (~2 rows mobile; desktop >860px gets `max-height:150px`).
  `.chiptray.collapsed{display:none}`. `.srctoggle` styled as a solid control.
- **app.js** — `renderChips()` stops emitting `#addchip`; calls
  `updateSrcToggle()` after render. New collapse logic: localStorage key
  `recall_ui_v1`, initial state = stored pref else collapsed when
  `matchMedia("(max-width:860px)")`. `#srctoggle` click toggles the `.collapsed`
  class, flips the arrow, persists. `#addchip` bound to `openModal` once at init.
  Chip toggle → search scope, scout/rename/delete handlers unchanged (delegated
  within `#chips`, same node).

## Files touched
`index.html`, `style.css`, `app.js`. No schema/storage/search changes.

## Rollback
Revert the three files (or the squash-merge commit). Storage schema unchanged.

## Verification — PASS (headless Playwright, 2026-07-21)
Seeded 15 sources (12 enabled → toggle reads "12/15"); 14/14 assertions green:
- Mobile 390×844: collapsed by default; toggle shows on/total counts; `+ add
  source` visible while collapsed; searchrow background opaque (no gradient);
  toggle expands; expanded tray capped + scrollable; sticky header bounded
  (<45% viewport); footer not covered by a chip after scroll; chip toggle still
  scopes search; collapsed state persists across reload; no page errors.
- Desktop 1280×900: tray expanded by default; capped ~3 rows + scroll; no errors.
Script: scratchpad/recall-tray-verify.mjs.

## Audit (post-execution)
- PLAN: written + approved (this file). PASS
- EXECUTE: index.html + style.css + app.js edited exactly as planned. PASS
- VERIFY: 14/14 headless assertions green. PASS
- SHIP: pushed → PR → squash-merge → live-URL cache-busted poll (below).
