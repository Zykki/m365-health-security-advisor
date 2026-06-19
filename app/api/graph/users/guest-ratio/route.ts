import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGuestCount, getMemberCount } from "@/lib/graph/users";

type GuestRatioStatus = "OK" | "Warning" | "Critical";

function getGuestRatioStatus(guestRatio: number): GuestRatioStatus {
  if (guestRatio <= 10) {
    return "OK";
  }

  if (guestRatio <= 25) {
    return "Warning";
  }

  return "Critical";
}

function getGuestRatioRecommendation(status: GuestRatioStatus) {
  if (status === "Critical") {
    return "Guest users represent a high percentage of directory accounts. Review external users and remove stale guest accounts.";
  }

  if (status === "Warning") {
    return "Guest users are above the recommended range. Review external access and stale guest accounts.";
  }

  return "Guest users are within the recommended range.";
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
    const [guests, members] = await Promise.all([
      getGuestCount(session.accessToken),
      getMemberCount(session.accessToken)
    ]);
    const total = members + guests;
    const guestRatio = total === 0 ? 0 : Math.round((guests / total) * 100);
    const status = getGuestRatioStatus(guestRatio);

    return NextResponse.json({
      guests,
      members,
      guestRatio,
      status,
      recommendation: getGuestRatioRecommendation(status)
    });
  } catch (error) {
    console.error("Unable to load Microsoft Graph Guest Users Ratio", error);

    return NextResponse.json(
      { error: "Unable to load Guest Users Ratio" },
      { status: 502 }
    );
  }
}
