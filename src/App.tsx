import { useEffect, useMemo, useRef, useState } from 'react'
import type { User } from 'firebase/auth'
import Masthead from './components/Masthead'
import Composer from './components/Composer'
import TodoList from './components/TodoList'
import Footer from './components/Footer'
import Setup from './components/Setup'
import SignIn from './components/SignIn'
import { firebaseReady, watchAuth, type AuthState } from './lib/firebase'
import { useTodos } from './lib/todos'
import type { Filter, Priority } from './lib/types'

export default function App() {
  if (!firebaseReady) {
    return <Setup />
  }
  return <AuthGate />
}

function AuthGate() {
  const [authState, setAuthState] = useState<AuthState>({ status: 'connecting' })

  useEffect(() => watchAuth(setAuthState), [])

  if (authState.status === 'connecting') {
    return (
      <main className="page">
        <div className="masthead-top">
          <span className="brand">
            Tally<span className="brand-dot">.</span>
          </span>
        </div>
        <TodoList
          todos={[]}
          loading
          filter="all"
          leavingIds={new Set()}
          onToggle={() => {}}
          onSave={() => {}}
          onDelete={() => {}}
        />
      </main>
    )
  }
  if (authState.status === 'signed-out') {
    return <SignIn />
  }
  return <TodoApp user={authState.user} />
}

function TodoApp({ user }: { user: User }) {
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
    <main className="page">
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
  )
}
