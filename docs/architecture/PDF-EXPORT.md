# PRIME v2 — PDF Export Architecture

**Last updated:** 2026-07-22  
**Status:** Implemented (Phase 21+)

---

## Overview

PRIME v2 generates professional PDF exports of approved proposals using PDFKit, matching the layout and branding standards of DOST Region 02 official forms.

---

## Technology Stack

### PDF Generation Library

**Choice:** [PDFKit](https://pdfkit.org/) v0.15.1  
**Rationale:**
- Native Node.js/TypeScript support with comprehensive type definitions
- No external dependencies on browsers or Chromium (unlike Puppeteer)
- Full programmatic control over PDF layout, fonts, images, and metadata
- Stable, mature library with wide adoption in production environments
- Excellent performance for document generation
- Vector graphics support for crisp logos and lines

**Alternatives Considered:**
- **Puppeteer/Playwright** — Rejected: heavier resource footprint, requires Chromium binary, overkill for structured document generation
- **PDFMake** — Rejected: less flexible for custom layouts, declarative API less intuitive for developers familiar with imperative code
- **jsPDF** — Rejected: primarily client-side focused, less mature server-side support

---

## Architecture

### File Structure

```
apps/backend/src/
├── services/
│   └── pdfGenerator.ts         # Core PDF generation logic
├── routes/
│   └── export.ts               # Export API endpoints
└── assets/
    └── dost-seal.webp          # Official DOST logo (4.3KB WebP)
```

### PDF Template Design

The generated PDF follows the standard DOST Region 02 form template:

#### Header (Every Page)
- **DOST Seal** — 60×60pt top-left corner (WebP format)
- **Agency Name** — "Department of Science and Technology"
- **Region** — "Region 02 — Cagayan Valley"
- **System Name** — "Proposal and Research Information Management Engine (PRIME v2)"
- **Horizontal Rule** — Separator line below header

#### Document Title Block
- Proposal title (16pt bold, centered)
- Proposal type and program name (10pt, centered)
- Proposal ID and status (10pt, centered)
- Applicant name and email (10pt, centered)
- Generation timestamp

#### Body Content
1. **Proposal Information**
   - Sections organized by `displayOrder` from `FormSection`
   - Fields displayed in order with labels (9pt bold gray) and values (10pt black)
   - Empty values rendered as "—"

2. **Workflow History** (New Page)
   - Chronological list of all status transitions
   - Shows: action, actor role, from/to status, timestamp
   - Includes reviewer comments when present

3. **RD Decision** (If Present)
   - Decision (APPROVED/REJECTED/RETURNED)
   - Remarks (if provided)
   - Decision timestamp
   - Signatory line placeholder for manual signature

#### Footer (Every Page)
- **Left Section:** Page number, generation timestamp, version number (8pt gray)
- **Right Section:** "PRIME v2 — DOST Region 02 | This is a system-generated document" (8pt gray)

---

## API Contract

### POST /api/proposals/:id/export

**Authorization:** Proposal owner, assigned staff, ADMIN, REGIONAL_DIRECTOR

**Request Body:**
```json
{
  "format": "PDF" | "HTML"  // Optional, defaults to "PDF"
}
```

**Response (200 OK):**
```json
{
  "exportId": "uuid",
  "url": "https://minio-presigned-url/...",  // 5-minute expiry
  "filename": "proposal-slugified-title-1234567890.pdf",
  "format": "PDF",
  "generatedAt": "2026-07-22T14:30:00.000Z"
}
```

**Error Codes:**
- `401` — Unauthorized (no auth token)
- `403` — Forbidden (not owner/assigned/admin/RD)
- `404` — Proposal not found
- `409 NOT_APPROVED` — Proposal status is not APPROVED
- `409 NO_CURRENT_VERSION` — Proposal has no current version to export
- `500` — PDF generation failed

### GET /api/proposals/:id/export/latest

**Authorization:** Same as POST

**Response (200 OK):**
```json
{
  "exportId": "uuid",
  "url": "https://minio-presigned-url/...",
  "filename": "proposal-slugified-title-1234567890.pdf",
  "format": "PDF",
  "generatedAt": "2026-07-22T14:30:00.000Z"
}
```

**Error Codes:**
- `404` — No prior export exists for this proposal

---

## Implementation Details

### PDF Metadata

Every generated PDF includes embedded metadata:
```javascript
{
  Title: "${proposalTitle} — PRIME v2 Export",
  Author: "DOST Region 02 — PRIME v2",
  Subject: "Proposal Export — ${proposalId}",
  Keywords: "DOST, PRIME, Proposal, Research",
  Creator: "PRIME v2 — Proposal and Research Information Management Engine",
  Producer: "PRIME v2 PDF Generator (PDFKit)",
  CreationDate: new Date()
}
```

### Page Layout

- **Size:** US Letter (8.5" × 11")
- **Margins:** 72pt (1 inch) on all sides
- **Font:** Helvetica (standard PostScript font, no external files needed)
- **Line Height:** 1.15–1.25 (varies by section)
- **Page Breaks:** Automatic — PDFKit handles overflow

### Logo Handling

The DOST seal is embedded from `/apps/backend/src/assets/dost-seal.webp`:
- **Format:** WebP (modern, efficient)
- **Size:** 4.3KB file, rendered at 60×60pt
- **Fallback:** If logo fails to load, a bordered placeholder box with "[LOGO]" text is rendered
- **Quality:** High-resolution, suitable for print

**Production Note:** Ensure the logo file is included in Docker builds (currently in `src/assets/`, which is compiled). If the logo is missing at runtime, exports will succeed with a placeholder.

### Comment Visibility Filtering

PDF exports **respect the 6-tier comment visibility model**:

| Visibility Level | Included in Applicant PDF? |
|---|---|
| `PUBLIC` | ✅ Yes |
| `STAFF_ONLY` | ❌ No |
| `RTEC_VISIBLE` | ❌ No |
| `RTEC_PRIVATE` | ❌ No |
| `RTEC_HEAD_ONLY` | ❌ No |
| `ADMIN_AUDIT_ONLY` | ❌ No |

**Implementation:** The export endpoint fetches comments with visibility rules already enforced by the database schema and `canAccessProposal` authorization.

### Storage

- **MinIO Path:** `exports/{proposalId}/{timestamp}.pdf`
- **Presigned URL Expiry:** 5 minutes (300 seconds)
- **Database Record:** `proposal_exports` table tracks all generated exports

---

## HTML Fallback

The system retains an HTML export option for debugging and preview purposes:

**Request:**
```json
{ "format": "HTML" }
```

**Response:**
- Same structure as PDF export
- Returns an HTML file instead of PDF
- Styled with inline CSS (no external dependencies)
- **Not intended for production use** — PDF is the official export format

---

## Modifying the Template

### Adding a New Field to the Export

1. **Source:** Fields are pulled from `ProposalVersion.fieldValues` via Prisma
2. **Order:** Controlled by `FormSection.displayOrder` and `FormField.displayOrder`
3. **Rendering:** Automatically included in the "Proposal Information" section

**No code changes required** — new fields added via the admin UI will appear in exports.

### Changing the Logo

1. Replace `/apps/backend/src/assets/dost-seal.webp` with the new logo
2. Supported formats: WebP, PNG, JPEG
3. Recommended size: 512×512px or larger (vector preferred)
4. **Test:** Run `npm test src/routes/export.test.ts` to verify rendering

### Adjusting Layout

Edit `/apps/backend/src/services/pdfGenerator.ts`:

- **Fonts:** Lines 115–200 (header, title, sections)
- **Spacing:** `.moveDown()` calls control vertical spacing
- **Colors:** `.fillColor()` calls (use hex codes like `#111827`)
- **Margins:** Line 45 (`margins: { top, bottom, left, right }`)

**After changes:**
1. Run `npm run build` to check TypeScript compilation
2. Run `npm test src/routes/export.test.ts` to verify exports still generate
3. Manually test an export in the UI

### Adding a New Section

Example: Adding a "Budget Summary" section

1. Query the required data in `/apps/backend/src/routes/export.ts` (line ~200)
2. Add the data to the `ExportProposalData` interface in `pdfGenerator.ts`
3. Render the section in `generateProposalPDF()` after the existing sections

```typescript
// In pdfGenerator.ts after workflow history section
doc
  .moveDown(2)
  .fontSize(14)
  .font("Helvetica-Bold")
  .fillColor("#111827")
  .text("Budget Summary");

// Add your content here
```

---

## Testing

### Automated Tests

**Location:** `/apps/backend/src/routes/export.test.ts`

**Coverage:**
- TC-EXPORT-01: Owner can export APPROVED proposal → 200
- TC-EXPORT-02: Assigned staff can export → 200
- TC-EXPORT-03: Non-APPROVED proposal → 409 NOT_APPROVED
- TC-EXPORT-04: Unauthenticated request → 401
- TC-EXPORT-05: GET /export/latest with no prior export → 404
- TC-EXPORT-06: GET /export/latest after POST → 200

**Run tests:**
```bash
npm test src/routes/export.test.ts
```

### Manual Testing

1. Log in as an applicant
2. Submit a proposal and get it approved (RD approval)
3. Go to the proposal detail page
4. Click "Export to PDF"
5. Download and open the PDF
6. Verify:
   - DOST logo renders correctly
   - All form fields present
   - Workflow history accurate
   - RD decision (if applicable) shows
   - Footer on every page
   - No restricted comments visible

---

## Production Checklist

Before deploying PDF export to production:

- [ ] **Logo:** Verify `dost-seal.webp` is the official, high-resolution DOST logo
- [ ] **Branding:** Confirm header text matches official letterhead
- [ ] **Layout:** Get approval from stakeholders that the template matches original forms
- [ ] **Testing:** Run full test suite (`npm test`) — all 136 backend tests must pass
- [ ] **Storage:** Confirm MinIO bucket has sufficient space for exports
- [ ] **Permissions:** Verify only APPROVED proposals can be exported
- [ ] **Security:** Confirm restricted comments are not visible in applicant exports
- [ ] **Audit:** Check that `proposal_exports` table logs all generation events

---

## Troubleshooting

### Error: "Maximum call stack size exceeded"

**Cause:** Infinite recursion in page generation (fixed in current implementation)  
**Solution:** Upgrade to latest version of `pdfGenerator.ts` (2026-07-22+)

### Error: "ENOENT: no such file or directory, open '...dost-seal.webp'"

**Cause:** Logo file not found at runtime  
**Solution:**
1. Check that `/apps/backend/src/assets/dost-seal.webp` exists
2. Verify Docker build includes `src/assets/` directory
3. If logo is missing, PDF will render with placeholder box

### Export returns HTML instead of PDF

**Cause:** Request body specifies `"format": "HTML"` or defaults incorrectly  
**Solution:** Ensure request body is either empty (defaults to PDF) or explicitly `{ "format": "PDF" }`

### PDF renders but logo is missing/blurry

**Cause:** Low-resolution source image or unsupported format  
**Solution:** Replace with high-res WebP/PNG (minimum 512×512px)

### Workflow history incomplete in export

**Cause:** Database query missing `orderBy: { transitionedAt: "asc" }`  
**Solution:** Verify query in `export.ts` line ~230 includes proper ordering

---

## Future Enhancements

**Not implemented in MVP:**

1. **Digital Signatures** — E-signature integration for RD approval
2. **Watermarks** — "APPROVED" or "DRAFT" overlay for status indication
3. **Multi-language Support** — Filipino/Tagalog translations
4. **Custom Templates per Program** — Different layouts for different funding programs
5. **Batch Export** — Generate PDFs for multiple proposals at once
6. **Email Delivery** — Send generated PDF via SMTP (currently out of scope per OOS-15)

---

## References

- **PDFKit Documentation:** https://pdfkit.org/docs/getting_started.html
- **DOST Official Forms:** `/docs/forms/pdf/MC 003 spd-25-01944.pdf`
- **PRIME v2 Architecture:** `/docs/architecture/PRIME-v2-Architecture.md`
- **Export API Contract:** `/docs/api/API-CONTRACT-DRAFT.md` (§ Export Endpoints)
- **Roles & Permissions:** `/docs/requirements/PRIME-v2-Roles-and-Permissions.md` (§ Export to PDF)
