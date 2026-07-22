import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ProposalSummary, type PaginatedResponse } from "../../lib/api";
import StatusBadge from "../../components/ui/StatusBadge";
import styles from "../shared.module.css";

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30_000; // refresh every 30s

export default function ProposalListPage() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPage = useCallback(async (pageOffset: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get<PaginatedResponse<ProposalSummary>>(
        `/api/proposals?limit=${PAGE_SIZE}&offset=${pageOffset}`
      );
      setProposals(data.items);
      setTotal(data.total);
      setOffset(pageOffset);
      setError(null);
    } catch (err: unknown) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load proposals");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPage(0);
  }, [fetchPage]);

  // Poll for updates
  useEffect(() => {
    pollRef.current = setInterval(() => {
      void fetchPage(offset, true);
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPage, offset]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.panelTitle}>My Proposals</h2>
          <p className={styles.panelSubtitle}>
            Track drafts, submissions, and decisions in one place.
          </p>
        </div>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={() => navigate("/proposals/new")}
        >
          + Create New Proposal
        </button>
      </div>

      {loading ? (
        <div className={styles.stack} aria-busy="true" aria-label="Loading proposals">
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.notificationItem}>
              <div className={styles.skeleton} style={{ width: "40%", marginBottom: "0.6rem" }} />
              <div className={styles.skeleton} style={{ width: "65%" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className={styles.error} role="alert">
          Couldn't load your proposals: {error}
        </p>
      ) : proposals.length === 0 ? (
        <div className={styles.emptyState}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className={styles.emptyStateIcon}
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 13h6M9 17h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className={styles.emptyStateTitle}>No proposals yet</p>
          <p className={styles.emptyStateHint}>
            Start your first submission — it only takes a few minutes to save a draft.
          </p>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => navigate("/proposals/new")}
          >
            Create New Proposal
          </button>
        </div>
      ) : (
        <>
          <div className={`${styles.stack} ${styles.staggerList}`}>
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => navigate(`/proposals/${proposal.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/proposals/${proposal.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                className={styles.cardInteractive}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 0.25rem",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--prime-heading)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {proposal.title}
                  </p>
                  <p style={{ margin: "0 0 0.4rem", fontSize: "0.85rem", color: "var(--prime-text-muted)" }}>
                    {proposal.proposalType.name}
                  </p>
                  <p className={styles.notificationMeta}>
                    Updated{" "}
                    {new Date(proposal.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StatusBadge status={proposal.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <nav aria-label="Proposal list pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", padding: "1.2rem 0 0.5rem" }}>
              <button
                type="button"
                className={styles.button}
                disabled={currentPage <= 1}
                onClick={() => void fetchPage(offset - PAGE_SIZE)}
                aria-label="Previous page"
              >
                ← Previous
              </button>
              <span style={{ fontSize: "0.85rem", color: "var(--prime-text-muted)" }}>
                Page {currentPage} of {totalPages} ({total} total)
              </span>
              <button
                type="button"
                className={styles.button}
                disabled={currentPage >= totalPages}
                onClick={() => void fetchPage(offset + PAGE_SIZE)}
                aria-label="Next page"
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
