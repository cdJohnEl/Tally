import { useState } from 'react'
import {
  ArrowLeft,
  Home,
  Flame,
  CheckCircle2,
  Calendar,
  Trophy,
  Target,
  Plus,
} from 'lucide-react'

interface HabitTrackerAppProps {
  onBackToHome: () => void
}

export default function HabitTrackerApp({ onBackToHome }: HabitTrackerAppProps) {
  const [checkedHabits, setCheckedHabits] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
  })

  const sampleHabits = [
    { id: 1, title: 'Morning Hydration (750ml)', streak: 18, category: 'Wellness', time: 'Morning' },
    { id: 2, title: '45-Min Deep Focus Sprint', streak: 12, category: 'Productivity', time: 'Work' },
    { id: 3, title: 'Read 20 Pages Non-fiction', streak: 6, category: 'Growth', time: 'Evening' },
    { id: 4, title: 'No Screens After 10:30 PM', streak: 4, category: 'Recovery', time: 'Night' },
  ]

  const toggleHabit = (id: number) => {
    setCheckedHabits((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = Object.values(checkedHabits).filter(Boolean).length
  const totalCount = sampleHabits.length
  const percent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="catalyst-app-container habit-theme-wrapper">
      {/* OS Navigation Bar */}
      <nav className="catalyst-app-header-nav" aria-label="Catalyst Navigation">
        <button
          type="button"
          onClick={onBackToHome}
          className="catalyst-nav-back-btn"
          title="Return to Catalyst Home Screen"
        >
          <ArrowLeft size={16} />
          <Home size={15} />
          <span>Catalyst OS</span>
        </button>
        <div className="catalyst-nav-app-pill habit-pill">
          <Flame size={14} className="text-amber-400" />
          <span className="catalyst-nav-app-title">Habit Tracker</span>
        </div>
        <div className="catalyst-nav-sync-status">
          <span className="phase-badge">Phase 1 Preview</span>
        </div>
      </nav>

      <main className="catalyst-placeholder-content">
        {/* Hero Habit Streak Card */}
        <div className="placeholder-hero-card habit-gradient">
          <div className="hero-top-row">
            <div>
              <span className="hero-caption">Current Momentum</span>
              <div className="flex items-center gap-3">
                <h1 className="hero-balance">14 Days</h1>
                <span className="streak-fire-pill">
                  <Flame size={16} className="text-amber-400 animate-bounce" />
                  Best Streak
                </span>
              </div>
            </div>
            <div className="hero-icon-bubble habit-bubble">
              <Trophy size={28} className="text-amber-300" />
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar-labels">
              <span>Today's Completion</span>
              <span>{percent}% ({completedCount}/{totalCount})</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        {/* Phase 1 Verification Callout */}
        <div className="verification-callout habit-callout">
          <div className="callout-header">
            <Target size={20} className="text-amber-400" />
            <h3>Module Architecture Verified</h3>
          </div>
          <p>
            Routing, loading splash transition, and container isolation for <strong>Habit Tracker</strong> are active.
            Persistent streak calculations and reminder notifications will arrive in Phase Two.
          </p>
        </div>

        {/* Action Row */}
        <div className="action-row">
          <button type="button" className="action-card-btn">
            <Plus size={16} className="text-amber-400" />
            <span>New Habit Ritual</span>
          </button>
          <button type="button" className="action-card-btn">
            <Calendar size={16} className="text-amber-400" />
            <span>Monthly Grid</span>
          </button>
        </div>

        {/* Habits Checklist Preview */}
        <div className="transactions-preview-card">
          <div className="card-header">
            <h3>Today's Rituals</h3>
            <span className="badge-preview">Interactive Preview</span>
          </div>

          <div className="habits-list">
            {sampleHabits.map((habit) => {
              const isChecked = !!checkedHabits[habit.id]
              return (
                <div
                  key={habit.id}
                  className={`habit-row ${isChecked ? 'is-completed' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleHabit(habit.id)
                    }
                  }}
                >
                  <div className="habit-row-left">
                    <button
                      type="button"
                      className={`check-toggle ${isChecked ? 'checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleHabit(habit.id)
                      }}
                      aria-label={`Toggle ${habit.title}`}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <div>
                      <h4 className={`habit-title ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {habit.title}
                      </h4>
                      <span className="habit-meta">
                        {habit.category} • {habit.time}
                      </span>
                    </div>
                  </div>
                  <div className="habit-streak-badge">
                    <Flame size={14} className="text-amber-400" />
                    <span>{habit.streak}d</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
