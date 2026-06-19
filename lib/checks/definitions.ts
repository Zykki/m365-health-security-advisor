import type { CheckDefinition } from "@/lib/checks/types";

export const checkDefinitions = {
  globalAdminCount: {
    id: "SEC-001",
    title: "Global Admin Count",
    kind: "Security",
    category: "Admin",
    description:
      "Counts assigned Global Administrator accounts in Microsoft Entra ID.",
    whyItMatters:
      "Global Administrators have broad tenant-wide privileges and should be tightly controlled.",
    recommendation: "Global Admin count is within recommended range.",
    howToFix:
      "Review Global Administrator assignments, remove unnecessary accounts, and keep at least two protected break-glass admins.",
    severity: "Critical",
    securityImpact: "Critical",
    operationalImpact: "Low",
    estimatedEffortMinutes: 30,
    licenseRequired: "Microsoft 365 Business Standard or higher",
    source: "Microsoft Entra ID roles"
  },
  mfaRegistrationCoverage: {
    id: "SEC-002",
    title: "MFA Registration Coverage",
    kind: "Security",
    category: "Identity",
    description:
      "Measures how many users are registered for MFA or strong authentication methods.",
    whyItMatters:
      "Users without registered MFA methods are harder to protect when stronger sign-in requirements are introduced.",
    recommendation:
      "Users should register at least one modern MFA method. Admin accounts should use phishing-resistant methods where possible.",
    howToFix:
      "Run MFA registration campaigns and prioritize administrators and high-risk users.",
    severity: "High",
    securityImpact: "Critical",
    operationalImpact: "Medium",
    estimatedEffortMinutes: 60,
    licenseRequired: "Microsoft 365 Business Standard or higher",
    source: "Microsoft Graph credentialUserRegistrationDetails"
  },
  adminAccountsHygiene: {
    id: "SEC-003",
    title: "Admin Accounts Hygiene",
    kind: "Security",
    category: "Admin",
    description: "Reviews privileged role assignments across the tenant.",
    whyItMatters:
      "Privileged roles can change security posture, access data, or administer users and services.",
    recommendation:
      "Keep privileged access limited, review admin role assignments regularly, and use separate admin accounts where possible.",
    howToFix:
      "Audit privileged role membership, remove stale assignments, and document required admin accounts.",
    severity: "High",
    securityImpact: "High",
    operationalImpact: "Low",
    estimatedEffortMinutes: 45,
    licenseRequired: "Microsoft 365 Business Standard or higher",
    source: "Microsoft Entra ID directory roles"
  },
  guestUsersGovernance: {
    id: "GOV-001",
    title: "Guest Users Governance",
    kind: "Governance",
    category: "Governance",
    description:
      "Compares guest users to member users as an external access governance signal.",
    whyItMatters:
      "A high guest ratio may indicate broad external collaboration that needs regular review.",
    recommendation: "Guest users are within the recommended range.",
    howToFix:
      "Review external users, remove stale guests, and ensure ownership for collaboration workspaces.",
    severity: "Warning",
    securityImpact: "Medium",
    operationalImpact: "Low",
    estimatedEffortMinutes: 30,
    licenseRequired: "Microsoft 365 Business Standard or higher",
    source: "Microsoft Entra ID users"
  },
  disabledUsersHygiene: {
    id: "HYG-001",
    title: "Disabled Users Hygiene",
    kind: "Hygiene",
    category: "Users",
    description:
      "Compares disabled users to enabled users as a tenant hygiene signal.",
    whyItMatters:
      "Disabled accounts can accumulate over time and create operational clutter or unclear ownership.",
    recommendation:
      "Disabled accounts should be reviewed regularly. Remove accounts that are no longer needed or document why they must remain disabled.",
    howToFix:
      "Review disabled accounts periodically, delete accounts no longer needed, and document exceptions.",
    severity: "Warning",
    securityImpact: "Medium",
    operationalImpact: "Low",
    estimatedEffortMinutes: 20,
    licenseRequired: "Microsoft 365 Business Standard or higher",
    source: "Microsoft Entra ID users"
  }
} satisfies Record<string, CheckDefinition>;

export type CheckDefinitionKey = keyof typeof checkDefinitions;
