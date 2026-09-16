import mark from './assets/pingava-mark.png'
import markMono from './assets/pingava-mark-mono.png'
import markMonoDark from './assets/pingava-mark-mono-dark.png'
import logoDark from './assets/pingava-logo-dark.png'
import logoLight from './assets/pingava-logo-light.png'
import logoMono from './assets/pingava-logo-mono.png'
import { dashboardUrl } from './appConfig'

export function BrandMark({
  className = '',
  variant = 'color'
}: {
  className?: string
  variant?: 'color' | 'mono' | 'mono-white'
}) {
  if (variant === 'mono') {
    return (
      <span className={`brand-mark brand-mark-mono ${className}`.trim()} aria-hidden="true">
        <img src={markMonoDark} alt="" />
      </span>
    )
  }
  if (variant === 'mono-white') {
    return (
      <span className={`brand-mark brand-mark-mono brand-mark-mono-white ${className}`.trim()} aria-hidden="true">
        <img src={markMono} alt="" />
      </span>
    )
  }
  return <span className={`brand-mark ${className}`.trim()} aria-hidden="true"><img src={mark} alt="" /></span>
}

export function BrandLogo({
  variant = 'auto',
  className = '',
  alt = 'Pingava – Know Before Your Users Do'
}: {
  variant?: 'auto' | 'dark' | 'light' | 'mono'
  className?: string
  alt?: string
}) {
  if (variant === 'light') {
    return <img src={logoLight} alt={alt} className={`brand-logo brand-logo-light ${className}`.trim()} />
  }
  if (variant === 'mono') {
    return <img src={logoMono} alt={alt} className={`brand-logo brand-logo-mono ${className}`.trim()} />
  }
  if (variant === 'dark') {
    return <img src={logoDark} alt={alt} className={`brand-logo brand-logo-dark ${className}`.trim()} />
  }

  // 'auto' responsive theme-aware rendering
  return (
    <span className={`brand-logo-auto ${className}`.trim()}>
      <img src={logoLight} alt={alt} className="logo-for-light" />
      <img src={logoDark} alt={alt} className="logo-for-dark" />
    </span>
  )
}

export function BrandLockup({
  compact = false,
  variant = 'color'
}: {
  compact?: boolean
  variant?: 'color' | 'mono'
}) {
  const className = compact ? 'brand-lockup compact' : 'brand-lockup'
  const content = <><BrandMark variant={variant} /><strong>pingava</strong></>
  const dashboardHost = window.location.hostname === new URL(dashboardUrl).hostname
  return dashboardHost ? <a className={className} href="/overview" aria-label="Pingava overview">{content}</a> : <span className={className}>{content}</span>
}

