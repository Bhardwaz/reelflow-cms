import './ReelsTableShimmer.css'

function ReelsTableShimmer({ rows = 7 }) {
  return (
    <div className="reels-table">
      <div className="table-header">
        {["Thumbnail", "Title", "Status", "Processing", "Product", "Created"].map(h => (
          <div key={h} className="th">{h}</div>
        ))}
      </div>

      {[...Array(rows)].map((_, i) => (
        <div className="table-row shimmer" key={i}>
          <div className="thumb shimmer-box" />
          <div className="text shimmer-box" />
          <div className="small shimmer-box" />
          <div className="small shimmer-box" />
          <div className="icon shimmer-box" />
          <div className="date shimmer-box" />
        </div>
      ))}
    </div>
  )
}

export default ReelsTableShimmer
