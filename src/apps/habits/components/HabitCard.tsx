import { Clock } from 'lucide-react'
import type { Habit } from '../lib/habitTypes'

interface HabitCardProps {
  habit: Habit
  isCompleted: boolean
  isFirst?: boolean
  isLast?: boolean
  onToggle: (habitId: string) => void
  onClickCard?: (habit: Habit) => void
}

export default function HabitCard({
  habit,
  isCompleted,
  isFirst,
  isLast,
  onToggle,
  onClickCard,
}: HabitCardProps) {
  // Render icon based on habit category or iconName
  const renderCategoryIcon = () => {
    switch (habit.category) {
      case 'hydration':
        return (
          <div className="habit-squircle squircle-peach" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3 L18 3 L16 21 L8 21 Z" />
              <path d="M7.5 9 L16.5 9" strokeDasharray="1 1" />
            </svg>
          </div>
        )
      case 'meditation':
        return (
          <div className="habit-squircle squircle-lime" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="3" />
              <path d="M6 20 C6 15 9 12 12 12 C15 12 18 15 18 20" />
              <path d="M3 17 Q7 13 12 17 Q17 13 21 17" />
            </svg>
          </div>
        )
      case 'fitness':
        return (
          <div className="habit-squircle squircle-pink" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="5" r="2" />
              <path d="M5 21 L10 14 L15 17 L20 10" />
              <path d="M10 14 L12 9 L17 10" />
            </svg>
          </div>
        )
      case 'walking':
        return (
          <div className="habit-squircle squircle-orange" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17 Q8 10 13 15 Q17 19 21 13" />
              <circle cx="7" cy="18" r="2.5" />
              <circle cx="16" cy="12" r="2.5" />
            </svg>
          </div>
        )
      case 'reading':
        return (
          <div className="habit-squircle squircle-sky" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="habit-squircle squircle-peach" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="habit-timeline-row">
      {/* Left Timeline rail with dotted line & check circle */}
      <div className="timeline-col">
        {!isFirst && <div className="timeline-line top" />}
        <button
          type="button"
          onClick={() => onToggle(habit.id)}
          className={`habit-node-circle ${isCompleted ? 'checked' : ''}`}
          aria-label={isCompleted ? `Mark ${habit.title} incomplete` : `Mark ${habit.title} complete`}
          title={isCompleted ? 'Completed' : 'Mark as done'}
        >
          {isCompleted && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        {!isLast && <div className="timeline-line bottom" />}
      </div>

      {/* Habit Card Body */}
      <div
        className={`habit-card ${isCompleted ? 'is-done' : ''}`}
        onClick={() => onToggle(habit.id)}
        role="button"
        tabIndex={0}
      >
        <div className="habit-card-left">
          {renderCategoryIcon()}
          <div className="habit-card-info">
            <div className="habit-card-name">{habit.title}</div>
            <div className="habit-card-streak-text">
              Streak {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        <div className="habit-card-right">
          <Clock size={13} />
          <span>{habit.durationLabel}</span>
        </div>
      </div>
    </div>
  )
}
