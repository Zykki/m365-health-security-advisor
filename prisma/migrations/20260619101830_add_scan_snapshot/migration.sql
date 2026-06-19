-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "healthScore" INTEGER NOT NULL,
    "okCount" INTEGER NOT NULL,
    "warningCount" INTEGER NOT NULL,
    "criticalCount" INTEGER NOT NULL,
    "rawJson" JSONB NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckResult" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_tenantId_createdAt_idx" ON "Scan"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "CheckResult_scanId_idx" ON "CheckResult"("scanId");

-- CreateIndex
CREATE INDEX "CheckResult_checkId_idx" ON "CheckResult"("checkId");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckResult" ADD CONSTRAINT "CheckResult_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
