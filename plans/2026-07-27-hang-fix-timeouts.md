---
approved: 2026-07-27
---

# RECALL: full-request deadlines (the same latent hang BLAST hit)

## Goal
Wave A leg 2 of 3. RECALL shipped the headers-only `fetchWithTimeout` last
week, which carries the same latent bug BLAST hit in production: a provider
that returns headers early and then holds the connection open (OpenRouter's
non-streaming endpoint does exactly this) never trips the abort, so the
transcription/compose button can sit forever with no error.

## Changes
- **llm.js**: `fetchBodyWithTimeout` reads the response body INSIDE the abort
  window and returns `{res, bodyText}`; all AI-path fetches use it. The retry
  loop reuses that body instead of a second unbounded `res.clone().text()`.
  `OP_BUDGET_MS` (240s) caps the whole operation across retries. Extractors
  take `(res, bodyText, partialOnTruncate)` — the existing partial-salvage
  behavior for Top Clips is preserved exactly.
- **stackmodels.js**: shared-file parity with BLAST's `pickFastDefault` (an
  empty model field now defaults to a fast model instead of the arena leader).

## Rollback
Revert the squash commit. No storage changes.

## Verification (headless Playwright — log below)
Stalled-body stub + fake clock → transcription surfaces "timed out after
180s", msave re-enabled, pending file retained. Static: no `res.json()` or
`res.clone().text()` left, OP_BUDGET_MS present, X-Title still RECALL.
Existing recall suites green.

## Audit
- PLAN approved (this file). EXECUTE/VERIFY/SHIP below.
- EXECUTE llm.js + stackmodels.js as described — PASS.
- VERIFY new cross-app suite 18/18 PASS (RECALL legs: timeout surfaced,
  msave recovered, file retained, zero page errors; static checks clean).
  Regression: recall-aiux (1 stale helper-name assertion updated), aipass,
  thinking, hooks all green.
- SHIP: committed on claude/handoff-doctrine-fable-opus-5bs5cv, PR
  squash-merged, live poll confirmed on Pages.
