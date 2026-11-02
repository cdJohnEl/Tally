import { useState } from 'react'
import { X, BookmarkPlus, Check } from 'lucide-react'
import type { SoundTrackDef } from '../types'

interface SavePresetModalProps {
  onClose: () => void
  onSave: (name: string) => void
  activeTracks: { track: SoundTrackDef; volume: number }[]
}

export default function SavePresetModal({ onClose, onSave, activeTracks }: SavePresetModalProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim()); onClose()
  }

  return (
    <div className="fa-modal-overlay" onClick={onClose}>
      <div className="fa-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookmarkPlus size={18} style={{ color: 'var(--fa-ink-3)' }} />
            <span className="fa-modal-title" style={{ fontSize: 18, marginBottom: 0 }}>Save Mix</span>
          </div>
          <button type="button" onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--fa-border-2)', background: 'var(--fa-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fa-ink-3)' }}>
            <X size={14} />
          </button>
        </div>

        <p className="fa-modal-sub">
          {activeTracks.length > 0
            ? `Saving ${activeTracks.length} active sound${activeTracks.length !== 1 ? 's' : ''}`
            : 'No active sounds — activate some first'}
        </p>

        <form onSubmit={handleSubmit}>
          <input type="text" required autoFocus placeholder="e.g. Midnight Coding, Forest Retreat"
            value={name} onChange={(e) => setName(e.target.value)}
            className="fa-modal-input" />

          {activeTracks.length > 0 && (
            <div style={{ marginBottom: 16, maxHeight: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {activeTracks.map(({ track, volume }) => (
                <div key={track.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 10px', borderRadius: 8, background: 'var(--fa-surface-2)', color: 'var(--fa-ink-2)' }}>
                  <span>{track.name}</span>
                  <span style={{ fontFamily: 'var(--fa-font-mono)', color: 'var(--fa-ink-3)' }}>{volume}%</span>
                </div>
              ))}
            </div>
          )}

          <div className="fa-modal-footer">
            <button type="button" onClick={onClose} className="fa-modal-btn">Cancel</button>
            <button type="submit" disabled={!name.trim() || activeTracks.length === 0} className="fa-modal-btn primary"
              style={!name.trim() || activeTracks.length === 0 ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
              <Check size={14} style={{ display: 'inline', marginRight: 4 }} />
              Save Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
