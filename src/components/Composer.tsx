import { useState, type FormEvent } from 'react'
import { PlusIcon } from './icons'
import { parseDateInputValue } from '../lib/dates'
import type { Priority } from '../lib/types'

const PRIORITY_OPTIONS: { value: 'none' | Priority; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'high', label: 'High' },
  { value: 'med', label: 'Med' },
  { value: 'low', label: 'Low' },
]

interface ComposerProps {
  onAdd: (title: string, priority: Priority | null, due: Date | null) => void
}

export default function Composer({ onAdd }: ComposerProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'none' | Priority>('none')
  const [due, setDue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, priority === 'none' ? null : priority, parseDateInputValue(due))
    setTitle('')
    setPriority('none')
    setDue('')
  }

  return (
    <section className="composer rise" style={{ animationDelay: '0.08s' }} aria-label="Add a task">
      <div className="composer-inner">
        <form onSubmit={handleSubmit}>
          <div className="composer-row">
            <input
              className="composer-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write a task, then press Enter"
              aria-label="Task title"
              autoComplete="off"
              maxLength={200}
              autoFocus
            />
            <button
              type="submit"
              className="add-btn"
              disabled={!title.trim()}
              aria-label="Add task"
            >
              <PlusIcon size={20} />
            </button>
          </div>
          <div className="composer-meta">
            <span className="field-label" id="priority-label">
              Priority
            </span>
            <div className="pills" role="radiogroup" aria-labelledby="priority-label">
              {PRIORITY_OPTIONS.map((opt) => (
                <label className="pill" key={opt.value}>
                  <input
                    type="radio"
                    name="composer-priority"
                    value={opt.value}
                    checked={priority === opt.value}
                    onChange={() => setPriority(opt.value)}
                  />
                  <span>
                    {opt.value !== 'none' && <i className={`dot ${opt.value}`} aria-hidden="true" />}
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            <label className="field-label" htmlFor="composer-due">
              Due
            </label>
            <input
              id="composer-due"
              className="date-input"
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>
        </form>
      </div>
    </section>
  )
}
