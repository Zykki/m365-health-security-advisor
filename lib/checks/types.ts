export type CheckStatus = "OK" | "Warning" | "Critical";

export type CheckSeverity =
  | "Low"
  | "Medium"
  | "High"
  | "Warning"
  | "Critical";

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
  recommendation: string;
  severity: CheckSeverity;
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
