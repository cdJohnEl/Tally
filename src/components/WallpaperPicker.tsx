import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { WALLPAPER_PRESETS, saveWallpaper } from '../lib/wallpapers'
import type { WallpaperOption } from '../lib/types'

interface WallpaperPickerProps {
  currentWallpaper: WallpaperOption
  onSelectWallpaper: (wp: WallpaperOption) => void
  onClose: () => void
}

export default function WallpaperPicker({
  currentWallpaper,
  onSelectWallpaper,
  onClose,
}: WallpaperPickerProps) {
  const [customValue, setCustomValue] = useState('')
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')

  const handleApplyPreset = (preset: WallpaperOption) => {
    saveWallpaper(preset)
    onSelectWallpaper(preset)
  }

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customValue.trim()
    if (!trimmed) return

    let wp: WallpaperOption
    if (trimmed.startsWith('http')) {
      wp = {
        id: `custom-${Date.now()}`,
        name: 'Custom Texture',
        type: 'image',
        value: `url("${trimmed}") center/cover no-repeat fixed`,
        textColor: 'dark',
        accentColor: '#336649',
        preview: `url("${trimmed}") center/cover no-repeat`,
      }
    } else {
      wp = {
        id: `custom-${Date.now()}`,
        name: 'Custom Tone',
        type: 'gradient',
        value: trimmed.includes('gradient')
          ? trimmed
          : `radial-gradient(900px 480px at 12% -8%, rgba(51, 102, 73, 0.08), transparent 62%), ${trimmed}`,
        textColor: trimmed.toLowerCase().includes('#1') || trimmed.toLowerCase().includes('#0') ? 'light' : 'dark',
        accentColor: '#336649',
        preview: trimmed,
      }
    }

    saveWallpaper(wp)
    onSelectWallpaper(wp)
    onClose()
  }

  return (
    <div className="catalyst-modal-backdrop" onClick={onClose}>
      <div
        className="catalyst-paper-dialog rise"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paper-theme-title"
      >
        <div className="dialog-header">
          <div>
            <span className="dialog-eyebrow">AESTHETIC SYSTEM</span>
            <h2 id="paper-theme-title" className="dialog-title">
              Paper & Theme Swatches
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dialog-close-btn"
            aria-label="Close theme picker"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dialog-tabs">
          <button
            type="button"
            className={`dialog-tab ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            Curated Swatches ({WALLPAPER_PRESETS.length})
          </button>
          <button
            type="button"
            className={`dialog-tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Custom Paper Tint
          </button>
        </div>

        {activeTab === 'presets' ? (
          <div className="swatches-grid">
            {WALLPAPER_PRESETS.map((wp) => {
              const isSelected = currentWallpaper.id === wp.id
              return (
                <button
                  key={wp.id}
                  type="button"
                  className={`swatch-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleApplyPreset(wp)}
                >
                  <div
                    className="swatch-sample"
                    style={{ background: wp.preview }}
                  >
                    {isSelected && (
                      <div className="swatch-check">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="swatch-name">{wp.name}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <form onSubmit={handleApplyCustom} className="custom-swatch-form">
            <label className="field-label">Custom Hex, Gradient, or Image URL:</label>
            <input
              type="text"
              className="custom-swatch-input"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="e.g. #f4efe4 or https://images.unsplash.com/..."
            />
            <p className="custom-swatch-hint">
              Enter any CSS background color, warm paper hex, or high-res texture URL.
            </p>
            <button
              type="submit"
              disabled={!customValue.trim()}
              className="custom-apply-btn"
            >
              Apply Theme
            </button>
          </form>
        )}

        <div className="dialog-footer">
          <button type="button" onClick={onClose} className="dialog-done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
