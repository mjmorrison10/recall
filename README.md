# RECALL

**Searchable clip-memory for short-form creators.**

You find the moment. RECALL makes sure you never lose one.

Part of the creator ops stack — RECALL finds it, HOOKLAB underwrites the open, BLAST gets it out the door:

- **HOOKLAB** — underwrites the open: https://mjmorrisonusa.com/#/hooklab
- **BLAST** — gets it out the door: https://mjmorrisonusa.com/#/blast
- **Portfolio** — https://mjmorrisonusa.com

Drop in every podcast, interview, or livestream transcript you consume. Search a word, a phrase, or a running joke — RECALL surfaces every place it shows up, across every source, timecoded. Bin the moments, export the shot list, cut.

It doesn't pick clips for you — that's your job, and no tool does it better than a sharp human. It gives your judgment **perfect recall**: the callback from 30 minutes earlier, the reference in a totally different episode, the moment you'd have needed luck to remember.

## Why it exists

The best clips aren't one clean 60-second section. They're built — a line here, a callback there, sometimes stitched across different sources into something nobody else would think to make. That takes memory and time. RECALL removes the memory-and-time tax so you spend your energy on the part only you can do: the selection.

## How to use it

1. **Search** — type a word or phrase. Results come back instantly from every source you've loaded, timecoded and highlighted.
2. **Toggle sources** — switch individual transcripts on/off to narrow the hunt.
3. **Add a source** — paste any timestamped transcript, or upload an audio/video file and let AI
   transcribe it for you (adds an API key in Settings — see below). Lines starting with a timecode
   (`[00:01:23]`, `1:23`, or `01:23:45`) become searchable moments.
4. **Build a concept** — hit `+ BIN` on the moments you want. Stack them across sources.
5. **Export** — copy a clean shot list (timecodes + lines + source) and take it into your editor.

Your library is saved locally in your browser — it grows every time you add a source, and nothing leaves your device.

## AI transcription

**Gemini is the default** — add a free API key in Settings and file uploads get transcribed
automatically. Power users can switch to **OpenRouter** instead and pick any text model. They aren't
equivalent: Gemini has a resumable upload path for large recordings (up to 2GB); OpenRouter is an
OpenAI-compatible text API with no equivalent — it inlines media directly, capping out around
~15MB per file with no resumable upload. So long recordings need Gemini; short ones work on either.
Your key is stored only in this browser's localStorage and sent only to whichever provider you pick.

## Run it

It's a single static `index.html`. No build step, no dependencies.

- Open `index.html` in any browser, **or**
- Host it anywhere static (GitHub Pages, Vercel, Netlify) for a shareable link.

## Roadmap

- Auto-ingest: paste a YouTube/podcast link and RECALL fetches + transcribes it.
- Semantic search (find the moment even when you don't remember the exact words).
- Per-client libraries and shared team access.
- One-click rough-cut assembly from a finished bin.

---

Built as a working prototype. Client-side only; your transcripts stay on your device.
