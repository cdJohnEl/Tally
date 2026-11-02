import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { HabitStats, WeeklyInsightData } from '../lib/habitTypes'

interface InsightsPanelProps {
  stats: HabitStats
  insights: WeeklyInsightData[]
  onClose?: () => void
  isModal?: boolean
}

export default function InsightsPanel({
  stats,
  insights,
  onClose,
  isModal = false,
}: InsightsPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const text = `🌟 My Catalyst Habit Routine: ${stats.points} Points Earned this week! ${stats.completedThisWeek} rituals completed, ${Math.round(stats.totalMinutesThisWeek / 60)}h ${stats.totalMinutesThisWeek % 60}m focused.`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m > 0 ? `${m}m` : ''}`
  }

  return (
    <div className={`habit-insights-card-root ${isModal ? 'is-modal-view' : 'is-desktop-column'}`}>
      {/* Header */}
      <div className="habit-modal-header">
        <h2 className="habit-modal-title insights-title">
          Your progress<br />and insights
        </h2>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="habit-modal-close-btn"
            aria-label="Close insights"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Diagonal-Striped Pillar Progress Chart (Screen 3) */}
      <div className="insights-chart-card">
        <div className="striped-pillars-grid">
          {insights.map((item) => (
            <div key={item.name} className="pillar-column-wrap">
              <div className="pillar-track-striped">
                <div
                  className="pillar-fill-bar"
                  style={{
                    height: `${Math.min(100, Math.max(20, item.percentage * 1.8))}%`,
                    backgroundColor: item.color,
                  }}
                >
                  <span className="pillar-percent-label">{item.percentage}%</span>
                </div>
              </div>
              <span className="pillar-category-label">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Points Earned & Stats Card */}
      <div className="habit-points-card">
        <div className="points-header-row">
          <div>
            <h3 className="points-title">Points Earned</h3>
            <span className="points-subtitle">For this week</span>
          </div>
          <div className="points-score-badge">
            <span>{stats.points} Points</span>
          </div>
        </div>

        <div className="points-stats-triplet">
          <div className="stat-triplet-col">
            <span className="stat-triplet-caption">Post</span>
            <span className="stat-triplet-value">{stats.weightTrainedLb} lb</span>
          </div>
          <div className="stat-triplet-divider" />
          <div className="stat-triplet-col">
            <span className="stat-triplet-caption">Forest area</span>
            <span className="stat-triplet-value">{stats.forestAreaSqFt} ft²</span>
          </div>
          <div className="stat-triplet-divider" />
          <div className="stat-triplet-col">
            <span className="stat-triplet-caption">Time</span>
            <span className="stat-triplet-value">{formatTime(stats.totalMinutesThisWeek)}</span>
          </div>
        </div>
      </div>

      {/* Share Progress Button */}
      <div className="habit-modal-footer">
        <button
          type="button"
          onClick={handleShare}
          className="habit-save-primary-btn"
        >
          {copied ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={18} />
              <span>Copied to Clipboard!</span>
            </span>
          ) : (
            'Share Progress'
          )}
        </button>
      </div>
    </div>
  )
}
