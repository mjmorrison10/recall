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
  function loadLedgerWinners() {
    try {
      var raw = localStorage.getItem("hooklab_state_v1");
      if (!raw) return { winners: [], found: false };
      var st = JSON.parse(raw);
      var winners = (st.ledger || [])
        .filter(function (e) { return e.outcome === "winner" && e.hook; })
        .slice(0, 50)
        .map(function (e) {
          return { hook: e.hook, hookTokens: tokens(e.hook), patternId: e.patternId || null, family: e.family || "" };
        });
      return { winners: winners, found: true };
    } catch (e) {
      return { winners: [], found: false };
    }
  }

  // --- offline scan ---
  var LEDGER_SIM = 0.55;      // near-verbatim reuse of a proven hook
  var SKEL_CONTAIN = 0.75;    // scaffold skeleton mostly present in the line
  var AI_FEED_CAP = 80;
  var DISPLAY_CAP = 20;

  function scanLibrary(theBank, winners, settings, onProgress) {
    return new Promise(function (resolve) {
      var state = D.getState();
      var enabled = state.sources.filter(function (s) { return state.enabled.indexOf(s.id) >= 0; });
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

  // --- render ---
  var LABEL_HTML = {
    proof: '<span class="tclabel proof">PROOF</span>',
    ai_proof: '<span class="tclabel aiproof">AI + PROOF</span>',
    ai: '<span class="tclabel ai">AI RECOMMENDED</span>',
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

  function renderTopClips(candidates, meta) {
    var results = document.querySelector("#results");
    var esc = D.esc;
    var shown = candidates.filter(function (c) { return c.label; }).slice(0, DISPLAY_CAP);
    var head =
      '<div class="tchead">' +
      '<button class="tcback" id="tcback">← BACK TO SEARCH</button>' +
      '<span class="tctitle">TOP CLIPS</span>' +
      '<span class="tcmeta">' + shown.length + " candidates · pattern bank: " + meta.bankSource +
      (meta.bankSource === "snapshot" ? " (" + esc(meta.snapshotDate) + ")" : "") +
      " · ledger: " + (meta.ledgerFound ? meta.winnerCount + " winners" : "not found") + "</span>" +
      (meta.ledgerFound ? "" :
        '<div class="tchint">No HOOKLAB ledger found in this browser — open HOOKLAB once on this device to unlock ledger-proven matches.</div>') +
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
        '<button class="addbtn' + (added ? " added" : "") + '" data-key="' + c.key + '" ' +
        'data-src="' + c.srcId + '" data-idx="' + c.idx + '">' + (added ? "IN BIN ✓" : "+ BIN") + "</button></div>" +
        '<div class="line">' + esc(c.text) + "</div>" +
        groundingHtml(c) + "</div>";
    }).join("");
    bindHead();
    results.querySelectorAll(".addbtn").forEach(function (b) {
      b.addEventListener("click", function () { D.toggleBin(b.dataset.src, +b.dataset.idx); });
    });
  }
  function bindHead() {
    var back = document.querySelector("#tcback");
    if (back) back.addEventListener("click", function () { exit(); D.search(); });
  }
  function renderLoading(done, total) {
    document.querySelector("#results").innerHTML =
      '<div class="tchead"><span class="tctitle">TOP CLIPS</span>' +
      '<span class="tcmeta">Scanning ' + total + " moments… " + done + "/" + total + "</span></div>";
  }

  // --- mode control ---
  function enter() {
    active = true;
    var settings = D.loadSettings();
    renderLoading(0, 0);
    loadPatternBank().then(function (theBank) {
      var led = loadLedgerWinners();
      return scanLibrary(theBank, led.winners, settings, renderLoading).then(function (cands) {
        lastCandidates = cands;
        lastMeta = {
          bankSource: theBank.source, snapshotDate: theBank.snapshotDate,
          ledgerFound: led.found, winnerCount: led.winners.length, aiNote: "",
        };
        if (!active) return;
        renderTopClips(lastCandidates, lastMeta);
      });
    }).catch(function (err) {
      console.error("topclips:", err);
      D.toast("Top Clips failed: " + (err && err.message || err));
      active = false;
      D.search();
    });
  }
  function exit() { active = false; }
  function isActive() { return active; }
  function refresh() {
    if (active && lastCandidates) renderTopClips(lastCandidates, lastMeta);
  }

  function init(deps) {
    D = deps;
    var btn = document.querySelector("#topclips");
    if (btn) btn.addEventListener("click", enter);
  }

  return { init: init, isActive: isActive, refresh: refresh, exit: exit };
})();
