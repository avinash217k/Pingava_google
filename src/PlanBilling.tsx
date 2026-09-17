import { useState } from 'react'
import {
  Check,
  Sparkles,
  Globe2,
  Clock3,
  X
} from 'lucide-react'
import {
  type User,
  type Monitor,
} from './api'
import './PlanBilling.css'

export function PlanBilling({
  user,
  monitors,
  limit,
}: {
  user: User
  monitors: Monitor[]
  limit: number
  onRefresh?: () => Promise<void>
  onUserChange?: (user: User) => void
}) {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [discountClaimed, setDiscountClaimed] = useState(false)

  const usagePercent = Math.min(100, Math.round((monitors.length / Math.max(limit, 1)) * 100))
  const remainingMonitors = Math.max(0, limit - monitors.length)

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const code = promoCode.trim().toUpperCase()
    if (code === 'LAUNCH' || code === 'STARTUP') {
      setDiscountClaimed(true)
      setToastMessage('Early Adopter Code Accepted: 20% lifetime discount locked in for when paid tiers launch!')
    } else {
      setErrorMessage('Invalid promo code. Try LAUNCH or STARTUP.')
    }
  }

  return (
    <div className="plan-billing-container" id="plan-billing-view">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="alert-message settings-message" role="status">
          <Check size={16} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            aria-label="Dismiss alert"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="form-error" role="alert">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Early Access Hero Banner */}
      <section className="billing-hero-card" id="billing-hero-card">
        <div className="billing-hero-header">
          <div className="billing-hero-title">
            <div className="billing-plan-tag">
              <span className="plan-badge-pill early-access">
                <Sparkles size={13} style={{ marginRight: 6 }} /> Early Access Launch
              </span>
              <span className="billing-renewal-date">
                100% Free · No Credit Card Required
              </span>
            </div>
            <h2>Full Platform Capabilities Unlocked</h2>
            <p>
              Your workspace is currently active under the Pingava Public Early Access program. Enjoy comprehensive synthetic uptime monitoring, multi-region edge inspections, SSL lifecycle tracking, and status pages with zero subscription fees.
            </p>
          </div>
        </div>

        {/* Live Allowance & Capacity Meter */}
        <div className="billing-usage-grid">
          <div className="usage-metric-card">
            <span className="usage-metric-label">Synthetic Monitors</span>
            <span className="usage-metric-value">{monitors.length} / {limit} Used</span>
            <div className="usage-progress-bar">
              <div
                className="usage-progress-fill"
                style={{ width: `${usagePercent}%`, backgroundColor: usagePercent > 80 ? '#f59e0b' : '#10b981' }}
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
              {remainingMonitors > 0 ? `${remainingMonitors} monitor slots available` : 'Allowance limit reached'}
            </span>
          </div>

          <div className="usage-metric-card">
            <span className="usage-metric-label">Check Frequency</span>
            <span className="usage-metric-value">Down to 1 Minute</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Configurable per monitor</span>
          </div>

          <div className="usage-metric-card">
            <span className="usage-metric-label">Global Edge Network</span>
            <span className="usage-metric-value">6 Edge Regions Active</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>US East/West, Europe, Asia-Pacific</span>
          </div>

          <div className="usage-metric-card">
            <span className="usage-metric-label">Status Pages</span>
            <span className="usage-metric-value">Included Free</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Custom domains &amp; CNAME routing</span>
          </div>
        </div>
      </section>

      {/* Paid Tiers & Merchant Aggregator Coming Soon Roadmap Card */}
      <section className="coming-soon-card">
        <div className="coming-soon-header">
          <div className="coming-soon-badge">
            <Clock3 size={15} /> Coming Soon
          </div>
          <h3>Paid Subscriptions &amp; Merchant Billing Integration</h3>
          <p>
            We are currently finalizing our merchant account and payment aggregator compliance to enable automated self-serve billing. When paid plans go live, all early adopters will receive advance notice, grandfathered monitoring benefits, and lifetime launch discounts.
          </p>
        </div>

        <div className="upcoming-tiers-grid">
          <div className="upcoming-tier-box">
            <div className="upcoming-tier-head">
              <h4>Basic Solo</h4>
              <span className="upcoming-status-tag">Coming Soon</span>
            </div>
            <p className="upcoming-tier-summary">Tailored for independent creators, freelancers, and small side apps.</p>
            <ul className="upcoming-tier-features">
              <li><Check size={14} /> 20 Synthetic monitors</li>
              <li><Check size={14} /> 1-minute check frequencies</li>
              <li><Check size={14} /> 3 Multi-region edge nodes</li>
              <li><Check size={14} /> Unlimited public status pages</li>
            </ul>
          </div>

          <div className="upcoming-tier-box highlight">
            <div className="upcoming-tier-head">
              <h4>Pro SRE Suite</h4>
              <span className="upcoming-status-tag highlight">Coming Soon</span>
            </div>
            <p className="upcoming-tier-summary">For production products and teams requiring instant triage.</p>
            <ul className="upcoming-tier-features">
              <li><Check size={14} /> 60 Synthetic monitors</li>
              <li><Check size={14} /> 30-second rapid check interval</li>
              <li><Check size={14} /> 6-Region Edge Inspector (DNS, TLS, TTFB)</li>
              <li><Check size={14} /> Predictive Latency Jitter Radar (P50–P99)</li>
              <li><Check size={14} /> API Contract &amp; Schema Drift Guardian</li>
            </ul>
          </div>

          <div className="upcoming-tier-box">
            <div className="upcoming-tier-head">
              <h4>Team / Enterprise</h4>
              <span className="upcoming-status-tag">Coming Soon</span>
            </div>
            <p className="upcoming-tier-summary">For high-scale engineering organizations with multiple microservices.</p>
            <ul className="upcoming-tier-features">
              <li><Check size={14} /> 250+ Synthetic monitors</li>
              <li><Check size={14} /> 15-second check intervals</li>
              <li><Check size={14} /> Multi-user RBAC &amp; team workspaces</li>
              <li><Check size={14} /> Dedicated private probe clusters &amp; SLA</li>
            </ul>
          </div>
        </div>

        {/* Early Adopter VIP Voucher Box */}
        <div className="early-adopter-voucher-wrap">
          <div className="early-adopter-voucher-info">
            <strong>Have an Early Adopter Launch Code?</strong>
            <p>Enter your launch voucher to lock in a 20% discount on upcoming paid plans once merchant billing is enabled.</p>
          </div>
          {discountClaimed ? (
            <div className="voucher-claimed-badge">
              <Check size={16} /> 20% Early Adopter Discount Locked In ({user.email})
            </div>
          ) : (
            <form onSubmit={applyPromo} className="voucher-input-form">
              <input
                type="text"
                placeholder="e.g. LAUNCH or STARTUP"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                aria-label="Early adopter launch code"
              />
              <button type="submit" className="primary-btn">
                Apply Code
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
