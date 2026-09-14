import type { ThemeMode } from './ThemeContext'

export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode
  document.documentElement.dataset.themeMode = mode
  document.documentElement.style.colorScheme = mode
}
