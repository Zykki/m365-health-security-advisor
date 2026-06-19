import type { CheckStatus } from "@/lib/checks/types";

type ScoredCheck = {
  status: CheckStatus;
};

const statusScore: Record<CheckStatus, number> = {
  OK: 100,
  Warning: 50,
  Critical: 0
};

export function calculateHealthScore(checks: ScoredCheck[]) {
  const okCount = checks.filter((check) => check.status === "OK").length;
  const warningCount = checks.filter(
    (check) => check.status === "Warning"
  ).length;
  const criticalCount = checks.filter(
    (check) => check.status === "Critical"
  ).length;
  const totalScore = checks.reduce(
    (total, check) => total + statusScore[check.status],
    0
  );

  return {
    score: checks.length === 0 ? 0 : Math.round(totalScore / checks.length),
    okCount,
    warningCount,
    criticalCount
  };
}
