import { checkDefinitions } from "@/lib/checks/definitions";
import { assessLegacyAuthenticationExposure } from "@/lib/checks/legacy-auth-assessment";
import {
  getAdminAccountsHygieneRecommendation,
  getAdminMfaCoverageRecommendation,
  getBreakGlassAccountsRecommendation,
  getConditionalAccessBaselineRecommendation,
  getDisabledUsersHygieneRecommendation,
  getGlobalAdminRecommendation,
  getGuestUsersGovernanceRecommendation,
  getLegacyAuthenticationRecommendation,
  getMfaRegistrationCoverageRecommendation
} from "@/lib/checks/recommendations";
import { calculateHealthScore } from "@/lib/checks/scoring";
import { getQuickWins } from "@/lib/checks/quick-wins";
import type { QuickWin } from "@/lib/checks/quick-wins";
import {
  getAdminAccountsHygieneStatus,
  getAdminMfaCoverageStatus,
  getBreakGlassAccountsStatus,
  getConditionalAccessBaselineStatus,
  getDisabledUsersHygieneStatus,
  getGlobalAdminStatus,
  getGuestUsersGovernanceStatus,
  getLegacyAuthenticationStatusResult,
  getMfaRegistrationCoverageStatus
} from "@/lib/checks/status";
import type { CheckCategory, CheckKind, CheckStatus } from "@/lib/checks/types";
import type { CheckDefinition } from "@/lib/checks/types";
import {
  getBreakGlassCandidates,
  getPrivilegedRoleMemberSummary
} from "@/lib/graph/admins";
import {
  getAdminMfaCoverage,
  getMfaRegistrationCoverage
} from "@/lib/graph/authentication-methods";
import {
  getConditionalAccessBaseline,
  getLegacyAuthConditionalAccessEvidence
} from "@/lib/graph/conditional-access";
import { getLegacyAuthSecureScoreEvidence } from "@/lib/graph/secure-score";
import { getSecurityDefaultsStatus } from "@/lib/graph/security-defaults";
import {
  getDisabledUserCount,
  getEnabledUserCount,
  getGuestCount,
  getMemberCount,
  getUserCount
} from "@/lib/graph/users";

type DashboardTenantInput = {
  name: string | null;
  email: string | null;
  tenantId: string | null;
};

export type DashboardCheck = {
  id: string;
  title: string;
  kind: CheckKind;
  category: CheckCategory;
  value: string;
  status: CheckStatus;
  description: string;
  whyItMatters: string;
  recommendation: string;
  howToFix: string;
  securityImpact: CheckDefinition["securityImpact"];
  operationalImpact: CheckDefinition["operationalImpact"];
  estimatedEffortMinutes: number;
  licenseRequired: string;
  source: string;
  details?: Record<string, unknown>;
};

export type DashboardOverview = {
  tenant: DashboardTenantInput;
  users: {
    total: number;
    members: number;
    guests: number;
    enabled: number;
    disabled: number;
  };
  healthScore: {
    score: number;
    okCount: number;
    warningCount: number;
    criticalCount: number;
  };
  quickWins: QuickWin[];
  checks: DashboardCheck[];
};

function getCheckMetadata(definition: CheckDefinition) {
  return {
    securityImpact: definition.securityImpact,
    operationalImpact: definition.operationalImpact,
    estimatedEffortMinutes: definition.estimatedEffortMinutes,
    licenseRequired: definition.licenseRequired,
    source: definition.source
  };
}

export async function getDashboardOverview(
  accessToken: string,
  tenant: DashboardTenantInput
): Promise<DashboardOverview> {
  const [
    totalUsers,
    members,
    guests,
    enabledUsers,
    disabledUsers,
    privilegedRoleSummary,
    breakGlassCandidateSummary,
    adminMfaCoverage,
    securityDefaultsStatus,
    legacyAuthConditionalAccessEvidence,
    legacyAuthSecureScoreEvidence,
    conditionalAccessBaseline,
    mfaCoverage
  ] = await Promise.all([
    getUserCount(accessToken),
    getMemberCount(accessToken),
    getGuestCount(accessToken),
    getEnabledUserCount(accessToken),
    getDisabledUserCount(accessToken),
    getPrivilegedRoleMemberSummary(accessToken),
    getBreakGlassCandidates(accessToken),
    getAdminMfaCoverage(accessToken),
    getSecurityDefaultsStatus(accessToken),
    getLegacyAuthConditionalAccessEvidence(accessToken),
    getLegacyAuthSecureScoreEvidence(accessToken),
    getConditionalAccessBaseline(accessToken),
    getMfaRegistrationCoverage(accessToken)
  ]);

  const guestTotal = members + guests;
  const guestRatio =
    guestTotal === 0 ? 0 : Math.round((guests / guestTotal) * 100);
  const disabledTotal = enabledUsers + disabledUsers;
  const disabledRatio =
    disabledTotal === 0
      ? 0
      : Math.round((disabledUsers / disabledTotal) * 100);
  const globalAdminStatus = getGlobalAdminStatus(
    privilegedRoleSummary.globalAdmins
  );
  const mfaStatus = getMfaRegistrationCoverageStatus(
    mfaCoverage.registrationCoverage
  );
  const adminAccountsHygieneStatus = getAdminAccountsHygieneStatus(
    privilegedRoleSummary.globalAdmins,
    privilegedRoleSummary.privilegedAdmins
  );
  const breakGlassAccountsStatus = getBreakGlassAccountsStatus(
    breakGlassCandidateSummary.count
  );
  const adminMfaCoverageStatus = getAdminMfaCoverageStatus(
    adminMfaCoverage.coverage,
    adminMfaCoverage.totalAdmins
  );
  const legacyAuthenticationAssessment = assessLegacyAuthenticationExposure({
    securityDefaults: securityDefaultsStatus,
    conditionalAccess: legacyAuthConditionalAccessEvidence,
    secureScore: legacyAuthSecureScoreEvidence
  });
  const legacyAuthenticationCheckStatus = getLegacyAuthenticationStatusResult(
    legacyAuthenticationAssessment.exposure
  );
  const conditionalAccessBaselineStatus = getConditionalAccessBaselineStatus(
    conditionalAccessBaseline.totalPolicies,
    conditionalAccessBaseline.enabledPolicies
  );
  const guestGovernanceStatus = getGuestUsersGovernanceStatus(guestRatio);
  const disabledHygieneStatus = getDisabledUsersHygieneStatus(
    disabledUsers,
    disabledRatio
  );
  const checks: DashboardCheck[] = [
    {
      id: checkDefinitions.globalAdminCount.id,
      title: checkDefinitions.globalAdminCount.title,
      kind: checkDefinitions.globalAdminCount.kind,
      category: checkDefinitions.globalAdminCount.category,
      value: privilegedRoleSummary.globalAdmins.toLocaleString(),
      status: globalAdminStatus,
      description: checkDefinitions.globalAdminCount.description,
      whyItMatters: checkDefinitions.globalAdminCount.whyItMatters,
      recommendation: getGlobalAdminRecommendation(globalAdminStatus),
      howToFix: checkDefinitions.globalAdminCount.howToFix,
      ...getCheckMetadata(checkDefinitions.globalAdminCount)
    },
    {
      id: checkDefinitions.mfaRegistrationCoverage.id,
      title: checkDefinitions.mfaRegistrationCoverage.title,
      kind: checkDefinitions.mfaRegistrationCoverage.kind,
      category: checkDefinitions.mfaRegistrationCoverage.category,
      value: `${mfaCoverage.registrationCoverage} %`,
      status: mfaStatus,
      description: checkDefinitions.mfaRegistrationCoverage.description,
      whyItMatters: checkDefinitions.mfaRegistrationCoverage.whyItMatters,
      recommendation: getMfaRegistrationCoverageRecommendation(mfaStatus),
      howToFix: checkDefinitions.mfaRegistrationCoverage.howToFix,
      ...getCheckMetadata(checkDefinitions.mfaRegistrationCoverage)
    },
    {
      id: checkDefinitions.adminAccountsHygiene.id,
      title: checkDefinitions.adminAccountsHygiene.title,
      kind: checkDefinitions.adminAccountsHygiene.kind,
      category: checkDefinitions.adminAccountsHygiene.category,
      value: `${privilegedRoleSummary.globalAdmins.toLocaleString()} global / ${privilegedRoleSummary.privilegedAdmins.toLocaleString()} privileged`,
      status: adminAccountsHygieneStatus,
      description: checkDefinitions.adminAccountsHygiene.description,
      whyItMatters: checkDefinitions.adminAccountsHygiene.whyItMatters,
      recommendation: getAdminAccountsHygieneRecommendation(),
      howToFix: checkDefinitions.adminAccountsHygiene.howToFix,
      ...getCheckMetadata(checkDefinitions.adminAccountsHygiene),
      details: {
        roles: privilegedRoleSummary.roles
      }
    },
    {
      id: checkDefinitions.breakGlassAccounts.id,
      title: checkDefinitions.breakGlassAccounts.title,
      kind: checkDefinitions.breakGlassAccounts.kind,
      category: checkDefinitions.breakGlassAccounts.category,
      value: `${breakGlassCandidateSummary.count.toLocaleString()} ${
        breakGlassCandidateSummary.count === 1 ? "candidate" : "candidates"
      }`,
      status: breakGlassAccountsStatus,
      description: checkDefinitions.breakGlassAccounts.description,
      whyItMatters: checkDefinitions.breakGlassAccounts.whyItMatters,
      recommendation: getBreakGlassAccountsRecommendation(
        breakGlassAccountsStatus
      ),
      howToFix: checkDefinitions.breakGlassAccounts.howToFix,
      ...getCheckMetadata(checkDefinitions.breakGlassAccounts),
      details: {
        count: breakGlassCandidateSummary.count,
        globalAdminCount: breakGlassCandidateSummary.globalAdminCount,
        candidates: breakGlassCandidateSummary.candidates
      }
    },
    {
      id: checkDefinitions.adminMfaCoverage.id,
      title: checkDefinitions.adminMfaCoverage.title,
      kind: checkDefinitions.adminMfaCoverage.kind,
      category: checkDefinitions.adminMfaCoverage.category,
      value: `${adminMfaCoverage.coverage} %`,
      status: adminMfaCoverageStatus,
      description: checkDefinitions.adminMfaCoverage.description,
      whyItMatters: checkDefinitions.adminMfaCoverage.whyItMatters,
      recommendation: getAdminMfaCoverageRecommendation(
        adminMfaCoverageStatus
      ),
      howToFix: checkDefinitions.adminMfaCoverage.howToFix,
      ...getCheckMetadata(checkDefinitions.adminMfaCoverage),
      details: {
        totalAdmins: adminMfaCoverage.totalAdmins,
        registeredAdmins: adminMfaCoverage.registeredAdmins,
        unregisteredAdmins: adminMfaCoverage.unregisteredAdmins,
        coverage: adminMfaCoverage.coverage
      }
    },
    {
      id: checkDefinitions.legacyAuthentication.id,
      title: checkDefinitions.legacyAuthentication.title,
      kind: checkDefinitions.legacyAuthentication.kind,
      category: checkDefinitions.legacyAuthentication.category,
      value:
        legacyAuthenticationAssessment.exposure === "Unknown"
          ? "Unknown"
          : `${legacyAuthenticationAssessment.exposure} Exposure`,
      status: legacyAuthenticationCheckStatus,
      description: checkDefinitions.legacyAuthentication.description,
      whyItMatters: checkDefinitions.legacyAuthentication.whyItMatters,
      recommendation: getLegacyAuthenticationRecommendation(
        legacyAuthenticationCheckStatus
      ),
      howToFix: checkDefinitions.legacyAuthentication.howToFix,
      ...getCheckMetadata(checkDefinitions.legacyAuthentication),
      details: {
        securityDefaults:
          securityDefaultsStatus.enabled === true
            ? "Enabled"
            : securityDefaultsStatus.enabled === false
              ? "Disabled"
              : "Unknown",
        conditionalAccess: legacyAuthConditionalAccessEvidence.detected
          ? "Detected"
          : "Not Detected",
        secureScore:
          legacyAuthSecureScoreEvidence.implemented === true
            ? "Implemented"
            : legacyAuthSecureScoreEvidence.implemented === false
              ? "Not Implemented"
              : "Unknown",
        evidence: legacyAuthenticationAssessment.evidence,
        matchingConditionalAccessPolicies:
          legacyAuthConditionalAccessEvidence.matchingPolicies
      }
    },
    {
      id: checkDefinitions.conditionalAccessBaseline.id,
      title: checkDefinitions.conditionalAccessBaseline.title,
      kind: checkDefinitions.conditionalAccessBaseline.kind,
      category: checkDefinitions.conditionalAccessBaseline.category,
      value: `${conditionalAccessBaseline.enabledPolicies.toLocaleString()} enabled`,
      status: conditionalAccessBaselineStatus,
      description: checkDefinitions.conditionalAccessBaseline.description,
      whyItMatters: checkDefinitions.conditionalAccessBaseline.whyItMatters,
      recommendation: getConditionalAccessBaselineRecommendation(
        conditionalAccessBaselineStatus
      ),
      howToFix: checkDefinitions.conditionalAccessBaseline.howToFix,
      ...getCheckMetadata(checkDefinitions.conditionalAccessBaseline),
      details: {
        totalPolicies: conditionalAccessBaseline.totalPolicies,
        enabledPolicies: conditionalAccessBaseline.enabledPolicies,
        disabledPolicies: conditionalAccessBaseline.disabledPolicies
      }
    },
    {
      id: checkDefinitions.guestUsersGovernance.id,
      title: checkDefinitions.guestUsersGovernance.title,
      kind: checkDefinitions.guestUsersGovernance.kind,
      category: checkDefinitions.guestUsersGovernance.category,
      value: `${guestRatio} %`,
      status: guestGovernanceStatus,
      description: checkDefinitions.guestUsersGovernance.description,
      whyItMatters: checkDefinitions.guestUsersGovernance.whyItMatters,
      recommendation: getGuestUsersGovernanceRecommendation(
        guestGovernanceStatus
      ),
      howToFix: checkDefinitions.guestUsersGovernance.howToFix,
      ...getCheckMetadata(checkDefinitions.guestUsersGovernance)
    },
    {
      id: checkDefinitions.disabledUsersHygiene.id,
      title: checkDefinitions.disabledUsersHygiene.title,
      kind: checkDefinitions.disabledUsersHygiene.kind,
      category: checkDefinitions.disabledUsersHygiene.category,
      value: `${disabledUsers.toLocaleString()} disabled / ${disabledRatio} %`,
      status: disabledHygieneStatus,
      description: checkDefinitions.disabledUsersHygiene.description,
      whyItMatters: checkDefinitions.disabledUsersHygiene.whyItMatters,
      recommendation: getDisabledUsersHygieneRecommendation(),
      howToFix: checkDefinitions.disabledUsersHygiene.howToFix,
      ...getCheckMetadata(checkDefinitions.disabledUsersHygiene)
    }
  ];

  return {
    tenant,
    users: {
      total: totalUsers,
      members,
      guests,
      enabled: enabledUsers,
      disabled: disabledUsers
    },
    healthScore: calculateHealthScore(checks),
    quickWins: getQuickWins(checks),
    checks
  };
}
