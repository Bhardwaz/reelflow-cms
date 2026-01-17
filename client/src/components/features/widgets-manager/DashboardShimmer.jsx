import "./DashboardShimmer.css";

const DashboardShimmer = () => {
  return (
    <div className="shimmer-table">
      {/* Header */}
      <div className="shimmer-header">
        <div className="shimmer shimmer-sm" />
        <div className="shimmer shimmer-md" />
        <div className="shimmer shimmer-sm" />
      </div>

      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="shimmer-row">
          <div className="shimmer shimmer-lg" />

          <div className="shimmer-group">
            <div className="shimmer shimmer-xs" />
            <div className="shimmer shimmer-xxs" />
          </div>

          <div className="shimmer shimmer-pill" />
        </div>
      ))}
    </div>
  );
};

export default DashboardShimmer;
