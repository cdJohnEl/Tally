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
    return `${h}h ${m > 0 ? `${m}m` : '30m'}`
  }

  // Ensure default demo values match inspiration when initial
  const displayPoints = stats.points > 0 ? stats.points : 842
  const displayLb = stats.weightTrainedLb > 0 ? stats.weightTrainedLb : 440
  const displayForest = stats.forestAreaSqFt > 0 ? stats.forestAreaSqFt : 200
  const displayTime = stats.totalMinutesThisWeek > 0 ? formatTime(stats.totalMinutesThisWeek) : '7h 30m'

  // Standard 4 pillars matching inspiration image
  const displayInsights = [
    { name: 'Walking', pct: insights[0]?.percentage || 48, color: '#36221a' },
    { name: 'Running', pct: insights[1]?.percentage || 33, color: '#a0471d' },
    { name: 'Mediation', pct: insights[2]?.percentage || 27, color: '#7ba038' },
    { name: 'Drink', pct: insights[3]?.percentage || 40, color: '#df62b7' },
  ]

  return (
    <div className="habit-screen-body animate-fade-in">
      {/* Top Header */}
      <div className="habit-insights-top">
        <h1 className="habit-view-title">
          Your progress<br />and insights
        </h1>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="habit-circle-close"
          aria-label="Close insights"
        >
          <X size={17} strokeWidth={2.5} />
        </button>
      </div>

      {/* Capsule Progress Chart */}
      <div className="habit-capsule-chart">
        <div className="capsule-grid">
          {displayInsights.map((item) => {
            const visualHeight = Math.max(16, item.pct)
            return (
              <div key={item.name} className="capsule-col">
                <div className="capsule-pillar">
                  <div
                    className="capsule-fill"
                    style={{
                      height: `${visualHeight}%`,
                      backgroundColor: item.color,
                    }}
                  >
                    <span className="capsule-pct">{item.pct}%</span>
                  </div>
                </div>
                <span className="capsule-label">{item.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Points Earned Card */}
      <div className="habit-points-box">
        <div className="points-top-row">
          <div>
            <h3 className="points-title-text">Points Earned</h3>
            <span className="points-subtitle-text">For this week</span>
          </div>
          <div className="points-total-number">
            {displayPoints} Points
          </div>
        </div>

        <div className="points-stats-row">
          <div className="stat-col">
            <span className="stat-label">Post</span>
            <span className="stat-val">{displayLb} lb</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-col">
            <span className="stat-label">Forest area</span>
            <span className="stat-val">{displayForest} ft²</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-col">
            <span className="stat-label">Time</span>
            <span className="stat-val">{displayTime}</span>
          </div>
        </div>
      </div>

      {/* Share Progress Button */}
      <button
        type="button"
        onClick={handleShare}
        className="habit-primary-orange-btn"
      >
        {copied ? (
          <>
            <Check size={18} strokeWidth={2.8} />
            <span>Copied to Clipboard!</span>
          </>
        ) : (
          <span>Share Progress</span>
        )}
      </button>
    </div>
  )
}
