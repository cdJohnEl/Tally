import { useEffect, useState } from 'react'
import {
  FileText,
  Wallet,
  Flame,
  Headphones,
  Sparkles,
} from 'lucide-react'
import type { CatalystAppId } from '../lib/types'

interface AppTransitionProps {
  appId: CatalystAppId
  onComplete: () => void
}

interface AppDetails {
  title: string
  tagline: string
  color: string
  bgGradient: string
  icon: typeof FileText
  statusMessages: string[]
}

const APP_DETAILS: Record<Exclude<CatalystAppId, 'home'>, AppDetails> = {
  tally: {
    title: 'Tally',
    tagline: 'Notes & Realtime Tasks Sheet',
    color: '#336649',
    bgGradient: 'radial-gradient(circle at center, #274f38 0%, #15291d 60%, #0c1811 100%)',
    icon: FileText,
    statusMessages: ['Opening paper canvas...', 'Loading tasks & tallies...', 'Syncing realtime ledger...', 'Ready.'],
  },
  expenses: {
    title: 'Expense Ledger',
    tagline: 'Financial Tracking & Budget Intelligence',
    color: '#10b981',
    bgGradient: 'radial-gradient(circle at center, #064e3b 0%, #022c22 60%, #03140f 100%)',
    icon: Wallet,
    statusMessages: ['Connecting currency engine...', 'Calculating balances...', 'Restoring ledger history...', 'Ready.'],
  },
  habits: {
    title: 'Habit Tracker',
    tagline: 'Daily Rhythm & Streak Momentum',
    color: '#f59e0b',
    bgGradient: 'radial-gradient(circle at center, #78350f 0%, #451a03 60%, #1c0a01 100%)',
    icon: Flame,
    statusMessages: ['Evaluating active streaks...', 'Assembling daily habits...', 'Syncing momentum score...', 'Ready.'],
  },
  audio: {
    title: 'Focus Audio',
    tagline: 'Binaural Soundscapes & Focus Sprints',
    color: '#8b5cf6',
    bgGradient: 'radial-gradient(circle at center, #4c1d95 0%, #2e1065 60%, #13072b 100%)',
    icon: Headphones,
    statusMessages: ['Warming audio synthesizers...', 'Loading ambient soundscapes...', 'Calibrating frequency...', 'Ready.'],
  },
}

export default function AppTransition({ appId, onComplete }: AppTransitionProps) {
  const [progress, setProgress] = useState(15)
  const [statusIdx, setStatusIdx] = useState(0)

  if (appId === 'home') return null
  const details = APP_DETAILS[appId]
  const Icon = details.icon

  useEffect(() => {
    // Stage 1
    const t1 = setTimeout(() => {
      setProgress(55)
      setStatusIdx(1)
    }, 180)

    // Stage 2
    const t2 = setTimeout(() => {
      setProgress(85)
      setStatusIdx(2)
    }, 380)

    // Stage 3
    const t3 = setTimeout(() => {
      setProgress(100)
      setStatusIdx(3)
    }, 560)

    // Complete transition
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
    <div
      className="catalyst-app-transition-overlay"
      style={{ background: details.bgGradient }}
      role="status"
      aria-live="polite"
    >
      <div className="transition-content-box">
        {/* Pulsing Glow Ring & Icon */}
        <div className="transition-icon-wrap" style={{ borderColor: `${details.color}88` }}>
          <div className="transition-glow-halo" style={{ backgroundColor: details.color }} />
          <div
            className="transition-icon-bubble"
            style={{ backgroundColor: details.color, boxShadow: `0 16px 40px ${details.color}66` }}
          >
            <Icon size={44} className="text-white" strokeWidth={2.2} />
          </div>
        </div>

        {/* Title and Tagline */}
        <h1 className="transition-app-title">{details.title}</h1>
        <p className="transition-app-tagline">{details.tagline}</p>

        {/* Dynamic Status Message */}
        <div className="transition-status-pill">
          <Sparkles size={13} style={{ color: details.color }} className="animate-spin-slow" />
          <span>{details.statusMessages[statusIdx]}</span>
        </div>

        {/* Animated Progress Bar */}
        <div className="transition-progress-track">
          <div
            className="transition-progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: details.color,
              boxShadow: `0 0 16px ${details.color}`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
