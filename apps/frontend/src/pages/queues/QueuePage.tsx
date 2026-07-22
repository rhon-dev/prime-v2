import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { queuesApi, type QueueKey, type QueueResponse } from "../../lib/api";
import StatusBadge from "../../components/ui/StatusBadge";
import styles from "../shared.module.css";

const POLL_INTERVAL_MS = 15_000; // refresh every 15s for queue pages

const QUEUE_PATHS: Record<QueueKey, string> = {
  focal: "/queue",
  rtec: "/rtec/queue",
  rtec_reviews: "/rtec/reviews",
  rtec_consolidation: "/rtec/consolidation",
  budget: "/budget/queue",
  accounting: "/accounting/queue",
  rd: "/rd/queue",
};

export default function QueuePage({
  queueKey,
  title,
  description,
}: {
  queueKey: QueueKey;
  title: string;
  description: string;
}) {
  const navigate = useNavigate();

  function detailPath(proposalId: string): string {
    if (queueKey === "rtec_reviews") return `/rtec/reviews/${proposalId}`;
    if (queueKey === "rtec_consolidation") return `/rtec/consolidation/${proposalId}`;
    return `/proposals/${proposalId}`;
  }

  const [data, setData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQueue = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await queuesApi.get(queueKey);
      setData(result);
      if (!silent) setError(null);
    } catch (err: unknown) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load queue");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [queueKey]);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  // Poll for real-time updates
  useEffect(() => {
    pollRef.current = setInterval(() => {
      void fetchQueue(true);
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchQueue]);

  if (loading) {
    return <p className={styles.loading}>Loading queue…</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{title}</h2>
          <p className={styles.panelSubtitle}>{description}</p>
        </div>
        <span className={styles.badgeBlue}>{data?.total ?? 0} items</span>
      </div>

      {!data || data.proposals.length === 0 ? (
        <p className={styles.empty}>
          No proposals in this queue right now. Items appear here when proposals
          reach the matching workflow status
          {queueKey === "focal" ? " and you are assigned as Project Focal" : ""}.
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className={styles.clickRow}
                  onClick={() => navigate(detailPath(proposal.id))}
                >
                  <td>{proposal.title}</td>
                  <td>{proposal.proposalType.name}</td>
                  <td>
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td>
                    {new Date(proposal.updatedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { QUEUE_PATHS };
