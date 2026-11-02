import type { Habit, HabitStats, WeeklyInsightData } from './habitTypes'

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Drink a glass of water',
    category: 'hydration',
    colorTheme: 'peach',
    iconName: 'glass',
    durationMinutes: 5,
    durationLabel: '5 min',
    goalAmount: '8 glasses',
    repeatDays: [1, 2, 3, 4, 5, 6, 7],
    hasReminder: true,
    reminderTime: '07:30',
    streak: 3,
    bestStreak: 12,
    createdAt: '2025-01-01',
  },
  {
    id: 'habit-2',
    title: 'Meditate to relax',
    category: 'meditation',
    colorTheme: 'lime',
    iconName: 'meditation',
    durationMinutes: 15,
    durationLabel: '15 min',
    goalAmount: '1 session',
    repeatDays: [1, 2, 3, 4, 5, 6, 7],
    hasReminder: true,
    reminderTime: '08:00',
    streak: 6,
    bestStreak: 18,
    createdAt: '2025-01-01',
  },
  {
    id: 'habit-3',
    title: 'Stretch for 10 minutes',
    category: 'fitness',
    colorTheme: 'pink',
    iconName: 'stretch',
    durationMinutes: 10,
    durationLabel: '10 min',
    goalAmount: '10 min',
    repeatDays: [1, 2, 3, 4, 5, 6, 7],
    hasReminder: false,
    streak: 5,
    bestStreak: 10,
    createdAt: '2025-01-01',
  },
  {
    id: 'habit-4',
    title: 'Go for a short walk',
    category: 'walking',
    colorTheme: 'orange',
    iconName: 'walk',
    durationMinutes: 20,
    durationLabel: '20 min',
    goalAmount: '3,000 steps',
    repeatDays: [1, 2, 3, 4, 5, 6, 7],
    hasReminder: true,
    reminderTime: '17:30',
    streak: 3,
    bestStreak: 14,
    createdAt: '2025-01-01',
  },
]

export function getTodayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

export function loadHabits(uid: string = 'guest'): Habit[] {
  try {
    const raw = localStorage.getItem(`catalyst_habits_${uid}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error loading habits', e)
  }
  return INITIAL_HABITS
}

export function saveHabits(uid: string = 'guest', habits: Habit[]): void {
  try {
    localStorage.setItem(`catalyst_habits_${uid}`, JSON.stringify(habits))
  } catch (e) {
    console.error('Error saving habits', e)
  }
}

// Maps date string "YYYY-MM-DD" to array of completed habit IDs
export type HabitLogs = Record<string, string[]>

export function loadHabitLogs(uid: string = 'guest'): HabitLogs {
  try {
    const raw = localStorage.getItem(`catalyst_habit_logs_${uid}`)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Error loading habit logs', e)
  }

  // Pre-fill initial rolling weekly logs matching the reference proportions
  const initial: HabitLogs = {}
  const now = new Date()

  // Generate keys for the past 7 days
  const d0 = getTodayKey() // Today
  const d1 = new Date(now); d1.setDate(now.getDate() - 1); const k1 = d1.toISOString().split('T')[0]
  const d2 = new Date(now); d2.setDate(now.getDate() - 2); const k2 = d2.toISOString().split('T')[0]
  const d3 = new Date(now); d3.setDate(now.getDate() - 3); const k3 = d3.toISOString().split('T')[0]
  const d4 = new Date(now); d4.setDate(now.getDate() - 4); const k4 = d4.toISOString().split('T')[0]

  initial[d0] = ['habit-1', 'habit-2'] // Today: Drink + Meditate checked
  initial[k1] = ['habit-1', 'habit-3', 'habit-4']
  initial[k2] = ['habit-2', 'habit-4']
  initial[k3] = ['habit-1', 'habit-4']
  initial[k4] = ['habit-3']

  return initial
}

export function saveHabitLogs(uid: string = 'guest', logs: HabitLogs): void {
  try {
    localStorage.setItem(`catalyst_habit_logs_${uid}`, JSON.stringify(logs))
  } catch (e) {
    console.error('Error saving habit logs', e)
  }
}

export function toggleHabitLog(
  uid: string = 'guest',
  habitId: string,
  dateKey: string,
): { logs: HabitLogs; isCompleted: boolean } {
  const currentLogs = loadHabitLogs(uid)
  const list = currentLogs[dateKey] ? [...currentLogs[dateKey]] : []
  const idx = list.indexOf(habitId)
  let isCompleted = false

  if (idx >= 0) {
    list.splice(idx, 1)
    isCompleted = false
  } else {
    list.push(habitId)
    isCompleted = true
  }

  const updated: HabitLogs = {
    ...currentLogs,
    [dateKey]: list,
  }

  saveHabitLogs(uid, updated)
  return { logs: updated, isCompleted }
}

export function calculateStats(habits: Habit[], logs: HabitLogs): HabitStats {
  let completedCount = 0
  let totalMinutes = 0

  // Count past 7 days
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
    const dayCompleted = logs[key] || []
    completedCount += dayCompleted.length

    dayCompleted.forEach((hId) => {
      const h = habits.find((item) => item.id === hId)
      if (h) totalMinutes += h.durationMinutes
    })
  }

  // Base points formula: 842 points baseline + 30 points per completion
  const basePoints = 842 + completedCount * 15

  return {
    points: basePoints,
    completedThisWeek: completedCount,
    weightTrainedLb: 440 + completedCount * 12,
    forestAreaSqFt: 200 + completedCount * 15,
    totalMinutesThisWeek: totalMinutes > 0 ? totalMinutes : 450, // approx 7h 30m
  }
}

export function getWeeklyInsights(habits: Habit[], logs: HabitLogs): WeeklyInsightData[] {
  // Collect dates of the past 7 days (rolling weekly window)
  const past7Days: string[] = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    past7Days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`,
    )
  }

  // Primary 4 categories matching reference design (Walking, Running, Meditation, Drink)
  const pillarsConfig = [
    { key: 'walking', name: 'Walking', category: 'walking', color: '#38241c' },
    { key: 'running', name: 'Running', category: 'fitness', color: '#964b15' },
    { key: 'meditation', name: 'Meditation', category: 'meditation', color: '#779e2c' },
    { key: 'drink', name: 'Drink', category: 'hydration', color: '#e06cb3' },
  ]

  const results: WeeklyInsightData[] = pillarsConfig.map((cfg) => {
    // Find all habits that belong to this category or title
    const matchingHabits = habits.filter(
      (h) => h.category === cfg.category || h.title.toLowerCase().includes(cfg.key),
    )
    const matchingIds = matchingHabits.map((h) => h.id)

    // Count how many unique days out of 7 had at least one completed habit in this category
    let completedDays = 0
    past7Days.forEach((dateKey) => {
      const loggedIds = logs[dateKey] || []
      if (matchingIds.some((id) => loggedIds.includes(id))) {
        completedDays++
      }
    })

    const percentage = Math.round((completedDays / 7) * 100)

    return {
      category: cfg.category,
      name: cfg.name,
      percentage,
      color: cfg.color,
      completedDays,
      totalDays: 7,
    }
  })

  // Also include any user-created custom habits outside the primary 4 categories
  const customHabits = habits.filter(
    (h) => !['walking', 'fitness', 'meditation', 'hydration'].includes(h.category),
  )

  customHabits.forEach((ch) => {
    let completedDays = 0
    past7Days.forEach((dateKey) => {
      const loggedIds = logs[dateKey] || []
      if (loggedIds.includes(ch.id)) {
        completedDays++
      }
    })
    const percentage = Math.round((completedDays / 7) * 100)
    results.push({
      id: ch.id,
      category: ch.category,
      name: ch.title.length > 10 ? ch.title.slice(0, 9) + '…' : ch.title,
      percentage,
      color: ch.colorTheme === 'peach' ? '#ea580c' : ch.colorTheme === 'pink' ? '#db2777' : '#0284c7',
      completedDays,
      totalDays: 7,
    })
  })

  return results
}
