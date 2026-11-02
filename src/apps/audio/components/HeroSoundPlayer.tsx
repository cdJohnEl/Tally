import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

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

  const title = activeCount > 0
    ? activeNames.slice(0, 2).join(' + ') + (activeNames.length > 2 ? ` +${activeNames.length - 2}` : '')
    : 'Focus Soundscape'

  const subtitle = activeCount > 0
    ? `${activeCount} sound${activeCount !== 1 ? 's' : ''} playing`
    : 'Select sounds or load a preset'

  return (
    <div className="fa-hero">
      {/* Vinyl disc with pulse rings */}
      <div className="fa-vinyl-wrap">
        {isPlaying && (
          <>
            <div className="fa-pulse-ring" />
            <div className="fa-pulse-ring" />
          </>
        )}
        <div className={`fa-vinyl-disc${isPlaying ? ' is-spinning' : ''}`} />
      </div>

      {/* Track info */}
      <div className="fa-hero-info">
        <h2 className="fa-hero-title">{title}</h2>
        <p className="fa-hero-subtitle">{subtitle}</p>
      </div>

      {/* Waveform */}
      <div className="fa-waveform">
        {[1,2,3,4,5,6,7].map((i) => (
          <div
            key={i}
            className={`fa-wave-bar${!isPlaying ? ' paused' : ''}`}
            style={{ background: isPlaying ? '#333' : '#ccc' }}
          />
        ))}
      </div>

      {/* Playback controls */}
      <div className="fa-controls">
        <button
          type="button"
          className="fa-control-btn secondary"
          aria-label="Previous preset"
          title="Previous"
        >
          <SkipBack size={20} />
        </button>

        <button
          type="button"
          className="fa-control-btn primary"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
        >
          {isPlaying
            ? <Pause size={26} className="fill-current" strokeWidth={0} />
            : <Play size={26} className="fill-current ml-0.5" strokeWidth={0} />
          }
        </button>

        <button
          type="button"
          className="fa-control-btn secondary"
          aria-label="Next preset"
          title="Next"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Master Volume */}
      <div className="fa-volume-row">
        <button
          type="button"
          className="fa-vol-btn"
          onClick={onMuteToggle}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || masterVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : masterVolume}
          onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
          aria-label="Master volume"
        />
        <span className="fa-volume-label">{isMuted ? '0' : masterVolume}%</span>
      </div>
    </div>
  )
}
