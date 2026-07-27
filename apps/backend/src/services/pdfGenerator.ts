import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

// ── Path resolution for ES modules ──────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In dev (tsx): __dirname = src/services/ → ../assets/ = src/assets/
// In prod (node dist/): __dirname = dist/services/ → we need to check multiple paths
function resolveLogoPath(): string {
  const candidates = [
    join(__dirname, "../assets/dost-seal.png"),    // relative (works in both dev & prod if assets copied)
    join(__dirname, "../../src/assets/dost-seal.png"), // from dist/services → src/assets (production fallback)
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return candidates[0]; // Default — will trigger the placeholder fallback in generateProposalPDF
}

const LOGO_PATH = resolveLogoPath();

// ── Types ───────────────────────────────────────────────────────────────────

export interface ExportProposalData {
  title: string;
  proposalId: string;
  proposalTypeName: string;
  programName: string | null;
  status: string;
  applicantName: string;
  applicantEmail: string;
  generatedAt: Date;
  versionNumber: number;
  sections: Array<{
    title: string;
    fields: Array<{ label: string; value: string | null }>;
  }>;
  workflowHistory: Array<{
    fromStatus: string;
    toStatus: string;
    workflowAction: string;
    actorRole: string;
    transitionedAt: Date;
    comment: string | null;
  }>;
  rdDecision: {
    decision: string;
    remarks: string | null;
    decidedAt: Date | null;
  } | null;
}

// ── Helper functions ─────────────────────────────────────────────────────────

/**
 * Maps proposal status to status pill color following DOST branding.
 */
function getStatusColor(status: string): { bg: string; text: string } {
  const statusMap: Record<string, { bg: string; text: string }> = {
    APPROVED: { bg: "#d4edda", text: "#155724" },    // Light green background, dark green text
    REJECTED: { bg: "#f8d7da", text: "#721c24" },    // Light red background, dark red text
    RETURNED: { bg: "#fff3cd", text: "#856404" },    // Light yellow/orange background, dark orange text
    DEFERRED: { bg: "#fff3cd", text: "#856404" },    // Same as RETURNED
    "IN PROGRESS": { bg: "#e2e3e5", text: "#383d41" }, // Light gray background, dark gray text
  };
  return statusMap[status] || { bg: "#e2e3e5", text: "#383d41" };
}

/**
 * Determines font size and row height for workflow table based on step count.
 * Implements dynamic scaling per requirements.md Requirement 2.
 */
function calculateTableSizing(stepCount: number): {
  fontSize: number;
  rowHeight: number;
} {
  if (stepCount <= 15) return { fontSize: 9, rowHeight: 28 };
  if (stepCount <= 20) return { fontSize: 8, rowHeight: 24 };
  if (stepCount <= 30) return { fontSize: 7, rowHeight: 20 };
  return { fontSize: 7, rowHeight: 20 }; // Will paginate beyond 30
}

/**
 * Formats a date for the PDF (MM/DD/YYYY format, with time on second line).
 * Always includes seconds for consistency with the reference template.
 */
function formatTimestamp(date: Date): string {
  const dateStr = date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${dateStr}\n${timeStr}`;
}

/**
 * Converts underscored status/action names to human-readable format.
 * e.g., "UNDER_FOCAL_REVIEW" -> "UNDER FOCAL REVIEW"
 */
function formatStatusName(name: string): string {
  return name.replace(/_/g, " ");
}

/**
 * Generates a professionally branded single-page PDF export matching the
 * approved DOST Region 02 reference template exactly.
 * 
 * Layout per PRIME_v2_Template.pdf:
 * - Header: DOST seal (60pt), agency title (bold), subtitle (gray), PRIME v2 (blue accent), status pill (top-right)
 * - Thin blue horizontal divider
 * - Metadata strip: PROPOSAL, PROPOSAL ID, APPLICANT
 * - Workflow history table: 5 columns (STAGE, ACTOR, TRANSITION, REMARKS, TIMESTAMP)
 * - Terminal row highlighted in light green
 * - RD Decision section with signature block
 * - Footer: system info (left), page/timestamp/version (right)
 * 
 * @param data - Complete proposal export data
 * @returns Buffer containing the generated PDF
 */
export function generateProposalPDF(data: ExportProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 60, left: 50, right: 50 },
        info: {
          Title: `${data.title} — PRIME v2 Export`,
          Author: "DOST Region 02 — PRIME v2",
          Subject: `Proposal Export — ${data.proposalId}`,
          Keywords: "DOST, PRIME, Proposal, Research",
          Creator: "PRIME v2 — Proposal and Research Information Management Engine",
          Producer: "PRIME v2 PDF Generator (PDFKit)",
          CreationDate: data.generatedAt,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;

      let yPos = margin;

      // ── HEADER ────────────────────────────────────────────────────────────

      // DOST seal (top-left, 60pt) - use existsSync to check before loading
      const logoExists = existsSync(LOGO_PATH);
      if (logoExists) {
        doc.image(LOGO_PATH, margin, yPos, { width: 60, height: 60 });
      } else {
        // Placeholder if logo file is missing
        doc
          .rect(margin, yPos, 60, 60)
          .stroke("#d1d5db")
          .fontSize(7)
          .fillColor("#6b7280")
          .text("[LOGO]", margin, yPos + 23, { width: 60, align: "center" });
      }

      // Agency header (right of logo)
      const headerX = margin + 75;
      const headerWidth = 320; // Increased width to prevent wrapping
      
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("Department of Science and Technology", headerX, yPos, {
          width: headerWidth,
          lineGap: -2,
        });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text("Region 02 — Cagayan Valley", headerX, yPos + 18, {
          width: headerWidth,
        });

      // PRIME v2 title - reduced font size to 10pt to prevent wrapping
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#00A9E0") // Accent blue per requirements.md
        .text(
          "Proposal and Research Information Management Engine (PRIME v2)",
          headerX,
          yPos + 34,
          { width: headerWidth, lineGap: -1 }
        );

      // Status pill (top-right)
      const statusColors = getStatusColor(data.status);
      const pillX = pageWidth - margin - 100;
      const pillY = yPos;
      const pillWidth = 90;
      const pillHeight = 22;

      doc
        .roundedRect(pillX, pillY, pillWidth, pillHeight, 3)
        .fillAndStroke(statusColors.bg, statusColors.bg);

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(statusColors.text)
        .text(data.status, pillX, pillY + 6, {
          width: pillWidth,
          align: "center",
        });

      yPos += 70;

      // Thin blue horizontal divider
      doc
        .moveTo(margin, yPos)
        .lineTo(pageWidth - margin, yPos)
        .lineWidth(1.5)
        .strokeColor("#00A9E0")
        .stroke();

      yPos += 15;

      // ── METADATA STRIP ────────────────────────────────────────────────────

      const metaLabelWidth = 100;
      const metaValueX = margin + metaLabelWidth;

      // PROPOSAL
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("#6b7280")
        .text("PROPOSAL", margin, yPos, { width: metaLabelWidth });

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#111827")
        .text(
          `${data.title} (${data.proposalTypeName})`,
          metaValueX,
          yPos,
          { width: contentWidth - metaLabelWidth }
        );

      yPos += 16;

      // PROPOSAL ID
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("#6b7280")
        .text("PROPOSAL ID", margin, yPos, { width: metaLabelWidth });

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#111827")
        .text(data.proposalId, metaValueX, yPos, {
          width: contentWidth - metaLabelWidth,
        });

      yPos += 16;

      // APPLICANT
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("#6b7280")
        .text("APPLICANT", margin, yPos, { width: metaLabelWidth });

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#111827")
        .text(`${data.applicantName} <${data.applicantEmail}>`, metaValueX, yPos, {
          width: contentWidth - metaLabelWidth,
        });

      yPos += 25;

      // ── APPROVAL WORKFLOW HISTORY ─────────────────────────────────────────

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("APPROVAL WORKFLOW HISTORY", margin, yPos);

      yPos += 18;

      // Table sizing
      const stepCount = data.workflowHistory.length;
      const { fontSize: tableFontSize, rowHeight } = calculateTableSizing(stepCount);

      // Column widths - adjusted to fix TIMESTAMP wrapping issue
      const colStage = 105;
      const colActor = 85;
      const colTransition = 125;
      const colRemarks = 130;
      const colTimestamp = 67; // Wider to fit "7/22/2026" and "6:10:16 AM" on separate lines

      // Table header background
      doc
        .rect(margin, yPos, contentWidth, rowHeight)
        .fillAndStroke("#f3f4f6", "#e5e7eb");

      // Column headers
      const headerY = yPos + (rowHeight - tableFontSize) / 2;

      doc
        .fontSize(tableFontSize)
        .font("Helvetica-Bold")
        .fillColor("#111827");

      doc.text("STAGE", margin + 3, headerY, { width: colStage - 6 });
      doc.text("ACTOR", margin + colStage + 3, headerY, {
        width: colActor - 6,
      });
      doc.text("TRANSITION", margin + colStage + colActor + 3, headerY, {
        width: colTransition - 6,
      });
      doc.text("REMARKS", margin + colStage + colActor + colTransition + 3, headerY, {
        width: colRemarks - 6,
      });
      doc.text(
        "TIMESTAMP",
        margin + colStage + colActor + colTransition + colRemarks + 3,
        headerY,
        { width: colTimestamp - 6, align: "right" }
      );

      yPos += rowHeight;

      // Table rows
      data.workflowHistory.forEach((h, index) => {
        const isTerminal =
          index === data.workflowHistory.length - 1 &&
          ["APPROVED", "REJECTED", "RETURNED", "DEFERRED"].includes(h.toStatus);

        // Row background (highlight terminal row)
        if (isTerminal) {
          doc.rect(margin, yPos, contentWidth, rowHeight).fillAndStroke("#d4edda", "#e5e7eb");
        } else {
          // Thin row divider
          doc
            .moveTo(margin, yPos)
            .lineTo(pageWidth - margin, yPos)
            .strokeColor("#e5e7eb")
            .lineWidth(0.5)
            .stroke();
        }

        const rowTextY = yPos + 4;

        // STAGE (numbered, bold, with underscores converted to spaces)
        doc
          .fontSize(tableFontSize)
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .text(
            `${index + 1}. ${formatStatusName(h.workflowAction)}`,
            margin + 3,
            rowTextY,
            { width: colStage - 6, lineGap: 0 }
          );

        // ACTOR (gray)
        doc
          .fontSize(tableFontSize)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text(h.actorRole, margin + colStage + 3, rowTextY, {
            width: colActor - 6,
            lineGap: 0,
          });

        // TRANSITION (from -> to, gray, with underscores converted to spaces)
        const transitionText = `${formatStatusName(h.fromStatus)} -> ${formatStatusName(h.toStatus)}`;
        doc
          .fontSize(tableFontSize)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text(
            transitionText,
            margin + colStage + colActor + 3,
            rowTextY,
            { width: colTransition - 6, lineGap: 0 }
          );

        // REMARKS (italic gray, "—" when empty)
        const remarks = h.comment || "—";
        doc
          .fontSize(tableFontSize)
          .font("Helvetica-Oblique")
          .fillColor("#6b7280")
          .text(
            remarks,
            margin + colStage + colActor + colTransition + 3,
            rowTextY,
            { width: colRemarks - 6, lineGap: 0 }
          );

        // TIMESTAMP (right-aligned, date/time on two lines with seconds)
        const timestamp = formatTimestamp(h.transitionedAt);
        doc
          .fontSize(tableFontSize - 1)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text(
            timestamp,
            margin + colStage + colActor + colTransition + colRemarks + 3,
            rowTextY,
            { width: colTimestamp - 6, align: "right", lineGap: 0 }
          );

        yPos += rowHeight;
      });

      yPos += 15;

      // ── REGIONAL DIRECTOR DECISION ────────────────────────────────────────

      if (data.rdDecision) {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .text("REGIONAL DIRECTOR DECISION", margin, yPos);

        yPos += 18;

        // DECISION (green bold for APPROVED, red for REJECTED, etc.)
        const decisionColor =
          data.rdDecision.decision === "APPROVED"
            ? "#155724"
            : data.rdDecision.decision === "REJECTED"
              ? "#721c24"
              : "#856404";

        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor("#6b7280")
          .text("DECISION", margin, yPos, { width: metaLabelWidth });

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor(decisionColor)
          .text(data.rdDecision.decision, metaValueX, yPos, {
            width: contentWidth - metaLabelWidth,
          });

        yPos += 16;

        // REMARKS
        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor("#6b7280")
          .text("REMARKS", margin, yPos, { width: metaLabelWidth });

        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#111827")
          .text(data.rdDecision.remarks || "—", metaValueX, yPos, {
            width: contentWidth - metaLabelWidth,
          });

        yPos += 16;

        // DECIDED ON
        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor("#6b7280")
          .text("DECIDED ON", margin, yPos, { width: metaLabelWidth });

        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#111827")
          .text(
            data.rdDecision.decidedAt
              ? data.rdDecision.decidedAt.toLocaleString("en-US")
              : "—",
            metaValueX,
            yPos,
            { width: contentWidth - metaLabelWidth }
          );

        yPos += 25;

        // Signature block (centered with underline)
        const signatureWidth = 200;
        const signatureX = (pageWidth - signatureWidth) / 2;

        // Underline
        doc
          .moveTo(signatureX, yPos)
          .lineTo(signatureX + signatureWidth, yPos)
          .strokeColor("#6b7280")
          .lineWidth(1)
          .stroke();

        yPos += 8;

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .text("Regional Director", signatureX, yPos, {
            width: signatureWidth,
            align: "center",
          });

        yPos += 14;

        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text("DOST Region 02 — Cagayan Valley", signatureX, yPos, {
            width: signatureWidth,
            align: "center",
          });

        yPos += 20;
      }

      // ── FOOTER ────────────────────────────────────────────────────────────

      const footerY = doc.page.height - 45;

      // Thin gray divider above footer
      doc
        .moveTo(margin, footerY)
        .lineTo(pageWidth - margin, footerY)
        .strokeColor("#d1d5db")
        .lineWidth(0.5)
        .stroke();

      // Left side: system info
      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(
          "PRIME v2 — DOST Region 02 | This is a system-generated document",
          margin,
          footerY + 8,
          { width: contentWidth / 2, align: "left" }
        );

      // Right side: page/generation/version (with seconds in timestamp)
      const generatedStr = data.generatedAt.toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(
          `Page 1 of 1 | Generated: ${generatedStr} | Version ${data.versionNumber}`,
          pageWidth / 2,
          footerY + 8,
          { width: contentWidth / 2, align: "right" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
