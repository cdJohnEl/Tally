import TodoItem from './TodoItem'
import type { Filter, Priority, Todo } from '../lib/types'

const EMPTY_COPY: Record<Filter, { title: string; body: string }> = {
  all: {
    title: 'A blank page.',
    body: 'Your tasks live here. Write the first one above — it syncs to the cloud the moment you add it.',
  },
  active: {
    title: 'Nothing left to do.',
    body: 'Every task on the page is crossed off. Add another above, or take the win.',
  },
  done: {
    title: 'Nothing crossed off yet.',
    body: 'Tick a circle when a task is finished — it gets the marker treatment.',
  },
}

function GhostMarks() {
  return (
    <svg className="empty-marks" width={44} height={40} viewBox="0 0 44 40" aria-hidden="true">
      <line x1={9} y1={8} x2={7.5} y2={33} />
      <line x1={19} y1={7} x2={18} y2={32} />
      <line x1={29} y1={8} x2={28.5} y2={33} />
      <line className="slash" x1={4} y1={29} x2={34} y2={10} />
    </svg>
  )
}

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  filter: Filter
  leavingIds: ReadonlySet<string>
  onToggle: (todo: Todo) => void
  onSave: (
    id: string,
    fields: { title: string; priority: Priority | null; due: Date | null },
  ) => void
  onDelete: (id: string) => void
}

export default function TodoList({
  todos,
  loading,
  filter,
  leavingIds,
  onToggle,
  onSave,
  onDelete,
}: TodoListProps) {
  if (loading) {
    return (
      <ul className="sheet-inner" aria-label="Loading tasks">
        {[64, 48, 76].map((w, i) => (
          <li className="sk-item" key={i} aria-hidden="true">
            <span className="sk-circle" />
            <span className="sk-bar" style={{ width: `${w}%` }} />
          </li>
        ))}
      </ul>
    )
  }

  if (todos.length === 0) {
    const copy = EMPTY_COPY[filter]
    return (
      <div className="sheet-inner">
        <div className="empty">
          <GhostMarks />
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="sheet-inner" aria-label="Tasks">
      {todos.map((todo, i) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={i}
          leaving={leavingIds.has(todo.id)}
          onToggle={onToggle}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
