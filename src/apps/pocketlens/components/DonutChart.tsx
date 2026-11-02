import { useState } from 'react'

interface DonutChartProps {
  totalAmount: number
  monthLabel: string
  categories: {
    category: string
    amount: number
    color: string
  }[]
}

export default function DonutChart({ totalAmount, monthLabel, categories }: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const size = 220
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  // Calculate segment angles
  const total = categories.reduce((sum, c) => sum + c.amount, 0) || 1

  let accumulatedPercent = 0
  const segments = categories.map((cat, i) => {
    const percent = cat.amount / total
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`
    const strokeDashoffset = -circumference * accumulatedPercent
    accumulatedPercent += percent

    return {
      ...cat,
      index: i,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    }
  })

  const activeCategory = hoveredIdx !== null ? segments[hoveredIdx] : null

  return (
    <div className="donut-chart-container">
      <div className="donut-svg-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f2f6"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.map((seg) => {
            const isHovered = hoveredIdx === seg.index
            return (
              <circle
                key={seg.category}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="donut-slice"
                style={{
                  transformOrigin: 'center',
                  transform: 'rotate(-90deg)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: 'pointer',
                  filter: isHovered ? `drop-shadow(0 4px 8px ${seg.color}66)` : undefined,
                }}
                onMouseEnter={() => setHoveredIdx(seg.index)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(hoveredIdx === seg.index ? null : seg.index)}
              />
            )
          })}
        </svg>

        {/* Donut Center Display */}
        <div className="donut-center-info">
          <span className="donut-sublabel">
            {activeCategory ? activeCategory.category : `Expense Total in ${monthLabel}`}
          </span>
          <span className="donut-amount">
            ${activeCategory ? activeCategory.amount.toFixed(2) : totalAmount.toFixed(2)}
          </span>
          {activeCategory && (
            <span className="donut-percent-chip" style={{ color: activeCategory.color }}>
              {activeCategory.percent}% of total
            </span>
          )}
        </div>
      </div>

      {/* Category Pills Legend */}
      <div className="donut-legend-row">
        {categories.slice(0, 4).map((cat, i) => (
          <button
            key={cat.category}
            type="button"
            className={`legend-pill ${hoveredIdx === i ? 'is-active' : ''}`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
          >
            <span className="legend-dot" style={{ backgroundColor: cat.color }} />
            <span className="legend-name">{cat.category}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
