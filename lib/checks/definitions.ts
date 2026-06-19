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
  mfaRegistrationCoverage: {
    id: "SEC-002",
    title: "MFA Registration Coverage",
    kind: "Security",
    category: "Identity",
    description:
      "Measures how many users are registered for MFA or strong authentication methods.",
    recommendation:
      "Users should register at least one modern MFA method. Admin accounts should use phishing-resistant methods where possible.",
    severity: "High",
    source: "Microsoft Graph credentialUserRegistrationDetails"
  },
  adminAccountsHygiene: {
    id: "SEC-003",
    title: "Admin Accounts Hygiene",
    kind: "Security",
    category: "Admin",
    description: "Reviews privileged role assignments across the tenant.",
    recommendation:
      "Keep privileged access limited, review admin role assignments regularly, and use separate admin accounts where possible.",
    severity: "High",
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
