import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  const scans = await prisma.scan.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      createdAt: true,
      healthScore: true,
      okCount: true,
      warningCount: true,
      criticalCount: true
    }
  });

  return NextResponse.json(
    scans.map((scan) => ({
      ...scan,
      createdAt: scan.createdAt.toISOString()
    }))
  );
}
