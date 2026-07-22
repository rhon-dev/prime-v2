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
    join(__dirname, "../assets/dost-seal.webp"),    // relative (works in both dev & prod if assets copied)
    join(__dirname, "../../src/assets/dost-seal.webp"), // from dist/services → src/assets (production fallback)
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

// ── PDF Generation ──────────────────────────────────────────────────────────

/**
 * Generates a professional PDF export for an approved proposal.
 * 
 * Layout follows the standard DOST Region 02 form template with:
 * - Header: DOST seal, agency name, document title, proposal ID
 * - Body: structured form data matching original source form layout
 * - Footer: page numbers, generation timestamp, version number, system attribution
 * - Signatory block: RD decision (if present)
 * 
 * @param data - Complete proposal export data
 * @returns Buffer containing the generated PDF
 */
export function generateProposalPDF(data: ExportProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
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

      // ── Header ────────────────────────────────────────────────────────────

      // DOST seal (top-left, 60×60pt)
      try {
        doc.image(LOGO_PATH, 72, 72, { width: 60, height: 60 });
      } catch (err) {
        // If logo fails to load, draw a placeholder box
        doc
          .rect(72, 72, 60, 60)
          .stroke("#d1d5db")
          .fontSize(7)
          .fillColor("#6b7280")
          .text("[LOGO]", 72, 95, { width: 60, align: "center" });
      }

      // Agency header (right of logo)
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("Department of Science and Technology", 145, 72, {
          width: doc.page.width - 217,
        })
        .fontSize(10)
        .font("Helvetica")
        .text("Region 02 — Cagayan Valley", 145, 88, {
          width: doc.page.width - 217,
        })
        .fontSize(9)
        .fillColor("#6b7280")
        .text("Proposal and Research Information Management Engine (PRIME v2)", 145, 104, {
          width: doc.page.width - 217,
        });

      // Horizontal rule
      doc.moveTo(72, 145).lineTo(doc.page.width - 72, 145).stroke("#e5e7eb");

      // Document title & metadata
      doc
        .moveDown(3)
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text(data.title, { align: "center" })
        .moveDown(0.5)
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(
          `${data.proposalTypeName}${data.programName ? ` · ${data.programName}` : ""}`,
          { align: "center" }
        )
        .text(`Proposal ID: ${data.proposalId} | Status: ${data.status}`, {
          align: "center",
        })
        .text(`Applicant: ${data.applicantName} (${data.applicantEmail})`, {
          align: "center",
        })
        .moveDown(1.5);

      // ── Body: Proposal Sections ───────────────────────────────────────────

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("Proposal Information");

      if (data.sections.length === 0) {
        doc
          .moveDown(0.5)
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text("No form responses recorded.", { indent: 20 });
      } else {
        for (const section of data.sections) {
          doc
            .moveDown(1)
            .fontSize(12)
            .font("Helvetica-Bold")
            .fillColor("#374151")
            .text(section.title, { indent: 20 });

          for (const field of section.fields) {
            doc
              .moveDown(0.5)
              .fontSize(9)
              .font("Helvetica-Bold")
              .fillColor("#6b7280")
              .text(field.label, { indent: 40, continued: false });

            const value = field.value || "—";
            doc
              .fontSize(10)
              .font("Helvetica")
              .fillColor("#111827")
              .text(value, { indent: 40 });
          }
        }
      }

      // ── Workflow History ──────────────────────────────────────────────────

      doc.addPage();

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("Workflow History");

      if (data.workflowHistory.length === 0) {
        doc
          .moveDown(0.5)
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text("No workflow history recorded.", { indent: 20 });
      } else {
        for (const h of data.workflowHistory) {
          doc
            .moveDown(1)
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#111827")
            .text(h.workflowAction.replace(/_/g, " "), { indent: 20 })
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#6b7280")
            .text(
              `${h.actorRole} · ${h.fromStatus} → ${h.toStatus} · ${h.transitionedAt.toLocaleString()}`,
              { indent: 20 }
            );

          if (h.comment) {
            doc
              .fontSize(9)
              .font("Helvetica-Oblique")
              .fillColor("#374151")
              .text(`"${h.comment}"`, { indent: 40 });
          }
        }
      }

      // ── RD Decision (Signatory Block) ─────────────────────────────────────

      if (data.rdDecision) {
        doc
          .moveDown(2)
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .text("Regional Director Decision");

        doc
          .moveDown(1)
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .text(`Decision: ${data.rdDecision.decision}`, { indent: 20 });

        if (data.rdDecision.remarks) {
          doc
            .moveDown(0.5)
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#374151")
            .text(`Remarks: ${data.rdDecision.remarks}`, { indent: 20 });
        }

        if (data.rdDecision.decidedAt) {
          doc
            .moveDown(0.5)
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#6b7280")
            .text(
              `Decided on: ${data.rdDecision.decidedAt.toLocaleString()}`,
              { indent: 20 }
            );
        }

        // Signatory line (placeholder — actual signature to be added manually)
        doc
          .moveDown(2)
          .fontSize(9)
          .fillColor("#111827")
          .text("_______________________________", { indent: 20 })
          .moveDown(0.25)
          .text("Regional Director", { indent: 20 })
          .text("DOST Region 02 — Cagayan Valley", { indent: 20 });
      }

      // ── Page Footers ──────────────────────────────────────────────────────
      // Use bufferedPageRange to add footers to all pages before finalizing
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const marginBottom = doc.page.margins.bottom;
        const pageNum = i + 1;

        doc
          .fontSize(8)
          .fillColor("#6b7280")
          .text(
            `Page ${pageNum} | Generated: ${data.generatedAt.toLocaleString()} | Version ${data.versionNumber}`,
            72,
            pageHeight - marginBottom + 20,
            { width: pageWidth - 144, align: "center" }
          )
          .text(
            "PRIME v2 — DOST Region 02 | This is a system-generated document",
            72,
            pageHeight - marginBottom + 32,
            { width: pageWidth - 144, align: "center" }
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
