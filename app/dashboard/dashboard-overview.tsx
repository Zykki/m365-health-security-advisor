"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckDetailDrawer } from "@/app/dashboard/check-detail-drawer";
import { SecurityCheckCard } from "@/app/dashboard/security-check-card";
import type { DashboardCheck, DashboardOverview } from "@/lib/dashboard/overview";

type DashboardOverviewState =
  | { status: "loading" }
  | { status: "loaded"; overview: DashboardOverview }
  | { status: "session_expired"; message: string; action: string }
  | { status: "error" };

type DashboardErrorPayload = {
  error?: {
    code?: unknown;
    message?: unknown;
    action?: unknown;
  };
};

type SessionExpiredPayload = {
  error: {
    code: "SESSION_EXPIRED";
    message: string;
    action: string;
  };
};

const userMetrics: Array<{
  key: keyof DashboardOverview["users"];
  label: string;
}> = [
  { key: "total", label: "Total Users" },
  { key: "members", label: "Members" },
  { key: "guests", label: "Guests" },
  { key: "enabled", label: "Enabled Users" },
  { key: "disabled", label: "Disabled Users" }
];

function isDashboardOverview(value: unknown): value is DashboardOverview {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const tenant = payload.tenant as Record<string, unknown> | undefined;
  const users = payload.users as Record<string, unknown> | undefined;
  const healthScore = payload.healthScore as Record<string, unknown> | undefined;

  return (
    !!tenant &&
    !!users &&
    !!healthScore &&
    Array.isArray(payload.checks) &&
    Array.isArray(payload.quickWins) &&
    userMetrics.every(({ key }) => typeof users[key] === "number") &&
    typeof healthScore.score === "number" &&
    typeof healthScore.okCount === "number" &&
    typeof healthScore.warningCount === "number" &&
    typeof healthScore.criticalCount === "number"
  );
}

function getCheckLabel(check: DashboardOverview["checks"][number]) {
  if (check.kind === "Governance") {
    return "Governance signal";
  }

  if (check.kind === "Hygiene") {
    return "Tenant hygiene signal";
  }

  return "Security check";
}

function getChecksById(
  overview: DashboardOverview,
  ids: string[]
): DashboardOverview["checks"] {
  return ids
    .map((id) => overview.checks.find((check) => check.id === id))
    .filter((check): check is DashboardOverview["checks"][number] =>
      Boolean(check)
    );
}

function getHealthScoreTone(score: number) {
  if (score >= 80) {
    return "ok";
  }

  if (score >= 60) {
    return "warning";
  }

  return "critical";
}

function isSessionExpiredPayload(
  value: unknown
): value is SessionExpiredPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as DashboardErrorPayload;

  return (
    payload.error?.code === "SESSION_EXPIRED" &&
    typeof payload.error.message === "string" &&
    typeof payload.error.action === "string"
  );
}

export function DashboardOverviewPanel() {
  const [state, setState] = useState<DashboardOverviewState>({
    status: "loading"
  });
  const [selectedCheck, setSelectedCheck] = useState<DashboardCheck | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        const response = await fetch("/api/dashboard/overview", {
          cache: "no-store"
        });
        const payload = (await response.json()) as unknown;

        if (!response.ok) {
          if (response.status === 401 && isSessionExpiredPayload(payload)) {
            if (isMounted) {
              setState({
                status: "session_expired",
                message: payload.error.message,
                action: payload.error.action
              });
            }

            return;
          }

          throw new Error("Unable to load dashboard overview");
        }

        if (!isDashboardOverview(payload)) {
          throw new Error("Invalid dashboard overview response");
        }

        if (isMounted) {
          setState({ status: "loaded", overview: payload });
        }
      } catch {
        if (isMounted) {
          setState({ status: "error" });
        }
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === "error") {
    return <p className="error-message">Unable to load dashboard overview</p>;
  }

  if (state.status === "session_expired") {
    return (
      <section className="dashboard-section" aria-labelledby="session-expired">
        <div className="section-heading">
          <p className="eyebrow">Microsoft Graph</p>
          <h2 id="session-expired">Session expired</h2>
        </div>
        <div className="session-expired-card">
          <p>{state.message}</p>
          <p>{state.action}</p>
          <Link className="sign-out-link" href="/api/auth/signout">
            Sign out
          </Link>
        </div>
      </section>
    );
  }

  const overview = state.status === "loaded" ? state.overview : null;
  const tenant = overview?.tenant;
  const healthScore = overview?.healthScore;
  const quickWins = overview?.quickWins ?? [];
  const securityChecks = overview
    ? getChecksById(overview, ["SEC-001", "SEC-002", "SEC-003"])
    : [];
  const governanceChecks = overview
    ? getChecksById(overview, ["GOV-001", "HYG-001"])
    : [];

  return (
    <>
      <section className="health-score-card" aria-label="Security score">
        <div>
          <p className="eyebrow">Health Score</p>
          <h2>Security Score</h2>
        </div>
        <div
          className={
            state.status === "loaded" && healthScore
              ? `health-score-value score-${getHealthScoreTone(
                  healthScore.score
                )}`
              : "health-score-value"
          }
        >
          <strong>
            {state.status === "loading" ? "Loading..." : healthScore?.score}
          </strong>
          <span>/ 100</span>
        </div>
        <div className="health-score-counts">
          <span>OK: {state.status === "loading" ? "-" : healthScore?.okCount}</span>
          <span>
            Warning:{" "}
            {state.status === "loading" ? "-" : healthScore?.warningCount}
          </span>
          <span>
            Critical:{" "}
            {state.status === "loading" ? "-" : healthScore?.criticalCount}
          </span>
        </div>
      </section>

      <section className="quick-wins-section" aria-labelledby="quick-wins">
        <div className="section-heading">
          <p className="eyebrow">Prioritized Actions</p>
          <h2 id="quick-wins">Quick Wins</h2>
        </div>

        {state.status === "loading" ? (
          <div className="quick-wins-grid">
            {["Quick win 1", "Quick win 2", "Quick win 3"].map((title) => (
              <article className="quick-win-card" key={title}>
                <span>Loading...</span>
              </article>
            ))}
          </div>
        ) : quickWins.length === 0 ? (
          <p className="quick-wins-empty">
            No quick wins found. All high-impact checks are currently OK.
          </p>
        ) : (
          <div className="quick-wins-grid">
            {quickWins.map((quickWin) => {
              const check = overview?.checks.find(
                (candidate) => candidate.id === quickWin.id
              );

              return (
                <button
                  className="quick-win-card"
                  key={quickWin.id}
                  type="button"
                  onClick={() => {
                    if (check) {
                      setSelectedCheck(check);
                    }
                  }}
                >
                  <div className="quick-win-header">
                    <h3>{quickWin.title}</h3>
                    <span
                      className={`status-pill status-${quickWin.status.toLowerCase()}`}
                    >
                      {quickWin.status}
                    </span>
                  </div>
                  <div className="quick-win-meta">
                    <span>{quickWin.estimatedEffortMinutes} min</span>
                    <span>{quickWin.securityImpact} impact</span>
                  </div>
                  <p>{quickWin.recommendation}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section
        id="overview"
        className="dashboard-section"
        aria-labelledby="tenant-overview"
      >
        <div className="section-heading">
          <p className="eyebrow">Tenant</p>
          <h2 id="tenant-overview">Tenant Overview</h2>
        </div>

        <div className="identity-grid" aria-label="Prihlaseny pouzivatel">
          <article>
            <span>Meno</span>
            <strong>
              {state.status === "loading" ? "Loading..." : tenant?.name}
            </strong>
          </article>
          <article>
            <span>Email</span>
            <strong>
              {state.status === "loading" ? "Loading..." : tenant?.email}
            </strong>
          </article>
          <article>
            <span>Tenant ID</span>
            <strong>
              {state.status === "loading"
                ? "Loading..."
                : tenant?.tenantId ?? "Nenajdeny v tokene"}
            </strong>
          </article>
        </div>

        <section className="overview-section" aria-label="Users overview">
          <div className="section-heading">
            <p className="eyebrow">Microsoft Graph</p>
            <h2>Users Overview</h2>
          </div>

          <div className="overview-grid">
            {userMetrics.map(({ key, label }) => (
              <article key={key}>
                <span>{label}</span>
                <strong>
                  {state.status === "loading"
                    ? "Loading..."
                    : overview?.users[key].toLocaleString()}
                </strong>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section
        id="security"
        className="dashboard-section"
        aria-labelledby="security-checks"
      >
        <div className="section-heading">
          <p className="eyebrow">Security</p>
          <h2 id="security-checks">Security Checks</h2>
        </div>

        <div className="checks-stack">
          {state.status === "loading"
            ? [
                "Global Admin Count",
                "MFA Registration Coverage",
                "Admin Accounts Hygiene"
              ].map((title) => (
                <SecurityCheckCard key={title} title={title} loading />
              ))
            : securityChecks.map((check) => (
                <SecurityCheckCard
                  key={check.id}
                  title={check.title}
                  label={getCheckLabel(check)}
                  value={check.value}
                  status={check.status}
                  recommendation={check.recommendation}
                  onOpen={() => setSelectedCheck(check)}
                />
              ))}
        </div>
      </section>

      <section
        id="governance"
        className="dashboard-section"
        aria-labelledby="governance-hygiene"
      >
        <div className="section-heading">
          <p className="eyebrow">Governance</p>
          <h2 id="governance-hygiene">Governance & Hygiene Signals</h2>
        </div>

        <div className="checks-stack">
          {state.status === "loading"
            ? ["Guest Users Governance", "Disabled Users Hygiene"].map(
                (title) => (
                  <SecurityCheckCard key={title} title={title} loading />
                )
              )
            : governanceChecks.map((check) => (
                <SecurityCheckCard
                  key={check.id}
                  title={check.title}
                  label={getCheckLabel(check)}
                  value={check.value}
                  status={check.status}
                  recommendation={check.recommendation}
                  onOpen={() => setSelectedCheck(check)}
                />
              ))}
        </div>
      </section>

      <CheckDetailDrawer
        check={selectedCheck}
        onClose={() => setSelectedCheck(null)}
      />
    </>
  );
}
