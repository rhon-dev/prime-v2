import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  api,
  phase9Api,
  proposalTypesApi,
  formTemplatesApi,
  type FormField,
  type FormSection,
  type FormTemplateVersionResponse,
  type ProposalTypeSummary,
  type AttachmentMeta,
  type ProposalRequiredForm,
} from "../../lib/api";
import shared from "../shared.module.css";
import styles from "./ProposalFormPage.module.css";

type SaveStatus = "idle" | "saving" | "saved" | "failed";

interface FieldValues {
  [formFieldId: string]: string;
}

interface FieldErrors {
  [formFieldId: string]: boolean;
}

interface TableColumn {
  key: string;
  label: string;
}

type TableRow = Record<string, string>;

function parseTableColumns(validationRules: string | null): TableColumn[] {
  if (!validationRules) return [];
  try {
    const parsed = JSON.parse(validationRules) as { columns?: TableColumn[] };
    return parsed.columns ?? [];
  } catch {
    return [];
  }
}

function parseTableRows(value: string | undefined): TableRow[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as TableRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface CreatedProposal {
  id: string;
  title: string;
  status: string;
}

export default function ProposalFormPage() {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();

  const [proposalId, setProposalId] = useState<string | null>(null);
  const [proposalTitle, setProposalTitle] = useState("Draft Proposal");
  const [proposalStatus, setProposalStatus] = useState<string>("DRAFT");
  const [sections, setSections] = useState<FormSection[]>([]);
  const [requiredForms, setRequiredForms] = useState<ProposalRequiredForm[]>([]);
  const [currentFormTemplateId, setCurrentFormTemplateId] = useState<string | null>(null);
  const [currentFormTitle, setCurrentFormTitle] = useState<string>("");
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against React 18 StrictMode's dev-mode double-invoke of mount
  // effects, which otherwise fires POST /api/proposals twice and creates an
  // orphaned draft. Also protects against any real re-entry (slow nav,
  // double-click) in production.
  const hasCreated = useRef(false);

  useEffect(() => {
    if (!typeId) {
      setError("Missing proposal type ID.");
      setLoading(false);
      return;
    }

    if (hasCreated.current) return;
    hasCreated.current = true;

    async function init() {
      try {
        // Step 1: Create draft proposal
        const created = await api.post<CreatedProposal>("/api/proposals", {
          proposalTypeId: typeId,
          title: "Draft Proposal",
        });
        setProposalId(created.id);
        setProposalTitle(created.title ?? "Draft Proposal");
        setProposalStatus(created.status ?? "DRAFT");

        // Step 2: Get proposal type to find defaultFormTemplateId
        const propType = await api.get<ProposalTypeSummary>(
          `/api/proposal-types/${typeId}`
        );
        const formTemplateId = propType.defaultFormTemplateId;
        if (!formTemplateId) {
          setError("This proposal type has no form template configured.");
          return;
        }
        setCurrentFormTemplateId(formTemplateId);
        setSelectedFormId(formTemplateId);

        // Step 3: Get current form template version / schema
        const schema = await api.get<FormTemplateVersionResponse>(
          `/api/form-templates/${formTemplateId}/versions/current`
        );

        const sorted = [...schema.sections].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        sorted.forEach((section) => {
          section.fields.sort((a, b) => a.displayOrder - b.displayOrder);
        });
        setSections(sorted);

        // Step 4: Title of the form being filled below, for the combo box.
        try {
          const formTemplate = await formTemplatesApi.get(formTemplateId);
          setCurrentFormTitle(formTemplate.title);
        } catch {
          setCurrentFormTitle("");
        }

        // Step 5: List of all other forms this proposal type requires
        // (informational only — only the form above has fillable fields
        // until the rest are wired up). A failure here shouldn't block the
        // main form.
        try {
          const forms = await proposalTypesApi.requiredForms(typeId!);
          setRequiredForms(forms);
        } catch {
          setRequiredForms([]);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to initialize form";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, [typeId]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  function saveFields(values: FieldValues, pid: string) {
    const fields = Object.entries(values).map(([formFieldId, value]) => ({
      formFieldId,
      value,
    }));
    setSaveStatus("saving");
    api
      .patch<unknown>(`/api/proposals/${pid}/versions/draft/fields`, { fields })
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("failed"));
  }

  function handleFieldChange(formFieldId: string, value: string, fieldLabel?: string) {
    setFieldValues((prev) => {
      const nextValues = { ...prev, [formFieldId]: value };

      if (proposalId) {
        if (debounceTimer.current !== null) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
          saveFields(nextValues, proposalId);
        }, 1500);
      }

      return nextValues;
    });

    if (fieldErrors[formFieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[formFieldId];
        return next;
      });
    }

    if (
      fieldLabel?.toLowerCase().includes("project title") &&
      proposalId &&
      value.trim()
    ) {
      setProposalTitle(value.trim());
      void api.patch(`/api/proposals/${proposalId}`, { title: value.trim() });
    }
  }

  function handleSaveNow() {
    if (!proposalId) return;
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    saveFields(fieldValues, proposalId);
  }

  function handleFieldBlur(field: FormField) {
    if (field.isRequired && isFieldEmpty(field)) {
      setFieldErrors((prev) => ({ ...prev, [field.id]: true }));
    }
  }

  async function handleFileChange(formFieldId: string, file: File | null) {
    if (!file || !proposalId) return;
    setSaveStatus("saving");
    try {
      await api.uploadFile<AttachmentMeta>(
        `/api/proposals/${proposalId}/attachments`,
        file
      );
      setSaveStatus("saved");
      // Store a placeholder value so autosave includes the field
      handleFieldChange(formFieldId, file.name);
    } catch {
      setSaveStatus("failed");
    }
  }

  function handleTableRowChange(field: FormField, rowIndex: number, columnKey: string, value: string) {
    const existingRows = parseTableRows(fieldValues[field.id]);
    const rows = existingRows.length > 0
      ? existingRows
      : [Object.fromEntries(parseTableColumns(field.validationRules).map((c) => [c.key, ""]))];
    const nextRows = rows.map((row, i) => (i === rowIndex ? { ...row, [columnKey]: value } : row));
    handleFieldChange(field.id, JSON.stringify(nextRows), field.label);
  }

  function handleAddTableRow(field: FormField) {
    const rows = parseTableRows(fieldValues[field.id]);
    const columns = parseTableColumns(field.validationRules);
    const blankRow: TableRow = Object.fromEntries(columns.map((c) => [c.key, ""]));
    handleFieldChange(field.id, JSON.stringify([...rows, blankRow]), field.label);
  }

  function handleRemoveTableRow(field: FormField, rowIndex: number) {
    const rows = parseTableRows(fieldValues[field.id]);
    if (rows.length <= 1) return;
    const nextRows = rows.filter((_, i) => i !== rowIndex);
    handleFieldChange(field.id, JSON.stringify(nextRows), field.label);
  }

  function isFieldEmpty(field: FormField): boolean {
    const value = fieldValues[field.id];
    if (field.inputType === "TABLE") {
      const rows = parseTableRows(value);
      return !rows.some((row) => Object.values(row).some((cell) => cell.trim() !== ""));
    }
    return !value || value.trim() === "";
  }

  function validateRequiredFields(): string[] {
    const missingFieldIds: string[] = [];
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.isRequired && isFieldEmpty(field)) {
          missingFieldIds.push(field.id);
        }
      }
    }
    return missingFieldIds;
  }

  async function handleSubmitProposal() {
    if (!proposalId) return;
    setSubmitError(null);

    const missingFieldIds = validateRequiredFields();
    if (missingFieldIds.length > 0) {
      const errors: FieldErrors = {};
      missingFieldIds.forEach((id) => {
        errors[id] = true;
      });
      setFieldErrors(errors);
      setShowSubmitConfirm(false);
      setSubmitError("Please fill in all required fields before submitting.");
      const firstField = document.getElementById(missingFieldIds[0]);
      firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      await phase9Api.submitProposal(proposalId);
      setShowSubmitConfirm(false);
      navigate(`/proposals/${proposalId}`);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        setSubmitError("This proposal has already been submitted.");
      } else {
        setSubmitError(err instanceof Error ? err.message : "Submission failed.");
      }
    } finally {
      setSubmitting(false);
      setShowSubmitConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={shared.loading}>
          <span className={shared.spinner} aria-hidden="true" /> Preparing your form…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p role="alert" className={shared.error}>
          Error: {error}
        </p>
      </div>
    );
  }

  const saveStatusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
      ? "Saved"
      : saveStatus === "failed"
      ? "Save failed"
      : "";

  const saveStatusClassName =
    saveStatus === "failed"
      ? `${styles.saveStatus} ${styles.saveStatusFailed}`
      : saveStatus === "saved"
      ? `${styles.saveStatus} ${styles.saveStatusSaved}`
      : styles.saveStatus;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>New Proposal</h2>

      <div className={shared.field}>
        <label htmlFor="proposal-title" className={shared.label}>
          Proposal title
        </label>
        <input
          id="proposal-title"
          type="text"
          value={proposalTitle}
          onChange={(e) => {
            const value = e.target.value;
            setProposalTitle(value);
            if (proposalId && value.trim()) {
              void api.patch(`/api/proposals/${proposalId}`, { title: value.trim() });
            }
          }}
          className={shared.input}
          required
        />
      </div>

      {(currentFormTemplateId || requiredForms.length > 0) && (
        <div className={styles.requiredFormsPanel}>
          <label htmlFor="required-form-select" className={shared.label}>
            Forms required for this proposal
          </label>
          <select
            id="required-form-select"
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className={shared.select}
          >
            {currentFormTemplateId && (
              <option value={currentFormTemplateId}>
                {currentFormTitle || "Loading…"} (currently open below)
              </option>
            )}
            {requiredForms.map((f) => (
              <option key={f.id} value={f.formTemplate.id}>
                {f.formTemplate.title}
                {!f.isRequired && " (optional)"}
              </option>
            ))}
          </select>
          {selectedFormId && selectedFormId !== currentFormTemplateId && (
            <p className={styles.requiredFormsHint}>
              This form isn't available to fill online yet.
            </p>
          )}
        </div>
      )}

      {/* Save status */}
      <div aria-live="polite" aria-atomic="true" className={saveStatusClassName}>
        {saveStatusLabel}
      </div>

      {sections.map((section) => (
        <fieldset key={section.id} className={styles.section}>
          <legend className={styles.sectionLegend}>{section.title}</legend>

          {section.fields.map((field) => (
            <div key={field.id} className={shared.field}>
              <label htmlFor={field.id} className={shared.label}>
                {field.label}
                {field.isRequired && (
                  <span className={styles.requiredMark} aria-hidden="true">
                    *
                  </span>
                )}
              </label>

              {field.inputType === "TEXT" && (
                <input
                  id={field.id}
                  type="text"
                  required={field.isRequired}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value, field.label)}
                  onBlur={() => handleFieldBlur(field)}
                  className={shared.input}
                  aria-invalid={fieldErrors[field.id] ? "true" : undefined}
                />
              )}

              {field.inputType === "TEXTAREA" && (
                <textarea
                  id={field.id}
                  required={field.isRequired}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value, field.label)}
                  onBlur={() => handleFieldBlur(field)}
                  rows={4}
                  className={shared.textarea}
                  aria-invalid={fieldErrors[field.id] ? "true" : undefined}
                />
              )}

              {(field.inputType === "NUMBER" || field.inputType === "CURRENCY") && (
                <input
                  id={field.id}
                  type="number"
                  required={field.isRequired}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value, field.label)}
                  onBlur={() => handleFieldBlur(field)}
                  className={shared.input}
                  aria-invalid={fieldErrors[field.id] ? "true" : undefined}
                />
              )}

              {field.inputType === "DATE" && (
                <input
                  id={field.id}
                  type="date"
                  required={field.isRequired}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value, field.label)}
                  onBlur={() => handleFieldBlur(field)}
                  className={shared.input}
                  aria-invalid={fieldErrors[field.id] ? "true" : undefined}
                />
              )}

              {field.inputType === "SELECT" && (
                <select
                  id={field.id}
                  required={field.isRequired}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value, field.label)}
                  onBlur={() => handleFieldBlur(field)}
                  className={shared.select}
                  aria-invalid={fieldErrors[field.id] ? "true" : undefined}
                >
                  <option value="">— Select —</option>
                  {field.validationRules
                    ? (JSON.parse(field.validationRules) as string[]).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))
                    : null}
                </select>
              )}

              {field.inputType === "CHECKBOX" && (
                <input
                  id={field.id}
                  type="checkbox"
                  required={field.isRequired}
                  checked={fieldValues[field.id] === "true"}
                  onChange={(e) =>
                    handleFieldChange(field.id, e.target.checked ? "true" : "false")
                  }
                  className={styles.checkboxInput}
                />
              )}

              {field.inputType === "RADIO" && (
                <input
                  id={field.id}
                  type="radio"
                  required={field.isRequired}
                  checked={fieldValues[field.id] === "true"}
                  onChange={(e) =>
                    handleFieldChange(field.id, e.target.checked ? "true" : "false")
                  }
                  className={styles.checkboxInput}
                />
              )}

              {field.inputType === "FILE" && (
                <input
                  id={field.id}
                  type="file"
                  required={field.isRequired}
                  onChange={(e) =>
                    void handleFileChange(field.id, e.target.files?.[0] ?? null)
                  }
                  className={styles.fileInput}
                />
              )}

              {field.inputType === "TABLE" && (() => {
                const columns = parseTableColumns(field.validationRules);
                const rows = parseTableRows(fieldValues[field.id]);
                const displayRows = rows.length > 0 ? rows : [Object.fromEntries(columns.map((c) => [c.key, ""]))];
                return (
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead>
                        <tr>
                          {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                          ))}
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {displayRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {columns.map((col) => (
                              <td key={col.key}>
                                <input
                                  type="text"
                                  aria-label={`${col.label}, row ${rowIndex + 1}`}
                                  value={row[col.key] ?? ""}
                                  onChange={(e) =>
                                    handleTableRowChange(field, rowIndex, col.key, e.target.value)
                                  }
                                  className={shared.input}
                                />
                              </td>
                            ))}
                            <td>
                              <button
                                type="button"
                                onClick={() => handleRemoveTableRow(field, rowIndex)}
                                disabled={displayRows.length <= 1}
                                aria-label={`Remove row ${rowIndex + 1}`}
                                className={`${shared.button} ${styles.removeRowButton}`}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      onClick={() => handleAddTableRow(field)}
                      aria-label={`Add row to ${field.label}`}
                      className={`${shared.button} ${styles.addRowButton}`}
                    >
                      + Add Row
                    </button>
                  </div>
                );
              })()}

              {fieldErrors[field.id] && (
                <p role="alert" className={styles.fieldErrorText}>
                  This field is required.
                </p>
              )}
            </div>
          ))}
        </fieldset>
      ))}

      {submitError && (
        <p role="alert" className={`${shared.error} ${styles.submitError}`}>
          {submitError}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleSaveNow}
          className={shared.button}
          aria-label="Save as draft"
        >
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => {
            if (proposalId) {
              navigate(`/proposals/${proposalId}`);
            }
          }}
          className={shared.buttonPrimary}
          aria-label="Go to review"
        >
          Next: Review
        </button>

        {proposalStatus === "DRAFT" && (
          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className={shared.buttonPrimary}
            aria-label="Submit proposal"
          >
            Submit Proposal
          </button>
        )}
      </div>

      {/* Submit confirmation dialog */}
      {showSubmitConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-confirm-title"
          className={styles.modalOverlay}
        >
          <div className={styles.modalCard}>
            <h3 id="submit-confirm-title" className={styles.modalTitle}>
              Submit Proposal
            </h3>
            <p className={styles.modalBody}>
              Once submitted, this version cannot be edited.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className={shared.button}
                aria-label="Cancel submission"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitProposal()}
                disabled={submitting}
                className={`${shared.buttonPrimary} ${submitting ? shared.buttonLoading : ""}`}
                aria-label="Confirm submission"
              >
                {submitting ? "Submitting…" : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
