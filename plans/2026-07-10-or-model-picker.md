---
approved: 2026-07-10
---

# OpenRouter model dropdown: live list + pricing + arena.ai ranking (RECALL side)

## Goal

Replace the free-text OpenRouter "Model" box with a dropdown that (1) lists all
available models live from OpenRouter's public API so it self-updates, (2) shows
each model's pricing (FREE within rate limits, or $/1M token rates), and (3)
ranks the top group by arena.ai's text leaderboard. Also note Gemini's free-tier
behavior in the Gemini fields.

## Steps (RECALL)

1. Vendor `stackmodels.js` (byte-identical across recall/Hooklabs/blast, house
   pattern like stackdata.js/stacknav.js). Classic script exposing
   `window.StackModels`:
   - `fetchModels()` GETs `https://openrouter.ai/api/v1/models` (public, CORS
     `*`), maps to `{id,name,inPerM,outPerM,free,media,textOut,score}`, caches
     24h in localStorage `stack_models_cache_v1` (stale-while-revalidate).
   - `ARENA` snapshot (2026-07-10) maps leaderboard families → id substrings →
     scores.
   - `populate(select, input)` fills optgroups "Top ranked (arena.ai)" /
     "Free models" / "All other models" + "Custom model id…"; the existing
     text input stays the value carrier (so no save-handler change), hidden
     unless Custom is chosen. Fetch failure with no cache → falls back to the
     text input (today's behavior).
2. `index.html`: replace the `<input id="ormodel" list="ormodels">` + stale
   `<datalist>` with `<select id="ormodelselect">` above a now-hidden
   `#ormodel`; ranked/pricing hint; Gemini free-tier note; load
   `stackmodels.js` after stacknav.js.
3. `app.js`: in `openSettings()` after `ormodel.value = …`, call
   `window.StackModels.populate(#ormodelselect, ormodel)`. Save handler
   unchanged (still reads `#ormodel`).

## Files touched

`stackmodels.js` (new), `index.html`, `app.js`. No `llm.js` change — the model
id flows through `config.openrouterModel` as before.

## Verification

Same-origin headless Chromium, OpenRouter models endpoint intercepted with the
real 346-model payload: dropdown visible on OpenRouter, optgroups present, top
ranked = claude-fable, free labels "FREE (rate-limited)", image models excluded
from ranked, selecting sets the hidden input, Custom reveals the input, cache
avoids a second fetch, fetch-failure falls back to text input, and a real
save→shared-store round-trip persists the model. 40/40 assertions + round-trip
pass.

## Rollback

Revert the branch; additive module, settings format unchanged (plain id string).
