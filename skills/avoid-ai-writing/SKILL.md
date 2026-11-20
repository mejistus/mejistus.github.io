---
name: avoid-ai-writing
description: "Audit and rewrite content to remove AI writing patterns (\"AI-isms\"). Use this skill when asked to \"remove AI-isms,\" \"clean up AI writing,\" \"edit writing for AI patterns,\" \"audit writing for AI tells,\" or \"make this sound less like AI.\" Covers vocabulary, formatting, rhythm, and the structural rhetorical tics that survive vocabulary cleanup (named-abstraction authority, superlative anointing, not-just escalation, forced symmetry, verdict-closer density, paragraph-shape uniformity, unification claims, bold lead-in paragraphs, negated chains, wholeness verdicts, stranded auxiliary contrast, participle sentence tails, repeated sentence openers). Handles long internal documents — memos, proposals, PRDs, design docs — where the writing is dense with real specifics and still reads as machine-written. Supports a detect-only mode, an edit-in-place mode for files, an optional voice profile (casual / professional / technical / warm / blunt), and an iterate-to-convergence pass."
---

# Avoid AI Writing — Audit & Rewrite

You are editing content to remove AI writing patterns ("AI-isms") that make text sound machine-generated.

## What this skill is and isn't

This is a **writing-quality tool**, not a verdict. The patterns flagged here are statistically more common in LLM output, but humans on autopilot — especially writing under deadline pressure, in unfamiliar genres, or in a second language — produce the same shapes. Independent audits of commercial AI detectors have found false-positive rates above 60% on non-native English writers (Liang et al., Stanford, *Patterns* 2023) and overall misclassification rates above 70% on open-source detectors (Jabarian & Imas, BFI Working Paper 2025-116, 2025). Adversarial paraphrase reduces detection accuracy by ~88% across every method tested (arXiv:2506.07001, 2025).

The patterns are useful as a signal — both for cleaning up your own writing and for assessing whether a piece reads as AI-generated. Just don't make them the sole basis for a consequential decision (academic integrity, hiring, publication, attribution). Several rules here also fire on second-language writing, deadline-pressed humans, and technical genres that compress vocabulary by design. Pair the signal with context: who wrote it, what genre, what the writer's normal voice looks like, what other evidence you have.

In short: signals, not proof. Worth acting on; not worth ruining someone's day over.

## Modes

This skill operates in one of three modes:

**`rewrite`** (default) — Flag AI-isms and rewrite the text to fix them.

**`detect`** — Flag AI-isms only. No rewriting. Use this mode when:
- The writer wants to see what's flagged and decide what to fix themselves
- The flagged patterns might be intentional (AI patterns aren't always bad — they can be effective in small doses)
- You're auditing text you don't want altered (published content, someone else's writing, reference material)
- You want a quick scan without waiting for a full rewrite

**`edit`** — Edit a file in place rather than returning rewritten text. Use this when the writer points you at a file ("clean up `draft.md`", "fix the AI-isms in this file directly") and wants the file changed, not a copy to paste back. Make **minimal, targeted edits** — change the flagged spans, not the whole document. **Preserve passages that are already human**: if a paragraph has no tells, leave it untouched. **Don't edit quoted material, code blocks, or text attributed to someone else** — flag those instead of rewriting them. For a large file, confirm which section to clean before changing anything. After editing, re-read the file and confirm the flagged patterns are resolved.

Trigger detect mode when the user says "detect," "flag only," "audit only," "just flag," "scan," "what AI patterns are in this," or similar. Trigger edit mode when the user names a file and asks you to fix or clean it in place. Default to rewrite mode if not specified.

**Invocation.** Natural language is enough ("rewrite this in a blunt voice for LinkedIn," "edit `post.md` in place," "scan this, don't rewrite"). Power users can also pass explicit options, which map to the sections below: `[--mode rewrite|detect|edit]`, `[--voice casual|professional|technical|warm|blunt]`, `[--context linkedin|blog|technical-blog|investor-email|docs|casual]`, `[--file PATH]`, `[--iterate N]` (max 2).

**Iterate to convergence (optional).** Rewrite mode already runs one corrective second pass (see Output format) — that built-in pass *is* pass 2, so `--iterate` does not stack on top of it. When the writer asks to "iterate," "keep going until it's clean," or passes `--iterate N`, repeat the audit→rewrite cycle until no patterns remain or **N passes** are reached. Cap **N at 2**: a rewrite plus one corrective pass clears the flagged patterns, and a third pass costs a full regeneration while rarely finding more. Report how many passes it took ("converged in 2 passes").

---

In **rewrite** mode, your job is to:

1. **Audit it**: identify every AI-ism present, citing the specific text
2. **Rewrite it**: return a clean version with all AI-isms removed
3. **Show a diff summary**: briefly list what you changed and why

In **detect** mode, your job is to:

1. **Audit it**: identify every AI-ism present, citing the specific text
2. **Assess it**: note which flags are clear problems vs. patterns that may be intentional or effective in context

In **edit** mode, your job is to:

1. **Read** the file the writer named
2. **Edit in place**: apply minimal, targeted fixes to the flagged spans in the file itself, leaving already-human passages untouched
3. **Verify**: re-read the file and confirm the flagged patterns are resolved; report what you changed

---

## What to remove or fix

### Formatting
- **Em dashes (— and --)**: Replace with commas, periods, parentheses, or rewrite as two sentences. Target: zero. Hard max: one per 1,000 words. This applies to headings and section titles too, not just body prose. Catch both the Unicode em dash (—) and the double-hyphen substitute (--).
- **Bold overuse**: Strip bold from most phrases. One bolded phrase per major section at most, or none. If something's important enough to bold, restructure the sentence to lead with it instead.
- **Emoji in headers**: Remove entirely. No `## 🚀 What This Means`. Exception: social posts may use one or two emoji sparingly — at the end of a line, never mid-sentence.
- **Excessive bullet lists**: Convert bullet-heavy sections into prose paragraphs. Bullets only for genuinely list-like content (feature comparisons, step-by-step instructions, API parameters).
- **Curly quotation marks (“ ” ‘ ’) and apostrophes**: Curly quotes and apostrophes (U+201C/U+201D, U+2018/U+2019) are a *weak* paste-from-chat signal — meaningful mainly in plain-text contexts like code comments, commit messages, or plaintext drafts, where nothing auto-curls. Treat as corroborating, never conclusive: Word, Google Docs, macOS, and iOS curl quotes by default, so most human prose contains them too. Don't flag curly apostrophes (U+2019) on their own. Replace with straight quotes in plain-text/code; leave them in finished publications and locale-correct punctuation (French « », German „ “).

### Sentence structure
- **"It's not X — it's Y" / "This isn't about X, it's about Y"**: Rewrite as a direct positive statement. Max one per piece, and only if it serves the argument. See "Assistant rhetorical tics" below for the strawman test that decides whether the one allowed instance is earned, and for the related escalation form ("isn't just X — it's Y").
- **Hollow intensifiers**: Cut `genuine`, `real` (as in "a real improvement"), `truly`, `quite frankly`, `to be honest`, `let's be clear`, `it's worth noting that`. Just state the fact.
- **Performative honesty**: sincerity announced rather than demonstrated. `I won't pretend`, `I'll be honest`, `let's be honest`, `to be clear`, and sentence-initial `Honestly,` / `Look,` / `Frankly,` / `Truthfully,`. The sentence-initial forms are the ones a clause-level scan misses. Cut the windup and make the claim; if the claim needs a sincerity marker to land, it isn't landing.
- **Vague endorsement ("worth [verb]ing")**: Cut or replace `worth reading`, `worth paying attention to`, `worth a look`, `worth exploring`, `worth checking out`, `worth your time`. These substitute a generic thumbs-up for a specific reason. Say *why* something matters instead. Catch the standalone-fragment form too — "Worth stealing." "Worth a direct check." — which slips past a clause-level scan.
- **Hedging**: Cut `perhaps`, `could potentially`, `it's important to note that`, `to be clear`. Make the point directly.
- **Missing bridge sentences**: Each paragraph should connect to the last. If paragraphs could be rearranged without the reader noticing, add connective tissue.
- **Compulsive rule of three**: Vary groupings. Use two items, four items, or a full sentence instead of triads. Max one "adjective, adjective, and adjective" pattern per piece.
- **Colon into a triple**: a colon opening onto three or more comma-separated items — "separate ports, processes, and local state," "the launch needed three things: a blog post, a demo video, and a pricing page." The most common shape LLM prose uses to sound concrete, and distinct from the adjective-stack triad above. Fix: drop the colon and write the items into the sentence, or keep the colon and let the list be two items or five. **Clauses aren't items**: the rule targets a colon followed directly by a list of noun phrases. When what follows the colon is a sentence, skip it in every profile. That covers items that are clauses with their own verbs ("the prescription has to be active, the pharmacy has to have the drug in stock, and the plan has to cover the quantity") and a clause that contains the list ("it needs a specific timeout mismatch, a specific write path, and enough traffic"). Those state conditions or explanations, and their count is a fact about the subject, not a rhythm. **Context gate**: noisy in documentation and reference material, where genuine enumerations are frequent and legitimate — skip this rule on `docs` and `technical-blog` unless the items are vague.

### Words and phrases to replace

Words are organized into three tiers based on how reliably they signal AI-generated text. This tiered approach — adapted from [brandonwise/humanizer](https://github.com/brandonwise/humanizer)'s vocabulary research — reduces false positives on words that are fine in isolation but suspicious in clusters.

Several entries here and in the pattern sections below come from Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintained by editors who screen a high volume of submitted text, and from the pattern set in Simon Willison's [LLM cliché highlighter](https://tools.simonwillison.net/llm-cliche-highlighter). Both are worth re-harvesting periodically; the tells shift with each model generation.

- **Tier 1 — Always flag.** These words appear 5–20x more often in AI text than human text. Replace on sight.
- **Tier 2 — Flag in clusters.** Individually fine, but two or more in the same paragraph is a strong AI signal. Flag when they appear together.
- **Tier 3 — Flag by density.** Common words that AI simply overuses. Only flag when they make up a noticeable fraction of the text (roughly 3%+ of total words).

#### Tier 1 — Always replace

| Replace | With |
|---|---|
| delve / delve into | explore, dig into, look at |
| landscape (metaphor) | field, space, industry, world |
| tapestry | (describe the actual complexity) |
| realm | area, field, domain |
| paradigm | model, approach, framework |
| embark | start, begin |
| beacon | (rewrite entirely) |
| testament to | shows, proves, demonstrates |
| robust | strong, reliable, solid |
| comprehensive | thorough, complete, full |
| cutting-edge | latest, newest, advanced |
| leverage (verb) | use |
| pivotal | important, key, critical |
| plays a crucial/pivotal/vital/key role in | (name what it does — "the cache absorbs 90% of reads") |
| underscores | highlights, shows |
| meticulous / meticulously | careful, detailed, precise |
| seamless / seamlessly | smooth, easy, without friction |
| game-changer / game-changing | describe what specifically changed and why it matters |
| hit differently / hits different | (say what specifically changed, or cut) |
| utilize | use |
| watershed moment | turning point, shift (or describe what changed) |
| marking a pivotal moment | (state what happened) |
| the future looks bright | (cut — say something specific or nothing) |
| only time will tell | (cut — say something specific or nothing) |
| nestled | is located, sits, is in |
| vibrant | (describe what makes it active, or cut) |
| thriving | growing, active (or cite a number) |
| despite challenges… continues to thrive | (name the challenge and the response, or cut) |
| showcasing | showing, demonstrating (or cut the clause) |
| deep dive / dive into | look at, examine, explore |
| unpack / unpacking | explain, break down, walk through |
| bustling | busy, active (or cite what makes it busy) |
| intricate / intricacies | complex, detailed (or name the specific complexity) |
| complexities | (name the actual complexities, or use "problems" / "details") |
| ever-evolving | changing, growing (or describe how) |
| enduring | lasting, long-running (or cite how long) |
| daunting | hard, difficult, challenging |
| holistic / holistically | complete, full, whole (or describe what's included) |
| actionable | practical, useful, concrete |
| impactful | effective, significant (or describe the impact) |
| learnings | lessons, findings, takeaways |
| thought leader / thought leadership | expert, authority (or describe their actual contribution) |
| best practices | what works, proven methods, standard approach |
| at its core | (cut — just state the thing) |
| synergy / synergies | (describe the actual combined effect) |
| interplay | relationship, connection, interaction |
| in order to | to |
| due to the fact that | because |
| serves as | is |
| features (verb) | has, includes |
| boasts | has |
| presents (inflated) | is, shows, gives |
| commence | start, begin |
| ascertain | find out, determine, learn |
| endeavor | effort, attempt, try |
| keen (as intensifier) | interested, eager, enthusiastic (or cut — just state the interest) |
| symphony (metaphor) | (describe the actual coordination or combination) |
| embrace (metaphor) | adopt, accept, use, switch to |

#### Tier 2 — Flag when 2+ appear in the same paragraph

These words are legitimate on their own. When two or more show up together, the paragraph likely needs a rewrite.

| Replace | With |
|---|---|
| harness | use, take advantage of |
| navigate / navigating | work through, handle, deal with |
| foster | encourage, support, build |
| elevate | improve, raise, strengthen |
| unleash | release, enable, unlock |
| streamline | simplify, speed up |
| empower | enable, let, allow |
| bolster | support, strengthen, back up |
| spearhead | lead, drive, run |
| resonate / resonates with | connect with, appeal to, matter to |
| revolutionize | change, transform, reshape (or describe what changed) |
| facilitate / facilitates | enable, help, allow, run |
| underpin | support, form the basis of |
| nuanced | specific, subtle, detailed (or name the actual nuance) |
| crucial | important, key, necessary |
| multifaceted | (describe the actual facets, or cut) |
| ecosystem (metaphor) | system, community, network, market |
| myriad | many, numerous (or give a number) |
| plethora | many, a lot of (or give a number) |
| encompass | include, cover, span |
| catalyze | start, trigger, accelerate |
| reimagine | rethink, redesign, rebuild |
| galvanize | motivate, rally, push |
| augment | add to, expand, supplement |
| cultivate | build, develop, grow |
| illuminate | clarify, explain, show |
| elucidate | explain, clarify, spell out |
| juxtapose | compare, contrast, set side by side |
| paradigm-shifting | (describe what actually shifted) |
| transformative / transformation | (describe what changed and how) |
| cornerstone | foundation, basis, key part |
| paramount | most important, top priority |
| poised (to) | ready, set, about to |
| burgeoning | growing, emerging (or cite a number) |
| nascent | new, early-stage, emerging |
| quintessential | typical, classic, defining |
| overarching | main, central, broad |
| underpinning / underpinnings | basis, foundation, what supports |

#### Tier 3 — Flag only at high density

These are normal words. Only flag them when the text is saturated with them — a sign that AI filled space with vague praise instead of specifics.

| Word | What to do |
|---|---|
| significant / significantly | Replace some with specifics: numbers, comparisons, examples |
| innovative / innovation | Describe what's actually new |
| effective / effectively | Say how or cite a metric |
| dynamic / dynamics | Name the actual forces or changes |
| scalable / scalability | Describe what scales and to what |
| compelling | Say why it compels |
| unprecedented | Name the precedent it breaks (or cut) |
| exceptional / exceptionally | Cite what makes it an exception |
| remarkable / remarkably | Say what's worth remarking on |
| sophisticated | Describe the sophistication |
| instrumental | Say what role it played |
| world-class / state-of-the-art / best-in-class | Cite a benchmark or comparison |

#### Tier 3 phrases — Flag at density or in clusters

Multi-word boilerplate that's individually unobjectionable but stacks heavily in AI-generated content (crypto, web3, DePIN, AI/infra reviews are the worst offenders). Flag at **2+ uses of the same phrase** (the per-phrase rule — lower threshold than single-word Tier 3 because a two-word match repeated twice is already stronger evidence than re-using "significant"), *plus* a **cluster rule**: three or more *distinct* phrases from this table in one piece is a strong signal even when each phrase only appears once — that's the shape LLMs take when they vary their own boilerplate to seem less repetitive.

| Phrase | What to do |
|---|---|
| emerging sector / emerging space / emerging category | Name the actual sector or what's emerging about it |
| the integration of (X with Y) | Describe what's being integrated and what changes for the user |
| the intersection of (X and Y) | Pick the specific overlap that matters or cut the framing |
| community-driven | Name what the community does. "Community-driven" alone is filler |
| long-term sustainability | Cite the time horizon and the constraint. "Long-term" is hand-waving |
| user engagement | Name the action. "Engagement" is a wrapper around clicks/comments/retention |
| decentralized compute | Specify the architecture or cut. The phrase has become a category label, not a claim |
| (sustainable) reward emissions | Cite the emission schedule and the sink |
| tokenized incentive structures | Describe the actual mechanism (vesting, gauge, bonded LP, etc.) |
| designed for long-term [X] | Cut "designed for" — either it is or it isn't. Then state the property |

### Template phrases (avoid)

These slot-fill constructions signal that a sentence was generated, not written. If a phrase has a blank where a noun or adjective could go and still sound the same, it's too generic.

- "a [adjective] step towards [adjective] AI infrastructure" → describe the specific capability, benchmark, or outcome
- "a [adjective] step forward for [noun]" → same rule: say what actually changed
- "Whether you're [X] or [Y]" → false-breadth construction. Pick the audience you're actually addressing, or cut. "Whether you're a startup founder or an enterprise architect" means nothing — it's just "everyone."
- "I recently had the pleasure of [verb]-ing" → review/social AI pattern. Just say what happened: "I talked to," "I read," "I attended."

### Transition phrases to remove or rewrite
- "Moreover" / "Furthermore" / "Additionally" → restructure so the connection is obvious, or use "and," "also," "on top of that"
- "In today's [X]" / "In an era where" → cut or state specific context
- "It's worth noting that" / "Notably" → just state the fact
- "Here's what's interesting" / "Here's what caught my eye" / "Here's what stood out" → reader-steering frames. Let the content signal its own importance. If you need a lead-in, make it specific: "The revenue number matters because..." not "Here's the interesting part."
- "In conclusion" / "In summary" / "To summarize" → your conclusion should be obvious
- "When it comes to" → just talk about the thing directly
- "At the end of the day" → cut
- "That said" / "That being said" → cut or use "but," "yet," or "however." Don't overuse any one of them.

### Structural issues
- **Uniform paragraph length**: Vary deliberately. Include some 1-2 sentence paragraphs and some longer ones. If every paragraph is roughly the same size, fix it.
- **Formulaic openings**: If the piece opens with broad context before getting to the point ("In the rapidly evolving world of..."), rewrite to lead with the news or the insight. Context can come second.
- **Suspiciously clean grammar**: Don't sand away all personality. Deliberate fragments, sentences starting with "And" or "But," comma splices for effect: if the natural voice uses them, keep them.

### Significance inflation
- Phrases like "marking a pivotal moment in the evolution of..." or "a watershed moment for the industry" inflate routine events into history-making ones. State what happened and let the reader judge significance.
- If the sentence still works after you delete the inflation clause, delete it.

### Generic future-narrative closers
- "May become one of the most important narratives of the next market cycle," "could become the defining trend of the coming decade," "is poised to become the next major chapter in [X]." AI defaults to this shape when it needs to land a closing thought without committing to a falsifiable claim. The closer is grammatically a prediction but contains no testable content.
- Pattern: modal (may / could / will / is poised to) + "become" + (one of) the most [adjective] + (narrative / story / trend / theme / chapter / movement / force).
- Fix: pick the falsifiable version. "DePIN compute may exceed AWS spot pricing for embarrassingly parallel workloads by 2027" is a prediction. "The intersection of AI and DePIN may become one of the most important narratives of the next market cycle" is not.

### Hedge-stacked predictions
- Stacking a modal with a hedge adverb: "could potentially create," "may eventually unlock," "might ultimately transform." Either word alone is acceptable; the stack is the tell. Each hedge cancels the next, leaving a sentence that asserts nothing while sounding cautious and thoughtful.
- Fix: pick one. If you mean "could create," say that. If you mean "potentially creates," say that. Both together is filler.

### "Real/actual" adjective inflation
- "Real on-chain tokenomics," "actual reward sustainability," "genuine utility," "true product-market fit." Using `real` / `actual` / `genuine` / `true` as an empty intensifier on an abstract noun implies the rest of the field is fake or superficial — without naming what makes this instance the real one. Common in crypto/AI/web3 content where the writer wants to signal sophistication.
- Distinct from the existing "hollow intensifiers" rule (genuine / truly / quite frankly as sentence-level hedges). This is the noun-modifier form, where the intensifier latches onto an abstract noun to manufacture a contrast that goes unsaid.
- **Carve-out — named contrast:** if the sentence explicitly names what the fake/superficial version is, leave it. "Real on-chain settlement, not bridged IOUs" or "actual revenue from paying customers, not grants" is honest contrastive writing. The AI tell is the unsaid contrast.
- Fix when no contrast is named: drop the adjective and add the specific claim. "Reward sustainability" → "rewards funded from $X/mo in fees rather than emissions."

### Hashtag stuffing
- Long trailing hashtag blocks (6+ hashtags on a single short post) are near-universal in LLM-generated social content and rare in thoughtful human posts. The block usually mixes a project-specific tag with broad category tags (#AI #Crypto #Web3 #Innovation #FutureTech #Technology) — the categorical ones do nothing for discoverability and read as bot output.
- **Why 6?** Empirical floor. LinkedIn and X organic engagement plateaus or declines past 3-5 tags; human posts that exceed 5 are usually launch posts trading reach for engagement, while LLM-generated posts default to 10-15. Six is the threshold where false positives on legitimate human use start dropping below false negatives on AI output. The detector treats 6+ as a hard flag; the spec treats 5+ as a soft tell worth a second look on `linkedin` and `investor-email` profiles.
- Fix: 2-3 specific tags max, or none. If a hashtag wouldn't help a reader find related work, it's filler.

### Bullet lists of bare noun phrases
- A list of 5+ consecutive bullet items where each item is a short (≤6 word) adjective-plus-noun phrase with no verb. "Stable mining efficiency / Reliable pool connectivity / Optimized RandomX performance / Low failed share rates / Effective hardware utilization / Consistent thermal stability." Reads as a marketing one-pager because that's the shape LLMs default to when asked to summarize features.
- The tell is the *symmetry*: every item is the same grammatical shape, every item is parallel in length, none of them assert anything checkable. A genuine list of observations would have varying length, occasional verbs, and at least one item that doesn't fit the pattern.
- Fix: convert to prose paragraph, or rewrite items as full claims ("Failed shares stayed under 1% across a 12-hour run" beats "Low failed share rates"). If the list is genuinely the right form, vary the items so each carries a different shape of information.
- This rule does *not* apply to genuine list content (changelog entries, todo lists, parameter docs, ingredient lists) where bare noun phrases are the correct form. The detector keys on absence of finite verbs to separate the two — but in prose audits, ask whether the bullets are summarizing claims (rewrite) or enumerating items (leave).

### Copula avoidance
- AI text avoids "is" and "has" by substituting fancier verbs: "serves as," "features," "boasts," "presents," "represents." These sound like a press release.
- Default to "is" or "has" unless a more specific verb genuinely adds meaning.

### Synonym cycling
- AI rotates synonyms to avoid repeating a word: "developers… engineers… practitioners… builders" in the same paragraph. Human writers repeat the clearest word.
- If the same noun or verb appears three times in a paragraph and that's the right word, keep all three. Forced variation reads as thesaurus abuse.

### Vague attributions
- "Experts believe," "Studies show," "Research suggests," "Industry leaders agree" — without naming the expert, study, or leader. Either cite a specific source or drop the attribution and state the claim directly.

### Filler phrases
- Strip mechanical padding that adds words without meaning:
  - "It is important to note that" → (just state it)
  - "In terms of" → (rewrite)
  - "The reality is that" → (cut or just state the claim)
- Note: "In order to," "Due to the fact that," and "At the end of the day" are covered in the word/phrase table and transition sections above — don't duplicate rules.

### Generic conclusions
- "The future looks bright," "Only time will tell," "One thing is certain," "As we move forward" — these are filler disguised as conclusions. Cut them. If the piece needs a closing thought, make it specific to the argument.

### Chatbot artifacts
- "I hope this helps!", "Certainly!", "Absolutely!", "Great question!", "Feel free to reach out," "Let me know if you need anything else" — these are conversational tics from chat interfaces, not writing. Remove entirely.
- Also watch for: "In this article, we will explore…" or "Let's dive in!" — these are AI-generated meta-narration. Cut or rewrite with a direct opening.

### "Let's" constructions
- "Let's explore," "Let's take a look," "Let's break this down," "Let's examine" — AI uses "let's" as a false-collaborative opener to ease into a topic. It's filler that delays the actual point. Just start with the point. "Let's dive in" is covered above under chatbot artifacts, but the pattern is broader than that — flag any "let's + verb" that's functioning as a transition rather than a genuine invitation to act.

### Notability name-dropping
- AI text piles on prestigious citations to manufacture credibility: "cited in The New York Times, BBC, Financial Times, and The Hindu." If a source matters, use it with context: "In a 2024 NYT interview, she argued..." One specific reference beats four name-drops.

### Superficial -ing analyses
- Strings of present participles used as pseudo-analysis: "symbolizing the region's commitment to progress, reflecting decades of investment, and showcasing a new era of collaboration." These say nothing. Replace with specific facts or cut entirely.
- The same move shows up without the -ing: declarative "meaning-telling" that glosses a mundane subject as if it were profound — "this represents a broader shift," "the decision symbolizes a commitment to excellence," "it speaks to a larger trend in the industry." If the significance is real, show it with a specific consequence; otherwise cut. Adapted from `Aboudjem/humanizer-skill` P40.

### Participle sentence tails
- Analysis bolted onto the end of a sentence with a comma and a participle: ", highlighting the growing importance of X," ", underscoring its commitment to Y," ", reflecting the appeal of the collection," ", solidifying her place among Z." One of the most reliable single-construction tells catalogued by Wikipedia's editors, and it survives a vocabulary pass because the participle usually isn't on any word list.
- Distinct from superficial -ing analyses above, which stacks several participles as the content of a clause. This one is a tail: the sentence has already made its point, and the tail tells the reader what to make of it.
- Trigger words: `highlighting`, `underscoring`, `emphasizing`, `showcasing`, `reflecting`, `demonstrating`, `illustrating`, `signaling`, `solidifying`, `cementing`, `reinforcing`, `underlining` — when preceded by a comma and followed by `its / their / the / a / how / that`.
- Fix: delete the tail. If the significance is real and load-bearing, give it its own sentence with a specific consequence.

### Tech-marketing boilerplate
- Developer-audience equivalents of the tourism-brochure prose below: "small enough to fit in your head," "batteries included," "it just works," "zero config," "sane defaults," "blazing fast," "no magic," "just works out of the box," "one command and you're running."
- These are load-bearing in vendor copy and empty in prose. Each one asserts a quality without a measurement, and every project claims all of them. Fix: give the number or the constraint. "The core is 400 lines" instead of "fits in your head." "Runs without a config file; every option has a default" instead of "zero config."
- Carve-out: quoting a project's own positioning, or naming the design philosophy as a term of art in a discussion of it, is fine. Asserting it about your own thing is the flag.

### Therapist register
- Reflective-counselor phrasing imported into ordinary prose: "sit with that," "sit with the discomfort," "you already know the answer," "that loss is real and it's worth naming," "give yourself permission to," "name the thing." The model reaches for this whenever the subject is remotely personal, including in business and technical writing where it's badly out of register.
- The tell is that the sentence asks the reader to feel something instead of telling them something. It also flatters — "you already know" credits the reader with a conclusion the piece hasn't argued.
- Fix: state the observation. "Sit with that for a moment" becomes nothing at all; the following sentence was the point. "You already know the answer" becomes the answer.
- "Worth naming" specifically is also covered under vague endorsement above; this section covers the register it belongs to.

### Promotional language
- AI defaults to tourism-brochure prose: "nestled within the breathtaking foothills," "a vibrant hub of innovation," "a thriving ecosystem." Replace with plain description: "is a town in the Gonder region," "has 12 startups." If you wouldn't say it in conversation, cut it.

### Formulaic challenges
- "Despite challenges, [subject] continues to thrive" or "While facing headwinds, the organization remains resilient." This is a non-statement. Name the actual challenge and the actual response, or cut the sentence.

### False ranges
- AI creates false breadth by pairing unrelated extremes: "from the Big Bang to dark matter," "from ancient civilizations to modern startups." These sound sweeping but say nothing. List the actual topics or pick the one that matters.

### Inline-header lists
- Bullet lists where each item starts with a bold header that repeats itself: "**Performance:** Performance improved by..." Strip the bold header and write the point directly. If the list items need headers, they should probably be paragraphs.
- The stronger version of this is when *every* list in a document takes the shape `**Short label.** Explanation.` — not because the content called for it, but because it's the default. Two or more consecutive bullets in that form is a flag on its own, even when the labels don't repeat the sentence. See "Bold lead-in bullets" under Assistant rhetorical tics.
- Carve-out: bolding a key term on first use and then reusing it unbolded is a different pattern (term introduction, standard in strategy documents). Leave it.

### Title case headings
- AI over-capitalizes headings: "Strategic Negotiations And Key Partnerships" instead of "Strategic negotiations and key partnerships." Use sentence case for subheadings. Title case only for the piece's main title, if at all.

### Hyphenated-pair overuse
- AI stacks compound modifiers: "a high-quality, well-architected, future-proof solution." Two distinct problems. First, density — strings of hyphenated adjectives piled on one noun; cut to the modifier that actually matters. Second, the attributive/predicate error: a compound is hyphenated *before* the noun ("a high-quality report") but not *after* a linking verb ("the report is high quality," no hyphen). AI frequently hyphenates the predicate form; fix it to two words. Adapted from `blader/humanizer` P26.

### Cutoff disclaimers
- "While specific details are limited based on available information," "As of my last update," "I don't have access to real-time data." These are model limitations leaking into prose. Either find the information or remove the hedge. Never publish a sentence that admits the writer didn't look something up.

### Speculative gap-filling
- When the model lacks a fact, it fills the gap with hedged speculation dressed up as background: "maintains a relatively low public profile," "is believed to have," "likely began his career in," "appears to have studied." These are guesses formatted as statements. Distinct from cutoff disclaimers, which *admit* the gap — this one hides it behind plausible-sounding filler, which is worse because the reader can't tell what's known from what's invented. Cut the speculation, or replace it with a sourced fact. Adapted from `blader/humanizer` P21.

### Unfilled placeholders
- Bracketed slot-fillers that were meant to be replaced before publishing: `[Your Name]`, `[INSERT SOURCE URL]`, `[Describe the specific section]`, `2025-XX-XX`, `<!-- Add citation if available -->`. These are near-definitive evidence that AI-generated boilerplate was pasted without editing. Humans use placeholders in templates too, but rarely ship them. Treat any visible placeholder as a publishing bug: fill it in with real content or delete the sentence entirely.
- Catch the obvious shapes: `\[(?:Your|Insert|Add|Enter|Describe|Specify|Choose)[^\]]+\]`, `\b\d{4}-XX-XX\b`, HTML/Markdown comments with placeholder verbs (`add`, `fill in`, `todo`, `insert`).

### Chatbot citation markup leaks
- Internal citation tokens that leak through when text is copy-pasted from chat UIs: `citeturn0search0`, `contentReference[oaicite:0]{index=0}`, `oai_citation`, `[attached_file:1]`, `grok_card`. These are not patterns — they are fingerprints. Their presence is essentially proof the text was generated by a specific chat tool and pasted without cleanup.
- The fix is mechanical: strip every markup token. If a citation was meaningful, replace it with a real reference. Don't try to humanize the markup — delete it.
- Adapted from `Aboudjem/humanizer-skill` P34. Worth catching even when nothing else in the text reads as AI — the token itself is enough.

### AI-tool URL parameters
- Tracking parameters that AI tools auto-append to URLs they generate, surviving copy-paste into published content: `utm_source=chatgpt.com`, `utm_source=copilot.com`, `utm_source=openai`, `utm_source=claude.ai`, `utm_source=perplexity.ai`, `referrer=grok.com`. Same logic as citation markup leaks — the presence of the parameter is the signature, regardless of what the surrounding text reads like.
- The fix: strip the parameter from every URL. Keep the URL itself if the link is meaningful; lose the parameter entirely. Adapted from `Aboudjem/humanizer-skill` P35.

### Novelty inflation
- AI text treats established concepts as if the speaker invented or discovered them: "He introduced a term," "She coined the phrase," "a concept nobody's naming," "a failure mode nobody talks about." In reality, most ideas in a conversation are applications of existing concepts, not inventions.
- Two problems. First, it's factually risky: if the concept already has a Wikipedia page or conference talks from last year, claiming novelty makes the writer look uninformed. Second, it flatters the subject in a way that reads as promotional rather than analytical.
- The fix: describe what the person *did with* the concept, not that they discovered it. "Michel walked through how context poisoning works in practice" instead of "Michel introduced a term I hadn't heard before: context poisoning." If you're unsure whether something is novel, assume it isn't and frame accordingly.
- Related patterns to flag: "the failure mode nobody's naming," "a problem nobody talks about," "the insight everyone's missing," "what nobody tells you about." These are engagement-bait framings that claim scarcity of knowledge where none exists.

### Infomercial engagement hooks
- Punchy fragment-hooks that tee up a reveal: "The catch?", "The kicker?", "Here's the thing.", "But here's the kicker:", "The best part?", "Plot twist:", "The result?", "The punchline is…", "The punchline:". AI uses these to fake momentum and manufacture suspense around ordinary information — the prose equivalent of a late-night infomercial.
- Distinct from rhetorical-question openers (which stall before a point) and chatbot artifacts (which perform helpfulness): these are mid-flow teasers that pad the rhythm. The fix is to delete the hook and state the thing. "The catch? It only works on weekends." becomes "It only works on weekends." Adapted from `Aboudjem/humanizer-skill` P41.

### Emotional flatline
- AI claims emotions as a structural crutch without conveying them through the writing: "What surprised me most," "I was fascinated to discover," "What struck me was," "I was excited to learn," "The most interesting part," and the bare section-header variant: "Interesting part of the project:" / "Interesting thing here:" / "Interesting aspect:". The header form drops "the most" but does the same job — pre-announcing significance the writing hasn't earned.
- Two problems. First, it's tell-don't-show: if the thing is genuinely surprising, the reader should feel that from the content, not from the writer announcing it. Second, these phrases are massively overused as list introductions and transitions. They're filler wearing an emotion costume.
- This pattern isn't always AI. It's also a sign of lazy human writing on autopilot. Flag it either way.
- The fix isn't "never say surprised." It's: if you claim an emotion, the writing around it should earn it. Otherwise cut the claim and present the thing directly.
- Related pattern: "hit differently" / "hits different." AI uses trendy colloquialisms as a shortcut to sound relatable without earning the emotional beat. If something genuinely affected you, describe how. Otherwise cut.

### False concession structure
- "While X is impressive, Y remains a challenge" or "Although X has made strides, Y is still an open question." AI uses this to sound balanced without actually weighing anything. Both halves are vague. Either make the concession specific (name what's impressive, name the actual challenge) or pick a side and argue it.

### Rhetorical question openers
- "But what does this mean for developers?" / "So why should you care?" / "What's next?" � AI uses rhetorical questions to stall before the actual point. If you know the answer, just say it. Rhetorical questions are earned by strong setup, not dropped as section transitions.
- **Stacked questions**: two or more questions fired in a row, the later ones usually fragments — "Do I know how it works? Where it breaks? Which corners it cut?" Count the run; two consecutive is a flag, three is a rewrite. A single earned rhetorical question can survive. A stack is the model performing inquiry, and it always resolves into an answer the writer had before the first question mark. Fix: keep the first question if the setup earns it, delete the rest, and answer.

### Parenthetical hedging
- "(and, increasingly, Z)" / "(or, more precisely, Y)" / "(and perhaps more importantly, W)" � AI inserts parenthetical asides to sound nuanced without committing. If the aside matters, give it its own sentence. If it doesn't, cut it.

### Numbered list inflation
- "Three key takeaways" / "Five things to know" / "Here are the top seven" � AI defaults to numbered lists because they're structurally safe. Only use numbered lists when the content genuinely has that many discrete, parallel items. If you're padding to hit a number, the list shouldn't exist.

### Reasoning chain artifacts
- "Let me think step by step," "Breaking this down," "To approach this systematically," "Step 1:," "Here's my thought process," "First, let's consider," "Working through this logically" — these are artifacts of chain-of-thought reasoning leaking into published prose. The reader doesn't need to see the scaffolding. State the conclusion, then the evidence.
- Also watch for numbered reasoning steps that read like an internal monologue rather than an argument meant for an audience.

### Sycophantic tone
- "Great question!", "Excellent point!", "You're absolutely right!", "That's a really insightful observation" — these are conversational rewards from chat interfaces, not writing. Remove entirely.
- Distinct from chatbot artifacts: sycophancy specifically validates the reader/questioner rather than just performing helpfulness.
- Harder to catch: the flat analytical form. "Good catch." "That's the right call." "Your instinct is right." "Exactly right." No exclamation point, no gush, and real substance follows — which is why it survives a normal pass. Cut it and start with the substance.

### Acknowledgment loops
- "You're asking about," "The question of whether," "To answer your question," "That's a great question. The..." — AI restates the prompt before answering. In writing, this is pure filler. The reader knows what they asked. Just answer.
- Related pattern: opening a section by summarizing what the previous section said. If the structure is clear, the reader doesn't need a recap.

### Confidence calibration phrases
- "It's worth noting that," "Interestingly," "Surprisingly," "Importantly," "Significantly," "Notably," "Certainly," "Undoubtedly," "Without a doubt" — AI uses these to signal how the reader should feel about a fact instead of letting the fact speak for itself.
- "Here's what's interesting," "Here's the interesting part," "Here are the parts I found interesting" — reader-steering cue that pre-interprets importance. Works when followed by genuinely surprising data; fails when it introduces a restatement of something obvious (which is the AI default).
- One "notably" in a 2,000-word piece is fine. Three in 500 words is AI-style emphasis stacking. Flag by density.
- Related — **persuasive-authority tropes**: "the real question is," "at its core," "fundamentally," "make no mistake," "the truth is." Same move as the calibration phrases above, but they assert depth or stakes instead of feeling: they announce that what follows is important rather than showing it. Cut the trope and lead with the substance. Adapted from `blader/humanizer` P27. The clause-level version of this — "The tell is…", "The failure mode underneath:", "The core insight:" — is covered under Assistant rhetorical tics below, and is the more common form in analytical writing.

### Self-labeling significance
- After listing or describing several items, the writer points back at one and labels it as contrarian / clever / surprising / counterintuitive / key: "That last move is the contrarian one," "This is the interesting part," "That third bullet is the real story," "Here's where it gets clever," "The last bit is the counterintuitive one."
- The label does the work the content was supposed to do. If a move is genuinely contrarian, the reader recognizes it from the description; if it isn't recognizable without the label, the label is unearned. The pattern reads as the writer auditing their own list to flag which item should matter, instead of writing the list so the right item carries the weight on its own.
- Distinct from confidence calibration ("Notably," "Interestingly") which front-loads the cue, and from emotional flatline ("What surprised me most," "The most interesting part") which prefaces a single claim. This pattern back-points after the fact, usually as "[that / this / the Xth / the last] [noun] is the [adjective] one."
- Significance-adjectives that signal the pattern: contrarian, clever, surprising, counterintuitive, interesting, key, important, unusual, smart, brilliant, real, actual.
- Related form, **"that's the part…"**: gesturing at a favoured detail instead of naming what makes it matter. "That's the part a schedule can't capture." "The part that makes me trust the rest." "My favourite part of the design." Same fix — state the property directly.
- Fix: cut the labeling sentence and let the explanation that follows do the work directly. Or restructure so the item you wanted to highlight is positioned first or expanded with specifics, making the label redundant.
- Example. Before: "→ Two separate indexes for tiered storage. That last move is the contrarian one. Co-locating related data usually helps cache locality." After: "→ Two separate indexes for tiered storage. Co-locating related data usually helps cache locality, but splitting the indexes is what makes the hot path cheap." The contrast carries itself; the label is gone.

### Excessive structure
- Too many headers in short text: more than 3 headings in under 300 words is almost always AI trying to look organized. Merge sections or use prose transitions instead.
- Too many list items: 8+ bullet points in under 200 words means the content should be a paragraph, not a list.
- Formulaic section headers: "Overview," "Key Points," "Summary," "Conclusion," "Introduction" — these are default AI scaffolding. Use headers that tell the reader something specific about what follows.

### Rhythm and uniformity

These aren't individual word or phrase problems — they're patterns in how the text flows as a whole. AI text is metronomic; human text has varied rhythm.

**Structure is the #1 detection signal.** AI detection tools (including Pangram, which trains a classifier on 28M human documents) weight structural regularity higher than vocabulary. Consistent sentence construction, uniform pacing, and symmetrical phrasing patterns are harder to mask than swapping out a few flagged words. If you fix every word on the Tier 1 list but leave the rhythm untouched, the text still reads as AI-generated.

- **Sentence length uniformity**: If most sentences are 15–25 words, the text sounds robotic. Mix short punchy sentences (3–8 words) with longer flowing ones (20+). Fragments work. Questions break the monotony. This bullet is calibrated for blog and social prose. In memos, proposals, and other long documents, applying it manufactures choppiness that now reads as machine-written in its own right — see "Internal-memo cadence" under Context profiles, where the test is whether each thought is complete rather than how many words it runs, and fragments are a cut.
- **Paragraph length uniformity**: If every paragraph is 3–5 sentences and roughly the same size, vary deliberately. Some paragraphs should be one sentence. Some should be longer.
- **Vocabulary repetition vs. synonym cycling**: AI either repeats the same word mechanically or cycles through synonyms conspicuously. Human writers repeat when the word is right and vary when it's natural — there's no formula.
- **Read-aloud test**: If the text sounds like it could be read by a text-to-speech engine without sounding weird, it's probably too uniform. Human writing has rhythm that resists robotic delivery.
- **Missing first-person perspective**: Where appropriate, the writer should have opinions, preferences, and reactions. AI is relentlessly neutral. If the piece is supposed to have a voice, the absence of "I think," "in my experience," or a stated preference is itself an AI tell.
- **Over-polishing**: Aggressively editing out every irregularity can push human writing *toward* AI statistical profiles. Natural disfluency, idiosyncratic word choices, and uneven pacing are what keep text out of the "AI-generated" classification. Don't sand away all personality in pursuit of clean prose. This skill should make writing sound more human, not less — if you apply every rule at maximum strictness, you risk creating the very uniformity you're trying to avoid.

### Paragraph-shape uniformity

Distinct from paragraph-*length* uniformity above, and more common in long documents that have already been edited for length variation. Lengths vary; the rhetorical arc never does. The assistant's default paragraph is claim → mechanism → consequence → compressed verdict, and a document can run forty paragraphs of visibly different sizes that all execute that same four-beat arc.

**The last-sentence test.** Read only the final sentence of every paragraph, in order, ignoring everything else. If they form a coherent sequence of standalone aphorisms — each one quotable, each one landing a judgment — the paragraphs were generated to a shape rather than written. In human documents roughly half of all closing sentences are boring: incomplete thoughts, transitional throat-clearing, a qualification, a detail that belongs to the next paragraph. Uniform quotability is the tell.

Related opening-side version: if most paragraphs open by naming their subject as a bolded or italicized term, or by stating the paragraph's thesis in its first six words, the openings are templated too.

The fix is not to degrade the good sentences. Break the arc: let some paragraphs end mid-thought and hand off to the next one, let some end on a detail rather than a judgment, and move a few verdicts to the front of their paragraph so the explanation follows the claim instead of building to it.

### Vocabulary diversity (stylometric)

In longer pieces (200+ words), look at how much vocabulary the text actually uses. The type-token ratio (TTR) — distinct word types divided by total tokens — is a classical stylometric signal that's easy to read by eye. Human prose at this length usually lands somewhere around 0.50–0.65 in English. AI text trends flatter, sometimes drifting under 0.40 when the model gets locked on a small vocabulary loop.

A very low TTR is not by itself proof of AI authorship — narrow topics, technical reference material, and second-language writing all legitimately compress vocabulary. But on general prose where you'd expect range (essays, articles, social content over ~200 words), a TTR below 0.40 is worth a second look. The fix is rarely to thesaurus the text; it's to broaden the *what* — name specific things, cite specific cases, replace a re-used abstract noun with the concrete instance behind it.

This is the first of four stylometric signals on the roadmap. The others (sentence-length burstiness as a continuous measure, function-word z-scores against a human-prose reference, POS-bigram log-odds) require either a POS tagger or a reference distribution and aren't implemented as detector categories yet.

### Paragraph-reshuffle immunity (structure test)
- A writer-side diagnostic, not a regex: can you swap two body paragraphs without breaking the piece? If the order doesn't matter, you've written a list of points, not an argument that builds. AI prose often fails this — each paragraph is a self-contained module with no load-bearing connection to its neighbors.
- The fix is structural, not lexical: establish a through-line where each paragraph depends on the one before it. If the paragraphs are genuinely independent, decide whether the piece should be an explicit list, or whether it's missing a thesis. Adapted from `Aboudjem/humanizer-skill` P38.

### Treadmill effect / low information density (content test)
- Another writer-side test: read each paragraph and ask "what's actually new here?" AI prose frequently restates the premise in fresh words instead of advancing it — lots of motion, no distance covered. The tell is that you could cut 40-60% and lose no information.
- The fix: for each paragraph, name the one fact, claim, or turn it contributes. If there isn't one, cut it. If there is, lead with it and drop the throat-clearing. Adapted from `Aboudjem/humanizer-skill` P43.

## Assistant rhetorical tics (structural reframes)

Everything above this section is mostly vocabulary and formatting. This section is shapes — the constructions an assistant reaches for when it wants prose to sound decisive. They survive a full vocabulary cleanup untouched. A draft can pass every rule in this file, contain no flagged word, and still read as machine-written because these are doing the load-bearing work.

Three bands. **Cut** means no legitimate use; delete on sight. **Ration** means a real device the assistant overuses; one per piece, and only when earned. **Keep** means it looks like a tic but is normal writing, listed so an aggressive pass doesn't strip it.

### Cut

**Named-abstraction authority.** "The tell is…", "The failure mode underneath:", "The core insight:", "The thing to watch is…", "The mechanism here is…", "The lesson under every other lesson." The writer names an abstraction and asserts it's the load-bearing one, borrowing authority the sentence hasn't earned. Same move as the persuasive-authority tropes above ("the real question is," "at its core"), extended to a whole clause. Fix: delete the frame and state the observation.
> Before: "The tell is the data/martech cluster — those are Segment competitors, not voice."
> After: "Four of those names are Segment competitors. None of them do voice."

**Superlative anointing.** "the single most overused one," "the highest-leverage one," "the one substantive disagreement worth resolving," "the thing that matters most here." Ranks items on a scale that's never stated, so one claim inherits importance from the ranking instead of from evidence. Distinct from self-labeling significance, which back-points at an item in a list; this can appear anywhere, including in a sentence with no list. Fix: drop the ranking, or give the scale.
> Before: "Reframe frequency is the highest-leverage fix."
> After: "Fix reframe frequency first — it appears in 11 of 14 paragraphs."

Narrowing variant: "the only marketing I trust," "the only estimate I'd believe," "the only thing that matters here," "the only metric that counts." Same move by exclusion instead of ranking — everything else is dismissed without being named. Fix: say what's wrong with the alternatives, or drop the exclusivity and make the positive claim.

**Not-just escalation.** "isn't just X — it's Y," "not only X, but Y," "more than X; it's Y." A weaker claim used as a launchpad for a stronger one, so the strong claim arrives sounding like a discovery. Fix: make the strong claim once, plainly.

**Parallel quoted questions.** "Hers answers 'what do we ship and when.' Yours answers 'why this, why us, what's the moat.'" Assigns each side a quoted question to manufacture a clean contrast that the underlying material rarely supports. Fix: describe what each thing actually does.

**Parallel definitional series.** The unquoted, N-way generalization of the above: two or more subjects each assigned a matched-grammar definition in consecutive sentences. "Verification answers who you are. Payment answers whether this is production. Trust and balance answer how much." The giveaway is usually a slot that had to be stuffed to preserve the pattern — here "trust and balance" is two mechanisms compressed into one subject so the series stays three-long and every verb stays "answers." Fix: write the one distinction that's actually load-bearing and let the others be described normally.

**Two-branch conditional mirror.** "If she thinks it's part of her OKR, she'll descope it. If she knows it's a separate commitment, it survives the pressure." Symmetrical if/if pairs with inverted outcomes. Real causation almost never lands this evenly; the symmetry is decoration. Fix: state the risk and the mitigation as one thought.

**Inline count announcement.** "Two caveats I'd verify." "Two things worth making concrete." "Three things stand out here." Pre-announcing a count mid-prose commits the writer to padding to that number. Separate from numbered list inflation above, which covers headers and titles. Fix: just write the items. If there are two, the reader will count two.

Document-scale version: count every pre-announced grouping of the same cardinality across the whole piece, headings included. "Three gates," "Three things the map has to cover," "three cross-machine edges," "Capacity has three inputs," "three authorities," "three parties write to that scope" — six triads in one document. Each announcement may be individually honest and still be scaffolding, because the model reaches for the same cardinality every time it needs to organize a section. Three or more same-count announcements per document is a flag on its own. Fix: keep the ones where the count is a real finding (the system genuinely has three authorities and two disagree) and dissolve the rest into prose.

**Options-plus-verdict scaffolding.** "Options: 1… 2… 3… Recommendation: option 3." Conversational scaffolding leaking into a document. In a document, give the recommendation and its reasoning. Alternatives appear only when the reader has to make the choice themselves, and then they don't need a numbered menu.

**Validating opener.** "Good catch." "That's the right call." "Your instinct is right." "Exactly right." Sycophantic tone (above) in the analytical register, where it's harder to spot because real substance follows it. Fix: cut the sentence and start with the substance.

**Bold lead-in bullets.** Lists where every item takes the shape `**Short label.** Explanation follows.` This is inline-header lists at document scale, and it is the assistant's default list shape — not a choice. Two or more consecutive bullets in this form: rewrite as prose or as plain items. Carve-out: bolding a key *term* on first use and then reusing it plain (standard in strategy documents) is a different pattern and stays.

**Bold lead-in paragraphs.** The same shape one level up, in documents with no bullets at all: body paragraphs that open `**The account machine.**` / `**Payment substitutes for identity in one place.**` / `**Provenance**` and then explain. It escapes the bullet rule because the text is prose, but it's the same default — the model labeling its own paragraphs so a reader can skim them. Three or more in a document: strip the bold and let the first sentence introduce the subject, or promote the genuinely separable ones to real subheadings. Keep the pattern only where the labels are terms the document defines and reuses.

**Forced symmetry sections.** "Where it's strong / Where it's weak," "What works / What doesn't," matched-length pro and con sections built regardless of whether the material is balanced. False concession structure at document level. Fix: let each section be the size its evidence justifies. If a document is mostly wrong, the strengths section is one line.

**Illustrative persona vignettes at fixed cadence.** A hypothetical unnamed actor, a sequence of verbs, an adverse outcome: "Someone who signs up, builds nothing for three months, then starts serious work gets two weeks of premium and then a quality cliff mid-build." "A two-year-old clean account that starts dialing high-cost international at 3am is compromised." "An Australian business calling Australia." One of these is a good explanatory move. The tell is cadence — one per section, always the same construction, because the model produces a vignette whenever a section needs grounding. Fix: keep the one that carries an argument the abstract statement can't, cite a real case for another (a ticket, a customer, a date), and cut the rest.

**Slow-failure adverbs.** "quietly shrink the scope," "silently drops changes," "quietly becomes the default." Adds menace without adding information. Fix: cut the adverb, or say what actually makes the failure invisible.

**"Worth X." as a standalone sentence.** "Worth stealing." "Worth a direct check." "Worth verifying." The fragment form of vague endorsement above, and it slips past that rule because it isn't a full clause. Fix: say why, or convert to an instruction. "Check the vendor's overage pricing before quoting the number."

**Sharpening verbs for conclusions.** "The earlier conclusion holds but sharpens." "That framing matters because…" "This is the test that prevents X." Announces that a conclusion has become more precise instead of showing the precision. Fix: state the sharpened conclusion and delete the announcement.

**"Costs" as a verdict.** "Option B costs more in risk than code." "That costs you trust, not time." "All it costs is a quick conversation to find out." Stretches the transactional verb "costs" across units that were never actually measured against each other — risk against code, trust against time — so an unweighed comparison sounds like it came off a scale. The minimizing form ("all it costs is...") runs the same trick backward: it declares an action costless by definition, foreclosing the question instead of answering it. Distinct from a literal cost statement ("cost is the reason," "that costs $50") — the tell is comparing or waiving incommensurable abstractions, not using the word. Fix: name what's actually at stake and who pays it, or drop the metaphor and state the recommendation directly.
> Before: "Option B costs more in risk than code."
> After: "Option B touches the auth path in three services most of the team hasn't worked in; it needs a second reviewer before it ships."

**Wholeness verdicts.** "That's the whole point." "Consistency is the entire game." "The entire pitch is one sentence long." "Here's the whole secret." A claim that some single thing accounts for everything, asserted rather than shown, and usually attached to whichever detail the paragraph just finished describing. Four surface forms — *that's the whole X*, *X is the whole Y*, *X is the entire Y*, *the entire X is Y* — and they're interchangeable, so catching one phrasing and leaving the others fixes nothing. Same family as named-abstraction authority: the frame does the persuading. Fix: delete the frame and let the observation stand, or state what the other parts are and why they don't matter.

**"That's not nothing."** Also "this is not nothing," "which is not nothing." Litotes as a verdict, used to salvage a finding the writer suspects is thin. If the finding is worth reporting, report its size. If it isn't, cut it.

**"Turns out…"** "Turns out nobody reads the changelog." "It turns out that the fix was one line." A casual-revelation opener bolted to a tidy conclusion, staging discovery around something the writer knew before starting the paragraph. Fix: state the finding. The surprise, if real, is in the content.

**"That's why X mattered."** "That's why the export button mattered." "This is why preserving every conversation mattered." Retroactively assigns significance to an earlier detail so a section closes on a payoff. Distinct from self-labeling significance, which points at an item in a list; this points back at the argument. Fix: if the earlier detail was load-bearing, the reader already knows — cut the sentence. If they don't, the earlier passage was underwritten.

**Stranded auxiliary contrast.** "The tool died; the data didn't." "Reading mostly passed. Writing didn't." "Maybe it wouldn't have." A clause landing on a bare auxiliary to execute a reversal. The rhythm is doing the work — it's a compressed antithesis that sounds like precision and usually omits the mechanism. Cheap to produce, which is why the model produces it constantly. Fix: complete the second clause. "The tool died; the data survived because the exports were plain CSV."

**Don't-VERB-it mirror.** "Don't call it a rewrite — call it a rescue." "Don't think of it as a migration; think of it as a rebuild." An imperative negate-then-correct, and it escapes the cap on that construction because it's a command rather than a copula. Same strawman test applies: if nobody actually calls it the first thing, the sentence is knocking down a position no one holds. Fix: use the second name and skip the correction.

**"X is dead" / "long live X."** "Peer code review is dead." "The changelog is dead; long live the release note." Obituary-headline framing, almost always about something still in wide use. Fix: say what declined, by how much, and for whom.

**"Don't take my word for it."** Also "you don't have to take my word for any of this." Stock invitation to verify, offered where no verification path follows. Fix: link the evidence, or drop the invitation.

### Ration — one per piece, only when earned

**Negated chains.** "No sign-ups, no downloads, no hassle." "Did not flinch, did not blink, did not reach for the red pen." "Nothing to install, nothing to configure, nothing to learn." A repeated negative stem across three or more items. One is a real device with real force; the model uses it as a default rhythm, and the later items are almost always padding to complete the cadence — the third negation is usually a restatement of the first.

Score it by item count, not by instance count: two items can be deliberate, three is the model's default shape, four or more is always padding. Count the items in every chain in the document and flag any chain of three or more, plus any document with more than one chain regardless of length. Fix: keep the negations that name distinct things and delete the rest, or convert to a positive statement — "paste your text and start writing."

**Repeated sentence openers.** Three or more consecutive sentences beginning on the same word: "Maybe nobody needed it. Maybe the shortcut confused people. Maybe the redesign was overdue." Pronouns, articles, and conjunctions don't count — repeating those is ordinary prose.

This is the cross-sentence scope of the anaphora entry in **Keep** below, and the two rules do not conflict: a repeated stem *inside* one sentence is rhythm and stays; a repeated stem *across* three or more consecutive sentences is the model padding a paragraph with parallel guesses. The giveaway is that the repeated opener is usually a hedge (*Maybe*, *Perhaps*, *Sometimes*), so the run commits to nothing three times over. One run per piece, and only where each sentence carries a distinct claim. "It's not X, it's Y." Already capped at one per piece above; this is the same rule with an added test. If the X half isn't a position someone actually holds, the construction is building a strawman for the sentence to knock down — cut it even when it's the only instance in the piece. This is a genuine device in strong writing. The assistant reaches for it four or five times per page.

Headings count against the cap, and they're where a clause-level scan misses them. "Dormancy is a payment problem," "Numbers have their own state," "Identity verification is a column, not a system," "Not a table — a map." A section title that asserts a corrective reclassification is the same move, and a document whose headings are all assertions of the form *X is really Y* has spent its one instance six times before the body starts. Fix: name the subject in the heading and make the argument in the prose.

**Unification claims.** "These are one bug." "The trial-number bug and the port cases are the same shape." "The payment-to-identity swap and the remediation campaign are the same event." Collapsing separate observations into a single underlying cause is the assistant's standard way to manufacture insight, and it's persuasive enough that the reader rarely checks whether the two things share a mechanism or just a vibe. Form: `X and Y are the same [thing / shape / bug / event / problem]`. One per document, and only when the unification does downstream work — if nothing later in the piece depends on the two things being one thing, it was decoration. Fix: state the shared mechanism, or describe the two things separately.

**Compressed metaphor as verdict.** "The devices are seasoning. The constants are the meal." A two-clause metaphor substituting for the argument. Distinct from an extended analogy that runs several paragraphs and does real explanatory work — that stays. Fix: if the metaphor is carrying the whole claim, make the claim.

**Fragment stack.** A full sentence followed by two or three fragments for rhythm. Register-gated: legitimate in a manifesto or a short pointed take, wrong in teaching prose, operational sequencing, and reference material. The assistant reaches for it specifically to punch up flat text that should stay flat.

**Grant-then-undercut.** "That's fine for a draft, but the shape of the metrics is also weak." Fine occasionally. Flag at three or more per piece, and flag any instance where both halves are vague — that's false concession structure.

**Verdict closer.** A one- or two-sentence closing paragraph delivering a judgment. Legitimate once per piece as a thesis beat. Flag when it appears at the end of every section, which turns a device into a template.

Measure it rather than eyeballing it: count sections ending in a judgment sentence of roughly fifteen words or fewer — "Humans reason about the map. The build keeps it true." / "Today it does, and that's what changes." / "Pick one deliberately." / "Finance picks it." / "We're making it rare and cheap." Over 30% of sections is a template. Long documents fail this while every individual closer looks like good writing, which is why the count has to be run explicitly. Fix: keep two or three where the judgment is the section's point, and let the others end on the last operational detail. See paragraph-shape uniformity above for the paragraph-level version of the same problem.

**Self-answered rhetorical question.** "Correct according to whom?" Allowed once, where the setup earns it. Rhetorical question openers remain a hard cut (above).

### Keep — do not strip these

Listed explicitly so an aggressive pass doesn't sand out a real voice while chasing the rules above:

- **Precise or uncommon vocabulary as compression** — stalking horse, blast radius, forcing function, load-bearing, table stakes, anti-pattern, co-opetition, epistemics. Standard usage among people who write about this work. Flag only if the term is decorative rather than doing a job.
- **Anaphora and deliberate triplets, within a sentence** — "one set of design decisions, one API shape, one bar for quality." Rhythm, not a filler triad. This overrides the compulsive-rule-of-three cap when the repetition is a repeated stem. Scope matters: the protection is for repeated stems inside a single sentence. Three or more *consecutive sentences* opening on the same word is a different pattern and gets flagged — see "Repeated sentence openers" in the Ration band, and "Negated chains" for the negative-stem case, where the chain's item count decides it.
- **Em dashes at natural frequency.** What's being cut above is the reframe riding on the dash, not the punctuation. Don't drive to zero.
- **Long teaching paragraphs.** Development across a paragraph is the point; don't chop it for length variation.
- **Bold term introduction on first use** in strategy documents.
- **Flat operational sequencing.** "We'll do X. We'll do Y. We'll do Z." Uniform by design. Don't punch it up.
- **Named identifiers and version-specific claims.** Class names, column names, config keys, file paths, exact figures (`shipment_legs` goes from 2 to 1,000). These are the least machine-like content in a technical document and the easiest thing to lose while restructuring a sentence. Preserve every one. If a rewrite can't keep an identifier, the rewrite is wrong.

### Detection heuristic

Count instances from the Cut band plus negate-then-correct. More than one per 400 words means the draft is structurally assistant-written and sentence-level patching won't fix it — go to the guidance below.

**Count each span once.** Every density threshold in this file — this one, the 30% verdict-closer rule, three-or-more same-cardinality announcements, three-or-more bold lead-in paragraphs — inflates badly without a dedup rule, because these patterns nest. "Don't call it a rewrite — call it a rescue. That's the whole point." is one sentence that trips the don't-VERB-it mirror, negate-then-correct, and a wholeness verdict; counted separately it looks like three hits in twelve words. When spans overlap, attribute the span to the pattern that covers the most text and drop the rest. Report the others as co-occurring if it helps the writer, but don't let them reach the count. Non-overlapping instances of the same pattern still count individually.

**Specificity does not exempt a document from this section.** A long technical or strategy document can carry real class names, real figures, and real internal detail on every page, contain not one flagged word from the tables above, and still read as machine-written to any experienced reader — because the tells are the shapes, and shapes survive concreteness. When a document is dense with specifics, skip the vocabulary pass and run four counts directly: verdict closers per section, same-cardinality announcements, bold lead-in paragraphs, and the last-sentence test. Those four decide it.

## When to rewrite from scratch vs. patch

If the text has 5+ flagged vocabulary hits across multiple categories, 3+ distinct pattern categories triggered, and uniform sentence/paragraph length, patching individual phrases won't fix it — the structure itself is AI-generated. Advise a full rewrite: state the core point in one sentence, then rebuild from there.

Structural tics trigger this on their own, at a lower threshold: more than one Cut-band instance per 400 words means every paragraph is being *shaped* by the reframe, and editing the reframes out sentence by sentence leaves a piece with nothing holding it together. Rebuild from the claims.

---

## Severity tiers

Not all AI-isms are equal. When doing a quick pass or triaging a large document, prioritize by tier:

### P0 — Credibility killers (fix immediately)
- Cutoff disclaimers ("As of my last update")
- Chatbot artifacts ("I hope this helps!", "Great question!")
- Vague attributions without sources ("Experts believe")
- Significance inflation on routine events
- Hashtag stuffing on `linkedin` and `investor-email` posts (severity varies by profile — same rule, lower priority on `blog`/`technical-blog` where a launch post may legitimately stack tags; see the context-profile table below)

### P1 — Obvious AI smell (fix before publishing)
- Word-list violations (delve, leverage, harness, robust, etc.)
- Template phrases and slot-fill constructions
- "Let's" transition openers
- Synonym cycling within a paragraph
- Formulaic openings ("In the rapidly evolving world of...")
- Bold overuse
- Em dash frequency (above 1 per 1,000 words)
- Generic future-narrative closers ("may become one of the most important narratives…")
- Hedge-stacked predictions ("could potentially," "may eventually")
- Real/actual adjective inflation ("real on-chain tokenomics")
- Bullet lists of bare noun phrases (5+ short adj+noun items, no verbs)
- Tier 3 phrase clustering (≥3 distinct boilerplate phrases in one piece)
- Assistant rhetorical tics, Cut band — named-abstraction authority, superlative anointing, not-just escalation, parallel quoted questions, parallel definitional series, two-branch conditional mirror, inline count announcement, validating openers, bold lead-in bullets, bold lead-in paragraphs, persona vignettes at fixed cadence, forced symmetry sections, slow-failure adverbs, "Worth X." fragments, sharpening verbs, "costs" as a verdict
- Reframe density above one per 400 words (structural signal — see the detection heuristic)
- Verdict closers on more than 30% of sections
- Paragraph-shape uniformity (the last-sentence test)
- Three or more same-cardinality count announcements in one document
- Unification claims beyond the first ("these are one bug," "the same shape")

### P2 — Stylistic polish (fix when time allows)
- Generic conclusions ("The future looks bright")
- Compulsive rule of three
- Uniform paragraph length
- Copula avoidance (serves as, features, boasts)
- Transition phrases (Moreover, Furthermore, Additionally)
- Hashtag stuffing (`blog`/`technical-blog` profiles)
- Tier 3 phrase repetition (single phrase ≥2× — fine in isolation, suspect in stacks)

Use P0+P1 for quick passes. Full audit covers all three tiers.

---

## Self-reference escape hatch

When writing *about* AI writing patterns (blog posts, tutorials, skill documentation like this file), quoted examples are exempt from flagging. Text inside quotation marks, code blocks, or explicitly marked as illustrative ("for example, AI might write...") should not be rewritten. Only flag patterns that appear in the author's own prose, not in cited examples of bad writing.

## Calibration corpus

`test-corpus.md` in this directory is a fixture for checking the skill against itself. It has two halves.

**Part 1** is a document engineered to trip a named set of patterns, with an expected-flags table listing which pattern each numbered passage should hit. Run `detect` mode against it and compare. A missed flag means the rule is written too narrowly or is buried where it doesn't get read.

**Part 2 is the part that matters.** It's ordinary human prose containing none of the patterns in this file: uneven paragraphs, plain declaratives, technical enumerations that legitimately come in threes, an em dash used correctly, a repeated word that's repeated because it's the right word. **Nothing in Part 2 should be flagged.** Every flag raised there is a false positive, and this file's stated risk is over-flagging, not under-flagging — a rule that fires on Part 2 needs narrowing or a context gate, even if it catches real cases in Part 1.

Run both halves after changing any rule, and after adding one. New patterns are where false positives get introduced: a regex written against three example sentences will match ordinary prose the author never considered. If a change adds flags in Part 2, revert it and rewrite the rule with the exclusion built in.

---

## Context profiles

Pass an optional context hint to adjust rule strictness. If no context is specified, auto-detect from content cues (short + hashtags = social, code blocks = technical, salutation = email, default = blog).

### Profile definitions

**`linkedin`** � Short-form social. Punchy fragments, visual formatting matter.
**`blog`** � Default. Standard long-form prose. All rules apply at full strength.
**`technical-blog`** � Long-form with code, architecture, APIs. Technical terms get a pass.
**`investor-email`** � High-trust audience. Tighten everything; promotional language is the biggest risk.
**`docs`** � Documentation, READMEs, guides. Clarity over voice.
**`casual`** � Slack messages, internal notes, quick replies. Only catch the worst offenders.
**`internal-memo`** � Proposals, strategy documents, design memos, PRDs, post-incident writeups. Circulated inside a company to colleagues who share context. Structural rules apply at full strength; cadence rules invert (see below).

### Tolerance matrix

Rules not listed in the table apply at full strength across all profiles.

| Rule | linkedin | blog | technical-blog | investor-email | docs | casual | internal-memo |
|------|----------|------|----------------|----------------|------|--------|---------------|
| Em dashes | relaxed (2/post OK) | strict | strict | strict | relaxed | skip | strict |
| Bold overuse | relaxed (bold hooks OK) | strict | strict | strict | relaxed | skip | **extra strict** |
| Emoji in headers | relaxed (1-2 end-of-line OK) | strict | strict | strict | skip | skip | strict |
| Excessive bullets | skip (lists work on LinkedIn) | strict | relaxed (technical lists OK) | strict | skip (lists are docs) | skip | strict |
| Hedging | strict | strict | relaxed ("may" is accurate in technical) | strict | relaxed | skip | relaxed (unsettled questions are real) |
| Word table (full list) | strict | strict | **partial** (see below) | strict | relaxed | P0 only | **partial** (as technical-blog) |
| Promotional language | relaxed (some sell is expected) | strict | strict | **extra strict** | strict | skip | **extra strict** |
| Significance inflation | strict | strict | strict | **extra strict** | relaxed | skip | **extra strict** |
| Copula avoidance | skip | strict | relaxed | strict | skip | skip | strict |
| Uniform paragraph length | skip (short-form) | strict | strict | strict | relaxed | skip | relaxed (see cadence note) |
| Paragraph-shape uniformity | skip (short-form) | strict | strict | strict | relaxed | skip | **extra strict** |
| Numbered list inflation | relaxed | strict | relaxed | strict | skip | skip | strict |
| Rhetorical questions | relaxed (1 as hook OK) | strict | strict | strict | strict | skip | strict |
| Transition phrases | skip (short-form) | strict | strict | strict | relaxed | skip | strict |
| Generic conclusions | skip | strict | strict | **extra strict** | skip | skip | strict |
| Hashtag stuffing | strict | strict | strict | **extra strict** | skip (no hashtags in docs) | skip | skip |
| Bullet-NP lists | strict | strict | relaxed (technical option lists OK) | strict | relaxed (parameter lists OK) | skip | strict |
| Tier 3 phrase clustering | strict | strict | strict | **extra strict** | relaxed | skip | strict |
| Future-narrative closers | strict | strict | strict | **extra strict** | skip | skip | strict |
| Hedge-stacked predictions | strict | strict | relaxed ("could" is hedged accuracy) | **extra strict** | relaxed | skip | relaxed |
| Real/actual inflation | strict | strict | strict | **extra strict** | relaxed | skip | strict |
| Tics: Cut band | strict | strict | strict | **extra strict** | strict | relaxed (validating openers + count announcements only) | strict |
| Tics: fragment stack | skip (short-form) | strict | strict | strict | strict | skip | **extra strict** (see cadence note) |
| Tics: options-plus-verdict | strict | strict | strict | strict | relaxed (decision tables are real) | skip | relaxed (memos do carry decisions) |
| Tics: bold lead-in bullets | relaxed (bold hooks OK) | strict | strict | strict | relaxed (parameter lists) | skip | **extra strict** |
| Tics: bold lead-in paragraphs | skip (short-form) | strict | strict | strict | relaxed | skip | **extra strict** |
| Tics: verdict closer | relaxed | strict | strict | strict | strict | skip | **extra strict** |
| Tics: unification claims | strict | strict | strict | strict | strict | skip | **extra strict** |
| Tics: persona vignettes | relaxed | strict | strict | strict | relaxed | skip | **extra strict** |
| Same-cardinality announcements | skip (short-form) | strict | strict | strict | relaxed | skip | **extra strict** |
| Missing human referents | skip | skip | skip | relaxed | skip | skip | strict |

**Technical-blog word table exceptions:** These terms have legitimate technical meaning and should not be flagged in technical context: `robust`, `comprehensive`, `seamless`, `ecosystem`, `leverage` (when discussing actual platform leverage/APIs), `facilitate`, `underpin`, `streamline`. Still flag: `delve`, `tapestry`, `beacon`, `embark`, `testament to`, `game-changer`, `harness`.

**"Extra strict"** means: flag even borderline instances. In investor emails, a single "thriving ecosystem" can undermine the whole message.

**"Skip"** means: don't audit this category for this profile. The rule doesn't apply or isn't worth the edit.

### Internal-memo cadence

The general rhythm advice in this file is calibrated for blog prose: mix 3–8 word sentences with 20+ word ones, use fragments, break the metronome with a hard stop. Applied to a memo, that advice makes the writing worse and, at this point, more machine-sounding — punchy fragments are now the assistant's signature move in exactly this genre.

A business memo runs a longer narrative cadence, and the unit that matters isn't the sentence. It's the complete thought. A sentence can be long and still read as short prose when it's built by **accumulation** — several complete thoughts set end to end, joined by commas or semicolons, each one checkable on its own. It reads as heavy when it's long by **subordination** — one thought with qualifications hanging off it, so no piece survives being read alone.

That distinction explains the tells better than word count does. A fragment fails because it borrows its subject from the line before it, which is the same defect as a dependent clause with different punctuation. The em-dash reframe fails the same way: the dash appends a qualification to a finished thought instead of starting a new one. And the 15–25 word band that assistant prose keeps landing in is a symptom, not a cause — it's what one independent clause plus attached dependent material weighs.

Run it as a qualitative check on finished sentences, never as a ratio. Break the draft at clause boundaries, one clause per line, and read down the column: every line that can't be understood on its own is a candidate. Two limits. Subordination is sometimes the content — specs and contracts attach conditions to claims because the binding is load-bearing, and flattening those loses meaning. And accumulation becomes its own tic once it's a habit; a comma-joined chain of three short clauses is a recognizable marketing rhythm. What separates real accumulation is that the joined thoughts belong to one movement rather than a list that happened to get commas.

Concretely, for `internal-memo`:
- Fragment stacks are a hard cut, not a rationed device. So is the isolated one-word or three-word sentence used for emphasis. Both fail the completeness test.
- Don't chase length variance by chopping a developed sentence in half. Six 15-word sentences in a row read fine; six alternating 4-word and 30-word sentences read like a LinkedIn post.
- Paragraphs run longer than in blog prose and develop a single point to its end. Don't add one-sentence paragraphs for rhythm.
- Ideas connect explicitly. Memo readers are scanning for decisions and dependencies, so the connective tissue that a blog can imply has to be stated.
- Keep the register even. The blog move of dropping into a punchy verdict for contrast is the verdict-closer tic in this genre.

### Missing human referents

Scoped to `internal-memo`, where it's a strong signal and cheap to check.

A real internal document is written by someone inside an organization to colleagues, and it leaks that: names ("Priya's team already started this"), dates and meetings ("we decided against this in March," "per the Tuesday review"), prior decisions with owners, an unresolved argument with a specific person, a customer named because everyone reading knows the account. Machine-written memos have none of it. They name *roles* instead — "the payments, support, and fulfillment owners," "finance picks it" — which reads as organizational awareness while committing to no actual person.

The signal is strongest in a document that is otherwise densely specific. Pages of exact class names, column names, and figures with zero human referents means the writer had access to the codebase and not to the organization.

Flag when an internal document over ~1,000 words contains no personal names, no dates or meetings, and no references to prior decisions or who made them. The fix is content, not phrasing: the author has to add what they know and the model doesn't. Say so plainly rather than inventing placeholders — this is one of the few flags where the right output is "you need to add three or four specific human facts here," not a rewrite.

### Auto-detection cues

When no context is specified, infer from these signals:

| Signal | Inferred context |
|--------|-----------------|
| Under 300 words + hashtags or mentions | `linkedin` |
| Code blocks, API references, or technical architecture | `technical-blog` |
| Salutation ("Hi [name]", "Dear") + investor/fundraising language | `investor-email` |
| Step-by-step instructions, parameter docs, README structure | `docs` |
| First-person plural about an organization ("we," "our customers"), internal system or team names, proposal/sequencing/open-questions structure, no external audience framing | `internal-memo` |
| No strong signals | `blog` (safest default � all rules apply) |

`internal-memo` beats `technical-blog` when both fire. A design proposal full of code identifiers is still a memo, and the cadence rules differ.

If auto-detection feels wrong, say which profile you're using and why. The user can override.

---


## Voice profiles

Context profiles (above) set *how strict* to be for an audience. Voice profiles set *how the prose should sound* — the persona. They're independent axes: you can write blunt for a blog or warm for docs. Voice is **optional** — if the writer doesn't name one, infer it from the input's existing register and don't impose a persona on text that already has one.

Each profile is a set of concrete targets, not a vibe:

**`casual`** — Contractions throughout; their absence reads stiff. Short sentences (aim for ≤14 words on average); fragments allowed. At least one first-person or concrete-anecdote touch. Near-zero jargon. Keep warm hedges ("honestly," "I think") but cut corporate ones ("it's worth noting"). *Blog posts, social, community.*

**`professional`** — Active voice for most sentences. Vary sentence length; avoid three in a row within a few words of each other. One concrete claim per paragraph (a number, a name, a date), never "experts say." Make the ask explicit. Low tolerance for hedging. *LinkedIn, investor email, sponsor pitches.*

**`technical`** — Prefer plain copulatives ("X is Y") over inflated substitutes ("serves as," "stands as a testament to"). One idea per sentence; imperative mood for instructions. Jargon is fine, but define it on first use. Tables and lists only where the content is genuinely list-shaped, not for decoration. *Docs, technical blog.*

**`warm`** — Address the reader directly ("you") and acknowledge them at least once. Cut intensifiers ("very," "truly," "incredibly") in favor of stronger verbs. No performative-empathy openers ("I completely understand how you feel"). Medium sentences (15–20 words) for an unhurried cadence. *Mentorship, onboarding, thank-yous.*

**`blunt`** — Lead with the claim; cut "It's important to note that" windups. Em-dashes are rare here; use periods for emphasis. No padding to hit a rule of three. Near-zero hedging; flag "may / could / potentially" stacks. Short declaratives, with the occasional long sentence for contrast. *Decision memos, thought leadership, hard feedback.*

**Calibrate to a sample (optional).** If the writer gives you a sample of their own writing ("match my voice — here's a post"), analyze its sentence-length pattern, contraction rate, paragraph openings, and recurring word choices, then match those instead of a named profile. Don't "upgrade" their vocabulary: if they write "stuff" and "things," keep that register.

**How voice composes with context.** Voice sets the target; context sets how hard to enforce it. A voice *target* always applies, even where a context profile would skip that category — `technical` voice still prefers plain copulatives in a `casual` context that otherwise ignores copula avoidance. Where both axes govern the same rule and agree, they reinforce: `blunt` voice wants near-zero em-dashes and a `blog` context is already strict on them, so it stays a hard edit. Where they disagree, resolve toward the **stricter** of the two — a `warm` voice on `docs` still doesn't get decorative tables. Sensible default pairings: casual↔casual, professional↔linkedin/investor-email, technical↔docs/technical-blog.

---

## Output format

### Rewrite mode (default)

Return your response in four sections:

**1. Issues found**
A bulleted list of every AI-ism identified, with the offending text quoted.

**2. Rewritten version**
The full rewritten content. Preserve the original structure, intent, and all specific technical details. Only change what the guidelines require.

**3. What changed**
A brief summary of the major edits made. Not every word, just the meaningful changes.

**4. Second-pass audit**
Re-read the rewritten version from section 2. Identify any remaining AI tells that survived the first pass — recycled transitions, lingering inflation, copula avoidance, filler phrases, or anything else from the categories above. Fix them, return the corrected text inline, and note what changed in this pass. If the rewrite is clean, say so.

Check the Cut band of Assistant rhetorical tics specifically, because rewriting *introduces* these. Replacing a flagged word with a "sharper" sentence is exactly the move that produces "The tell is…" and "it isn't just X — it's Y" where the original had neither. Run the detection heuristic on the rewrite, not just on the source.

### Detect mode

Return your response in two sections:

**1. Issues found**
A bulleted list of every AI-ism identified, with the offending text quoted. Group by severity (P0, P1, P2).

**2. Assessment**
For each flag, note whether it's a clear problem or a judgment call. Some AI-associated patterns are effective writing techniques — uniform paragraph length is a problem, but a well-placed "however" isn't. Call out which flags the writer should definitely fix vs. which ones are worth a second look but might be fine in context. If the text is clean, say so.

### Edit mode

After editing the file in place, return a short report — not the full file:

**1. Edits made**
A bulleted list of the changes, each with the file location and the before → after. Only the spans you touched.

**2. Verification**
Confirm you re-read the file and the flagged patterns are resolved. Note anything you deliberately left alone because it was already human or intentional.

---

## Tone calibration

The goal is writing that sounds like a person wrote it. Direct. Specific. The writing should demonstrate confidence, not assert it.

Five principles for human-sounding rewrites:
1. **Vary sentence length** — mix short with long. Fragments are fine.
2. **Be concrete** — replace vague claims with numbers, names, dates, or examples. Necessary, not sufficient: a document can be concrete in every sentence and still read as machine-written, because the tells are shapes and shapes survive concreteness. Concreteness earns the rewrite nothing on its own; check the structural counts too.
3. **Have a voice** — where appropriate, use first person, state preferences, show reactions.
4. **Cut the neutrality** — humans have opinions. If the piece is supposed to take a position, take it.
5. **Earn your emphasis** — don't tell the reader something is interesting. Make it interesting.

If the original writing is already strong, say so and make only the necessary cuts. Don't over-edit for the sake of it.

The replacement table provides defaults, not mandates. If a flagged word is clearly the right choice in context, preserve it.