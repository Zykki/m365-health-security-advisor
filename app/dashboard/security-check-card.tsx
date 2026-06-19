type SecurityCheckStatus = "OK" | "Warning" | "Critical";

type SecurityCheckCardProps = {
  title: string;
  label?: string;
  value?: number | string;
  status?: SecurityCheckStatus;
  recommendation?: string;
  loading?: boolean;
  error?: string;
  onOpen?: () => void;
};

export function SecurityCheckCard({
  title,
  label = "Security Check",
  value,
  status,
  recommendation,
  loading = false,
  error,
  onOpen
}: SecurityCheckCardProps) {
  const card = error ? (
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
            status ? `status-pill status-${status.toLowerCase()}` : "status-pill"
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
  );

  return (
    <section className="overview-section" aria-label={`${title} check`}>
      <div className="section-heading">
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>

      {onOpen && !loading && !error ? (
        <button
          type="button"
          className="security-check-button"
          onClick={onOpen}
        >
          {card}
        </button>
      ) : (
        card
      )}
    </section>
  );
}
