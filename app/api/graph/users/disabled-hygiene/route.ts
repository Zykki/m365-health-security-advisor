import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getDisabledUserCount,
  getEnabledUserCount
} from "@/lib/graph/users";

type DisabledHygieneStatus = "OK" | "Warning" | "Critical";

function getDisabledHygieneStatus(
  disabledUsers: number,
  disabledRatio: number
): DisabledHygieneStatus {
  if (disabledUsers === 0 || disabledRatio <= 5) {
    return "OK";
  }

  if (disabledRatio <= 15) {
    return "Warning";
  }

  return "Critical";
}

function getDisabledHygieneRecommendation() {
  return "Disabled accounts should be reviewed regularly. Remove accounts that are no longer needed or document why they must remain disabled.";
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
    const [disabledUsers, enabledUsers] = await Promise.all([
      getDisabledUserCount(session.accessToken),
      getEnabledUserCount(session.accessToken)
    ]);
    const total = enabledUsers + disabledUsers;
    const disabledRatio =
      total === 0 ? 0 : Math.round((disabledUsers / total) * 100);
    const status = getDisabledHygieneStatus(disabledUsers, disabledRatio);

    return NextResponse.json({
      disabledUsers,
      enabledUsers,
      disabledRatio,
      status,
      recommendation: getDisabledHygieneRecommendation()
    });
  } catch (error) {
    console.error("Unable to load Microsoft Graph Disabled Users Hygiene", error);

    return NextResponse.json(
      { error: "Unable to load Disabled Users Hygiene" },
      { status: 502 }
    );
  }
}
