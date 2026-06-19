type SecurityCheckStatus = "OK" | "Warning" | "Critical";

type SecurityCheckCardProps = {
  title: string;
  value?: number | string;
  status?: SecurityCheckStatus;
  recommendation?: string;
  loading?: boolean;
  error?: string;
};

export function SecurityCheckCard({
  title,
  value,
  status,
  recommendation,
  loading = false,
  error
}: SecurityCheckCardProps) {
  return (
    <section className="overview-section" aria-label={`${title} check`}>
      <div className="section-heading">
        <p className="eyebrow">Security Check</p>
        <h2>{title}</h2>
      </div>

      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <article className="security-check-card">
          <div>
            <span>Value</span>
            <strong>
              {loading
                ? "Loading..."
                : typeof value === "number"
                  ? value.toLocaleString()
                  : value}
            </strong>
          </div>
          <div>
            <span>Status</span>
            <strong
              className={
                status
                  ? `status-pill status-${status.toLowerCase()}`
                  : "status-pill"
              }
            >
              {loading ? "Loading..." : status}
            </strong>
          </div>
          <div className="recommendation-block">
            <span>Recommendation</span>
            <strong>{loading ? "Loading..." : recommendation}</strong>
          </div>
        </article>
      )}
    </section>
  );
}
