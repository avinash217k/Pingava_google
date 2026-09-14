import { useCallback, useEffect, useState } from 'react'
import { Activity, CheckCircle2, Database, FileText, HardDrive, Mail, RefreshCw, ShieldAlert, ShieldCheck, TriangleAlert, Users } from 'lucide-react'
import { api, userFacingError, type AdminOverview, type User } from './api'

const formatBytes = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export function AdminPanel({ user }: { user?: User | null } = {}) {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const load = useCallback(async () => {
    if (user && !user.is_owner) return
    try { setData(await api<AdminOverview>('/admin/overview')); setError('') }
    catch (reason) { setError(userFacingError(reason, "We couldn't load owner administration data. Please try again.")) }
    finally { setLoading(false) }
  }, [user])
  useEffect(() => {
    if (user && !user.is_owner) {
      setLoading(false)
      return
    }
    void load()
  }, [load, user])

  if (user && !user.is_owner) {
    return (
      <section className="admin-page" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', marginBottom: '1rem' }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: '#94a3b8', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
          Owner controls and administrative tools are strictly restricted to system administrators.
        </p>
      </section>
    )
  }

  const createBackup = async () => {
    setBusy('create'); setError(''); setMessage('')
    try {
      const result = await api<{ message: string }>('/admin/backups', { method: 'POST' })
      setMessage(result.message); await load()
    } catch (reason) { setError(userFacingError(reason, 'The backup could not be created. Please try again.')) }
    finally { setBusy('') }
  }
  const verifyBackup = async (name: string) => {
    setBusy(name); setError(''); setMessage('')
    try {
      const result = await api<{ message: string }>(`/admin/backups/${encodeURIComponent(name)}/verify`, { method: 'POST' })
      setMessage(`${name}: ${result.message}`)
    } catch (reason) { setError(userFacingError(reason, 'The backup could not be verified. Please try again.')) }
    finally { setBusy('') }
  }

  if (!data) return <section className="admin-loading" aria-live="polite">{error ? <TriangleAlert size={24} /> : <ShieldCheck className={loading ? 'spin' : ''} size={24} />}<strong>{error ? 'Unable to load owner controls' : 'Loading owner controls...'}</strong>{error && <><span>{error}</span><button className="secondary-btn" onClick={() => { setLoading(true); void load() }}><RefreshCw size={15} />Try again</button></>}</section>
  const localBackups = data.system.backup_management === 'local'
  return <section className="admin-page">
    {message && <div className="admin-message">{message}</div>}
    {error && <div className="page-error" role="alert"><TriangleAlert size={16} /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError('')}>Dismiss</button></div>}

    <div style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.15) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Activity size={20} color="#38bdf8" />
        <div>
          <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.95rem' }}>Pingava Meta-Guardian &amp; Self-Observability</strong>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Deep telemetry: Check execution rates, database latencies, Brevo relay health &amp; live backend exceptions.</span>
        </div>
      </div>
      <a href="/observability" className="primary-btn" style={{ textDecoration: 'none', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
        Open Observability Dashboard →
      </a>
    </div>

    <div className="admin-metrics">
      <article><Users size={18} /><span>Users</span><strong>{data.counts.users}</strong></article>
      <article><Activity size={18} /><span>Monitors</span><strong>{data.counts.monitors}</strong></article>
      <article><Database size={18} /><span>Checks stored</span><strong>{data.counts.checks.toLocaleString()}</strong></article>
      <article><TriangleAlert size={18} /><span>Open incidents</span><strong>{data.counts.open_incidents}</strong></article>
    </div>
    <section className="admin-section system-section"><div className="section-title"><div><h2>System health</h2><p>Runtime and storage status</p></div><button className="icon-btn" title="Refresh system status" onClick={() => void load()}><RefreshCw size={15} /></button></div><div className="system-grid"><div><span className={`system-icon ${data.system.api_ok ? 'healthy' : 'unhealthy'}`}><CheckCircle2 size={16} /></span><p><strong>API Engine (Node / Express)</strong><small>{data.system.api_ok ? 'Operational' : 'Unavailable'}</small></p></div><div><span className={`system-icon ${data.system.worker_ok ? 'healthy' : 'unhealthy'}`}>{data.system.worker_ok ? <CheckCircle2 size={16} /> : <TriangleAlert size={16} />}</span><p><strong>Monitoring worker</strong><small>{data.system.worker_ok ? data.system.worker_id : 'Heartbeat unavailable'}</small></p></div><div><span className="system-icon healthy"><Database size={16} /></span><p><strong>Database</strong><small>{formatBytes(data.system.database_size_bytes)} · migration {data.system.migration || 'unknown'}</small></p></div><div><span className={`system-icon ${data.alert_counts.failed ? 'unhealthy' : 'healthy'}`}><Mail size={16} /></span><p><strong>Email delivery</strong><small>{data.alert_counts.sent} sent · {data.alert_counts.failed} failed · {data.alert_counts.skipped} skipped</small></p></div></div></section>
    <section className="admin-section"><div className="section-title"><div><h2>Application logs</h2><p>{data.logging.directory}</p></div><span className={`system-icon ${data.logging.ok ? 'healthy' : 'unhealthy'}`}>{data.logging.ok ? <CheckCircle2 size={16} /> : <TriangleAlert size={16} />}</span></div><div className="log-files">{data.logging.files.map((file) => <div key={file.name}><FileText size={15} /><span>{file.name}</span><strong>{formatBytes(file.size_bytes)}</strong></div>)}<div><HardDrive size={15} /><span>Disk available</span><strong>{formatBytes(data.logging.free_bytes)}</strong></div></div></section>
    <section className="admin-section"><div className="section-title"><div><h2>Protection and retention</h2><p>{data.system.blocked_rate_limits} active rate-limit blocks</p></div></div><div className="retention-grid"><div><span>Checks</span><strong>{data.retention.checks_days} days</strong></div><div><span>Resolved incidents</span><strong>{data.retention.incidents_days} days</strong></div><div><span>Email history</span><strong>{data.retention.alerts_days} days</strong></div><div><span>Expired tokens</span><strong>{data.retention.tokens_days} days</strong></div><div><span>Backups</span><strong>{localBackups ? `Latest ${data.retention.backups_count}` : 'Provider managed'}</strong></div></div></section>
    <section className="admin-section"><div className="section-title"><div><h2>Registered users</h2><p>Accounts and monitor ownership</p></div></div><div className="admin-table user-table"><div className="admin-table-head"><span>User</span><span>Joined</span><span>Monitors</span></div>{data.users.map((user) => <article key={user.id}><div><strong>{user.name}</strong><small>{user.email}</small></div><span>{new Date(user.created_at).toLocaleDateString()}</span><b>{user.monitor_count}</b></article>)}</div></section>
    <section className="admin-section"><div className="section-title"><div><h2>Database backups</h2><p>{localBackups ? 'SQLite snapshots with checksum files' : 'Managed by your PostgreSQL provider'}</p></div>{localBackups && <button className="primary-btn" disabled={busy === 'create'} onClick={() => void createBackup()}><HardDrive size={15} />{busy === 'create' ? 'Creating...' : 'Back up now'}</button>}</div>{localBackups ? <div className="admin-table backup-table"><div className="admin-table-head"><span>Snapshot</span><span>Created</span><span>Size</span><span /></div>{data.backups.map((item) => <article key={item.name}><div><strong>{item.name}</strong><small>{item.has_checksum ? 'Checksum available' : 'Checksum missing'}</small></div><span>{new Date(item.created_at).toLocaleString()}</span><span>{formatBytes(item.size_bytes)}</span><button className="secondary-btn" disabled={busy === item.name} onClick={() => void verifyBackup(item.name)}>{busy === item.name ? 'Checking...' : 'Verify'}</button></article>)}{!data.backups.length && <div className="admin-empty">No backups available.</div>}</div> : <div className="admin-empty">Pingava cannot verify provider backups. Configure periodic exports or upgrade the provider backup plan before launch.</div>}</section>
    <section className="admin-section"><div className="section-title"><div><h2>Recent email activity</h2><p>Latest deliveries across all workspaces</p></div></div><div className="admin-table alert-table"><div className="admin-table-head"><span>Delivery</span><span>Status</span><span>Created</span></div>{data.recent_alerts.map((item) => <article key={item.id}><div><strong>{item.kind} · {item.recipient}</strong><small>{item.error || 'No delivery error'}</small></div><span className={`status-pill ${item.status === 'sent' ? 'up' : item.status === 'failed' ? 'down' : 'paused'}`}>{item.status}</span><span>{new Date(item.created_at).toLocaleString()}</span></article>)}{!data.recent_alerts.length && <div className="admin-empty">No email attempts recorded.</div>}</div></section>
    <section className="admin-section"><div className="section-title"><div><h2>Recent application errors</h2><p>Redacted API and worker failures</p></div></div><div className="admin-table log-table"><div className="admin-table-head"><span>Event</span><span>Correlation ID</span><span>Time</span></div>{data.recent_errors.map((item, index) => <article key={`${item.timestamp}-${index}`}><div><strong>{item.event || item.level}</strong><small>{item.message}</small></div><code>{item.correlation_id || 'Not available'}</code><span>{new Date(item.timestamp).toLocaleString()}</span></article>)}{!data.recent_errors.length && <div className="admin-empty">No application errors recorded.</div>}</div></section>
    <section className="admin-section"><div className="section-title"><div><h2>Security events</h2><p>Authentication and access activity</p></div></div><div className="admin-table log-table"><div className="admin-table-head"><span>Event</span><span>Correlation ID</span><span>Time</span></div>{data.recent_security_events.map((item, index) => <article key={`${item.timestamp}-${index}`}><div><strong>{item.event || item.level}</strong><small>{item.message}</small></div><code>{item.correlation_id || 'Not available'}</code><span>{new Date(item.timestamp).toLocaleString()}</span></article>)}{!data.recent_security_events.length && <div className="admin-empty">No security events recorded.</div>}</div></section>
  </section>
}
