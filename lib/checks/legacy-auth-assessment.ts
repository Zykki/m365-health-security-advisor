import type { LegacyAuthSecureScoreEvidence } from "@/lib/graph/secure-score";
import type { SecurityDefaultsStatus } from "@/lib/graph/security-defaults";
import type { LegacyAuthConditionalAccessEvidence } from "@/lib/graph/conditional-access";

export type LegacyAuthenticationExposure =
  | "Low"
  | "Medium"
  | "High"
  | "Unknown";

export type LegacyAuthenticationExposureAssessment = {
  exposure: LegacyAuthenticationExposure;
  evidence: string[];
};

type LegacyAuthenticationExposureInput = {
  securityDefaults: SecurityDefaultsStatus;
  conditionalAccess: LegacyAuthConditionalAccessEvidence;
  secureScore: LegacyAuthSecureScoreEvidence;
};

export function assessLegacyAuthenticationExposure({
  securityDefaults,
  conditionalAccess,
  secureScore
}: LegacyAuthenticationExposureInput): LegacyAuthenticationExposureAssessment {
  const evidence: string[] = [
    `Security Defaults: ${
      securityDefaults.enabled === true
        ? "Enabled"
        : securityDefaults.enabled === false
          ? "Disabled"
          : "Unknown"
    }`,
    `Conditional Access legacy auth block policy: ${
      conditionalAccess.detected ? "Detected" : "Not Detected"
    }`,
    `Secure Score: ${
      secureScore.implemented === true
        ? "Implemented"
        : secureScore.implemented === false
          ? "Not Implemented"
          : "Unknown"
    }`,
    secureScore.evidence
  ];

  if (
    securityDefaults.enabled === true ||
    conditionalAccess.detected ||
    secureScore.implemented === true
  ) {
    return {
      exposure: "Low",
      evidence
    };
  }

  if (
    securityDefaults.enabled === false &&
    !conditionalAccess.detected &&
    secureScore.implemented === false
  ) {
    return {
      exposure: "High",
      evidence
    };
  }

  if (
    securityDefaults.enabled === false ||
    secureScore.implemented === false ||
    !conditionalAccess.detected
  ) {
    const hasAtLeastOneKnownSignal =
      securityDefaults.enabled !== null || secureScore.implemented !== null;

    return {
      exposure: hasAtLeastOneKnownSignal ? "Medium" : "Unknown",
      evidence
    };
  }

  return {
    exposure: "Unknown",
    evidence
  };
}
