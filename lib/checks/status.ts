import type { CheckStatus } from "@/lib/checks/types";

export function getGlobalAdminStatus(count: number): CheckStatus {
  if (count === 0) {
    return "Critical";
  }

  if (count === 1 || count >= 5) {
    return "Warning";
  }

  return "OK";
}

export function getGuestUsersGovernanceStatus(
  guestRatio: number
): CheckStatus {
  if (guestRatio <= 10) {
    return "OK";
  }

  if (guestRatio <= 25) {
    return "Warning";
  }

  return "Critical";
}

export function getDisabledUsersHygieneStatus(
  disabledUsers: number,
  disabledRatio: number
): CheckStatus {
  if (disabledUsers === 0 || disabledRatio <= 5) {
    return "OK";
  }

  if (disabledRatio <= 15) {
    return "Warning";
  }

  return "Critical";
}
