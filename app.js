(function(){
  "use strict";
  var LS="recall_state_v2";

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
  function parse(raw){
    var out=[],lines=raw.split("\n");
    for(var i=0;i<lines.length;i++){
      var ln=lines[i].trim(); if(!ln)continue;
      var m=ln.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.*)$/);
      if(m){out.push({t:norm(m[1]),sec:toSec(m[1]),text:m[2].replace(/\*\*/g,"").replace(/^\w+:\s*/,"").trim()});}
      else if(out.length){out[out.length-1].text+=" "+ln.replace(/\*\*/g,"");}
    }
    return out;
  }
  function uid(){return Math.random().toString(36).slice(2,9);}

  var state=load();
  function load(){
    try{var s=JSON.parse(localStorage.getItem(LS));if(s&&s.sources)return s;}catch(e){}
    return {
      sources:[
        {id:"apogee",title:"Apogee — Rome Scurry interview",segments:parse(SEED_APOGEE)},
        {id:"sample",title:"Sample — Discipline rant (delete me)",segments:parse(SEED_SAMPLE)}
      ],
      enabled:["apogee","sample"], bin:[]
    };
  }
  // Returns true on success, false on quota error. Toast surfaces the failure
  // so silent localStorage quota issues can't masquerade as "the import failed".
  function save(){
    try {
      localStorage.setItem(LS, JSON.stringify(state));
      return true;
    } catch(e) {
      toast("Save failed — local storage full. Remove a source and retry.");
      console.error("recall save error:", e);
      return false;
    }
  }

  var $=function(s){return document.querySelector(s)};
  var q=$("#q"),results=$("#results"),chips=$("#chips"),count=$("#count"),
      binlist=$("#binlist"),bnum=$("#bnum"),exportBtn=$("#export"),
      exportSRTBtn=$("#exportSRT");

  function esc(s){return s.replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]});}
  function terms(str){return str.toLowerCase().split(/\s+/).filter(function(w){return w.length});}
  function hi(text,ws){
    var e=esc(text); if(!ws.length)return e;
    var re=new RegExp("("+ws.map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}).join("|")+")","gi");
    return e.replace(re,"<mark>$1</mark>");
  }
  function binHas(k){return state.bin.some(function(b){return b.key===k})}

  function search(){
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
    save();search();renderBin();
  }

  function renderBin(){
    bnum.textContent=state.bin.length;
    exportBtn.disabled=!state.bin.length;
    exportSRTBtn.disabled=!state.bin.length;
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
        '<button class="rm" data-k="'+b.key+'" aria-label="Remove">&times;</button></div>';
    }).join("");
    binlist.querySelectorAll(".rm").forEach(function(btn){
      btn.addEventListener("click",function(){
        state.bin=state.bin.filter(function(b){return b.key!==btn.dataset.k});
        save();search();renderBin();
      });
    });
  }

  function renderChips(){
    var html=state.sources.map(function(s){
      var on=state.enabled.indexOf(s.id)>=0;
      return '<span class="chip'+(on?" on":"")+'" data-id="'+s.id+'">'+
        '<span class="sw"></span>'+esc(s.title)+
        ' <span class="n">'+s.segments.length+'</span>'+
        '<span class="x" data-del="'+s.id+'" title="Remove source">×</span></span>';
    }).join("");
    html+='<span class="chip addsrc" id="addchip">+ add source</span>';
    chips.innerHTML=html;
    chips.querySelectorAll(".chip[data-id]").forEach(function(c){
      c.addEventListener("click",function(e){
        if(e.target.dataset.del)return;
        var id=c.dataset.id, at=state.enabled.indexOf(id);
        if(at>=0)state.enabled.splice(at,1);else state.enabled.push(id);
        save();search();
      });
    });
    chips.querySelectorAll("[data-del]").forEach(function(x){
      x.addEventListener("click",function(e){
        e.stopPropagation();var id=x.dataset.del;
        var s=state.sources.find(function(v){return v.id===id});
        if(!confirm("Remove “"+s.title+"” from your library?"))return;
        state.sources=state.sources.filter(function(v){return v.id!==id});
        state.enabled=state.enabled.filter(function(v){return v!==id});
        state.bin=state.bin.filter(function(b){return b.srcId!==id});
        save();renderChips();search();renderBin();
      });
    });
    $("#addchip").addEventListener("click",openModal);
  }

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
  var scrim=$("#scrim"),mtitle=$("#mtitle"),mtext=$("#mtext"),msave=$("#msave");
  function openModal(){scrim.classList.add("open");mtitle.value="";mtext.value="";msave.disabled=true;
    pendingFile=null;audiofile.value="";renderUploadZone();
    setTimeout(function(){mtitle.focus()},40);}
  function closeModal(){scrim.classList.remove("open");}
  // Cheap check on every keystroke — real parse happens at save time.
  // (Previously parse() ran on every input event, freezing the tab on hour-long transcripts.)
  // Enable save when we have a title plus EITHER a transcript OR an uploaded file.
  function chk(){
    msave.disabled = !(mtitle.value.trim() && (mtext.value.trim() || pendingFile));
  }
  mtitle.addEventListener("input",chk);mtext.addEventListener("input",chk);
  $("#mcancel").addEventListener("click",closeModal);
  scrim.addEventListener("click",function(e){if(e.target===scrim)closeModal();});
  // Chunked parse — yields to the browser every 500 lines so the UI stays
  // responsive on hour-long transcripts instead of locking the main thread.
  function parseChunked(raw, onProgress){
    return new Promise(function(resolve){
      var lines = raw.split("\n");
      var CHUNK = 500;
      var out = [];
      var i = 0;
      function step(){
        var end = Math.min(i + CHUNK, lines.length);
        for(; i < end; i++){
          var ln = lines[i].trim(); if(!ln) continue;
          var m = ln.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.*)$/);
          if(m){ out.push({t:norm(m[1]), sec:toSec(m[1]),
                           text:m[2].replace(/\*\*/g,"").replace(/^\w+:\s*/,"").trim()}); }
          else if(out.length){ out[out.length-1].text += " "+ln.replace(/\*\*/g,""); }
        }
        if(onProgress) onProgress(i, lines.length);
        if(i < lines.length){
          setTimeout(step, 0);
        } else {
          resolve(out);
        }
      }
      step();
    });
  }

  msave.addEventListener("click", async function(){
    msave.disabled = true;
    var origLabel = msave.textContent;
    try {
      var segs, source;
      if (pendingFile) {
        // === Transcription flow: audio file → Gemini → [HH:MM:SS] text → parse ===
        var raw = await transcribeWithGemini(pendingFile, function (label) {
          msave.textContent = label + "…";
        });
        msave.textContent = "Parsing…";
        await yield_();
        segs = await parseChunked(raw, function (i, total) {
          msave.textContent = "Parsing… " + i + "/" + total;
        });
        if (!segs.length) { toast("No timecoded lines from Gemini"); return; }
        source = "transcript from " + pendingFile.name;
      } else {
        // === Existing paste flow ===
        msave.textContent = "Parsing…";
        segs = await parseChunked(mtext.value, function (i, total) {
          msave.textContent = "Parsing… " + i + "/" + total + " lines";
        });
        if (!segs.length) { toast("No timecoded lines found"); return; }
        source = "pasted transcript";
      }
      var id = uid();
      state.sources.push({id:id, title:mtitle.value.trim(), segments:segs});
      state.enabled.push(id);
      save();
      renderChips();
      search();
      closeModal();
      toast(segs.length + " moments added (" + source + ")");
    } catch(e) {
      toast("Import failed: " + (e && e.message || "unknown error"));
      console.error("recall import error:", e);
    } finally {
      msave.disabled = false;
      msave.textContent = origLabel;
      pendingFile = null;
      audiofile.value = "";
      renderUploadZone();
      chk();
    }
  });

  // === Settings (BYO Gemini API key) ===
  var LS_SETTINGS = "recall_settings_v1";
  function loadSettings(){
    try { var s = JSON.parse(localStorage.getItem(LS_SETTINGS)); return s || {}; }
    catch (e) { return {}; }
  }
  function saveSettingsObj(s){
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(s)); return true; }
    catch (e) { return false; }
  }

  var settingscrim = $("#settingscrim"),
      gemkey = $("#gemkey"),
      keystatus = $("#keystatus"),
      keyshow = $("#keyshow");

  function openSettings(){
    settingscrim.classList.add("open");
    var k = loadSettings().geminiKey || "";
    gemkey.value = k;
    keystatus.textContent = k ? "Key saved (" + k.slice(0,4) + "…" + k.slice(-4) + ")" : "No key saved.";
    keystatus.className = "keystatus " + (k ? "set" : "empty");
    gemkey.type = "password";
    keyshow.textContent = "show";
    setTimeout(function () { gemkey.focus(); gemkey.select(); }, 40);
  }
  function closeSettings(){ settingscrim.classList.remove("open"); }

  keyshow.addEventListener("click", function () {
    if (gemkey.type === "password") { gemkey.type = "text"; keyshow.textContent = "hide"; }
    else { gemkey.type = "password"; keyshow.textContent = "show"; }
  });
  $("#keysave").addEventListener("click", function () {
    var k = gemkey.value.trim();
    if (!k) { toast("Enter a key first"); return; }
    if (!/^AIza[0-9A-Za-z_\-]{20,}$/.test(k)) {
      toast("That doesn't look like a Gemini API key");
      return;
    }
    if (saveSettingsObj({ geminiKey: k })) {
      keystatus.textContent = "Key saved (" + k.slice(0,4) + "…" + k.slice(-4) + ")";
      keystatus.className = "keystatus set";
      toast("API key saved");
      closeSettings();
    } else {
      toast("Couldn't save key (storage full?)");
    }
  });
  $("#keyclear").addEventListener("click", function () {
    gemkey.value = "";
    localStorage.removeItem(LS_SETTINGS);
    keystatus.textContent = "No key saved.";
    keystatus.className = "keystatus empty";
    toast("API key cleared");
  });
  $("#keycancel").addEventListener("click", closeSettings);
  settingscrim.addEventListener("click", function (e) { if (e.target === settingscrim) closeSettings(); });
  $("#settings").addEventListener("click", openSettings);

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

  // === Upload + Gemini transcription ===
  var GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
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
  // Two size limits in play:
  //   INLINE_MAX_BYTES — Gemini inline_data total request cap is 20MB. 14MB raw
  //     audio → ~19MB base64 → safely under 20MB with room for the prompt.
  //     Files at or below this size use the inline path (one round-trip).
  //   MAX_BYTES — Gemini Files API hard cap is 2GB per file. Anything above
  //     INLINE_MAX_BYTES but at or below MAX_BYTES uploads via Files API.
  //     Anything above MAX_BYTES is rejected outright.
  var INLINE_MAX_BYTES = 14 * 1024 * 1024;
  var MAX_BYTES = 2 * 1024 * 1024 * 1024;
  var FILES_API_UPLOAD = "https://generativelanguage.googleapis.com/upload/v1beta/files";
  var FILES_API_BASE = "https://generativelanguage.googleapis.com/v1beta/files";
  var pendingFile = null;

  function yield_(){ return new Promise(function (r) { setTimeout(r, 0); }); }
  function fmtBytes(n){
    if (n < 1024) return n + " B";
    if (n < 1024*1024) return (n/1024).toFixed(1) + " KB";
    return (n/1024/1024).toFixed(1) + " MB";
  }
  function guessMime(name){
    var ext = (name.split(".").pop() || "").toLowerCase();
    return ({
      mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav",
      ogg: "audio/ogg", flac: "audio/flac", aac: "audio/aac",
      mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
      mpeg: "audio/mpeg"
    })[ext] || "application/octet-stream";
  }

  var uploadzone = $("#uploadzone"),
      audiofile = $("#audiofile");

  function setPendingFile(file){
    if (!file) { pendingFile = null; renderUploadZone(); return; }
    if (file.size > MAX_BYTES) {
      toast("File too large (" + fmtBytes(file.size) + " \u2014 max 2 GB). Split into smaller segments first.");
      audiofile.value = "";
      return;
    }
    pendingFile = file;
    renderUploadZone();
  }
  function renderUploadZone(){
    if (!pendingFile) {
      uploadzone.classList.remove("has-file");
      uploadzone.innerHTML =
        '<div class="pick">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
        'Choose audio or video file</div>' +
        '<div class="hint"><b>audio recommended</b> \u00b7 mp3 / m4a / wav / video \u2014 up to 2 GB</div>';
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

  function fileToBase64(file){
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        var s = String(r.result);
        var i = s.indexOf(",");
        resolve(i >= 0 ? s.slice(i + 1) : s);
      };
      r.onerror = function () { reject(new Error("Could not read file")); };
      r.readAsDataURL(file);
    });
  }

  // === Gemini Files API helpers (for files > INLINE_MAX_BYTES) ===
  // Resumable upload protocol: two-step (start, then upload+finalize).
  // Returns the File object: { name, uri, state, ... }
  async function uploadToFilesAPI(file, mime, apiKey){
    var startRes = await fetch(FILES_API_UPLOAD + "?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(file.size),
        "X-Goog-Upload-Header-Content-Type": mime,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ file: { display_name: file.name } })
    });
    if (!startRes.ok) {
      if (startRes.status === 401 || startRes.status === 403) throw new Error("API key rejected \u2014 open Settings");
      if (startRes.status === 429) throw new Error("Rate limited \u2014 try again in a minute");
      if (startRes.status === 413) throw new Error("File too large for Gemini");
      throw new Error("Upload start failed (HTTP " + startRes.status + ")");
    }
    var uploadUrl = startRes.headers.get("X-Goog-Upload-URL");
    if (!uploadUrl) throw new Error("No upload URL returned by Gemini");
    var uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Offset": "0",
        "Content-Length": String(file.size)
      },
      body: file
    });
    if (!uploadRes.ok) {
      throw new Error("File upload failed (HTTP " + uploadRes.status + ")");
    }
    var data = await uploadRes.json();
    return data && data.file ? data.file : data;
  }
  // Poll the file metadata until state becomes ACTIVE (or FAILED / timeout).
  async function waitForFileActive(fileName, apiKey){
    var deadline = Date.now() + 120000;  // 2 min ceiling
    var url = FILES_API_BASE + "/" + encodeURIComponent(fileName) + "?key=" + encodeURIComponent(apiKey);
    while (Date.now() < deadline) {
      var r = await fetch(url);
      if (!r.ok) throw new Error("File status check failed (HTTP " + r.status + ")");
      var f = await r.json();
      if (f.state === "ACTIVE") return f;
      if (f.state === "FAILED") throw new Error("Gemini could not process this file");
      await new Promise(function (resolve) { setTimeout(resolve, 2000); });
    }
    throw new Error("File processing timed out (2 min)");
  }
  // Best-effort cleanup — files auto-expire after 48h anyway.
  async function deleteFile(fileName, apiKey){
    try {
      await fetch(FILES_API_BASE + "/" + encodeURIComponent(fileName) + "?key=" + encodeURIComponent(apiKey), { method: "DELETE" });
    } catch (e) { /* silent */ }
  }

  async function transcribeWithGemini(file, onPhase){
    var key = loadSettings().geminiKey;
    if (!key) throw new Error("No Gemini API key \u2014 open Settings to add one");

    var mime = file.type || guessMime(file.name);
    var useFilesAPI = file.size > INLINE_MAX_BYTES;
    var audioPart, uploadedFileName = null;

    if (useFilesAPI) {
      // === Files API path: upload to Google's CDN, then reference by URI ===
      onPhase("Uploading to Gemini");
      await yield_();
      var uploaded = await uploadToFilesAPI(file, mime, key);
      uploadedFileName = uploaded.name;
      var fileUri = uploaded.uri;
      if (!fileUri) throw new Error("File upload didn't return a URI");

      onPhase("Processing");
      await yield_();
      await waitForFileActive(uploadedFileName, key);

      audioPart = { file_data: { file_uri: fileUri, mime_type: mime } };
    } else {
      // === Inline path: base64-encode the file and POST it directly ===
      onPhase("Reading");
      await yield_();
      var b64 = await fileToBase64(file);
      onPhase("Uploading to Gemini");
      await yield_();
      audioPart = { inline_data: { mime_type: mime, data: b64 } };
    }

    onPhase("Transcribing");
    await yield_();
    try {
      var url = GEMINI_ENDPOINT + "?key=" + encodeURIComponent(key);
      var res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: TRANSCRIBE_PROMPT },
              audioPart
            ]
          }],
          generationConfig: { temperature: 0.1 }
        })
      });
      if (!res.ok) {
        var body = "";
        try { body = await res.text(); } catch (e) {}
        if (res.status === 400) throw new Error("Gemini rejected the request \u2014 check key + file type");
        if (res.status === 401 || res.status === 403) throw new Error("API key rejected \u2014 open Settings");
        if (res.status === 413 || /too large/i.test(body)) throw new Error("File too large for Gemini");
        if (res.status === 429) throw new Error("Rate limited \u2014 try again in a minute");
        throw new Error("Gemini error " + res.status + ": " + body.slice(0, 120));
      }
      var json = await res.json();
      var text = json && json.candidates && json.candidates[0] &&
                 json.candidates[0].content && json.candidates[0].content.parts &&
                 json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text;
      if (!text) throw new Error("Empty response from Gemini");
      return text;
    } finally {
      if (uploadedFileName) await deleteFile(uploadedFileName, key);
    }
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

  // Register service worker so the app shell caches for offline use after the
  // first visit. localStorage stays as-is — the SW only handles asset caching.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function (err) {
        console.warn("recall: service worker registration failed", err);
      });
    });
  }
})();
