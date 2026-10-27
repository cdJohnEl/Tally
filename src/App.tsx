import { useEffect, useState } from 'react'
import Setup from './components/Setup'
import SignIn from './components/SignIn'
import CatalystShell from './components/CatalystShell'
import HomeScreen from './components/HomeScreen'
import AppTransition from './components/AppTransition'
import WallpaperPicker from './components/WallpaperPicker'

// Encapsulated Apps
import TallyApp from './apps/tally/TallyApp'
import ExpenseLedgerApp from './apps/expenses/ExpenseLedgerApp'
import HabitTrackerApp from './apps/habits/HabitTrackerApp'
import FocusAudioApp from './apps/audio/FocusAudioApp'

import { firebaseReady, watchAuth, signOutUser, type AuthState } from './lib/firebase'
import { getSavedWallpaper, saveWallpaper } from './lib/wallpapers'
import type { CatalystAppId, CatalystUser, WallpaperOption } from './lib/types'

const GUEST_STORAGE_KEY = 'catalyst_guest_session'

export default function App() {
  const [guestUser, setGuestUser] = useState<CatalystUser | null>(() => {
    try {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // If Firebase is not configured and not in guest mode, show Setup with option to launch Demo
  if (!firebaseReady && !guestUser) {
    return (
      <Setup
        onEnterDemo={() => {
          const guest: CatalystUser = {
            uid: 'guest-user',
            displayName: 'Alex Mercer',
            email: 'guest@catalyst.os',
            photoURL: null,
            isGuest: true,
          }
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest))
          setGuestUser(guest)
        }}
      />
    )
  }

  return (
    <AuthGate
      guestUser={guestUser}
      onEnterGuestMode={() => {
        const guest: CatalystUser = {
          uid: 'guest-user',
          displayName: 'Alex Mercer',
          email: 'guest@catalyst.os',
          photoURL: null,
          isGuest: true,
        }
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest))
        setGuestUser(guest)
      }}
      onClearGuest={() => {
        localStorage.removeItem(GUEST_STORAGE_KEY)
        setGuestUser(null)
      }}
    />
  )
}

function AuthGate({
  guestUser,
  onEnterGuestMode,
  onClearGuest,
}: {
  guestUser: CatalystUser | null
  onEnterGuestMode: () => void
  onClearGuest: () => void
}) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'connecting' })

  useEffect(() => {
    if (!firebaseReady) {
      setAuthState({ status: 'signed-out' })
      return
    }
    return watchAuth(setAuthState)
  }, [])

  // If user activated Guest Demo session
  if (guestUser) {
    return (
      <CatalystAppSuite
        user={guestUser}
        onSignOut={() => {
          onClearGuest()
          void signOutUser()
        }}
      />
    )
  }

  if (authState.status === 'connecting') {
    return (
      <main className="page setup">
        <div className="masthead-top">
          <span className="brand">
            Catalyst<span className="brand-dot">.</span>
          </span>
          <span className="sync">
            <span className="sync-dot animate-pulse" />
            Connecting OS
          </span>
        </div>
        <div className="setup-card rise">
          <div className="setup-inner text-center py-12">
            <h2 className="text-xl font-medium text-slate-800 mb-2">Starting Catalyst Suite…</h2>
            <p className="text-sm text-slate-500">Checking credentials and workspace storage</p>
          </div>
        </div>
      </main>
    )
  }

  if (authState.status === 'signed-out') {
    return <SignIn onGuestSignIn={onEnterGuestMode} />
  }

  // Real Firebase User authenticated
  const catalystUser: CatalystUser = {
    uid: authState.user.uid,
    displayName: authState.user.displayName,
    email: authState.user.email,
    photoURL: authState.user.photoURL,
  }

  return (
    <CatalystAppSuite
      user={catalystUser}
      onSignOut={() => {
        onClearGuest()
        void signOutUser()
      }}
    />
  )
}

function CatalystAppSuite({
  user,
  onSignOut,
}: {
  user: CatalystUser
  onSignOut: () => void
}) {
  const [activeApp, setActiveApp] = useState<CatalystAppId>('home')
  const [transitioningToApp, setTransitioningToApp] = useState<CatalystAppId | null>(null)
  const [wallpaper, setWallpaper] = useState<WallpaperOption>(getSavedWallpaper)
  const [isWallpaperPickerOpen, setIsWallpaperPickerOpen] = useState(false)

  const handleLaunchApp = (appId: Exclude<CatalystAppId, 'home'>) => {
    setTransitioningToApp(appId)
  }

  const handleTransitionComplete = () => {
    if (transitioningToApp) {
      setActiveApp(transitioningToApp)
      setTransitioningToApp(null)
    }
  }

  const handleReturnHome = () => {
    setActiveApp('home')
  }

  return (
    <CatalystShell
      currentWallpaper={wallpaper}
      activeApp={activeApp}
      onOpenWallpaper={() => setIsWallpaperPickerOpen(true)}
      onReturnHome={handleReturnHome}
    >
      {/* OS Home Screen */}
      {activeApp === 'home' && (
        <HomeScreen
          user={user}
          currentWallpaper={wallpaper}
          onLaunchApp={handleLaunchApp}
          onOpenWallpaperPicker={() => setIsWallpaperPickerOpen(true)}
          onSignOut={onSignOut}
        />
      )}

      {/* Encapsulated Tally App */}
      {activeApp === 'tally' && (
        <TallyApp user={user} onBackToHome={handleReturnHome} />
      )}

      {/* Expense Ledger Placeholder */}
      {activeApp === 'expenses' && (
        <ExpenseLedgerApp onBackToHome={handleReturnHome} />
      )}

      {/* Habit Tracker Placeholder */}
      {activeApp === 'habits' && (
        <HabitTrackerApp onBackToHome={handleReturnHome} />
      )}

      {/* Focus Audio Placeholder */}
      {activeApp === 'audio' && (
        <FocusAudioApp onBackToHome={handleReturnHome} />
      )}

      {/* Animated Loading Transition Screen */}
      {transitioningToApp && (
        <AppTransition
          appId={transitioningToApp}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Wallpaper Picker Modal */}
      {isWallpaperPickerOpen && (
        <WallpaperPicker
          currentWallpaper={wallpaper}
          onSelectWallpaper={(newWp) => {
            setWallpaper(newWp)
            saveWallpaper(newWp)
          }}
          onClose={() => setIsWallpaperPickerOpen(false)}
        />
      )}
    </CatalystShell>
  )
}
