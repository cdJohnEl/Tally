import type { WallpaperOption } from './types'

export const WALLPAPER_PRESETS: WallpaperOption[] = [
  {
    id: 'tally-classic',
    name: 'Paper & Ink (Classic)',
    type: 'gradient',
    value: 'radial-gradient(900px 480px at 12% -8%, rgba(51, 102, 73, 0.06), transparent 62%), radial-gradient(760px 440px at 108% 6%, rgba(179, 117, 23, 0.05), transparent 62%), #f1eee8',
    textColor: 'dark',
    accentColor: '#336649',
    preview: 'linear-gradient(135deg, #e7e2d8, #f1eee8, #ddd8cb)',
  },
  {
    id: 'botanical-sage',
    name: 'Botanical Sage',
    type: 'gradient',
    value: 'radial-gradient(900px 480px at 12% -8%, rgba(51, 102, 73, 0.12), transparent 62%), radial-gradient(760px 440px at 108% 6%, rgba(39, 79, 56, 0.08), transparent 62%), #e9ede7',
    textColor: 'dark',
    accentColor: '#274f38',
    preview: 'linear-gradient(135deg, #dfe5dd, #e9ede7, #d5ded2)',
  },
  {
    id: 'warm-parchment',
    name: 'Warm Parchment',
    type: 'gradient',
    value: 'radial-gradient(900px 480px at 12% -8%, rgba(179, 117, 23, 0.09), transparent 62%), radial-gradient(760px 440px at 108% 6%, rgba(180, 67, 42, 0.06), transparent 62%), #f3efe6',
    textColor: 'dark',
    accentColor: '#b37517',
    preview: 'linear-gradient(135deg, #eee8db, #f3efe6, #e7decb)',
  },
  {
    id: 'mineral-slate',
    name: 'Mineral Slate',
    type: 'gradient',
    value: 'radial-gradient(900px 480px at 12% -8%, rgba(71, 85, 105, 0.08), transparent 62%), radial-gradient(760px 440px at 108% 6%, rgba(51, 65, 85, 0.06), transparent 62%), #e8ebed',
    textColor: 'dark',
    accentColor: '#334155',
    preview: 'linear-gradient(135deg, #dde2e5, #e8ebed, #d2d9dc)',
  },
  {
    id: 'midnight-ink',
    name: 'Midnight Ink (Dark)',
    type: 'gradient',
    value: 'radial-gradient(900px 480px at 12% -8%, rgba(51, 102, 73, 0.18), transparent 62%), radial-gradient(760px 440px at 108% 6%, rgba(179, 117, 23, 0.12), transparent 62%), #1e1d18',
    textColor: 'light',
    accentColor: '#4ade80',
    preview: 'linear-gradient(135deg, #2a2922, #1e1d18, #141310)',
  },
  {
    id: 'kyoto-navy',
    name: 'Kyoto Indigo',
    type: 'gradient',
    value: 'radial-gradient(900px 480px at 12% -8%, rgba(56, 189, 248, 0.12), transparent 62%), radial-gradient(760px 440px at 108% 6%, rgba(99, 102, 241, 0.15), transparent 62%), #171b26',
    textColor: 'light',
    accentColor: '#38bdf8',
    preview: 'linear-gradient(135deg, #23293a, #171b26, #0e111a)',
  },
]

const WALLPAPER_STORAGE_KEY = 'catalyst_active_wallpaper'

export function getSavedWallpaper(): WallpaperOption {
  try {
    const saved = localStorage.getItem(WALLPAPER_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.value) return parsed
    }
  } catch (err) {
    console.error(err)
  }
  return WALLPAPER_PRESETS[0] // default to Classic Paper & Ink
}

export function saveWallpaper(wallpaper: WallpaperOption) {
  try {
    localStorage.setItem(WALLPAPER_STORAGE_KEY, JSON.stringify(wallpaper))
  } catch (err) {
    console.error(err)
  }
}
