interface WeekStripProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void
}

export default function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  // Generate current week dates (Mon to Sun)
  const now = new Date(selectedDate ? selectedDate + 'T12:00:00' : Date.now())
  const dayOfWeek = now.getDay() // 0 = Sun, 1 = Mon ... 6 = Sat
  // Convert to Mon = 0 ... Sun = 6
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const days = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`

    days.push({
      name: weekDays[i],
      dateNumber: d.getDate(),
      dateKey: key,
      isToday:
        new Date().toISOString().split('T')[0] === key,
      isSelected: selectedDate === key,
    })
  }

  return (
    <div className="habit-week-strip" role="region" aria-label="Calendar Week">
      {days.map((item) => (
        <button
          key={item.dateKey}
          type="button"
          onClick={() => onSelectDate(item.dateKey)}
          className={`habit-day-col ${item.isSelected ? 'is-selected' : ''}`}
          aria-pressed={item.isSelected}
        >
          <span className="habit-day-label">{item.name}</span>
          <div className="habit-day-circle">
            <span>{item.dateNumber}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
