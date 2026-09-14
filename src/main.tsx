import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installAnalyticsNavigation } from './analyticsClient'
import { ThemeProvider } from './ThemeContext'

installAnalyticsNavigation()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider><App /></ThemeProvider>
  </StrictMode>,
)
