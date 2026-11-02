// Animated Circular Progress Ring Component matching Discipline
import React from "react"

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ percentage, size = 130, strokeWidth = 8 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const clampedPercentage = Math.min(100, Math.max(0, percentage))
  const offset = circumference - (clampedPercentage / 100) * circumference

  return (
    <div className="discipline-progress-svg-wrap" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          style={{ opacity: 0.12 }}
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            color: "var(--d-foreground)",
          }}
        />
      </svg>

      <div className="discipline-progress-center-text">
        <span className="discipline-progress-pct">{percentage}%</span>
        <span className="discipline-progress-lbl">Complete</span>
      </div>
    </div>
  )
}

