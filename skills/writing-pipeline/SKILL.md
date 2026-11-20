---
name: writing-pipeline
description: "The checking sequence to run after drafting any document. Use this after writing or substantially revising a memo, blog post, PRD, spec, email, Slack message, GitHub issue, report, README, announcement, or any other prose deliverable, wherever it's written (a file, a document or notes tool, a published page, a message draft), and whenever asked to 'check this document', 'run the writing checks', 'is this ready to send', or 'clean this up before I publish'. Orders the length cut, the cold-reader audit, the clarity pass, and the AI-ism pass, says which runs first and why, and defines what counts as done."
---

# Writing pipeline

Drafting is the first half of the job. This is the second half: four checks that run on every document before it goes anywhere, in a fixed order, with a re-read at the end.

## When this runs

After any prose deliverable is drafted or substantially revised, whether it goes into a file, a document tool, a published page, or a draft message. Memos, posts, PRDs, specs, emails, Slack messages, issues, reports, READMEs, announcements, release notes, PR descriptions. A short message drafted for someone else counts. It does not run on code, config, commit messages, or your own conversational replies to the user.

If you drafted the document in this session, run the pipeline before handing it over. Don't wait to be asked, and don't announce that you're about to run it. Run it, then report what changed.

## The order

Run `concise` first, then `cold-reader-docs`, then `clear-prose`, then `avoid-ai-writing`. The order matters and isn't arbitrary.

The length cut decides *what's in the document at all*. It removes whole sentences and sections the reader doesn't need, so nothing after it spends effort on text that's about to go. The cold-reader audit changes *what the document says*. It adds definitions the draft assumed, resolves pointers that reached back into the conversation, and cuts analogies that were thinking tools rather than content. The clarity pass changes *how each sentence is built*. It moves actors into subjects and actions into verbs, replaces invented names with the ones a reader would use, and puts the point before its evidence. The cold-reader and clarity passes both write new sentences, and new sentences carry new machine tells.

The AI-ism pass changes *how the document sounds*. Running it earlier means editing prose that the earlier passes are about to cut or rewrite, and the tells reappear in the replacement text. So: cuts first, then what the remaining text says, then sentence structure, then surface.

The cold-reader and clarity passes add words. They define terms and unpack compressed phrases, and without a check they'll turn a 40-word reply into a 200-word one. The length after step 1 is the budget. Later steps can spend a little of it on definitions and plain wording, but they don't restore what step 1 cut.

### Step 1 — length cut

Apply `concise`. Name the reader and what they asked, put the answer in the first sentence, and cut every sentence the reader wouldn't miss. Cut whole sentences; don't compress the ones that stay. Work on the draft as it stands: don't rewrite it short and call that the cut. Record the word count before and after, and the ceiling `concise` gives for this document type. If the result is over the ceiling, cut again before moving on. Later steps measure against this number, so the step isn't done until it's written down.

### Step 2 — cold-reader audit

Apply `cold-reader-docs`. Re-read the whole document as someone with no knowledge of the conversation that produced it and only general awareness of the topic. Fix every term used before it's introduced, every pointer that resolves outside the document, every conclusion presented as "what we discussed." Define only what this reader wouldn't know. An engineering team reading an engineering update knows ALB, N+1, and OOM; defining them for that reader is padding.

### Step 3 — clarity pass

Apply `clear-prose`. For each sentence, check that the actor is the subject and the action is the verb, that each thing is called what the reader would call it, and that each paragraph leads with its point. Most sentences pass. Rewrite only the ones that don't.

### Step 4 — AI-ism pass

Apply `avoid-ai-writing` to the result. Let it pick the context profile from the document, or set one if you know the audience. A memo and a blog post get different cadence rules, and using the wrong profile makes the writing worse rather than better.

Take the substantive catches. Keep the things that section names as genuine voice.

Two of its rules would undo the clarity pass, so they don't apply to what steps 1 through 3 produced:

- **Point-first openings stay.** The paragraph-shape rule flags documents where most paragraphs state their thesis in the first few words. When an earlier step moved a result or decision to the front of its paragraph, leave it there. Apply the shape rule to the closing sentences only.
- **`[author: …]` questions stay.** The unfilled-placeholder rule says to fill or delete bracketed slots. The questions the clarity and cold-reader passes leave are not template residue; they're facts only the author has. Don't fill them in or delete them. List them for the author in your report.

### Step 5 — read it again

Read the finished document start to finish, in order, as prose rather than as a checklist target. This catches the failure the first four steps create: an edit that fixed a flagged span and broke the paragraph around it, a definition inserted where it interrupts the argument, a transition that stopped connecting once the sentence before it changed.

Compare the length with the count from step 1. If the document has grown by more than the definitions and rewordings the later passes needed, or is now over the ceiling, one of them brought back material the cut removed. Find it and take it out again. Report both counts with what you changed.

## What done looks like

The document is done when it's no longer than its reader needs, a reader outside the conversation can follow it, no flagged pattern survives that wasn't deliberately kept, and it still reads as one piece of writing rather than a repaired one. Report what you changed and anything you left alone on purpose. Name the checks that ran. A check done from memory, without loading its skill, isn't that check; if that's what happened, say so rather than reporting it as run.

## Scope limits

All four checks are editing tools, not rewriting mandates. If the draft is already strong, the right output is a short note saying so and a handful of cuts.

None of them should broaden the argument. They fix what the document says and how it reads, not what it claims. If a check surfaces a gap in the reasoning, say so rather than filling it — that's a decision for whoever owns the document.

Quoted material, code blocks, and text attributed to someone else are out of scope for every pass. Flag problems there instead of editing them.
