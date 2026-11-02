import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr)
  d.setDate(d.getDate() + days)
  return getDateString(d)
}

export function getDayOfWeek(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

