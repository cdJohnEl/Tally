import { useState, useEffect, useMemo } from 'react'
import { Plus, BarChart3, ChevronLeft, Sparkles } from 'lucide-react'
import type { CatalystUser } from '../../lib/types'
import type { Habit, HabitStats } from './lib/habitTypes'
import {
  loadHabits,
  loadHabitLogs,
  getTodayKey,
  calculateStats,
  getWeeklyInsights,
} from './lib/habitStorage'
import { idbGetHabits, idbSaveAllHabits, idbGetLogs, idbSaveLogs } from './lib/habitIndexedDB'
import { updateHabitStreaks } from './lib/streakCalculator'
import { requestNotificationPermission, scheduleHabitReminder } from './lib/webPushReminders'
import WeekStrip from './components/WeekStrip'
import ReminderBanner from './components/ReminderBanner'
import HabitCard from './components/HabitCard'
import MascotAvatar from './components/MascotAvatar'
import NewHabitModal from './components/NewHabitModal'
import InsightsView from './components/InsightsView'
import ReminderModal from './components/ReminderModal'
import './habits.css'

export type HabitView = 'dashboard' | 'insights' | 'new-habit'

interface HabitTrackerAppProps {
  onBackToHome: () => void
  user?: CatalystUser | null
}

export default function HabitTrackerApp({ onBackToHome, user }: HabitTrackerAppProps) {
  const uid = user?.uid || 'guest-user'
  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Budi'

  // View state controller: single-screen application with state-based navigation
  const [activeView, setActiveView] = useState<HabitView>('dashboard')

  // Habit Data States
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey)
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits(uid))
  const [habitLogs, setHabitLogs] = useState<Record<string, string[]>>(() => loadHabitLogs(uid))
  const [isReminderOpen, setIsReminderOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Asynchronously synchronize with IndexedDB on mount
  useEffect(() => {
    let mounted = true
    async function initIndexedDB() {
      try {
        const [storedHabits, storedLogs] = await Promise.all([
          idbGetHabits(uid),
          idbGetLogs(uid),
        ])
        if (mounted) {
          const streakUpdated = updateHabitStreaks(storedHabits, storedLogs)
          setHabits(streakUpdated)
          setHabitLogs(storedLogs)
        }
      } catch (err) {
        console.warn('Falling back to local cache', err)
      }
    }
    initIndexedDB()
    return () => {
      mounted = false
    }
  }, [uid])

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3000)
  }

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return `Morning, ${displayName}`
    if (hour < 17) return `Afternoon, ${displayName}`
    return `Evening, ${displayName}`
  }, [displayName])

  // Format active date string e.g. "Thursday, 10 March, 2025"
  const formattedDate = useMemo(() => {
    try {
      const d = new Date(selectedDate + 'T12:00:00Z')
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d)
    } catch {
      return selectedDate
    }
  }, [selectedDate])

  // Completed IDs for currently selected date
  const completedIdsForDate = useMemo(() => {
    return habitLogs[selectedDate] || []
  }, [habitLogs, selectedDate])

  // Toggle habit completion with streak calculation & IndexedDB persistence
  const handleToggleHabit = (habitId: string) => {
    const currentList = habitLogs[selectedDate] ? [...habitLogs[selectedDate]] : []
    const idx = currentList.indexOf(habitId)
    const isNowCompleted = idx === -1

    if (isNowCompleted) {
      currentList.push(habitId)
    } else {
      currentList.splice(idx, 1)
    }

    const updatedLogs = {
      ...habitLogs,
      [selectedDate]: currentList,
    }

    setHabitLogs(updatedLogs)
    void idbSaveLogs(uid, updatedLogs)

    // Recalculate true streaks
    const updatedHabits = updateHabitStreaks(habits, updatedLogs)
    setHabits(updatedHabits)
    void idbSaveAllHabits(uid, updatedHabits)

    if (isNowCompleted) {
      showToast('🎉 Ritual logged! +50 Points earned')
    }
  }

  // Create new habit
  const handleSaveNewHabit = (
    newHabitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'>,
  ) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      streak: 1,
      bestStreak: 1,
      createdAt: getTodayKey(),
    }

    const updated = [newHabit, ...habits]
    const withStreaks = updateHabitStreaks(updated, habitLogs)
    setHabits(withStreaks)
    void idbSaveAllHabits(uid, withStreaks)

    if (newHabit.hasReminder && newHabit.reminderTime) {
      void requestNotificationPermission()
      scheduleHabitReminder(newHabit.title, newHabit.reminderTime)
    }

    setActiveView('dashboard')
    showToast(`✨ Habit "${newHabit.title}" created!`)
  }

  // Set reminder time
  const handleSaveReminder = (time: string) => {
    void requestNotificationPermission()
    scheduleHabitReminder('Morning Routine Alert', time)
    showToast(`⏰ Morning reminder set for ${time}`)
  }

  // Calculate live statistics & weekly insights
  const stats: HabitStats = useMemo(() => {
    return calculateStats(habits, habitLogs)
  }, [habits, habitLogs])

  const weeklyInsights = useMemo(() => {
    return getWeeklyInsights(habits, habitLogs)
  }, [habits, habitLogs])

  return (
    <div className="habits-app-root">
      {/* Catalyst Suite Topbar */}
      <header className="habit-topbar">
        <button
          type="button"
          onClick={onBackToHome}
          className="habit-back-btn"
          aria-label="Back to Catalyst Home"
        >
          <ChevronLeft size={16} />
          <span>Catalyst</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-orange-400" />
          <span className="habit-topbar-appname">Routine Lab</span>
        </div>

        {/* View Switcher Button in Topbar */}
        {activeView === 'dashboard' ? (
          <button
            type="button"
            onClick={() => setActiveView('insights')}
            className="habit-topbar-insights-btn"
            title="View Progress & Insights"
          >
            <BarChart3 size={14} />
            <span>Insights</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className="habit-topbar-insights-btn"
            title="Back to Dashboard"
          >
            <span>Dashboard</span>
          </button>
        )}
      </header>

      {/* Constrained Single Mobile Screen Container (Constrained width on mobile & desktop) */}
      <main className="habit-device-canvas">
        {/* VIEW 1: Dashboard Main Screen */}
        {activeView === 'dashboard' && (
          <div className="habit-content-scroll animate-fade-in">
            {/* Header: Greeting, Live Date, Mascot Avatar & Analytics Icon */}
            <section className="habit-main-header">
              <div>
                <h1 className="habit-greeting-title">{greeting}</h1>
                <p className="habit-header-date">{formattedDate}</p>
              </div>

              {/* Avatar + Bar Chart Analytics Trigger Group */}
              <div className="habit-header-actions-group">
                <button
                  type="button"
                  onClick={() => setActiveView('insights')}
                  className="habit-header-analytics-btn"
                  title="View Progress and Insights"
                  aria-label="View Progress and Insights"
                >
                  <BarChart3 size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('insights')}
                  className="habit-avatar-btn"
                  title="View Profile and Insights"
                  aria-label="View Profile and Insights"
                >
                  <MascotAvatar />
                </button>
              </div>
            </section>

            {/* Horizontal Calendar Week Strip */}
            <section>
              <WeekStrip
                selectedDate={selectedDate}
                onSelectDate={(newDate) => setSelectedDate(newDate)}
              />
            </section>

            {/* "Set the reminder" Banner Card */}
            <section>
              <ReminderBanner onOpenReminderModal={() => setIsReminderOpen(true)} />
            </section>

            {/* "Daily routine" Section */}
            <section className="habit-routine-section">
              <div className="habit-section-head">
                <h2 className="habit-section-title">Daily routine</h2>
                <button
                  type="button"
                  onClick={() => setActiveView('insights')}
                  className="habit-see-all-btn"
                  aria-label="See all insights"
                >
                  See all
                </button>
              </div>

              {/* Dotted Timeline Checklist of Habits */}
              <div className="habit-timeline-list">
                {habits.map((habit, index) => {
                  const isCompleted = completedIdsForDate.includes(habit.id)
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isCompleted}
                      isFirst={index === 0}
                      isLast={index === habits.length - 1}
                      onToggle={handleToggleHabit}
                      onClickCard={() => setActiveView('insights')}
                    />
                  )
                })}
              </div>
            </section>

            {/* Fixed Floating Action Button (FAB) for New Habit */}
            <button
              type="button"
              onClick={() => setActiveView('new-habit')}
              className="habit-fab-btn"
              aria-label="Add new habit"
              title="Create New Habit"
            >
              <Plus size={26} strokeWidth={2.8} />
            </button>
          </div>
        )}

        {/* VIEW 2: Progress and Insights Screen (Standalone Single View) */}
        {activeView === 'insights' && (
          <InsightsView
            stats={stats}
            insights={weeklyInsights}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {/* VIEW 3: New Habit Modal (Rendered when activeView === 'new-habit') */}
        {activeView === 'new-habit' && (
          <NewHabitModal
            onClose={() => setActiveView('dashboard')}
            onSave={handleSaveNewHabit}
          />
        )}

        {/* Morning Reminder Config Modal */}
        {isReminderOpen && (
          <ReminderModal
            onClose={() => setIsReminderOpen(false)}
            onSaveReminder={handleSaveReminder}
          />
        )}

        {/* Celebratory Points Toast */}
        {toastMessage && (
          <div className="habit-celebrate-toast">
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  )
}
