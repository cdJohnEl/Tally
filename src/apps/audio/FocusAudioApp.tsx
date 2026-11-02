import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  Sliders,
  Sparkles,
  Headphones,
} from 'lucide-react'
import { SOUND_TRACKS } from './soundTracksData'
import { soundEngine } from './audioEngine'
import {
  getSavedPresets,
  saveCustomPreset,
  deleteCustomPreset,
} from './focusPresetsDB'
import type { SoundCategory, SoundscapePreset, SoundTrackState } from './types'

import HeroSoundPlayer from './components/HeroSoundPlayer'
import SoundCard from './components/SoundCard'
import PresetBar from './components/PresetBar'
import FocusTimer from './components/FocusTimer'
import SavePresetModal from './components/SavePresetModal'
import './focusAudio.css'

interface FocusAudioAppProps {
  onBackToHome: () => void
}

export default function FocusAudioApp({ onBackToHome }: FocusAudioAppProps) {
  // Track playback states: trackId -> SoundTrackState
  const [trackStates, setTrackStates] = useState<Record<string, SoundTrackState>>(() => {
    const initial: Record<string, SoundTrackState> = {}
    SOUND_TRACKS.forEach((track) => {
      initial[track.id] = {
        id: track.id,
        isPlaying: false,
        volume: track.defaultVolume,
      }
    })
    return initial
  })

  // Master controls
  const [isMasterPlaying, setIsMasterPlaying] = useState(false)
  const [masterVolume, setMasterVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)

  // Presets
  const [presets, setPresets] = useState<SoundscapePreset[]>([])
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory | 'all'>('all')

  // Timer auto-fadeout
  const [isAutoFadeout, setIsAutoFadeout] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Show transient notification toast
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2800)
  }

  // Load presets on mount from IndexedDB / Storage
  useEffect(() => {
    void getSavedPresets().then((loaded) => {
      setPresets(loaded)
    })
  }, [])

  // Sync active sounds count and names
  const activeTrackIds = useMemo(() => {
    return Object.keys(trackStates).filter((id) => trackStates[id].isPlaying)
  }, [trackStates])

  const activeTrackNames = useMemo(() => {
    return activeTrackIds.map((id) => {
      const def = SOUND_TRACKS.find((t) => t.id === id)
      return def ? def.name : id
    })
  }, [activeTrackIds])

  // Sync MediaSession API
  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (isMasterPlaying && activeTrackIds.length > 0) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: activeTrackNames.join(' + ') || 'Focus Soundscape',
          artist: 'Catalyst Focus Audio',
          album: 'Procedural Ambient Noise',
          artwork: [
            { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          ],
        })
        navigator.mediaSession.playbackState = 'playing'
      } else {
        navigator.mediaSession.playbackState = 'paused'
      }

      navigator.mediaSession.setActionHandler('play', () => {
        handleGlobalPlay()
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        handleGlobalPause()
      })
      navigator.mediaSession.setActionHandler('stop', () => {
        handleStopAll()
      })
    }
  }, [isMasterPlaying, activeTrackIds, activeTrackNames])

  // Stop all audio when unmounting
  useEffect(() => {
    return () => {
      soundEngine.stopAll()
    }
  }, [])

  // Global Play / Pause handler
  const handleGlobalPlay = useCallback(() => {
    if (activeTrackIds.length === 0) {
      // If nothing is active, auto-activate default Deep Work trio
      const defaultTrio: Record<string, number> = {
        'brown-noise': 65,
        'rain': 50,
        'binaural': 35,
      }
      setTrackStates((prev) => {
        const next = { ...prev }
        Object.entries(defaultTrio).forEach(([id, vol]) => {
          next[id] = { id, isPlaying: true, volume: vol }
          soundEngine.playTrack(id, vol)
        })
        return next
      })
      setActivePresetId('deep-work')
    } else {
      // Resume currently active sounds
      activeTrackIds.forEach((id) => {
        soundEngine.playTrack(id, trackStates[id].volume)
      })
    }
    setIsMasterPlaying(true)
  }, [activeTrackIds, trackStates])

  const handleGlobalPause = useCallback(() => {
    soundEngine.stopAll()
    setIsMasterPlaying(false)
  }, [])

  const handleToggleMasterPlay = () => {
    if (isMasterPlaying) {
      handleGlobalPause()
    } else {
      handleGlobalPlay()
    }
  }

  // Toggle individual sound
  const handleToggleTrack = (id: string) => {
    setActivePresetId(null) // Custom mix now
    setTrackStates((prev) => {
      const current = prev[id]
      const nextIsPlaying = !current.isPlaying

      if (nextIsPlaying) {
        soundEngine.playTrack(id, current.volume)
        if (!isMasterPlaying) setIsMasterPlaying(true)
      } else {
        soundEngine.stopTrack(id)
      }

      return {
        ...prev,
        [id]: {
          ...current,
          isPlaying: nextIsPlaying,
        },
      }
    })
  }

  // Individual Track Volume
  const handleTrackVolumeChange = (id: string, vol: number) => {
    setTrackStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        volume: vol,
      },
    }))
    soundEngine.setTrackVolume(id, vol)
  }

  // Master Volume
  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol)
    if (isMuted && vol > 0) setIsMuted(false)
    soundEngine.setMasterVolume(vol)
  }

  // Master Mute
  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false)
      soundEngine.setMasterVolume(masterVolume)
    } else {
      setIsMuted(true)
      soundEngine.setMasterVolume(0)
    }
  }

  // Stop All Tracks
  const handleStopAll = () => {
    soundEngine.stopAll()
    setIsMasterPlaying(false)
    setActivePresetId(null)
    setTrackStates((prev) => {
      const next: Record<string, SoundTrackState> = {}
      Object.keys(prev).forEach((id) => {
        next[id] = { ...prev[id], isPlaying: false }
      })
      return next
    })
    showToast('Soundscape stopped')
  }

  // Load a Preset
  const handleSelectPreset = (preset: SoundscapePreset) => {
    soundEngine.stopAll()
    setActivePresetId(preset.id)

    setTrackStates((prev) => {
      const next: Record<string, SoundTrackState> = {}
      // Reset all to unplayed
      Object.keys(prev).forEach((id) => {
        next[id] = { ...prev[id], isPlaying: false }
      })

      // Activate preset tracks
      Object.entries(preset.tracks).forEach(([id, vol]) => {
        if (next[id]) {
          next[id] = { id, isPlaying: true, volume: vol }
          soundEngine.playTrack(id, vol)
        }
      })
      return next
    })

    setIsMasterPlaying(true)
    showToast(`Loaded preset: ${preset.name}`)
  }

  // Save Custom Preset
  const handleSavePreset = async (name: string) => {
    const tracks: Record<string, number> = {}
    activeTrackIds.forEach((id) => {
      tracks[id] = trackStates[id].volume
    })

    const newPreset: SoundscapePreset = {
      id: `custom-${Date.now()}`,
      name,
      isCustom: true,
      tracks,
    }

    await saveCustomPreset(newPreset)
    const updated = await getSavedPresets()
    setPresets(updated)
    setActivePresetId(newPreset.id)
    showToast(`Saved preset "${name}"`)
  }

  // Delete Custom Preset
  const handleDeleteCustomPreset = async (id: string) => {
    await deleteCustomPreset(id)
    const updated = await getSavedPresets()
    setPresets(updated)
    if (activePresetId === id) setActivePresetId(null)
    showToast('Custom preset deleted')
  }

  // Timer Finished Handler
  const handleTimerComplete = () => {
    soundEngine.playTimerChime()
    if (isAutoFadeout) {
      soundEngine.startFadeout(10, () => {
        setIsMasterPlaying(false)
        setTrackStates((prev) => {
          const next: Record<string, SoundTrackState> = {}
          Object.keys(prev).forEach((id) => {
            next[id] = { ...prev[id], isPlaying: false }
          })
          return next
        })
      })
      showToast('⏰ Focus session complete! Audio faded out.')
    } else {
      showToast('⏰ Focus session complete!')
    }
  }

  // Filtered tracks for the mixer view
  const filteredTracks = useMemo(() => {
    if (selectedCategory === 'all') return SOUND_TRACKS
    return SOUND_TRACKS.filter((t) => t.category === selectedCategory)
  }, [selectedCategory])

  const activeTracksList = useMemo(() => {
    return activeTrackIds
      .map((id) => {
        const track = SOUND_TRACKS.find((t) => t.id === id)
        return track ? { track, volume: trackStates[id].volume } : null
      })
      .filter((item): item is { track: (typeof SOUND_TRACKS)[0]; volume: number } => item !== null)
  }, [activeTrackIds, trackStates])

  return (
    <div className="focus-audio-root min-h-screen pb-16">
      {/* Top Navigation Bar adhering to Catalyst Shell contract */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Back button to Catalyst OS Home */}
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-full px-3.5 py-1.5 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
            aria-label="Return to Catalyst Home"
          >
            <ChevronLeft size={15} />
            <span>Catalyst</span>
          </button>

          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-sky-400" />
            <h1 className="text-sm font-bold text-slate-100 tracking-wider uppercase">
              Focus Audio
            </h1>
          </div>

          {/* Quick stop/clear button */}
          {activeTrackIds.length > 0 ? (
            <button
              type="button"
              onClick={handleStopAll}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-full px-3 py-1.5 transition-colors"
            >
              Clear Mix
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </header>

      {/* Main Soundscape Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-4 space-y-6">
        {/* Preset Selector Bar */}
        <div className="w-full">
          <PresetBar
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
            onDeleteCustomPreset={handleDeleteCustomPreset}
          />
        </div>

        {/* Minimalist Hero Sound Player */}
        <section aria-label="Hero sound player">
          <HeroSoundPlayer
            isPlaying={isMasterPlaying}
            activeCount={activeTrackIds.length}
            activeNames={activeTrackNames}
            masterVolume={masterVolume}
            onTogglePlay={handleToggleMasterPlay}
            onMasterVolumeChange={handleMasterVolumeChange}
            onMuteToggle={handleMuteToggle}
            isMuted={isMuted}
          />
        </section>

        {/* Integrated Focus & Sleep Timer Card */}
        <section aria-label="Focus timer">
          <FocusTimer
            onTimerComplete={handleTimerComplete}
            isAutoFadeout={isAutoFadeout}
            onToggleAutoFadeout={() => setIsAutoFadeout(!isAutoFadeout)}
          />
        </section>

        {/* Category Filter & Section Header */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-sky-400" />
              <h2 className="text-sm font-bold text-slate-200 tracking-wide">
                Soundscape Mixer
              </h2>
              <span className="text-xs text-slate-400">
                ({activeTrackIds.length} active)
              </span>
            </div>

            {/* Segmented Category Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start sm:self-auto">
              {(
                [
                  { id: 'all', label: 'All Sounds' },
                  { id: 'nature', label: 'Nature' },
                  { id: 'environment', label: 'Environment' },
                  { id: 'synth', label: 'Synthesized' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-slate-100 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Sound Library Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTracks.map((track) => {
              const state = trackStates[track.id]
              return (
                <SoundCard
                  key={track.id}
                  track={track}
                  isActive={Boolean(state?.isPlaying)}
                  volume={state?.volume ?? track.defaultVolume}
                  onToggle={handleToggleTrack}
                  onVolumeChange={handleTrackVolumeChange}
                />
              )
            })}
          </div>
        </section>
      </main>

      {/* Save Preset Modal */}
      {isSaveModalOpen && (
        <SavePresetModal
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSavePreset}
          activeTracks={activeTracksList}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-slate-100 text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
