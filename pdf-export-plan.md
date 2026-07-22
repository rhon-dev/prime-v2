# PRIME v2 — PDF Export Improvement Plan

**STATUS: DEFERRED.** Not part of the active fix-plan.md pass (2026-07-22 decision). Saved here for a later session — do not execute yet.

**Source finding (live QA):** `export.ts:44` currently contains the comment "no pdfkit installed — see Task 2 fallback." Every export returns `format: "HTML"`, not PDF. Content accuracy for the HTML that is generated is good (live-tested, matched a renamed proposal's live DB title, not a stale copy) — but PRIME v2's own MVP definition (README §16, step 16) requires the proposal to export to an actual PDF. This plan closes that gap and makes the result look like an official document, not a raw form dump.

**This is a working file, not permanent documentation.** Once every task below is DONE and the final check in Section 5 passes, delete this file from the repo.

---

## 1. Find before you build — check for an existing template or logo first

**Agent:** Architect Agent (discovery) → Backend/Frontend Agent (implementation)

**Task prompt:**
```
Business Goal: Don't design a PDF layout from scratch if PRIME v2 already
has an official template or logo asset sitting in the repo unused.

Task:
1. Search the repository for existing brand/logo assets before creating
   anything new. Check likely locations:
   - docs/forms/pdf/ (original source PDFs — these are the *visual
     reference* the README explicitly says the generated PDF should
     match, per README §15.4)
   - docs/forms/word/ and docs/forms/excel/ (may have a letterhead or
     header/footer with a logo embedded)
   - any /assets, /public, /static, /branding, or similar folder in the
     frontend
   - docs/ generally, for anything named like logo, letterhead, seal,
     or dost
2. If an existing DOST logo file or an original form with a letterhead
   is found: extract it (or note its path) and use it as the source of
   truth for the generated PDF's header.
3. If nothing is found: do not fabricate a logo. Use a clearly marked
   placeholder (e.g. a bordered box reading "[AGENCY LOGO]") in the
   generated layout, and flag in the output report that an official
   DOST logo file needs to be supplied by the team before this goes to
   production. Do not pull a logo from a general web search and embed
   it as if it were the official mark.
4. Also check whether any of the original source Word/Excel/PDF forms
   under docs/forms/ already define an approved layout (letterhead
   position, header/footer text, signatory block styling) that the
   generated PDF should replicate rather than inventing a new one.

Report back: what was found, where, and what (if anything) is missing.
```

**Output of this step:** a short findings note (in this file's Section 6, or wherever the agent logs it) — logo found? template found? what's missing?

---

## 2. Implement real PDF generation

**Agent:** Backend Agent (with Architect Agent approving the library choice, per README §19 — no supporting library should be finalized without review)

**Task prompt:**
```
Business Goal: Replace the current HTML-only export fallback with a real
PDF generation pipeline, matching the layout of the original source
forms per README §15.4 ("The PDF must be used as the visual reference").

Task:
1. Propose a PDF generation approach (e.g. pdfkit, a headless-Chromium
   HTML-to-PDF render, or a templating library already compatible with
   the existing Fastify/TypeScript stack) and get it approved before
   installing — this is a new dependency and needs the same review
   any supporting library gets per the tech stack rules.
2. Build the actual PDF template with:
   - Header: agency name, logo (from Section 1's findings, or the
     placeholder if none was found), document title, proposal ID
   - Body: matches the field structure/order of the original source
     form for that proposal type — not a raw dump of database fields
     in arbitrary order
   - Footer: page numbers, generation timestamp, proposal version
     number, a note that this is a system-generated document
   - Signatory block matching the original form where the source form
     has one
3. Replace the current export.ts HTML fallback path with this real PDF
   output. Keep the existing HTML export available as a secondary
   option only if there's a reason to (e.g. preview-before-download) —
   but the primary "export" action must now produce a genuine PDF.
4. Verify content accuracy the same way the QA pass already validated
   the HTML export: change a proposal's data, re-export, and confirm
   the PDF reflects the live database value, not a stale cached one.
5. Confirm restricted-comment data (RTEC_PRIVATE, RTEC_HEAD_ONLY,
   ADMIN_AUDIT_ONLY per the comment-visibility fix in fix-plan.md)
   never appears in an Applicant-facing exported PDF.

Constraints: this must not weaken any existing authorization check on
who can trigger an export for which proposal.
```

---

## 3. Make it well-documented, not just working

**Agent:** DevOps/Backend Agent (documentation)

**Task prompt:**
```
Business Goal: A future developer should be able to understand and
modify the PDF export without reverse-engineering it from code alone.

Task:
1. Write docs/architecture or docs/api documentation covering:
   - Which library is used and why
   - Where the template/layout definitions live in the codebase
   - How to add a new proposal-type template
   - How the logo/branding asset is referenced (path, format, how to
     swap it if the official DOST logo changes)
2. Add inline comments in the template-generation code explaining any
   non-obvious layout logic (e.g. how repeating budget rows are
   rendered, how page breaks are handled for long proposals).
3. Add a short entry to the admin manual: how an Admin/Focal actually
   triggers an export and what to do if it fails.
```

---

## 4. Branding accuracy — DOST logo specifically

**Agent:** Frontend/Backend Agent

**Task prompt:**
```
Business Goal: If an official DOST logo asset was found in Section 1,
it must be used correctly and consistently.

Task:
1. If found: confirm it's a high-resolution/vector source (not a
   screenshot or compressed thumbnail) suitable for print-quality PDF
   output. If the only available copy is low-quality, flag this rather
   than shipping a blurry official seal.
2. Place the logo consistently: same position, size, and aspect ratio
   across all proposal-type templates.
3. If NOT found in Section 1: leave the placeholder in place and
   explicitly list "obtain official DOST logo asset (vector/high-res)
   from the team" as an open item in the final report — do not close
   this plan with a placeholder still silently in production output.
```

---

## 5. Live re-test

**Agent:** QA Agent

**Task prompt:**
```
Task:
1. Run a full proposal through the workflow to RD approval, trigger the
   export, and open the resulting PDF.
2. Confirm: real PDF (not HTML-renamed-as-PDF), correct data, logo
   present and correctly placed (or clearly-flagged placeholder if no
   logo asset exists yet), layout resembles the original source form,
   page numbers and footer present, no restricted comments leaked in.
3. Record pass/fail with evidence (attach or describe the actual
   generated PDF output).
```

---

## 6. Findings log (fill in as agents work)

- Logo found? ☐ Yes — path: __________ ☐ No — placeholder used, official asset still needed
- Existing template/letterhead found? ☐ Yes — path: __________ ☐ No — new layout designed
- PDF library chosen: __________ (approved by Architect Agent: ☐)

---

## Done?

When Sections 1–5 are complete and the live re-test in Section 5 passes with a real, correctly-branded PDF — **delete this file.**
