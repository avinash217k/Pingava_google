import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  HeartPulse,
  Info,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Terminal,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import {
  createHeartbeat,
  deleteHeartbeat,
  getHeartbeatPings,
  getHeartbeats,
  testPingHeartbeat,
  toggleHeartbeat,
  updateHeartbeat,
  type Heartbeat,
  type HeartbeatPing,
  type User,
} from './api'
import './CronHeartbeatManager.css'

interface CronHeartbeatManagerProps {
  user: User
  onNavigate?: (view: string) => void
}

const intervalPresets = [
  { label: '5 min', seconds: 300 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
  { label: '6 hours', seconds: 21600 },
  { label: '12 hours', seconds: 43200 },
  { label: '24 hours (Daily)', seconds: 86400 },
  { label: '7 days (Weekly)', seconds: 604800 },
]

const gracePresets = [
  { label: '5 min', seconds: 300 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
]

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1).replace('.0', '')}h`
  return `${(seconds / 86400).toFixed(1).replace('.0', '')}d`
}

function timeAgo(dateString: string | null): string {
  if (!dateString) return 'Never'
  const seconds = Math.max(0, Math.round((Date.now() - new Date(dateString).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function CronHeartbeatManager({ user }: CronHeartbeatManagerProps) {
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHeartbeat, setEditingHeartbeat] = useState<Heartbeat | null>(null)
  const [selectedForGuide, setSelectedForGuide] = useState<Heartbeat | null>(null)
  const [selectedPings, setSelectedPings] = useState<HeartbeatPing[]>([])
  const [loadingPings, setLoadingPings] = useState(false)
  const [guideTab, setGuideTab] = useState<'curl' | 'python' | 'node' | 'k8s'>('curl')

  // Form state
  const [formName, setFormName] = useState('')
  const [formPeriod, setFormPeriod] = useState(86400)
  const [formGrace, setFormGrace] = useState(1800)
  const [formAlert, setFormAlert] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const res = await getHeartbeats()
      setHeartbeats(res.heartbeats || [])
      setError('')
    } catch (err: any) {
      setError(err?.message || 'Failed to load heartbeats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    const timer = setInterval(() => void loadData(), 15000)
    return () => clearInterval(timer)
  }, [])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedToken(id)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleOpenCreate = () => {
    setFormName('')
    setFormPeriod(86400)
    setFormGrace(1800)
    setFormAlert(true)
    setEditingHeartbeat(null)
    setShowCreateModal(true)
  }

  const handleOpenEdit = (hb: Heartbeat) => {
    setFormName(hb.name)
    setFormPeriod(hb.period_seconds)
    setFormGrace(hb.grace_seconds)
    setFormAlert(hb.alert_on_miss)
    setEditingHeartbeat(hb)
    setShowCreateModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return
    setSubmitting(true)
    try {
      if (editingHeartbeat) {
        await updateHeartbeat(editingHeartbeat.id, {
          name: formName.trim(),
          period_seconds: formPeriod,
          grace_seconds: formGrace,
          alert_on_miss: formAlert,
        })
        setFeedback(`Updated "${formName}" successfully`)
      } else {
        await createHeartbeat({
          name: formName.trim(),
          period_seconds: formPeriod,
          grace_seconds: formGrace,
          alert_on_miss: formAlert,
        })
        setFeedback(`Created "${formName}" heartbeat`)
      }
      setShowCreateModal(false)
      setTimeout(() => setFeedback(null), 4000)
      await loadData()
    } catch (err: any) {
      setError(err?.message || 'Failed to save heartbeat')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (hb: Heartbeat) => {
    try {
      await toggleHeartbeat(hb.id)
      await loadData()
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle heartbeat status')
    }
  }

  const handleDelete = async (hb: Heartbeat) => {
    if (!window.confirm(`Delete heartbeat "${hb.name}"? This action cannot be undone.`)) return
    try {
      await deleteHeartbeat(hb.id)
      setFeedback(`Deleted "${hb.name}"`)
      setTimeout(() => setFeedback(null), 3000)
      await loadData()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete heartbeat')
    }
  }

  const handleTestPing = async (hb: Heartbeat) => {
    setTestingId(hb.id)
    try {
      await testPingHeartbeat(hb.id)
      setFeedback(`Test ping sent successfully for "${hb.name}"! Status updated to Healthy.`)
      setTimeout(() => setFeedback(null), 4000)
      await loadData()
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger test ping')
    } finally {
      setTestingId(null)
    }
  }

  const handleOpenGuide = async (hb: Heartbeat) => {
    setSelectedForGuide(hb)
    setLoadingPings(true)
    try {
      const pings = await getHeartbeatPings(hb.id)
      setSelectedPings(pings || [])
    } catch {
      setSelectedPings([])
    } finally {
      setLoadingPings(false)
    }
  }

  // Summary counts
  const total = heartbeats.length
  const upCount = heartbeats.filter((h) => h.status === 'up').length
  const lateCount = heartbeats.filter((h) => h.status === 'late').length
  const downCount = heartbeats.filter((h) => h.status === 'down').length

  const pingBaseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/heartbeat` : 'https://dashboard.pingava.com/api/heartbeat'

  return (
    <div className="hb-container">
      {/* Header Banner */}
      <div className="hb-header">
        <div className="hb-header-title-row">
          <div className="hb-icon-box">
            <HeartPulse size={24} />
          </div>
          <div>
            <h2>Cron Job &amp; Worker Heartbeats</h2>
            <p>Passive "Dead Man's Snitch" monitoring for database backups, Celery workers, and scheduled crons.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {feedback && <span style={{ fontSize: '13px', color: '#087a4b', fontWeight: 600 }}>{feedback}</span>}
          <button type="button" className="hb-btn-action primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Add Cron Heartbeat
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="hb-kpis">
        <div className="hb-kpi-card">
          <div className="hb-kpi-icon total"><Terminal size={20} /></div>
          <div className="hb-kpi-info">
            <span>Total Heartbeats</span>
            <strong>{total}</strong>
          </div>
        </div>
        <div className="hb-kpi-card">
          <div className="hb-kpi-icon up"><CheckCircle2 size={20} /></div>
          <div className="hb-kpi-info">
            <span>Operational &amp; On-Time</span>
            <strong>{upCount}</strong>
          </div>
        </div>
        <div className="hb-kpi-card">
          <div className="hb-kpi-icon late"><Clock size={20} /></div>
          <div className="hb-kpi-info">
            <span>Grace Window Running</span>
            <strong>{lateCount}</strong>
          </div>
        </div>
        <div className="hb-kpi-card">
          <div className="hb-kpi-icon down"><AlertTriangle size={20} /></div>
          <div className="hb-kpi-info">
            <span>Overdue / Missed</span>
            <strong>{downCount}</strong>
          </div>
        </div>
      </div>

      {/* Heartbeat Cards List */}
      <div className="hb-list">
        {heartbeats.map((hb) => {
          const pingUrl = `${pingBaseUrl}/${hb.token}`
          const timing = hb.timing

          return (
            <div key={hb.id} className={`hb-card ${hb.status}`}>
              <div className="hb-card-top">
                <div className="hb-card-title-group">
                  <span className={`hb-status-dot ${hb.status}`} />
                  <div>
                    <h3 className="hb-name-text">
                      {hb.name}
                      <span className={`hb-status-pill ${hb.status}`}>
                        {hb.status === 'up'
                          ? 'Healthy'
                          : hb.status === 'late'
                          ? 'In Grace Period'
                          : hb.status === 'down'
                          ? 'Missed / Overdue'
                          : hb.status === 'paused'
                          ? 'Paused'
                          : 'Waiting First Ping'}
                      </span>
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--muted, #667085)', marginTop: 2 }}>
                      Expected every <strong>{formatSeconds(hb.period_seconds)}</strong> ·{' '}
                      <strong>{formatSeconds(hb.grace_seconds)}</strong> grace period
                    </div>
                  </div>
                </div>

                <div className="hb-card-actions">
                  <button
                    type="button"
                    className="hb-btn-action"
                    onClick={() => void handleTestPing(hb)}
                    disabled={testingId === hb.id || hb.status === 'paused'}
                    title="Simulate an incoming ping from your worker"
                  >
                    <Zap size={13} style={{ color: '#f59e0b' }} />
                    {testingId === hb.id ? 'Pinging...' : 'Send Test Ping'}
                  </button>
                  <button
                    type="button"
                    className="hb-btn-action"
                    onClick={() => void handleOpenGuide(hb)}
                    title="View copy-paste crontab snippet and recent pings"
                  >
                    <Code2 size={13} />
                    Integration &amp; Logs
                  </button>
                  <button
                    type="button"
                    className="hb-btn-action"
                    onClick={() => void handleToggle(hb)}
                    title={hb.status === 'paused' ? 'Resume monitoring' : 'Pause monitoring'}
                  >
                    {hb.status === 'paused' ? <Play size={13} /> : <Pause size={13} />}
                    {hb.status === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    className="hb-btn-action"
                    onClick={() => handleOpenEdit(hb)}
                    title="Edit heartbeat settings"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="hb-btn-action"
                    onClick={() => void handleDelete(hb)}
                    title="Delete heartbeat"
                    style={{ color: '#dc2626' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* cURL Copy Bar */}
              <div className="hb-curl-box">
                <code>curl -fsS -m 10 {pingUrl}</code>
                <button
                  type="button"
                  className="hb-copy-btn"
                  onClick={() => void copyToClipboard(`curl -fsS -m 10 ${pingUrl}`, hb.id)}
                >
                  {copiedToken === hb.id ? <Check size={12} /> : <Copy size={12} />}
                  {copiedToken === hb.id ? 'Copied!' : 'Copy cURL'}
                </button>
              </div>

              {/* Meta Stats Bar */}
              <div className="hb-card-meta">
                <div className="hb-meta-item">
                  <span>Last Reported</span>
                  <strong>{hb.last_ping_at ? `${timeAgo(hb.last_ping_at)}` : 'Waiting for first ping'}</strong>
                </div>

                <div className="hb-meta-item">
                  <span>Next Ping Expected</span>
                  <strong>
                    {hb.status === 'paused'
                      ? 'Monitoring paused'
                      : timing?.is_overdue
                      ? `Overdue by ${Math.floor((timing.seconds_overdue || 0) / 60)}m`
                      : timing?.expected_at
                      ? `In ${Math.floor((timing.seconds_until_expected || 0) / 60)}m (${new Date(timing.expected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                      : 'After initial ping'}
                  </strong>
                </div>

                <div className="hb-meta-item">
                  <span>Execution Runtime</span>
                  <strong>{hb.last_ping_duration_ms ? `${hb.last_ping_duration_ms.toLocaleString()} ms` : '—'}</strong>
                </div>

                <div className="hb-meta-item">
                  <span>Alert Channels</span>
                  <strong>{hb.alert_on_miss ? 'Brevo Email & Webhooks' : 'Muted'}</strong>
                </div>
              </div>
            </div>
          )
        })}

        {!heartbeats.length && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface, #ffffff)', borderRadius: 10, border: '1px dashed var(--line, #e4e7ec)' }}>
            <HeartPulse size={40} style={{ color: '#10b981', margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700 }}>No Cron Heartbeats Yet</h3>
            <p style={{ margin: '0 0 16px', color: 'var(--muted, #667085)', fontSize: '14px', maxWidth: 440 }}>
              Safeguard your database backups, billing routines, and background worker queues with proactive "Dead Man's Snitch" monitoring.
            </p>
            <button type="button" className="hb-btn-action primary" onClick={handleOpenCreate}>
              <Plus size={16} /> Create Your First Heartbeat
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="hb-modal-overlay" onMouseDown={() => setShowCreateModal(false)}>
          <div className="hb-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="hb-modal-header">
              <h3>{editingHeartbeat ? 'Edit Cron Heartbeat' : 'New Cron / Worker Heartbeat'}</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => void handleSave(e)}>
              <div className="hb-modal-body">
                <div className="hb-form-group">
                  <label htmlFor="hb-name">Job / Worker Name</label>
                  <input
                    id="hb-name"
                    type="text"
                    className="hb-input"
                    placeholder="e.g. Nightly Postgres Backup, Daily Stripe Sync"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="hb-form-group">
                  <label>Expected Schedule Interval</label>
                  <div className="hb-presets-row">
                    {intervalPresets.map((preset) => (
                      <button
                        type="button"
                        key={preset.seconds}
                        className={`hb-preset-btn ${formPeriod === preset.seconds ? 'active' : ''}`}
                        onClick={() => setFormPeriod(preset.seconds)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <small style={{ color: 'var(--muted, #667085)', marginTop: 4 }}>
                    Pingava expects a check-in at least once every {formatSeconds(formPeriod)}.
                  </small>
                </div>

                <div className="hb-form-group">
                  <label>Grace Period Before Alerting</label>
                  <div className="hb-presets-row">
                    {gracePresets.map((preset) => (
                      <button
                        type="button"
                        key={preset.seconds}
                        className={`hb-preset-btn ${formGrace === preset.seconds ? 'active' : ''}`}
                        onClick={() => setFormGrace(preset.seconds)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <small style={{ color: 'var(--muted, #667085)', marginTop: 4 }}>
                    Extra buffer time to prevent false alerts if the backup runs slightly longer than usual.
                  </small>
                </div>

                <div className="hb-form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <input
                    id="hb-alert-toggle"
                    type="checkbox"
                    checked={formAlert}
                    onChange={(e) => setFormAlert(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="hb-alert-toggle" style={{ cursor: 'pointer', margin: 0 }}>
                    Dispatch alerts via Brevo Email, Slack, Discord, and Webhooks if missed
                  </label>
                </div>
              </div>

              <div className="hb-modal-footer">
                <button type="button" className="hb-btn-action" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="hb-btn-action primary" disabled={submitting || !formName.trim()}>
                  {submitting ? 'Saving...' : editingHeartbeat ? 'Update Heartbeat' : 'Create Heartbeat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integration Guide & Logs Drawer Modal */}
      {selectedForGuide && (
        <div className="hb-modal-overlay" onMouseDown={() => setSelectedForGuide(null)}>
          <div className="hb-modal" style={{ maxWidth: 680 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="hb-modal-header">
              <div>
                <h3>Integration Guide: {selectedForGuide.name}</h3>
                <small style={{ color: 'var(--muted, #667085)' }}>Copy &amp; paste this snippet into your server crontab or worker script.</small>
              </div>
              <button type="button" onClick={() => setSelectedForGuide(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="hb-modal-body">
              <div className="hb-code-tabs">
                <button
                  type="button"
                  className={`hb-code-tab ${guideTab === 'curl' ? 'active' : ''}`}
                  onClick={() => setGuideTab('curl')}
                >
                  Crontab / Bash
                </button>
                <button
                  type="button"
                  className={`hb-code-tab ${guideTab === 'python' ? 'active' : ''}`}
                  onClick={() => setGuideTab('python')}
                >
                  Python
                </button>
                <button
                  type="button"
                  className={`hb-code-tab ${guideTab === 'node' ? 'active' : ''}`}
                  onClick={() => setGuideTab('node')}
                >
                  Node.js / TS
                </button>
                <button
                  type="button"
                  className={`hb-code-tab ${guideTab === 'k8s' ? 'active' : ''}`}
                  onClick={() => setGuideTab('k8s')}
                >
                  Kubernetes / Docker
                </button>
              </div>

              <div className="hb-code-block">
                {guideTab === 'curl' && (
                  <pre style={{ margin: 0 }}>
                    {`# Crontab 1-Liner: Run backup, ping on success, alert on failure\n0 2 * * * /opt/backup.sh && curl -fsS -m 10 ${pingBaseUrl}/${selectedForGuide.token} || curl -fsS -m 10 ${pingBaseUrl}/${selectedForGuide.token}/fail`}
                  </pre>
                )}

                {guideTab === 'python' && (
                  <pre style={{ margin: 0 }}>
                    {`import urllib.request\n\ntry:\n    # 1. Run your background task\n    run_database_backup()\n\n    # 2. Signal success to Pingava\n    urllib.request.urlopen("${pingBaseUrl}/${selectedForGuide.token}")\nexcept Exception as exc:\n    # 3. Explicitly report failure to wake on-call team\n    urllib.request.urlopen("${pingBaseUrl}/${selectedForGuide.token}/fail")\n    raise exc`}
                  </pre>
                )}

                {guideTab === 'node' && (
                  <pre style={{ margin: 0 }}>
                    {`try {\n  await runNightlyWorker();\n  await fetch("${pingBaseUrl}/${selectedForGuide.token}");\n} catch (error) {\n  await fetch("${pingBaseUrl}/${selectedForGuide.token}/fail");\n  throw error;\n}`}
                  </pre>
                )}

                {guideTab === 'k8s' && (
                  <pre style={{ margin: 0 }}>
                    {`# In your Kubernetes CronJob container spec:\nspec:\n  containers:\n  - name: worker\n    image: my-backup-image:latest\n    command: ["/bin/sh", "-c"]\n    args: ["./backup.sh && curl -fsS ${pingBaseUrl}/${selectedForGuide.token} || curl -fsS ${pingBaseUrl}/${selectedForGuide.token}/fail"]`}
                  </pre>
                )}
              </div>

              {/* Recent Pings Table */}
              <div>
                <h4 style={{ margin: '14px 0 8px', fontSize: '14px', fontWeight: 700 }}>Recent Check-In Activity</h4>
                {loadingPings ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted, #667085)' }}>Loading ping history...</div>
                ) : selectedPings.length > 0 ? (
                  <div style={{ border: '1px solid var(--line, #e4e7ec)', borderRadius: 8, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--line, #e4e7ec)' }}>
                        <tr>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Time</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Duration</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Origin IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPings.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <td style={{ padding: '8px 12px' }}>{new Date(p.pinged_at).toLocaleString()}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{ color: p.status === 'success' ? '#087a4b' : '#dc2626', fontWeight: 600 }}>
                                {p.status === 'success' ? '✓ OK' : '✕ FAILED'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>{p.duration_ms ? `${p.duration_ms} ms` : '—'}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--muted, #667085)' }}>{p.ip || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--muted, #667085)' }}>No pings recorded yet for this heartbeat.</p>
                )}
              </div>
            </div>

            <div className="hb-modal-footer">
              <button type="button" className="hb-btn-action primary" onClick={() => setSelectedForGuide(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
