// Core data types for Discipline Habit Tracker

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  category: "health" | "productivity" | "learning" | "personal" | "other"
  createdAt: number
  order: number
  isActive: boolean
}

export interface DayCheck {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  completed: boolean
  completedAt?: number
}

export interface DayNote {
  id: string
  date: string // YYYY-MM-DD
  content: string
  createdAt: number
  updatedAt: number
}

export interface DayStats {
  date: string
  totalHabits: number
  completedHabits: number
  completionRate: number
}

export interface HabitStreak {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
}

export const DEFAULT_HABITS: Habit[] = [
  {
    id: "1",
    name: "Morning Exercise",
    emoji: "🏃",
    color: "#FF6B6B",
    category: "health",
    createdAt: 1700000000000,
    order: 0,
    isActive: true,
  },
  {
    id: "2",
    name: "Drink Water",
    emoji: "💧",
    color: "#4ECDC4",
    category: "health",
    createdAt: 1700000000001,
    order: 1,
    isActive: true,
  },
  {
    id: "3",
    name: "Meditation",
    emoji: "🧘",
    color: "#95E1D3",
    category: "health",
    createdAt: 1700000000002,
    order: 2,
    isActive: true,
  },
  {
    id: "4",
    name: "Read",
    emoji: "📚",
    color: "#FFE66D",
    category: "learning",
    createdAt: 1700000000003,
    order: 3,
    isActive: true,
  },
  {
    id: "5",
    name: "Code/Learn",
    emoji: "💻",
    color: "#A8E6CF",
    category: "learning",
    createdAt: 1700000000004,
    order: 4,
    isActive: true,
  },
  {
    id: "6",
    name: "Journal",
    emoji: "📝",
    color: "#FFD3B6",
    category: "personal",
    createdAt: 1700000000005,
    order: 5,
    isActive: true,
  },
  {
    id: "7",
    name: "Sleep 8h",
    emoji: "😴",
    color: "#FFAAA5",
    category: "health",
    createdAt: 1700000000006,
    order: 6,
    isActive: true,
  },
  {
    id: "8",
    name: "Healthy Meal",
    emoji: "🥗",
    color: "#FF8B94",
    category: "health",
    createdAt: 1700000000007,
    order: 7,
    isActive: true,
  },
  {
    id: "9",
    name: "No Phone Hour",
    emoji: "📵",
    color: "#A8D8EA",
    category: "productivity",
    createdAt: 1700000000008,
    order: 8,
    isActive: true,
  },
  {
    id: "10",
    name: "Gratitude",
    emoji: "🙏",
    color: "#AA96DA",
    category: "personal",
    createdAt: 1700000000009,
    order: 9,
    isActive: true,
  },
  {
    id: "11",
    name: "Stretch",
    emoji: "🤸",
    color: "#FCBAD3",
    category: "health",
    createdAt: 1700000000010,
    order: 10,
    isActive: true,
  },
  {
    id: "12",
    name: "Deep Work",
    emoji: "🎯",
    color: "#A0C4FF",
    category: "productivity",
    createdAt: 1700000000011,
    order: 11,
    isActive: true,
  },
  {
    id: "13",
    name: "Walk Outside",
    emoji: "🚶",
    color: "#CAFFBF",
    category: "health",
    createdAt: 1700000000012,
    order: 12,
    isActive: true,
  },
  {
    id: "14",
    name: "Reflect",
    emoji: "🤔",
    color: "#FFB4A2",
    category: "personal",
    createdAt: 1700000000013,
    order: 13,
    isActive: true,
  },
  {
    id: "15",
    name: "Hydrate Evening",
    emoji: "🌙",
    color: "#E0AAFF",
    category: "health",
    createdAt: 1700000000014,
    order: 14,
    isActive: true,
  },
]

