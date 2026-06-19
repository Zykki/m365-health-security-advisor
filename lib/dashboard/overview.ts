import { checkDefinitions } from "@/lib/checks/definitions";
import {
  getDisabledUsersHygieneRecommendation,
  getGlobalAdminRecommendation,
  getGuestUsersGovernanceRecommendation,
  getMfaRegistrationCoverageRecommendation
} from "@/lib/checks/recommendations";
import {
  getDisabledUsersHygieneStatus,
  getGlobalAdminStatus,
  getGuestUsersGovernanceStatus,
  getMfaRegistrationCoverageStatus
} from "@/lib/checks/status";
import type { CheckCategory, CheckKind, CheckStatus } from "@/lib/checks/types";
import { getGlobalAdminCount } from "@/lib/graph/admins";
import { getMfaRegistrationCoverage } from "@/lib/graph/authentication-methods";
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
  recommendation: string;
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
  checks: DashboardCheck[];
};

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
    globalAdminCount,
    mfaCoverage
  ] = await Promise.all([
    getUserCount(accessToken),
    getMemberCount(accessToken),
    getGuestCount(accessToken),
    getEnabledUserCount(accessToken),
    getDisabledUserCount(accessToken),
    getGlobalAdminCount(accessToken),
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
  const globalAdminStatus = getGlobalAdminStatus(globalAdminCount);
  const mfaStatus = getMfaRegistrationCoverageStatus(
    mfaCoverage.registrationCoverage
  );
  const guestGovernanceStatus = getGuestUsersGovernanceStatus(guestRatio);
  const disabledHygieneStatus = getDisabledUsersHygieneStatus(
    disabledUsers,
    disabledRatio
  );

  return {
    tenant,
    users: {
      total: totalUsers,
      members,
      guests,
      enabled: enabledUsers,
      disabled: disabledUsers
    },
    checks: [
      {
        id: checkDefinitions.globalAdminCount.id,
        title: checkDefinitions.globalAdminCount.title,
        kind: checkDefinitions.globalAdminCount.kind,
        category: checkDefinitions.globalAdminCount.category,
        value: globalAdminCount.toLocaleString(),
        status: globalAdminStatus,
        recommendation: getGlobalAdminRecommendation(globalAdminStatus)
      },
      {
        id: checkDefinitions.mfaRegistrationCoverage.id,
        title: checkDefinitions.mfaRegistrationCoverage.title,
        kind: checkDefinitions.mfaRegistrationCoverage.kind,
        category: checkDefinitions.mfaRegistrationCoverage.category,
        value: `${mfaCoverage.registrationCoverage} %`,
        status: mfaStatus,
        recommendation: getMfaRegistrationCoverageRecommendation(mfaStatus)
      },
      {
        id: checkDefinitions.guestUsersGovernance.id,
        title: checkDefinitions.guestUsersGovernance.title,
        kind: checkDefinitions.guestUsersGovernance.kind,
        category: checkDefinitions.guestUsersGovernance.category,
        value: `${guestRatio} %`,
        status: guestGovernanceStatus,
        recommendation: getGuestUsersGovernanceRecommendation(
          guestGovernanceStatus
        )
      },
      {
        id: checkDefinitions.disabledUsersHygiene.id,
        title: checkDefinitions.disabledUsersHygiene.title,
        kind: checkDefinitions.disabledUsersHygiene.kind,
        category: checkDefinitions.disabledUsersHygiene.category,
        value: `${disabledUsers.toLocaleString()} disabled / ${disabledRatio} %`,
        status: disabledHygieneStatus,
        recommendation: getDisabledUsersHygieneRecommendation()
      }
    ]
  };
}
