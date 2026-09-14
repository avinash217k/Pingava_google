import mark from './assets/pingava-mark.png'
import { dashboardUrl } from './appConfig'

export function BrandMark({ className = '' }: { className?: string }) {
  return <span className={`brand-mark ${className}`.trim()} aria-hidden="true"><img src={mark} alt="" /></span>
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  const className = compact ? 'brand-lockup compact' : 'brand-lockup'
  const content = <><BrandMark /><strong>pingava</strong></>
  const dashboardHost = window.location.hostname === new URL(dashboardUrl).hostname
  return dashboardHost ? <a className={className} href="/overview" aria-label="Pingava overview">{content}</a> : <span className={className}>{content}</span>
}
