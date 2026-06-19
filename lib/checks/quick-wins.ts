import type { CheckStatus, SecurityImpact } from "@/lib/checks/types";

export type QuickWin = {
  id: string;
  title: string;
  status: Exclude<CheckStatus, "OK">;
  value: string;
  recommendation: string;
  securityImpact: SecurityImpact;
  estimatedEffortMinutes: number;
};

type QuickWinCandidate = {
  id: string;
  title: string;
  status: CheckStatus;
  value: string;
  recommendation: string;
  securityImpact: SecurityImpact;
  estimatedEffortMinutes: number;
};

const statusRank: Record<Exclude<CheckStatus, "OK">, number> = {
  Critical: 0,
  Warning: 1
};

const impactRank: Record<SecurityImpact, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3
};

function isQuickWinCandidate(
  check: QuickWinCandidate
): check is QuickWinCandidate & { status: Exclude<CheckStatus, "OK"> } {
  return (
    check.status !== "OK" &&
    (check.securityImpact === "Critical" || check.securityImpact === "High") &&
    check.estimatedEffortMinutes <= 60
  );
}

export function getQuickWins(checks: QuickWinCandidate[]): QuickWin[] {
  return checks
    .filter(isQuickWinCandidate)
    .sort((first, second) => {
      const statusDelta = statusRank[first.status] - statusRank[second.status];

      if (statusDelta !== 0) {
        return statusDelta;
      }

      const impactDelta =
        impactRank[first.securityImpact] - impactRank[second.securityImpact];

      if (impactDelta !== 0) {
        return impactDelta;
      }

      return first.estimatedEffortMinutes - second.estimatedEffortMinutes;
    })
    .slice(0, 3)
    .map((check) => ({
      id: check.id,
      title: check.title,
      status: check.status,
      value: check.value,
      recommendation: check.recommendation,
      securityImpact: check.securityImpact,
      estimatedEffortMinutes: check.estimatedEffortMinutes
    }));
}
