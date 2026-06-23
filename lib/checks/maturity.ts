import { calculateHealthScore } from "@/lib/checks/scoring";
import type { CheckDomain, CheckStatus } from "@/lib/checks/types";

type MaturityCheck = {
  domain: CheckDomain;
  status: CheckStatus;
};

export type MaturityScore = {
  score: number;
  okCount: number;
  warningCount: number;
  criticalCount: number;
};

export type MaturityLevel =
  | "Initial"
  | "Developing"
  | "Managed"
  | "Optimized";

export function calculateDomainScore(
  checks: MaturityCheck[],
  domain: CheckDomain
): MaturityScore {
  return calculateHealthScore(
    checks.filter((check) => check.domain === domain)
  );
}

export function getMaturityLevel(score: number): { level: MaturityLevel } {
  if (score >= 80) {
    return { level: "Optimized" };
  }

  if (score >= 60) {
    return { level: "Managed" };
  }

  if (score >= 40) {
    return { level: "Developing" };
  }

  return { level: "Initial" };
}
