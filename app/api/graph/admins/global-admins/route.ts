import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkDefinitions } from "@/lib/checks/definitions";
import { getGlobalAdminStatus } from "@/lib/checks/status";
import type { CheckResult, CheckStatus } from "@/lib/checks/types";
import { getGlobalAdminCount } from "@/lib/graph/admins";

const checkDefinition = checkDefinitions.globalAdminCount;

function getGlobalAdminRecommendation(status: CheckStatus) {
  if (status === "Critical") {
    return "Add at least two break-glass protected Global Admin accounts.";
  }

  if (status === "Warning") {
    return "Keep Global Admin accounts between two and four where possible.";
  }

  return "Global Admin count is within recommended range.";
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
    const count = await getGlobalAdminCount(session.accessToken);
    const status = getGlobalAdminStatus(count);
    const result: CheckResult = {
      checkId: checkDefinition.id,
      title: checkDefinition.title,
      kind: checkDefinition.kind,
      category: checkDefinition.category,
      status,
      value: count,
      recommendation: getGlobalAdminRecommendation(status),
      details: {
        source: checkDefinition.source
      }
    };

    return NextResponse.json({
      count,
      status: result.status,
      recommendation: result.recommendation
    });
  } catch (error) {
    console.error("Unable to load Microsoft Graph Global Admin count", error);

    return NextResponse.json(
      { error: "Unable to load Global Admin count" },
      { status: 502 }
    );
  }
}
