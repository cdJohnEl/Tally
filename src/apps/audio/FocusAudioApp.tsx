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
import SpotifyFocusPlayer from './components/SpotifyFocusPlayer'
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
      // Resume sound engine and ensure all active tracks are synthesized
      soundEngine.resume()
      activeTrackIds.forEach((id) => {
        if (!soundEngine.isTrackActive(id)) {
          soundEngine.playTrack(id, trackStates[id].volume)
        }
      })
    }
    setIsMasterPlaying(true)
  }, [activeTrackIds, trackStates])

  const handleGlobalPause = useCallback(() => {
    soundEngine.pause()
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

  // Layer an ambient sound with Spotify playback
  const handleLayerAmbientSound = (id: string) => {
    setTrackStates((prev) => {
      const current = prev[id]
      if (!current) return prev
      const nextVol = current.volume > 0 ? current.volume : 50
      soundEngine.playTrack(id, nextVol)
      return {
        ...prev,
        [id]: {
          ...current,
          isPlaying: true,
          volume: nextVol,
        },
      }
    })
    if (!isMasterPlaying) setIsMasterPlaying(true)
    const trackName = SOUND_TRACKS.find((t) => t.id === id)?.name || id
    showToast(`✨ Layered ${trackName} with Spotify!`)
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
    <div className="fa-root">
      {/* Top Navigation Bar */}
      <header className="fa-header">
        <div className="fa-header-inner">
          <button type="button" onClick={onBackToHome} className="fa-back-btn" aria-label="Return to Catalyst Home">
            <ChevronLeft size={14} />
            Catalyst
          </button>
          <div className="fa-header-title">
            <Headphones size={15} />
            Focus Audio
          </div>
          {activeTrackIds.length > 0 ? (
            <button type="button" onClick={handleStopAll} className="fa-stop-btn">Clear Mix</button>
          ) : (
            <div style={{ width: 72 }} />
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="fa-main">
        {/* Preset Selector Bar */}
        <div>
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

        {/* In-App Spotify Focus Lounge Deck */}
        <section aria-label="Spotify Focus Lounge">
          <SpotifyFocusPlayer
            onLayerAmbientSound={handleLayerAmbientSound}
            activeAmbientCount={activeTrackIds.length}
          />
        </section>

        {/* Mixer Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="fa-mixer-header">
            <div className="fa-mixer-title">
              <Sliders size={18} style={{ color: 'var(--fa-ink-3)' }} />
              Soundscape Mixer
              <span className="fa-mixer-count">{activeTrackIds.length} active</span>
            </div>
            <div className="fa-cat-tabs">
              {([
                { id: 'all', label: 'All' },
                { id: 'nature', label: 'Nature' },
                { id: 'environment', label: 'Environ.' },
                { id: 'synth', label: 'Synth' },
              ] as const).map((cat) => (
                <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
                  className={`fa-cat-tab${selectedCategory === cat.id ? ' active' : ''}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fa-grid">
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

      {/* Toast */}
      {toastMessage && (
        <div className="fa-toast">
          <Sparkles size={13} />
          {toastMessage}
        </div>
      )}
    </div>
  )
}
