---
task: Never send non-media files to the transcription API
date: 2026-07-14
approved: 2026-07-14
---

# .txt upload guard

## Goal
A .txt imported through the add-source upload flow was sent to Gemini as fake
"audio" (mediaKindOf defaulted any non-video mime to "audio"), burned the
user's free-tier quota, and failed with MAX_TOKENS. The `accept` attribute is
only a picker hint (drops bypass it; "All files" defeats it), and no type
validation existed anywhere before the API call. Fix: media transcribes as
today; text files load into the transcript textarea for the free paste/parse
path (a .txt usually IS a transcript, e.g. TurboScribe exports); everything
else is rejected before any network call.

## Steps
1. `app.js` `setPendingFile()` (the single chokepoint for picker + drop):
   classify via new `fileKind()` (mime prefix audio/-video/-text/, else
   extension: media = guessMime set, text = txt/srt/vtt/md). Text -> new
   `readAsText()` helper fills `#mtext` + title, hint status, no pendingFile.
   Other -> reject with warn status + toast. Media -> unchanged.
2. Defense-in-depth: `mediaKindOf()` returns null for non-media (no more
   default-to-audio); `transcribe()` throws a friendly error on null before
   calling the provider.
3. Hints: upload-zone copy (index.html + renderUploadZone) mentions the .txt
   path.

## Files touched
`recall/app.js`, `recall/index.html`.

## Rollback
Revert the commit; no data/storage changes.

## Verification
Headless Playwright, Gemini stubbed via route interception: (a) .txt via
picker AND via drop -> zero provider requests, textarea filled, hint shown,
save creates the source through the paste branch; (b) .pdf -> rejected, no
pendingFile, no request; (c) real mp3 -> still transcribes via stub
(regression), incl. the existing >14MB Files API test. Deploy: branch -> PR ->
squash-merge -> poll live app.js for the guard.

## Execution log (2026-07-14)
- Implemented steps 1-3 as written (fileKind/readAsText added; mediaKindOf
  hardened; transcribe guards; both hints updated).
- One divergence found and fixed during verification: the picker/drop handlers
  call chk() right after setPendingFile(), and chk() -> updateModalHint()
  cleared the new status messages. Reordered (text branch) / deferred a tick
  (reject branch) so the message survives.
- Headless verification: 13/13 PASS (.txt via picker AND drop -> textarea
  filled, title derived, hint shown, save via paste branch with ZERO media
  API calls — the post-save Top Clips scout text call is pre-existing and
  legitimate; .pdf -> warn + no call; real mp3 -> still reaches the stubbed
  transcription). Existing >14MB Files-API regression: ALL PASS.
