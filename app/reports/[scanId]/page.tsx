import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReportPreviewPageProps = {
  params: Promise<{
    scanId: string;
  }>;
};

function formatReportDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short"
  }).format(value);
}

export default async function ReportPreviewPage({
  params
}: ReportPreviewPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const tenantId = session.user.tenantId;

  if (!tenantId) {
    notFound();
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
    notFound();
  }

  return (
    <main className="report-preview-shell">
      <header className="report-header">
        <div>
          <p className="eyebrow">Report Preview</p>
          <h1>M365 Health & Security Report</h1>
        </div>
        <Link className="report-back-link" href="/dashboard">
          Back to dashboard
        </Link>
      </header>

      <section className="report-summary" aria-label="Scan summary">
        <article>
          <span>Scan Date</span>
          <strong>{formatReportDate(scan.createdAt)}</strong>
        </article>
        <article>
          <span>Health Score</span>
          <strong>{scan.healthScore} / 100</strong>
        </article>
        <article>
          <span>OK</span>
          <strong>{scan.okCount}</strong>
        </article>
        <article>
          <span>Warning</span>
          <strong>{scan.warningCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{scan.criticalCount}</strong>
        </article>
      </section>

      <section className="report-section" aria-labelledby="check-results">
        <div className="section-heading">
          <p className="eyebrow">Saved Check Results</p>
          <h2 id="check-results">Check Results</h2>
        </div>

        <div className="report-check-list">
          {scan.checkResults.map((result) => (
            <article className="report-check-card" key={result.checkId}>
              <div className="report-check-header">
                <div>
                  <span>{result.checkId}</span>
                  <h3>{result.title}</h3>
                </div>
                <span
                  className={`status-pill status-${result.status.toLowerCase()}`}
                >
                  {result.status}
                </span>
              </div>
              <dl>
                <div>
                  <dt>Value</dt>
                  <dd>{result.value}</dd>
                </div>
              </dl>
              <div>
                <h4>Recommendation</h4>
                <p>{result.recommendation}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
