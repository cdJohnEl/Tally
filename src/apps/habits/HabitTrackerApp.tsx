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

export type HabitView = 'dashboard' | 'insights' | 'new-habit' | 'showcase'

interface HabitTrackerAppProps {
  onBackToHome: () => void
  user?: CatalystUser | null
}

export default function HabitTrackerApp({ onBackToHome, user }: HabitTrackerAppProps) {
  const uid = user?.uid || 'guest-user'
  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Budi'

  // View state: 'dashboard' (Screen 1) | 'new-habit' (Screen 2) | 'insights' (Screen 3) | 'showcase' (All 3)
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
      showToast('🎉 Routine completed! +50 Points earned')
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

  // Reusable iOS Status Bar
  const renderIOSBar = () => (
    <div className="habit-ios-bar">
      <span className="habit-ios-time">9:41</span>
      <div className="habit-ios-icons">
        <svg width="15" height="11" viewBox="0 0 17 11" fill="currentColor">
          <path d="M1 8h2.5V3H1v5zm4 1.5h2.5V1H5v8.5zm4 1h2.5V0H9v10.5zm4-3.5h2.5V5H13v5z" />
        </svg>
        <svg width="14" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 2.2C5.3 2.2 2.9 3.3 1.1 5L0 3.8C2.1 1.7 5 0.5 8 0.5s5.9 1.2 8 3.3L14.9 5C13.1 3.3 10.7 2.2 8 2.2zM8 5.7c-1.8 0-3.4.7-4.6 1.9l-1.1-1.1c1.5-1.5 3.5-2.3 5.7-2.3s4.2.8 5.7 2.3l-1.1 1.1C11.4 6.4 9.8 5.7 8 5.7zm0 3.5c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8-.8-1.8-1.8-1.8z" />
        </svg>
        <svg width="22" height="11" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
          <path d="M23 4v4c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1z" />
        </svg>
      </div>
    </div>
  )

  // Screen 1: Dashboard Home
  const renderDashboardScreen = () => (
    <div className="habit-phone-frame">
      {renderIOSBar()}
      <div className="habit-screen-body">
        {/* Header: Greeting, Live Date, Mascot Avatar */}
        <section className="habit-home-header">
          <div>
            <h1 className="habit-greeting-text">{greeting}</h1>
            <p className="habit-date-subtext">{formattedDate}</p>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('insights')}
            className="habit-mascot-btn"
            title="View Insights"
            aria-label="View Insights"
          >
            <MascotAvatar />
          </button>
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
        <section className="habit-routine-container">
          <div className="habit-routine-header">
            <h2 className="habit-routine-title">Daily routine</h2>
            <button
              type="button"
              onClick={() => setActiveView('insights')}
              className="habit-see-all-link"
              aria-label="See all insights"
            >
              See all
            </button>
          </div>

          {/* Dotted Timeline Checklist of Habits */}
          <div className="habit-cards-timeline">
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
      </div>

      {/* Floating Action Button (FAB) for New Habit */}
      <button
        type="button"
        onClick={() => setActiveView('new-habit')}
        className="habit-fab"
        aria-label="Add new habit"
        title="Create New Habit"
      >
        <Plus size={26} strokeWidth={2.8} />
      </button>
    </div>
  )

  // Screen 2: New Habit View
  const renderNewHabitScreen = () => (
    <div className="habit-phone-frame">
      {renderIOSBar()}
      <NewHabitModal
        onClose={() => setActiveView('dashboard')}
        onSave={handleSaveNewHabit}
        isPhoneScreen={true}
      />
    </div>
  )

  // Screen 3: Insights View
  const renderInsightsScreen = () => (
    <div className="habit-phone-frame">
      {renderIOSBar()}
      <InsightsView
        stats={stats}
        insights={weeklyInsights}
        onBackToDashboard={() => setActiveView('dashboard')}
      />
    </div>
  )

  return (
    <div className="habits-app-root">
      {/* Catalyst Suite Top Bar */}
      <header className="habit-catalyst-nav">
        <button
          type="button"
          onClick={onBackToHome}
          className="habit-back-pill"
          aria-label="Back to Catalyst Home"
        >
          <ChevronLeft size={16} />
          <span>Catalyst</span>
        </button>

        {/* View Switcher Pills */}
        <div className="habit-view-tabs">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`habit-view-tab ${activeView === 'dashboard' ? 'active' : ''}`}
          >
            Daily Routine
          </button>
          <button
            type="button"
            onClick={() => setActiveView('new-habit')}
            className={`habit-view-tab ${activeView === 'new-habit' ? 'active' : ''}`}
          >
            New Habit
          </button>
          <button
            type="button"
            onClick={() => setActiveView('insights')}
            className={`habit-view-tab ${activeView === 'insights' ? 'active' : ''}`}
          >
            Insights
          </button>
          <button
            type="button"
            onClick={() => setActiveView('showcase')}
            className={`habit-view-tab ${activeView === 'showcase' ? 'active' : ''}`}
          >
            3-Screen Showcase
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {activeView === 'showcase' ? (
          /* Showcase Mode: All 3 Phones Side-by-Side (Matching Reference Mockup!) */
          <div className="habit-showcase-container animate-fade-in">
            {renderDashboardScreen()}
            {renderNewHabitScreen()}
            {renderInsightsScreen()}
          </div>
        ) : (
          /* Focused Single-Phone Mode */
          <div style={{ padding: '12px 16px 40px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            {activeView === 'dashboard' && renderDashboardScreen()}
            {activeView === 'new-habit' && renderNewHabitScreen()}
            {activeView === 'insights' && renderInsightsScreen()}
          </div>
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
          <div className="habit-toast">
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  )
}
