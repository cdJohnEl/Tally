import type { ReactNode } from 'react'
import OfflineIndicator from './OfflineIndicator'
import type { WallpaperOption } from '../lib/types'

interface CatalystShellProps {
  currentWallpaper: WallpaperOption
  children: ReactNode
}

export default function CatalystShell({
  currentWallpaper,
  children,
}: CatalystShellProps) {
  return (
    <div
      className={`catalyst-shell-wrapper ${
        currentWallpaper.textColor === 'light' ? 'mode-dark' : 'mode-paper'
      }`}
      style={{
        background: currentWallpaper.value,
        minHeight: '100dvh',
      }}
    >
      <OfflineIndicator />
      {children}
    </div>
  )
}
