import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { getDashboardOverview } from "@/lib/dashboard/overview";
import { isExpiredGraphTokenError, mapGraphError } from "@/lib/graph/errors";
import { prisma } from "@/lib/prisma";

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function POST() {
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

  const tenantId = session.user.tenantId;

  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing tenant ID in session" },
      { status: 400 }
    );
  }

  try {
    const overview = await getDashboardOverview(session.accessToken, {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      tenantId
    });
    const scan = await prisma.scan.create({
      data: {
        tenant: {
          connectOrCreate: {
            where: { id: tenantId },
            create: { id: tenantId }
          }
        },
        healthScore: overview.healthScore.score,
        okCount: overview.healthScore.okCount,
        warningCount: overview.healthScore.warningCount,
        criticalCount: overview.healthScore.criticalCount,
        rawJson: toInputJsonValue(overview),
        checkResults: {
          create: overview.checks.map((check) => ({
            checkId: check.id,
            title: check.title,
            status: check.status,
            value: check.value,
            recommendation: check.recommendation
          }))
        }
      }
    });

    return NextResponse.json({
      scanId: scan.id,
      createdAt: scan.createdAt.toISOString()
    });
  } catch (error) {
    if (isExpiredGraphTokenError(error)) {
      console.warn("Scan snapshot failed because Graph token expired.");

      return NextResponse.json(
        { error: mapGraphError(error) },
        { status: 401 }
      );
    }

    console.error("Unable to save scan snapshot");

    return NextResponse.json(
      { error: "Unable to save scan snapshot" },
      { status: 502 }
    );
  }
}
