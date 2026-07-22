# PRIME v2 — Fix Plan (Agent-Driven)

**Source:** Live QA pass, 2026-07-22. This plan exists to close every FAIL / NOT VERIFIABLE / Critical / Major item found, then re-run the live proposal-passing test to confirm it actually works end-to-end.

**This is a working file, not permanent documentation.** Once every task below is DONE and the final re-test in Section 8 passes, delete this file from the repo. Don't leave it lying around as stale process debris.

**How to run this:** Hand each numbered task to the Agent role named, using PRIME v2's own Standard AI Task Prompt Template (README §33). Don't let an agent skip straight to code — if a task is ambiguous, the agent should ask before implementing, same as the working rules in README §32.

**Scope note (controller-recorded, 2026-07-22):** PDF export (Critical FAIL) and email notifications (Major FAIL) from the original QA report are deliberately **not** covered by this plan. PDF export has its own plan (`pdf-export-plan.md`, deferred to a later pass). Email notifications remain an open, untracked gap. Task 8's re-test will still show both as FAIL — that is expected and not a regression introduced by this plan.

---

## 0. Ground rules for every agent working this plan

- Do not touch modules unrelated to the task.
- Do not bypass role/permission checks to "make the test pass."
- Do not overwrite submitted proposal versions.
- Do not expose private RTEC comments.
- Do not commit secrets.
- Every fix needs: the code change, a test proving it, and a one-line entry in the "Verified" column below before it counts as done.

---

## 1. CRITICAL — Dependency vulnerabilities

**Agent:** Security Agent (with Refactor Agent for the actual bumps)

**Finding:** `npm audit` on backend prod deps shows 6 unresolved high-severity issues — the `@fastify/ajv-compiler` → `fast-uri` chain, `fast-json-stringify` under Fastify itself, and a `fast-xml-parser` DoS advisory.

**Task prompt:**
```
Business Goal: Eliminate all unresolved high/critical severity dependency
vulnerabilities before this system handles real confidential proposal data.

Task:
1. Run `npm audit` on the backend, list every high/critical finding with
   package, current version, patched version, and whether it's a direct
   or transitive dependency.
2. For each: upgrade directly if a non-breaking patched version exists.
   If the fix requires a major Fastify version bump, flag it — don't
   silently upgrade a framework major version without confirming nothing
   breaks.
3. Re-run the full test suite after each upgrade.
4. Re-run `npm audit` and confirm zero unresolved high/critical findings.
5. If any vulnerability genuinely cannot be resolved (no patch exists
   yet), document it as an accepted risk exception with owner and
   re-check date — do not just leave it silently unresolved.

Constraints: do not upgrade unrelated packages. Do not change application
logic. Testing: full existing test suite must pass after each change.
```

**Verified:** ☐ npm audit clean ☐ test suite passes ☐

---

## 2. CRITICAL — Container restart policy doesn't actually work

**Agent:** DevOps Agent

**Finding:** `restart: unless-stopped` is configured in `docker-compose.yml`, but killing the backend container (`SIGKILL`) left it `Exited (137)` for 13+ seconds with no auto-restart. Manual `docker compose up -d` was required.

**Task prompt:**
```
Business Goal: A crashed service must recover on its own in production,
without a human needing to notice and intervene.

Task:
1. Reproduce the failure: kill the backend container and confirm it does
   NOT restart automatically under the current config.
2. Investigate why `restart: unless-stopped` isn't firing — check
   whether this is a Docker Compose vs. Coolify orchestration mismatch
   (Coolify may manage restart policy differently than raw Compose),
   an exit-code issue, or a health-check misconfiguration.
3. Fix it so a killed/crashed container is automatically restarted.
4. Live-test again: kill each service (backend, frontend, Postgres,
   MinIO) individually and confirm each one self-recovers, with a
   measured time-to-recovery.
5. Document the actual mechanism in the deployment guide (see PDF/docs
   plan for the docs improvement — but at minimum leave a clear comment
   in the compose/Coolify config explaining what recovers what).

Constraints: do not disable health checks to force a false pass. The
fix must be a genuine self-recovery, not a longer timeout before the
next manual check.
```

**Verified:** ☐ backend self-recovers ☐ frontend self-recovers ☐ Postgres self-recovers ☐ MinIO self-recovers ☐ recovery time measured

---

## 3. CRITICAL — No guard against seeding dev accounts into production

**Agent:** Backend Agent + Security Agent

**Finding:** `prisma/seed.ts` has no `NODE_ENV` guard. Nothing stops `npx prisma db seed` from running against a production database and creating working credentials like `admin@dev.local` / the seed password. The dev-only login shortcut is gated, but the seeded password itself would work through the normal staff-login path.

**Task prompt:**
```
Business Goal: It must be technically impossible, not just a matter of
team discipline, to create development test accounts in production.

Task:
1. Add a hard guard at the top of the seed script: if NODE_ENV is
   "production" (or equivalent prod flag used by this deployment), the
   script must refuse to run and exit non-zero with a clear error
   message.
2. Additionally, add a safety check at application startup: if any
   known dev-seed account (e.g. addresses matching a dev-only domain
   pattern) exists in a database where NODE_ENV=production, the
   application must refuse to boot (fail closed, not just warn — this
   is a government compliance system handling confidential review
   data, so a loud warning that can be missed in logs is not enough).
3. Test: attempt to run the seed script with NODE_ENV=production set
   and confirm it refuses.
4. Test: confirm the seed script still works normally in dev/staging.

Constraints: do not weaken the dev-bypass login shortcut's existing
prod-gating — that part already works. This task is specifically about
the seed script and startup check.
```

**Verified:** ☐ seed refuses under NODE_ENV=production ☐ seed still works in dev ☐ startup check added

---

## 4. CRITICAL — No backup/restore documentation

**Agent:** DevOps Agent

**Finding:** The backup/restore mechanism itself works (proved live for both Postgres and MinIO), but there's no doc under `docs/deployment/` telling anyone how to actually invoke it.

**Task prompt:**
```
Business Goal: Someone other than the original developer must be able to
restore the system under pressure, using only the written docs.

Task:
1. Write docs/deployment/BACKUP-AND-RESTORE.md covering:
   - Exact commands to back up Postgres (pg_dump) and MinIO (mc mirror
     or equivalent), matching what was actually used in the live test.
   - Exact commands to restore each, including restoring into a clean
     environment for verification.
   - Expected RTO/RPO and how to verify a restore succeeded (e.g. row
     count checks, object count checks).
   - Who owns this process and how often restores should be test-run.
2. Have someone who did NOT write the backup code follow the doc
   cold and confirm they can complete a restore without asking the
   original developer anything.

Constraints: document what actually works today, not an aspirational
process. If a step requires manual intervention, say so plainly.
```

**Verified:** ☐ doc written ☐ cold-read test passed by a second person

---

## 5. MAJOR — Comment visibility is a 2-value enum, not the documented 6-tier model

**Agent:** Backend Agent

**Finding:** `comments.ts` implements only PUBLIC/INTERNAL. The 6-tier model (`APPLICANT_VISIBLE`, `FOCAL_AND_INTERNAL`, `RTEC_PRIVATE`, `RTEC_HEAD_ONLY`, `OFFICIAL_WORKFLOW`, `ADMIN_AUDIT_ONLY`) exists in `middleware/auth.ts` but isn't wired to any comment route. RTEC privacy is currently achieved a different way (via a separate `rtecReview` model), so the actual leak risk is mitigated — but the spec's documented model isn't what's implemented.

**Data migration mapping (controller-confirmed, 2026-07-22):** existing `PUBLIC` rows → `APPLICANT_VISIBLE`; existing `INTERNAL` rows → `FOCAL_AND_INTERNAL`. Confirmed correct — proceed with this mapping, no further sign-off needed.

**Task prompt:**
```
Business Goal: Comment visibility must match the documented 6-tier
model exactly, so future features (e.g. Budget/Accounting comment
threads) don't have to invent ad-hoc privacy logic per module the way
RTEC did.

Task:
1. Wire the existing VISIBILITY_BY_ROLE model in middleware/auth.ts
   into the actual comment routes, replacing the PUBLIC/INTERNAL enum.
2. Migrate any existing comment data to the new tiers using this
   mapping: PUBLIC -> APPLICANT_VISIBLE, INTERNAL -> FOCAL_AND_INTERNAL.
   This mapping has already been confirmed correct — no need to ask
   before running it.
3. Add permission tests: for every one of the 6 visibility tiers,
   confirm each role can/cannot read a comment tagged with it,
   including via direct API call, not just UI.
4. Confirm the existing RTEC-privacy behavior (via rtecReview) is not
   broken by this change — it can stay as the underlying mechanism 
   for RTEC-specific reviews, but general comments should use the
   proper tiered model.

Constraints: do not remove the existing RTEC review privacy mechanism
without confirming an equivalent replacement is in place first.
```

**Verified:** ☐ 6-tier model wired to comment routes ☐ migration done ☐ permission tests pass for all 6 tiers

---

## 6. MAJOR — No pagination on proposal/queue lists

**Agent:** Backend Agent

**Finding:** `queues.ts` and the proposal list in `proposals.ts` use `findMany` with no `take`/`skip`. The audit-logs route already paginates correctly (`{"total":170,"limit":3,"offset":0}`) — the pattern exists, it's just not applied everywhere.

**Task prompt:**
```
Business Goal: Proposal and queue lists must not load unbounded result
sets as the system accumulates real data over time.

Task:
1. Apply the same pagination pattern already used in the audit-logs
   route to: the proposal list endpoint, and every queue endpoint
   (Focal queue, RTEC queue, Budget queue, Accounting queue, RD queue).
2. Add sensible default page size and max page size limits.
3. Update the frontend list views to request paginated data and show
   page controls.
4. Test with a seeded dataset large enough to span multiple pages and
   confirm correct total counts and no duplicate/missing rows across
   pages.

Constraints: keep the response shape consistent with the existing
audit-logs pagination shape for consistency across the API.
```

**Verified:** ☐ all list/queue endpoints paginated ☐ frontend updated ☐ multi-page test passed

---

## 7. Frontend interactivity — proposal forms & dashboards

**Agent:** Frontend Agent

**Finding:** Not a QA failure per se, but flagged for improvement: the current UI is functional but static/basic rather than genuinely interactive.

**Task prompt:**
```
Business Goal: The proposal form and role dashboards should feel like a
responsive, modern tool reviewers and applicants actually want to use —
not a static form-to-database pipe.

Task:
1. Proposal form: live inline validation as fields are filled (not only
   on submit), visible autosave status indicator, real-time budget
   calculation updates as line items change, smooth add/remove-row
   behavior for repeating sections.
2. Dashboards (Focal/RTEC/Budget/Accounting/RD/Admin): real-time or
   near-real-time status updates on the proposal queue (e.g. via
   polling or websockets — Architect Agent should confirm which fits
   the existing stack) rather than requiring a manual page refresh to
   see a new item arrive.
3. Comment panel: threaded, resolve/reopen interactions without a full
   page reload.
4. Version history: an actual side-by-side or diff view between
   versions, not just a flat list of version numbers.
5. Keep all of this consistent with the accessibility requirements
   already in the spec (keyboard operability, non-color-only validation
   states) — don't trade accessibility for polish.

Constraints: this must not change any backend contract without
coordinating with the Backend Agent. Ask the Architect Agent before
introducing a new frontend dependency not already in the approved stack.
```

**Verified:** ☐ form has live validation/autosave indicator ☐ dashboards update without manual refresh ☐ comment panel is interactive ☐ version diff view exists ☐ accessibility preserved

---

## 8. Re-test — live proposal passing, full chain

**Agent:** QA Agent

**This is the actual gate. Do this last, after Sections 1–7 are done.**

**Task prompt:**
```
Business Goal: Confirm, live, that a proposal can pass through the
entire workflow end-to-end after all fixes above, with no manual
database intervention required at any step.

Task:
1. Run the full 17-step live workflow test from the original QA pass
   (Applicant → Focal → RTEC members → RTEC Head consolidation →
   Focal → Budget → Accounting → RD decision → notification →
   PDF export → audit trail → backup/restore), this time completing
   every step through the actual UI, not API shortcuts, and not
   skipping the click-through for time.
2. Re-run every item in the original QA verdict table that was marked
   FAIL or NOT VERIFIABLE, and confirm each is now PASS with fresh
   evidence (not "should be fixed now" — actually re-tested). Note:
   PDF export and email notifications are known, deliberately-deferred
   exceptions (see scope note at top of this file) — they are expected
   to still show FAIL and that is not a regression.
3. Produce an updated verdict table in the same PASS/FAIL/NOT VERIFIABLE
   format, with a final GO / CONDITIONAL GO / NO-GO recommendation.
4. If anything still fails (other than the deliberately-deferred PDF
   export / email items), loop back: assign it to the appropriate
   agent above, fix, and re-test again. Do not mark this plan complete
   until the verdict is GO or CONDITIONAL GO with only Minor items
   (and the deferred PDF/email items) remaining.

Constraints: no step in the workflow may require manual DB edits,
support intervention, or "worked once in isolation" to count as passing.
```

**Verified:** ☐ full 17-step workflow completed via UI ☐ every prior FAIL/NOT VERIFIABLE item re-tested and passing (except deferred PDF/email) ☐ final verdict recorded

---

## Done?

When every checkbox above is checked and Section 8's final verdict is GO or CONDITIONAL GO — **delete this file.** It did its job.
