"use client";

import { useEffect, useState } from "react";
import { SecurityCheckCard } from "@/app/dashboard/security-check-card";

type DisabledUsersHygieneCheck = {
  disabledUsers: number;
  enabledUsers: number;
  disabledRatio: number;
  status: "OK" | "Warning" | "Critical";
  recommendation: string;
};

type DisabledUsersHygieneCheckState =
  | { status: "loading" }
  | { status: "loaded"; check: DisabledUsersHygieneCheck }
  | { status: "error" };

function isDisabledUsersHygieneCheck(
  value: unknown
): value is DisabledUsersHygieneCheck {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.disabledUsers === "number" &&
    typeof payload.enabledUsers === "number" &&
    typeof payload.disabledRatio === "number" &&
    (payload.status === "OK" ||
      payload.status === "Warning" ||
      payload.status === "Critical") &&
    typeof payload.recommendation === "string"
  );
}

export function DisabledUsersHygieneCheck() {
  const [state, setState] = useState<DisabledUsersHygieneCheckState>({
    status: "loading"
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDisabledUsersHygieneCheck() {
      try {
        const response = await fetch("/api/graph/users/disabled-hygiene", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to load Disabled Users Hygiene");
        }

        const payload = (await response.json()) as unknown;

        if (!isDisabledUsersHygieneCheck(payload)) {
          throw new Error("Invalid Disabled Users Hygiene response");
        }

        if (isMounted) {
          setState({ status: "loaded", check: payload });
        }
      } catch {
        if (isMounted) {
          setState({ status: "error" });
        }
      }
    }

    void loadDisabledUsersHygieneCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SecurityCheckCard
      title="Disabled Users Hygiene"
      label="Tenant hygiene signal"
      value={
        state.status === "loaded"
          ? `${state.check.disabledUsers.toLocaleString()} disabled / ${state.check.disabledRatio} %`
          : undefined
      }
      status={state.status === "loaded" ? state.check.status : undefined}
      recommendation={
        state.status === "loaded" ? state.check.recommendation : undefined
      }
      loading={state.status === "loading"}
      error={
        state.status === "error"
          ? "Unable to load Disabled Users Hygiene"
          : undefined
      }
    />
  );
}
