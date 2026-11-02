import { useState } from 'react'
import { X, Bell, Check } from 'lucide-react'

interface ReminderModalProps {
  onClose: () => void
  onSaveReminder: (time: string) => void
}

export default function ReminderModal({ onClose, onSaveReminder }: ReminderModalProps) {
  const [time, setTime] = useState('07:30')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveReminder(time)
    setSaved(true)

    // Request Notification permission if supported
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        Notification.requestPermission()
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="habit-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="habit-modal-dialog animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="habit-modal-header">
          <div className="flex items-center gap-2">
            <div className="habit-icon-squircle theme-peach">
              <Bell size={18} className="text-orange-600" />
            </div>
            <h2 className="habit-modal-title">Morning Routine Reminder</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="habit-modal-close-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="habit-form-body">
          <p className="card-desc" style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Set a gentle alert so you never miss your daily routines. We'll nudge you right on time.
          </p>

          <div className="habit-form-group">
            <label className="habit-field-label">Preferred Reminder Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="habit-time-picker-large"
              required
            />
          </div>

          <div className="quick-times-row">
            {['06:30', '07:00', '07:30', '08:00', '08:30'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={`quick-time-chip ${time === t ? 'is-selected' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="habit-reminder-switch-row">
            <label className="habit-field-label">Enable gentle chime</label>
            <label className="habit-toggle-switch">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="habit-modal-footer">
            <button type="submit" className="habit-save-primary-btn">
              {saved ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={18} />
                  <span>Reminder Scheduled!</span>
                </span>
              ) : (
                'Save Reminder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
