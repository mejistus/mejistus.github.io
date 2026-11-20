---
name: cold-reader-docs
description: >-
  Write documents derived from a conversation so they stand alone for readers who were not part of that conversation. Use this skill whenever the user asks for a doc, memo, writeup, PRD, spec, announcement, email, or summary after discussing the topic in chat — any phrasing like "write this up", "turn this into a doc", "draft a memo on this", or "put this in a document" after a back-and-forth about an idea. Trigger even when the user doesn't mention audience: the default audience for any document is people who were not in the conversation.
---

# Cold-Reader Docs

## The problem this solves

When a document is written from a conversation, conversational residue leaks into it: oblique references to things said earlier, analogies coined mid-chat used without setup, the user's vivid phrases treated as terms of art, decisions presented as "what we discussed." The requester can follow all of it because they were there. Nobody else can.

A real example of the failure: during a chat, the user used an analogy about building a chicken coop vs. buying one. The resulting document said "it's like the chicken coop" — no setup, no explanation. Worse, the analogy wasn't needed in the document at all. It was a thinking tool from the conversation, not content. The failure mode underneath: treating the conversation's memorable phrases as important artifacts to preserve, when they are usually scaffolding to discard.

## The core principle

The conversation is source material for **ideas**, not source **text**. Extract the conclusions, decisions, and reasoning; discard the verbal artifacts that got you there. The document's audience is a cold reader: someone with zero knowledge of the conversation and, often, only general awareness of the topic. The requester already knows what was said — the document exists for everyone else.

## Drafting discipline

Before writing, extract from the conversation a plain list of what the document must convey: the claims, the decisions, the reasoning behind them, the open questions. Write the document from that list, not from the transcript. This one step prevents most leakage, because phrases and analogies don't survive the extraction — only meaning does.

While writing:

- **State conclusions directly.** "We'll use per-request pricing" not "as we discussed, per-request pricing makes more sense." The conversation is not an authority a cold reader can consult; the document must carry the reasoning itself.
- **Introduce everything on first use.** Names, projects, systems, acronyms, and terms that were established in chat don't exist for the reader. Define them or cut them.
- **Treat conversation-coined analogies and phrases as suspects, not assets.** For each one, ask: does the document's argument need it? Usually no — drop it. If it genuinely earns its place, rebuild it from scratch in the document with full setup, as if it had never been said before.
- **Labels you coined while doing the work leak the same way.** Debugging, benchmarking, or building something produces shorthand: "the clone," "the warm-regime gap," "the knobs," "lab-check it." Nobody said these in chat; you made them up to keep track, and they feel like established terms because you've used them a dozen times. A reader has never seen any of them. Replace each with what it refers to ("the CUDA reimplementation," "the latency gap after the cache is warm"), or define it once if the document uses it repeatedly.
- **No deixis pointing outside the document.** "This approach," "that problem," "the earlier point" must resolve to something in the document itself, never to something in the chat.
- **Reasoning over recap.** Present positions with their justification, not as outcomes of a discussion ("after going back and forth, we landed on…"). The reader doesn't care about the journey of the conversation; they care whether the position is sound.

## The cold-reader audit (mandatory)

Leakage is hard to prevent and easy to detect, so after drafting, do a separate pass. Re-read the entire document simulating a reader who has never seen the conversation and is only generally aware of the subject. For each sentence, ask:

1. Does understanding this require having been in the conversation?
2. Does every term, name, and acronym get introduced before it's relied on?
3. Does every pronoun and pointer ("this," "that," "the above") resolve within the document?
4. Is any phrase here only because someone said it in chat — a pet phrase, an analogy, a joke — rather than because the document needs it?
5. Is any term here one I invented while doing the work, which appears nowhere in the code, the docs, or the reader's field?
6. If a paragraph were quoted alone in an email, would it still make sense?

Fix everything the audit catches, then re-read once more. Only deliver a document that passes clean.

## What this skill does not mean

This is not a mandate for stiff or exhaustive writing. The document should still match the user's voice and the appropriate register (a Slack memo is not a whitepaper), and it should not bloat with background the intended audience already has by role — engineers reading an internal spec know what an API is. The bar is: no knowledge *from this specific conversation* may be required to understand the document.
