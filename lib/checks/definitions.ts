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
  breakGlassAccounts: {
    id: "SEC-004",
    title: "Break Glass Accounts",
    kind: "Security",
    category: "Identity",
    description:
      "Checks whether the tenant appears to have emergency access accounts.",
    whyItMatters:
      "Break-glass accounts help retain administrative access during Conditional Access, MFA, identity provider, or account lockout incidents.",
    recommendation:
      "Maintain two cloud-only emergency access accounts, protect them carefully, exclude them from Conditional Access where appropriate, and monitor their sign-ins.",
    howToFix:
      "1. Create two cloud-only emergency access accounts. 2. Assign Global Administrator only if required. 3. Exclude them from Conditional Access policies that could block all access. 4. Use strong credentials stored securely. 5. Monitor sign-in activity and alert on use.",
    severity: "High",
    securityImpact: "Critical",
    operationalImpact: "Low",
    estimatedEffortMinutes: 45,
    licenseRequired: "Microsoft 365 Business Standard or higher",
    source: "Microsoft Entra ID directory roles and users"
  },
  adminMfaCoverage: {
    id: "SEC-005",
    title: "Admin MFA Coverage",
    kind: "Security",
    category: "Admin",
    description:
      "Measures how many privileged administrator accounts are registered for MFA or strong authentication methods.",
    whyItMatters:
      "Privileged accounts are high-value targets. If admin accounts are not registered for MFA, a compromised password can lead to full tenant compromise.",
    recommendation:
      "All privileged administrator accounts should be registered for MFA. Where possible, use phishing-resistant methods such as FIDO2 security keys or passkeys.",
    howToFix:
      "1. Identify all privileged administrator accounts. 2. Require MFA registration for all admin accounts. 3. Prefer phishing-resistant authentication for highly privileged roles. 4. Review and remove unnecessary privileged assignments. 5. Monitor admin sign-ins.",
    severity: "Critical",
    securityImpact: "Critical",
    operationalImpact: "Medium",
    estimatedEffortMinutes: 60,
    licenseRequired: "Microsoft 365 Business Standard or higher",
    source:
      "Microsoft Graph credentialUserRegistrationDetails and Entra ID directory roles"
  },
  legacyAuthentication: {
    id: "SEC-006",
    title: "Legacy Authentication Exposure",
    kind: "Security",
    category: "Identity",
    description:
      "Assesses the tenant exposure to legacy authentication using multiple Microsoft 365 security signals.",
    whyItMatters:
      "Legacy authentication protocols bypass modern protections such as MFA and are frequently used in password spray attacks.",
    recommendation:
      "Reduce legacy authentication exposure using Security Defaults, Conditional Access policies and modern authentication controls.",
    howToFix:
      "1. Enable Security Defaults or Conditional Access. 2. Block legacy client protocols. 3. Review Secure Score recommendations. 4. Validate application compatibility. 5. Monitor authentication activity.",
    severity: "Critical",
    securityImpact: "Critical",
    operationalImpact: "Medium",
    estimatedEffortMinutes: 60,
    licenseRequired: "Microsoft 365 Business Premium or Entra ID P1",
    source: "Graph + Conditional Access + Secure Score"
  },
  conditionalAccessBaseline: {
    id: "SEC-007",
    title: "Conditional Access Baseline",
    kind: "Security",
    category: "Identity",
    description:
      "Checks whether Conditional Access policies are configured in the tenant.",
    whyItMatters:
      "Conditional Access is the primary control used to enforce MFA, restrict access and protect identities.",
    recommendation:
      "Maintain multiple enabled Conditional Access policies covering administrators and standard users.",
    howToFix:
      "1. Create Conditional Access policies. 2. Enable MFA enforcement. 3. Protect administrator accounts. 4. Test policies using report-only mode before rollout. 5. Review policy effectiveness regularly.",
    severity: "Critical",
    securityImpact: "Critical",
    operationalImpact: "Medium",
    estimatedEffortMinutes: 90,
    licenseRequired: "Microsoft 365 Business Premium or Entra ID P1",
    source: "Microsoft Graph Conditional Access Policies"
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
