import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { api, checkMonitorSsl, getSslFleetOverview, scanSslFleet, type Monitor, type SslFleetOverview } from './api'
import './SslCertificateGuardian.css'

interface SslCertificateGuardianProps {
  monitor: Monitor
  onMonitorUpdate?: (updated: Monitor) => void
  embedded?: boolean
}

export function SslCertificateGuardian({ monitor, onMonitorUpdate }: SslCertificateGuardianProps) {
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [togglingAlert, setTogglingAlert] = useState(false)

  const isHttps = monitor.url.startsWith('https://')
  const days = monitor.ssl_days_remaining

  let healthStatus: 'valid' | 'expiring' | 'critical' | 'expired' | 'error' | 'not_applicable' = 'not_applicable'

  if (!isHttps) {
    healthStatus = 'not_applicable'
  } else if (monitor.ssl_status === 'error') {
    healthStatus = 'error'
  } else if (days !== null) {
    if (days <= 0) {
      healthStatus = 'expired'
    } else if (days <= 7) {
      healthStatus = 'critical'
    } else if (days <= 30) {
      healthStatus = 'expiring'
    } else {
      healthStatus = 'valid'
    }
  } else if (monitor.ssl_status === 'valid') {
    healthStatus = 'valid'
  }

  // Calculate percentage of validity remaining
  let percentageRemaining = 100
  if (monitor.ssl_valid_from && monitor.ssl_expires_at) {
    const start = new Date(monitor.ssl_valid_from).getTime()
    const end = new Date(monitor.ssl_expires_at).getTime()
    const total = end - start
    const remaining = end - Date.now()
    if (total > 0) {
      percentageRemaining = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)))
    }
  } else if (days !== null) {
    // Relative to standard 90-day Let's Encrypt / automated certificate lifespan
    percentageRemaining = Math.max(0, Math.min(100, Math.round((days / 90) * 100)))
  }

  const handleRecheck = async () => {
    if (checking || !isHttps) return
    setChecking(true)
    setFeedback(null)
    setErrorMessage(null)

    try {
      const res = await checkMonitorSsl(monitor.id)
      if (res && res.monitor) {
        onMonitorUpdate?.(res.monitor)
        setFeedback(`Certificate inspected successfully · ${res.monitor.ssl_days_remaining ?? 0} days remaining`)
        setTimeout(() => setFeedback(null), 4000)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to inspect SSL certificate')
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setChecking(false)
    }
  }

  const handleToggleAlerts = async () => {
    if (togglingAlert) return
    setTogglingAlert(true)
    try {
      const updated = await api<Monitor>(`/monitors/${monitor.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          alert_on_ssl_expiry: !monitor.alert_on_ssl_expiry,
        }),
      })
      if (updated) {
        onMonitorUpdate?.(updated)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to toggle SSL alerts')
      setTimeout(() => setErrorMessage(null), 4000)
    } finally {
      setTogglingAlert(false)
    }
  }

  if (!isHttps) {
    return (
      <div className="ssl-guardian-container">
        <div className="ssl-guardian-header">
          <div className="ssl-guardian-title-area">
            <div className="ssl-icon-box">
              <Info size={22} />
            </div>
            <div>
              <div className="ssl-title-row">
                <h3>SSL / TLS Certificate Guardian</h3>
                <span className="ssl-badge neutral">HTTP Only</span>
              </div>
              <p>This monitor targets an unencrypted HTTP URL. TLS inspection is available for HTTPS endpoints.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ssl-guardian-container">
      {/* Header Banner */}
      <div className="ssl-guardian-header">
        <div className="ssl-guardian-title-area">
          <div className={`ssl-icon-box ${healthStatus}`}>
            {healthStatus === 'valid' ? (
              <ShieldCheck size={24} />
            ) : healthStatus === 'expiring' ? (
              <ShieldAlert size={24} />
            ) : healthStatus === 'critical' || healthStatus === 'expired' ? (
              <AlertTriangle size={24} />
            ) : (
              <Lock size={24} />
            )}
          </div>
          <div>
            <div className="ssl-title-row">
              <h3>SSL / TLS Certificate Guardian</h3>
              <span className={`ssl-badge ${healthStatus}`}>
                {healthStatus === 'valid' ? (
                  <>
                    <CheckCircle2 size={12} /> Valid &amp; Trusted
                  </>
                ) : healthStatus === 'expiring' ? (
                  <>
                    <Clock size={12} /> Expiring Soon ({days}d)
                  </>
                ) : healthStatus === 'critical' ? (
                  <>
                    <AlertTriangle size={12} /> Critical Urgency ({days}d)
                  </>
                ) : healthStatus === 'expired' ? (
                  <>
                    <AlertTriangle size={12} /> Certificate Expired
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} /> Verification Issue
                  </>
                )}
              </span>
            </div>
            <p>Autonomous TLS socket handshake, expiration radar, and multi-channel tiered alerts.</p>
          </div>
        </div>

        <div className="ssl-header-actions">
          {feedback && <span style={{ fontSize: '12px', color: '#087a4b', fontWeight: 600 }}>{feedback}</span>}
          {errorMessage && <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>{errorMessage}</span>}
          <button
            type="button"
            className="ssl-btn primary"
            onClick={() => void handleRecheck()}
            disabled={checking}
          >
            <RefreshCw size={14} className={checking ? 'spin-slow' : ''} />
            {checking ? 'Inspecting Handshake...' : 'Re-check Certificate'}
          </button>
        </div>
      </div>

      {/* Error alert notice if present */}
      {monitor.ssl_error && (
        <div className="ssl-alert-box">
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Certificate Handshake Warning:</strong>
            <div style={{ marginTop: 2 }}>{monitor.ssl_error}</div>
          </div>
        </div>
      )}

      {/* Lifetime & Countdown Hero Card */}
      <div className="ssl-countdown-banner">
        <div className="ssl-countdown-top">
          <div className="ssl-days-display">
            <div className={`ssl-days-number ${healthStatus}`}>
              {days === null
                ? 'Pending Inspection'
                : days < 0
                ? `Expired ${Math.abs(days)}d ago`
                : days === 0
                ? 'Expires Today'
                : `${days} Days Remaining`}
            </div>
            <div className="ssl-days-subtext">
              {monitor.ssl_expires_at
                ? `Valid until ${new Date(monitor.ssl_expires_at).toUTCString()}`
                : 'Run inspection to capture certificate lifecycle'}
            </div>
          </div>

          <div className="ssl-badges-group">
            {monitor.ssl_protocol && (
              <span className="ssl-badge neutral">
                <Lock size={12} />
                {monitor.ssl_protocol}
              </span>
            )}
            {monitor.ssl_issuer && (
              <span className="ssl-badge neutral">
                <Shield size={12} />
                {monitor.ssl_issuer}
              </span>
            )}
            <span className={`ssl-badge ${monitor.alert_on_ssl_expiry ? 'valid' : 'neutral'}`}>
              <Bell size={12} />
              {monitor.alert_on_ssl_expiry ? 'Expiry Alerts Active' : 'Alerts Muted'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="ssl-progress-wrapper">
          <div className="ssl-progress-labels">
            <span>
              {monitor.ssl_valid_from ? `Issued: ${new Date(monitor.ssl_valid_from).toLocaleDateString()}` : 'Lifespan'}
            </span>
            <span>{percentageRemaining}% lifetime remaining</span>
            <span>
              {monitor.ssl_expires_at ? `Expires: ${new Date(monitor.ssl_expires_at).toLocaleDateString()}` : 'Expiry'}
            </span>
          </div>
          <div className="ssl-progress-track">
            <div
              className={`ssl-progress-bar ${healthStatus}`}
              style={{ width: `${Math.max(4, percentageRemaining)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Certificate Specs Grid */}
      <div className="ssl-specs-grid">
        <div className="ssl-spec-card">
          <span>Target Host &amp; Subject</span>
          <strong>{monitor.ssl_subject || new URL(monitor.url).hostname}</strong>
          <small>SNI Handshake Verified</small>
        </div>

        <div className="ssl-spec-card">
          <span>Certificate Authority</span>
          <strong>{monitor.ssl_issuer || 'Pending Handshake'}</strong>
          <small>Root &amp; Intermediate Authority</small>
        </div>

        <div className="ssl-spec-card">
          <span>Negotiated Protocol</span>
          <strong>{monitor.ssl_protocol || 'TLS'}</strong>
          <small>Cipher &amp; Key Exchange</small>
        </div>

        <div className="ssl-spec-card">
          <span>Last Handshake Inspection</span>
          <strong>
            {monitor.ssl_last_checked_at
              ? new Date(monitor.ssl_last_checked_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'Not yet verified'}
          </strong>
          <small>
            {monitor.ssl_last_checked_at
              ? new Date(monitor.ssl_last_checked_at).toLocaleDateString()
              : 'Automatic on schedule'}
          </small>
        </div>
      </div>

      {/* Autonomous Multi-Channel Expiry Alerting Matrix */}
      <div className="ssl-tiers-card">
        <div className="ssl-tiers-header">
          <h4>
            <Zap size={16} style={{ color: '#f59e0b' }} />
            Autonomous Multi-Tiered Expiry Escalation
          </h4>
          <button
            type="button"
            className="ssl-btn"
            onClick={() => void handleToggleAlerts()}
            disabled={togglingAlert}
          >
            <Bell size={13} />
            {monitor.alert_on_ssl_expiry ? 'Disable SSL Alerts' : 'Enable SSL Alerts'}
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted, #667085)' }}>
          Pingava safeguards your users from unexpected TLS outages by dispatching alerts via Pingava Email (alerts@pingava.com), Slack,
          Discord, Telegram, PagerDuty, and Webhooks at each milestone before certificate expiration.
        </p>

        <div className="ssl-tiers-steps">
          <div className={`ssl-tier-step ${days !== null && days <= 30 && days > 14 ? 'triggered' : 'armed'}`}>
            <div className="ssl-tier-title">
              <span>30 Days Out</span>
              <span
                className={`ssl-tier-badge ${
                  days !== null && days <= 30 && days > 14 ? 'active' : 'armed'
                }`}
              >
                {days !== null && days <= 30 && days > 14 ? 'Triggered' : 'Armed'}
              </span>
            </div>
            <div className="ssl-tier-desc">Early renewal notification dispatch to alert channels.</div>
          </div>

          <div className={`ssl-tier-step ${days !== null && days <= 14 && days > 7 ? 'triggered' : 'armed'}`}>
            <div className="ssl-tier-title">
              <span>14 Days Out</span>
              <span
                className={`ssl-tier-badge ${
                  days !== null && days <= 14 && days > 7 ? 'active' : 'armed'
                }`}
              >
                {days !== null && days <= 14 && days > 7 ? 'Triggered' : 'Armed'}
              </span>
            </div>
            <div className="ssl-tier-desc">Escalation reminder for pending certificate renewal.</div>
          </div>

          <div className={`ssl-tier-step ${days !== null && days <= 7 && days > 1 ? 'triggered' : 'armed'}`}>
            <div className="ssl-tier-title">
              <span>7 Days Out</span>
              <span
                className={`ssl-tier-badge ${
                  days !== null && days <= 7 && days > 1 ? 'active' : 'armed'
                }`}
              >
                {days !== null && days <= 7 && days > 1 ? 'Triggered' : 'Armed'}
              </span>
            </div>
            <div className="ssl-tier-desc">Critical alert highlighting imminent certificate expiration.</div>
          </div>

          <div className={`ssl-tier-step ${days !== null && days <= 1 && days > 0 ? 'triggered' : 'armed'}`}>
            <div className="ssl-tier-title">
              <span>24 Hours</span>
              <span
                className={`ssl-tier-badge ${
                  days !== null && days <= 1 && days > 0 ? 'active' : 'armed'
                }`}
              >
                {days !== null && days <= 1 && days > 0 ? 'Triggered' : 'Armed'}
              </span>
            </div>
            <div className="ssl-tier-desc">Emergency alert for immediate on-call action.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SslFleetGuardianCard() {
  const [fleet, setFleet] = useState<SslFleetOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadFleet = async () => {
    setLoading(true)
    try {
      const data = await getSslFleetOverview()
      setFleet(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFleet()
  }, [])

  const handleScanFleet = async () => {
    if (scanning) return
    setScanning(true)
    setFeedback(null)
    try {
      const updated = await scanSslFleet()
      setFleet(updated)
      setFeedback(`Scanned ${updated.scanned_count || updated.total_https} certificates successfully`)
      setTimeout(() => setFeedback(null), 4000)
    } catch {
      setFeedback('Fleet scan failed. Please try again.')
      setTimeout(() => setFeedback(null), 4000)
    } finally {
      setScanning(false)
    }
  }

  if (!fleet && loading) return null
  if (!fleet || fleet.total_https === 0) return null

  return (
    <div className="ssl-guardian-card" style={{ marginTop: '1.25rem' }}>
      <div className="ssl-guardian-header">
        <div className="ssl-header-info">
          <div className="ssl-header-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="ssl-header-title">Fleet SSL Certificate Guardian</h3>
            <p className="ssl-header-sub">
              Automated background monitoring with 30d, 14d, 7d, and 24h advance warnings across {fleet.total_https} HTTPS endpoints
            </p>
          </div>
        </div>

        <div className="ssl-header-actions">
          <button
            type="button"
            className="ssl-recheck-btn"
            onClick={handleScanFleet}
            disabled={scanning}
            title="Scan all certificates now"
          >
            <RefreshCw size={13} className={scanning ? 'spin' : ''} />
            {scanning ? 'Scanning fleet...' : 'Scan Fleet Now'}
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: 12, marginBottom: 12 }}>
          {feedback}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 12 }}>
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--surface-subtle, rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, color: 'var(--muted, #94a3b8)', textTransform: 'uppercase', fontWeight: 600 }}>Valid Certs</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 4 }}>{fleet.valid_count}</div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--surface-subtle, rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, color: 'var(--muted, #94a3b8)', textTransform: 'uppercase', fontWeight: 600 }}>Expiring (&le;30d)</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: fleet.expiring_soon_count > 0 ? '#f59e0b' : 'inherit', marginTop: 4 }}>{fleet.expiring_soon_count}</div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--surface-subtle, rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, color: 'var(--muted, #94a3b8)', textTransform: 'uppercase', fontWeight: 600 }}>Critical (&le;7d)</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: fleet.critical_count > 0 ? '#ef4444' : 'inherit', marginTop: 4 }}>{fleet.critical_count}</div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--surface-subtle, rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, color: 'var(--muted, #94a3b8)', textTransform: 'uppercase', fontWeight: 600 }}>Expired</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: fleet.expired_count > 0 ? '#ef4444' : 'inherit', marginTop: 4 }}>{fleet.expired_count}</div>
        </div>
      </div>
    </div>
  )
}

