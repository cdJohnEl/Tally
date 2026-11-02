import { useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface HeroSoundPlayerProps {
  isPlaying: boolean
  activeCount: number
  activeNames: string[]
  masterVolume: number
  onTogglePlay: () => void
  onMasterVolumeChange: (vol: number) => void
  onMuteToggle: () => void
  isMuted: boolean
}

export default function HeroSoundPlayer({
  isPlaying,
  activeCount,
  activeNames,
  masterVolume,
  onTogglePlay,
  onMasterVolumeChange,
  onMuteToggle,
  isMuted,
}: HeroSoundPlayerProps) {
  const [pulsePhase, setPulsePhase] = useState(0)

  // Gentle ambient animation tick for the waveform aura
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 360)
    }, 40)
    return () => clearInterval(id)
  }, [isPlaying])

  return (
    <div className="relative flex flex-col items-center justify-center pt-2 pb-6 px-4">
      {/* Central Breathing Ring & Waveform Aura */}
      <div className="relative flex items-center justify-center my-4">
        {/* Outer ambient glow halo */}
        <div
          className={`absolute rounded-full transition-all duration-1000 pointer-events-none ${
            isPlaying
              ? 'w-48 h-48 sm:w-56 sm:h-56 bg-indigo-500/15 blur-2xl opacity-100 scale-110'
              : 'w-36 h-36 bg-slate-700/10 blur-xl opacity-0 scale-90'
          }`}
        />

        {/* Dynamic Breathing Rings */}
        {isPlaying && (
          <>
            <div
              className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-indigo-400/20 animate-ping opacity-25 pointer-events-none"
              style={{ animationDuration: '3.5s' }}
            />
            <div
              className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-sky-400/25 pointer-events-none transition-transform duration-500"
              style={{
                transform: `scale(${1 + Math.sin((pulsePhase * Math.PI) / 180) * 0.08})`,
              }}
            />
          </>
        )}

        {/* Large Central Minimalist Play/Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 shadow-2xl ${
            isPlaying
              ? 'bg-gradient-to-br from-indigo-500 via-sky-500 to-teal-400 text-white shadow-indigo-500/30 scale-105 active:scale-95'
              : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/70 hover:border-slate-600 shadow-black/40 hover:scale-105 active:scale-95'
          }`}
          aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
        >
          {isPlaying ? (
            <Pause size={38} className="fill-current" strokeWidth={1.5} />
          ) : (
            <Play size={40} className="fill-current ml-1.5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Status & Active Layer Subtitle */}
      <div className="text-center mt-2 mb-4 max-w-md">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-100 tracking-tight flex items-center justify-center gap-2">
          {isPlaying ? (
            <span>Focus Soundscape Active</span>
          ) : (
            <span className="text-slate-300">Ready for Deep Focus</span>
          )}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mt-1 truncate px-2">
          {activeCount > 0 ? (
            <span>
              <span className="font-semibold text-slate-200">{activeCount}</span> {activeCount === 1 ? 'sound' : 'sounds'} active
              {activeNames.length > 0 && ` · ${activeNames.slice(0, 3).join(', ')}${activeNames.length > 3 ? '…' : ''}`}
            </span>
          ) : (
            <span>Select ambient sounds or load a preset below</span>
          )}
        </p>
      </div>

      {/* Master Volume Slider Row */}
      <div className="flex items-center gap-3 w-full max-w-xs px-4 py-2 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-800/80 shadow-inner">
        <button
          type="button"
          onClick={onMuteToggle}
          className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 rounded p-1"
          title={isMuted ? 'Unmute master' : 'Mute master'}
          aria-label={isMuted ? 'Unmute master' : 'Mute master'}
        >
          {isMuted || masterVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : masterVolume}
          onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
          aria-label="Master volume"
        />

        <span className="text-xs font-mono tabular-nums text-slate-400 w-8 text-right">
          {isMuted ? '0%' : `${masterVolume}%`}
        </span>
      </div>
    </div>
  )
}
