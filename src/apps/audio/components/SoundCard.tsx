import React from 'react'
import {
  CloudRain,
  CloudLightning,
  Trees,
  Flame,
  Coffee,
  BookOpen,
  Laptop,
  Waves,
  Activity,
  Radio,
  Headphones,
  Volume2,
} from 'lucide-react'
import type { SoundTrackDef } from '../types'

interface SoundCardProps {
  track: SoundTrackDef
  isActive: boolean
  volume: number
  onToggle: (id: string) => void
  onVolumeChange: (id: string, vol: number) => void
}

const ICONS_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  rain: CloudRain,
  thunder: CloudLightning,
  forest: Trees,
  campfire: Flame,
  'coffee-shop': Coffee,
  library: BookOpen,
  office: Laptop,
  'brown-noise': Waves,
  'pink-noise': Activity,
  'white-noise': Radio,
  binaural: Headphones,
}

export default function SoundCard({
  track,
  isActive,
  volume,
  onToggle,
  onVolumeChange,
}: SoundCardProps) {
  const IconComponent = ICONS_MAP[track.id] || Waves

  return (
    <div
      className={`group relative p-4 rounded-2xl transition-all duration-300 border flex flex-col justify-between select-none ${
        isActive
          ? 'bg-slate-800/80 border-slate-600/80 shadow-lg shadow-black/30'
          : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/60 hover:border-slate-700/60'
      }`}
      style={{
        boxShadow: isActive ? `0 4px 20px -2px ${track.accentColor}25` : undefined,
      }}
    >
      {/* Top Row: Icon + Title + Toggle Button */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => onToggle(track.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle(track.id)
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isActive
                ? 'scale-105 shadow-md'
                : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
            }`}
            style={{
              backgroundColor: isActive ? `${track.accentColor}20` : undefined,
              color: isActive ? track.accentColor : undefined,
            }}
          >
            <IconComponent size={20} />
          </div>

          <div>
            <h3
              className={`text-sm font-semibold transition-colors ${
                isActive ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'
              }`}
            >
              {track.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">{track.description}</p>
          </div>
        </div>

        {/* Minimalist Switch Indicator */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle(track.id)
          }}
          className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 p-0.5 shrink-0 ml-2 ${
            isActive ? 'bg-sky-500' : 'bg-slate-800'
          }`}
          style={{
            backgroundColor: isActive ? track.accentColor : undefined,
          }}
          aria-label={`Toggle ${track.name}`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Bottom Row: Volume Slider (visible when active or on card hover) */}
      <div className={`mt-4 pt-3 border-t border-slate-800/60 transition-opacity duration-200 ${
        isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
      }`}>
        <div className="flex items-center gap-2">
          <Volume2 size={13} className="text-slate-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(track.id, Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
            style={{
              accentColor: track.accentColor,
            }}
            aria-label={`${track.name} volume`}
          />
          <span className="text-xs font-mono tabular-nums text-slate-400 w-8 text-right">
            {volume}%
          </span>
        </div>
      </div>
    </div>
  )
}
