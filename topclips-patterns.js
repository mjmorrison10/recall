// Vendored snapshot of HOOKLAB's pattern bank (Hooklabs/patterns.js), reduced
// to the fields Top Clips matches against. Used as the fallback when the live
// sibling module isn't reachable (standalone deploy / offline); on the shared
// github.io origin, topclips.js upgrades to the live bank via dynamic import.
// Regenerate by re-running the node dump against Hooklabs/patterns.js.
window.TOPCLIPS_PATTERNS = {
 "snapshotOf": "Hooklabs/patterns.js",
 "snapshotDate": "2026-07-09",
 "niches": [
  {
   "id": "creators",
   "label": "Creators / short-form"
  },
  {
   "id": "business",
   "label": "Business / SMMA"
  },
  {
   "id": "fitness",
   "label": "Fitness"
  },
  {
   "id": "finance",
   "label": "Finance"
  },
  {
   "id": "tech",
   "label": "Tech / SaaS"
  },
  {
   "id": "story",
   "label": "Story / personal brand"
  },
  {
   "id": "general",
   "label": "General"
  }
 ],
 "patterns": [
  {
   "id": "curiosity-gap",
   "name": "Curiosity Gap",
   "family": "curiosity",
   "scaffold": "Nobody talks about the real reason {topic}.",
   "slots": [
    "topic"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.86,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "contrarian-stop",
   "name": "Contrarian Stop",
   "family": "contrarian",
   "scaffold": "Stop {bad_habit}. Do {better} instead.",
   "slots": [
    "bad_habit",
    "better"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.88,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "specific-proof",
   "name": "Specific Proof",
   "family": "proof",
   "scaffold": "I tested {thing} for {duration}. Here's what broke.",
   "slots": [
    "thing",
    "duration"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.9,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "mistake-callout",
   "name": "Mistake Callout",
   "family": "mistake",
   "scaffold": "If you're still {mistake}, this is why it fails.",
   "slots": [
    "mistake"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.87,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "numbered-value",
   "name": "Numbered Value",
   "family": "value",
   "scaffold": "{n} rules that cut my {pain} in half.",
   "slots": [
    "n",
    "pain"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "mid-action",
   "name": "Mid-Action Open",
   "family": "interrupt",
   "scaffold": "—and that's the moment everything flipped.",
   "slots": [],
   "niches": [
    "story",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "industry-secret",
   "name": "Industry Secret",
   "family": "curiosity",
   "scaffold": "The {industry} industry doesn't want you to know this.",
   "slots": [
    "industry"
   ],
   "niches": [
    "business",
    "fitness",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "warning-psa",
   "name": "Warning / PSA",
   "family": "warning",
   "scaffold": "Stop using {thing} immediately if you {goal}.",
   "slots": [
    "thing",
    "goal"
   ],
   "niches": [
    "fitness",
    "finance",
    "tech",
    "creators",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "before-after",
   "name": "Before / After",
   "family": "proof",
   "scaffold": "Before: {before}. After: {after}. Here's the only change.",
   "slots": [
    "before",
    "after"
   ],
   "niches": [
    "fitness",
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.86,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "hot-take",
   "name": "Hot Take",
   "family": "contrarian",
   "scaffold": "Unpopular opinion: {claim}.",
   "slots": [
    "claim"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "question-bait",
   "name": "Question Bait",
   "family": "engagement",
   "scaffold": "Why do most {audience} still {pain}?",
   "slots": [
    "audience",
    "pain"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.79,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "i-used-to",
   "name": "I Used To",
   "family": "story",
   "scaffold": "I used to {old_way}. Then I {turning_point}.",
   "slots": [
    "old_way",
    "turning_point"
   ],
   "niches": [
    "story",
    "creators",
    "business",
    "fitness",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "cost-of-wrong",
   "name": "Cost of Wrong",
   "family": "mistake",
   "scaffold": "This one mistake cost me {cost}.",
   "slots": [
    "cost"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "list-tease",
   "name": "List Tease",
   "family": "value",
   "scaffold": "Steal these {n} {things} I use every week.",
   "slots": [
    "n",
    "things"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.81,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "most-creators-miss",
   "name": "Most Creators Miss",
   "family": "mistake",
   "scaffold": "Most creators miss this when they {action}.",
   "slots": [
    "action"
   ],
   "niches": [
    "creators",
    "business",
    "general"
   ],
   "strength": 0.86,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "time-boxed-result",
   "name": "Time-Boxed Result",
   "family": "proof",
   "scaffold": "In {timeframe} I went from {start} to {end}.",
   "slots": [
    "timeframe",
    "start",
    "end"
   ],
   "niches": [
    "business",
    "fitness",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.87,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "dont-buy",
   "name": "Don't Buy Until",
   "family": "warning",
   "scaffold": "Don't buy {product_type} until you check this.",
   "slots": [
    "product_type"
   ],
   "niches": [
    "finance",
    "tech",
    "fitness",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "one-change",
   "name": "One Change",
   "family": "value",
   "scaffold": "One change fixed my {problem}.",
   "slots": [
    "problem"
   ],
   "niches": [
    "fitness",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "pov-identity",
   "name": "POV / Identity",
   "family": "identity",
   "scaffold": "POV: you're a {identity} who finally {win}.",
   "slots": [
    "identity",
    "win"
   ],
   "niches": [
    "creators",
    "fitness",
    "business",
    "general"
   ],
   "strength": 0.78,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "comment-trap",
   "name": "Comment Trap",
   "family": "engagement",
   "scaffold": "Tell me I'm wrong: {claim}.",
   "slots": [
    "claim"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.77,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "silent-open",
   "name": "Silent Pattern Interrupt",
   "family": "interrupt",
   "scaffold": "[Silence / visual first] Then: {line}",
   "slots": [
    "line"
   ],
   "niches": [
    "creators",
    "story",
    "general"
   ],
   "strength": 0.76,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "checklist-promise",
   "name": "Checklist Promise",
   "family": "value",
   "scaffold": "Save this checklist before your next {event}.",
   "slots": [
    "event"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "myth-bust",
   "name": "Myth Bust",
   "family": "contrarian",
   "scaffold": "Myth: {myth}. Reality: {reality}.",
   "slots": [
    "myth",
    "reality"
   ],
   "niches": [
    "business",
    "fitness",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "behind-curtain",
   "name": "Behind the Curtain",
   "family": "authority",
   "scaffold": "Here's what actually happens when {process}.",
   "slots": [
    "process"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "started-over",
   "name": "If I Started Over",
   "family": "story",
   "scaffold": "If I started over in {domain} today, I'd only do this.",
   "slots": [
    "domain"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.88,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "do-this-not-that",
   "name": "Do This, Not That",
   "family": "contrarian",
   "scaffold": "Do this for {goal}. Not that.",
   "slots": [
    "goal"
   ],
   "niches": [
    "fitness",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "the-real-reason",
   "name": "The Real Reason",
   "family": "curiosity",
   "scaffold": "The real reason your {thing} isn't working:",
   "slots": [
    "thing"
   ],
   "niches": [
    "creators",
    "business",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.87,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "watch-till-end",
   "name": "Payoff Delay (honest)",
   "family": "curiosity",
   "scaffold": "I'm going to show you {payoff} — but only after this warning.",
   "slots": [
    "payoff"
   ],
   "niches": [
    "creators",
    "tech",
    "general"
   ],
   "strength": 0.74,
   "evidence": "hypothesis",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "youre-not-lazy",
   "name": "Reframe Identity",
   "family": "identity",
   "scaffold": "You're not {insult}. You have a {system_problem}.",
   "slots": [
    "insult",
    "system_problem"
   ],
   "niches": [
    "fitness",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.86,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "name-unnamed-fear",
   "name": "Name the Unnamed Fear",
   "family": "diagnosis",
   "scaffold": "It's not {vague}. It's {named_diagnosis}.",
   "slots": [
    "vague",
    "named_diagnosis"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.9,
   "evidence": "historically-documented",
   "tier": "core",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "thread-lessons",
   "name": "Thread Opener: Earned Lessons",
   "family": "thread",
   "scaffold": "{n} lessons from {done_thing} that most {audience} learn too late. A thread:",
   "slots": [
    "n",
    "done_thing",
    "audience"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.86,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "how-i-thread",
   "name": "Thread Opener: Exact Steps",
   "family": "thread",
   "scaffold": "How I went from {start} to {end} in {timeframe} — the exact steps:",
   "slots": [
    "start",
    "end",
    "timeframe"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "fitness",
    "general"
   ],
   "strength": 0.87,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "thread-mistakes",
   "name": "Thread Opener: Expensive Mistakes",
   "family": "thread",
   "scaffold": "I spent {cost} learning {domain}. These {n} mistakes were 90% of it:",
   "slots": [
    "cost",
    "domain",
    "n"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "one-line-contrarian",
   "name": "One-Line Banger",
   "family": "contrarian",
   "scaffold": "Hard truth: {claim}.",
   "slots": [
    "claim"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "fitness",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "everyone-is-wrong",
   "name": "Everyone Is Wrong",
   "family": "contrarian",
   "scaffold": "Everyone tells you to {common_advice}. Everyone is wrong. Here's what actually works:",
   "slots": [
    "common_advice"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "list-colon-promise",
   "name": "Colon List Promise",
   "family": "value",
   "scaffold": "{n} {things} I'd use to {goal} if I started from zero:",
   "slots": [
    "n",
    "things",
    "goal"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "cheat-sheet",
   "name": "Cheat Sheet Drop",
   "family": "value",
   "scaffold": "The {domain} cheat sheet I wish I had at {starting_point}:",
   "slots": [
    "domain",
    "starting_point"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "finance",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "nobody-tells-you",
   "name": "Nobody Tells You",
   "family": "curiosity",
   "scaffold": "What nobody tells you about {topic}:",
   "slots": [
    "topic"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "read-that-again",
   "name": "Read That Again",
   "family": "proof",
   "scaffold": "{shock_stat}. Read that again.",
   "slots": [
    "shock_stat"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "open-books",
   "name": "Open Books",
   "family": "proof",
   "scaffold": "I'm posting my real {metric} numbers. No blur. {n} takeaways:",
   "slots": [
    "metric",
    "n"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "arc-playbook",
   "name": "Arc + Playbook",
   "family": "story",
   "scaffold": "In {time_a} I {low}. Today I {high}. The whole playbook:",
   "slots": [
    "time_a",
    "low",
    "high"
   ],
   "niches": [
    "business",
    "story",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "core",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "setback-lesson",
   "name": "Setback Lesson",
   "family": "story",
   "scaffold": "I got {setback} last {timeframe}. Here's what it taught me about {domain}.",
   "slots": [
    "setback",
    "timeframe",
    "domain"
   ],
   "niches": [
    "story",
    "business",
    "creators",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "fill-in-blank",
   "name": "Fill in the Blank",
   "family": "engagement",
   "scaffold": "The most underrated {category} is ______.",
   "slots": [
    "category"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.77,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "quote-repost-setup",
   "name": "Quote-Post Setup",
   "family": "engagement",
   "scaffold": "Quote this with your {thing} — I'll rank the best ones.",
   "slots": [
    "thing"
   ],
   "niches": [
    "creators",
    "business",
    "general"
   ],
   "strength": 0.78,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "delete-this-later",
   "name": "Delete This Later",
   "family": "interrupt",
   "scaffold": "I'll probably delete this, but {confession}.",
   "slots": [
    "confession"
   ],
   "niches": [
    "story",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.76,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "text"
   ]
  },
  {
   "id": "odd-number-list",
   "name": "Odd-Number List",
   "family": "value",
   "scaffold": "{odd_n} weirdly effective ways to {goal}.",
   "slots": [
    "odd_n",
    "goal"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.78,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "negative-promise",
   "name": "Negative Promise",
   "family": "warning",
   "scaffold": "This will not make you {fantasy}. It will make you {real_outcome}.",
   "slots": [
    "fantasy",
    "real_outcome"
   ],
   "niches": [
    "fitness",
    "finance",
    "business",
    "general"
   ],
   "strength": 0.81,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "expert-wrong",
   "name": "Experts Are Wrong",
   "family": "contrarian",
   "scaffold": "Every {expert_type} told me to {advice}. They were wrong.",
   "slots": [
    "expert_type",
    "advice"
   ],
   "niches": [
    "business",
    "fitness",
    "creators",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "timeline-twist",
   "name": "Timeline Twist",
   "family": "story",
   "scaffold": "At {time_a} I {low}. At {time_b} I {high}. Same person.",
   "slots": [
    "time_a",
    "low",
    "time_b",
    "high"
   ],
   "niches": [
    "story",
    "business",
    "fitness",
    "creators",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "forbidden-tactic",
   "name": "Forbidden Tactic",
   "family": "curiosity",
   "scaffold": "The tactic {gatekeepers} hope you never learn:",
   "slots": [
    "gatekeepers"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.79,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "micro-confession",
   "name": "Micro Confession",
   "family": "story",
   "scaffold": "I need to admit something about {topic}.",
   "slots": [
    "topic"
   ],
   "niches": [
    "story",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "speed-run",
   "name": "Speed-Run Tutorial",
   "family": "value",
   "scaffold": "{goal} in under {minutes} minutes — no fluff.",
   "slots": [
    "goal",
    "minutes"
   ],
   "niches": [
    "tech",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "common-enemy",
   "name": "Common Enemy",
   "family": "contrarian",
   "scaffold": "Your problem isn't you. It's {enemy_system}.",
   "slots": [
    "enemy_system"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "receipts-open",
   "name": "Receipts Open",
   "family": "proof",
   "scaffold": "Don't trust me. Trust the {receipt_type}.",
   "slots": [
    "receipt_type"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "tech",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "loop-callback",
   "name": "Loop / Callback",
   "family": "interrupt",
   "scaffold": "[End line matches open] — wait for the loop.",
   "slots": [],
   "niches": [
    "creators",
    "story",
    "general"
   ],
   "strength": 0.77,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "wrong-then-right",
   "name": "Wrong, Then Right",
   "family": "mistake",
   "scaffold": "I got {topic} completely wrong. Here's the fix.",
   "slots": [
    "topic"
   ],
   "niches": [
    "business",
    "creators",
    "tech",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "niche-callout",
   "name": "Niche Callout",
   "family": "identity",
   "scaffold": "This is only for {narrow_identity}. Everyone else scroll.",
   "slots": [
    "narrow_identity"
   ],
   "niches": [
    "creators",
    "fitness",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.81,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "price-of-inaction",
   "name": "Price of Inaction",
   "family": "mistake",
   "scaffold": "Ignoring {problem} is already costing you {cost}.",
   "slots": [
    "problem",
    "cost"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "template-giveaway",
   "name": "Template Giveaway Hook",
   "family": "value",
   "scaffold": "Copy my exact {asset} for {use_case}. Free.",
   "slots": [
    "asset",
    "use_case"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "day-in-life-lie",
   "name": "Day-in-the-Life Myth",
   "family": "contrarian",
   "scaffold": "My real {role} day looks nothing like what you see online.",
   "slots": [
    "role"
   ],
   "niches": [
    "creators",
    "business",
    "story",
    "general"
   ],
   "strength": 0.79,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "algorithm-truth",
   "name": "Algorithm Truth",
   "family": "authority",
   "scaffold": "The algorithm doesn't reward {myth}. It rewards {truth}.",
   "slots": [
    "myth",
    "truth"
   ],
   "niches": [
    "creators",
    "business",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "client-whisper",
   "name": "Client Whisper",
   "family": "authority",
   "scaffold": "What I tell paying clients about {topic}:",
   "slots": [
    "topic"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "two-types",
   "name": "Two Types of People",
   "family": "identity",
   "scaffold": "There are two types of {audience}. Only one {wins}.",
   "slots": [
    "audience",
    "wins"
   ],
   "niches": [
    "business",
    "fitness",
    "creators",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "screenshot-this",
   "name": "Screenshot This",
   "family": "engagement",
   "scaffold": "Screenshot this before you {action}.",
   "slots": [
    "action"
   ],
   "niches": [
    "creators",
    "business",
    "finance",
    "general"
   ],
   "strength": 0.76,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "unpopular-process",
   "name": "Unpopular Process",
   "family": "contrarian",
   "scaffold": "Unpopular process: I {counterintuitive_step} on purpose.",
   "slots": [
    "counterintuitive_step"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.81,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "metric-shock",
   "name": "Metric Shock",
   "family": "proof",
   "scaffold": "{metric} went from {low} to {high}. No ads.",
   "slots": [
    "metric",
    "low",
    "high"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.86,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "beginner-trap",
   "name": "Beginner Trap",
   "family": "mistake",
   "scaffold": "Beginners always {trap}. Pros do this instead.",
   "slots": [
    "trap"
   ],
   "niches": [
    "creators",
    "fitness",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "late-to-party",
   "name": "Late to the Party",
   "family": "story",
   "scaffold": "I was late to {trend}. That was an advantage.",
   "slots": [
    "trend"
   ],
   "niches": [
    "business",
    "creators",
    "tech",
    "general"
   ],
   "strength": 0.78,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "one-rule",
   "name": "One Rule Only",
   "family": "value",
   "scaffold": "If you only follow one rule for {domain}, make it this.",
   "slots": [
    "domain"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "visual-first-claim",
   "name": "Visual-First Claim",
   "family": "interrupt",
   "scaffold": "[Show result first] Voiceover: this took {timeframe}.",
   "slots": [
    "timeframe"
   ],
   "niches": [
    "fitness",
    "creators",
    "tech",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "comment-prompt-split",
   "name": "A/B Comment Split",
   "family": "engagement",
   "scaffold": "Team A: {option_a}. Team B: {option_b}. Fight.",
   "slots": [
    "option_a",
    "option_b"
   ],
   "niches": [
    "creators",
    "business",
    "general"
   ],
   "strength": 0.75,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "steal-my-stack",
   "name": "Steal My Stack",
   "family": "value",
   "scaffold": "Steal my entire {stack_type} stack.",
   "slots": [
    "stack_type"
   ],
   "niches": [
    "creators",
    "tech",
    "business",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "quiet-flex",
   "name": "Quiet Flex",
   "family": "proof",
   "scaffold": "I don't post about {win} often. Today I will.",
   "slots": [
    "win"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "story",
    "general"
   ],
   "strength": 0.77,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "fix-diagnosis",
   "name": "Tool Diagnosis",
   "family": "diagnosis",
   "scaffold": "If your {tool} looks like this, you have {named_problem}.",
   "slots": [
    "tool",
    "named_problem"
   ],
   "niches": [
    "creators",
    "tech",
    "business",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "calendar-truth",
   "name": "Calendar Truth",
   "family": "authority",
   "scaffold": "Here's my real posting calendar — not the guru version.",
   "slots": [],
   "niches": [
    "creators",
    "business",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "hook-about-hooks",
   "name": "Meta Hook",
   "family": "curiosity",
   "scaffold": "This open is why your last {n} videos died.",
   "slots": [
    "n"
   ],
   "niches": [
    "creators",
    "general"
   ],
   "strength": 0.83,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "permission-to-quit",
   "name": "Permission to Quit",
   "family": "contrarian",
   "scaffold": "Quit {thing} if you can't do {minimum_standard}.",
   "slots": [
    "thing",
    "minimum_standard"
   ],
   "niches": [
    "fitness",
    "business",
    "creators",
    "general"
   ],
   "strength": 0.78,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "tiny-lever",
   "name": "Tiny Lever",
   "family": "value",
   "scaffold": "A {tiny_change} moved my {metric} more than {big_effort}.",
   "slots": [
    "tiny_change",
    "metric",
    "big_effort"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "tech",
    "general"
   ],
   "strength": 0.86,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "audience-secret",
   "name": "Audience Secret",
   "family": "authority",
   "scaffold": "My audience taught me this about {topic}.",
   "slots": [
    "topic"
   ],
   "niches": [
    "creators",
    "business",
    "general"
   ],
   "strength": 0.79,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "first-second-script",
   "name": "First-Second Script",
   "family": "interrupt",
   "scaffold": "Second 0: {visual_shock}. Second 1: {claim}.",
   "slots": [
    "visual_shock",
    "claim"
   ],
   "niches": [
    "creators",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "niche-math",
   "name": "Niche Math",
   "family": "proof",
   "scaffold": "{small_niche} × {high_intent} beats {big_audience} every time.",
   "slots": [
    "small_niche",
    "high_intent",
    "big_audience"
   ],
   "niches": [
    "business",
    "creators",
    "general"
   ],
   "strength": 0.84,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "voiceover-vs-text",
   "name": "Spoken vs Text Hook",
   "family": "value",
   "scaffold": "Say this out loud: \"{spoken}\". Put this on screen: \"{text}\".",
   "slots": [
    "spoken",
    "text"
   ],
   "niches": [
    "creators",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "deadline-energy",
   "name": "Deadline Energy",
   "family": "warning",
   "scaffold": "You have until {deadline} before {consequence}.",
   "slots": [
    "deadline",
    "consequence"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.76,
   "evidence": "hypothesis",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "anti-guru",
   "name": "Anti-Guru",
   "family": "contrarian",
   "scaffold": "If a guru says {claim}, run.",
   "slots": [
    "claim"
   ],
   "niches": [
    "business",
    "fitness",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.8,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "case-study-cold",
   "name": "Cold Case Study",
   "family": "proof",
   "scaffold": "Case study: {subject} did {action}. Result: {result}.",
   "slots": [
    "subject",
    "action",
    "result"
   ],
   "niches": [
    "business",
    "tech",
    "creators",
    "general"
   ],
   "strength": 0.85,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "series-cold-open",
   "name": "Series Cold Open",
   "family": "curiosity",
   "scaffold": "Episode 1: the mistake that started everything.",
   "slots": [],
   "niches": [
    "story",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.81,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "role-reversal",
   "name": "Role Reversal",
   "family": "story",
   "scaffold": "I used to buy {thing}. Now I sell it. Here's the shift.",
   "slots": [
    "thing"
   ],
   "niches": [
    "business",
    "story",
    "finance",
    "general"
   ],
   "strength": 0.82,
   "evidence": "market-observed",
   "tier": "extended",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "halitosis-diagnosis",
   "name": "Halitosis Pattern (Diagnosis Branding)",
   "family": "diagnosis",
   "scaffold": "There's a name for what you're struggling with: {named_diagnosis}.",
   "slots": [
    "named_diagnosis"
   ],
   "niches": [
    "business",
    "creators",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.91,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "problem-agitate-solve",
   "name": "Problem–Agitate–Solve",
   "family": "mistake",
   "scaffold": "You know {problem}. What you don't feel yet is {agitation}. Here's the way out.",
   "slots": [
    "problem",
    "agitation"
   ],
   "niches": [
    "business",
    "finance",
    "fitness",
    "general"
   ],
   "strength": 0.9,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "unique-mechanism",
   "name": "Unique Mechanism",
   "family": "curiosity",
   "scaffold": "The difference isn't effort. It's {mechanism_name}.",
   "slots": [
    "mechanism_name"
   ],
   "niches": [
    "business",
    "fitness",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.88,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "reason-why",
   "name": "Reason-Why Advertising",
   "family": "proof",
   "scaffold": "Why {claim}? Because {specific_reason}.",
   "slots": [
    "claim",
    "specific_reason"
   ],
   "niches": [
    "business",
    "finance",
    "tech",
    "general"
   ],
   "strength": 0.87,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "preemptive-objection",
   "name": "Preemptive Objection",
   "family": "authority",
   "scaffold": "You're probably thinking {objection}. Fair. Here's the answer.",
   "slots": [
    "objection"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.84,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "demonstration-first",
   "name": "Demonstration First",
   "family": "proof",
   "scaffold": "[Demo the result] — now I'll show how.",
   "slots": [],
   "niches": [
    "tech",
    "fitness",
    "creators",
    "general"
   ],
   "strength": 0.89,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video"
   ]
  },
  {
   "id": "before-after-bridge",
   "name": "Before–After–Bridge",
   "family": "story",
   "scaffold": "Before: {before}. After: {after}. The bridge was {bridge}.",
   "slots": [
    "before",
    "after",
    "bridge"
   ],
   "niches": [
    "fitness",
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.88,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "open-loop-zeigarnik",
   "name": "Open Loop (Zeigarnik)",
   "family": "curiosity",
   "scaffold": "I'll tell you the third rule last — first, the one everyone skips.",
   "slots": [],
   "niches": [
    "creators",
    "story",
    "education",
    "general"
   ],
   "strength": 0.86,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "social-proof-stack",
   "name": "Social Proof Stack",
   "family": "proof",
   "scaffold": "{n} {identity} already {action}. You're next — or not.",
   "slots": [
    "n",
    "identity",
    "action"
   ],
   "niches": [
    "business",
    "fitness",
    "creators",
    "general"
   ],
   "strength": 0.83,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "enemy-narrative",
   "name": "Enemy Narrative",
   "family": "contrarian",
   "scaffold": "{enemy} profits when you keep {bad_habit}.",
   "slots": [
    "enemy",
    "bad_habit"
   ],
   "niches": [
    "business",
    "finance",
    "fitness",
    "creators",
    "general"
   ],
   "strength": 0.84,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "specific-starving-crowd",
   "name": "Starving Crowd Specificity",
   "family": "identity",
   "scaffold": "If you're a {ultra_specific_person}, this is for you.",
   "slots": [
    "ultra_specific_person"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.87,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "fascination-bullets",
   "name": "Fascination Bullets",
   "family": "curiosity",
   "scaffold": "Why {odd_fact} changes how you {action} forever.",
   "slots": [
    "odd_fact",
    "action"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.85,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "new-discovery",
   "name": "New Discovery Frame",
   "family": "curiosity",
   "scaffold": "A new way to {goal} without {sacrifice}.",
   "slots": [
    "goal",
    "sacrifice"
   ],
   "niches": [
    "fitness",
    "tech",
    "business",
    "general"
   ],
   "strength": 0.8,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "testimonial-cold",
   "name": "Cold Testimonial Open",
   "family": "proof",
   "scaffold": "\"{quote}\" — that's what {person} said after {result}.",
   "slots": [
    "quote",
    "person",
    "result"
   ],
   "niches": [
    "business",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.82,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "question-headline",
   "name": "Question Headline",
   "family": "engagement",
   "scaffold": "What if {reframe}?",
   "slots": [
    "reframe"
   ],
   "niches": [
    "business",
    "creators",
    "finance",
    "general"
   ],
   "strength": 0.8,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "how-to-promise",
   "name": "How-To Promise",
   "family": "value",
   "scaffold": "How to {desirable_outcome} without {common_pain}.",
   "slots": [
    "desirable_outcome",
    "common_pain"
   ],
   "niches": [
    "tech",
    "business",
    "creators",
    "fitness",
    "general"
   ],
   "strength": 0.86,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "slippery-slope-warning",
   "name": "Slippery Slope Warning",
   "family": "warning",
   "scaffold": "First {small_mistake}. Then {worse}. Then {catastrophe}.",
   "slots": [
    "small_mistake",
    "worse",
    "catastrophe"
   ],
   "niches": [
    "finance",
    "fitness",
    "creators",
    "general"
   ],
   "strength": 0.78,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "insider-language",
   "name": "Insider Language",
   "family": "identity",
   "scaffold": "If you know what {jargon} means, keep watching.",
   "slots": [
    "jargon"
   ],
   "niches": [
    "tech",
    "finance",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.81,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "challenge-dare",
   "name": "Challenge / Dare",
   "family": "engagement",
   "scaffold": "I dare you to try {challenge} for {duration}.",
   "slots": [
    "challenge",
    "duration"
   ],
   "niches": [
    "fitness",
    "creators",
    "business",
    "general"
   ],
   "strength": 0.8,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "plain-speak-shock",
   "name": "Plain-Speak Shock",
   "family": "interrupt",
   "scaffold": "Plain English: {blunt_truth}.",
   "slots": [
    "blunt_truth"
   ],
   "niches": [
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.83,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "story-sell",
   "name": "Story Sell Open",
   "family": "story",
   "scaffold": "It was {setting} when I realized {insight}.",
   "slots": [
    "setting",
    "insight"
   ],
   "niches": [
    "story",
    "business",
    "creators",
    "general"
   ],
   "strength": 0.84,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "free-curiosity",
   "name": "Free + Curiosity",
   "family": "value",
   "scaffold": "Free: the {asset} that fixed my {pain}.",
   "slots": [
    "asset",
    "pain"
   ],
   "niches": [
    "creators",
    "business",
    "tech",
    "general"
   ],
   "strength": 0.82,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "contrast-principle",
   "name": "Contrast Principle",
   "family": "proof",
   "scaffold": "Next to {bad_option}, {good_option} looks obvious.",
   "slots": [
    "bad_option",
    "good_option"
   ],
   "niches": [
    "business",
    "finance",
    "fitness",
    "general"
   ],
   "strength": 0.83,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "news-angle",
   "name": "News Angle",
   "family": "curiosity",
   "scaffold": "New: {development} just changed {domain}.",
   "slots": [
    "development",
    "domain"
   ],
   "niches": [
    "tech",
    "business",
    "finance",
    "creators",
    "general"
   ],
   "strength": 0.8,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  },
  {
   "id": "command-headline",
   "name": "Command Headline",
   "family": "interrupt",
   "scaffold": "Read this before you {action} again.",
   "slots": [
    "action"
   ],
   "niches": [
    "creators",
    "business",
    "fitness",
    "finance",
    "general"
   ],
   "strength": 0.84,
   "evidence": "historically-documented",
   "tier": "historical",
   "mediums": [
    "video",
    "text"
   ]
  }
 ]
};
