import type { Habit, HabitLogs } from './habitTypes'
import { INITIAL_HABITS, getTodayKey } from './habitStorage'

const DB_NAME = 'catalyst_habits_db'
const DB_VERSION = 1
const STORE_HABITS = 'habits'
const STORE_LOGS = 'logs'
const STORE_METRICS = 'metrics'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_HABITS)) {
        db.createObjectStore(STORE_HABITS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        db.createObjectStore(STORE_LOGS, { keyPath: 'date' })
      }
      if (!db.objectStoreNames.contains(STORE_METRICS)) {
        db.createObjectStore(STORE_METRICS, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// --------------------------------------------------------------------------
// Habits CRUD via IndexedDB with LocalStorage Fallback
// --------------------------------------------------------------------------
export async function idbGetHabits(uid: string = 'guest'): Promise<Habit[]> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_HABITS, 'readonly')
    const store = tx.objectStore(STORE_HABITS)
    const request = store.getAll()

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const results = request.result as Habit[]
        if (results && results.length > 0) {
          resolve(results)
        } else {
          // Initialize with default habits
          void idbSaveAllHabits(uid, INITIAL_HABITS)
          resolve(INITIAL_HABITS)
        }
      }
      request.onerror = () => {
        resolve(fallbackGetHabits(uid))
      }
    })
  } catch {
    return fallbackGetHabits(uid)
  }
}

export async function idbSaveAllHabits(uid: string, habits: Habit[]): Promise<void> {
  // Always mirror to localStorage for instant synchronous loads
  fallbackSaveHabits(uid, habits)

  try {
    const db = await openDB()
    const tx = db.transaction(STORE_HABITS, 'readwrite')
    const store = tx.objectStore(STORE_HABITS)
    store.clear()
    habits.forEach((h) => store.put(h))
  } catch (err) {
    console.warn('IndexedDB write skipped, saved to localStorage', err)
  }
}

// --------------------------------------------------------------------------
// Logs CRUD via IndexedDB
// --------------------------------------------------------------------------
export async function idbGetLogs(uid: string = 'guest'): Promise<HabitLogs> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_LOGS, 'readonly')
    const store = tx.objectStore(STORE_LOGS)
    const request = store.getAll()

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const records = request.result as { date: string; habitIds: string[] }[]
        if (records && records.length > 0) {
          const map: HabitLogs = {}
          records.forEach((r) => {
            map[r.date] = r.habitIds
          })
          resolve(map)
        } else {
          resolve(fallbackGetLogs(uid))
        }
      }
      request.onerror = () => {
        resolve(fallbackGetLogs(uid))
      }
    })
  } catch {
    return fallbackGetLogs(uid)
  }
}

export async function idbSaveLogs(uid: string, logs: HabitLogs): Promise<void> {
  fallbackSaveLogs(uid, logs)

  try {
    const db = await openDB()
    const tx = db.transaction(STORE_LOGS, 'readwrite')
    const store = tx.objectStore(STORE_LOGS)
    store.clear()
    Object.entries(logs).forEach(([date, habitIds]) => {
      store.put({ date, habitIds })
    })
  } catch (err) {
    console.warn('IndexedDB write skipped for logs', err)
  }
}

// --------------------------------------------------------------------------
// LocalStorage Fallbacks
// --------------------------------------------------------------------------
function fallbackGetHabits(uid: string): Habit[] {
  try {
    const raw = localStorage.getItem(`catalyst_habits_${uid}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return INITIAL_HABITS
}

function fallbackSaveHabits(uid: string, habits: Habit[]): void {
  try {
    localStorage.setItem(`catalyst_habits_${uid}`, JSON.stringify(habits))
  } catch {}
}

function fallbackGetLogs(uid: string): HabitLogs {
  try {
    const raw = localStorage.getItem(`catalyst_habit_logs_${uid}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  const today = getTodayKey()
  return { [today]: ['habit-1', 'habit-2'] }
}

function fallbackSaveLogs(uid: string, logs: HabitLogs): void {
  try {
    localStorage.setItem(`catalyst_habit_logs_${uid}`, JSON.stringify(logs))
  } catch {}
}
