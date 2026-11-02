// Zustand store for Discipline with IndexedDB persistence
import { create } from "zustand"
import { type Habit, type DayCheck, type DayNote, DEFAULT_HABITS } from "./types"
import { getAllFromDB, putInDB, deleteFromDB, clearStore } from "./db"
import { getDateString, addDays, parseLocalDate } from "./utils"

interface DisciplineStore {
  // State
  habits: Habit[]
  dayChecks: DayCheck[]
  dayNotes: DayNote[]
  selectedDate: string
  isLoading: boolean
  theme: "dark" | "light"

  // Actions
  initializeStore: () => Promise<void>
  setTheme: (theme: "dark" | "light") => void
  toggleTheme: () => void
  setSelectedDate: (date: string) => void
  addHabit: (habit: Habit) => Promise<void>
  updateHabit: (habit: Habit) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
  reorderHabits: (habits: Habit[]) => Promise<void>
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>
  getDayChecks: (date: string) => DayCheck[]
  getCompletionRate: (date: string) => number
  addDayNote: (note: DayNote) => Promise<void>
  updateDayNote: (note: DayNote) => Promise<void>
  saveDayNoteContent: (date: string, content: string) => Promise<void>
  getDayNote: (date: string) => DayNote | undefined
  getHabitStreak: (habitId: string) => { current: number; longest: number }
  exportData: () => string
  importData: (jsonData: string) => Promise<void>
  resetToDefaults: () => Promise<void>
}

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark"
  const saved = localStorage.getItem("discipline-theme")
  if (saved === "dark" || saved === "light") return saved
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "dark" // Discipline shines in dark
}

export const useDisciplineStore = create<DisciplineStore>((set, get) => ({
  habits: [],
  dayChecks: [],
  dayNotes: [],
  selectedDate: getDateString(),
  isLoading: true,
  theme: getInitialTheme(),

  setTheme: (theme: "dark" | "light") => {
    localStorage.setItem("discipline-theme", theme)
    set({ theme })
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark"
    localStorage.setItem("discipline-theme", nextTheme)
    set({ theme: nextTheme })
  },

  initializeStore: async () => {
    try {
      const habits = await getAllFromDB<Habit>("habits")
      const dayChecks = await getAllFromDB<DayCheck>("dayChecks")
      const dayNotes = await getAllFromDB<DayNote>("dayNotes")

      if (!habits || habits.length === 0) {
        // Initialize with default habits
        for (const habit of DEFAULT_HABITS) {
          await putInDB("habits", habit)
        }
        set({ habits: DEFAULT_HABITS, dayChecks: dayChecks || [], dayNotes: dayNotes || [], isLoading: false })
      } else {
        set({ habits, dayChecks: dayChecks || [], dayNotes: dayNotes || [], isLoading: false })
      }
    } catch (error) {
      console.error("Failed to initialize Discipline store:", error)
      set({ habits: DEFAULT_HABITS, isLoading: false })
    }
  },

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  addHabit: async (habit: Habit) => {
    await putInDB("habits", habit)
    set((state) => ({ habits: [...state.habits, habit] }))
  },

  updateHabit: async (habit: Habit) => {
    await putInDB("habits", habit)
    set((state) => ({
      habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
    }))
  },

  deleteHabit: async (habitId: string) => {
    await deleteFromDB("habits", habitId)
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== habitId),
    }))
  },

  reorderHabits: async (habits: Habit[]) => {
    for (const habit of habits) {
      await putInDB("habits", habit)
    }
    set({ habits })
  },

  toggleHabitCompletion: async (habitId: string, date: string) => {
    const state = get()
    const existingCheck = state.dayChecks.find((dc) => dc.habitId === habitId && dc.date === date)

    if (existingCheck) {
      const updated: DayCheck = {
        ...existingCheck,
        completed: !existingCheck.completed,
        completedAt: !existingCheck.completed ? Date.now() : undefined,
      }
      await putInDB("dayChecks", updated)
      set((state) => ({
        dayChecks: state.dayChecks.map((dc) => (dc.id === updated.id ? updated : dc)),
      }))
    } else {
      const newCheck: DayCheck = {
        id: `${habitId}-${date}-${Date.now()}`,
        habitId,
        date,
        completed: true,
        completedAt: Date.now(),
      }
      await putInDB("dayChecks", newCheck)
      set((state) => ({ dayChecks: [...state.dayChecks, newCheck] }))
    }
  },

  getDayChecks: (date: string) => {
    const state = get()
    return state.dayChecks.filter((dc) => dc.date === date)
  },

  getCompletionRate: (date: string) => {
    const state = get()
    const activeHabits = state.habits.filter((h) => h.isActive)
    if (activeHabits.length === 0) return 0
    const dayChecks = state.dayChecks.filter((dc) => dc.date === date && dc.completed)
    const activeCompleted = dayChecks.filter((dc) =>
      activeHabits.some((h) => h.id === dc.habitId),
    ).length
    return Math.round((activeCompleted / activeHabits.length) * 100)
  },

  addDayNote: async (note: DayNote) => {
    await putInDB("dayNotes", note)
    set((state) => ({ dayNotes: [...state.dayNotes, note] }))
  },

  updateDayNote: async (note: DayNote) => {
    await putInDB("dayNotes", note)
    set((state) => ({
      dayNotes: state.dayNotes.map((n) => (n.id === note.id ? note : n)),
    }))
  },

  saveDayNoteContent: async (date: string, content: string) => {
    const state = get()
    const existing = state.dayNotes.find((n) => n.date === date)
    const now = Date.now()

    if (existing) {
      const updated: DayNote = {
        ...existing,
        content,
        updatedAt: now,
      }
      await putInDB("dayNotes", updated)
      set((s) => ({
        dayNotes: s.dayNotes.map((n) => (n.id === updated.id ? updated : n)),
      }))
    } else {
      const newNote: DayNote = {
        id: `note-${date}-${now}`,
        date,
        content,
        createdAt: now,
        updatedAt: now,
      }
      await putInDB("dayNotes", newNote)
      set((s) => ({ dayNotes: [...s.dayNotes, newNote] }))
    }
  },

  getDayNote: (date: string) => {
    const state = get()
    return state.dayNotes.find((n) => n.date === date)
  },

  getHabitStreak: (habitId: string) => {
    const state = get()
    const completedChecks = state.dayChecks
      .filter((dc) => dc.habitId === habitId && dc.completed)
      .map((dc) => dc.date)

    if (completedChecks.length === 0) {
      return { current: 0, longest: 0 }
    }

    const uniqueDates = Array.from(new Set(completedChecks)).sort()
    const dateSet = new Set(uniqueDates)

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    let prevDate: Date | null = null

    for (const dateStr of uniqueDates) {
      const curDate = parseLocalDate(dateStr)
      if (!prevDate) {
        tempStreak = 1
      } else {
        const diffMs = curDate.getTime() - prevDate.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      prevDate = curDate
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    }

    // Calculate current streak
    const today = getDateString()
    const yesterday = addDays(today, -1)

    let currentStreak = 0
    let checkDate = dateSet.has(today) ? today : (dateSet.has(yesterday) ? yesterday : null)

    while (checkDate && dateSet.has(checkDate)) {
      currentStreak++
      checkDate = addDays(checkDate, -1)
    }

    return { current: currentStreak, longest: Math.max(currentStreak, longestStreak) }
  },

  exportData: () => {
    const state = get()
    return JSON.stringify(
      {
        version: "1.0.0",
        appName: "Discipline",
        habits: state.habits,
        dayChecks: state.dayChecks,
        dayNotes: state.dayNotes,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    )
  },

  importData: async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)
      if (!Array.isArray(data.habits)) {
        throw new Error("Invalid backup format: missing habits array")
      }

      await clearStore("habits")
      await clearStore("dayChecks")
      await clearStore("dayNotes")

      for (const habit of data.habits) {
        await putInDB("habits", habit)
      }
      if (Array.isArray(data.dayChecks)) {
        for (const check of data.dayChecks) {
          await putInDB("dayChecks", check)
        }
      }
      if (Array.isArray(data.dayNotes)) {
        for (const note of data.dayNotes) {
          await putInDB("dayNotes", note)
        }
      }

      set({
        habits: data.habits,
        dayChecks: data.dayChecks || [],
        dayNotes: data.dayNotes || [],
      })
    } catch (error) {
      console.error("Failed to import Discipline data:", error)
      throw error
    }
  },

  resetToDefaults: async () => {
    await clearStore("habits")
    for (const habit of DEFAULT_HABITS) {
      await putInDB("habits", habit)
    }
    set({ habits: DEFAULT_HABITS })
  },
}))

