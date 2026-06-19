export type CheckStatus = "OK" | "Warning" | "Critical";

export type CheckSeverity =
  | "Low"
  | "Medium"
  | "High"
  | "Warning"
  | "Critical";

export type SecurityImpact = "Low" | "Medium" | "High" | "Critical";

export type OperationalImpact = "Low" | "Medium" | "High";

export type CheckKind = "Security" | "Governance" | "Hygiene" | "Overview";

export type CheckCategory =
  | "Identity"
  | "Users"
  | "Governance"
  | "Security"
  | "Admin";

export type CheckDefinition = {
  id: string;
  title: string;
  kind: CheckKind;
  category: CheckCategory;
  description: string;
  whyItMatters: string;
  recommendation: string;
  howToFix: string;
  severity: CheckSeverity;
  securityImpact: SecurityImpact;
  operationalImpact: OperationalImpact;
  estimatedEffortMinutes: number;
  licenseRequired: string;
  source: string;
};

export type CheckResult = {
  checkId: string;
  title: string;
  kind: CheckKind;
  category: CheckCategory;
  status: CheckStatus;
  value: number | string;
  recommendation: string;
  details?: Record<string, unknown>;
};
