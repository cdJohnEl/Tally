import { useState, useEffect } from 'react'
import { Calendar, Sparkles } from 'lucide-react'
import type { CatalystUser } from '../lib/types'

interface DynamicWidgetsProps {
  user: CatalystUser
  onLaunchApp?: (appId: 'tally') => void
}

export default function DynamicWidgets({ user, onLaunchApp }: DynamicWidgetsProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(time)
  const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(time)
  const year = time.getFullYear()

  // User Greeting
  const greetingWord = hours < 12 ? 'Morning' : hours < 17 ? 'Afternoon' : 'Evening'
  const firstName = user.displayName?.trim().split(/\s+/)[0] || 'Explorer'

  // Retrieve tally count from local storage preview
  let localTallySummary = { done: 2, total: 5 }
  try {
    const saved = localStorage.getItem(`catalyst_tally_todos_${user.uid}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        const doneCount = parsed.filter((t) => t.done).length
        localTallySummary = { done: doneCount, total: parsed.length }
      }
    }
  } catch (e) {
    console.error(e)
  }

  return (
    <div className="catalyst-widgets-grid">
      {/* Time & Greeting Main Widget */}
      <div className="catalyst-widget-card time-greeting-card">
        <div className="widget-user-header">
          <div className="user-info-row">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={firstName}
                className="user-widget-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="user-widget-avatar fallback-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="greeting-text-wrap">
              <span className="greeting-small">Good {greetingWord},</span>
              <h2 className="greeting-name">{firstName}</h2>
            </div>
          </div>
          <div className="os-badge-pill">
            <Sparkles size={11} className="text-amber-400" />
            <span>Catalyst OS</span>
          </div>
        </div>

        {/* Live Clock Display */}
        <div className="live-clock-section">
          <div className="digital-time-row">
            <span className="clock-digits">{displayHours}:{minutes}</span>
            <div className="clock-sub-col">
              <span className="clock-ampm">{ampm}</span>
              <span className="clock-seconds">:{seconds}</span>
            </div>
          </div>
          <div className="date-banner-row">
            <Calendar size={13} className="text-indigo-400" />
            <span>{weekday}, {monthDay} • {year}</span>
          </div>
        </div>
      </div>

      {/* Tally Productivity Snapshot Widget */}
      <div
        className="catalyst-widget-card tally-snapshot-card"
        onClick={() => onLaunchApp && onLaunchApp('tally')}
        role="button"
        tabIndex={0}
        title="Open Tally task sheet"
      >
        <div className="snapshot-header">
          <div className="flex items-center gap-2">
            <span className="tally-indicator-dot" />
            <span className="snapshot-title">Tally Tasks</span>
          </div>
          <span className="snapshot-tap-hint">Open App →</span>
        </div>

        <div className="snapshot-body">
          <div className="tally-count-circle">
            <span className="tally-done-num">{localTallySummary.done}</span>
            <span className="tally-total-num">/{localTallySummary.total}</span>
          </div>
          <div className="snapshot-progress-text">
            <strong>{localTallySummary.total - localTallySummary.done} Tasks Pending</strong>
            <span className="text-xs text-slate-400">
              {localTallySummary.done === localTallySummary.total && localTallySummary.total > 0
                ? 'All clear for today! 🎯'
                : 'Click to open Tally sheet'}
            </span>
          </div>
        </div>

        <div className="snapshot-progress-bar">
          <div
            className="snapshot-progress-fill"
            style={{
              width: `${
                localTallySummary.total > 0
                  ? Math.round((localTallySummary.done / localTallySummary.total) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
