import { useState, useEffect, type ReactNode } from 'react'
import {
  Wifi,
  Signal,
  Maximize2,
  Minimize2,
  Palette,
} from 'lucide-react'
import PWAInstallButton from './PWAInstallButton'
import OfflineIndicator from './OfflineIndicator'
import type { CatalystAppId, WallpaperOption } from '../lib/types'

interface CatalystShellProps {
  currentWallpaper: WallpaperOption
  activeApp: CatalystAppId
  onOpenWallpaper: () => void
  onReturnHome: () => void
  children: ReactNode
}

export default function CatalystShell({
  currentWallpaper,
  activeApp,
  onOpenWallpaper,
  onReturnHome,
  children,
}: CatalystShellProps) {
  const [currentTime, setCurrentTime] = useState('')
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours() % 12 || 12
      const m = String(now.getMinutes()).padStart(2, '0')
      setCurrentTime(`${h}:${m}`)
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      className={`catalyst-os-root ${currentWallpaper.textColor === 'dark' ? 'theme-ink' : 'theme-light'} ${
        isPhoneFrameMode ? 'frame-mode' : 'fluid-mode'
      }`}
      style={{
        background: currentWallpaper.value,
      }}
    >
      <OfflineIndicator />

      {/* Outer Shell Wrapper (allows phone frame on wide displays) */}
      <div className="catalyst-phone-device">
        {/* Dynamic Island / Notch + Status Bar */}
        <header className="catalyst-status-bar" aria-label="System status bar">
          <div className="status-left">
            <span className="status-clock">{currentTime}</span>
            <div className="status-signals">
              <Signal size={12} strokeWidth={2.5} />
              <Wifi size={12} strokeWidth={2.5} />
            </div>
          </div>

          {/* Dynamic Island Pill */}
          <div
            className="catalyst-dynamic-island"
            onClick={activeApp !== 'home' ? onReturnHome : onOpenWallpaper}
            role="button"
            tabIndex={0}
            title={activeApp !== 'home' ? 'Tap to return to Home' : 'Tap for system theme'}
          >
            <div className="camera-lens" />
            <div className="island-indicator">
              <span className="island-dot" />
              <span className="island-text">
                {activeApp === 'home' ? 'Catalyst OS' : activeApp.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="status-right">
            <PWAInstallButton />
            <button
              type="button"
              className="status-wallpaper-btn"
              onClick={onOpenWallpaper}
              title="Change Wallpaper"
              aria-label="Open wallpaper picker"
            >
              <Palette size={13} />
            </button>
            <div className="battery-indicator">
              <span className="battery-pct">98%</span>
              <div className="battery-shell">
                <div className="battery-level" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </header>

        {/* Frame Toggle Button (Floating on larger screens) */}
        <button
          type="button"
          onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
          className="catalyst-frame-toggle-btn"
          title={isPhoneFrameMode ? 'Switch to Fullscreen fluid mode' : 'Switch to Phone Frame preview'}
          aria-label="Toggle phone frame"
        >
          {isPhoneFrameMode ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          <span>{isPhoneFrameMode ? 'Expand' : 'Phone Frame'}</span>
        </button>

        {/* Viewport Content Area */}
        <div className="catalyst-screen-viewport">{children}</div>

        {/* Bottom OS Home Indicator Bar */}
        <div
          className="catalyst-home-bar-zone"
          onClick={onReturnHome}
          title={activeApp !== 'home' ? 'Swipe / Click to go Home' : undefined}
        >
          <div className={`home-indicator-pill ${activeApp !== 'home' ? 'interactive' : ''}`} />
        </div>
      </div>
    </div>
  )
}
