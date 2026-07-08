---
approved: 2026-07-08
---

# Add OpenRouter provider option

## Context

Pluggable AI provider for transcription: Gemini stays the zero-config
default, power users can switch to OpenRouter and pick any text model.
Same feature requested for BLAST — see that repo's plan for the shared
design (the `llm.js` module's logic/API is identical across both apps,
adapted only for RECALL's classic-script loading vs. BLAST's ES module).

Approved via ExitPlanMode in the same session that wrote this plan. This
repo copy exists so the doctrine's audit trail is visible here too.

## What was built

- `llm.js` — provider abstraction (Gemini default, OpenRouter optional),
  loaded as a plain script exposing `window.LLMProvider` since `app.js`
  here is a classic IIFE, not `type="module"`. Gemini's resumable Files
  API (up to 2GB) moved in from `app.js` unchanged; OpenRouter is
  text-first with a small inline-media ceiling (~15MB) and no reliable
  audio/video input for large files, surfaced as a clear error rather
  than a silent failure.
- Settings modal: provider radio (Gemini/OpenRouter), OpenRouter key +
  model fields, same BYO-key/localStorage pattern as the existing Gemini
  key.
- `transcribeWithGemini` replaced with a provider-aware `transcribe()`
  calling into `llm.js`. Gemini path is byte-for-byte the same logic that
  was already live, including the `MAX_TOKENS` truncation guard.

## Verification

Headless-browser pass (Playwright): settings save/persist/clear for both
providers; Gemini transcription path unchanged (mocked 200 response);
OpenRouter request shape verified via interception; large-file-on-
OpenRouter shows the "needs Gemini" error rather than a silent failure;
`MAX_TOKENS` truncation guard still fires correctly.

## Rollback

Feature branch `claude/openrouter-and-video-captions`, PR opened for
review. Nothing reaches `main` without a separate go-live plan + explicit
approval, per this repo's own doctrine.
