# Calibration corpus

Fixture for `avoid-ai-writing`. Run `detect` mode against this file and compare against the expected-flags table.

The self-reference escape hatch in SKILL.md does **not** apply here. Part 1 is unquoted prose deliberately written to trip rules; treat it as ordinary input.

## Part 1 — should flag

**1.** We rebuilt the importer from scratch. No sign-ups, no downloads, no configuration, no hassle.

**2.** The reviewer read the draft twice. Did not flinch, did not blink, did not reach for the red pen.

**3.** Don't call it a rewrite. Call it a rescue. Consistency is the entire game here, and that's the whole point of the redesign.

**4.** The gains were modest. That's not nothing.

**5.** Turns out nobody reads the changelog. It turns out that the release notes were the only documentation anyone opened.

**6.** Sit with that for a moment. You already know the answer, and that loss is worth naming.

**7.** The old importer is dead. Long live the CSV endpoint. That's why the export button mattered.

**8.** The tool died; the data didn't. Reading mostly passed. Writing didn't.

**9.** Attendance stayed steady through the quarter, reflecting the appeal of the collection and underscoring the team's commitment to accessible programming.

**10.** The core is small enough to fit in your head. Batteries included, sane defaults, zero config. It just works.

**11.** Do I regret shipping it? Do I miss the old importer? Do I want it back?

**12.** Maybe nobody needed the importer. Maybe the shortcut confused people. Maybe the redesign was overdue all along.

**13.** The launch needed three things: a blog post, a demo video, and a pricing page.

**14.** I won't pretend the rollout was smooth. Look, the schedule slipped twice. Honestly, that was predictable.

**15.** This is the only estimate I trust, and you don't have to take my word for it.

**16.** Option B costs more in risk than code. All it costs is a quick conversation with the on-call lead to find out which one is true.

### Expected flags

| Passage | Pattern | Section |
|---|---|---|
| 1 | Negated chains (4 items) | Ration |
| 2 | Negated chains (3 items) | Ration |
| 3 | Don't-VERB-it mirror; wholeness verdicts (×2) | Cut |
| 4 | "That's not nothing" | Cut |
| 5 | "Turns out…" (×2) | Cut |
| 6 | Therapist register (×3) | What to remove or fix |
| 7 | "X is dead" / "long live X"; "That's why X mattered" | Cut |
| 8 | Stranded auxiliary contrast (×2) | Cut |
| 9 | Participle sentence tails (×2) | What to remove or fix |
| 10 | Tech-marketing boilerplate (×4) | What to remove or fix |
| 11 | Stacked rhetorical questions (3) | Rhetorical question openers |
| 12 | Repeated sentence openers (3) | Ration |
| 13 | Colon into a triple; inline count announcement | Sentence structure / Cut |
| 14 | Performative honesty (×3) | Sentence structure |
| 15 | Superlative anointing, narrowing variant; "don't take my word for it" | Cut |
| 16 | "Costs" as a verdict (×2) | Cut |

Passage 3 is also the dedup test. Three rules cover overlapping spans in twelve words. Per the detection heuristic, the density count takes the longest-covering span and drops the rest — reporting three separate hits there is a bug in how the counts are being run, not three findings.

## Part 2 — should not flag

Nothing below should raise a flag. Every one of these passages sits close to a rule in SKILL.md without tripping it.

The migration ran over two weekends. We moved 41 tables in the first pass and the remaining 9 in the second, mostly because `shipment_legs` had a foreign key we'd forgotten about and untangling it took most of Saturday.

Three things have to be true before a refill goes out: the prescription has to be active, the pharmacy has to have the drug in stock, and the patient's plan has to cover the quantity. Miss any one and the refill waits for a pharmacist, which is the behavior we want.

I don't know why the old importer was written this way. Neither does anyone still on the team. The commit message says "fix," the ticket it references was deleted in a Jira migration in 2021, and the person who wrote it left before I joined. So we kept it, wrapped it in tests, and moved on.

Cost is the reason. Cost is also the reason the second version looks the way it does — we could afford one round trip per request and not two, and everything else followed from that.

Marisol asked whether we should have caught this in review. Probably. The diff was 900 lines and three of us approved it in under an hour, which is not review, it's assent.

One set of design decisions, one API shape, one bar for quality. That was the pitch when we consolidated the SDKs, and eighteen months later it's held up better than I expected, though the Python client still lags the others by about a release.

We'll freeze the schema on the 3rd. We'll cut the release branch on the 5th. We'll ship on the 9th if the soak test is clean.

The interesting failure was in retries. A client that timed out at 30 seconds against a server that gave up at 45 would retry into a request still running, and because the write wasn't idempotent, the second attempt would sometimes succeed against half-applied state. We found it because a customer's invoice line items doubled, not because anything alerted. That's the kind of bug that survives a load test: it needs a specific timeout mismatch, a specific write path, and enough traffic that the overlap happens at all. We fixed the idempotency key first and the timeout ordering second, and I still think the ordering fix is the one that would have prevented it.

### False-positive traps in Part 2

- Colons that open onto clauses, not a bare list: conditions stated as full clauses (paragraph 2) and a clause containing the list (paragraph 8). These pass in every profile, including `internal-memo`, which is what auto-detect picks for this file.
- Correct em dash use (paragraph 4).
- Within-sentence anaphora, protected by the Keep band (paragraph 6).
- Deliberate word repetition — "Cost is the reason. Cost is also the reason" (paragraph 4). Literal, not comparative, so it doesn't trip "costs" as a verdict either.
- Flat operational sequencing (paragraph 7).
- A long teaching paragraph that develops one idea (paragraph 8).
- "The interesting failure was in retries" — reads like emotional flatline, but the sentence names the subject rather than pre-announcing significance, and specifics follow immediately.
- Named identifiers and exact figures throughout, which a restructuring pass tends to lose.
