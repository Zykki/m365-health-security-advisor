import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGlobalAdminCount } from "@/lib/graph/admins";

type GlobalAdminStatus = "OK" | "Warning" | "Critical";

function getGlobalAdminStatus(count: number): GlobalAdminStatus {
  if (count === 0) {
    return "Critical";
  }

  if (count === 1 || count >= 5) {
    return "Warning";
  }

  return "OK";
}

function getGlobalAdminRecommendation(status: GlobalAdminStatus) {
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

    return NextResponse.json({
      count,
      status,
      recommendation: getGlobalAdminRecommendation(status)
    });
  } catch (error) {
    console.error("Unable to load Microsoft Graph Global Admin count", error);

    return NextResponse.json(
      { error: "Unable to load Global Admin count" },
      { status: 502 }
    );
  }
}
