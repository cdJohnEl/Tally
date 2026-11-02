import { useEffect, useState } from 'react'
import {
  FileText,
  Wallet,
  Flame,
  Headphones,
} from 'lucide-react'
import type { CatalystAppId } from '../lib/types'

interface AppTransitionProps {
  appId: CatalystAppId
  onComplete: () => void
}

interface AppDetails {
  title: string
  category: string
  color: string
  icon: typeof FileText
  statusMessages: string[]
}

const APP_DETAILS: Record<Exclude<CatalystAppId, 'home'>, AppDetails> = {
  tally: {
    title: 'Tally',
    category: 'Daily Task Sheet',
    color: '#336649',
    icon: FileText,
    statusMessages: [
      'Unfolding paper canvas…',
      'Loading task entries & tallies…',
      'Connecting realtime ledger…',
      'Ready.',
    ],
  },
  expenses: {
    title: 'Pocket Lens',
    category: 'Finance & Receipt AI',
    color: '#7047eb',
    icon: Wallet,
    statusMessages: [
      'Loading spending wallet…',
      'Syncing transactions & charts…',
      'Activating receipt lens AI…',
      'Ready.',
    ],
  },
  habits: {
    title: 'Habit Tracker',
    category: 'Daily Streaks',
    color: '#b37517',
    icon: Flame,
    statusMessages: [
      'Reviewing streak momentum…',
      'Loading daily check-ins…',
      'Verifying Phase 1 module…',
      'Ready.',
    ],
  },
  audio: {
    title: 'Focus Audio',
    category: 'Ambient Soundscapes',
    color: '#6366f1',
    icon: Headphones,
    statusMessages: [
      'Warming audio synth generators…',
      'Loading Pomodoro timer…',
      'Verifying Phase 1 module…',
      'Ready.',
    ],
  },
}

export default function AppTransition({ appId, onComplete }: AppTransitionProps) {
  const [progress, setProgress] = useState(20)
  const [statusIdx, setStatusIdx] = useState(0)

  if (appId === 'home') return null
  const details = APP_DETAILS[appId]
  const Icon = details.icon

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(55)
      setStatusIdx(1)
    }, 180)

    const t2 = setTimeout(() => {
      setProgress(85)
      setStatusIdx(2)
    }, 380)

    const t3 = setTimeout(() => {
      setProgress(100)
      setStatusIdx(3)
    }, 560)

    const t4 = setTimeout(() => {
      onComplete()
    }, 720)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onComplete])

  return (
    <div className="catalyst-paper-transition-overlay" role="status" aria-live="polite">
      <div className="paper-transition-card rise">
        <div className="transition-seal" style={{ borderColor: details.color }}>
          <Icon size={28} style={{ color: details.color }} />
        </div>

        <div className="transition-title-wrap">
          <span className="transition-category">{details.category}</span>
          <h1 className="transition-heading">{details.title}</h1>
        </div>

        <div className="transition-status-line">
          <span className="sync-dot animate-pulse" style={{ background: details.color }} />
          <span className="transition-status-text">{details.statusMessages[statusIdx]}</span>
        </div>

        <div className="paper-progress-track">
          <div
            className="paper-progress-fill"
            style={{ width: `${progress}%`, background: details.color }}
          />
        </div>
      </div>
    </div>
  )
}
