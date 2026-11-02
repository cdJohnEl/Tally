import { useState, useEffect } from 'react'
import {
  Music,
  Plus,
  Sparkles,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Disc3,
  Layers,
} from 'lucide-react'

export interface SpotifyStation {
  id: string
  name: string
  category: string
  embedUri: string
  description: string
  icon: string
  recommendedAmbient?: string
  ambientName?: string
}

const CURATED_STATIONS: SpotifyStation[] = [
  {
    id: 'lofi-beats',
    name: 'Lofi Beats',
    category: 'Chill',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    description: 'Chill instrumental beats to study, relax, and code',
    icon: '☕',
    recommendedAmbient: 'rain',
    ambientName: 'Rain on Glass',
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    category: 'Ambient',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    description: 'Post-rock and atmospheric ambient for flow state',
    icon: '🧠',
    recommendedAmbient: 'brown-noise',
    ambientName: 'Brown Noise',
  },
  {
    id: 'peaceful-piano',
    name: 'Peaceful Piano',
    category: 'Classical',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    description: 'Delicate acoustic piano melodies for tranquil concentration',
    icon: '🎹',
    recommendedAmbient: 'forest',
    ambientName: 'Forest Wind',
  },
  {
    id: 'jazz-vibes',
    name: 'Jazz Vibes',
    category: 'Jazz',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator&theme=0',
    description: 'Smooth, mellow jazz grooves for steady creative work',
    icon: '🎷',
    recommendedAmbient: 'coffee-shop',
    ambientName: 'Coffee Shop',
  },
  {
    id: 'synthwave-chill',
    name: 'Synthwave Chill',
    category: 'Electronic',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXd9rSDyQguIk?utm_source=generator&theme=0',
    description: 'Retro futuristic synth arpeggios and neon soundscapes',
    icon: '⚡',
    recommendedAmbient: 'binaural',
    ambientName: 'Alpha Binaural',
  },
  {
    id: 'brain-food',
    name: 'Brain Food',
    category: 'Electronic',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    description: 'Hypnotic electronic pulses to stimulate cognition',
    icon: '🔋',
    recommendedAmbient: 'pink-noise',
    ambientName: 'Pink Noise',
  },
  {
    id: 'ambient-chill',
    name: 'Ambient Chill',
    category: 'Ambient',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3Ogo9pFvBkY?utm_source=generator&theme=0',
    description: 'Ethereal soundscapes and peaceful sonic environments',
    icon: '🌿',
    recommendedAmbient: 'campfire',
    ambientName: 'Campfire',
  },
  {
    id: 'classical-focus',
    name: 'Classical Focus',
    category: 'Classical',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWV0gynK7Pt6v?utm_source=generator&theme=0',
    description: 'Orchestral masterpieces curated specifically for productivity',
    icon: '🎻',
    recommendedAmbient: 'library',
    ambientName: 'Quiet Library',
  },
]

interface SpotifyFocusPlayerProps {
  onLayerAmbientSound?: (trackId: string) => void
  activeAmbientCount?: number
}

function parseSpotifyUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Check if it's already an embed link
  if (trimmed.includes('open.spotify.com/embed/')) {
    return trimmed
  }

  // Regex for Spotify web URLs (playlist, album, track, episode, show)
  const urlMatch = trimmed.match(
    /open\.spotify\.com\/(playlist|album|track|episode|show)\/([a-zA-Z0-9]+)/
  )
  if (urlMatch) {
    const [, type, id] = urlMatch
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  }

  // Regex for Spotify URIs: spotify:playlist:37i9dQZF1DXdLEN7aqioXM
  const uriMatch = trimmed.match(/spotify:(playlist|album|track|episode|show):([a-zA-Z0-9]+)/)
  if (uriMatch) {
    const [, type, id] = uriMatch
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  }

  return null
}

export default function SpotifyFocusPlayer({
  onLayerAmbientSound,
  activeAmbientCount = 0,
}: SpotifyFocusPlayerProps) {
  const [selectedStation, setSelectedStation] = useState<SpotifyStation>(CURATED_STATIONS[0])
  const [currentEmbedUri, setCurrentEmbedUri] = useState<string>(CURATED_STATIONS[0].embedUri)
  const [customInput, setCustomInput] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isWideMode, setIsWideMode] = useState(false)
  const [savedCustomLinks, setSavedCustomLinks] = useState<{ name: string; url: string }[]>(() => {
    try {
      const stored = localStorage.getItem('catalyst_spotify_custom_links')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [layerToast, setLayerToast] = useState<string | null>(null)

  // Save custom links to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('catalyst_spotify_custom_links', JSON.stringify(savedCustomLinks))
    } catch {}
  }, [savedCustomLinks])

  const handleSelectStation = (station: SpotifyStation) => {
    setSelectedStation(station)
    setCurrentEmbedUri(station.embedUri)
    setInputError(null)
  }

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customInput.trim()) return

    const parsed = parseSpotifyUrl(customInput)
    if (parsed) {
      setCurrentEmbedUri(parsed)
      setInputError(null)

      // Add to saved custom links if not already present
      const exists = savedCustomLinks.some((l) => l.url === parsed)
      if (!exists) {
        const newEntry = {
          name: `Custom (${new URL(parsed).pathname.split('/')[2] || 'Mix'})`,
          url: parsed,
        }
        setSavedCustomLinks((prev) => [newEntry, ...prev.slice(0, 4)])
      }
      setCustomInput('')
    } else {
      setInputError('Please enter a valid Spotify link (playlist, album, or track)')
    }
  }

  const handleLayerPreset = (station: SpotifyStation) => {
    if (!station.recommendedAmbient || !onLayerAmbientSound) return
    onLayerAmbientSound(station.recommendedAmbient)
    setLayerToast(`Layered ${station.ambientName} with ${station.name}!`)
    setTimeout(() => setLayerToast(null), 2500)
  }

  return (
    <div className={`fa-spotify-deck${isWideMode ? ' is-wide' : ''}`}>
      {/* Header Bar */}
      <div className="fa-spotify-header">
        <div className="fa-spotify-brand">
          <div className="fa-spotify-icon-badge">
            <Music size={16} />
          </div>
          <div>
            <div className="fa-spotify-title">
              Spotify Focus Lounge
              <span className="fa-spotify-tag">In-App Player</span>
            </div>
            <div className="fa-spotify-subtitle">
              Stream music directly in-app • Layer with ambient rain, fire & noise
            </div>
          </div>
        </div>

        <div className="fa-spotify-header-actions">
          {activeAmbientCount > 0 && (
            <div className="fa-spotify-layer-badge">
              <Layers size={13} />
              <span>{activeAmbientCount} ambient sound{activeAmbientCount !== 1 ? 's' : ''} layered</span>
            </div>
          )}

          <button
            type="button"
            className="fa-spotify-tool-btn"
            onClick={() => setIsWideMode(!isWideMode)}
            title={isWideMode ? 'Standard width' : 'Expand wide'}
            aria-label="Toggle wide mode"
          >
            {isWideMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            type="button"
            className="fa-spotify-tool-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse player' : 'Expand player'}
            aria-label="Toggle collapse"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="fa-spotify-body">
          {/* Station Selector Bar */}
          <div className="fa-spotify-stations-row">
            <span className="fa-spotify-stations-label">Stations:</span>
            <div className="fa-spotify-stations-list">
              {CURATED_STATIONS.map((st) => {
                const isActive = currentEmbedUri === st.embedUri
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`fa-spotify-station-pill${isActive ? ' active' : ''}`}
                    onClick={() => handleSelectStation(st)}
                  >
                    <span className="fa-station-emoji">{st.icon}</span>
                    <span className="fa-station-name">{st.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Layer Bar */}
          {selectedStation.recommendedAmbient && onLayerAmbientSound && (
            <div className="fa-spotify-duet-bar">
              <div className="fa-duet-info">
                <Sparkles size={14} className="fa-duet-icon" />
                <span>
                  <strong>Recommended Soundscape Duet:</strong> Layer with{' '}
                  <span className="fa-duet-highlight">{selectedStation.ambientName}</span> for peak flow state
                </span>
              </div>
              <button
                type="button"
                className="fa-duet-add-btn"
                onClick={() => handleLayerPreset(selectedStation)}
              >
                <Plus size={13} />
                Layer {selectedStation.ambientName}
              </button>
            </div>
          )}

          {/* Player Display & Custom Link Row */}
          <div className="fa-spotify-content-grid">
            {/* Spotify Embedded Frame */}
            <div className="fa-spotify-frame-wrap">
              <iframe
                title="Spotify Focus Player"
                src={currentEmbedUri}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="fa-spotify-iframe"
              />
            </div>

            {/* Side Controls & Custom URL Input */}
            <div className="fa-spotify-sidebar">
              <div className="fa-spotify-side-card">
                <div className="fa-side-card-title">
                  <Search size={14} />
                  Load Your Own Music
                </div>
                <p className="fa-side-card-desc">
                  Paste any Spotify playlist, album, track, or podcast URL to play it right here.
                </p>

                <form onSubmit={handleApplyCustomUrl} className="fa-spotify-url-form">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => {
                      setCustomInput(e.target.value)
                      if (inputError) setInputError(null)
                    }}
                    placeholder="https://open.spotify.com/playlist/..."
                    className={`fa-spotify-input${inputError ? ' has-error' : ''}`}
                  />
                  <button type="submit" className="fa-spotify-load-btn">
                    Load
                  </button>
                </form>

                {inputError && <div className="fa-spotify-error">{inputError}</div>}

                {/* Saved Custom Links */}
                {savedCustomLinks.length > 0 && (
                  <div className="fa-spotify-recent">
                    <span className="fa-recent-title">Recent Links:</span>
                    <div className="fa-recent-chips">
                      {savedCustomLinks.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="fa-recent-chip"
                          onClick={() => {
                            setCurrentEmbedUri(item.url)
                            setInputError(null)
                          }}
                        >
                          <Disc3 size={11} />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* In-app Feature Highlights */}
              <div className="fa-spotify-side-card highlight">
                <div className="fa-side-card-title">
                  <Disc3 size={14} style={{ color: '#1DB954' }} />
                  Seamless Focus Flow
                </div>
                <ul className="fa-spotify-tips">
                  <li>
                    <Check size={12} className="fa-tip-check" />
                    <strong>No need to leave:</strong> Log in directly inside the player to play your full library.
                  </li>
                  <li>
                    <Check size={12} className="fa-tip-check" />
                    <strong>Soundscape Duet:</strong> Play Spotify alongside procedural rain, café murmur, or binaural tones.
                  </li>
                  <li>
                    <Check size={12} className="fa-tip-check" />
                    <strong>Zero Interruption:</strong> Works seamlessly with the Catalyst Pomodoro timer and sleep countdown.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transient Duet Notification */}
      {layerToast && (
        <div className="fa-spotify-toast">
          <Sparkles size={13} />
          {layerToast}
        </div>
      )}
    </div>
  )
}
