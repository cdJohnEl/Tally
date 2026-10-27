import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Home,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CloudRain,
  Coffee,
  Trees,
  Radio,
  ShieldCheck,
} from 'lucide-react'

interface FocusAudioAppProps {
  onBackToHome: () => void
}

export default function FocusAudioApp({ onBackToHome }: FocusAudioAppProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(65)

  // Timer effect
  useEffect(() => {
    let interval: number | undefined
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }
    return () => window.clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const soundscapes = [
    { id: 'rain', name: 'Rain on Glass', icon: CloudRain, color: '#38bdf8' },
    { id: 'cafe', name: 'Lo-Fi Coffee Bar', icon: Coffee, color: '#fb923c' },
    { id: 'forest', name: 'Boreal Wind', icon: Trees, color: '#4ade80' },
    { id: 'white-noise', name: 'Alpha Binaural (40Hz)', icon: Radio, color: '#a855f7' },
  ]

  const toggleSound = (id: string) => {
    setActiveSound((prev) => (prev === id ? null : id))
  }

  return (
    <div className="catalyst-app-container audio-theme-wrapper">
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
        <div className="catalyst-nav-app-pill audio-pill">
          <Headphones size={14} className="text-violet-400" />
          <span className="catalyst-nav-app-title">Focus Audio</span>
        </div>
        <div className="catalyst-nav-sync-status">
          <span className="phase-badge">Phase 1 Preview</span>
        </div>
      </nav>

      <main className="catalyst-placeholder-content">
        {/* Pomodoro Timer Hero Card */}
        <div className="placeholder-hero-card audio-gradient">
          <span className="hero-caption">Focus Sprint (25m)</span>
          <div className="timer-display-wrap">
            <h1 className="timer-digits">{formatTime(timeLeft)}</h1>
            <div className="timer-controls">
              <button
                type="button"
                className={`timer-play-btn ${isRunning ? 'is-playing' : ''}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
                <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
              <button
                type="button"
                className="timer-reset-btn"
                onClick={() => {
                  setIsRunning(false)
                  setTimeLeft(25 * 60)
                }}
                title="Reset timer"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Phase 1 Verification Callout */}
        <div className="verification-callout audio-callout">
          <div className="callout-header">
            <ShieldCheck size={20} className="text-violet-400" />
            <h3>Module Architecture Verified</h3>
          </div>
          <p>
            Routing, loading splash transition, and container isolation for <strong>Focus Audio</strong> are active.
            Web Audio synthesized ambient generators and Spotify integration will arrive in Phase Two.
          </p>
        </div>

        {/* Ambient Soundscape Cards */}
        <div className="transactions-preview-card">
          <div className="card-header">
            <h3>Ambient Soundscapes</h3>
            <span className="badge-preview">Sound Generator</span>
          </div>

          <div className="soundscapes-grid">
            {soundscapes.map((sound) => {
              const Icon = sound.icon
              const isSelected = activeSound === sound.id
              return (
                <button
                  key={sound.id}
                  type="button"
                  className={`soundscape-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSound(sound.id)}
                >
                  <div className="sound-icon-box" style={{ color: sound.color }}>
                    <Icon size={24} />
                  </div>
                  <div className="sound-text">
                    <h4>{sound.name}</h4>
                    <span>{isSelected ? '● Playing Preview' : 'Tap to toggle'}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Volume Control */}
          <div className="volume-slider-row">
            <Volume2 size={18} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="sound-volume-slider"
              aria-label="Sound volume"
            />
            <span className="volume-label">{volume}%</span>
          </div>
        </div>
      </main>
    </div>
  )
}
