import { BookmarkPlus, Trash2 } from 'lucide-react'
import type { SoundscapePreset } from '../types'

interface PresetBarProps {
  presets: SoundscapePreset[]
  activePresetId: string | null
  onSelectPreset: (preset: SoundscapePreset) => void
  onOpenSaveModal: () => void
  onDeleteCustomPreset: (id: string) => void
}

export default function PresetBar({
  presets,
  activePresetId,
  onSelectPreset,
  onOpenSaveModal,
  onDeleteCustomPreset,
}: PresetBarProps) {
  return (
    <div className="w-full flex items-center justify-between gap-3 overflow-x-auto py-2 px-1 scrollbar-none">
      <div className="flex items-center gap-2 flex-nowrap">
        {presets.map((preset) => {
          const isSelected = activePresetId === preset.id
          return (
            <div key={preset.id} className="relative group shrink-0">
              <button
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-200 text-slate-900 shadow-sm font-semibold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span>{preset.name}</span>
                {preset.isCustom && (
                  <span className="text-[10px] text-sky-400 opacity-80">★</span>
                )}
              </button>

              {preset.isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteCustomPreset(preset.id)
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-sm"
                  title={`Delete ${preset.name}`}
                  aria-label={`Delete custom preset ${preset.name}`}
                >
                  <Trash2 size={9} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onOpenSaveModal}
        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 text-sky-300 hover:text-sky-200 border border-slate-700/60 transition-all flex items-center gap-1.5 whitespace-nowrap"
        title="Save current track mix as preset"
      >
        <BookmarkPlus size={13} />
        <span>Save Mix</span>
      </button>
    </div>
  )
}
