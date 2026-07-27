---
approved: 2026-07-27
---

# RECALL: send a whole batch of clips to BLAST

## Goal
Wave C leg 1 of 4. The owner's real workflow is batch-shaped: AI edits a whole
podcast into 20-30 clips in a day or two, and he wants to caption them all in
one sitting rather than waiting minutes per clip while he's out. RECALL could
only hand BLAST one caption at a time.

## Facts
- blast_handoff_v1 = {caption, source, createdAt}; BLAST reads only .caption.
- Two duplicate writers existed: the bin's per-item button (app.js) and the
  Top Clips POST panel (topclips.js). The duplication was deliberate — it keeps
  the app.js -> TopClips dependency arrow one-directional.
- Bin items are {key, srcId, srcTitle, t, sec, text} with key = srcId@sec@idx.
  Top Clips candidates carry the same key plus hookText and a provenance label.

## Changes
- **app.js**: both writers centralize here — `sendToBlast(caption, source)`
  (unchanged single-clip contract) and new `queueToBlast(clips, source)`,
  which appends to `blast_queue_v1` (versioned; per-clip identity key; empty
  caption/status maps; genState "pending"), skips clips already queued, opens
  BLAST and reports "Queued N clips (M already queued)". Exposed to TopClips
  through the existing deps bridge, so the dependency direction is unchanged.
- **index.html**: "SEND ALL →B" in the clip-bin header, enabled with the bin.
- **topclips.js**: `sendToBlast` delegates to D; new `sendAllToBlast` queues
  every card on screen, carrying hookText and the label — the hook becomes the
  caption seed and later PULSE's post hook.

## Rollback
Revert the squash commit. blast_queue_v1 is a new key; nothing reads it until
BLAST ships its side (leg 3), so this is inert on its own.

## Verification (headless Playwright — log below)
Bin: disabled when empty, three moments queued with identity/title/timecode,
pending state, re-send dedupes, BLAST opens. Shot list: clips carry hookText +
label and seed text from the hook. Single →B unchanged and writes no queue.

## Audit
- PLAN approved (this file). EXECUTE/VERIFY/SHIP below.
- EXECUTE app.js writers + deps, index.html button, topclips delegation and
  send-all — PASS.
- VERIFY new suite 23/23 PASS; regression: aiux, aipass, hooks, tray, noise
  all green.
- SHIP: committed, PR squash-merged, live poll confirmed.
