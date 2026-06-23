import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReportPreviewPageProps = {
  params: Promise<{
    scanId: string;
  }>;
};

type ReportCheckResult = {
  checkId: string;
  title: string;
  status: string;
  value: string;
  recommendation: string;
};

function formatReportDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short"
  }).format(value);
}

function getExecutiveSummaryText(score: number) {
  if (score >= 80) {
    return "The tenant is in a good baseline state. Continue monitoring and improving remaining findings.";
  }

  if (score >= 60) {
    return "The tenant has a reasonable baseline, but several findings should be reviewed and remediated.";
  }

  return "The tenant requires attention. Several security or governance findings should be addressed with priority.";
}

function getTopRecommendations(checkResults: ReportCheckResult[]) {
  return checkResults
    .map((result, index) => ({ ...result, index }))
    .filter(
      (result) => result.status === "Critical" || result.status === "Warning"
    )
    .sort((first, second) => {
      if (first.status !== second.status) {
        return first.status === "Critical" ? -1 : 1;
      }

      return first.index - second.index;
    })
    .slice(0, 3);
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

  const topRecommendations = getTopRecommendations(scan.checkResults);

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

      <p className="report-scan-date">
        Scan date: <strong>{formatReportDate(scan.createdAt)}</strong>
      </p>

      <section className="report-section" aria-labelledby="executive-summary">
        <div className="section-heading">
          <p className="eyebrow">Summary</p>
          <h2 id="executive-summary">Executive Summary</h2>
        </div>
        <div className="report-executive-summary">
          <div>
            <span>Health Score</span>
            <strong>{scan.healthScore} / 100</strong>
          </div>
          <p>{getExecutiveSummaryText(scan.healthScore)}</p>
          <dl>
            <div>
              <dt>OK</dt>
              <dd>{scan.okCount}</dd>
            </div>
            <div>
              <dt>Warning</dt>
              <dd>{scan.warningCount}</dd>
            </div>
            <div>
              <dt>Critical</dt>
              <dd>{scan.criticalCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="report-section" aria-labelledby="health-summary">
        <div className="section-heading">
          <p className="eyebrow">Score</p>
          <h2 id="health-summary">Health Score Summary</h2>
        </div>
        <div className="report-summary" aria-label="Health score summary">
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
        </div>
      </section>

      <section className="report-section" aria-labelledby="top-recommendations">
        <div className="section-heading">
          <p className="eyebrow">Priority</p>
          <h2 id="top-recommendations">Top Recommendations</h2>
        </div>
        {topRecommendations.length === 0 ? (
          <p className="report-empty-state">
            No high-priority recommendations found.
          </p>
        ) : (
          <div className="report-check-list">
            {topRecommendations.map((result) => (
              <article
                className="report-check-card report-recommendation-card"
                key={result.checkId}
              >
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
        )}
      </section>

      <section className="report-section" aria-labelledby="detailed-findings">
        <div className="section-heading">
          <p className="eyebrow">Saved Check Results</p>
          <h2 id="detailed-findings">Detailed Findings</h2>
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
