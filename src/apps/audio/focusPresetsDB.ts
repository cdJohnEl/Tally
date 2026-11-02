import type { SoundscapePreset } from './types'

export const DEFAULT_PRESETS: SoundscapePreset[] = [
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: 'Brown noise with gentle rain & 10Hz alpha binaural wave',
    tracks: {
      'brown-noise': 65,
      'rain': 50,
      'binaural': 35,
    },
  },
  {
    id: 'night-rain',
    name: 'Night Rain',
    description: 'Continuous soothing rain with rolling thunder & forest wind',
    tracks: {
      'rain': 75,
      'thunder': 45,
      'forest': 30,
    },
  },
  {
    id: 'cabin-fire',
    name: 'Cabin Fire',
    description: 'Warm crackling embers with distant rain and breeze',
    tracks: {
      'campfire': 70,
      'forest': 35,
      'rain': 25,
    },
  },
  {
    id: 'library-study',
    name: 'Library Study',
    description: 'Subdued room tone with pink noise & subtle cafe ambience',
    tracks: {
      'library': 65,
      'pink-noise': 35,
      'coffee-shop': 25,
    },
  },
  {
    id: 'zen-flow',
    name: 'Zen Flow',
    description: 'Alpha binaural frequency paired with forest air and white noise',
    tracks: {
      'binaural': 60,
      'forest': 45,
      'white-noise': 25,
    },
  },
]

const DB_NAME = 'catalyst_focus_audio_db'
const DB_VERSION = 1
const STORE_NAME = 'custom_presets'
const LOCAL_STORAGE_KEY = 'catalyst_focus_custom_presets'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'))
      return
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getSavedPresets(): Promise<SoundscapePreset[]> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()
      request.onsuccess = () => {
        const custom: SoundscapePreset[] = request.result || []
        resolve([...DEFAULT_PRESETS, ...custom])
      }
      request.onerror = () => {
        resolve(getFallbackPresets())
      }
    })
  } catch {
    return getFallbackPresets()
  }
}

function getFallbackPresets(): SoundscapePreset[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const custom = JSON.parse(raw) as SoundscapePreset[]
      return [...DEFAULT_PRESETS, ...custom]
    }
  } catch {}
  return [...DEFAULT_PRESETS]
}

export async function saveCustomPreset(preset: SoundscapePreset): Promise<void> {
  const toSave: SoundscapePreset = { ...preset, isCustom: true }
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(toSave)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    // Fallback
  }

  try {
    const current = getFallbackPresets().filter((p) => p.isCustom)
    const updated = [...current.filter((p) => p.id !== toSave.id), toSave]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

export async function deleteCustomPreset(id: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {}

  try {
    const current = getFallbackPresets().filter((p) => p.isCustom && p.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current))
  } catch {}
}
