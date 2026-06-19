import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserCount } from "@/lib/graph/users";

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
    const count = await getUserCount(session.accessToken);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unable to load Microsoft Graph user count", error);

    return NextResponse.json(
      { error: "Unable to load user count" },
      { status: 502 }
    );
  }
}
