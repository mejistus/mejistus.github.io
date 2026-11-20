# Calibration corpus

Fixture for `concise`. Run the skill against each passage and compare against the expected table. Part 1 should come back substantially shorter with nothing the reader needs lost. Part 2 should come back essentially unchanged.

Each passage says who it's for and what prompted it, because length can only be judged against the request.

## Part 1 — should be cut

**1.** Reply to Marcus, who emailed: "Could you review my launch plan by Wednesday?"

> Hi Marcus,
>
> Thank you for sending over the launch plan and for thinking of me as a reviewer. I know how much work goes into a document like this, and I'm glad to help however I can.
>
> I've checked my schedule for the week, and I'll be able to review the plan by Wednesday as you requested. I'll plan to read through it carefully and leave my comments directly in the document so they're easy to find.
>
> In short: yes, I can have my review done by Wednesday. If you need it any sooner, or if there's a particular section you'd like me to focus on, just let me know and I'll do my best to accommodate.
>
> Best,
> Jo

**2.** Slack reply to a teammate who asked: "Is staging unblocked yet?"

> So I dug into this for most of the morning. First I checked whether the deploy pipeline itself was healthy, and it was. Then I looked at the staging database and noticed the migration lock from Friday's failed deploy was never released. I tried releasing it through the admin tool, but that timed out, so I connected directly and cleared the lock row by hand. After that I re-ran the stuck migration, which completed in about four minutes, and then redeployed the current main branch. Everything came up healthy and the smoke tests pass. So yes, staging is unblocked now. Let me know if you see anything weird!

**3.** GitHub issue for the team's tracker.

> **Summary**
> This ticket covers an issue with password reset emails.
>
> **Background**
> Password reset emails are sent when a user clicks "Forgot password" on the login page. They are an important part of account recovery.
>
> **Problem**
> Password reset emails sent to Outlook.com addresses arrive 20 to 40 minutes late. Gmail and other providers receive them within seconds.
>
> **Steps to reproduce**
> 1. Request a password reset for an Outlook.com address.
> 2. Note the time the email arrives.
>
> **Expected:** the email arrives within a minute.
> **Actual:** it arrives 20 to 40 minutes later.
>
> **Possible causes**
> This could be caused by a number of factors, including sender reputation, rate limiting on Microsoft's side, our email provider's routing, or DNS configuration. More investigation is needed.
>
> **Impact**
> Users with Outlook.com addresses may have a frustrating experience when trying to reset their passwords.
>
> **Next steps**
> Investigate and fix.

**4.** Memo to all staff from the office manager.

> Subject: Update regarding office access
>
> Hi everyone,
>
> The purpose of this memo is to share an important update about office access that will affect everyone who works from the office.
>
> As many of you know, we've been reviewing our building security procedures over the past few months as part of an ongoing effort to keep everyone safe. As a result of that review, we've decided to make a change.
>
> Starting March 3, the front door will require a badge at all hours, not just after 6pm. If you don't have a badge yet, pick one up from the front desk before then.
>
> To summarize, badges will be required at the front door at all times starting March 3, so please make sure you have yours.
>
> Thanks for your cooperation and understanding!

**5.** Reply to a colleague who asked in chat: "Which region is the new cache cluster in?"

> ## Answer
> The new cache cluster is in **us-east-2**.
>
> ## Details
> - It was provisioned last Tuesday.
> - It replaces the old cluster in us-east-1.
>
> ## Notes
> Let me know if you have other questions about the cluster setup.

**11.** Plain-text email from Wen to Dario, who runs the design team. Sent as plain text.

> Hi Dario,
>
> I hope things are good on your end. We're finalizing the onboarding flow and I wanted to loop you in. Could your team review the new welcome screens sometime soon? The mockups are in the shared Figma file under "Onboarding v4." I'm also not sure the illustrations we're using are licensed for commercial use. We're aiming to start building on the 22nd, so it would be good to have feedback before then. Anyway, if your team could take a look at the welcome screens, that would be really helpful.
>
> Thanks so much,
> Wen

**14.** Status update for the search team, after a day spent on a bug. The request was "write a status update for the team."

> Search results for multi-word queries in the mobile app have been returning empty for about 4% of queries since Monday's release. I tracked it down this afternoon. The tokenizer change in Monday's release started splitting hyphenated words into separate tokens, so "e-bike" became "e" and "bike," and the single-letter token "e" matched the stopword filter, which then discarded the whole phrase query instead of just the stopword. I fixed the stopword filter so it drops only the stopword token. While I was in there, my first version of the fix broke exact-phrase matching for quoted queries, which I caught with the existing phrase tests and fixed before pushing. I also added 6 new test cases covering hyphenated terms, quoted phrases, and mixed queries. All 1,204 tests pass. I replayed 10,000 queries from Tuesday's logs through the old and new code: empty-result rate went from 4.1% to 0.3%, and p95 latency was unchanged at 182 ms. The remaining 0.3% are genuinely empty queries, which matches the rate before Monday. The PR is #2210, and Priya is reviewing it. If it's approved today, it ships in tomorrow's 10am release. I haven't looked at whether the web app has the same issue; it uses a different tokenizer config, so it may not, but someone should check.

### Expected results

| Passage | Should keep | Should cut |
|---|---|---|
| 1 | Yes, by Wednesday; comments in the doc | the thanks paragraph, the restated request, the "in short" summary, the stacked offers |
| 2 | Yes, unblocked; one clause on what was wrong (a stale migration lock) if anything | the morning's step-by-step debugging |
| 3 | problem, repro, expected/actual; "cause not known yet" | Summary, Background, the list of possible causes, Impact, Next steps |
| 4 | badge required at all hours from March 3; pick one up at the front desk | the purpose statement, the review backstory, the summary, the stacked thanks |
| 5 | us-east-2 | the headers and bullets; the provisioning date and the old cluster unless asked |
| 14 | what broke (empty results on hyphenated queries since Monday), the fix, the one before-and-after figure (4.1% to 0.3% empty results), PR #2210 with Priya reviewing, ships tomorrow 10am if approved, the open web-app question with an owner or `[author: …]`; 100 words or fewer | the tokenizer mechanics beyond one clause, the self-introduced phrase-matching bug, test counts, the latency figure, the explanation of the remaining 0.3% |
| 11 | both asks: the review of the welcome screens, and the licensing question turned into a direct question; the Figma location; feedback needed before the 22nd, next to the ask; plain text, no added formatting | the pleasantry, the "loop you in" setup, the repeated review request |

Cutting must never drop an action, a date, an owner, a decision, or a request. A result that loses "comments in the doc," "March 3," or "front desk" is a failure even if it's shorter.

## Part 2 — should not be cut

Nothing below should lose more than a word or two, and nothing should gain formatting. Each passage is already the length its reader needs.

**6.** Reply to the email in passage 1.

> Yes, I'll have comments in the doc by Wednesday.

**7.** Section of an incident write-up for the engineering org.

> Checkout failed for 18% of orders between 09:12 and 09:47 UTC. The 09:10 release changed the tax service client to retry on every 5xx, and the tax service was already shedding load from a partner's batch job, so retries multiplied its traffic about fourfold and it stopped responding. Orders whose tax lookup failed were rejected at payment. We rolled back at 09:44 and checkout recovered by 09:47. The client now retries only on connection errors, with a cap of two, and the tax service has a per-caller rate limit so one client can't take it down for everyone.

**8.** PR description for the reviewers of a change to invoice rounding.

> Rounds each line item to the cent before summing, instead of rounding the total. Fixes invoices that were off by a cent when they had three or more discounted lines.
>
> To check: `make test` covers it. `test_invoice_rounding` has the three cases from the bug report, all of which failed before this change. I also re-ran last month's 41,000 invoices through both versions; 312 totals change, all by one cent, and every changed one matches what the customer's card was actually charged.

**9.** Issue for a tracker read by the whole company, including support and finance.

> The dunning job (the nightly task that emails customers whose payment failed) sent no emails on May 9 or 10. About 140 customers with failed payments weren't notified and may lose service on the 15th without warning. To reproduce: filter failed payments for May 9–10 and check "last reminder sent." Expected: a date. Actual: empty.

**10.** Reply to a teammate who asked: "Can you take the Friday on-call shift?"

> Sure, I'll take it. Thanks for asking early.

**12.** Plain-text message to the finance team from a new hire setting up expenses.

> A few questions before I file my first expense report: 1) Is there a per-diem for meals, or do I submit receipts? 2) Can I book flights myself, or do they go through the travel desk? 3) What's the approval limit before I need a director's sign-off? 4) Are rideshares reimbursable, or only taxis? 5) How long do I have to submit after a trip? 6) Does the company card cover hotel incidentals? 7) Who do I ask if a receipt is lost? Thanks!

**13.** Plain-text email to everyone in the building. Sent as plain text.

> The east parking lot will be closed for repaving from June 2 through June 6. During those days, park in the west lot or the overflow lot on Birch Street; the shuttle from Birch Street runs every ten minutes from 7am to 7pm. Accessible spaces in the west lot are reserved for anyone with a permit. If your car is in the east lot after 8pm on June 1, it will be towed at your expense. Questions to facilities@.

### False-positive traps in Part 2

- An already-short reply (6). Compressing it further into "Yes, Wed." is a failure.
- Dense, necessary detail where every sentence carries a fact the reader uses (7).
- Verification detail kept because the reader is a reviewer (8).
- A definition the reader needs, in a short issue (9).
- One friendly line in a short reply (10). One courtesy isn't padding.
- Seven distinct questions (12). Every one stays; consolidating means merging duplicates, not choosing which questions the author gets to ask.
- Plain text with dates, places, and a deadline (13). It must not gain headings, bold, or bullets: the draft has no formatting, and nothing says where it will be pasted.
