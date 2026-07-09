---
approved: 2026-07-09
---

# Regenerate Top Clips pattern snapshot with mediums

## Goal

Keep RECALL's vendored HOOKLAB pattern snapshot (`topclips-patterns.js`) in
sync after HOOKLAB's medium split (text vs video hooks, Threads platform,
15 new text-native patterns).

## Steps

1. Regenerate the snapshot from the local Hooklabs working tree
   (branch `claude/hooklab-medium`) with a node one-liner that imports
   PATTERNS/NICHES and dumps the reduced field list.
2. Field diff: adds `mediums` (array) to each pattern. All other fields
   unchanged (`id, name, family, scaffold, slots, niches, strength,
   evidence, tier`). Pattern count 97 → 112.
3. The matcher in `topclips.js` is untouched this round — `mediums` is
   carried for future medium-aware Top Posts ranking.
4. Header comment preserved verbatim.

## Files touched

topclips-patterns.js (regenerated), plans/2026-07-09-snapshot-mediums.md (new).

## Rollback

`git revert` the squash commit on main; Pages redeploys the prior snapshot.
Additive field — old snapshot consumers ignore unknown fields.

## Verification

- node parse check: 112 patterns, 7 niches, 15 text-only, 8 video-only. PASS.
- Load RECALL in headless browser: zero console errors (snapshot format
  unchanged apart from the added field).

## Execution log

- 2026-07-09: regenerated; parse check passed (112/15/8).
