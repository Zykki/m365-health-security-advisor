"use client";

import { useEffect, useState } from "react";

type UsersOverview = {
  totalUsers: number;
  members: number;
  guests: number;
  enabledUsers: number;
  disabledUsers: number;
};

type UsersOverviewState =
  | { status: "loading" }
  | { status: "loaded"; overview: UsersOverview }
  | { status: "error" };

const metrics: Array<{
  key: keyof UsersOverview;
  label: string;
}> = [
  { key: "totalUsers", label: "Total Users" },
  { key: "members", label: "Members" },
  { key: "guests", label: "Guests" },
  { key: "enabledUsers", label: "Enabled Users" },
  { key: "disabledUsers", label: "Disabled Users" }
];

function isUsersOverview(value: unknown): value is UsersOverview {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return metrics.every(({ key }) => typeof payload[key] === "number");
}

export function UsersOverview() {
  const [state, setState] = useState<UsersOverviewState>({
    status: "loading"
  });

  useEffect(() => {
    let isMounted = true;

    async function loadUsersOverview() {
      try {
        const response = await fetch("/api/graph/users/overview", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to load users overview");
        }

        const payload = (await response.json()) as unknown;

        if (!isUsersOverview(payload)) {
          throw new Error("Invalid users overview response");
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

    void loadUsersOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="overview-section" aria-label="Users overview">
      <div className="section-heading">
        <p className="eyebrow">Microsoft Graph</p>
        <h2>Users Overview</h2>
      </div>

      {state.status === "error" ? (
        <p className="error-message">Unable to load users overview</p>
      ) : (
        <div className="overview-grid">
          {metrics.map(({ key, label }) => (
            <article key={key}>
              <span>{label}</span>
              <strong>
                {state.status === "loading"
                  ? "Loading..."
                  : state.overview[key].toLocaleString()}
              </strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
