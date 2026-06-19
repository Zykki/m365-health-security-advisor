import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ScanDetailRouteContext = {
  params: Promise<{
    scanId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: ScanDetailRouteContext
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;

  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing tenant ID in session" },
      { status: 400 }
    );
  }

  const { scanId } = await params;

  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      tenantId
    },
    select: {
      id: true,
      createdAt: true,
      healthScore: true,
      okCount: true,
      warningCount: true,
      criticalCount: true,
      checkResults: {
        orderBy: {
          createdAt: "asc"
        },
        select: {
          checkId: true,
          title: true,
          status: true,
          value: true,
          recommendation: true
        }
      }
    }
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...scan,
    createdAt: scan.createdAt.toISOString()
  });
}
