export type HabitColorTheme = 'peach' | 'lime' | 'pink' | 'orange' | 'sky' | 'brown'

export type HabitCategory =
  | 'hydration'
  | 'meditation'
  | 'fitness'
  | 'walking'
  | 'reading'
  | 'recovery'
  | 'general'

export interface Habit {
  id: string
  title: string
  category: HabitCategory
  colorTheme: HabitColorTheme
  iconName: string
  durationMinutes: number
  durationLabel: string
  goalAmount?: string
  repeatDays: number[] // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 7 = Sun
  hasReminder: boolean
  reminderTime?: string
  streak: number
  bestStreak: number
  createdAt: string
}

export interface DayCompletion {
  date: string // YYYY-MM-DD
  completedHabitIds: string[]
}

export type HabitLogs = Record<string, string[]>

export interface WeeklyInsightData {
  id?: string
  category: string
  name: string
  percentage: number
  color: string
  completedDays: number
  totalDays: number
}

export interface HabitStats {
  points: number
  completedThisWeek: number
  weightTrainedLb: number
  forestAreaSqFt: number
  totalMinutesThisWeek: number
}
