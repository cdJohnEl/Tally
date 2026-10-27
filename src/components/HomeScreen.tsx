import { useState } from 'react'
import {
  FileText,
  Wallet,
  Flame,
  Headphones,
  Palette,
  LogOut,
} from 'lucide-react'
import DynamicWidgets from './DynamicWidgets'
import WeatherWidget from './WeatherWidget'
import type { CatalystAppId, CatalystUser, WallpaperOption } from '../lib/types'

interface HomeScreenProps {
  user: CatalystUser
  currentWallpaper: WallpaperOption
  onLaunchApp: (appId: Exclude<CatalystAppId, 'home'>) => void
  onOpenWallpaperPicker: () => void
  onSignOut: () => void
}

interface AppIconDefinition {
  id: Exclude<CatalystAppId, 'home'>
  title: string
  subtitle: string
  icon: typeof FileText
  badge?: string
  gradient: string
  shadowColor: string
}

const APPS: AppIconDefinition[] = [
  {
    id: 'tally',
    title: 'Tally',
    subtitle: 'Tasks & Notes',
    icon: FileText,
    badge: 'Live',
    gradient: 'linear-gradient(135deg, #336649 0%, #1c3b2a 100%)',
    shadowColor: 'rgba(51, 102, 73, 0.45)',
  },
  {
    id: 'expenses',
    title: 'Expense Ledger',
    subtitle: 'Finance & Budget',
    icon: Wallet,
    badge: 'Phase 1',
    gradient: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.45)',
  },
  {
    id: 'habits',
    title: 'Habit Tracker',
    subtitle: 'Daily Streaks',
    icon: Flame,
    badge: 'Phase 1',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    shadowColor: 'rgba(245, 158, 11, 0.45)',
  },
  {
    id: 'audio',
    title: 'Focus Audio',
    subtitle: 'Sound & Timer',
    icon: Headphones,
    badge: 'Phase 1',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)',
    shadowColor: 'rgba(139, 92, 246, 0.45)',
  },
]

export default function HomeScreen({
  user,
  currentWallpaper: _currentWallpaper,
  onLaunchApp,
  onOpenWallpaperPicker,
  onSignOut,
}: HomeScreenProps) {
  const [pressedId, setPressedId] = useState<string | null>(null)

  const handleAppClick = (appId: Exclude<CatalystAppId, 'home'>) => {
    setPressedId(appId)
    setTimeout(() => {
      setPressedId(null)
      onLaunchApp(appId)
    }, 150)
  }

  return (
    <div className="catalyst-home-screen">
      {/* Top Dynamic Widgets Layer */}
      <section className="home-widgets-container" aria-label="Catalyst Dashboard Widgets">
        <DynamicWidgets user={user} onLaunchApp={onLaunchApp} />
        <WeatherWidget />
      </section>

      {/* Main OS App Grid */}
      <section className="home-apps-section" aria-label="Catalyst Applications">
        <div className="section-header-row">
          <div className="flex items-center gap-2">
            <span className="dot-pulse" />
            <h3 className="section-title">Productivity Suite</h3>
          </div>
          <span className="section-count">{APPS.length} Modules</span>
        </div>

        <div className="home-apps-grid">
          {APPS.map((app) => {
            const Icon = app.icon
            const isPressed = pressedId === app.id
            return (
              <button
                key={app.id}
                type="button"
                className={`app-grid-item ${isPressed ? 'is-pressed' : ''}`}
                onClick={() => handleAppClick(app.id)}
                title={`Launch ${app.title}`}
              >
                <div
                  className="app-icon-squircle"
                  style={{
                    background: app.gradient,
                    boxShadow: `0 10px 24px -4px ${app.shadowColor}`,
                  }}
                >
                  <Icon size={32} className="app-icon-svg" strokeWidth={2.2} />
                  {app.badge && <span className="app-badge">{app.badge}</span>}
                </div>
                <span className="app-title-label">{app.title}</span>
                <span className="app-subtitle-label">{app.subtitle}</span>
              </button>
            )
          })}

          {/* Wallpaper Customizer App Icon */}
          <button
            type="button"
            className="app-grid-item"
            onClick={onOpenWallpaperPicker}
            title="Change Wallpaper & Themes"
          >
            <div
              className="app-icon-squircle wallpaper-app-icon"
              style={{
                background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                boxShadow: '0 10px 24px -4px rgba(71, 85, 105, 0.45)',
              }}
            >
              <Palette size={32} className="app-icon-svg text-indigo-300" strokeWidth={2.2} />
              <span className="app-badge theme-badge">Custom</span>
            </div>
            <span className="app-title-label">Wallpaper</span>
            <span className="app-subtitle-label">Theme & Styles</span>
          </button>
        </div>
      </section>

      {/* Quick OS Bar / Bottom Dock */}
      <footer className="home-dock-container" aria-label="Catalyst Dock">
        <div className="dock-glass-bar">
          {APPS.map((app) => {
            const Icon = app.icon
            return (
              <button
                key={`dock-${app.id}`}
                type="button"
                className="dock-icon-btn"
                onClick={() => onLaunchApp(app.id)}
                title={`Launch ${app.title}`}
              >
                <div
                  className="dock-icon-inner"
                  style={{ background: app.gradient }}
                >
                  <Icon size={20} className="text-white" strokeWidth={2.2} />
                </div>
              </button>
            )
          })}

          <div className="dock-separator" />

          {/* Wallpaper quick trigger */}
          <button
            type="button"
            className="dock-icon-btn"
            onClick={onOpenWallpaperPicker}
            title="Change Wallpaper"
          >
            <div className="dock-icon-inner bg-slate-800 border border-slate-700">
              <Palette size={20} className="text-indigo-400" />
            </div>
          </button>

          {/* Sign Out trigger */}
          <button
            type="button"
            className="dock-icon-btn dock-signout"
            onClick={onSignOut}
            title="Sign out of Catalyst"
          >
            <div className="dock-icon-inner bg-rose-950/40 border border-rose-800/40">
              <LogOut size={18} className="text-rose-400" />
            </div>
          </button>
        </div>
      </footer>
    </div>
  )
}
