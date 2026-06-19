import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getDisabledUserCount,
  getEnabledUserCount,
  getGuestCount,
  getMemberCount,
  getUserCount
} from "@/lib/graph/users";

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
    const [
      totalUsers,
      members,
      guests,
      enabledUsers,
      disabledUsers
    ] = await Promise.all([
      getUserCount(session.accessToken),
      getMemberCount(session.accessToken),
      getGuestCount(session.accessToken),
      getEnabledUserCount(session.accessToken),
      getDisabledUserCount(session.accessToken)
    ]);

    return NextResponse.json({
      totalUsers,
      members,
      guests,
      enabledUsers,
      disabledUsers
    });
  } catch (error) {
    console.error("Unable to load Microsoft Graph users overview", error);

    return NextResponse.json(
      { error: "Unable to load users overview" },
      { status: 502 }
    );
  }
}
