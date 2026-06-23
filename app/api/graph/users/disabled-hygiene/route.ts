import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkDefinitions } from "@/lib/checks/definitions";
import { getDisabledUsersHygieneRecommendation } from "@/lib/checks/recommendations";
import { getDisabledUsersHygieneStatus } from "@/lib/checks/status";
import type { CheckResult } from "@/lib/checks/types";
import {
  getDisabledUserCount,
  getEnabledUserCount
} from "@/lib/graph/users";

const checkDefinition = checkDefinitions.disabledUsersHygiene;

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
    const [disabledUsers, enabledUsers] = await Promise.all([
      getDisabledUserCount(session.accessToken),
      getEnabledUserCount(session.accessToken)
    ]);
    const total = enabledUsers + disabledUsers;
    const disabledRatio =
      total === 0 ? 0 : Math.round((disabledUsers / total) * 100);
    const status = getDisabledUsersHygieneStatus(
      disabledUsers,
      disabledRatio
    );
    const result: CheckResult = {
      checkId: checkDefinition.id,
      title: checkDefinition.title,
      kind: checkDefinition.kind,
      category: checkDefinition.category,
      domain: checkDefinition.domain,
      status,
      value: `${disabledUsers} disabled / ${disabledRatio} %`,
      recommendation: getDisabledUsersHygieneRecommendation(),
      details: {
        disabledUsers,
        enabledUsers,
        source: checkDefinition.source
      }
    };

    return NextResponse.json({
      disabledUsers,
      enabledUsers,
      disabledRatio,
      status: result.status,
      recommendation: result.recommendation
    });
  } catch (error) {
    console.error("Unable to load Microsoft Graph Disabled Users Hygiene", error);

    return NextResponse.json(
      { error: "Unable to load Disabled Users Hygiene" },
      { status: 502 }
    );
  }
}
