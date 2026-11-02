import { useState, useEffect } from 'react'
import { Timer, RotateCcw, Play, Pause } from 'lucide-react'

interface FocusTimerProps {
  onTimerComplete: () => void
  isAutoFadeout: boolean
  onToggleAutoFadeout: () => void
}

const PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
]

export default function FocusTimer({ onTimerComplete, isAutoFadeout, onToggleAutoFadeout }: FocusTimerProps) {
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    let interval: number | undefined
    if (isRunning && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) { setIsRunning(false); onTimerComplete(); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, secondsLeft, onTimerComplete])

  const selectPreset = (mins: number) => {
    setIsRunning(false); setTargetMinutes(mins); setSecondsLeft(mins * 60); setShowCustom(false)
  }

  const applyCustom = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(customInput, 10)
    if (!isNaN(parsed) && parsed > 0 && parsed <= 360) {
      setIsRunning(false); setTargetMinutes(parsed); setSecondsLeft(parsed * 60)
      setShowCustom(false); setCustomInput('')
    }
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const progress = Math.max(0, Math.min(100, ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100))

  return (
    <div className="fa-timer">
      <div className="fa-timer-header">
        <span className="fa-timer-label">
          <Timer size={15} style={{ color: 'var(--fa-ink-3)' }} />
          Focus &amp; Sleep Timer
        </span>
        <label className="fa-fadeout-toggle">
          <input type="checkbox" checked={isAutoFadeout} onChange={onToggleAutoFadeout} style={{ accentColor: 'var(--fa-ink)', width: 14, height: 14, cursor: 'pointer' }} />
          Auto-fadeout audio
        </label>
      </div>

      <div className="fa-timer-body">
        <div className="fa-timer-presets">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => selectPreset(p.minutes)}
              className={`fa-timer-pill${targetMinutes === p.minutes && !showCustom ? ' active' : ''}`}>
              {p.label}
            </button>
          ))}
          <button type="button" onClick={() => setShowCustom(!showCustom)}
            className={`fa-timer-pill${showCustom ? ' active' : ''}`}>
            Custom
          </button>
          {showCustom && (
            <form onSubmit={applyCustom} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="number" min="1" max="360" placeholder="min" value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="fa-custom-input" />
              <button type="submit" className="fa-set-btn">Set</button>
            </form>
          )}
        </div>

        <div className="fa-timer-display">
          <span className="fa-time-digits">{fmt(secondsLeft)}</span>
          <button type="button" onClick={() => setIsRunning(!isRunning)}
            className={`fa-timer-ctrl-btn play`}
            title={isRunning ? 'Pause' : 'Start'} aria-label={isRunning ? 'Pause timer' : 'Start timer'}>
            {isRunning ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" style={{ marginLeft: 2 }} />}
          </button>
          <button type="button" onClick={() => { setIsRunning(false); setSecondsLeft(targetMinutes * 60) }}
            className="fa-timer-ctrl-btn" title="Reset" aria-label="Reset timer">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="fa-progress-bar">
          <div className="fa-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
