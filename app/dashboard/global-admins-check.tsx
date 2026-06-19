"use client";

import { useEffect, useState } from "react";
import { SecurityCheckCard } from "@/app/dashboard/security-check-card";

type GlobalAdminsCheck = {
  count: number;
  status: "OK" | "Warning" | "Critical";
  recommendation: string;
};

type GlobalAdminsCheckState =
  | { status: "loading" }
  | { status: "loaded"; check: GlobalAdminsCheck }
  | { status: "error" };

function isGlobalAdminsCheck(value: unknown): value is GlobalAdminsCheck {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.count === "number" &&
    (payload.status === "OK" ||
      payload.status === "Warning" ||
      payload.status === "Critical") &&
    typeof payload.recommendation === "string"
  );
}

export function GlobalAdminsCheck() {
  const [state, setState] = useState<GlobalAdminsCheckState>({
    status: "loading"
  });

  useEffect(() => {
    let isMounted = true;

    async function loadGlobalAdminsCheck() {
      try {
        const response = await fetch("/api/graph/admins/global-admins", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to load Global Admin count");
        }

        const payload = (await response.json()) as unknown;

        if (!isGlobalAdminsCheck(payload)) {
          throw new Error("Invalid Global Admin count response");
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

    void loadGlobalAdminsCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SecurityCheckCard
      title="Global Admins"
      value={state.status === "loaded" ? state.check.count : undefined}
      status={state.status === "loaded" ? state.check.status : undefined}
      recommendation={
        state.status === "loaded" ? state.check.recommendation : undefined
      }
      loading={state.status === "loading"}
      error={
        state.status === "error"
          ? "Unable to load Global Admin count"
          : undefined
      }
    />
  );
}
