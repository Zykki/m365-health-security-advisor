import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkDefinitions } from "@/lib/checks/definitions";
import { getGlobalAdminRecommendation } from "@/lib/checks/recommendations";
import { getGlobalAdminStatus } from "@/lib/checks/status";
import type { CheckResult } from "@/lib/checks/types";
import { getGlobalAdminCount } from "@/lib/graph/admins";

const checkDefinition = checkDefinitions.globalAdminCount;

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
