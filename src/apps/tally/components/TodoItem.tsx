import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { PencilIcon, TrashIcon } from './icons'
import { dueInfo, parseDateInputValue, toDateInputValue } from '../lib/dates'
import type { Priority, Todo } from '../lib/types'

const PRIORITY_OPTIONS: { value: 'none' | Priority; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'high', label: 'High' },
  { value: 'med', label: 'Med' },
  { value: 'low', label: 'Low' },
]

const PRIORITY_LABEL: Record<Exclude<Priority, never>, string> = {
  high: 'High',
  med: 'Med',
  low: 'Low',
}

interface TodoItemProps {
  todo: Todo
  index: number
  leaving: boolean
  onToggle: (todo: Todo) => void
  onSave: (
    id: string,
    fields: { title: string; priority: Priority | null; due: Date | null },
  ) => void
  onDelete: (id: string) => void
}

export default function TodoItem({
  todo,
  index,
  leaving,
  onToggle,
  onSave,
  onDelete,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [draftPriority, setDraftPriority] = useState<'none' | Priority>(todo.priority ?? 'none')
  const [draftDue, setDraftDue] = useState(
    todo.due ? toDateInputValue(todo.due.toDate()) : '',
  )
  const editInputRef = useRef<HTMLInputElement>(null)

  const due = dueInfo(todo.due)

  function startEdit() {
    setDraft(todo.title)
    setDraftPriority(todo.priority ?? 'none')
    setDraftDue(todo.due ? toDateInputValue(todo.due.toDate()) : '')
    setEditing(true)
    requestAnimationFrame(() => {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    })
  }

  function saveEdit() {
    const trimmed = draft.trim()
    if (!trimmed) {
      setEditing(false)
      return
    }
    onSave(todo.id, {
      title: trimmed,
      priority: draftPriority === 'none' ? null : draftPriority,
      due: parseDateInputValue(draftDue),
    })
    setEditing(false)
  }

  function handleEditKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  function handleEditSubmit(e: FormEvent) {
    e.preventDefault()
    saveEdit()
  }

  if (editing) {
    return (
      <li className="item">
        <span className="check" style={{ opacity: 0.35 }} aria-hidden="true" />
        <div className="item-body">
          <form className="edit-form" onSubmit={handleEditSubmit}>
            <input
              ref={editInputRef}
              className="edit-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleEditKeyDown}
              aria-label="Edit task title"
              maxLength={200}
            />
            <div className="edit-row">
              <div className="pills" role="radiogroup" aria-label="Priority">
                {PRIORITY_OPTIONS.map((opt) => (
                  <label className="pill" key={opt.value}>
                    <input
                      type="radio"
                      name={`edit-priority-${todo.id}`}
                      value={opt.value}
                      checked={draftPriority === opt.value}
                      onChange={() => setDraftPriority(opt.value)}
                    />
                    <span>
                      {opt.value !== 'none' && (
                        <i className={`dot ${opt.value}`} aria-hidden="true" />
                      )}
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              <input
                className="date-input"
                type="date"
                value={draftDue}
                onChange={(e) => setDraftDue(e.target.value)}
                aria-label="Due date"
              />
              <span className="edit-hint">Enter to save · Esc to cancel</span>
            </div>
          </form>
        </div>
        <div className="item-actions">
          <button type="button" className="icon-btn" onClick={saveEdit} aria-label="Save changes">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m4.5 12.5 5 5L19.5 7" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => setEditing(false)}
            aria-label="Cancel editing"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </li>
    )
  }

  return (
    <li
      className={`item${todo.done ? ' done' : ''}${leaving ? ' leaving' : ''}`}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <button
        type="button"
        className="check"
        aria-pressed={todo.done}
        aria-label={`Mark "${todo.title}" ${todo.done ? 'active' : 'done'}`}
        onClick={() => onToggle(todo)}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m5.5 12.5 4.5 4.5 8.5-9.5" />
        </svg>
      </button>
      <div className="item-body">
        <span className="item-title" onDoubleClick={startEdit} title={todo.title}>
          {todo.title}
        </span>
        {(todo.priority || due) && (
          <div className="item-meta">
            {todo.priority && (
              <span className="chip">
                <i className={`dot ${todo.priority}`} aria-hidden="true" />
                {PRIORITY_LABEL[todo.priority]}
              </span>
            )}
            {due && (
              <span className={`chip${due.overdue ? ' overdue' : ''}`}>
                {due.overdue && <i className="dot high" style={{ background: 'var(--red)' }} aria-hidden="true" />}
                {due.label}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="item-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={startEdit}
          aria-label={`Edit task: ${todo.title}`}
        >
          <PencilIcon size={17} />
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete task: ${todo.title}`}
        >
          <TrashIcon size={17} />
        </button>
      </div>
    </li>
  )
}
