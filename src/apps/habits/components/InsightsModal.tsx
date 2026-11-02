import type { HabitStats, WeeklyInsightData } from '../lib/habitTypes'
import InsightsPanel from './InsightsPanel'

interface InsightsModalProps {
  stats: HabitStats
  insights: WeeklyInsightData[]
  onClose: () => void
}

export default function InsightsModal({ stats, insights, onClose }: InsightsModalProps) {
  return (
    <div className="habit-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="habit-modal-dialog habit-insights-dialog animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <InsightsPanel stats={stats} insights={insights} onClose={onClose} isModal={true} />
      </div>
    </div>
  )
}
