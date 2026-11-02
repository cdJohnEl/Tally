import { BookmarkPlus, Trash2 } from 'lucide-react'
import type { SoundscapePreset } from '../types'

interface PresetBarProps {
  presets: SoundscapePreset[]
  activePresetId: string | null
  onSelectPreset: (preset: SoundscapePreset) => void
  onOpenSaveModal: () => void
  onDeleteCustomPreset: (id: string) => void
}

export default function PresetBar({ presets, activePresetId, onSelectPreset, onOpenSaveModal, onDeleteCustomPreset }: PresetBarProps) {
  return (
    <div className="fa-preset-bar">
      {presets.map((preset) => {
        const isActive = activePresetId === preset.id
        return (
          <div key={preset.id} style={{ position: 'relative', flexShrink: 0 }} className="group">
            <button type="button" onClick={() => onSelectPreset(preset)}
              className={`fa-preset-pill${isActive ? ' active' : ''}`}>
              {preset.isCustom && <span style={{ fontSize: 10, opacity: 0.7 }}>★</span>}
              {preset.name}
            </button>
            {preset.isCustom && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onDeleteCustomPreset(preset.id) }}
                style={{
                  position: 'absolute', top: -4, right: -4, width: 16, height: 16,
                  borderRadius: '50%', background: '#e74c3c', border: 'none', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s',
                }}
                className="group-hover:opacity-100"
                title={`Delete ${preset.name}`} aria-label={`Delete ${preset.name}`}
              >
                <Trash2 size={9} />
              </button>
            )}
          </div>
        )
      })}
      <button type="button" onClick={onOpenSaveModal} className="fa-save-pill">
        <BookmarkPlus size={13} />
        Save Mix
      </button>
    </div>
  )
}
