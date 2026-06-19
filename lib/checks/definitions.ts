import type { CheckDefinition } from "@/lib/checks/types";

export const checkDefinitions = {
  globalAdminCount: {
    id: "SEC-001",
    title: "Global Admin Count",
    kind: "Security",
    category: "Admin",
    description:
      "Counts assigned Global Administrator accounts in Microsoft Entra ID.",
    recommendation: "Global Admin count is within recommended range.",
    severity: "Critical",
    source: "Microsoft Graph directoryRoles members"
  },
  guestUsersGovernance: {
    id: "GOV-001",
    title: "Guest Users Governance",
    kind: "Governance",
    category: "Governance",
    description:
      "Compares guest users to member users as an external access governance signal.",
    recommendation: "Guest users are within the recommended range.",
    severity: "Warning",
    source: "Microsoft Graph users userType"
  },
  disabledUsersHygiene: {
    id: "HYG-001",
    title: "Disabled Users Hygiene",
    kind: "Hygiene",
    category: "Users",
    description:
      "Compares disabled users to enabled users as a tenant hygiene signal.",
    recommendation:
      "Disabled accounts should be reviewed regularly. Remove accounts that are no longer needed or document why they must remain disabled.",
    severity: "Warning",
    source: "Microsoft Graph users accountEnabled"
  }
} satisfies Record<string, CheckDefinition>;

export type CheckDefinitionKey = keyof typeof checkDefinitions;
