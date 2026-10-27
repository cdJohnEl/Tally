import type { Timestamp } from 'firebase/firestore'

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
