import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkDefinitions } from "@/lib/checks/definitions";
import { getMfaRegistrationCoverageStatus } from "@/lib/checks/status";
import type { CheckResult, CheckStatus } from "@/lib/checks/types";
import { getMfaRegistrationCoverage } from "@/lib/graph/authentication-methods";

const checkDefinition = checkDefinitions.mfaRegistrationCoverage;

function getMfaRegistrationCoverageRecommendation(status: CheckStatus) {
  if (status === "OK") {
    return checkDefinition.recommendation;
  }

  return "MFA registration coverage is below the desired target. Continue onboarding users to modern MFA methods.";
}

function isPermissionError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { statusCode?: unknown; code?: unknown };

  return (
    candidate.statusCode === 401 ||
    candidate.statusCode === 403 ||
    candidate.code === "Authorization_RequestDenied" ||
    candidate.code === "Forbidden"
  );
}

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.accessToken) {
    return NextResponse.json(
      { error: "Missing Microsoft Graph access token" },
      { status: 401 }
    );
  }

  try {
    const { totalUsers, registeredUsers, registrationCoverage } =
      await getMfaRegistrationCoverage(session.accessToken);
    const status = getMfaRegistrationCoverageStatus(registrationCoverage);
    const result: CheckResult = {
      checkId: checkDefinition.id,
      title: checkDefinition.title,
      kind: checkDefinition.kind,
      category: checkDefinition.category,
      status,
      value: `${registrationCoverage} %`,
      recommendation: getMfaRegistrationCoverageRecommendation(status),
      details: {
        totalUsers,
        registeredUsers,
        source: checkDefinition.source
      }
    };

    return NextResponse.json({
      totalUsers,
      registeredUsers,
      registrationCoverage,
      status: result.status,
      recommendation: result.recommendation
    });
  } catch (error) {
    console.error(
      "Unable to load Microsoft Graph MFA Registration Coverage",
      error
    );

    if (isPermissionError(error)) {
      return NextResponse.json(
        {
          error:
            "Unable to load MFA Registration Coverage. Missing delegated Graph permission such as Reports.Read.All or AuditLog.Read.All."
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load MFA Registration Coverage" },
      { status: 502 }
    );
  }
}
