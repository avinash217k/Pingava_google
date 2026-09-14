import { useEffect, useState } from 'react'
import {
  Check,
  Zap,
  CreditCard,
  ShieldCheck,
  Layers,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Receipt,
  Download,
  X,
  Lock,
  Globe,
  Activity,
  Award
} from 'lucide-react'
import {
  api,
  userFacingError,
  type User,
  type Monitor,
  type PlanTier,
  type BillingCycle,
  type PlanDefinition,
  type SubscriptionData,
  type Invoice,
} from './api'
import './PlanBilling.css'

const DEFAULT_PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free Community',
    tagline: 'Essential synthetic checks for personal projects & hobby sites',
    price_monthly: 0,
    price_annually_monthly: 0,
    monitor_limit: 5,
    check_interval_seconds: 300,
    edge_regions_count: 1,
    status_pages_limit: 1,
    retention_days: 1,
    features: [
      '5 HTTP / HTTPS synthetic monitors',
      '5-minute check frequency',
      'Email & Webhook notifications',
      '1 Public status page',
      '24-hour check logs & history',
      'Single edge probe (US East)'
    ],
    competitor_comparison: {
      competitor: 'UptimeRobot Free',
      competitor_price: '$0 (5-10 min)',
      competitor_monitors: '5 monitors',
      savings: 'Standard entry level'
    }
  },
  {
    id: 'solo',
    name: 'Basic Solo',
    tagline: 'Reliable uptime & latency tracking for freelancers and solo creators',
    price_monthly: 9,
    price_annually_monthly: 7,
    monitor_limit: 20,
    check_interval_seconds: 60,
    edge_regions_count: 3,
    status_pages_limit: -1,
    retention_days: 30,
    features: [
      '20 HTTP / HTTPS monitors (vs 10 at competitors)',
      '1-minute high-frequency checks',
      '3 Multi-region edge nodes (US East, US West, Europe Central)',
      'Latency jitter & silent degradation detection',
      'Unlimited public status pages with custom subdomain',
      '30-day telemetry & transaction logs',
      'Deduplicated email & instant webhook alerts'
    ],
    competitor_comparison: {
      competitor: 'UptimeRobot Solo ($8-$9) / Pingdom ($15)',
      competitor_price: '$8 - $15 / mo',
      competitor_monitors: 'Only 10 monitors',
      savings: '50% cheaper per monitor than UptimeRobot, 70% cheaper than Pingdom'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Comprehensive SRE toolkit with edge inspection, contract guardian & AI diagnostics',
    badge: 'Most Popular',
    highlight: true,
    price_monthly: 15,
    price_annually_monthly: 12,
    monitor_limit: 60,
    check_interval_seconds: 30,
    edge_regions_count: 6,
    status_pages_limit: -1,
    retention_days: 90,
    features: [
      '60 Monitors (BetterStack charges $29 for only 50)',
      '30-second high-speed check interval',
      'Global 6-Region Edge Inspector (DNS, TLS, TTFB waterfall)',
      'API Contract & Schema Drift Guardian with breaking change alerts',
      'Predictive Latency Anomaly Radar with P50-P99 analytics & time-to-outage forecasting',
      'AI Root Cause Diagnostics & automated post-mortems',
      'Custom Status Pages with custom domains & SSL',
      '90-day telemetry retention',
      'Multi-channel alerts (Email, Webhook, Slack, Discord, PagerDuty)'
    ],
    competitor_comparison: {
      competitor: 'Better Uptime ($29/mo) / Pingdom ($45/mo)',
      competitor_price: '$29 - $45 / mo',
      competitor_monitors: '50 monitors (3 min checks)',
      savings: 'Save $168 - $360/year with 30s checks, AI diagnostics & Contract Guardian'
    }
  },
  {
    id: 'team',
    name: 'Team & Scale',
    tagline: 'High-volume synthetic monitoring and incident response for engineering teams',
    price_monthly: 29,
    price_annually_monthly: 24,
    monitor_limit: 200,
    check_interval_seconds: 15,
    edge_regions_count: 6,
    status_pages_limit: -1,
    retention_days: 365,
    features: [
      '200 Monitors (Competitors charge $64-$85/mo for 100)',
      '15-second ultra-fast checks',
      'Unlimited team members & role-based permissions',
      'Dedicated global edge probes & auto-remediation triggers',
      'Private / Password-protected Status Pages with SSO',
      '1-year telemetry retention',
      '99.99% SLA guarantee & 24/7 Priority support'
    ],
    competitor_comparison: {
      competitor: 'Better Uptime Team ($85/mo) / Datadog ($80+/mo)',
      competitor_price: '$85 / mo',
      competitor_monitors: '100 monitors',
      savings: 'Save over $670/year — over 65% less than Better Stack Team with 2x capacity'
    }
  }
]

const DEFAULT_MATRIX = [
  {
    feature: 'Monthly Price',
    pingava_solo: '$9 / mo',
    pingava_pro: '$15 / mo',
    better_uptime: '$29 / mo (Freelancer)',
    pingdom: '$45 / mo (Standard 50)',
    uptimerobot: '$34 / mo (Team 50)'
  },
  {
    feature: 'Included Monitors',
    pingava_solo: '20 monitors',
    pingava_pro: '60 monitors',
    better_uptime: '50 monitors',
    pingdom: '50 monitors',
    uptimerobot: '50 monitors'
  },
  {
    feature: 'Cost per Monitor',
    pingava_solo: '$0.45 / mon',
    pingava_pro: '$0.25 / mon (Lowest in Industry)',
    better_uptime: '$0.58 / mon (2.3x higher)',
    pingdom: '$0.90 / mon (3.6x higher)',
    uptimerobot: '$0.68 / mon (2.7x higher)'
  },
  {
    feature: 'Fastest Check Interval',
    pingava_solo: '60 seconds',
    pingava_pro: '30 seconds',
    better_uptime: '3 minutes (30s requires $85/mo)',
    pingdom: '60 seconds',
    uptimerobot: '60 seconds'
  },
  {
    feature: 'Global Edge Nodes',
    pingava_solo: '3 Edge Locations',
    pingava_pro: '6 Global PoPs',
    better_uptime: 'Limited locations',
    pingdom: 'Standard locations',
    uptimerobot: 'Standard'
  },
  {
    feature: 'API Schema Drift Guardian',
    pingava_solo: 'No',
    pingava_pro: 'Included (Auto-inferred)',
    better_uptime: 'Not available',
    pingdom: 'Not available',
    uptimerobot: 'Not available'
  },
  {
    feature: 'Silent Degradation & Latency Radar',
    pingava_solo: 'Jitter detection',
    pingava_pro: 'Included (P50-P99 & drift forecast)',
    better_uptime: 'Threshold only',
    pingdom: 'Threshold only',
    uptimerobot: 'Threshold only'
  },
  {
    feature: 'AI Root Cause Diagnostics (Gemini)',
    pingava_solo: 'No',
    pingava_pro: 'Included (Autonomous RCA)',
    better_uptime: 'Not available',
    pingdom: 'Not available',
    uptimerobot: 'Not available'
  },
  {
    feature: 'Public Status Pages',
    pingava_solo: 'Unlimited + Subdomain',
    pingava_pro: 'Unlimited + Custom Domain & SSL',
    better_uptime: '1 included ($19/mo per extra)',
    pingdom: '1 included',
    uptimerobot: 'Limited'
  },
  {
    feature: 'Telemetry & Logs Retention',
    pingava_solo: '30 days',
    pingava_pro: '90 days',
    better_uptime: '30 days',
    pingdom: '30 days',
    uptimerobot: '60 days'
  }
]

export function PlanBilling({
  user,
  monitors,
  limit,
  onRefresh,
  onUserChange
}: {
  user: User
  monitors: Monitor[]
  limit: number
  onRefresh: () => Promise<void>
  onUserChange?: (user: User) => void
}) {
  const [plans, setPlans] = useState<PlanDefinition[]>(DEFAULT_PLANS)
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(user.billing_cycle || 'monthly')
  const [checkoutPlan, setCheckoutPlan] = useState<PlanDefinition | null>(null)
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Test checkout form state
  const [cardholderName, setCardholderName] = useState(user.name || 'Avinash K')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [cardExp, setCardExp] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('123')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)

  const currentPlanId: PlanTier = user.plan || (subscription?.plan as PlanTier) || 'pro'
  const activePlanDef = plans.find(p => p.id === currentPlanId) || plans[2]

  const usagePercent = Math.min(100, Math.round((monitors.length / Math.max(limit, 1)) * 100))
  const remainingMonitors = Math.max(0, limit - monitors.length)

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.allSettled([
        api<{ plans: PlanDefinition[]; competitor_matrix: typeof DEFAULT_MATRIX }>('/billing/plans'),
        api<SubscriptionData>('/billing/subscription')
      ])

      if (plansRes.status === 'fulfilled' && plansRes.value.plans) {
        setPlans(plansRes.value.plans)
        if (plansRes.value.competitor_matrix) {
          setMatrix(plansRes.value.competitor_matrix)
        }
      }

      if (subRes.status === 'fulfilled' && subRes.value) {
        setSubscription(subRes.value)
        if (subRes.value.billing_cycle) {
          setBillingCycle(subRes.value.billing_cycle)
        }
      }
    } catch {
      // Use built-in defaults
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.trim().toUpperCase() === 'LAUNCH' || promoCode.trim().toUpperCase() === 'STARTUP') {
      setPromoDiscount(20)
      setToastMessage('Promo code applied: 20% discount!')
    } else {
      setErrorMessage('Invalid promo code. Try LAUNCH or STARTUP.')
    }
  }

  const handlePlanUpgrade = async (plan: PlanDefinition) => {
    setErrorMessage(null)
    setSaving(true)
    try {
      const expParts = cardExp.split('/')
      const payload = {
        plan: plan.id,
        billing_cycle: billingCycle,
        payment_method: {
          cardholder_name: cardholderName,
          card_number: cardNumber,
          exp_month: parseInt(expParts[0], 10) || 12,
          exp_year: parseInt(expParts[1], 10) || 28,
        }
      }

      const res = await api<{ success: boolean; message: string; user: User; limit: number }>('/billing/plan', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      setToastMessage(res.message || `Successfully activated ${plan.name}`)
      setCheckoutPlan(null)
      if (res.user && onUserChange) {
        onUserChange(res.user)
      }
      await onRefresh()
      await loadData()
    } catch (err) {
      setErrorMessage(userFacingError(err, 'Failed to update subscription. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const formatRenewalDate = (dateStr?: string) => {
    if (!dateStr) return 'Next billing date: In 30 days'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="plan-billing-container" id="plan-billing-view">
      {/* Toast and Error Notifications */}
      {toastMessage && (
        <div className="alert-message settings-message" role="status">
          <Check size={16} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="form-error" role="alert">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Active Plan & Monitor Allowance Card */}
      <section className="billing-hero-card" id="billing-hero-card">
        <div className="billing-hero-header">
          <div className="billing-hero-title">
            <div className="billing-plan-tag">
              <span className={`plan-badge-pill ${currentPlanId}`}>{activePlanDef.name}</span>
              <span className="plan-status-pill">Active</span>
            </div>
            <h2>{activePlanDef.name} Plan</h2>
            <p>
              {billingCycle === 'annually' ? 'Billed annually' : 'Billed monthly'} &bull; Renews on{' '}
              <strong>{formatRenewalDate(subscription?.subscription_renews_at || user.subscription_renews_at)}</strong>
            </p>
          </div>

          <div className="billing-hero-actions">
            {currentPlanId !== 'team' && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  const target = currentPlanId === 'free' ? plans.find(p => p.id === 'solo') : plans.find(p => p.id === 'pro')
                  setCheckoutPlan(target || plans[2])
                }}
              >
                <Zap size={16} />
                {currentPlanId === 'free' ? 'Upgrade to Solo ($9)' : 'Upgrade Plan'}
              </button>
            )}
          </div>
        </div>

        {/* Live Workspace Usage Metrics */}
        <div className="billing-usage-grid">
          <div className="usage-metric-card">
            <span className="usage-metric-label">Monitors Used</span>
            <span className="usage-metric-value">
              {monitors.length} of {limit} monitors ({remainingMonitors} remaining)
            </span>
            <div className="usage-progress-bar">
              <div
                className={`usage-progress-fill ${usagePercent > 90 ? 'full' : usagePercent > 70 ? 'warning' : ''}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          <div className="usage-metric-card">
            <span className="usage-metric-label">Check Frequency</span>
            <span className="usage-metric-value">
              {activePlanDef.check_interval_seconds >= 60
                ? `${Math.round(activePlanDef.check_interval_seconds / 60)} min checks`
                : `${activePlanDef.check_interval_seconds}s high-speed`}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Ultra-fast synthetic checks</span>
          </div>

          <div className="usage-metric-card">
            <span className="usage-metric-label">Edge Probing</span>
            <span className="usage-metric-value">{activePlanDef.edge_regions_count} Global PoPs</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>US, Europe, and Asia nodes</span>
          </div>

          <div className="usage-metric-card">
            <span className="usage-metric-label">Telemetry Retention</span>
            <span className="usage-metric-value">{activePlanDef.retention_days} Days</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Transaction &amp; DNS logs</span>
          </div>
        </div>
      </section>

      {/* Monthly vs Annual Switcher */}
      <div className="billing-cycle-switch-wrapper" id="billing-cycle-switcher">
        <div className="billing-cycle-switch" role="group" aria-label="Billing cycle">
          <button
            type="button"
            className={`cycle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className={`cycle-btn ${billingCycle === 'annually' ? 'active' : ''}`}
            onClick={() => setBillingCycle('annually')}
          >
            Annual Billing
          </button>
        </div>
        <span className="annual-discount-pill">
          <Sparkles size={12} />
          Save up to 22% (2 Months Free)
        </span>
      </div>

      {/* 4 Plan Cards */}
      <div className="plan-cards-grid" id="plan-selection-cards">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlanId
          const price = billingCycle === 'annually' ? plan.price_annually_monthly : plan.price_monthly
          const annualTotal = plan.price_annually_monthly * 12

          return (
            <article
              key={plan.id}
              className={`plan-card-item ${plan.highlight ? 'highlighted' : ''}`}
              id={`plan-card-${plan.id}`}
            >
              {plan.badge && <div className="plan-popular-ribbon">{plan.badge}</div>}

              <header className="plan-card-header">
                <h3>{plan.name}</h3>
                <p>{plan.tagline}</p>
              </header>

              <div className="plan-pricing-block">
                <span className="price-currency">$</span>
                <span className="price-number">{price}</span>
                <span className="price-period">/ month</span>
              </div>

              {billingCycle === 'annually' && plan.price_monthly > 0 && (
                <div className="price-annual-subtext">
                  ${annualTotal} billed annually (save ${(plan.price_monthly - plan.price_annually_monthly) * 12}/yr)
                </div>
              )}

              {isCurrent ? (
                <button type="button" className="plan-action-btn current" disabled>
                  <Check size={16} />
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  className={`plan-action-btn ${plan.highlight || plan.id === 'pro' || plan.id === 'solo' ? 'primary' : 'secondary'}`}
                  onClick={() => setCheckoutPlan(plan)}
                >
                  {plan.price_monthly === 0
                    ? 'Downgrade to Free'
                    : plan.id === 'pro'
                    ? 'Upgrade to Pro'
                    : `Switch to ${plan.name}`}
                  <ArrowRight size={14} />
                </button>
              )}

              <ul className="plan-features-list">
                {plan.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={15} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {plan.competitor_comparison && (
                <div className="plan-competitor-note">
                  <div>vs. {plan.competitor_comparison.competitor}:</div>
                  <strong>{plan.competitor_comparison.savings}</strong>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* Competitor Price & Feature Comparison Matrix */}
      <section className="competitor-matrix-section" id="competitor-matrix-table">
        <header className="competitor-matrix-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Award size={20} color="#2563eb" />
            <h3>Competitor Price &amp; Value Benchmark</h3>
          </div>
          <p>
            Why engineers switch to Pingava: More advanced synthetic telemetry and automated root cause analysis at less than half the price of legacy tools.
          </p>
        </header>

        <table className="matrix-table" aria-label="Competitor comparison">
          <thead>
            <tr>
              <th>Capability</th>
              <th style={{ background: '#f8fafc' }}>Pingava Solo</th>
              <th className="col-highlight">Pingava Pro (Recommended)</th>
              <th>Better Uptime</th>
              <th>Pingdom</th>
              <th>UptimeRobot</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td>
                  <strong>{row.feature}</strong>
                </td>
                <td style={{ background: '#fafbfc' }}>{row.pingava_solo}</td>
                <td className="col-highlight">
                  {row.pingava_pro}
                  {row.feature.includes('Guardian') || row.feature.includes('Radar') || row.feature.includes('Root Cause') ? (
                    <span className="matrix-badge-exclusive">EXCLUSIVE</span>
                  ) : null}
                </td>
                <td>{row.better_uptime}</td>
                <td>{row.pingdom}</td>
                <td>{row.uptimerobot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Invoices & Payment Method Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Payment Method Card */}
        <section className="invoices-section" id="payment-method-card">
          <header className="invoices-header">
            <h3>Payment Method</h3>
            <span className="plan-status-pill">Active</span>
          </header>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
            <div
              style={{
                width: 46,
                height: 32,
                borderRadius: 6,
                background: '#1e293b',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12
              }}
            >
              VISA
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>
                {subscription?.payment_method?.brand || 'Visa'} ending in{' '}
                {subscription?.payment_method?.last4 || '4242'}
              </strong>
              <small style={{ color: 'var(--muted-foreground)' }}>
                Expires {subscription?.payment_method?.exp_month || 12}/{subscription?.payment_method?.exp_year || 2028} &bull; Cardholder:{' '}
                {subscription?.payment_method?.cardholder_name || user.name}
              </small>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted-foreground)' }}>
            Payment integration gateway abstraction active. Ready for production Stripe or Paddle webhooks.
          </div>
        </section>

        {/* Invoices & Receipts */}
        <section className="invoices-section" id="invoices-history-card">
          <header className="invoices-header">
            <h3>Billing History &amp; Receipts</h3>
          </header>

          {subscription?.invoices && subscription.invoices.length > 0 ? (
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {subscription.invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                    <td>
                      <strong>{inv.invoice_number}</strong>
                    </td>
                    <td>${inv.amount_usd.toFixed(2)}</td>
                    <td>
                      <span className="plan-status-pill">Paid</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => setReceiptInvoice(inv)}
                      >
                        <Receipt size={12} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: 'var(--muted-foreground)', fontSize: 13, padding: '16px 0' }}>
              No billing receipts found. Invoices are generated upon plan subscription.
            </div>
          )}
        </section>
      </div>

      {/* Simulated Checkout & Upgrade Modal */}
      {checkoutPlan && (
        <div className="checkout-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <div className="checkout-modal">
            <header className="checkout-modal-header">
              <div>
                <h3 id="checkout-title">
                  {checkoutPlan.price_monthly > (activePlanDef.price_monthly || 0)
                    ? `Upgrade to ${checkoutPlan.name}`
                    : `Switch to ${checkoutPlan.name}`}
                </h3>
                <p>Confirm your plan details and billing schedule</p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutPlan(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            {/* Sandbox Notice Banner */}
            <div className="sandbox-notice-banner">
              <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Sandbox Test Mode Active:</strong> Payment API integration hook is pre-configured. No actual card charge will occur. You can test instant plan activation and allowance adjustments right now.
              </div>
            </div>

            {/* Order Summary */}
            <div className="checkout-summary-box">
              <div className="checkout-summary-row">
                <span>Selected Plan</span>
                <strong>{checkoutPlan.name}</strong>
              </div>
              <div className="checkout-summary-row">
                <span>Billing Interval</span>
                <span>{billingCycle === 'annually' ? 'Annually (Save ~20%)' : 'Monthly'}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Monitor Allowance</span>
                <strong>{checkoutPlan.monitor_limit} Monitors</strong>
              </div>
              <div className="checkout-summary-row">
                <span>Check Frequency</span>
                <span>{checkoutPlan.check_interval_seconds}s</span>
              </div>
              {promoDiscount > 0 && (
                <div className="checkout-summary-row" style={{ color: '#16a34a' }}>
                  <span>Promo Discount ({promoDiscount}%)</span>
                  <span>-${(((billingCycle === 'annually' ? checkoutPlan.price_annually_monthly * 12 : checkoutPlan.price_monthly) * promoDiscount) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="checkout-summary-row total">
                <span>Total Due Today</span>
                <span>
                  $
                  {(
                    (billingCycle === 'annually' ? checkoutPlan.price_annually_monthly * 12 : checkoutPlan.price_monthly) *
                    (1 - promoDiscount / 100)
                  ).toFixed(2)}{' '}
                  USD
                </span>
              </div>
            </div>

            {/* Card Information Form */}
            {checkoutPlan.price_monthly > 0 && (
              <form
                className="checkout-payment-form"
                onSubmit={e => {
                  e.preventDefault()
                  void handlePlanUpgrade(checkoutPlan)
                }}
              >
                <label>
                  Cardholder Name
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={e => setCardholderName(e.target.value)}
                  />
                </label>

                <label>
                  Card Number
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                  />
                </label>

                <div className="checkout-row-2">
                  <label>
                    Expiration (MM/YY)
                    <input
                      type="text"
                      required
                      value={cardExp}
                      onChange={e => setCardExp(e.target.value)}
                    />
                  </label>
                  <label>
                    CVC
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '6px', marginBottom: '8px' }}>
                  <label style={{ flex: 1, margin: 0 }}>
                    Promo / Coupon Code
                    <input
                      type="text"
                      placeholder="e.g. LAUNCH or STARTUP"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={applyPromo}
                    style={{ height: '36px', whiteSpace: 'nowrap', fontSize: '13px', padding: '0 14px' }}
                  >
                    Apply Code
                  </button>
                </div>

                <div className="checkout-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setCheckoutPlan(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={saving}>
                    <Lock size={14} />
                    {saving ? 'Processing...' : `Confirm & Activate ${checkoutPlan.name}`}
                  </button>
                </div>
              </form>
            )}

            {checkoutPlan.price_monthly === 0 && (
              <div className="checkout-actions" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setCheckoutPlan(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={saving}
                  onClick={() => void handlePlanUpgrade(checkoutPlan)}
                >
                  {saving ? 'Processing...' : 'Confirm Downgrade to Free'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {receiptInvoice && (
        <div className="checkout-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
          <div className="checkout-modal">
            <header className="checkout-modal-header">
              <div>
                <h3 id="receipt-title">Invoice Receipt</h3>
                <p>{receiptInvoice.invoice_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptInvoice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="checkout-summary-box">
              <div className="checkout-summary-row">
                <span>Billed To</span>
                <strong>{user.name} ({user.email})</strong>
              </div>
              <div className="checkout-summary-row">
                <span>Date</span>
                <span>{new Date(receiptInvoice.date).toLocaleDateString()}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Plan Description</span>
                <strong>{receiptInvoice.plan_name} Plan ({receiptInvoice.billing_cycle})</strong>
              </div>
              <div className="checkout-summary-row">
                <span>Payment Status</span>
                <span className="plan-status-pill">Paid</span>
              </div>
              <div className="checkout-summary-row total">
                <span>Amount Paid</span>
                <span>${receiptInvoice.amount_usd.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="checkout-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setReceiptInvoice(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  window.print()
                }}
              >
                <Download size={14} /> Print / Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
