import type { Habit, HabitLogs } from './habitTypes'

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

/**
 * Calculates current streak for a habit by traversing backwards in time.
 * If completed today: streak counts backwards starting today.
 * If not completed today: streak counts backwards starting yesterday.
 * If neither today nor yesterday is completed: current streak is 0.
 */
export function calculateHabitStreak(habitId: string, logs: HabitLogs): number {
  const now = new Date()
  const todayKey = toDateKey(now)

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayKey = toDateKey(yesterday)

  const todayCompleted = (logs[todayKey] || []).includes(habitId)
  const yesterdayCompleted = (logs[yesterdayKey] || []).includes(habitId)

  if (!todayCompleted && !yesterdayCompleted) {
    return 0
  }

  let streak = 0
  let pointer = new Date(todayCompleted ? now : yesterday)

  // Maximum lookback of 365 days
  for (let i = 0; i < 365; i++) {
    const key = toDateKey(pointer)
    const dayHabits = logs[key] || []

    if (dayHabits.includes(habitId)) {
      streak++
      pointer.setDate(pointer.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Recalculates streaks for all habits given the current logs
 */
export function updateHabitStreaks(habits: Habit[], logs: HabitLogs): Habit[] {
  return habits.map((h) => {
    const currentStreak = calculateHabitStreak(h.id, logs)
    const bestStreak = Math.max(h.bestStreak || 0, currentStreak)
    return {
      ...h,
      streak: currentStreak,
      bestStreak,
    }
  })
}
