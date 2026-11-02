// IndexedDB layer matching Discipline's schema
const DB_NAME = "DisciplineDB"
const DB_VERSION = 1

export const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains("habits")) {
        db.createObjectStore("habits", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("dayChecks")) {
        const dayChecksStore = db.createObjectStore("dayChecks", { keyPath: "id" })
        dayChecksStore.createIndex("habitId", "habitId", { unique: false })
        dayChecksStore.createIndex("date", "date", { unique: false })
      }
      if (!db.objectStoreNames.contains("dayNotes")) {
        const dayNotesStore = db.createObjectStore("dayNotes", { keyPath: "id" })
        dayNotesStore.createIndex("date", "date", { unique: true })
      }
    }
  })
}

export const getFromDB = async <T>(storeName: string, key: string): Promise<T | undefined> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  } catch (e) {
    console.warn(`[DisciplineDB] getFromDB(${storeName}) failed:`, e)
    return undefined
  }
}

export const getAllFromDB = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  } catch (e) {
    console.warn(`[DisciplineDB] getAllFromDB(${storeName}) failed:`, e)
    return []
  }
}

export const putInDB = async <T>(storeName: string, data: T): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (e) {
    console.warn(`[DisciplineDB] putInDB(${storeName}) failed:`, e)
  }
}

export const deleteFromDB = async (storeName: string, key: string): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (e) {
    console.warn(`[DisciplineDB] deleteFromDB(${storeName}) failed:`, e)
  }
}

export const clearStore = async (storeName: string): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (e) {
    console.warn(`[DisciplineDB] clearStore(${storeName}) failed:`, e)
  }
}

