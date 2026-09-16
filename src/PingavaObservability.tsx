import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Clock,
  Database,
  Mail,
  Server,
  Copy,
  Check,
  Trash2,
  Send,
  Cpu,
  Zap,
} from 'lucide-react';
import {
  getObservabilityMetrics,
  testObservabilityAlert,
  clearObservabilityErrors,
  type ObservabilitySnapshot,
  type User,
} from './api';
import './PingavaObservability.css';

interface PingavaObservabilityProps {
  user?: User | null;
  onBack?: () => void;
}

export const PingavaObservability: React.FC<PingavaObservabilityProps> = ({ user, onBack }) => {
  const [snapshot, setSnapshot] = useState<ObservabilitySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'ERROR' | 'FATAL' | 'WARN'>('ALL');
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [alertSending, setAlertSending] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (isSilent = false) => {
    if (user && !user.is_owner) return;
    if (!isSilent) setRefreshing(true);
    try {
      const data = await getObservabilityMetrics();
      setSnapshot(data);
    } catch (err: any) {
      console.error('Failed to load observability metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !user.is_owner) {
      setLoading(false);
      return;
    }
    void fetchMetrics();
  }, [fetchMetrics, user]);

  useEffect(() => {
    if (!autoRefresh || (user && !user.is_owner)) return;
    const interval = setInterval(() => {
      void fetchMetrics(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics, user]);

  if (user && !user.is_owner) {
    return (
      <div className="pingava-obs-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', marginBottom: '1rem' }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: '#94a3b8', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
          Pingava Meta-Guardian &amp; Self-Observability telemetry is strictly restricted to system owners.
        </p>
        {onBack && (
          <button className="obs-action-btn primary" onClick={onBack}>
            Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  const handleTestAlert = async () => {
    setAlertSending(true);
    setAlertFeedback(null);
    try {
      const res = await testObservabilityAlert();
      setAlertFeedback(`Test alert dispatched successfully to ${res.delivered_to}`);
      void fetchMetrics(true);
    } catch (err: any) {
      setAlertFeedback(`Failed to send test alert: ${err?.message || String(err)}`);
    } finally {
      setAlertSending(false);
    }
  };

  const handleClearErrors = async () => {
    if (!window.confirm('Clear all exceptions from the internal memory buffer?')) return;
    try {
      await clearObservabilityErrors();
      void fetchMetrics(true);
    } catch (err: any) {
      console.error('Failed to clear errors:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${mins}m`);
    return parts.join(' ');
  };

  if (loading && !snapshot) {
    return (
      <div className="admin-loading" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#ffffff' }}>
        <Activity className="spin" size={32} color="#38bdf8" />
        <strong style={{ fontSize: '1.1rem' }}>Connecting to Pingava Meta-Guardian Telemetry...</strong>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="admin-empty" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#ffffff' }}>
        <AlertTriangle size={36} color="#ef4444" />
        <p style={{ color: '#cbd5e1' }}>Could not retrieve engine telemetry. Ensure you have owner access.</p>
        <button className="obs-action-btn primary" onClick={() => void fetchMetrics()}>
          <RefreshCw size={15} /> Retry Connection
        </button>
      </div>
    );
  }

  const { meta_guardian, worker_loop, checks, databases, notifications, process: proc, recent_exceptions } = snapshot;

  const filteredExceptions = recent_exceptions.filter(e => {
    if (filterLevel === 'ALL') return true;
    return e.level === filterLevel;
  });

  return (
    <div className="observability-page">
      {/* Top Hero Header Bar */}
      <header className="obs-header-bar">
        <div className="obs-header-left">
          <div className="obs-title-row">
            <h1 className="obs-main-title">Pingava Engine Observability</h1>
            <div className={`obs-guardian-badge ${meta_guardian.overall_health}`}>
              <span className="obs-pulse-dot" />
              {meta_guardian.overall_health === 'healthy' && <ShieldCheck size={16} />}
              {meta_guardian.overall_health === 'warning' && <AlertTriangle size={16} />}
              {meta_guardian.overall_health === 'critical' && <ShieldAlert size={16} />}
              <span>Meta-Guardian: {meta_guardian.overall_health.toUpperCase()}</span>
            </div>
          </div>
          <p className="obs-main-subtitle">
            Autonomous watchdog monitoring check execution rates, worker loop latencies, database dual-write sync, and backend exceptions.
          </p>

          <div className="obs-meta-pills">
            <span className="obs-pill" title="Google Cloud Run Service Revision">
              <Server size={13} color="#38bdf8" />
              Rev: <strong>{proc.cloud_run_revision}</strong>
            </span>
            <span className="obs-pill" title="Process Uptime">
              <Clock size={13} color="#34d399" />
              Uptime: <strong>{formatUptime(proc.uptime_seconds)}</strong>
            </span>
            <span className="obs-pill" title="Node.js Engine Version">
              <Cpu size={13} color="#c084fc" />
              Node: <strong>{proc.node_version}</strong>
            </span>
          </div>
        </div>

        <div className="obs-header-actions">
          <button
            className={`obs-btn-toggle ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Auto-refresh metrics every 10 seconds"
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>

          <button
            className="obs-action-btn"
            onClick={() => void fetchMetrics()}
            disabled={refreshing}
            title="Refresh metrics immediately"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>

          <button
            className="obs-action-btn primary"
            onClick={() => void handleTestAlert()}
            disabled={alertSending}
            title="Trigger a real test email through Meta-Guardian"
          >
            <Send size={14} />
            {alertSending ? 'Sending...' : 'Test Watchdog Alert'}
          </button>
        </div>
      </header>

      {/* Feedback Toast */}
      {alertFeedback && (
        <div className="admin-message" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', border: '1px solid #3b82f6', color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '8px' }}>
          <span>{alertFeedback}</span>
          <button className="icon-btn" onClick={() => setAlertFeedback(null)} style={{ color: '#ffffff' }}>✕</button>
        </div>
      )}

      {/* Critical Alerts Banner */}
      {meta_guardian.active_alerts.length > 0 && (
        <section className="obs-critical-banner" role="alert">
          <AlertTriangle size={24} />
          <div>
            <h3>Active Meta-Guardian Watchdog Alerts</h3>
            <ul>
              {meta_guardian.active_alerts.map((alt, idx) => (
                <li key={idx}><strong>{alt}</strong></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Balanced 2x2 Primary Subsystem Cards */}
      <div className="obs-grid">
        {/* Card 1: Check Execution Rate Engine */}
        <article className="obs-card">
          <div>
            <div className="obs-card-head">
              <div className="obs-card-head-left">
                <div className="obs-icon-wrap green">
                  <Activity size={20} />
                </div>
                <h2 className="obs-card-title">Check Execution Engine</h2>
              </div>
              <span className={`obs-badge-small ${checks.execution_rate_pct >= 90 ? 'up' : checks.execution_rate_pct >= 70 ? 'delayed' : 'stalled'}`}>
                {checks.execution_rate_pct}% Throughput
              </span>
            </div>

            <div className="obs-card-body">
              <div className="obs-big-stat">
                <span className="obs-big-num">{checks.executed_hourly}</span>
                <span className="obs-big-unit">/ {checks.expected_hourly} expected checks / hr</span>
              </div>

              <div className="obs-stat-progress">
                <div
                  className={`obs-stat-bar ${checks.execution_rate_pct < 70 ? 'crit' : checks.execution_rate_pct < 90 ? 'warn' : ''}`}
                  style={{ width: `${Math.min(100, checks.execution_rate_pct)}%` }}
                />
              </div>

              <div className="obs-details-list">
                <div className="obs-details-row">
                  <span>Checks Executed Today</span>
                  <span className="obs-details-val">{checks.executed_today.toLocaleString()}</span>
                </div>
                <div className="obs-details-row">
                  <span>Overdue Active Monitors</span>
                  <span className="obs-details-val" style={{ color: checks.overdue_monitors_count > 0 ? '#fca5a5' : '#ffffff' }}>
                    {checks.overdue_monitors_count}
                  </span>
                </div>
              </div>

              {checks.overdue_monitors.length > 0 && (
                <div className="obs-overdue-box">
                  <strong style={{ color: '#ef4444' }}>Delayed Monitors:</strong>
                  {checks.overdue_monitors.map(m => (
                    <div key={m.id} className="obs-overdue-item">
                      <span>{m.name}</span>
                      <span>+{m.overdue_by_seconds}s overdue</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Card 2: Worker Loop Health */}
        <article className="obs-card">
          <div>
            <div className="obs-card-head">
              <div className="obs-card-head-left">
                <div className="obs-icon-wrap cyan">
                  <Zap size={20} />
                </div>
                <h2 className="obs-card-title">Worker Tick &amp; Event Loop</h2>
              </div>
              <span className={`obs-badge-small ${worker_loop.status === 'healthy' ? 'up' : worker_loop.status === 'delayed' ? 'delayed' : 'stalled'}`}>
                {worker_loop.status.toUpperCase()}
              </span>
            </div>

            <div className="obs-card-body">
              <div className="obs-big-stat">
                <span className="obs-big-num">{worker_loop.event_loop_lag_ms}</span>
                <span className="obs-big-unit">ms Event Loop Lag</span>
              </div>

              <div className="obs-details-list">
                <div className="obs-details-row">
                  <span>Cadence Target</span>
                  <span className="obs-details-val">{Math.round(worker_loop.tick_interval_ms / 1000)}s interval</span>
                </div>
                <div className="obs-details-row">
                  <span>Total Loop Ticks</span>
                  <span className="obs-details-val">{worker_loop.total_ticks.toLocaleString()}</span>
                </div>
                <div className="obs-details-row">
                  <span>Last Heartbeat Tick</span>
                  <span className="obs-details-val">
                    {worker_loop.last_tick_at ? new Date(worker_loop.last_tick_at).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
                <div className="obs-details-row">
                  <span>RSS Memory Allocation</span>
                  <span className="obs-details-val">
                    {Math.round(proc.memory_rss_bytes / 1024 / 1024)} MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Card 3: Dual-Write Database Telemetry */}
        <article className="obs-card">
          <div>
            <div className="obs-card-head">
              <div className="obs-card-head-left">
                <div className="obs-icon-wrap purple">
                  <Database size={20} />
                </div>
                <h2 className="obs-card-title">Dual-Write Cloud Databases</h2>
              </div>
              <span className={`obs-badge-small ${databases.supabase.status === 'connected' && databases.firestore.status === 'connected' ? 'up' : 'delayed'}`}>
                {databases.supabase.status === 'connected' && databases.firestore.status === 'connected' ? 'DUAL CONNECTED' : 'DEGRADED'}
              </span>
            </div>

            <div className="obs-card-body">
              {/* Supabase Subpanel */}
              <div className="obs-subpanel">
                <div className="obs-subpanel-header">
                  <span className="obs-subsystem-title">
                    <span className="obs-subsystem-dot supabase" />
                    Supabase PostgreSQL
                  </span>
                  <span className={`obs-badge-small ${databases.supabase.status === 'connected' ? 'up' : 'stalled'}`}>
                    {databases.supabase.status}
                  </span>
                </div>
                <div className="obs-details-row">
                  <span>Roundtrip Latency</span>
                  <span className="obs-details-val">{databases.supabase.latency_ms !== null ? `${databases.supabase.latency_ms} ms` : '—'}</span>
                </div>
                <div className="obs-details-row">
                  <span>Queries Synced / Failed</span>
                  <span className="obs-details-val">{databases.supabase.total_queries} / {databases.supabase.failed_queries}</span>
                </div>
              </div>

              {/* Firestore Subpanel */}
              <div className="obs-subpanel">
                <div className="obs-subpanel-header">
                  <span className="obs-subsystem-title">
                    <span className="obs-subsystem-dot firestore" />
                    Google Cloud Firestore
                  </span>
                  <span className={`obs-badge-small ${databases.firestore.status === 'connected' ? 'up' : 'stalled'}`}>
                    {databases.firestore.status}
                  </span>
                </div>
                <div className="obs-details-row">
                  <span>Write Latency</span>
                  <span className="obs-details-val">{databases.firestore.last_write_latency_ms !== null ? `${databases.firestore.last_write_latency_ms} ms` : '—'}</span>
                </div>
                <div className="obs-details-row">
                  <span>Writes Synced / Failed</span>
                  <span className="obs-details-val">{databases.firestore.total_writes} / {databases.firestore.failed_writes}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Card 4: Alert & Notification Delivery */}
        <article className="obs-card">
          <div>
            <div className="obs-card-head">
              <div className="obs-card-head-left">
                <div className="obs-icon-wrap amber">
                  <Mail size={20} />
                </div>
                <h2 className="obs-card-title">Alert &amp; Notification Delivery</h2>
              </div>
              <span className={`obs-badge-small ${notifications.email.failure_rate_pct < 10 && notifications.webhooks.failure_rate_pct < 10 ? 'up' : 'delayed'}`}>
                {notifications.email.failure_rate_pct < 10 ? 'DELIVERING' : 'ALERT ISSUES'}
              </span>
            </div>

            <div className="obs-card-body">
              {/* Brevo Subpanel */}
              <div className="obs-subpanel">
                <div className="obs-subpanel-header">
                  <span className="obs-subsystem-title">
                    <span className="obs-subsystem-dot brevo" />
                    Brevo SMTP Relay
                  </span>
                  <span className="obs-details-val" style={{ fontSize: '0.85rem' }}>
                    {notifications.email.sent} sent · {notifications.email.failed} failed
                  </span>
                </div>
                <div className="obs-details-row">
                  <span>Failure Rate</span>
                  <span className="obs-details-val" style={{ color: notifications.email.failure_rate_pct > 15 ? '#fca5a5' : '#ffffff' }}>
                    {notifications.email.failure_rate_pct}%
                  </span>
                </div>
                {notifications.email.last_error && (
                  <div style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '3px' }}>
                    Error: {notifications.email.last_error}
                  </div>
                )}
              </div>

              {/* Webhook Subpanel */}
              <div className="obs-subpanel">
                <div className="obs-subpanel-header">
                  <span className="obs-subsystem-title">
                    <span className="obs-subsystem-dot webhook" />
                    Webhooks (Slack / Discord)
                  </span>
                  <span className="obs-details-val" style={{ fontSize: '0.85rem' }}>
                    {notifications.webhooks.sent} sent · {notifications.webhooks.failed} failed
                  </span>
                </div>
                <div className="obs-details-row">
                  <span>Failure Rate</span>
                  <span className="obs-details-val" style={{ color: notifications.webhooks.failure_rate_pct > 15 ? '#fca5a5' : '#ffffff' }}>
                    {notifications.webhooks.failure_rate_pct}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Backend Exception Stream */}
      <section className="obs-exceptions-section">
        <div className="obs-exceptions-head">
          <div>
            <h2 className="obs-stream-title">Backend Exception Stream</h2>
            <p className="obs-stream-desc">
              Real-time ring buffer of internal server errors, unhandled rejections, and subsystem exceptions
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="obs-filter-group">
              {(['ALL', 'ERROR', 'FATAL', 'WARN'] as const).map(lvl => (
                <button
                  key={lvl}
                  className={`obs-filter-btn ${filterLevel === lvl ? 'active' : ''}`}
                  onClick={() => setFilterLevel(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {recent_exceptions.length > 0 && (
              <button
                className="obs-action-btn danger"
                onClick={() => void handleClearErrors()}
              >
                <Trash2 size={14} /> Clear Buffer
              </button>
            )}
          </div>
        </div>

        {filteredExceptions.length === 0 ? (
          <div className="obs-empty-box">
            <Check size={32} color="#10b981" />
            <strong>No active exceptions recorded.</strong>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
              The engine is running clean with zero unhandled errors or rejections.
            </p>
          </div>
        ) : (
          <div className="obs-exceptions-table">
            <div className="obs-table-header">
              <span>Level</span>
              <span>Time</span>
              <span>Exception Message</span>
              <span>Correlation ID</span>
              <span>Status</span>
            </div>

            {filteredExceptions.map(exc => (
              <React.Fragment key={exc.id}>
                <div
                  className="obs-table-row"
                  onClick={() => setExpandedErrorId(expandedErrorId === exc.id ? null : exc.id)}
                >
                  <div>
                    <span className={`obs-level-tag ${exc.level}`}>{exc.level}</span>
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: '0.84rem' }}>
                    {new Date(exc.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="obs-msg-truncate" title={exc.message}>
                    {exc.message}
                  </div>
                  <div>
                    {exc.correlation_id ? (
                      <button
                        className="obs-copy-btn"
                        onClick={e => {
                          e.stopPropagation();
                          copyToClipboard(exc.correlation_id!, `corr_${exc.id}`);
                        }}
                      >
                        {copiedId === `corr_${exc.id}` ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                        {exc.correlation_id.slice(0, 10)}...
                      </button>
                    ) : (
                      <span style={{ color: '#64748b' }}>—</span>
                    )}
                  </div>
                  <div>
                    {exc.status_code ? (
                      <span className="obs-details-val" style={{ fontSize: '0.84rem' }}>HTTP {exc.status_code}</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Internal</span>
                    )}
                  </div>
                </div>

                {/* Expanded Stack Trace Drawer */}
                {expandedErrorId === exc.id && (
                  <div className="obs-expanded-drawer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', color: '#cbd5e1', fontSize: '0.84rem' }}>
                        {exc.endpoint && (
                          <span>Endpoint: <code style={{ color: '#38bdf8' }}>{exc.method || 'GET'} {exc.endpoint}</code></span>
                        )}
                        {exc.correlation_id && (
                          <span>Correlation: <code style={{ color: '#fbbf24' }}>{exc.correlation_id}</code></span>
                        )}
                      </div>
                      {exc.stack && (
                        <button
                          className="obs-copy-btn"
                          onClick={() => copyToClipboard(exc.stack!, `stk_${exc.id}`)}
                        >
                          {copiedId === `stk_${exc.id}` ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                          Copy Stack Trace
                        </button>
                      )}
                    </div>
                    {exc.stack ? (
                      <pre className="obs-expanded-stack">{exc.stack}</pre>
                    ) : (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>No stack trace captured for this event.</div>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
