import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardOverview } from "@/lib/dashboard/overview";
import { isExpiredGraphTokenError, mapGraphError } from "@/lib/graph/errors";

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
    const overview = await getDashboardOverview(session.accessToken, {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      tenantId: session.user.tenantId ?? null
    });

    return NextResponse.json(overview);
  } catch (error) {
    if (isExpiredGraphTokenError(error)) {
      console.warn("Dashboard overview failed because Graph token expired.");

      return NextResponse.json(
        { error: mapGraphError(error) },
        { status: 401 }
      );
    }

    console.error("Unable to load dashboard overview");

    return NextResponse.json(
      { error: "Unable to load dashboard overview" },
      { status: 502 }
    );
  }
}
