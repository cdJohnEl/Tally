import type { Filter } from '../lib/types'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

interface FooterProps {
  filter: Filter
  onFilter: (f: Filter) => void
  totalCount: number
  doneCount: number
  onClearDone: () => void
}

export default function Footer({
  filter,
  onFilter,
  totalCount,
  doneCount,
  onClearDone,
}: FooterProps) {
  return (
    <>
      <div className="footer rise" style={{ animationDelay: '0.24s' }}>
        <div className="segmented" role="radiogroup" aria-label="Filter tasks">
          {FILTERS.map((f) => (
            <label key={f.value}>
              <input
                type="radio"
                name="task-filter"
                value={f.value}
                checked={filter === f.value}
                onChange={() => onFilter(f.value)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
        {doneCount > 0 && (
          <button type="button" className="clear-btn" onClick={onClearDone}>
            Clear done ({doneCount})
          </button>
        )}
      </div>
      <p className="status-line rise" style={{ animationDelay: '0.3s' }}>
        {doneCount} of {totalCount} recorded — saved in the cloud
      </p>
    </>
  )
}
