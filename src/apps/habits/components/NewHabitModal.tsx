import { useState } from 'react'
import { X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import type { Habit, HabitCategory, HabitColorTheme } from '../lib/habitTypes'

interface NewHabitModalProps {
  onClose: () => void
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'>) => void
  isPhoneScreen?: boolean
}

export default function NewHabitModal({ onClose, onSave, isPhoneScreen }: NewHabitModalProps) {
  const [title, setTitle] = useState('Morning Meditations')
  const [category, setCategory] = useState<HabitCategory>('meditation')
  const [colorTheme, setColorTheme] = useState<HabitColorTheme>('lime')
  const [durationLabel, setDurationLabel] = useState('15 min')
  const [durationMinutes, setDurationMinutes] = useState(15)
  const [goalAmount, setGoalAmount] = useState('1 session')
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])
  const [isGoalChecked, setIsGoalChecked] = useState(true)
  const [isRepeatChecked, setIsRepeatChecked] = useState(true)
  const [selectedDays, setSelectedDays] = useState<number[]>([4]) // Thursday default active like mockup
  const [getReminders, setGetReminders] = useState(true)
  const [reminderTime, setReminderTime] = useState('08:00')

  const weekDayLabels = [
    { num: 1, label: 'M' },
    { num: 2, label: 'T' },
    { num: 3, label: 'W' },
    { num: 4, label: 'T' },
    { num: 5, label: 'F' },
    { num: 6, label: 'S' },
    { num: 7, label: 'S' },
  ]

  const toggleDay = (num: number) => {
    setSelectedDays((prev) =>
      prev.includes(num) ? prev.filter((d) => d !== num) : [...prev, num].sort(),
    )
  }

  const handleCategorySelect = (cat: HabitCategory, theme: HabitColorTheme) => {
    setCategory(cat)
    setColorTheme(theme)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      category,
      colorTheme,
      iconName: category,
      durationMinutes,
      durationLabel,
      goalAmount,
      repeatDays: selectedDays.length > 0 ? selectedDays : [1, 2, 3, 4, 5, 6, 7],
      hasReminder: getReminders,
      reminderTime: getReminders ? reminderTime : undefined,
    })
    onClose()
  }

  const content = (
    <div className="habit-screen-body animate-fade-in">
      {/* Top Header */}
      <div className="habit-modal-top">
        <h2 className="habit-view-title">New habit</h2>
        <button
          type="button"
          onClick={onClose}
          className="habit-circle-close"
          aria-label="Close"
        >
          <X size={17} strokeWidth={2.5} />
        </button>
      </div>

      {/* Cute Illustrated Calendar Doodle (Matches Screenshot) */}
      <div className="habit-doodle-center">
        <svg
          width="110"
          height="92"
          viewBox="0 0 140 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Celebration squiggles */}
          <path
            d="M20 38 Q25 32 30 38 Q35 44 40 38"
            stroke="#f97316"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M106 32 L112 26 M116 38 L124 36 M112 44 L118 50"
            stroke="#f472b6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Calendar Spiral Rings / Ears */}
          <rect x="52" y="16" width="9" height="18" rx="4.5" fill="#84cc16" />
          <rect x="78" y="16" width="9" height="18" rx="4.5" fill="#84cc16" />

          {/* Calendar Main Body with rounded corners */}
          <rect
            x="38"
            y="28"
            width="64"
            height="56"
            rx="16"
            fill="#a3e635"
            stroke="#65a30d"
            strokeWidth="3.5"
          />

          {/* White face card inside */}
          <rect
            x="45"
            y="38"
            width="50"
            height="40"
            rx="10"
            fill="#ffffff"
          />

          {/* Checkmark grids */}
          <rect x="50" y="44" width="7" height="6.5" rx="2" fill="#1e293b" />
          <rect x="61" y="44" width="7" height="6.5" rx="2" fill="#1e293b" />
          <rect x="72" y="44" width="7" height="6.5" rx="2" fill="#1e293b" />
          <rect x="83" y="44" width="7" height="6.5" rx="2" fill="#1e293b" />

          <rect x="50" y="55" width="7" height="6.5" rx="2" fill="#1e293b" />
          <rect x="61" y="55" width="7" height="6.5" rx="2" fill="#1e293b" />
          <rect x="72" y="55" width="7" height="6.5" rx="2" fill="#a3e635" />
          <rect x="83" y="55" width="7" height="6.5" rx="2" fill="#a3e635" />
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="habit-form-stack">
        {/* Name your habit */}
        <div className="habit-form-field">
          <label className="habit-form-label">Name your habit</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Morning Meditations"
            className="habit-white-input"
            required
          />
        </div>

        {/* Set a goal */}
        <div className="habit-form-field">
          <div className="habit-field-row">
            <label className="habit-form-label">Set a goal</label>
            <input
              type="checkbox"
              checked={isGoalChecked}
              onChange={(e) => setIsGoalChecked(e.target.checked)}
              className="habit-checkbox"
              aria-label="Toggle set a goal"
            />
          </div>

          <div className="habit-dual-inputs">
            {/* Add date */}
            <div className="habit-pill-input-wrap">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="habit-pill-input"
              />
              <CalendarIcon size={15} style={{ color: '#7b6a60', flexShrink: 0 }} />
            </div>

            {/* Add amount dropdown */}
            <div className="habit-pill-input-wrap">
              <select
                value={durationLabel}
                onChange={(e) => {
                  setDurationLabel(e.target.value)
                  const parsed = parseInt(e.target.value)
                  if (!isNaN(parsed)) setDurationMinutes(parsed)
                  setGoalAmount(e.target.value)
                }}
                className="habit-pill-select"
              >
                <option value="5 min">5 min</option>
                <option value="10 min">10 min</option>
                <option value="15 min">15 min</option>
                <option value="20 min">20 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
                <option value="8 glasses">8 glasses</option>
                <option value="1 session">1 session</option>
              </select>
              <ChevronDown size={15} style={{ color: '#7b6a60', flexShrink: 0 }} />
            </div>
          </div>
        </div>

        {/* Repeat days */}
        <div className="habit-form-field">
          <div className="habit-field-row">
            <label className="habit-form-label">Repeat days</label>
            <input
              type="checkbox"
              checked={isRepeatChecked}
              onChange={(e) => {
                setIsRepeatChecked(e.target.checked)
                if (!e.target.checked) setSelectedDays([])
                else setSelectedDays([1, 2, 3, 4, 5, 6, 7])
              }}
              className="habit-checkbox"
              aria-label="Toggle repeat days"
            />
          </div>

          <div className="habit-days-circle-row">
            {weekDayLabels.map((d) => {
              const isActive = selectedDays.includes(d.num)
              return (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => toggleDay(d.num)}
                  className={`habit-day-select-circle ${isActive ? 'active' : ''}`}
                  aria-pressed={isActive}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Get reminders */}
        <div className="habit-field-row">
          <label className="habit-form-label">Get reminders</label>
          <label className="habit-orange-switch">
            <input
              type="checkbox"
              checked={getReminders}
              onChange={(e) => setGetReminders(e.target.checked)}
            />
            <span className="orange-slider" />
          </label>
        </div>

        {/* Save Habit Primary Button */}
        <button type="submit" className="habit-primary-orange-btn">
          Save Habit
        </button>
      </form>
    </div>
  )

  if (isPhoneScreen) {
    return content
  }

  return (
    <div className="habit-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="habit-phone-frame" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        {content}
      </div>
    </div>
  )
}
