// Individual habit item card with checkbox and strikethrough styling
import React from "react"
import { Check } from "lucide-react"
import type { Habit, DayCheck } from "../lib/types"

interface HabitItemProps {
  habit: Habit
  dayCheck?: DayCheck
  onToggle: (habitId: string) => void
}

export function HabitItem({ habit, dayCheck, onToggle }: HabitItemProps) {
  const isCompleted = dayCheck?.completed ?? false

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle(habit.id)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle(habit.id)
        }
      }}
      className={`discipline-habit-item ${isCompleted ? "completed" : ""}`}
      aria-label={`${habit.name}, ${isCompleted ? "completed" : "incomplete"}`}
    >
      {/* Checkbox */}
      <div className="discipline-checkbox" aria-hidden="true">
        {isCompleted && <Check size={14} strokeWidth={3} />}
      </div>

      {/* Habit Details */}
      <div className="discipline-habit-content">
        <span className="discipline-habit-emoji" role="img" aria-label={habit.name}>
          {habit.emoji}
        </span>
        <span className="discipline-habit-name">{habit.name}</span>
      </div>

      {/* Category Tag */}
      <span className="discipline-habit-category-pill">{habit.category}</span>

      {/* Colored Status Dot */}
      <div
        className="discipline-habit-dot"
        style={{ backgroundColor: habit.color }}
        title={`Category: ${habit.category}`}
      />
    </div>
  )
}

