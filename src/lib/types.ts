import type { Timestamp } from 'firebase/firestore'

// Tally Types (re-exported for compatibility)
export type Priority = 'low' | 'med' | 'high'
export interface Todo {
  id: string
  title: string
  done: boolean
  priority: Priority | null
  due: Timestamp | null
  createdAt: Timestamp | null
}
export type Filter = 'all' | 'active' | 'done'

// Catalyst System Types
export type CatalystAppId = 'home' | 'tally' | 'expenses' | 'habits' | 'audio'

export interface CatalystAppMeta {
  id: CatalystAppId
  title: string
  shortName: string
  category: string
  tagline: string
  description: string
  badge?: string | number
  colorGradient: string
  iconColor: string
}

export interface CatalystUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  isGuest?: boolean
}

export interface WeatherData {
  city: string
  temperature: number
  tempUnit: 'C' | 'F'
  weatherCode: number
  condition: string
  humidity: number
  windSpeed: number
  loading: boolean
  error: string | null
}

export interface WallpaperOption {
  id: string
  name: string
  type: 'gradient' | 'image' | 'color'
  value: string
  textColor: 'light' | 'dark'
  accentColor: string
  preview: string
}
