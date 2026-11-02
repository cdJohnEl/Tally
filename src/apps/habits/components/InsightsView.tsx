import { useState } from 'react'
import { ArrowLeft, X, Check, Share2, Sparkles, TrendingUp } from 'lucide-react'
import type { HabitStats, WeeklyInsightData } from '../lib/habitTypes'

interface InsightsViewProps {
  stats: HabitStats
  insights: WeeklyInsightData[]
  onBackToDashboard: () => void
}

export default function InsightsView({
  stats,
  insights,
  onBackToDashboard,
}: InsightsViewProps) {
  const [copied, setCopied] = useState(false)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(
    insights[0]?.name || 'Walking',
  )

  const activePillar =
    insights.find((item) => item.name === selectedCategoryName) || insights[0] || null

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
    <div className="habit-insights-standalone-view animate-fade-in">
      {/* Top Header Navigation */}
      <div className="habit-view-top-header">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="habit-round-nav-btn"
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
          <TrendingUp size={14} className="text-orange-500" />
          <span>Routine Insights</span>
        </div>

        <button
          type="button"
          onClick={onBackToDashboard}
          className="habit-round-nav-btn"
          title="Close Insights"
          aria-label="Close Insights"
        >
          <X size={18} />
        </button>
      </div>

      {/* Title Block */}
      <div className="habit-screen-heading-block">
        <h1 className="habit-greeting-title insights-title">
          Your progress<br />and insights
        </h1>
        <p className="habit-header-date">
          Active rolling 7-day momentum
        </p>
      </div>

      {/* Dynamic Diagonal-Striped Pillar Progress Chart */}
      <div className="insights-chart-card">
        {/* Active Inspection Chip */}
        <div className="pillar-active-chip">
          {activePillar ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: activePillar.color }}
              />
              <strong>{activePillar.name}:</strong> {activePillar.completedDays} of {activePillar.totalDays} days completed ({activePillar.percentage}%)
            </span>
          ) : (
            <span className="text-xs text-stone-400">Tap any pillar to view detailed stats</span>
          )}
        </div>

        <div className="striped-pillars-grid">
          {insights.map((item) => {
            const isSelected = activePillar?.name === item.name
            // Height corresponds directly to completion percentage (min 14% for pill curve visibility)
            const visualHeight = item.percentage === 0 ? 8 : Math.max(14, item.percentage)

            return (
              <div
                key={item.name}
                className={`pillar-column-wrap ${isSelected ? 'is-highlighted' : ''}`}
                onClick={() => setSelectedCategoryName(item.name)}
                role="button"
                tabIndex={0}
                title={`${item.name}: ${item.completedDays}/${item.totalDays} days (${item.percentage}%)`}
              >
                <div className="pillar-track-striped">
                  <div
                    className="pillar-fill-bar"
                    style={{
                      height: `${visualHeight}%`,
                      backgroundColor: item.color,
                    }}
                  >
                    <span className="pillar-percent-label">{item.percentage}%</span>
                  </div>
                </div>
                <span className="pillar-category-label">{item.name}</span>
              </div>
            )
          })}
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
            <Sparkles size={16} className="inline mr-1 text-orange-500" />
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

      {/* "Share Progress" Primary Button (Visually polished & prominent) */}
      <div className="share-progress-container">
        <button
          type="button"
          onClick={handleShare}
          className={`share-progress-btn ${copied ? 'is-success' : ''}`}
          aria-label="Share your habit routine progress"
        >
          {copied ? (
            <>
              <Check size={18} strokeWidth={2.8} />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 size={18} strokeWidth={2.5} />
              <span>Share Progress</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
