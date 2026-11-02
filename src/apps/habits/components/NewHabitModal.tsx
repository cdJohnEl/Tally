import { useState } from 'react'
import { X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import type { Habit, HabitCategory, HabitColorTheme } from '../lib/habitTypes'

interface NewHabitModalProps {
  onClose: () => void
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'>) => void
}

export default function NewHabitModal({ onClose, onSave }: NewHabitModalProps) {
  const [title, setTitle] = useState('Morning Meditations')
  const [category, setCategory] = useState<HabitCategory>('meditation')
  const [colorTheme, setColorTheme] = useState<HabitColorTheme>('lime')
  const [durationLabel, setDurationLabel] = useState('15 min')
  const [durationMinutes, setDurationMinutes] = useState(15)
  const [goalAmount, setGoalAmount] = useState('1 session')
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])
  const [isGoalChecked, setIsGoalChecked] = useState(true)
  const [isRepeatChecked, setIsRepeatChecked] = useState(true)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]) // Mon to Sun
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

  return (
    <div className="habit-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="habit-modal-dialog animate-rise" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="habit-modal-header">
          <h2 className="habit-modal-title">New habit</h2>
          <button
            type="button"
            onClick={onClose}
            className="habit-modal-close-btn"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cute Illustrated Calendar Header (Matches Screenshot) */}
        <div className="habit-hero-illustration">
          <svg
            width="120"
            height="100"
            viewBox="0 0 140 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="calendar-doodle-svg"
          >
            {/* Celebration squiggles */}
            <path
              d="M20 38 Q25 32 30 38 Q35 44 40 38"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M106 32 L112 26 M116 38 L124 36 M112 44 L118 50"
              stroke="#f472b6"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Calendar Spiral Rings / Ears */}
            <rect x="52" y="16" width="10" height="20" rx="5" fill="#84cc16" />
            <rect x="78" y="16" width="10" height="20" rx="5" fill="#84cc16" />

            {/* Calendar Main Body with rounded corners */}
            <rect
              x="38"
              y="28"
              width="64"
              height="58"
              rx="18"
              fill="#a3e635"
              stroke="#65a30d"
              strokeWidth="4"
            />

            {/* White face card inside */}
            <rect
              x="45"
              y="38"
              width="50"
              height="42"
              rx="12"
              fill="#ffffff"
            />

            {/* Checkmark grids */}
            <rect x="50" y="44" width="7" height="7" rx="2" fill="#1e293b" />
            <rect x="61" y="44" width="7" height="7" rx="2" fill="#1e293b" />
            <rect x="72" y="44" width="7" height="7" rx="2" fill="#1e293b" />
            <rect x="83" y="44" width="7" height="7" rx="2" fill="#1e293b" />

            <rect x="50" y="56" width="7" height="7" rx="2" fill="#1e293b" />
            <rect x="61" y="56" width="7" height="7" rx="2" fill="#1e293b" />
            <rect x="72" y="56" width="7" height="7" rx="2" fill="#a3e635" />
            <rect x="83" y="56" width="7" height="7" rx="2" fill="#a3e635" />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="habit-form-body">
          {/* Name your habit */}
          <div className="habit-form-group">
            <label className="habit-field-label">Name your habit</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Meditations"
              className="habit-text-input"
              required
            />
          </div>

          {/* Quick Category / Theme Picker */}
          <div className="habit-form-group">
            <label className="habit-field-label">Category</label>
            <div className="category-pill-select-row">
              {[
                { cat: 'hydration', label: '💧 Water', theme: 'peach' },
                { cat: 'meditation', label: '🧘 Meditation', theme: 'lime' },
                { cat: 'fitness', label: '🤸 Stretch', theme: 'pink' },
                { cat: 'walking', label: '🚶 Walk', theme: 'orange' },
                { cat: 'reading', label: '📖 Reading', theme: 'sky' },
              ].map((item) => (
                <button
                  key={item.cat}
                  type="button"
                  onClick={() => handleCategorySelect(item.cat as HabitCategory, item.theme as HabitColorTheme)}
                  className={`cat-select-chip ${category === item.cat ? 'is-selected' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Set a goal */}
          <div className="habit-form-group">
            <div className="habit-field-header-row">
              <label className="habit-field-label">Set a goal</label>
              <input
                type="checkbox"
                checked={isGoalChecked}
                onChange={(e) => setIsGoalChecked(e.target.checked)}
                className="habit-custom-checkbox"
                aria-label="Toggle set a goal"
              />
            </div>

            <div className="habit-two-col-inputs">
              {/* Add date */}
              <div className="habit-input-with-icon">
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="habit-sub-input"
                />
                <CalendarIcon size={16} className="habit-input-suffix-icon" />
              </div>

              {/* Add amount dropdown */}
              <div className="habit-input-with-icon">
                <select
                  value={durationLabel}
                  onChange={(e) => {
                    setDurationLabel(e.target.value)
                    const parsed = parseInt(e.target.value)
                    if (!isNaN(parsed)) setDurationMinutes(parsed)
                    setGoalAmount(e.target.value)
                  }}
                  className="habit-sub-select"
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
                <ChevronDown size={16} className="habit-input-suffix-icon" />
              </div>
            </div>
          </div>

          {/* Repeat days */}
          <div className="habit-form-group">
            <div className="habit-field-header-row">
              <label className="habit-field-label">Repeat days</label>
              <input
                type="checkbox"
                checked={isRepeatChecked}
                onChange={(e) => {
                  setIsRepeatChecked(e.target.checked)
                  if (!e.target.checked) setSelectedDays([])
                  else setSelectedDays([1, 2, 3, 4, 5, 6, 7])
                }}
                className="habit-custom-checkbox"
                aria-label="Toggle repeat days"
              />
            </div>

            <div className="weekday-pill-selector">
              {weekDayLabels.map((d) => {
                const isActive = selectedDays.includes(d.num)
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => toggleDay(d.num)}
                    className={`weekday-circle-btn ${isActive ? 'is-active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span>{d.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Get reminders */}
          <div className="habit-reminder-switch-row">
            <label className="habit-field-label">Get reminders</label>
            <label className="habit-toggle-switch">
              <input
                type="checkbox"
                checked={getReminders}
                onChange={(e) => setGetReminders(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {getReminders && (
            <div className="reminder-time-input-row">
              <span className="reminder-time-label">Notification Time</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="habit-time-picker"
              />
            </div>
          )}

          {/* Save Habit Primary Action */}
          <div className="habit-modal-footer">
            <button type="submit" className="habit-save-primary-btn">
              Save Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
