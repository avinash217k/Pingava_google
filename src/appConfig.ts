const runtimeValue = (name: string) => document.querySelector<HTMLMetaElement>(`meta[name="pingava-analytics-${name}"]`)?.content.trim()
export const isProdDomain = typeof window !== 'undefined' && window.location.hostname.endsWith('pingava.com')

export const publicUrl = (runtimeValue('public-url') || import.meta.env.VITE_PUBLIC_APP_URL || (!isProdDomain ? (typeof window !== 'undefined' ? window.location.origin : '') : 'https://www.pingava.com')).replace(/\/$/, '')
export const dashboardUrl = (runtimeValue('dashboard-url') || import.meta.env.VITE_DASHBOARD_URL || (!isProdDomain ? (typeof window !== 'undefined' ? window.location.origin : '') : 'https://dashboard.pingava.com')).replace(/\/$/, '')
export const isDashboardHost = isProdDomain && typeof window !== 'undefined' && window.location.hostname === new URL(dashboardUrl).hostname

export const dashboardHref = (path = '/overview') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  if (!isProdDomain) return cleanPath
  return `${dashboardUrl}${cleanPath}`
}

export const publicHref = (path = '/') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  if (!isProdDomain) return cleanPath
  return `${publicUrl}${cleanPath}`
}

export const dashboardPath = /^\/(overview|monitors(?:\/\d+)?|radar|edge-inspector|edge|crons|heartbeats|incidents|status-pages|status-page|alert-channels|settings|owner-admin|observability|meta-guardian)\/?$/

export function safeDashboardReturn(value: string | null): string | null {
  if (!value) return null
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dashboard.pingava.com'
    const target = new URL(value, origin)
    return target.origin === origin && dashboardPath.test(target.pathname) ? (!isProdDomain ? target.pathname : target.toString()) : null
  } catch { return null }
}

export function legacyDashboardPath(pathname: string): string {
  const path = pathname.replace(/^\/app/, '') || '/overview'
  return dashboardPath.test(path) ? path : '/overview'
}

