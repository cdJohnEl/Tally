import { useCallback, useEffect, useState } from 'react'
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
import { firestore } from './firebase'
import type { Priority, Todo } from './types'

const TODOS = 'todos'

function friendlyError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : ''
  if (code.includes('permission-denied'))
    return 'Firestore denied this request. Publish the security rules from the README, then reload.'
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

export function useTodos(): TodosApi {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(firestore(), TODOS), orderBy('createdAt', 'desc'))
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
        setLoading(false)
        setError(friendlyError(err))
      },
    )
    return unsub
  }, [])

  const add = useCallback(async (title: string, priority: Priority | null, due: Date | null) => {
    setError(null)
    try {
      await addDoc(collection(firestore(), TODOS), {
        title,
        done: false,
        priority,
        due: due ?? null,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      setError(friendlyError(err))
    }
  }, [])

  const toggle = useCallback(async (todo: Todo) => {
    setError(null)
    try {
      await updateDoc(doc(firestore(), TODOS, todo.id), { done: !todo.done })
    } catch (err) {
      setError(friendlyError(err))
    }
  }, [])

  const update = useCallback(
    async (
      id: string,
      fields: { title: string; priority: Priority | null; due: Date | null },
    ) => {
      setError(null)
      try {
        await updateDoc(doc(firestore(), TODOS, id), {
          title: fields.title,
          priority: fields.priority,
          due: fields.due,
        })
      } catch (err) {
        setError(friendlyError(err))
      }
    },
    [],
  )

  const remove = useCallback(async (id: string) => {
    setError(null)
    try {
      await deleteDoc(doc(firestore(), TODOS, id))
    } catch (err) {
      setError(friendlyError(err))
    }
  }, [])

  const clearDone = useCallback(async () => {
    setError(null)
    try {
      const batch = writeBatch(firestore())
      for (const t of todos) {
        if (t.done) batch.delete(doc(firestore(), TODOS, t.id))
      }
      await batch.commit()
    } catch (err) {
      setError(friendlyError(err))
    }
  }, [todos])

  return { todos, loading, synced, error, add, toggle, update, remove, clearDone }
}
