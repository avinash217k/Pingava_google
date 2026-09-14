import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { applyTheme } from './themeUtils'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = ThemeMode | 'system'
const STORAGE_KEY = 'pingava-theme'

function storedTheme(): ThemePreference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch { /* Use the device preference when storage is unavailable. */ }
  return 'system'
}

const ThemeContext = createContext<{ theme: ThemeMode; preference: ThemePreference; setTheme: (mode: ThemePreference) => void }>({ theme: 'light', preference: 'system', setTheme: () => undefined })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(storedTheme)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const theme: ThemeMode = preference === 'system' ? systemDark ? 'dark' : 'light' : preference
  const setTheme = useCallback((mode: ThemePreference) => {
    try { window.localStorage.setItem(STORAGE_KEY, mode) } catch { /* Switching still works for this session. */ }
    setPreference(mode)
    applyTheme(mode === 'system' ? systemDark ? 'dark' : 'light' : mode)
  }, [systemDark])
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => { applyTheme(theme); document.documentElement.dataset.themeMode = preference }, [theme, preference])
  const value = useMemo(() => ({ theme, preference, setTheme }), [theme, preference, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useTheme() { return useContext(ThemeContext) }
