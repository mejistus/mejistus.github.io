---
name: clear-prose
description: "Sentence-level clarity pass for prose that's grammatical and specific but still hard to follow. Use when a draft makes the reader work to find who did what, when asked to 'make this clearer', 'this is confusing', 'I can't tell what this is saying', 'this is hard to follow', or 'say it plainly', and on drafted status updates, PR descriptions, incident write-ups, and technical reports, where these faults are most common. Finds hidden actors and actions, invented names for ordinary things, and points buried behind their evidence. Runs inside writing-pipeline, after the cold-reader audit and before the AI-ism pass."
---

# Clear prose

Some writing is hard to read even though every word is plain and every fact is specific. Readers can parse each sentence and still can't say what happened, who did it, or what they're supposed to do about it. A vocabulary cleanup won't fix this, because the fault is in how each sentence assigns its words their jobs.

This skill checks three things in every sentence: whether the actor is the subject and the action is the verb, whether each thing is called what the reader would call it, and whether the point arrives before the support for it.

The framework is Joseph Williams's, from *Style: The Basics of Clarity and Grace* (Williams and Bizup). The three-fault breakdown and the finding that these faults, not vocabulary tells, are what make AI prose hard to read come from Zonder Labs, "Why is AI Slop so Frustrating to Read?" (zonderlabs.com/slop, November 2026). They report an unclear rate of 78% for Claude Code samples against 11% for Stack Overflow, and 54% for AI-written articles against 10% for human-written ones. That's why this skill names status updates and PR descriptions in its triggers.

## How to run it

Work sentence by sentence. For each one, answer three questions.

**1. Who does what?** Name the actor and the action in your own words. Then look at the sentence's subject and main verb. If they match, move on. If the actor is hiding in a prepositional phrase or missing entirely, or the action is a noun instead of a verb, that's a hidden-actor fault.

**2. Would the reader call it that?** For each noun phrase, ask whether it appears in the code, the docs, the field's ordinary vocabulary, or something the reader has already been told. If it doesn't, it's a name the writer invented, and the reader has to reverse-engineer it.

**3. Where's the point?** Read the first clause of each paragraph by itself. It should carry the thing the reader needs: the result, the decision, the problem. If it carries setup, evidence, or a qualification instead, the point is buried.

Then rewrite only the sentences that failed. Most sentences in most drafts pass all three questions.

**Skip the fragments in rubrics, checklists, and scoring guides.** These are tools a reader uses while doing a job they already understand: the interviewer scoring an answer, the reviewer working through a checklist. Their lines are noun fragments on purpose, and "escalation timing" or "blame externalization" is the expected form there, not an invented compound. Check the full sentences around the list, including any sentence that introduces it.

Reports written as fragment bullets get the full check. A status update, summary, or changelog in bullets ("Eviction path validated," "Lazy-load knobs: +8%") is telling the reader something new, and its reader wasn't there for the work.

## Fault 1 — hidden actors and actions

The action has been turned into a noun, and the actor has been dropped or pushed into a prepositional phrase.

- **Nominalized actions.** "Determination of the root cause was made after an examination of the flame graphs." The actions are *determine* and *examine*; the actor is whoever did them. → "The flame graphs showed the root cause." or "I found the cause in the flame graphs."
- **"Is now" hiding the work.** "The per-tenant structure is now in the service" hides two actions: someone built the structure, and someone moved it into the service. Name them if the reader needs to know they happened.
- **Agentless verdicts.** "The eviction path is validated." Validated by whom, against what? A claim of verification without an actor or a method asks for trust the sentence hasn't earned. → "The eviction tests pass against production traffic replay."
- **Requests and decisions as nouns.** In a story about a duck at a lemonade stand, "A request for grapes was made upon arrival" → "The duck walked up and asked for grapes." "A decision was reached to defer" → "We decided to defer."

**Keep the passive when the actor doesn't matter or is a system.** "Logs are rotated nightly." "The request is retried once against a different replica." Nobody reading an operations doc needs to be told that cron rotates the logs. The test is whether naming the actor would tell the reader something they need. If it wouldn't, the passive is the clearer sentence.

**Keep nominalizations that are names of things.** "The migration finished in March" is fine: *the migration* is a known event the reader can point to, not an action dissolved into a noun.

## Fault 2 — names the reader wouldn't use

Zonder Labs found this the most common fault in Claude Code output. It's also the hardest for the writer to see, because the invented name made sense while the writer was producing it.

- **Inflated category nouns.** Calling a thing by an abstract category it belongs to instead of its name. A lemonade stand becomes a "beverage retailer"; a check that runs before login becomes a check that "sits at the user-session entry boundary." Ask what a colleague would call it out loud, and use that.
- **Invented compounds.** Two or three nouns stacked into a phrase that isn't a term anywhere: "shared-map instantiation," "request-fanout boundary," "hot-key protection posture." Unstack it into a clause that says what happens: "every writer goes through one shared map, so writes queue up there." Compounds that *are* terms stay: "connection pool timeout" and "read-replica lag alarm" are what an engineer would search for.
- **Abstract nouns standing in for a claim.** "Story," "posture," "shape," "surface," "vehicle," "regime." "The gap is purely a lock-contention story" → "Lock contention causes the whole gap." "The design was the wrong shape for this traffic" says something was wrong without saying what. If the writer doesn't know what, the sentence shouldn't pretend to.
- **Verbs that give objects intent or a budget.** "The first knobs already buy 8%." "This gives us a controlled vehicle." Settings don't buy things. → "Changing the first two settings cut cold-start time by 8%." Ordinary figurative verbs that everyone uses ("sharding will close the gap," "the fix landed") are fine. The ones to fix are those a reader has to translate.
- **Unanchored comparisons.** "Same numbers within 3%." Which numbers, compared with what? "p99: 41 vs 28 ms" — which side is the new code? Name the quantity and both sides of every comparison.

Labels the writer coined while doing the work ("the clone," "knobs," "lab-check") are a cold-reader problem first: `cold-reader-docs` covers them. If they survive that pass, treat them as this fault.

## Fault 3 — buried or empty points

Every word is clear, and the reader still can't find the point.

- **Evidence before claim.** A paragraph that walks through what was measured before saying what it means makes the reader hold the details without knowing what they're for. Lead with the result; follow with how you know.
- **Point inside a modifier.** "One negative finding: the prefetch hint is harmful on this hardware and crashed once, so it is out." The decision (dropped the prefetch hint) is the last clause. → "I dropped the prefetch hint. It hurt performance on this hardware and crashed once."
- **Sentences that describe a non-event.** "Nothing else depends on anything but the result, so I'll report as soon as the poll returns." The reader has to decode a triple negative to learn that nothing is pending. → "I'll report the result when the poll finishes."

## What the output looks like

For each failed sentence, give the span, which of the three faults it is, and a rewrite. When the fix needs a fact only the author has (which number belongs to which version, what "wrong shape" meant), don't invent it. Put the question in brackets in the rewrite: "[author: which of these is the new layer?]".

If a draft passes, say so in one line. Don't rewrite sentences that passed to make them sound different.

## Where this sits

`writing-pipeline` runs this after `cold-reader-docs` and before `avoid-ai-writing`. The cold-reader pass decides what the document has to say to a stranger. This pass makes each sentence say it in the order and words a reader can follow. Both write new sentences, so the AI-ism pass runs after them, on the prose that will actually ship.

`test-corpus.md` in this directory is the regression fixture: Part 1 should trip each fault, Part 2 should pass untouched. Run both after changing this file.
