"use client";

import { useEffect } from "react";

export type ScanDetailCheckResult = {
  checkId: string;
  title: string;
  status: string;
  value: string;
  recommendation: string;
};

export type ScanDetail = {
  id: string;
  createdAt: string;
  healthScore: number;
  okCount: number;
  warningCount: number;
  criticalCount: number;
  checkResults: ScanDetailCheckResult[];
};

type ScanDetailDrawerProps = {
  error?: string;
  loading: boolean;
  scan: ScanDetail | null;
  onClose: () => void;
};

function formatScanDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ScanDetailDrawer({
  error,
  loading,
  scan,
  onClose
}: ScanDetailDrawerProps) {
  const isOpen = loading || Boolean(error) || Boolean(scan);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="check-detail-drawer"
        aria-label="Scan detail"
        aria-modal="true"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Saved Snapshot</p>
            <h2>Scan Detail</h2>
          </div>
          <button type="button" className="drawer-close" onClick={onClose}>
            Close
          </button>
        </div>

        {loading ? (
          <p className="drawer-state">Loading scan detail...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : scan ? (
          <>
            <dl className="drawer-summary">
              <div>
                <dt>Date</dt>
                <dd>{formatScanDate(scan.createdAt)}</dd>
              </div>
              <div>
                <dt>Health Score</dt>
                <dd>{scan.healthScore} / 100</dd>
              </div>
            </dl>

            <div className="scan-detail-counts" aria-label="Scan status counts">
              <span>OK: {scan.okCount}</span>
              <span>Warning: {scan.warningCount}</span>
              <span>Critical: {scan.criticalCount}</span>
            </div>

            <div className="drawer-section">
              <h3>Check Results</h3>
              <div className="scan-result-list">
                {scan.checkResults.map((result) => (
                  <article className="scan-result-card" key={result.checkId}>
                    <div className="scan-result-header">
                      <div>
                        <span>{result.checkId}</span>
                        <h4>{result.title}</h4>
                      </div>
                      <span
                        className={`status-pill status-${result.status.toLowerCase()}`}
                      >
                        {result.status}
                      </span>
                    </div>
                    <dl>
                      <div>
                        <dt>Value</dt>
                        <dd>{result.value}</dd>
                      </div>
                    </dl>
                    <p>{result.recommendation}</p>
                  </article>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
