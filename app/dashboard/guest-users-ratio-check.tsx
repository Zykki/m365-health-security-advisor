"use client";

import { useEffect, useState } from "react";
import { SecurityCheckCard } from "@/app/dashboard/security-check-card";

type GuestUsersRatioCheck = {
  guests: number;
  members: number;
  guestRatio: number;
  status: "OK" | "Warning" | "Critical";
  recommendation: string;
};

type GuestUsersRatioCheckState =
  | { status: "loading" }
  | { status: "loaded"; check: GuestUsersRatioCheck }
  | { status: "error" };

function isGuestUsersRatioCheck(
  value: unknown
): value is GuestUsersRatioCheck {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.guests === "number" &&
    typeof payload.members === "number" &&
    typeof payload.guestRatio === "number" &&
    (payload.status === "OK" ||
      payload.status === "Warning" ||
      payload.status === "Critical") &&
    typeof payload.recommendation === "string"
  );
}

export function GuestUsersRatioCheck() {
  const [state, setState] = useState<GuestUsersRatioCheckState>({
    status: "loading"
  });

  useEffect(() => {
    let isMounted = true;

    async function loadGuestUsersRatioCheck() {
      try {
        const response = await fetch("/api/graph/users/guest-ratio", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to load Guest Users Ratio");
        }

        const payload = (await response.json()) as unknown;

        if (!isGuestUsersRatioCheck(payload)) {
          throw new Error("Invalid Guest Users Ratio response");
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

    void loadGuestUsersRatioCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SecurityCheckCard
      title="Guest Users Ratio"
      value={
        state.status === "loaded" ? `${state.check.guestRatio} %` : undefined
      }
      status={state.status === "loaded" ? state.check.status : undefined}
      recommendation={
        state.status === "loaded" ? state.check.recommendation : undefined
      }
      loading={state.status === "loading"}
      error={
        state.status === "error"
          ? "Unable to load Guest Users Ratio"
          : undefined
      }
    />
  );
}
