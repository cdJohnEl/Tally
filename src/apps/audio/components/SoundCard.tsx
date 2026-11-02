import React from 'react'
import {
  CloudRain, CloudLightning, Trees, Flame,
  Coffee, BookOpen, Laptop, Waves, Activity, Radio, Headphones, Volume2,
} from 'lucide-react'
import type { SoundTrackDef } from '../types'

interface SoundCardProps {
  track: SoundTrackDef
  isActive: boolean
  volume: number
  onToggle: (id: string) => void
  onVolumeChange: (id: string, vol: number) => void
}

const ICONS_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  rain: CloudRain, thunder: CloudLightning, forest: Trees, campfire: Flame,
  'coffee-shop': Coffee, library: BookOpen, office: Laptop,
  'brown-noise': Waves, 'pink-noise': Activity, 'white-noise': Radio, binaural: Headphones,
}

export default function SoundCard({ track, isActive, volume, onToggle, onVolumeChange }: SoundCardProps) {
  const IconComponent = ICONS_MAP[track.id] || Waves
  return (
    <div className={`fa-sound-card${isActive ? ' active' : ''}`}>
      <div
        className="fa-sound-card-top"
        onClick={() => onToggle(track.id)}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(track.id) } }}
      >
        <div className="fa-sound-icon" style={isActive ? { backgroundColor: `${track.accentColor}18`, color: track.accentColor } : {}}>
          <IconComponent size={20} />
        </div>
        <div className="fa-sound-info">
          <div className="fa-sound-name">{track.name}</div>
          <div className="fa-sound-desc">{track.description}</div>
        </div>
        <label className="fa-toggle" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isActive} onChange={() => onToggle(track.id)} aria-label={`Toggle ${track.name}`} />
          <div className="fa-toggle-track"><div className="fa-toggle-thumb" /></div>
        </label>
      </div>
      <div className="fa-sound-slider-row">
        <Volume2 size={12} style={{ color: 'var(--fa-ink-3)', flexShrink: 0 }} />
        <input type="range" min="0" max="100" value={volume}
          onChange={(e) => onVolumeChange(track.id, Number(e.target.value))}
          style={isActive ? { accentColor: track.accentColor } : {}}
          aria-label={`${track.name} volume`} />
        <span className="fa-sound-vol-label">{volume}%</span>
      </div>
    </div>
  )
}
