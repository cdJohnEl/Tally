import { useState } from 'react'
import { X, BookmarkPlus, Check } from 'lucide-react'
import type { SoundTrackDef } from '../types'

interface SavePresetModalProps {
  onClose: () => void
  onSave: (name: string) => void
  activeTracks: { track: SoundTrackDef; volume: number }[]
}

export default function SavePresetModal({
  onClose,
  onSave,
  activeTracks,
}: SavePresetModalProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim())
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookmarkPlus size={18} className="text-sky-400" />
            <h3 className="text-base font-semibold text-slate-100">Save Custom Mix</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Preset Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Midnight Coding, Forest Retreat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Current Active Soundscape Layers ({activeTracks.length})
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
              {activeTracks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No active sounds currently playing</p>
              ) : (
                activeTracks.map(({ track, volume }) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-800/40 text-slate-300"
                  >
                    <span>{track.name}</span>
                    <span className="font-mono text-slate-400">{volume}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || activeTracks.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 transition-colors flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              <Check size={14} />
              <span>Save Preset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
