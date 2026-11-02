import { useState } from 'react'

export interface MonthDataPoint {
  month: string
  income: number
  expense: number
  isHighlighted?: boolean
}

interface DualBarChartProps {
  data?: MonthDataPoint[]
  showTimeFilter?: boolean
}

const DEFAULT_DATA: MonthDataPoint[] = [
  { month: 'Feb', income: 140, expense: 110 },
  { month: 'Mar', income: 240, expense: 135 },
  { month: 'Apr', income: 180, expense: 160 },
  { month: 'May', income: 215, expense: 195 },
  { month: 'Jun', income: 165, expense: 125 },
  { month: 'Jul', income: 313.31, expense: 192, isHighlighted: true },
]

export default function DualBarChart({ data = DEFAULT_DATA, showTimeFilter = true }: DualBarChartProps) {
  const [activeIdx, setActiveIdx] = useState<number>(5) // default to July (index 5)
  const [timeMode, setTimeMode] = useState<'Monthly' | 'Weekly'>('Monthly')

  const maxVal = 350
  const yAxisTicks = ['$314', '$188', '$98', '$0']

  const activePoint = data[activeIdx] || data[data.length - 1]

  return (
    <div className="dual-barchart-card">
      {/* Top Filter and Legend Row */}
      <div className="barchart-header-row">
        {showTimeFilter ? (
          <div className="dropdown-pill">
            <select
              value={timeMode}
              onChange={(e) => setTimeMode(e.target.value as any)}
              className="time-select"
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
            </select>
            <span className="dropdown-caret">⌄</span>
          </div>
        ) : (
          <span className="barchart-title">Monthly Comparison</span>
        )}

        <div className="barchart-legend">
          <div className="legend-item">
            <span className="legend-dot income-dot" />
            <span>Income</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot expense-dot" />
            <span>Expense</span>
          </div>
        </div>
      </div>

      {/* Value Tooltip Bubble */}
      {activePoint && (
        <div className="chart-tooltip-bubble">
          <div className="tooltip-stat">
            <span className="tooltip-dot expense-dot" />
            <span>${activePoint.expense.toFixed(0)}</span>
          </div>
          <div className="tooltip-divider" />
          <div className="tooltip-stat">
            <span className="tooltip-dot income-dot" />
            <span>${activePoint.income.toFixed(0)}</span>
          </div>
        </div>
      )}

      {/* Chart Canvas with Axes */}
      <div className="chart-grid-area">
        {/* Y Axis ticks */}
        <div className="y-axis-labels">
          {yAxisTicks.map((tick) => (
            <span key={tick} className="y-tick">{tick}</span>
          ))}
        </div>

        {/* Bars Container */}
        <div className="bars-columns-wrapper">
          {data.map((item, idx) => {
            const isSelected = activeIdx === idx
            const expenseHeight = Math.min(Math.round((item.expense / maxVal) * 100), 100)
            const incomeHeight = Math.min(Math.round((item.income / maxVal) * 100), 100)

            return (
              <div
                key={item.month}
                className={`month-bar-group ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setActiveIdx(idx)}
                role="button"
                tabIndex={0}
                title={`${item.month}: Expense $${item.expense}, Income $${item.income}`}
              >
                <div className="bars-pair">
                  {/* Expense Bar (Green) */}
                  <div className="bar-track">
                    <div
                      className="bar-fill expense-bar"
                      style={{ height: `${expenseHeight}%` }}
                    />
                  </div>

                  {/* Income Bar (Purple) */}
                  <div className="bar-track">
                    <div
                      className="bar-fill income-bar"
                      style={{ height: `${incomeHeight}%` }}
                    />
                  </div>
                </div>

                {/* X Axis label */}
                <span className={`month-label ${isSelected ? 'is-active' : ''}`}>
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
