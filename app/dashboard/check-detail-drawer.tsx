"use client";

import { useEffect } from "react";
import type { DashboardCheck } from "@/lib/dashboard/overview";

type CheckDetailDrawerProps = {
  check: DashboardCheck | null;
  onClose: () => void;
};

export function CheckDetailDrawer({ check, onClose }: CheckDetailDrawerProps) {
  useEffect(() => {
    if (!check) {
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
  }, [check, onClose]);

  if (!check) {
    return null;
  }

  return (
    <div className="drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="check-detail-drawer"
        aria-label={`${check.title} detail`}
        aria-modal="true"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{check.kind}</p>
            <h2>{check.title}</h2>
          </div>
          <button type="button" className="drawer-close" onClick={onClose}>
            Close
          </button>
        </div>

        <dl className="drawer-summary">
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`status-pill status-${check.status.toLowerCase()}`}>
                {check.status}
              </span>
            </dd>
          </div>
          <div>
            <dt>Current Value</dt>
            <dd>{check.value}</dd>
          </div>
        </dl>

        <div className="drawer-section">
          <h3>Description</h3>
          <p>{check.description}</p>
        </div>
        <div className="drawer-section">
          <h3>Why it matters</h3>
          <p>{check.whyItMatters}</p>
        </div>
        <div className="drawer-section">
          <h3>Recommendation</h3>
          <p>{check.recommendation}</p>
        </div>
        <div className="drawer-section">
          <h3>How to fix</h3>
          <p>{check.howToFix}</p>
        </div>
      </aside>
    </div>
  );
}
