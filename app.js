(async function(){
  "use strict";
  var LS="recall_state_v2";
  // IndexedDB replaces localStorage for the library. Browser quota is ~60% of
  // disk vs localStorage's 5-10MB, so a 50-episode back catalog now fits.
  // API key (LS_SETTINGS) stays in localStorage — small, never grows.
  var DB_NAME="recall";
  var DB_VERSION=1;
  var STORE_NAME="library";
  var DB_KEY="current";

  var SEED_APOGEE=`[00:00:17] So speaking of diving in, what's the 30,000-foot view of who Rome Scurry is and what you're all about?
[00:00:27] Who I am is a mentor, a leader, somebody who really cares about other people, and somebody who puts protection at the top of my priority.
[00:00:46] I'm from a small town called Bridgeton, New Jersey. Growing up there, all I wanted to do was leave.
[00:01:36] I saw track and field as my outlet. I might not make it to the Olympics, but I'm definitely gonna go somewhere for this.
[00:01:55] My adversity point: at the height of all that, at 15, my girlfriend, who's my wife now, got pregnant.
[00:02:15] So now I'm 15 years old. What am I gonna do with a baby? I felt like at that point it was probably over for me.
[00:02:37] But I remember my wife, after she had the baby, came back to high school and broke her cross country record a couple months later.
[00:02:59] Seeing how strong and tough she was, I was like, we gotta keep going. We can't stop here.
[00:03:35] I went through my senior year with a baby, a baby with cerebral palsy at that.
[00:03:44] I'm working at Walmart pushing carts, going to track practice, going to football practice, trying to earn my way.
[00:05:05] My goal was to be a cop. I met a bunch of people in the military when I was in Virginia.
[00:06:08] Over there, boot camp taught me structure. It really taught me about different cultures.
[00:09:26] I was on the front lines of that big riot in 2020. That was a hard year for me as a police officer.
[00:10:46] I was having an identity crisis with the job, and it stemmed from the whole George Floyd era.
[00:11:11] I lost family, friends. People were like, are you a cop, or are you this?
[00:12:12] They called me Uncle Scurry in the academy. If you really need some life advice, you come to me.
[00:12:59] I started to think of different avenues to use that gift to help out on a bigger scale.
[00:13:21] As you know, there's a lot of trauma in the job as well.
[00:13:56] I started a mentorship program. That's Lead Teach Inspire.
[00:14:44] I said I'm gonna go all in. You believed in me before, just believe in me one more time.
[00:15:11] I started with about nine kids, now we got about twelve boys, and it changed so many of them.
[00:19:23] I always dive into this when I talk about leadership. Leadership is different than management.
[00:19:43] Where does it all begin? For you, it began with the self. You have to do that work on yourself.
[00:21:05] I've always had a level of confidence, in a good way.
[00:21:20] The way I carry myself is very respectful, to others and to myself. I work out, I box, Muay Thai, jujitsu.
[00:22:07] It's always that wow factor that leads me into a further discussion with people.
[00:22:29] The main thing is how other people speak about you when you're not there.
[00:22:48] When other people speak highly of me, it carries more weight than I could ever do.
[00:23:09] It reminds me of one of the challenges we have here in Apogee. It's called the rules of engagement.
[00:23:55] So to me, your self-belief is skyrocketing high. To present yourself with confidence, you have to have done the work.
[00:24:28] That's really the concept of anti-fragility.
[00:24:48] It's the classic hero villain story. Which path are you gonna choose? Many will choose the villain story.
[00:25:09] You took that adversity, and instead of letting it defeat you, you rose above it and became better because of it.
[00:26:15] When I speak to the kids, I wear the flashy clothes. The kids are like, who's this guy? Now I've got your attention.
[00:29:07] I'm trying to explain that something's going on, that this is affecting me mentally, and it wasn't received well.
[00:30:19] I had to do some deep diving and figure out outlets for myself.
[00:36:23] What people need is for two people from different cultures to sit down and have a real conversation.
[00:39:15] Most of America doesn't go that far left or right. Most of the country is in the middle.
[00:39:36] Every bit of this hatred only exists on the internet. Nobody cares in real life.
[00:41:17] The goal is to use the podcast and social media to expand the brand, and the brand is the mentorship work.`;

  var SEED_SAMPLE=`[00:00:05] Discipline is just remembering what you want. Confidence comes after the work, never before it.
[00:00:22] Most men wait to feel ready. You will never feel ready. You move first, and the confidence follows.
[00:00:41] The hardest rep is the one nobody sees. That's the one that builds the man.
[00:01:03] Adversity isn't the obstacle. Adversity is the curriculum.
[00:01:24] Everybody wants the result. Almost nobody wants the boring work that makes the result.
[00:01:48] Your reputation is built when you're not in the room. Guard it like it pays your bills, because it does.`;

  function toSec(t){var p=t.split(":").map(Number);
    if(p.length===3)return p[0]*3600+p[1]*60+p[2];
    if(p.length===2)return p[0]*60+p[1];return p[0]||0;}
  function norm(t){var p=t.split(":").map(function(n){return n.replace(/\D/g,"")});
    if(p.length===2)return "0:"+p[0].padStart(2,"0")+":"+p[1].padStart(2,"0");
    return p.map(function(x,i){return i===0?x:x.padStart(2,"0")}).join(":");}
  // Two accepted line shapes:
  //  • single timecode leading the moment:  [00:01:23] text  /  1:23 text
  //  • a range header (TurboScribe style):   (0:04 - 0:23)  with the paragraph
  //    on the following line(s); start time wins. Brackets or parens, en/em dash ok.
  var RANGE_RE = /^[\[(]?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*\d{1,2}:\d{2}(?::\d{2})?\s*[\])]?\s*(.*)$/;
  var STAMP_RE = /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.+)$/;
  function cleanLine(t){ return String(t).replace(/\*\*/g,"").replace(/^\w+:\s*/,"").trim(); }
  // Parse one transcript line into `out`, either starting a new moment or
  // appending a continuation to the moment above it.
  function pushLine(out, ln){
    var mr = ln.match(RANGE_RE);
    if(mr){ out.push({t:norm(mr[1]), sec:toSec(mr[1]), text:cleanLine(mr[2] || "")}); return; }
    var m = ln.match(STAMP_RE);
    if(m){ out.push({t:norm(m[1]), sec:toSec(m[1]), text:cleanLine(m[2])}); return; }
    if(out.length){
      var seg = out[out.length-1];
      var add = cleanLine(ln);
      if(add) seg.text = seg.text ? seg.text + " " + add : add;
    }
  }
  // Top Clips only scans moments of 4–40 words (topclips.js), so a fat
  // paragraph block (e.g. a TurboScribe range) would be skipped whole. Split
  // any >40-word moment into sentence-packed pieces that inherit its start
  // time, so a hook buried mid- or end-block still surfaces as its own clip.
  var SEG_MAX_WORDS = 40;
  function wordCountOf(t){ return (String(t).trim().match(/\S+/g) || []).length; }
  function splitLongSegments(segs){
    var out = [];
    for(var i=0;i<segs.length;i++){
      var s = segs[i];
      if(wordCountOf(s.text) <= SEG_MAX_WORDS){ out.push(s); continue; }
      var sentences = s.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [s.text];
      var buf = "", bufw = 0;
      for(var j=0;j<sentences.length;j++){
        var sent = sentences[j].trim(); if(!sent) continue;
        var sw = wordCountOf(sent);
        if(bufw && bufw + sw > SEG_MAX_WORDS){
          out.push({t:s.t, sec:s.sec, text:buf});
          buf = ""; bufw = 0;
        }
        buf = buf ? buf + " " + sent : sent;
        bufw += sw;
        if(bufw >= SEG_MAX_WORDS){ out.push({t:s.t, sec:s.sec, text:buf}); buf = ""; bufw = 0; }
      }
      if(buf) out.push({t:s.t, sec:s.sec, text:buf});
    }
    return out;
  }
  // ── Format-aware parsing ────────────────────────────────────────────
  // TurboScribe (and most tools) can export richer timing than the paragraph
  // format: SRT/VTT cues (~2s each, but text fragmented mid-sentence) and an
  // inline "(0:00) text (0:04) text" web-copy format (~4s, sentences intact).
  // Detect which was pasted and route to a dedicated parser; anything else
  // falls through to the original line-by-line engine.
  function stripNoise(raw){ return String(raw).replace(/\(Transcribed by TurboScribe[^)]*\)/ig,""); }
  var INLINE_STAMP_RE = /\(\d{1,2}:\d{2}(?::\d{2})?\)\s*(?=\S)/g; // (0:00) immediately followed by text
  function detectFormat(raw){
    if(raw.indexOf("-->") !== -1) return "srt";              // SRT/VTT timing arrow
    var m = raw.match(INLINE_STAMP_RE);
    if(m && m.length >= 3) return "inline";                  // (0:00) text (0:04) text
    return "legacy";
  }
  // Merge ordered {sec,t,text} fragments into full sentences, each anchored to
  // the timestamp of the fragment where the sentence STARTED. This is what gives
  // SRT both fine timestamps AND cross-fragment search context (an SRT cue
  // usually ends mid-sentence, so raw cues would break phrase search).
  function mergeToSentences(frags){
    var out = [], buf = "", bufw = 0, startSec = 0, startT = "";
    function flush(){ var txt = cleanLine(buf); if(txt) out.push({t:startT, sec:startSec, text:txt}); buf=""; bufw=0; }
    for(var i=0;i<frags.length;i++){
      var piece = String(frags[i].text||"").trim(); if(!piece) continue;
      if(!buf){ startSec = frags[i].sec; startT = frags[i].t; }
      buf = buf ? buf + " " + piece : piece;
      bufw += wordCountOf(piece);
      if(/[.!?]["')\]]?$/.test(piece) || bufw >= SEG_MAX_WORDS) flush();
    }
    flush();
    return out;
  }
  // SRT / WebVTT cue blocks → fragments → sentence-merge → long-split.
  function parseSRT(raw){
    var text = stripNoise(raw).replace(/^﻿/,"").replace(/\r/g,"");
    var blocks = text.split(/\n\s*\n/), frags = [];
    for(var b=0;b<blocks.length;b++){
      var lines = blocks[b].split("\n"), start = null, textLines = [];
      for(var i=0;i<lines.length;i++){
        var ln = lines[i].trim(); if(!ln) continue;
        if(/^WEBVTT/i.test(ln) || /^NOTE\b/i.test(ln)){ start = null; textLines = []; break; }
        if(start === null && ln.indexOf("-->") !== -1){
          var mm = ln.match(/(\d{1,2}:\d{2}(?::\d{2})?)[.,]?\d*\s*-->/);
          if(mm){ start = mm[1]; continue; }
        }
        if(start === null && /^\d+$/.test(ln)) continue;     // cue sequence number
        if(start !== null) textLines.push(ln);
      }
      if(start !== null && textLines.length){
        var t = textLines.join(" ").replace(/<[^>]+>/g,"").trim();
        if(t) frags.push({sec:toSec(start), t:norm(start), text:t});
      }
    }
    return splitLongSegments(mergeToSentences(frags));
  }
  // TurboScribe inline "(0:00) text (0:04) text" → fragments → sentence-merge.
  function parseInline(raw){
    var text = stripNoise(raw).replace(/\s+/g," "), frags = [], m, last = null, lastIdx = 0;
    var re = /\((\d{1,2}:\d{2}(?::\d{2})?)\)/g;
    while((m = re.exec(text))){
      if(last !== null){ var chunk = text.slice(lastIdx, m.index).trim(); if(chunk) frags.push({sec:toSec(last), t:norm(last), text:chunk}); }
      last = m[1]; lastIdx = re.lastIndex;
    }
    if(last !== null){ var tail = text.slice(lastIdx).trim(); if(tail) frags.push({sec:toSec(last), t:norm(last), text:tail}); }
    return splitLongSegments(mergeToSentences(frags));
  }
  function parse(raw){
    var fmt = detectFormat(raw);
    if(fmt === "srt") return parseSRT(raw);
    if(fmt === "inline") return parseInline(raw);
    var out=[],lines=stripNoise(raw).split("\n");
    for(var i=0;i<lines.length;i++){
      var ln=lines[i].trim(); if(!ln)continue;
      pushLine(out, ln);
    }
    return splitLongSegments(out);
  }
  function uid(){return Math.random().toString(36).slice(2,9);}

  // === IndexedDB persistence ===
  // Single object store, single record. Same shape as the old localStorage
  // blob so migration is just JSON.parse → JSON.stringify on the value.
  function openDB(){
    return new Promise(function(resolve, reject){
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(){
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)){
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error); };
    });
  }
  function dbOp(mode, value){
    return openDB().then(function(db){
      return new Promise(function(resolve, reject){
        var tx = db.transaction(STORE_NAME, mode);
        var store = tx.objectStore(STORE_NAME);
        var req = (mode === "readwrite") ? store.put(value, DB_KEY) : store.get(DB_KEY);
        req.onsuccess = function(){ resolve(req.result); };
        req.onerror = function(){ reject(req.error); };
      });
    });
  }
  async function loadState(){
    // 1) Try IDB first
    try {
      var fromIDB = await dbOp("readonly");
      if (fromIDB && fromIDB.sources) return fromIDB;
    } catch(e) { console.warn("recall: IDB read failed", e); }
    // 2) Migrate from legacy localStorage on first launch
    try {
      var raw = localStorage.getItem(LS);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.sources) {
          try {
            await dbOp("readwrite", parsed);
            localStorage.removeItem(LS);
          } catch(e) { console.warn("recall: IDB migration write failed", e); }
          return parsed;
        }
      }
    } catch(e) { console.warn("recall: localStorage read failed", e); }
    // 3) First-time user — seed data
    return {
      sources:[
        {id:"apogee",title:"Apogee — Rome Scurry interview",segments:parse(SEED_APOGEE)},
        {id:"sample",title:"Sample — Discipline rant (delete me)",segments:parse(SEED_SAMPLE)}
      ],
      enabled:["apogee","sample"], bin:[]
    };
  }
  var state = await loadState();
  // Async save: IDB first, falls back to localStorage on quota/permission.
  // All callers fire-and-forget — IDB writes are atomic and fast.
  async function save(){
    try {
      await dbOp("readwrite", state);
      return true;
    } catch(e) {
      try {
        localStorage.setItem(LS, JSON.stringify(state));
        return true;
      } catch(e2) {
        toast("Save failed — storage full. Remove a source and retry.");
        console.error("recall save error:", e2);
        return false;
      }
    }
  }

  var $=function(s){return document.querySelector(s)};
  var q=$("#q"),results=$("#results"),chips=$("#chips"),count=$("#count"),
      binlist=$("#binlist"),bnum=$("#bnum"),exportBtn=$("#export"),
      exportSRTBtn=$("#exportSRT"),clearBtn=$("#clearbin");

  function esc(s){return s.replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]});}
  function terms(str){return str.toLowerCase().split(/\s+/).filter(function(w){return w.length});}
  function hi(text,ws){
    var e=esc(text); if(!ws.length)return e;
    var re=new RegExp("("+ws.map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}).join("|")+")","gi");
    return e.replace(re,"<mark>$1</mark>");
  }
  function binHas(k){return state.bin.some(function(b){return b.key===k})}

  function search(){
    if(window.TopClips&&window.TopClips.isActive())window.TopClips.exit();
    var raw=q.value.trim(), ws=terms(raw);
    $("#clearq").style.display=raw?"block":"none";
    var enabled=state.sources.filter(function(s){return state.enabled.indexOf(s.id)>=0});
    var hits=[];
    if(ws.length){
      enabled.forEach(function(s){
        s.segments.forEach(function(seg,idx){
          var low=seg.text.toLowerCase();
          if(ws.every(function(w){return low.indexOf(w)>=0})){
            hits.push({s:s,seg:seg,idx:idx});
          }
        });
      });
    }
    // count line
    var srcSet={}; hits.forEach(function(h){srcSet[h.s.id]=1});
    if(ws.length){
      count.innerHTML="<b>"+hits.length+"</b> "+(hits.length===1?"moment":"moments")+
        " · "+Object.keys(srcSet).length+" of "+enabled.length+" sources";
    }else{
      var tot=enabled.reduce(function(a,s){return a+s.segments.length},0);
      count.innerHTML="<b>"+tot+"</b> moments indexed · "+state.sources.length+" sources";
    }
    // results
    if(!ws.length){
      results.innerHTML='<div class="empty"><h3>Your whole library, one search away.</h3>'+
        '<p>Type a word or phrase and RECALL surfaces every moment it appears in — across every source you’ve loaded, timecoded and ready to collect.</p>'+
        '<div class="try"><button data-t="confidence">confidence</button>'+
        '<button data-t="adversity">adversity</button>'+
        '<button data-t="reputation">reputation</button>'+
        '<button data-t="hero villain">hero villain</button>'+
        '<button data-t="kids">kids</button></div></div>';
      bindTries(); return;
    }
    if(!hits.length){
      results.innerHTML='<div class="empty"><h3>No moments for “'+esc(raw)+'”</h3>'+
        '<p>Try a single distinctive word, or check that the right sources are switched on above.</p></div>';
      return;
    }
    results.innerHTML=hits.map(function(h){
      var seg=h.seg, key=h.s.id+"@"+seg.sec+"@"+h.idx, added=binHas(key);
      var prev=h.s.segments[h.idx-1], next=h.s.segments[h.idx+1];
      var ctx=""; if(prev)ctx+='<div class="ctx">'+esc(prev.text.slice(0,120))+'</div>';
      return '<div class="res">'+
        '<div class="head"><span class="tc">'+seg.t+'</span>'+
        '<span class="src">'+esc(h.s.title)+'</span>'+
        '<button class="addbtn'+(added?" added":"")+'" data-key="'+key+'" '+
          'data-src="'+h.s.id+'" data-idx="'+h.idx+'">'+(added?"IN BIN ✓":"+ BIN")+'</button></div>'+
        '<div class="line">'+hi(seg.text,ws)+'</div>'+ctx+'</div>';
    }).join("");
    results.querySelectorAll(".addbtn").forEach(function(b){
      b.addEventListener("click",function(){toggleBin(b.dataset.src,+b.dataset.idx);});
    });
  }

  function bindTries(){
    results.querySelectorAll(".try button").forEach(function(b){
      b.addEventListener("click",function(){q.value=b.dataset.t;search();q.focus();});
    });
  }

  function toggleBin(srcId,idx){
    var s=state.sources.find(function(x){return x.id===srcId}); if(!s)return;
    var seg=s.segments[idx], key=srcId+"@"+seg.sec+"@"+idx;
    var at=state.bin.findIndex(function(b){return b.key===key});
    if(at>=0)state.bin.splice(at,1);
    else state.bin.push({key:key,srcId:srcId,srcTitle:s.title,t:seg.t,sec:seg.sec,text:seg.text});
    save();
    // Inside Top Clips mode, refresh its cards instead of repainting search —
    // otherwise +BIN would wipe the recommendations view.
    if(window.TopClips&&window.TopClips.isActive())window.TopClips.refresh();
    else search();
    renderBin();
  }

  function renderBin(){
    bnum.textContent=state.bin.length;
    exportBtn.disabled=!state.bin.length;
    exportSRTBtn.disabled=!state.bin.length;
    if(clearBtn)clearBtn.disabled=!state.bin.length;
    if(!state.bin.length){
      binlist.innerHTML='<div class="binempty">Hit <span class="k">+ BIN</span> on any moment to '+
        'start building a clip concept. Stack moments from different sources — that’s where the '+
        'bangers live.</div>';return;
    }
    binlist.innerHTML=state.bin.map(function(b,i){
      return '<div class="binitem"><span class="ord">'+(i+1)+'</span>'+
        '<div class="bmid"><div class="btc">'+b.t+'</div>'+
        '<div class="btx">'+esc(b.text)+'</div>'+
        '<div class="bsrc">'+esc(b.srcTitle)+'</div></div>'+
        '<div class="bacts">'+
        '<button class="bblast" data-bb="'+b.key+'" title="Send to BLAST as the post caption" aria-label="Send to BLAST">→B</button>'+
        '<button class="edit" data-ek="'+b.key+'" aria-label="Edit text">✎</button>'+
        '<button class="rm" data-k="'+b.key+'" aria-label="Remove">&times;</button></div></div>';
    }).join("");
    binlist.querySelectorAll(".rm").forEach(function(btn){
      btn.addEventListener("click",function(){
        state.bin=state.bin.filter(function(b){return b.key!==btn.dataset.k});
        save();search();renderBin();
      });
    });
    // Per-clip handoff to BLAST: same blast_handoff_v1 contract as the Top
    // Clips POST panel (BLAST reads only {caption}); written here directly so
    // the app.js -> TopClips dependency arrow stays one-directional.
    binlist.querySelectorAll(".bblast").forEach(function(btn){
      btn.addEventListener("click",function(){
        var b=state.bin.find(function(v){return v.key===btn.dataset.bb});
        if(!b)return;
        try{
          localStorage.setItem("blast_handoff_v1",JSON.stringify({caption:b.text,source:"recall-bin",createdAt:Date.now()}));
        }catch(e){ toast("Couldn't hand off (storage full?)"); return; }
        window.open(new URL("../blast/",location.href).href,"_blank","noopener");
        toast("Sent to BLAST");
      });
    });
    binlist.querySelectorAll(".edit").forEach(function(btn){
      btn.addEventListener("click",function(){
        var b=state.bin.find(function(v){return v.key===btn.dataset.ek});
        if(!b)return;
        var txt=prompt("Edit this moment's text",b.text);
        if(txt==null)return;
        txt=txt.trim();
        if(!txt)return;
        b.text=txt;
        save();renderBin();
      });
    });
  }

  function renderChips(){
    var html=state.sources.map(function(s){
      var on=state.enabled.indexOf(s.id)>=0;
      return '<span class="chip'+(on?" on":"")+'" data-id="'+s.id+'">'+
        '<span class="sw"></span>'+esc(s.title)+
        ' <span class="n">'+s.segments.length+'</span>'+
        '<span class="scout" data-scout="'+s.id+'" title="Scout this source for hooks">⌕</span>'+
        '<span class="ren" data-ren="'+s.id+'" title="Rename source">✎</span>'+
        '<span class="x" data-del="'+s.id+'" title="Remove source">×</span></span>';
    }).join("");
    html+='<span class="chip addsrc" id="addchip">+ add source</span>';
    chips.innerHTML=html;
    chips.querySelectorAll(".chip[data-id]").forEach(function(c){
      c.addEventListener("click",function(e){
        if(e.target.dataset.del)return;
        if(e.target.dataset.scout)return;
        if(e.target.dataset.ren)return;
        var id=c.dataset.id, at=state.enabled.indexOf(id);
        var turningOn=at<0;
        if(at>=0)state.enabled.splice(at,1);else state.enabled.push(id);
        // renderChips() so the chip's on/off color updates immediately — every
        // other chip handler re-renders; the toggle was the one that didn't,
        // so the color only changed after a manual reload.
        save();renderChips();
        // Toggling a source ON auto-opens its saved Top Clips (if a scan was
        // persisted). search() would exit() that view, so skip it here;
        // toggling OFF (or no saved scan) keeps the normal search teardown.
        if(turningOn && window.TopClips && window.TopClips.hasSaved && window.TopClips.hasSaved(id)){
          window.TopClips.showSaved(id);
        } else {
          search();
        }
      });
    });
    chips.querySelectorAll("[data-del]").forEach(function(x){
      x.addEventListener("click",function(e){
        e.stopPropagation();var id=x.dataset.del;
        var s=state.sources.find(function(v){return v.id===id});
        if(!confirm("Remove “"+s.title+"” from your library?"))return;
        if(window.StackData) StackData.tombstone("recallSource", id);
        state.sources=state.sources.filter(function(v){return v.id!==id});
        state.enabled=state.enabled.filter(function(v){return v!==id});
        state.bin=state.bin.filter(function(b){return b.srcId!==id});
        if(window.TopClips && window.TopClips.dropSaved) window.TopClips.dropSaved(id);
        save();renderChips();search();renderBin();
      });
    });
    chips.querySelectorAll("[data-ren]").forEach(function(el){
      el.addEventListener("click",function(e){
        e.stopPropagation();var id=el.dataset.ren;
        var s=state.sources.find(function(v){return v.id===id});
        if(!s)return;
        var name=prompt("Rename source",s.title);
        if(name==null)return;
        name=name.trim();
        if(!name)return;
        s.title=name;
        state.bin.forEach(function(b){if(b.srcId===id)b.srcTitle=name;});
        if(window.TopClips && window.TopClips.renameSaved) window.TopClips.renameSaved(id,name);
        save();renderChips();renderBin();search();
      });
    });
    chips.querySelectorAll("[data-scout]").forEach(function(el){
      el.addEventListener("click",function(e){
        e.stopPropagation();
        if(window.TopClips && window.TopClips.scout) window.TopClips.scout(el.dataset.scout);
      });
    });
    $("#addchip").addEventListener("click",openModal);
  }

  if(clearBtn)clearBtn.addEventListener("click",function(){
    if(!state.bin.length)return;
    if(!confirm("Empty the clip bin? ("+state.bin.length+" moment"+(state.bin.length===1?"":"s")+")"))return;
    state.bin=[];
    save();search();renderBin();
  });

  // export
  exportBtn.addEventListener("click",function(){
    var lines=state.bin.map(function(b,i){
      return (i+1)+". ["+b.t+"]  "+b.text+"   — "+b.srcTitle;
    });
    var txt="CLIP CONCEPT  ·  "+state.bin.length+" moments\n"+
      "generated in RECALL\n\n"+lines.join("\n");
    var done=function(){toast("Shot list copied to clipboard");};
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done,function(){fallback(txt);done();});
    }else{fallback(txt);done();}
  });
  function fallback(txt){var ta=document.createElement("textarea");ta.value=txt;
    document.body.appendChild(ta);ta.select();try{document.execCommand("copy")}catch(e){}
    document.body.removeChild(ta);}

  // SRT export — produces a SubRip subtitle file from the current bin.
  // Each bin item's end time is the start of the next segment in the same source,
  // or +30s for the last segment. Subtitle import works in Premiere, CapCut,
  // DaVinci, and most NLEs — turns RECALL from a search tool into a clip tool.
  function srtTime(sec){
    var h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60);
    var s=Math.floor(sec%60), ms=Math.round((sec-Math.floor(sec))*1000);
    return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+
           String(s).padStart(2,"0")+","+String(ms).padStart(3,"0");
  }
  function binItemRange(b){
    var s=state.sources.find(function(x){return x.id===b.srcId;});
    if(!s) return {start:b.sec, end:b.sec+30};
    for(var i=0;i<s.segments.length;i++){
      if(s.segments[i].sec===b.sec){
        var next=s.segments[i+1];
        return {start:b.sec, end:next?next.sec:b.sec+30};
      }
    }
    return {start:b.sec, end:b.sec+30};
  }
  function exportBinSRT(){
    var lines=[];
    state.bin.forEach(function(b,i){
      var r=binItemRange(b);
      lines.push(String(i+1));
      lines.push(srtTime(r.start)+" --> "+srtTime(r.end));
      lines.push(b.text);
      lines.push("");
    });
    var srt=lines.join("\n")+"\n";  // trailing newline for SRT spec compliance
    var blob=new Blob([srt],{type:"text/plain"});
    var url=URL.createObjectURL(blob);
    var stamp=new Date().toISOString().slice(0,10);
    var a=document.createElement("a");
    a.href=url; a.download="recall-clips-"+stamp+".srt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},0);
    toast("SRT exported ("+state.bin.length+" clip"+(state.bin.length===1?"":"s")+")");
  }
  exportSRTBtn.addEventListener("click", exportBinSRT);

  var toastT;
  function toast(msg){var el=$("#toast");el.textContent=msg;el.classList.add("show");
    clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove("show")},1900);}

  // modal
  var scrim=$("#scrim"),mtitle=$("#mtitle"),mtext=$("#mtext"),msave=$("#msave"),mstatus=$("#mstatus");
  var modalBusy=false;
  // Bumped whenever the modal is closed/reset. An in-flight transcription
  // captures the current token and bails on completion if it changed — so
  // Cancel mid-upload can't silently add a source after the fact.
  var uploadToken=0;
  function openModal(){scrim.classList.add("open");mtitle.value="";mtext.value="";msave.disabled=true;
    pendingFile=null;audiofile.value="";renderUploadZone();setModalStatus("","");
    setTimeout(function(){mtitle.focus()},40);}
  function closeModal(){
    if(modalBusy){ uploadToken++; modalBusy=false; msave.disabled=false; }
    scrim.classList.remove("open");
  }

  // The modal footer status line does triple duty: requirement hint, missing-key
  // warning, and live transcription progress. kind ∈ "" | "hint" | "warn" | "progress".
  function setModalStatus(kind, msg){
    if(!mstatus)return;
    mstatus.className = "mstatus" + (kind ? " " + kind : "");
    if(kind === "progress"){
      mstatus.innerHTML = '<span class="mspin" aria-hidden="true"></span>' + esc(msg || "");
    } else {
      mstatus.textContent = msg || "";
    }
  }
  function activeProviderLabel(){
    return getProviderConfig().provider === "openrouter" ? "OpenRouter" : "Gemini";
  }
  function providerHasKey(){
    var cfg = getProviderConfig();
    return cfg.provider === "openrouter" ? !!cfg.openrouterKey : !!cfg.geminiKey;
  }
  // Tell the user WHY the button is disabled, or warn that a file can't be
  // transcribed without an API key — surfaced up front instead of only as a
  // toast after they click. Not shown while a transcription is in flight.
  function updateModalHint(){
    if(modalBusy)return;
    var hasInput = mtext.value.trim() || pendingFile;
    if(!mtitle.value.trim() && hasInput){
      setModalStatus("hint", "Add a title to enable “Add to library”");
    } else if(pendingFile && !providerHasKey()){
      setModalStatus("warn", "No " + activeProviderLabel() + " API key — add one in Settings to transcribe");
    } else {
      setModalStatus("","");
    }
  }
  // Cheap check on every keystroke — real parse happens at save time.
  // (Previously parse() ran on every input event, freezing the tab on hour-long transcripts.)
  // Enable save when we have a title plus EITHER a transcript OR an uploaded file.
  function chk(){
    msave.disabled = !(mtitle.value.trim() && (mtext.value.trim() || pendingFile));
    updateModalHint();
  }
  mtitle.addEventListener("input",chk);mtext.addEventListener("input",chk);
  var mcancel=$("#mcancel");
  mcancel.addEventListener("click",closeModal);
  scrim.addEventListener("click",function(e){if(e.target===scrim)closeModal();});
  // Chunked parse — yields to the browser every 500 lines so the UI stays
  // responsive on hour-long transcripts instead of locking the main thread.
  function parseChunked(raw, onProgress){
    return new Promise(function(resolve){
      // SRT/inline are a fast single-pass regex parse (no per-line streaming
      // needed); only the legacy line format uses the chunked yield loop.
      var fmt = detectFormat(raw);
      if(fmt === "srt"){ if(onProgress) onProgress(1,1); resolve(parseSRT(raw)); return; }
      if(fmt === "inline"){ if(onProgress) onProgress(1,1); resolve(parseInline(raw)); return; }
      var lines = stripNoise(raw).split("\n");
      var CHUNK = 500;
      var out = [];
      var i = 0;
      function step(){
        var end = Math.min(i + CHUNK, lines.length);
        for(; i < end; i++){
          var ln = lines[i].trim(); if(!ln) continue;
          pushLine(out, ln);
        }
        if(onProgress) onProgress(i, lines.length);
        if(i < lines.length){
          setTimeout(step, 0);
        } else {
          resolve(splitLongSegments(out));
        }
      }
      step();
    });
  }

  msave.addEventListener("click", async function(){
    // Guard against transcribing a file with no key: it would only fail deep
    // in llm.js as a terse toast. Catch it here with an actionable message.
    if (pendingFile && !providerHasKey()) {
      setModalStatus("warn", "No " + activeProviderLabel() + " API key — open Settings to add one");
      toast("Add a " + activeProviderLabel() + " API key in Settings first");
      return;
    }
    msave.disabled = true;
    modalBusy = true;
    var myToken = uploadToken;
    var origLabel = msave.textContent;
    msave.textContent = "Working…";
    try {
      var segs, source;
      if (pendingFile) {
        // === Transcription flow: audio file → provider → [HH:MM:SS] text → parse ===
        var raw = await transcribe(pendingFile, function (label) {
          if (myToken === uploadToken) setModalStatus("progress", label + "…");
        });
        if (myToken !== uploadToken) return; // canceled mid-upload
        setModalStatus("progress", "Parsing…");
        await yield_();
        segs = await parseChunked(raw, function (i, total) {
          if (myToken === uploadToken) setModalStatus("progress", "Parsing… " + i + "/" + total);
        });
        if (myToken !== uploadToken) return; // canceled mid-parse
        if (!segs.length) { toast("No timecoded lines in the response"); return; }
        source = "transcript from " + pendingFile.name;
      } else {
        // === Existing paste flow ===
        setModalStatus("progress", "Parsing…");
        segs = await parseChunked(mtext.value, function (i, total) {
          setModalStatus("progress", "Parsing… " + i + "/" + total + " lines");
        });
        if (myToken !== uploadToken) return; // canceled mid-parse
        if (!segs.length) { toast("No timecoded lines found"); return; }
        source = "pasted transcript";
      }
      var id = uid();
      state.sources.push({id:id, title:mtitle.value.trim(), segments:segs});
      state.enabled.push(id);
      save();
      renderChips();
      search();
      modalBusy = false;
      closeModal();
      toast(segs.length + " moments added — scouting for hooks…");
      // Auto-run a scout report on the source just added, so the user gets a
      // ranked shot list instead of a cold transcript. (Deferred a tick so the
      // modal-close render settles first.)
      if (window.TopClips && window.TopClips.scout) setTimeout(function () { window.TopClips.scout(id); }, 60);
      // Success cleanup only — on error we keep the file so the user can fix
      // the key/model and retry without re-selecting it.
      pendingFile = null;
      audiofile.value = "";
      renderUploadZone();
      chk();
    } catch(e) {
      setModalStatus("warn", (e && e.message) || "Import failed");
      toast("Import failed: " + (e && e.message || "unknown error"));
      console.error("recall import error:", e);
    } finally {
      modalBusy = false;
      msave.textContent = origLabel;
      // Re-enable Add (inputs are still present) without wiping an error note.
      msave.disabled = !(mtitle.value.trim() && (mtext.value.trim() || pendingFile));
    }
  });

  // === Settings (BYO API key, Gemini or OpenRouter) ===
  var LS_SETTINGS = "recall_settings_v1";
  // A non-Google default so choosing OpenRouter actually escapes Gemini's load —
  // a Google model here would just route back to the same busy backend.
  var DEFAULT_OR_MODEL = "openai/gpt-4o-mini";
  // Slugs OpenRouter has retired — saved settings pointing here now 404
  // ("No endpoints found"), so silently upgrade them to the current default.
  var DEAD_OR_MODELS = ["google/gemini-2.0-flash-001", "google/gemini-2.0-flash"];
  function loadSettings(){
    try {
      var s = JSON.parse(localStorage.getItem(LS_SETTINGS)) || {};
      if (s.openrouterModel && DEAD_OR_MODELS.indexOf(s.openrouterModel) >= 0) {
        s.openrouterModel = DEFAULT_OR_MODEL;
      }
      // Keys are shared across the stack: shared store wins, and a legacy local
      // key is promoted into the shared store the first time it's read.
      if (window.StackData) s = window.StackData.resolveKeys(s, ["geminiKey", "openrouterKey", "openrouterModel"]);
      return s;
    }
    catch (e) { return {}; }
  }
  function saveSettingsObj(s){
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(s)); return true; }
    catch (e) { return false; }
  }

  var settingscrim = $("#settingscrim"),
      gemkey = $("#gemkey"), keystatus = $("#keystatus"), keyshow = $("#keyshow"),
      orkey = $("#orkey"), orkeystatus = $("#orkeystatus"), orkeyshow = $("#orkeyshow"),
      ormodel = $("#ormodel"),
      geminiFields = $("#geminiFields"), openrouterFields = $("#openrouterFields"),
      providerGemini = $("#providerGemini"), providerOpenrouter = $("#providerOpenrouter");

  // Reads current settings into the { provider, geminiKey, openrouterKey,
  // openrouterModel } shape llm.js (window.LLMProvider) expects.
  function getProviderConfig(){
    var s = loadSettings();
    return {
      provider: s.provider === "openrouter" ? "openrouter" : "gemini",
      geminiKey: s.geminiKey || "",
      openrouterKey: s.openrouterKey || "",
      openrouterModel: s.openrouterModel || DEFAULT_OR_MODEL,
    };
  }

  function keyStatusText(k){ return k ? "Key saved (" + k.slice(0,4) + "…" + k.slice(-4) + ")" : "No key saved."; }
  function showProviderFields(provider){
    geminiFields.classList.toggle("hidden", provider !== "gemini");
    openrouterFields.classList.toggle("hidden", provider !== "openrouter");
  }

  // Populate the Top Clips niche select once from the vendored pattern snapshot.
  (function(){
    var sel = $("#channelniche");
    if (!sel || !window.TOPCLIPS_PATTERNS) return;
    sel.innerHTML = window.TOPCLIPS_PATTERNS.niches.map(function(n){
      return '<option value="'+n.id+'">'+n.label+'</option>';
    }).join("");
  })();

  function openSettings(){
    settingscrim.classList.add("open");
    var s = loadSettings();
    var provider = s.provider === "openrouter" ? "openrouter" : "gemini";
    providerGemini.checked = provider === "gemini";
    providerOpenrouter.checked = provider === "openrouter";
    showProviderFields(provider);

    var chname = $("#channelname"), chniche = $("#channelniche");
    if (chname) chname.value = s.channelName || "";
    if (chniche) chniche.value = s.channelNiche || "general";
    var pattr = $("#postattr");
    if (pattr) pattr.value = s.postAttribution || "";

    gemkey.value = s.geminiKey || "";
    keystatus.textContent = keyStatusText(s.geminiKey);
    keystatus.className = "keystatus " + (s.geminiKey ? "set" : "empty");
    gemkey.type = "password";
    keyshow.textContent = "show";

    orkey.value = s.openrouterKey || "";
    orkeystatus.textContent = keyStatusText(s.openrouterKey);
    orkeystatus.className = "keystatus " + (s.openrouterKey ? "set" : "empty");
    orkey.type = "password";
    orkeyshow.textContent = "show";
    ormodel.value = s.openrouterModel || DEFAULT_OR_MODEL;
    if (window.StackModels) window.StackModels.populate(
      document.getElementById("ormodelselect"), ormodel, document.getElementById("ormodelrefresh"),
      function (ok) { toast(ok ? "Model list updated" : "Couldn't reach OpenRouter"); });

    setTimeout(function () { (provider === "gemini" ? gemkey : orkey).focus(); }, 40);
  }
  function closeSettings(){ settingscrim.classList.remove("open"); }

  providerGemini.addEventListener("change", function () { if (providerGemini.checked) showProviderFields("gemini"); });
  providerOpenrouter.addEventListener("change", function () { if (providerOpenrouter.checked) showProviderFields("openrouter"); });

  keyshow.addEventListener("click", function () {
    if (gemkey.type === "password") { gemkey.type = "text"; keyshow.textContent = "hide"; }
    else { gemkey.type = "password"; keyshow.textContent = "show"; }
  });
  orkeyshow.addEventListener("click", function () {
    if (orkey.type === "password") { orkey.type = "text"; orkeyshow.textContent = "hide"; }
    else { orkey.type = "password"; orkeyshow.textContent = "show"; }
  });

  $("#keysave").addEventListener("click", function () {
    var gk = gemkey.value.trim();
    var ok = orkey.value.trim();
    // Accept both Gemini key formats: the legacy "AIza…" and the newer "AQ.Ab…"
    // that Google began issuing in 2026 (new accounts/projects get AQ. keys,
    // which contain a dot and work fine on the Gemini endpoint). Rejecting the
    // AQ. format blocked valid keys.
    if (gk && !/^(AIza[0-9A-Za-z_\-]{20,}|AQ\.[0-9A-Za-z_\-.]{20,})$/.test(gk)) {
      toast("That doesn't look like a Gemini API key");
      return;
    }
    if (ok && ok.length < 20) {
      toast("That doesn't look like an OpenRouter API key");
      return;
    }
    var provider = providerOpenrouter.checked ? "openrouter" : "gemini";
    if (provider === "gemini" && !gk) { toast("Enter a Gemini key first"); return; }
    if (provider === "openrouter" && !ok) { toast("Enter an OpenRouter key first"); return; }
    var chname = $("#channelname"), chniche = $("#channelniche"), pattr = $("#postattr");
    var saved = saveSettingsObj({
      provider: provider,
      geminiKey: gk,
      openrouterKey: ok,
      openrouterModel: ormodel.value.trim() || DEFAULT_OR_MODEL,
      channelName: chname ? chname.value.trim() : "",
      channelNiche: chniche ? chniche.value : "general",
      postAttribution: pattr ? pattr.value.trim() : "",
    });
    if (saved) {
      // Write keys through to the shared store so HOOKLAB/BLAST/PULSE see them.
      if (window.StackData) window.StackData.writeSharedKeys({
        geminiKey: gk, openrouterKey: ok, openrouterModel: ormodel.value.trim() || DEFAULT_OR_MODEL,
      });
      toast("Settings saved");
      closeSettings();
    } else {
      toast("Couldn't save settings (storage full?)");
    }
  });
  $("#keyclear").addEventListener("click", function () {
    var s = loadSettings();
    if (providerOpenrouter.checked) {
      orkey.value = "";
      s.openrouterKey = "";
      orkeystatus.textContent = "No key saved.";
      orkeystatus.className = "keystatus empty";
      if (window.StackData) window.StackData.clearSharedKey("openrouterKey");
    } else {
      gemkey.value = "";
      s.geminiKey = "";
      keystatus.textContent = "No key saved.";
      keystatus.className = "keystatus empty";
      if (window.StackData) window.StackData.clearSharedKey("geminiKey");
    }
    saveSettingsObj(s);
    toast("Key cleared everywhere");
  });
  $("#keycancel").addEventListener("click", closeSettings);
  settingscrim.addEventListener("click", function (e) { if (e.target === settingscrim) closeSettings(); });
  $("#settings").addEventListener("click", openSettings);

  // === Whole-stack backup (all 4 apps) ===
  (function () {
    var xp = $("#stackexport"), im = $("#stackimport"), sf = $("#stackfile");
    if (!xp || !window.StackData) return;
    xp.addEventListener("click", function () {
      window.StackData.exportToFile().then(function () { toast("Stack backup downloaded"); })
        .catch(function () { toast("Backup failed"); });
    });
    im.addEventListener("click", function () { sf.click(); });
    sf.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) window.StackData.importFromFile(f, toast);
      e.target.value = "";
    });
    window.StackData.bindSyncUI(toast);
  })();

  // === Library export / import ===
  var LIBRARY_SCHEMA = "recall.library.v1";
  var libstatus = $("#libstatus"),
      libfile = $("#libfile"),
      libactions = $("#libactions");

  function setLibStatus(text, ok) {
    libstatus.textContent = text;
    libstatus.className = "keystatus " + (ok ? "set" : "empty");
  }

  function exportLibrary() {
    var data = {
      schema: LIBRARY_SCHEMA,
      version: 1,
      exportedAt: new Date().toISOString(),
      app: "RECALL",
      library: {
        sources: state.sources,
        enabled: state.enabled,
        bin: state.bin
      }
    };
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var stamp = new Date().toISOString().slice(0, 10);
    var a = document.createElement("a");
    a.href = url;
    a.download = "recall-library-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    var srcCount = state.sources.length;
    var segCount = state.sources.reduce(function (n, s) { return n + (s.segments || []).length; }, 0);
    var binCount = state.bin.length;
    setLibStatus("Last export: " + stamp + " (" + srcCount + " sources · " + segCount + " moments · " + binCount + " bin items)", true);
    toast("Library exported \u2014 " + srcCount + " sources, " + segCount + " moments");
  }

  function parseLibraryFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        try {
          var data = JSON.parse(String(r.result));
          if (!data || data.schema !== LIBRARY_SCHEMA) {
            reject(new Error("Not a RECALL library file (schema mismatch)"));
            return;
          }
          if (!data.library || !Array.isArray(data.library.sources)) {
            reject(new Error("Library data missing or malformed"));
            return;
          }
          resolve(data);
        } catch (e) {
          reject(new Error("Couldn't parse JSON: " + e.message));
        }
      };
      r.onerror = function () { reject(new Error("Could not read file")); };
      r.readAsText(file);
    });
  }

  function applyLibraryImport(data, mode) {
    if (mode === "replace") {
      state.sources = data.library.sources;
      state.enabled = Array.isArray(data.library.enabled) ? data.library.enabled : [];
      state.bin = Array.isArray(data.library.bin) ? data.library.bin : [];
      return { added: state.sources.length, skipped: 0, mode: "replace" };
    }
    // merge: add sources whose id is new; never touch existing sources; skip bin.
    var haveIds = {};
    state.sources.forEach(function (s) { haveIds[s.id] = 1; });
    var added = 0, skipped = 0;
    data.library.sources.forEach(function (src) {
      if (haveIds[src.id]) { skipped++; return; }
      state.sources.push(src);
      haveIds[src.id] = 1;
      if (Array.isArray(data.library.enabled) && data.library.enabled.indexOf(src.id) >= 0) {
        if (state.enabled.indexOf(src.id) < 0) state.enabled.push(src.id);
      }
      added++;
    });
    return { added: added, skipped: skipped, mode: "merge" };
  }

  function refreshAfterImport() {
    save();
    renderChips();
    search();
    renderBin();
  }

  $("#exportlib").addEventListener("click", exportLibrary);
  $("#importlib").addEventListener("click", function () { libfile.click(); });
  libfile.addEventListener("change", function () {
    var f = libfile.files && libfile.files[0];
    if (!f) return;
    parseLibraryFile(f).then(function (data) {
      var sc = data.library.sources.length;
      var sg = data.library.sources.reduce(function (n, s) { return n + (s.segments || []).length; }, 0);
      var bn = (data.library.bin || []).length;
      var expAt = data.exportedAt ? " (exported " + data.exportedAt.slice(0, 10) + ")" : "";
      setLibStatus("File looks valid: " + sc + " sources · " + sg + " moments · " + bn + " bin items" + expAt + ". Choose how to apply.", true);
      libactions.style.display = "flex";
    }).catch(function (e) {
      setLibStatus("Import failed: " + e.message, false);
      libactions.style.display = "none";
      libfile.value = "";
    });
  });

  function doImport(mode) {
    var f = libfile.files && libfile.files[0];
    if (!f) return;
    parseLibraryFile(f).then(function (data) {
      var r = applyLibraryImport(data, mode);
      refreshAfterImport();
      if (mode === "replace") {
        setLibStatus("Library replaced \u2014 " + r.added + " sources loaded.", true);
        toast("Library replaced");
      } else {
        setLibStatus("Merged: " + r.added + " sources added, " + r.skipped + " skipped (already in library).", true);
        toast("Merged: +" + r.added + " sources");
      }
      libactions.style.display = "none";
      libfile.value = "";
    }).catch(function (e) {
      setLibStatus("Import failed: " + e.message, false);
    });
  }
  $("#libreplace").addEventListener("click", function () { doImport("replace"); });
  $("#libmerge").addEventListener("click", function () { doImport("merge"); });
  $("#libcancel").addEventListener("click", function () {
    libfile.value = "";
    setLibStatus("Import cancelled.", false);
    libactions.style.display = "none";
  });

  // === Upload + transcription (provider-aware: Gemini or OpenRouter) ===
  var TRANSCRIBE_PROMPT = [
    "Transcribe the following audio VERBATIM \u2014 no summarizing, no paraphrasing, no commentary.",
    "",
    "For every spoken line, output exactly one line in this format:",
    "  [HH:MM:SS]  text spoken at that timestamp",
    "",
    "Rules:",
    "- HH = hours, MM = minutes, SS = seconds. Always include hours, so [00:01:23], not [1:23].",
    "- One line per natural utterance \u2014 speaker change, sentence boundary, or short pause.",
    "- If multiple speakers are present, prefix each line with 'Speaker A:' or 'Speaker B:', or a name if a speaker introduces themselves.",
    "- Include filler words like 'um', 'uh', 'you know' \u2014 they're part of the verbatim transcript.",
    "- Do NOT include any preamble, summary, or commentary before the first timestamped line.",
    "- Do NOT include timestamps in any format other than [HH:MM:SS].",
    "- Output ONLY the timestamped transcript lines."
  ].join("\n");
  // MAX_BYTES is the file-picker's UI-level ceiling — Gemini's Files API cap
  // (2GB), the largest either provider could ever handle here. The actual
  // per-provider limit is enforced inside llm.js: OpenRouter's much smaller
  // inline-only cap surfaces as a clear error at transcribe time, not here,
  // since that depends on which provider is currently selected.
  var MAX_BYTES = 2 * 1024 * 1024 * 1024;
  var pendingFile = null;

  function yield_(){ return new Promise(function (r) { setTimeout(r, 0); }); }
  function fmtBytes(n){
    if (n < 1024) return n + " B";
    if (n < 1024*1024) return (n/1024).toFixed(1) + " KB";
    return (n/1024/1024).toFixed(1) + " MB";
  }

  var uploadzone = $("#uploadzone"),
      audiofile = $("#audiofile");

  // What kind of file is this, really? The input's `accept` attribute is only
  // a picker hint: drag-and-drop bypasses it entirely and "All files" defeats
  // it in the dialog, so gate here, the one chokepoint both paths go through.
  // A .txt that reached the transcribe call was sent to Gemini as fake "audio",
  // burning quota and dying on MAX_TOKENS. Never again.
  var MEDIA_EXTS = { mp3:1, m4a:1, wav:1, ogg:1, flac:1, aac:1, mp4:1, mov:1, webm:1, mpeg:1 };
  var TEXT_EXTS = { txt:1, srt:1, vtt:1, md:1 };
  function fileExt(name){ return (String(name || "").split(".").pop() || "").toLowerCase(); }
  function fileKind(file){
    var mime = file.type || "";
    if (mime.indexOf("audio/") === 0 || mime.indexOf("video/") === 0) return "media";
    if (mime.indexOf("text/") === 0) return "text";
    var ext = fileExt(file.name);
    if (MEDIA_EXTS[ext]) return "media";
    if (TEXT_EXTS[ext]) return "text";
    return "other";
  }
  function readAsText(file){
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result || "")); };
      r.onerror = function () { reject(new Error("Could not read file")); };
      r.readAsText(file);
    });
  }

  function setPendingFile(file){
    if (!file) { pendingFile = null; renderUploadZone(); return; }
    if (file.size > MAX_BYTES) {
      toast("File too large (" + fmtBytes(file.size) + " \u2014 max 2 GB). Split into smaller segments first.");
      audiofile.value = "";
      return;
    }
    var kind = fileKind(file);
    if (kind === "text") {
      // A text file usually IS the transcript (TurboScribe .txt export, .srt).
      // Load it into the transcript box and go through the free paste path:
      // no API call, no tokens.
      audiofile.value = "";
      pendingFile = null;
      readAsText(file).then(function (contents) {
        mtext.value = contents;
        if (mtitle && !mtitle.value.trim()) mtitle.value = deriveTitle(file.name);
        renderUploadZone();
        chk();
        // After chk(): updateModalHint() would otherwise clear this message.
        setModalStatus("hint", "That's a text file \u2014 loaded it as a transcript below (no API needed). Review and save.");
      }).catch(function () {
        setModalStatus("warn", "Couldn't read that file \u2014 try pasting the transcript instead");
      });
      return;
    }
    if (kind !== "media") {
      audiofile.value = "";
      pendingFile = null;
      toast("That file type can't be transcribed \u2014 audio/video only");
      renderUploadZone();
      // Deferred a tick: the picker/drop handlers call chk() right after this
      // returns, and chk() -> updateModalHint() would clear the message.
      setTimeout(function () {
        setModalStatus("warn", "RECALL can only transcribe audio or video (mp3, m4a, wav, mp4, mov, webm\u2026). For a text transcript, paste it or drop a .txt.");
      }, 0);
      return;
    }
    pendingFile = file;
    // Auto-fill the title from the file name so the button enables on file
    // pick — the empty-title requirement was the #1 "why can't I click Add?".
    if (mtitle && !mtitle.value.trim()) {
      mtitle.value = deriveTitle(file.name);
    }
    renderUploadZone();
  }
  function deriveTitle(name){
    return String(name || "").replace(/\.[a-z0-9]+$/i, "").replace(/[_]+/g, " ").trim();
  }
  function renderUploadZone(){
    if (!pendingFile) {
      uploadzone.classList.remove("has-file");
      uploadzone.innerHTML =
        '<div class="pick">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
        'Choose audio or video file</div>' +
        '<div class="hint"><b>audio recommended</b> \u00b7 mp3 / m4a / wav / video \u2014 up to 2 GB \u00b7 a .txt transcript loads as text, no API</div>';
      return;
    }
    uploadzone.classList.add("has-file");
    uploadzone.innerHTML =
      '<div class="row"><div class="name">' + esc(pendingFile.name) + '</div>' +
      '<button class="x" id="filex" type="button" aria-label="Remove file">\u00d7</button></div>' +
      '<div class="size">' + fmtBytes(pendingFile.size) +
      (pendingFile.type ? ' \u00b7 ' + esc(pendingFile.type) : '') + '</div>';
    $("#filex").addEventListener("click", function (e) {
      e.stopPropagation();
      audiofile.value = "";
      setPendingFile(null);
      chk();
    });
  }
  uploadzone.addEventListener("click", function () { if (!pendingFile) audiofile.click(); });
  uploadzone.addEventListener("keydown", function (e) {
    if (!pendingFile && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); audiofile.click(); }
  });
  audiofile.addEventListener("change", function () { setPendingFile(audiofile.files[0] || null); chk(); });
  ["dragenter", "dragover"].forEach(function (ev) {
    uploadzone.addEventListener(ev, function (e) { e.preventDefault(); uploadzone.classList.add("dragover"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    uploadzone.addEventListener(ev, function (e) { e.preventDefault(); uploadzone.classList.remove("dragover"); });
  });
  uploadzone.addEventListener("drop", function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) { audiofile.files = e.dataTransfer.files; setPendingFile(f); chk(); }
  });

  // File mime drives which OpenRouter content part llm.js uses, and
  // whether OpenRouter is even eligible (video is Gemini-only there).
  // Returns null for anything that isn't real media — callers must not
  // send those to a provider (defaulting unknowns to "audio" is how a .txt
  // once reached Gemini and burned quota).
  function mediaKindOf(file){
    if (fileKind(file) !== "media") return null;
    var mime = file.type || "";
    if (mime.indexOf("video/") === 0) return "video";
    if (mime.indexOf("audio/") === 0) return "audio";
    var ext = fileExt(file.name);
    return (ext === "mp4" || ext === "mov" || ext === "webm") ? "video" : "audio";
  }

  async function transcribe(file, onPhase){
    var kind = mediaKindOf(file);
    if (!kind) throw new Error("That file type can't be transcribed — audio/video only. For a text transcript, paste it instead.");
    return window.LLMProvider.generateFromMedia(getProviderConfig(), {
      file: file,
      prompt: TRANSCRIBE_PROMPT,
      maxTokens: 16000,
      mediaKind: kind,
      onPhase: onPhase,
    });
  }
  // theme toggle
  $("#theme").addEventListener("click",function(){
    var cur=document.documentElement.getAttribute("data-theme");
    var next=cur==="dark"?"light":cur==="light"?"dark":
      (matchMedia("(prefers-color-scheme: dark)").matches?"light":"dark");
    document.documentElement.setAttribute("data-theme",next);
  });

  // mobile bin toggle
  $("#bhead").addEventListener("click",function(){
    if(matchMedia("(max-width:860px)").matches)$("#bin").classList.toggle("open");
  });

  $("#clearq").addEventListener("click",function(){q.value="";search();q.focus();});
  var deb;q.addEventListener("input",function(){clearTimeout(deb);deb=setTimeout(search,90);});
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
      if (settingscrim.classList.contains("open")) closeSettings();
      else closeModal();
    }
    if(e.key==="/"&&document.activeElement!==q&&document.activeElement!==mtext&&document.activeElement!==mtitle&&document.activeElement!==gemkey){
      e.preventDefault();q.focus();}
  });

  // use the real logo if a logo.png sits next to this file (drop it in the repo root)
  (function(){var im=new Image();im.onload=function(){var l=$("#logo");
    if(l){l.innerHTML="";im.alt="Michael Morrison";l.appendChild(im);}};im.src="logo.png";})();

  renderChips();renderBin();search();

  // Top Clips (topclips.js) — dependency injection keeps app.js's IIFE closed.
  if(window.TopClips)window.TopClips.init({
    getState:function(){return state}, save:save, search:search,
    toggleBin:toggleBin, renderBin:renderBin, binHas:binHas, esc:esc, toast:toast,
    getProviderConfig:getProviderConfig, loadSettings:loadSettings
  });

  // Register service worker so the app shell caches for offline use after the
  // first visit. IndexedDB stays as-is — the SW only handles asset caching.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function (err) {
        console.warn("recall: service worker registration failed", err);
      });
    });
  }
})().catch(function(err){
  // If init fails (IDB unavailable, schema broken, etc.), show a clear error
  // instead of a blank page so the user knows what happened and what to try.
  console.error("recall: init failed", err);
  document.body.innerHTML =
    '<div style="padding:40px;color:#E6EAF0;background:#0E1116;font-family:-apple-system,sans-serif;min-height:100vh">' +
    '<h1 style="margin:0 0 12px">RECALL couldn\u2019t start</h1>' +
    '<p style="color:#8A94A6;max-width:60ch">' + (err && err.message || err) + '</p>' +
    '<p style="color:#8A94A6;max-width:60ch">Try clearing browser storage for this site and reloading. Your library export (JSON) is your safety net \u2014 Settings \u2192 DATA \u2192 Export library.</p>' +
    '</div>';
});
