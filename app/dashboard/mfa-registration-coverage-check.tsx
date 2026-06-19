"use client";

import { useEffect, useState } from "react";
import { SecurityCheckCard } from "@/app/dashboard/security-check-card";

type MfaRegistrationCoverageCheck = {
  totalUsers: number;
  registeredUsers: number;
  registrationCoverage: number;
  status: "OK" | "Warning" | "Critical";
  recommendation: string;
};

type MfaRegistrationCoverageCheckState =
  | { status: "loading" }
  | { status: "loaded"; check: MfaRegistrationCoverageCheck }
  | { status: "error"; message: string };

function isMfaRegistrationCoverageCheck(
  value: unknown
): value is MfaRegistrationCoverageCheck {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.totalUsers === "number" &&
    typeof payload.registeredUsers === "number" &&
    typeof payload.registrationCoverage === "number" &&
    (payload.status === "OK" ||
      payload.status === "Warning" ||
      payload.status === "Critical") &&
    typeof payload.recommendation === "string"
  );
}

function getErrorMessage(value: unknown) {
  if (!value || typeof value !== "object") {
    return "Unable to load MFA Registration Coverage";
  }

  const payload = value as Record<string, unknown>;

  return typeof payload.error === "string"
    ? payload.error
    : "Unable to load MFA Registration Coverage";
}

export function MfaRegistrationCoverageCheck() {
  const [state, setState] = useState<MfaRegistrationCoverageCheckState>({
    status: "loading"
  });

  useEffect(() => {
    let isMounted = true;

    async function loadMfaRegistrationCoverageCheck() {
      try {
        const response = await fetch("/api/graph/authentication/mfa-coverage", {
          cache: "no-store"
        });
        const payload = (await response.json()) as unknown;

        if (!response.ok) {
          throw new Error(getErrorMessage(payload));
        }

        if (!isMfaRegistrationCoverageCheck(payload)) {
          throw new Error("Invalid MFA Registration Coverage response");
        }

        if (isMounted) {
          setState({ status: "loaded", check: payload });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load MFA Registration Coverage"
          });
        }
      }
    }

    void loadMfaRegistrationCoverageCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SecurityCheckCard
      title="MFA Registration Coverage"
      label="Security check"
      value={
        state.status === "loaded"
          ? `${state.check.registrationCoverage} %`
          : undefined
      }
      status={state.status === "loaded" ? state.check.status : undefined}
      recommendation={
        state.status === "loaded" ? state.check.recommendation : undefined
      }
      loading={state.status === "loading"}
      error={state.status === "error" ? state.message : undefined}
    />
  );
}
