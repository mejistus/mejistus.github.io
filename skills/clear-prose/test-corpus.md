# Calibration corpus

Fixture for `clear-prose`. Run the skill against this file and compare against the expected-flags table. Part 1 should trip each fault. Part 2 should pass untouched.

The passages are written for this file. The examples in SKILL.md are deliberately different sentences, so a pass here means the rule generalized rather than matched its own example.

## Part 1 — should flag

**1.** An evaluation of the retry policy was conducted, and a recommendation for its removal was made to the platform team.

**2.** The billing reconciliation is now in the nightly job.

**3.** The webhook signature path is verified.

**4.** The delay comes from the invoice-render dispatch layer, which holds requests at the tenant-quota admission point until a slot opens.

**5.** The rollback posture was the wrong fit for a schema change of this size, and the dual-write approach gives us a safer vehicle.

**6.** Turning on compression already buys 12% on egress.

**7.** Same results, same latency within 5%, and memory is 310 vs 280 MB.

**8.** We pulled 2,000 orders from last Tuesday, replayed them against both builds, and compared the receipts line by line; the new build rounded the sales tax wrong on 14 of them, so we're holding the release.

**9.** Nothing is blocked on anything except the vendor's answer, so I won't take further action until they reply.

**10.** Weekly update:
- Ingest pipeline: backpressure posture hardened
- Dedup stage: merge-key normalization landed, buys ~20% on storage
- Next: shadow-traffic soak on the replay rig

### Expected flags

| Passage | Fault | What should be named |
|---|---|---|
| 1 | Hidden actors and actions | *evaluate* and *recommend* are nouns; the actor is missing |
| 2 | Hidden actors and actions | "is now in" hides who moved it and what that involved |
| 3 | Hidden actors and actions | agentless verdict: verified by whom, against what |
| 4 | Names the reader wouldn't use | invented compounds ("invoice-render dispatch layer," "tenant-quota admission point") |
| 5 | Names the reader wouldn't use | abstract nouns for a claim ("posture," "fit," "vehicle") |
| 6 | Names the reader wouldn't use | verb with a budget ("buys 12%") |
| 7 | Names the reader wouldn't use | unanchored comparisons (which results, which side is which) |
| 8 | Buried point | the decision (holding the release) is the last clause |
| 9 | Buried point | non-event in a double negative; the point is "waiting on the vendor" |
| 10 | Names the reader wouldn't use | a report written as fragment bullets still gets the full check: "backpressure posture," "buys ~20%," "the replay rig" |

Each passage should produce one finding. Passage 1 has two nominalizations in one sentence; reporting them as two separate faults is a counting error.

## Part 2 — should not flag

Nothing below should raise a flag. Each passage sits close to a fault without committing it.

Backups are taken every six hours and copied to a second region. If a copy fails, the job is retried twice and then paged to whoever is on call.

The deployment finished at 14:10. The rollout took longer than planned because the canary held at 5% for an extra hour while we watched error rates.

Set `max_idle_connections` lower than the database's connection limit, or the pool will exhaust it during a traffic spike. The connection pool timeout is separate and controls how long a request waits for a free connection.

The fix landed Tuesday. Since then, the queue depth alarm hasn't fired once, and the p95 checkout latency is down from 900 ms to 610 ms on the new build.

The query planner chose a sequential scan because the statistics were stale. Running `ANALYZE` on the table fixed it.

We're not shipping the export feature this quarter. Two customers asked for it, both are on annual contracts that renew in Q3, and the work is about six weeks.

**Question 4: Tell me about a launch that slipped.**

Listen for:
- Early risk identification and escalation timing
- Scope negotiation with stakeholders rather than silent deadline absorption
- Post-launch retrospective ownership

Red flags: blame externalization, vague timeline recall, no stakeholder communication cadence.

### False-positive traps in Part 2

- Passive voice where the actor is a system or irrelevant ("are taken," "is retried") — paragraph 1.
- Nominalizations that name known events ("the deployment," "the rollout") — paragraph 2.
- Standard technical compounds ("connection pool timeout," "queue depth alarm," "query planner") — paragraphs 3 to 5.
- Ordinary figurative verbs ("the fix landed," "the canary held") — paragraphs 2 and 4.
- A comparison anchored on both sides ("from 900 ms to 610 ms on the new build") — paragraph 4.
- Point first, then reasons — paragraph 6.
- Interview-rubric shorthand: noun stacks and nominalizations ("escalation timing," "silent deadline absorption," "blame externalization") are the expected form in a rubric, checklist, or scoring guide, read by someone who already knows the context — the Question 4 block.
