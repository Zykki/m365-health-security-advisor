import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkDefinitions } from "@/lib/checks/definitions";
import { getGuestUsersGovernanceRecommendation } from "@/lib/checks/recommendations";
import { getGuestUsersGovernanceStatus } from "@/lib/checks/status";
import type { CheckResult } from "@/lib/checks/types";
import { getGuestCount, getMemberCount } from "@/lib/graph/users";

const checkDefinition = checkDefinitions.guestUsersGovernance;

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
    const [guests, members] = await Promise.all([
      getGuestCount(session.accessToken),
      getMemberCount(session.accessToken)
    ]);
    const total = members + guests;
    const guestRatio = total === 0 ? 0 : Math.round((guests / total) * 100);
    const status = getGuestUsersGovernanceStatus(guestRatio);
    const result: CheckResult = {
      checkId: checkDefinition.id,
      title: checkDefinition.title,
      kind: checkDefinition.kind,
      category: checkDefinition.category,
      status,
      value: `${guestRatio} %`,
      recommendation: getGuestUsersGovernanceRecommendation(status),
      details: {
        guests,
        members,
        source: checkDefinition.source
      }
    };

    return NextResponse.json({
      guests,
      members,
      guestRatio,
      status: result.status,
      recommendation: result.recommendation
    });
  } catch (error) {
    console.error("Unable to load Microsoft Graph Guest Users Ratio", error);

    return NextResponse.json(
      { error: "Unable to load Guest Users Ratio" },
      { status: 502 }
    );
  }
}
