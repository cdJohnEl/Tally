import { useMemo, useState } from 'react'
import {
  FileText,
  Wallet,
  Flame,
  Headphones,
  Palette,
  Download,
} from 'lucide-react'
import DynamicWidgets from './DynamicWidgets'
import WeatherWidget from './WeatherWidget'
import TallyMarks from '../apps/tally/components/TallyMarks'
import { usePWAInstall } from '../lib/usePWAInstall'
import type { CatalystAppId, CatalystUser } from '../lib/types'

interface HomeScreenProps {
  user: CatalystUser
  onLaunchApp: (appId: Exclude<CatalystAppId, 'home'>) => void
  onOpenWallpaperPicker: () => void
  onSignOut: () => void
}

const QUOTES: { text: string; author: string }[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'Either you run the day, or the day runs you.', author: 'Jim Rohn' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
]

function quoteOfTheDay(now: Date) {
  const start = new Date(now.getFullYear(), 0, 0)
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  return QUOTES[day % QUOTES.length]
}

function greetingWord(now: Date): string {
  const h = now.getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function eyebrowFor(now: Date): string {
  const wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(now)
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(now)
  const mo = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(now)
  return `${wd} · ${day} ${mo}`.toUpperCase()
}

interface AppIconItem {
  id: Exclude<CatalystAppId, 'home'>
  name: string
  subtitle: string
  icon: typeof FileText
  gradient: string
  badgeText?: string
  badgeColor?: string
}

const APPS: AppIconItem[] = [
  {
    id: 'tally',
    name: 'Tally',
    subtitle: 'Tasks',
    icon: FileText,
    gradient: 'linear-gradient(135deg, #336649 0%, #274f38 100%)',
    badgeText: 'Active',
    badgeColor: '#274f38',
  },
  {
    id: 'expenses',
    name: 'Pocket Lens',
    subtitle: 'Finance',
    icon: Wallet,
    gradient: 'linear-gradient(135deg, #7047eb 0%, #4c1d95 100%)',
    badgeText: 'Active',
    badgeColor: '#7047eb',
  },
  {
    id: 'habits',
    name: 'Habits',
    subtitle: 'Streaks',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    badgeText: 'Phase 1',
    badgeColor: '#b45309',
  },
  {
    id: 'audio',
    name: 'Focus Audio',
    subtitle: 'Timer',
    icon: Headphones,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    badgeText: 'Phase 1',
    badgeColor: '#4f46e5',
  },
]

export default function HomeScreen({
  user,
  onLaunchApp,
  onOpenWallpaperPicker,
  onSignOut,
}: HomeScreenProps) {
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(now)
  const quote = quoteOfTheDay(now)
  const firstName = user.displayName?.trim().split(/\s+/)[0] ?? 'there'
  const { isInstallable, install } = usePWAInstall()
  const [pressedId, setPressedId] = useState<string | null>(null)

  // Read local tally stats
  const tallyStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(`catalyst_tally_todos_${user.uid}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const done = parsed.filter((t: { done: boolean }) => t.done).length
          return { done, total: parsed.length }
        }
      }
    } catch {
      // fallback
    }
    return { done: 2, total: 3 }
  }, [user.uid])

  const handleLaunch = (appId: Exclude<CatalystAppId, 'home'>) => {
    setPressedId(appId)
    setTimeout(() => {
      setPressedId(null)
      onLaunchApp(appId)
    }, 120)
  }

  return (
    <main className="page catalyst-home-page rise">
      {/* Editorial Masthead */}
      <header className="masthead">
        <div className="masthead-top">
          <span className="brand">
            Catalyst<span className="brand-dot">.</span>
          </span>

          <div className="masthead-user">
            <span className="sync">
              <span className="sync-dot" aria-hidden="true" />
              Suite Online
            </span>

            {isInstallable && (
              <button
                type="button"
                className="signout-btn flex items-center gap-1"
                onClick={install}
                title="Install Catalyst PWA"
              >
                <Download size={11} />
                <span>Install</span>
              </button>
            )}

            <button
              type="button"
              className="signout-btn flex items-center gap-1"
              onClick={onOpenWallpaperPicker}
              title="Change paper theme"
            >
              <Palette size={11} />
              <span>Theme</span>
            </button>

            <button type="button" className="signout-btn" onClick={onSignOut}>
              Sign out
            </button>

            {user.photoURL ? (
              <img
                className="avatar"
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="avatar avatar-fallback" aria-hidden="true">
                {firstName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Masthead Grid with Greeting & Tally Marks */}
        <div className="masthead-grid">
          <div>
            <p className="masthead-greet">
              Good {greetingWord(now)}, <strong>{firstName}</strong>.
            </p>
            <p className="eyebrow">
              {eyebrowFor(now)} — <em>{tallyStats.done} tallies today</em>
            </p>
            <h1>{weekday}</h1>
            <p className="masthead-quote">
              “{quote.text}” <span className="quote-author">— {quote.author}</span>
            </p>
            <p className="masthead-sub">
              Catalyst Productivity Suite — tap an application icon below to launch.
            </p>
          </div>
          <TallyMarks done={tallyStats.done} total={tallyStats.total} />
        </div>
      </header>

      {/* Dynamic Paper Widgets Dispatch (Time & Weather) */}
      <section className="catalyst-dispatches-grid" aria-label="Live dispatches">
        <DynamicWidgets />
        <WeatherWidget />
      </section>

      {/* Applications Grid: Tactile App Icons on Paper */}
      <section className="catalyst-app-icons-shelf" aria-label="Applications launcher">
        <div className="shelf-header">
          <div className="flex items-center gap-2">
            <span className="shelf-dot" />
            <span className="shelf-title">APPLICATION LAUNCHER</span>
          </div>
          <span className="shelf-count">{APPS.length} Modules</span>
        </div>

        <div className="catalyst-icons-grid">
          {APPS.map((app) => {
            const Icon = app.icon
            const isPressed = pressedId === app.id
            const isTally = app.id === 'tally'

            return (
              <button
                key={app.id}
                type="button"
                className={`paper-app-icon-item ${isPressed ? 'is-pressed' : ''}`}
                onClick={() => handleLaunch(app.id)}
                title={`Launch ${app.name}`}
              >
                <div
                  className="icon-squircle-box"
                  style={{ background: app.gradient }}
                >
                  <Icon size={28} className="icon-svg-glyph" strokeWidth={2.2} />
                  {isTally ? (
                    <span className="icon-notify-badge" title={`${tallyStats.total - tallyStats.done} open tasks`}>
                      {tallyStats.total - tallyStats.done}
                    </span>
                  ) : (
                    app.badgeText && <span className="icon-tiny-chip">{app.badgeText}</span>
                  )}
                </div>

                <div className="icon-labels-col">
                  <span className="icon-app-name">{app.name}</span>
                  <span className="icon-app-sub">{app.subtitle}</span>
                </div>
              </button>
            )
          })}

          {/* Wallpaper / Theme App Icon */}
          <button
            type="button"
            className="paper-app-icon-item"
            onClick={onOpenWallpaperPicker}
            title="Open Paper & Theme Swatches"
          >
            <div
              className="icon-squircle-box theme-squircle"
              style={{
                background: 'linear-gradient(135deg, #57534e 0%, #292524 100%)',
              }}
            >
              <Palette size={28} className="icon-svg-glyph text-amber-200" strokeWidth={2.2} />
              <span className="icon-tiny-chip">Paper</span>
            </div>

            <div className="icon-labels-col">
              <span className="icon-app-name">Themes</span>
              <span className="icon-app-sub">Swatches</span>
            </div>
          </button>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="catalyst-editorial-footer">
        <div className="footer-meta-row">
          <span className="footer-tagline">
            Catalyst — an integrated PWA productivity suite.
          </span>
          <div className="footer-actions">
            <button
              type="button"
              className="footer-btn"
              onClick={onOpenWallpaperPicker}
            >
              Paper & Theme
            </button>
            <span className="footer-dot">·</span>
            <button type="button" className="footer-btn" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}
