import { useState } from 'react'
import { X, Check, Image as ImageIcon, Sparkles, Palette } from 'lucide-react'
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
        name: 'Custom Image',
        type: 'image',
        value: `url("${trimmed}") center/cover no-repeat fixed`,
        textColor: 'light',
        accentColor: '#38bdf8',
        preview: `url("${trimmed}") center/cover no-repeat`,
      }
    } else {
      wp = {
        id: `custom-${Date.now()}`,
        name: 'Custom Theme',
        type: 'gradient',
        value: trimmed.includes('gradient') ? trimmed : `linear-gradient(135deg, ${trimmed}, #09090b)`,
        textColor: 'light',
        accentColor: '#818cf8',
        preview: trimmed.includes('gradient') ? trimmed : trimmed,
      }
    }

    saveWallpaper(wp)
    onSelectWallpaper(wp)
    onClose()
  }

  return (
    <div className="catalyst-modal-backdrop" onClick={onClose}>
      <div
        className="catalyst-wallpaper-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallpaper-picker-title"
      >
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-indigo-400" />
            <h3 id="wallpaper-picker-title" className="text-lg font-semibold text-white">
              Home Screen Wallpaper
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close wallpaper picker"
          >
            <X size={20} />
          </button>
        </div>

        <div className="wallpaper-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            <Sparkles size={14} />
            Curated Styles ({WALLPAPER_PRESETS.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <ImageIcon size={14} />
            Custom Image / Color
          </button>
        </div>

        {activeTab === 'presets' ? (
          <div className="wallpapers-grid">
            {WALLPAPER_PRESETS.map((wp) => {
              const isSelected = currentWallpaper.id === wp.id
              return (
                <button
                  key={wp.id}
                  type="button"
                  className={`wallpaper-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleApplyPreset(wp)}
                >
                  <div
                    className="wallpaper-preview"
                    style={{ background: wp.preview }}
                  >
                    {isSelected && (
                      <div className="selected-indicator">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="wallpaper-name">{wp.name}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <form onSubmit={handleApplyCustom} className="custom-wallpaper-form">
            <label className="text-sm text-slate-300 font-medium">
              Image URL or CSS Gradient:
            </label>
            <input
              type="text"
              className="custom-url-input"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/... or #1e1b4b"
            />
            <p className="text-xs text-slate-400">
              Paste an Unsplash image URL or a CSS hex/gradient. Changes apply instantly.
            </p>
            <button
              type="submit"
              disabled={!customValue.trim()}
              className="apply-custom-btn"
            >
              Apply Custom Wallpaper
            </button>
          </form>
        )}

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
