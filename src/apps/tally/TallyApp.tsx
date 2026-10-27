import { useEffect, useMemo, useRef, useState } from 'react'
import Masthead from './components/Masthead'
import Composer from './components/Composer'
import TodoList from './components/TodoList'
import Footer from './components/Footer'
import { useTodos } from './lib/todos'
import type { Filter, Priority } from './lib/types'
import { ArrowLeft, Home, Sparkles } from 'lucide-react'

interface TallyAppProps {
  user: {
    uid: string
    displayName: string | null
    photoURL: string | null
    email?: string | null
  }
  onBackToHome?: () => void
}

export default function TallyApp({ user, onBackToHome }: TallyAppProps) {
  const api = useTodos(user.uid)
  const [filter, setFilter] = useState<Filter>('all')
  const [leavingIds, setLeavingIds] = useState<ReadonlySet<string>>(new Set())
  const [dismissedError, setDismissedError] = useState<string | null>(null)
  const timers = useRef(new Map<string, number>())

  useEffect(() => {
    const map = timers.current
    return () => {
      for (const t of map.values()) window.clearTimeout(t)
      map.clear()
    }
  }, [])

  const sorted = useMemo(() => {
    return [...api.todos].sort(
      (a, b) =>
        (b.createdAt?.toMillis() ?? Number.POSITIVE_INFINITY) -
        (a.createdAt?.toMillis() ?? Number.POSITIVE_INFINITY),
    )
  }, [api.todos])

  const visible = useMemo(() => {
    switch (filter) {
      case 'active':
        return sorted.filter((t) => !t.done)
      case 'done':
        return sorted.filter((t) => t.done)
      default:
        return sorted
    }
  }, [sorted, filter])

  const doneCount = api.todos.length - sorted.filter((t) => !t.done).length
  const totalCount = api.todos.length

  function handleDelete(id: string) {
    if (leavingIds.has(id)) return
    setLeavingIds((prev) => new Set(prev).add(id))
    const t = window.setTimeout(() => {
      setLeavingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      void api.remove(id)
      timers.current.delete(id)
    }, 240)
    timers.current.set(id, t)
  }

  function handleSave(
    id: string,
    fields: { title: string; priority: Priority | null; due: Date | null },
  ) {
    void api.update(id, fields)
  }

  const showError = api.error !== null && api.error !== dismissedError

  return (
    <div className="catalyst-app-container tally-theme-wrapper">
      {/* Catalyst OS Top Navigation Bar */}
      {onBackToHome && (
        <nav className="catalyst-app-header-nav" aria-label="Catalyst Navigation">
          <button
            type="button"
            onClick={onBackToHome}
            className="catalyst-nav-back-btn"
            title="Return to Catalyst Home Screen"
          >
            <ArrowLeft size={16} />
            <Home size={15} />
            <span>Catalyst OS</span>
          </button>
          <div className="catalyst-nav-app-pill">
            <span className="catalyst-nav-app-dot" />
            <span className="catalyst-nav-app-title">Tally Notes & Tasks</span>
          </div>
          <div className="catalyst-nav-sync-status">
            <Sparkles size={14} className="text-amber-500" />
            <span>Active Module</span>
          </div>
        </nav>
      )}

      {/* Original Tally Application Shell */}
      <main className="page tally-page-content">
        <Masthead
          user={{ displayName: user.displayName, photoURL: user.photoURL }}
          totalCount={totalCount}
          doneCount={doneCount}
          synced={api.synced}
          loading={api.loading}
        />
        <Composer onAdd={(title, priority, due) => void api.add(title, priority, due)} />
        {showError && (
          <div className="banner" role="alert">
            <span>{api.error}</span>
            <button type="button" onClick={() => setDismissedError(api.error)}>
              Dismiss
            </button>
          </div>
        )}
        <section className="sheet rise" style={{ animationDelay: '0.16s' }} aria-label="Task list">
          <TodoList
            todos={visible}
            loading={api.loading}
            filter={filter}
            leavingIds={leavingIds}
            onToggle={(todo) => void api.toggle(todo)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </section>
        {totalCount > 0 && (
          <Footer
            filter={filter}
            onFilter={setFilter}
            totalCount={totalCount}
            doneCount={doneCount}
            onClearDone={() => void api.clearDone()}
          />
        )}
      </main>
    </div>
  )
}
