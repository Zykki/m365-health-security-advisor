import { checkDefinitions } from "@/lib/checks/definitions";
import type { CheckStatus } from "@/lib/checks/types";

export function getGlobalAdminRecommendation(status: CheckStatus) {
  if (status === "Critical") {
    return "Add at least two break-glass protected Global Admin accounts.";
  }

  if (status === "Warning") {
    return "Keep Global Admin accounts between two and four where possible.";
  }

  return checkDefinitions.globalAdminCount.recommendation;
}

export function getGuestUsersGovernanceRecommendation(status: CheckStatus) {
  if (status === "Warning" || status === "Critical") {
    return "High guest user ratio is not automatically a misconfiguration. It indicates that external access should be reviewed regularly and stale guest accounts should be removed.";
  }

  return checkDefinitions.guestUsersGovernance.recommendation;
}

export function getDisabledUsersHygieneRecommendation() {
  return checkDefinitions.disabledUsersHygiene.recommendation;
}

export function getMfaRegistrationCoverageRecommendation(status: CheckStatus) {
  if (status === "OK") {
    return checkDefinitions.mfaRegistrationCoverage.recommendation;
  }

  return "MFA registration coverage is below the desired target. Continue onboarding users to modern MFA methods.";
}

export function getAdminAccountsHygieneRecommendation() {
  return checkDefinitions.adminAccountsHygiene.recommendation;
}

export function getBreakGlassAccountsRecommendation(status: CheckStatus) {
  if (status === "Critical") {
    return "No likely break-glass accounts were found by naming heuristic. Maintain two cloud-only emergency access accounts and monitor their use.";
  }

  if (status === "Warning") {
    return "Only one likely break-glass account was found by naming heuristic. Maintain two protected emergency access accounts where possible.";
  }

  return checkDefinitions.breakGlassAccounts.recommendation;
}
