import { useState, useEffect } from 'react'
import { Timer, RotateCcw, Play, Pause } from 'lucide-react'

interface FocusTimerProps {
  onTimerComplete: () => void
  isAutoFadeout: boolean
  onToggleAutoFadeout: () => void
}

const TIMER_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
]

export default function FocusTimer({
  onTimerComplete,
  isAutoFadeout,
  onToggleAutoFadeout,
}: FocusTimerProps) {
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [customMinutesInput, setCustomMinutesInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Countdown effect
  useEffect(() => {
    let interval: number | undefined
    if (isRunning && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            onTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, secondsLeft, onTimerComplete])

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false)
    setTargetMinutes(mins)
    setSecondsLeft(mins * 60)
    setShowCustomInput(false)
  }

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(customMinutesInput, 10)
    if (!isNaN(parsed) && parsed > 0 && parsed <= 360) {
      setIsRunning(false)
      setTargetMinutes(parsed)
      setSecondsLeft(parsed * 60)
      setShowCustomInput(false)
      setCustomMinutesInput('')
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(targetMinutes * 60)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Calculate percentage of progress
  const totalSeconds = targetMinutes * 60
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100))

  return (
    <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Focus & Sleep Timer</h3>
        </div>

        {/* Auto fade-out toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300 transition-colors select-none">
          <input
            type="checkbox"
            checked={isAutoFadeout}
            onChange={onToggleAutoFadeout}
            className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span>Auto-fadeout audio</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Preset Duration Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIMER_PRESETS.map((p) => {
            const isSelected = targetMinutes === p.minutes && !showCustomInput
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p.minutes)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {p.label}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showCustomInput
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700/60'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Duration Input Form */}
        {showCustomInput && (
          <form onSubmit={handleApplyCustomMinutes} className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="360"
              placeholder="Mins"
              value={customMinutesInput}
              onChange={(e) => setCustomMinutesInput(e.target.value)}
              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-400 text-center font-mono"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-sky-500 text-white rounded-lg text-xs font-medium hover:bg-sky-400 transition-colors"
            >
              Set
            </button>
          </form>
        )}

        {/* Live Digits Display & Play/Pause/Reset Controls */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-100 tabular-nums">
            {formatTime(secondsLeft)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
              title={isRunning ? 'Pause timer' : 'Start timer'}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <Pause size={14} className="fill-current" />
              ) : (
                <Play size={14} className="fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-1000 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}
