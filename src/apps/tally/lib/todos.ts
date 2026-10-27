import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { firebaseReady, firestore } from '../../../lib/firebase'
import type { Priority, Todo } from './types'

const USERS = 'users'
const TODOS = 'todos'

function friendlyError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : ''
  if (code.includes('permission-denied'))
    return 'Firestore denied this request. Publish the per-user security rules from the README, then reload.'
  if (code.includes('failed-precondition'))
    return 'Firestore is not enabled for this project. Create the database in the Firebase console.'
  if (code.includes('unavailable'))
    return "You're offline. Changes are queued and will sync when the connection returns."
  return 'Something went wrong talking to Firestore. Check the console for details.'
}

export interface TodosApi {
  todos: Todo[]
  loading: boolean
  synced: boolean
  error: string | null
  add: (title: string, priority: Priority | null, due: Date | null) => Promise<void>
  toggle: (todo: Todo) => Promise<void>
  update: (
    id: string,
    fields: { title: string; priority: Priority | null; due: Date | null },
  ) => Promise<void>
  remove: (id: string) => Promise<void>
  clearDone: () => Promise<void>
}

// Local mock storage key
const STORAGE_PREFIX = 'catalyst_tally_todos_'

function getInitialLocalTodos(): Todo[] {
  return [
    {
      id: 'demo-1',
      title: 'Explore Catalyst OS widgets & apps',
      done: false,
      priority: 'high',
      due: null,
      createdAt: null,
    },
    {
      id: 'demo-2',
      title: 'Customize Catalyst home screen wallpaper',
      done: true,
      priority: 'med',
      due: null,
      createdAt: null,
    },
    {
      id: 'demo-3',
      title: 'Check live weather with browser geolocation',
      done: false,
      priority: 'low',
      due: null,
      createdAt: null,
    },
  ]
}

export function useTodos(uid: string | null): TodosApi {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const uidRef = useRef<string | null>(uid)
  uidRef.current = uid

  const isGuest = !uid || uid === 'guest-user' || !firebaseReady

  // Local storage syncing for guest/offline mode
  useEffect(() => {
    if (!isGuest) return

    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${uid || 'guest'}`)
      if (saved) {
        setTodos(JSON.parse(saved))
      } else {
        const initial = getInitialLocalTodos()
        setTodos(initial)
        localStorage.setItem(`${STORAGE_PREFIX}${uid || 'guest'}`, JSON.stringify(initial))
      }
    } catch {
      setTodos(getInitialLocalTodos())
    }
    setLoading(false)
    setSynced(true)
  }, [uid, isGuest])

  // Real Firestore syncing when authenticated with real Firebase
  useEffect(() => {
    if (isGuest || !uid) return

    try {
      const q = query(
        collection(firestore(), USERS, uid, TODOS),
        orderBy('createdAt', 'desc'),
      )
      const unsub = onSnapshot(
        q,
        { includeMetadataChanges: true },
        (snap) => {
          setTodos(
            snap.docs.map((d) => {
              const data = d.data()
              return {
                id: d.id,
                title: typeof data.title === 'string' ? data.title : '',
                done: Boolean(data.done),
                priority: (data.priority as Priority | null) ?? null,
                due: (data.due as Todo['due']) ?? null,
                createdAt: (data.createdAt as Todo['createdAt']) ?? null,
              }
            }),
          )
          setLoading(false)
          setSynced(!snap.metadata.fromCache)
        },
        (err) => {
          console.warn('Firestore fallback to local state:', err)
          setLoading(false)
          setError(friendlyError(err))
        },
      )
      return unsub
    } catch (err) {
      console.warn('Firebase init error, using local fallback:', err)
      setLoading(false)
    }
  }, [uid, isGuest])

  const saveLocalTodos = useCallback((newTodos: Todo[]) => {
    setTodos(newTodos)
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${uidRef.current || 'guest'}`,
        JSON.stringify(newTodos),
      )
    } catch (e) {
      console.error(e)
    }
  }, [])

  const add = useCallback(
    async (title: string, priority: Priority | null, due: Date | null) => {
      const owner = uidRef.current
      if (!owner) return
      setError(null)

      if (isGuest) {
        const newTodo: Todo = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          done: false,
          priority,
          due: due ? ({ toDate: () => due } as unknown as Todo['due']) : null,
          createdAt: null,
        }
        setTodos((prev) => {
          const next = [newTodo, ...prev]
          saveLocalTodos(next)
          return next
        })
        return
      }

      try {
        await addDoc(collection(firestore(), USERS, owner, TODOS), {
          title,
          done: false,
          priority,
          due: due ?? null,
          createdAt: serverTimestamp(),
        })
      } catch (err) {
        setError(friendlyError(err))
      }
    },
    [isGuest, saveLocalTodos],
  )

  const toggle = useCallback(
    async (todo: Todo) => {
      const owner = uidRef.current
      if (!owner) return
      setError(null)

      if (isGuest) {
        setTodos((prev) => {
          const next = prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
          saveLocalTodos(next)
          return next
        })
        return
      }

      try {
        await updateDoc(doc(firestore(), USERS, owner, TODOS, todo.id), {
          done: !todo.done,
        })
      } catch (err) {
        setError(friendlyError(err))
      }
    },
    [isGuest, saveLocalTodos],
  )

  const update = useCallback(
    async (
      id: string,
      fields: { title: string; priority: Priority | null; due: Date | null },
    ) => {
      const owner = uidRef.current
      if (!owner) return
      setError(null)

      if (isGuest) {
        setTodos((prev) => {
          const next = prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title: fields.title,
                  priority: fields.priority,
                  due: fields.due ? ({ toDate: () => fields.due! } as unknown as Todo['due']) : null,
                }
              : t,
          )
          saveLocalTodos(next)
          return next
        })
        return
      }

      try {
        await updateDoc(doc(firestore(), USERS, owner, TODOS, id), {
          title: fields.title,
          priority: fields.priority,
          due: fields.due,
        })
      } catch (err) {
        setError(friendlyError(err))
      }
    },
    [isGuest, saveLocalTodos],
  )

  const remove = useCallback(
    async (id: string) => {
      const owner = uidRef.current
      if (!owner) return
      setError(null)

      if (isGuest) {
        setTodos((prev) => {
          const next = prev.filter((t) => t.id !== id)
          saveLocalTodos(next)
          return next
        })
        return
      }

      try {
        await deleteDoc(doc(firestore(), USERS, owner, TODOS, id))
      } catch (err) {
        setError(friendlyError(err))
      }
    },
    [isGuest, saveLocalTodos],
  )

  const clearDone = useCallback(
    async () => {
      const owner = uidRef.current
      if (!owner) return
      setError(null)

      if (isGuest) {
        setTodos((prev) => {
          const next = prev.filter((t) => !t.done)
          saveLocalTodos(next)
          return next
        })
        return
      }

      try {
        const batch = writeBatch(firestore())
        for (const t of todos) {
          if (t.done) batch.delete(doc(firestore(), USERS, owner, TODOS, t.id))
        }
        await batch.commit()
      } catch (err) {
        setError(friendlyError(err))
      }
    },
    [isGuest, saveLocalTodos, todos],
  )

  return { todos, loading, synced, error, add, toggle, update, remove, clearDone }
}
