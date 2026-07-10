// Top Clips — evidence-grounded clip recommendations.
// Scans the library for lines that match HOOKLAB's proven hook patterns and the
// user's own HOOKLAB ledger winners (same-origin localStorage). Three labels:
//   PROOF          — matches a ledger winner or a high-evidence pattern scaffold
//   AI + PROOF     — AI flags a close variation of a proven pattern (AI pass)
//   AI RECOMMENDED — pure AI judgment, labeled honestly (AI pass)
// Principles (same as HOOKLAB): provenance on every candidate, AI never invents
// the pattern set, and nothing here is ever shown as a virality score.
window.TopClips = (function () {
  "use strict";

  var D = null;          // deps injected by app.js: {getState, save, search, toggleBin,
                         //  renderBin, binHas, esc, toast, getProviderConfig, loadSettings}
  var active = false;
  var bank = null;       // {patterns, niches, source:"live"|"snapshot", snapshotDate}
  var lastCandidates = null;
  var lastMeta = null;
  var lastShown = [];
  // Top Posts: which candidate's compose panel is open (survives refresh()) and
  // the per-candidate drafts, both session-RAM only.
  var openPostKey = null;
  var postDrafts = Object.create(null); // key -> {x, threads, mode:"quote"|"ai"}

  // --- pure helpers (tokens/jaccard/specificity adapted from Hooklabs/app.js:124-150) ---
  function tokens(s) {
    var out = Object.create(null), n = 0;
    String(s).toLowerCase().split(/\W+/).forEach(function (w) {
      if (w) { if (!out[w]) n++; out[w] = 1; }
    });
    return { set: out, size: n };
  }
  function jaccardSets(a, b) {
    if (!a.size || !b.size) return 0;
    var inter = 0, union = a.size;
    for (var w in b.set) { if (a.set[w]) inter++; else union++; }
    return inter / union;
  }
  function containment(skel, seg) {
    if (!skel.size) return 0;
    var hit = 0;
    for (var w in skel.set) { if (seg.set[w]) hit++; }
    return hit / skel.size;
  }
  function specificityScore(text) {
    var s = 0;
    if (/\d/.test(text)) s += 0.35;
    if (/\b(i|my|we)\b/i.test(text)) s += 0.15;
    if (text.split(/\s+/).length <= 16) s += 0.15;
    if (/\?/.test(text)) s += 0.1;
    if (!/\b(amazing|incredible|game.?changer|secret sauce)\b/i.test(text)) s += 0.15;
    return Math.min(1, s);
  }
  function skeletonize(scaffold) {
    return tokens(String(scaffold).replace(/\{[^}]*\}/g, " "));
  }
  function wordCount(text) { return text.split(/\s+/).filter(Boolean).length; }

  // --- data loading ---
  // Prefer the live sibling bank (same origin on the github.io deploy, or a
  // parent-dir local server); fall back to the vendored snapshot silently.
  function loadPatternBank() {
    if (bank) return Promise.resolve(bank);
    var snap = window.TOPCLIPS_PATTERNS || { patterns: [], niches: [], snapshotDate: "?" };
    function finalize(patterns, niches, source) {
      bank = {
        source: source,
        snapshotDate: snap.snapshotDate,
        niches: niches,
        patterns: patterns.map(function (p) {
          return {
            id: p.id, name: p.name, family: p.family, scaffold: p.scaffold,
            slots: p.slots || [], niches: p.niches || [], strength: p.strength || 0.8,
            evidence: p.evidence || "market-observed", tier: p.tier || "core",
            skeleton: skeletonize(p.scaffold),
          };
        }).filter(function (p) { return p.skeleton.size >= 3; }),
      };
      return bank;
    }
    var url;
    try { url = new URL("../Hooklabs/patterns.js", location.href).href; }
    catch (e) { return Promise.resolve(finalize(snap.patterns, snap.niches, "snapshot")); }
    return import(url).then(function (mod) {
      var reduced = (mod.PATTERNS || []).map(function (p) {
        return { id: p.id, name: p.name, family: p.family, scaffold: p.scaffold,
          slots: p.slots, niches: p.niches, strength: p.strength,
          evidence: p.evidence, tier: p.tier };
      });
      return finalize(reduced, mod.NICHES || snap.niches, "live");
    }).catch(function () {
      console.info("topclips: live pattern bank unavailable, using snapshot");
      return finalize(snap.patterns, snap.niches, "snapshot");
    });
  }

  // The user's HOOKLAB ledger, read directly (localStorage is shared per-origin;
  // both apps live on the same host). Absent = fine — pattern Proof still works.
  // `reason` distinguishes the "no winners to match" cases so the UI can give
  // the right nudge: "absent" (never opened HOOKLAB here), "empty" (opened but
  // ledger has no entries), "no-winners" (entries exist but none marked Winner).
  function loadLedgerWinners() {
    try {
      var raw = localStorage.getItem("hooklab_state_v1");
      if (!raw) return { winners: [], found: false, reason: "absent" };
      var st = JSON.parse(raw);
      var ledger = st.ledger || [];
      var winners = ledger
        .filter(function (e) { return e.outcome === "winner" && e.hook; })
        .slice(0, 50)
        .map(function (e) {
          return { hook: e.hook, hookTokens: tokens(e.hook), patternId: e.patternId || null, family: e.family || "" };
        });
      var reason = winners.length ? "ok" : (ledger.length ? "no-winners" : "empty");
      return { winners: winners, found: true, reason: reason };
    } catch (e) {
      return { winners: [], found: false, reason: "absent" };
    }
  }

  // --- offline scan ---
  var LEDGER_SIM = 0.55;      // near-verbatim reuse of a proven hook
  var SKEL_CONTAIN = 0.75;    // scaffold skeleton mostly present in the line
  var AI_FEED_CAP = 80;
  var DISPLAY_CAP = 20;

  // --- Top Posts: turn a candidate into an X/Threads text post ---
  var POST_LIMITS = { x: 280, threads: 500 };
  var INTENT = {
    x: function (t) { return "https://x.com/intent/post?text=" + encodeURIComponent(t); },
    threads: function (t) { return "https://www.threads.net/intent/post?text=" + encodeURIComponent(t); },
  };
  var HANDOFF_KEY = "blast_handoff_v1";
  var DEFAULT_ATTRIBUTION = "— {show}";

  // Trim on a word boundary + ellipsis. Invariant: the result minus the trailing
  // ellipsis is a character-for-character PREFIX of the input — the proven line
  // is only ever truncated, never rewritten.
  function trimToFit(text, budget) {
    text = String(text);
    if (text.length <= budget) return text;
    var cut = text.slice(0, Math.max(0, budget - 1));
    var word = cut.replace(/\s+\S*$/, "");
    if (word.trim()) cut = word;
    cut = cut.replace(/[\s.,;:!?—-]+$/, "");
    return cut + "…";
  }
  // split/join (not .replace) so "$" in a show title can't act as a replacement
  // pattern — same rationale as BLAST's applyTemplate.
  function attributionFor(settings, srcTitle) {
    var tpl = ((settings && settings.postAttribution) || "").trim() || DEFAULT_ATTRIBUTION;
    return tpl.split("{show}").join(srcTitle);
  }
  function composeQuote(candidate, limit, settings) {
    var attr = attributionFor(settings, candidate.srcTitle);
    var budget = limit - attr.length - 3; // 2 curly quotes + newline
    if (budget < 20) return trimToFit(candidate.text, limit); // pathological template — drop attribution
    return "“" + trimToFit(candidate.text, budget) + "”\n" + attr;
  }
  function composeOffline(candidate, settings) {
    return {
      x: composeQuote(candidate, POST_LIMITS.x, settings),
      threads: composeQuote(candidate, POST_LIMITS.threads, settings),
      mode: "quote",
    };
  }
  function aiComposePost(candidate, settings) {
    var evidence =
      candidate.match && candidate.match.kind === "pattern"
        ? 'matches proven pattern "' + candidate.match.patternName + '" (scaffold: "' + candidate.match.scaffold + '")'
        : candidate.match && candidate.match.kind === "ledger"
        ? "matches the creator's own proven winner: \"" + candidate.match.hook + '"'
        : candidate.reason
        ? "AI-recommended line (reason: " + candidate.reason + ")"
        : "no proof trail";
    var prompt =
      "You write text posts for a short-form creator. Ground everything in the provided\n" +
      "transcript line — never invent claims, numbers, or patterns, and never mention scores.\n" +
      "Keep the line's substance; quote it or reframe it lightly.\n" +
      'Line: "' + candidate.text + '" — from "' + candidate.srcTitle + '" at ' + candidate.t + ".\n" +
      "Evidence: " + evidence + ".\n" +
      "Channel: " + ((settings && settings.channelName) || "unnamed") +
      ", niche: " + ((settings && settings.channelNiche) || "general") + ".\n" +
      'Return strict JSON only: {"x":"<post, hard max 280 chars>","threads":"<post, hard max 500 chars>"}';
    return window.LLMProvider.generateText(D.getProviderConfig(), {
      prompt: prompt, temperature: 0.5, jsonMode: true, maxTokens: 600,
    }).then(function (text) {
      var parsed;
      try { parsed = JSON.parse(text); }
      catch (e) {
        var m = String(text).match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]); else throw new Error("AI returned unparseable output");
      }
      if (!parsed || typeof parsed.x !== "string" || !parsed.x.trim() ||
          typeof parsed.threads !== "string" || !parsed.threads.trim()) {
        throw new Error("AI compose came back incomplete");
      }
      return {
        x: trimToFit(parsed.x.trim(), POST_LIMITS.x),
        threads: trimToFit(parsed.threads.trim(), POST_LIMITS.threads),
        mode: "ai",
      };
    });
  }
  function sendToBlast(text) {
    try {
      localStorage.setItem(HANDOFF_KEY, JSON.stringify({
        caption: text, source: "recall-topclips", createdAt: Date.now(),
      }));
    } catch (e) { D.toast("Couldn't hand off (storage full?)"); return; }
    window.open(new URL("../blast/", location.href).href, "_blank", "noopener");
    D.toast("Sent to BLAST");
  }

  function scanLibrary(theBank, winners, settings, onProgress, onlySrcId) {
    return new Promise(function (resolve) {
      var state = D.getState();
      // Scout mode scans one specific source (even if it isn't currently enabled);
      // Top Clips scans all enabled sources.
      var enabled = state.sources.filter(function (s) {
        return onlySrcId ? s.id === onlySrcId : state.enabled.indexOf(s.id) >= 0;
      });
      var flat = [];
      enabled.forEach(function (s) {
        s.segments.forEach(function (seg, idx) { flat.push({ s: s, seg: seg, idx: idx }); });
      });
      var out = [], i = 0, total = flat.length;
      var provenPatterns = theBank.patterns.filter(function (p) {
        return p.strength >= 0.8 && p.evidence !== "hypothesis";
      });
      var niche = (settings && settings.channelNiche) || "";

      function step() {
        var end = Math.min(i + 400, total);
        for (; i < end; i++) {
          var f = flat[i], text = f.seg.text;
          var wc = wordCount(text);
          if (wc < 4 || wc > 40) continue;
          var segSet = tokens(text);
          var cand = {
            srcId: f.s.id, srcTitle: f.s.title, idx: f.idx,
            t: f.seg.t, sec: f.seg.sec, text: text,
            key: f.s.id + "@" + f.seg.sec + "@" + f.idx,
            label: null, proofType: null, match: null,
            grounding: "", reason: "", sim: 0, spec: specificityScore(text), rank: 0,
          };
          // 1) ledger Proof — your own proven winners first
          var bestLed = 0, bestHook = null;
          for (var wi = 0; wi < winners.length; wi++) {
            var js = jaccardSets(segSet, winners[wi].hookTokens);
            if (js > bestLed) { bestLed = js; bestHook = winners[wi]; }
          }
          if (bestLed >= LEDGER_SIM) {
            cand.label = "proof"; cand.proofType = "ledger"; cand.sim = bestLed;
            cand.match = { kind: "ledger", hook: bestHook.hook };
          } else {
            // 2) pattern Proof — high-evidence scaffold present in the line
            var bestC = 0, bestP = null;
            for (var pi = 0; pi < provenPatterns.length; pi++) {
              var p = provenPatterns[pi];
              var c = containment(p.skeleton, segSet);
              var thresh = p.skeleton.size >= 4 ? SKEL_CONTAIN : 1.0;
              if (c >= thresh && c > bestC) { bestC = c; bestP = p; }
            }
            if (bestP) {
              cand.label = "proof"; cand.proofType = "pattern"; cand.sim = bestC;
              cand.match = { kind: "pattern", patternId: bestP.id, patternName: bestP.name, scaffold: bestP.scaffold };
            } else {
              cand.sim = Math.max(bestLed, bestC); // best sub-threshold signal
            }
          }
          var evidenceWeight = cand.proofType === "ledger" ? 1.0
            : cand.proofType === "pattern" ? (cand.match && findPattern(theBank, cand.match.patternId) || {}).strength || 0.8
            : 0.4;
          var nicheBonus = 0;
          if (cand.match && cand.match.kind === "pattern" && niche) {
            var mp = findPattern(theBank, cand.match.patternId);
            if (mp && mp.niches.indexOf(niche) >= 0) nicheBonus = 0.1;
          }
          cand.rank = evidenceWeight * cand.sim + 0.25 * cand.spec + nicheBonus;
          out.push(cand);
        }
        if (onProgress) onProgress(i, total);
        if (i < total) setTimeout(step, 0);
        else {
          out.sort(function (a, b) { return b.rank - a.rank; });
          var proofs = out.filter(function (c) { return c.label === "proof"; });
          var rest = out.filter(function (c) { return c.label !== "proof"; });
          resolve(proofs.concat(rest).slice(0, Math.max(AI_FEED_CAP, proofs.length)));
        }
      }
      step();
    });
  }
  function findPattern(theBank, id) {
    if (!id) return null;
    for (var i = 0; i < theBank.patterns.length; i++) {
      if (theBank.patterns[i].id === id) return theBank.patterns[i];
    }
    return null;
  }

  // --- AI pass: adds AI + PROOF (grounded variations) and AI RECOMMENDED ---
  // One jsonMode call. Mirrors HOOKLAB's underwriter discipline: the model
  // labels existing transcript lines against the provided evidence — it never
  // invents patterns and can never downgrade an offline PROOF.
  function hasKey(cfg) {
    return cfg.provider === "openrouter" ? !!cfg.openrouterKey : !!cfg.geminiKey;
  }
  function buildAIPrompt(candidates, theBank, winners, settings) {
    var payload = {
      channel: {
        name: (settings && settings.channelName) || "",
        niche: (settings && settings.channelNiche) || "general",
      },
      patterns: theBank.patterns.map(function (p) {
        return { id: p.id, name: p.name, family: p.family, scaffold: p.scaffold };
      }),
      ledgerWinners: winners.slice(0, 15).map(function (w) {
        return { hook: w.hook, family: w.family };
      }),
      candidates: candidates.map(function (c, i) {
        return {
          i: i, text: c.text,
          offlineProof: c.label === "proof",
          offlineMatch: c.match
            ? (c.match.kind === "pattern" ? c.match.patternName : c.match.hook)
            : null,
        };
      }),
    };
    return (
      "You are RECALL Top Clips, an evidence-grounded clip scout for a short-form creator.\n" +
      "You do NOT invent hook patterns and you NEVER output a virality score.\n" +
      'Label each selected transcript line with exactly one of: "proof" | "ai_proof" | "ai".\n' +
      "Rules:\n" +
      '1. "ai_proof" ONLY when the line is a close variation of a provided pattern scaffold or a\n' +
      '   provided ledger winner. "grounding" MUST name it: the exact patternId, or the winner hook text.\n' +
      '2. "ai" = pure judgment that the line opens a strong clip for this channel. grounding stays "".\n' +
      '   "reason" explains the judgment in one short sentence.\n' +
      '3. Candidates marked offlineProof:true are already proven. Echo them as "proof" or omit them.\n' +
      "   Never relabel or downgrade them.\n" +
      "4. Prefer lines fitting the channel niche and voice.\n" +
      "5. Select at most 20 total. Return strict JSON only.\n" +
      "Context: " + JSON.stringify(payload) + "\n" +
      'Return JSON shape: {"clips":[{"i":0,"label":"proof","patternId":null,"grounding":"","reason":""}]}'
    );
  }
  function mergeAIResults(candidates, parsed, theBank, winners) {
    var clips = (parsed && parsed.clips) || [];
    var byIdx = Object.create(null);
    clips.forEach(function (cl) {
      if (typeof cl.i !== "number" || cl.i < 0 || cl.i >= candidates.length) return; // out of range
      byIdx[cl.i] = cl;
    });
    candidates.forEach(function (c, i) {
      var cl = byIdx[i];
      if (c.label === "proof") {
        // offline evidence is immutable; AI may only add color
        if (cl && cl.reason && !c.reason) c.reason = String(cl.reason);
        return;
      }
      if (!cl) return;
      var label = cl.label === "ai_proof" ? "ai_proof" : cl.label === "ai" ? "ai" : null;
      if (!label) return;
      if (label === "ai_proof") {
        // demote unless the grounding names a real pattern or a real winner
        var pat = findPattern(theBank, cl.patternId);
        var groundsWinner = false;
        if (!pat && cl.grounding) {
          var gset = tokens(String(cl.grounding));
          for (var wi = 0; wi < winners.length; wi++) {
            if (jaccardSets(gset, winners[wi].hookTokens) >= 0.3) { groundsWinner = true; break; }
          }
        }
        if (!pat && !groundsWinner) label = "ai";
        else if (pat && !c.match) {
          c.match = { kind: "pattern", patternId: pat.id, patternName: pat.name, scaffold: pat.scaffold };
        }
      }
      c.label = label;
      c.grounding = String(cl.grounding || "");
      c.reason = String(cl.reason || "");
    });
    var order = { proof: 0, ai_proof: 1, ai: 2 };
    return candidates.slice().sort(function (a, b) {
      var la = a.label ? order[a.label] : 9, lb = b.label ? order[b.label] : 9;
      return la !== lb ? la - lb : b.rank - a.rank;
    });
  }
  function aiPass(candidates, theBank, winners, settings) {
    var prompt = buildAIPrompt(candidates, theBank, winners, settings);
    return window.LLMProvider.generateText(D.getProviderConfig(), {
      prompt: prompt, temperature: 0.4, jsonMode: true, maxTokens: 3000,
    }).then(function (text) {
      var parsed;
      try { parsed = JSON.parse(text); }
      catch (e) {
        var m = String(text).match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]); else throw new Error("AI returned unparseable output");
      }
      return mergeAIResults(candidates, parsed, theBank, winners);
    });
  }

  // --- render ---
  var LABEL_HTML = {
    proof: '<span class="tclabel proof">PROOF</span>',
    ai_proof: '<span class="tclabel aiproof">AI + PROOF</span>',
    ai: '<span class="tclabel ai">AI RECOMMENDED</span>',
    scan: '<span class="tclabel scan">SCAN</span>',
  };

  function groundingHtml(c) {
    var esc = D.esc;
    if (c.match && c.match.kind === "pattern") {
      return '<div class="tcground">matches: <b>' + esc(c.match.patternName) + '</b> — “' + esc(c.match.scaffold) + '”</div>';
    }
    if (c.match && c.match.kind === "ledger") {
      return '<div class="tcground">matches your winner: <b>“' + esc(c.match.hook) + '”</b></div>';
    }
    if (c.grounding) return '<div class="tcground">AI grounding: ' + esc(c.grounding) + '</div>';
    if (c.reason) return '<div class="tcground">AI: ' + esc(c.reason) + '</div>';
    return "";
  }

  var HOOKLAB_URL = "https://mjmorrison10.github.io/Hooklabs/";
  // Short status word for the meta line.
  function ledgerLabel(meta) {
    if (meta.ledgerFound && meta.winnerCount > 0) return meta.winnerCount + " winners";
    if (!meta.ledgerFound) return "not found";
    return meta.ledgerReason === "empty" ? "empty" : "no winners yet";
  }
  // Tailored nudge telling the user exactly what's missing and how to fix it.
  // Empty when the ledger already has winners to match against.
  function ledgerHintHTML(meta) {
    if (meta.ledgerFound && meta.winnerCount > 0) return "";
    var link = '<a href="' + HOOKLAB_URL + '" target="_blank" rel="noopener">open the full HOOKLAB app</a>';
    var msg;
    if (!meta.ledgerFound) {
      msg = "No HOOKLAB ledger in this browser yet — " + link + " on this device and log at least one " +
            "winning hook to unlock ledger-proven matches. (The embedded demo on mjmorrisonusa.com keeps " +
            "separate storage, so open the full app.)";
    } else if (meta.ledgerReason === "empty") {
      msg = "Your HOOKLAB ledger is empty — add a hook and mark it a Winner in HOOKLAB (" + link +
            ") to unlock ledger-proven matches.";
    } else {
      msg = "No winning hooks in your HOOKLAB ledger yet — mark a proven hook as a Winner (" + link +
            ") to unlock ledger-proven matches.";
    }
    return '<div class="tchint">' + msg + "</div>";
  }
  function renderTopClips(candidates, meta) {
    var results = document.querySelector("#results");
    var esc = D.esc;
    var shown = candidates.filter(function (c) { return c.label; }).slice(0, DISPLAY_CAP);
    // In scout mode, a source may have no proven-pattern matches offline. Rather
    // than show nothing, backfill with the most specific un-proven lines tagged
    // SCAN, so the editor always gets a usable shot list.
    if (meta.scout && shown.length < 10) {
      var extra = candidates.filter(function (c) { return !c.label; }).slice(0, 10 - shown.length)
        .map(function (c) { var d = {}; for (var k in c) d[k] = c[k]; d.label = "scan"; return d; });
      shown = shown.concat(extra);
    }
    lastShown = shown;
    var head =
      '<div class="tchead">' +
      '<button class="tcback" id="tcback">← BACK TO SEARCH</button>' +
      (shown.length ? '<button class="tcback" id="tccopy">⧉ COPY SHOT LIST</button>' : "") +
      '<span class="tctitle">' + (meta.scout ? "SCOUT" : "TOP CLIPS") + "</span>" +
      '<span class="tcmeta">' + (meta.scout && meta.scoutTitle ? esc(meta.scoutTitle) + " · " : "") +
      shown.length + " candidates · pattern bank: " + meta.bankSource +
      (meta.bankSource === "snapshot" ? " (" + esc(meta.snapshotDate) + ")" : "") +
      " · ledger: " + ledgerLabel(meta) + "</span>" +
      ledgerHintHTML(meta) +
      (meta.aiNote ? '<div class="tchint">' + esc(meta.aiNote) + "</div>" : "") +
      "</div>" +
      '<div class="tcnote">PROOF = matches a HOOKLAB-verified winner or a high-evidence pattern. ' +
      "AI + PROOF = AI flags a close variation of a proven pattern (named below the line). " +
      "AI RECOMMENDED = AI judgment only — no proof trail. Nothing here is a virality score.</div>";

    if (!shown.length) {
      results.innerHTML = head +
        '<div class="empty"><h3>No proven matches yet</h3>' +
        "<p>None of your enabled sources contain a line matching a proven hook pattern" +
        (meta.ledgerFound ? "" : " — and no HOOKLAB ledger was found to match against") +
        ". Add more sources, or set an API key in Settings to let the AI pass surface candidates.</p></div>";
      bindHead();
      return;
    }

    results.innerHTML = head + shown.map(function (c) {
      var added = D.binHas(c.key);
      return '<div class="res">' +
        '<div class="head"><span class="tc">' + c.t + "</span>" +
        '<span class="src">' + esc(c.srcTitle) + "</span>" +
        (LABEL_HTML[c.label] || "") +
        '<button class="postbtn" data-key="' + c.key + '">→ POST</button>' +
        '<button class="addbtn' + (added ? " added" : "") + '" data-key="' + c.key + '" ' +
        'data-src="' + c.srcId + '" data-idx="' + c.idx + '">' + (added ? "IN BIN ✓" : "+ BIN") + "</button></div>" +
        '<div class="line">' + esc(c.text) + "</div>" +
        groundingHtml(c) +
        (c.key === openPostKey ? postPanelHtml(c) : "") + "</div>";
    }).join("");
    bindHead();
    results.querySelectorAll(".addbtn").forEach(function (b) {
      b.addEventListener("click", function () { D.toggleBin(b.dataset.src, +b.dataset.idx); });
    });
    bindPostControls(results, shown);
  }

  // --- Top Posts panel ---
  function postProvenance(c) {
    var esc = D.esc;
    if (c.match && c.match.kind === "pattern") return 'post grounded in: <b>pattern "' + esc(c.match.patternName) + '"</b>';
    if (c.match && c.match.kind === "ledger") return 'post grounded in: <b>your winner “' + esc(c.match.hook) + '”</b>';
    return "verbatim quote — from " + esc(c.srcTitle) + " @ " + c.t;
  }
  function postVariantHtml(c, variant, label) {
    var esc = D.esc;
    var draft = postDrafts[c.key][variant];
    var limit = POST_LIMITS[variant];
    var level = draft.length > limit ? "over" : draft.length >= Math.round(limit * 0.9) ? "near" : "ok";
    return '<div class="postvariant" data-variant="' + variant + '">' +
      '<div class="postvhead">' + label +
      ' <span class="postcount" data-level="' + level + '">' + draft.length + " / " + limit + "</span></div>" +
      '<textarea class="posttext" data-variant="' + variant + '" rows="3">' + esc(draft) + "</textarea>" +
      '<div class="postactions">' +
      '<button class="postcopy" data-variant="' + variant + '">COPY</button>' +
      '<a class="postintent" data-variant="' + variant + '" target="_blank" rel="noopener" href="' +
        esc(INTENT[variant](draft)) + '">OPEN IN ' + label.toUpperCase() + " →</a>" +
      '<button class="postsend" data-variant="' + variant + '">SEND TO BLAST</button>' +
      "</div></div>";
  }
  function postPanelHtml(c) {
    var keyed = hasKey(D.getProviderConfig());
    return '<div class="postpanel" data-key="' + c.key + '">' +
      '<div class="postprov">' + postProvenance(c) + "</div>" +
      postVariantHtml(c, "x", "X") +
      postVariantHtml(c, "threads", "Threads") +
      (keyed
        ? '<button class="postai">✦ AI COMPOSE</button>'
        : '<div class="tchint">Offline quote mode — add an API key in Settings for AI compose.</div>') +
      "</div>";
  }
  function bindPostControls(container, shown) {
    var byKey = Object.create(null);
    shown.forEach(function (c) { byKey[c.key] = c; });
    container.querySelectorAll(".postbtn").forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.dataset.key;
        if (openPostKey === key) { openPostKey = null; }
        else {
          openPostKey = key;
          if (!postDrafts[key]) postDrafts[key] = composeOffline(byKey[key], D.loadSettings());
        }
        renderTopClips(lastCandidates, lastMeta);
      });
    });
    var panel = container.querySelector(".postpanel");
    if (!panel) return;
    var c = byKey[panel.dataset.key];
    if (!c) return;
    // Surgical input handling — update draft/count/intent-href without a
    // re-render, so typing never blurs the textarea (refreshValidation discipline).
    panel.querySelectorAll(".posttext").forEach(function (ta) {
      ta.addEventListener("input", function () {
        var variant = ta.dataset.variant;
        postDrafts[c.key][variant] = ta.value;
        var limit = POST_LIMITS[variant];
        var count = panel.querySelector('.postvariant[data-variant="' + variant + '"] .postcount');
        if (count) {
          count.textContent = ta.value.length + " / " + limit;
          count.setAttribute("data-level",
            ta.value.length > limit ? "over" : ta.value.length >= Math.round(limit * 0.9) ? "near" : "ok");
        }
        var intent = panel.querySelector('.postintent[data-variant="' + variant + '"]');
        if (intent) intent.href = INTENT[variant](ta.value);
      });
    });
    panel.querySelectorAll(".postcopy").forEach(function (b) {
      b.addEventListener("click", function () {
        var text = postDrafts[c.key][b.dataset.variant];
        var done = function () { D.toast("Copied for " + (b.dataset.variant === "x" ? "X" : "Threads")); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { D.toast("Couldn't copy — select the text manually"); });
        } else { D.toast("Couldn't copy — select the text manually"); }
      });
    });
    panel.querySelectorAll(".postsend").forEach(function (b) {
      b.addEventListener("click", function () { sendToBlast(postDrafts[c.key][b.dataset.variant]); });
    });
    var aiBtn = panel.querySelector(".postai");
    if (aiBtn) {
      aiBtn.addEventListener("click", function () {
        aiBtn.disabled = true;
        aiBtn.textContent = "Composing…";
        aiComposePost(c, D.loadSettings()).then(function (result) {
          postDrafts[c.key] = result;
          renderTopClips(lastCandidates, lastMeta); // panel stays open via openPostKey
        }).catch(function (err) {
          console.warn("topclips ai compose:", err);
          aiBtn.disabled = false;
          aiBtn.textContent = "✦ AI COMPOSE";
          D.toast("AI compose failed — showing verbatim quote");
        });
      });
    }
  }
  function bindHead() {
    var back = document.querySelector("#tcback");
    if (back) back.addEventListener("click", function () { exit(); D.search(); });
    var copy = document.querySelector("#tccopy");
    if (copy) copy.addEventListener("click", function () {
      var text = shotListText(lastShown, lastMeta);
      if (!navigator.clipboard) { D.toast("Copy not supported here"); return; }
      navigator.clipboard.writeText(text).then(function () { D.toast("Shot list copied — paste it into your editor"); })
        .catch(function () { D.toast("Copy failed"); });
    });
  }
  // Why this line is a candidate — plain text for the copied shot list.
  function whyNote(c) {
    if (c.match && c.match.kind === "ledger") return 'your proven winner: "' + c.match.hook + '"';
    if (c.match && c.match.kind === "pattern") return "proven pattern: " + c.match.patternName;
    if (c.grounding) return c.grounding;
    if (c.reason) return c.reason;
    return "specific, hook-shaped line";
  }
  function shotListText(shown, meta) {
    var title = meta && meta.scout ? ("SCOUT — " + (meta.scoutTitle || "")) : "TOP CLIPS";
    var lines = (shown || []).map(function (c) { return "[" + c.t + "] " + c.text + "  — " + whyNote(c); });
    return title + "\n" + lines.join("\n") + "\n";
  }
  // Public: scan a single source and show its scout report.
  function scout(srcId) {
    var st = D.getState();
    var src = null;
    for (var i = 0; i < st.sources.length; i++) if (st.sources[i].id === srcId) src = st.sources[i];
    if (!src) { D.toast("Source not found"); return; }
    enter({ srcId: srcId, srcTitle: src.title });
  }
  function renderLoading(done, total) {
    document.querySelector("#results").innerHTML =
      '<div class="tchead"><span class="tctitle">TOP CLIPS</span>' +
      '<span class="tcmeta">Scanning ' + total + " moments… " + done + "/" + total + "</span></div>";
  }

  // --- mode control ---
  function enter(opts) {
    opts = opts || {};
    active = true;
    var srcId = opts.srcId || null;
    var settings = D.loadSettings();
    renderLoading(0, 0);
    loadPatternBank().then(function (theBank) {
      var led = loadLedgerWinners();
      return scanLibrary(theBank, led.winners, settings, renderLoading, srcId).then(function (cands) {
        lastCandidates = cands;
        lastMeta = {
          bankSource: theBank.source, snapshotDate: theBank.snapshotDate,
          ledgerFound: led.found, ledgerReason: led.reason,
          winnerCount: led.winners.length, aiNote: "",
          scout: !!srcId, scoutTitle: opts.srcTitle || "",
        };
        if (!active) return;
        var cfg = D.getProviderConfig();
        if (!hasKey(cfg)) {
          lastMeta.aiNote = "Offline mode — add an API key in Settings to unlock AI + PROOF and AI RECOMMENDED candidates.";
          renderTopClips(lastCandidates, lastMeta);
          return;
        }
        lastMeta.aiNote = "AI pass running…";
        renderTopClips(lastCandidates, lastMeta);
        return aiPass(lastCandidates, theBank, led.winners, settings).then(function (merged) {
          if (!active) return;
          lastCandidates = merged;
          lastMeta.aiNote = "";
          renderTopClips(lastCandidates, lastMeta);
        }).catch(function (err) {
          console.warn("topclips ai pass:", err);
          if (!active) return;
          lastMeta.aiNote = "AI pass failed (" + (err && err.message || "error") + ") — showing offline PROOF results.";
          renderTopClips(lastCandidates, lastMeta);
          D.toast("Top Clips AI pass failed — offline results shown");
        });
      });
    }).catch(function (err) {
      console.error("topclips:", err);
      D.toast("Top Clips failed: " + (err && err.message || err));
      active = false;
      D.search();
    });
  }
  function exit() { active = false; openPostKey = null; }
  function isActive() { return active; }
  function refresh() {
    if (active && lastCandidates) renderTopClips(lastCandidates, lastMeta);
  }

  function init(deps) {
    D = deps;
    var btn = document.querySelector("#topclips");
    if (btn) btn.addEventListener("click", enter);
  }

  return { init: init, isActive: isActive, refresh: refresh, exit: exit, scout: scout };
})();
