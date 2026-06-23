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

export function getAdminMfaCoverageRecommendation(status: CheckStatus) {
  if (status === "OK") {
    return checkDefinitions.adminMfaCoverage.recommendation;
  }

  if (status === "Warning") {
    return "Some privileged administrator accounts are not registered for MFA. Complete registration for every admin account.";
  }

  return "Privileged administrator MFA registration is below the desired baseline. Require MFA registration for all admin accounts as a priority.";
}

export function getConditionalAccessBaselineRecommendation(
  status: CheckStatus
) {
  if (status === "Critical") {
    return "No enabled Conditional Access policies were found. Create and enable baseline policies for administrators and standard users.";
  }

  if (status === "Warning") {
    return "Only a small number of Conditional Access policies are enabled. Review whether admins and standard users are covered by baseline policies.";
  }

  return checkDefinitions.conditionalAccessBaseline.recommendation;
}

export function getLegacyAuthenticationRecommendation(status: CheckStatus) {
  if (status === "OK") {
    return checkDefinitions.legacyAuthentication.recommendation;
  }

  if (status === "Critical") {
    return "Legacy authentication exposure appears high. Enable Security Defaults or deploy Conditional Access policies that block legacy client protocols.";
  }

  return "Legacy authentication exposure is not fully resolved by the available signals. Review Security Defaults, Conditional Access policies and Secure Score recommendations.";
}
