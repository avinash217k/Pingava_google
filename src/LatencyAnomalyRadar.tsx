import { useEffect, useState } from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Flame,
  Radar,
  RefreshCw,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  api,
  userFacingError,
  type FleetLatencyRadar,
  type Monitor,
  type MonitorLatencyRadar,
} from './api'
import './LatencyAnomalyRadar.css'

interface LatencyAnomalyRadarProps {
  mode?: 'fleet' | 'monitor'
  monitor?: Monitor | null
  onOpenMonitor?: (monitorId: number) => void
}

export function LatencyAnomalyRadar({
  mode = 'fleet',
  monitor,
  onOpenMonitor,
}: LatencyAnomalyRadarProps) {
  const [fleetData, setFleetData] = useState<FleetLatencyRadar | null>(null)
  const [monitorData, setMonitorData] = useState<MonitorLatencyRadar | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'monitor' && monitor) {
        const res = await api<MonitorLatencyRadar>(`/monitors/${monitor.id}/latency-radar`)
        setMonitorData(res)
      } else {
        const res = await api<FleetLatencyRadar>(`/latency-radar`)
        setFleetData(res)
      }
    } catch (err) {
      setError(userFacingError(err, 'Failed to fetch latency anomaly radar data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [mode, monitor?.id])

  if (loading && !fleetData && !monitorData) {
    return (
      <div className="radar-loading">
        <RefreshCw size={24} className="spin" />
        <p>Analyzing latency distributions and running anomaly detection...</p>
      </div>
    )
  }

  if (error && !fleetData && !monitorData) {
    return (
      <div className="radar-error-state" style={{ padding: '32px', textAlign: 'center', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '12px', margin: '16px 0' }}>
        <AlertTriangle size={28} color="#d92d20" style={{ marginBottom: '8px' }} />
        <h4 style={{ margin: '0 0 6px' }}>Unable to load Latency Radar</h4>
        <p style={{ color: 'var(--muted-foreground, #667085)', fontSize: '13px', margin: '0 0 16px' }}>{error}</p>
        <button type="button" className="secondary-btn" onClick={() => void loadData()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Retry Analysis
        </button>
      </div>
    )
  }

  // ---------------- MONITOR DETAIL VIEW ----------------
  if (mode === 'monitor' && monitorData) {
    const data = monitorData
    const isDegrading = data.severity === 'degrading' || data.severity === 'critical_risk'

    return (
      <div className="radar-monitor-container">
        {/* Anomaly Hero Banner */}
        <div className={`radar-anomaly-hero ${data.severity}`}>
          <div className="anomaly-hero-main">
            <div className="anomaly-icon-wrap">
              {data.severity === 'critical_risk' ? (
                <AlertOctagon size={26} />
              ) : data.severity === 'degrading' ? (
                <Flame size={26} />
              ) : data.severity === 'watch' ? (
                <AlertTriangle size={26} />
              ) : (
                <CheckCircle2 size={26} />
              )}
            </div>
            <div>
              <div className="anomaly-title-row">
                <h3>{data.status_label}</h3>
                <span className={`severity-badge ${data.severity}`}>
                  {data.severity.toUpperCase().replace('_', ' ')}
                </span>
                {data.drift_percentage > 0 && (
                  <span className="drift-badge">
                    <TrendingUp size={13} /> +{data.drift_percentage}% Drift
                  </span>
                )}
              </div>
              <p className="anomaly-diag-text">{data.sre_diagnosis}</p>
            </div>
          </div>

          <div className="anomaly-risk-box">
            <span className="risk-label">Predictive SRE Risk</span>
            <strong className={`risk-val ${data.predictive_risk_score > 60 ? 'risk-high' : data.predictive_risk_score > 30 ? 'risk-mid' : 'risk-low'}`}>
              {data.predictive_risk_score} / 100
            </strong>
            {data.estimated_time_to_timeout_hours && (
              <span className="risk-forecast">
                <Clock size={11} /> Est. ~{data.estimated_time_to_timeout_hours}h to timeout limit
              </span>
            )}
          </div>
        </div>

        {/* Remediation Actionable Guidance */}
        {isDegrading && (
          <div className="radar-remediation-box">
            <div className="remediation-header">
              <Zap size={16} />
              <strong>SRE Automated Remediation Guidance:</strong>
            </div>
            <p>{data.sre_remediation_hint}</p>
          </div>
        )}

        {/* Statistical Percentiles Grid */}
        <div className="radar-percentiles-grid">
          <div className="percentile-card">
            <span className="pct-label">p50 (Median)</span>
            <strong className="pct-value">{data.percentiles.p50} <small>ms</small></strong>
            <span className="pct-sub">50% requests faster</span>
          </div>

          <div className="percentile-card">
            <span className="pct-label">p75 Percentile</span>
            <strong className="pct-value">{data.percentiles.p75} <small>ms</small></strong>
            <span className="pct-sub">Upper-quartile latency</span>
          </div>

          <div className="percentile-card">
            <span className="pct-label">p90 Percentile</span>
            <strong className="pct-value">{data.percentiles.p90} <small>ms</small></strong>
            <span className="pct-sub">Tail latency indicator</span>
          </div>

          <div className="percentile-card highlight">
            <span className="pct-label">p95 SLO Standard</span>
            <strong className="pct-value">{data.percentiles.p95} <small>ms</small></strong>
            <span className="pct-sub">Baseline was {data.baseline_p95}ms</span>
          </div>

          <div className="percentile-card critical">
            <span className="pct-label">p99 Outliers</span>
            <strong className="pct-value">{data.percentiles.p99} <small>ms</small></strong>
            <span className="pct-sub">Worst 1% latency spike</span>
          </div>
        </div>

        {/* Statistical Drift & Jitter Telemetry */}
        <div className="radar-telemetry-row">
          <div className="telemetry-card">
            <span className="tel-title">Moving Baseline vs Recent Window</span>
            <div className="comparison-bars">
              <div className="comp-item">
                <div className="comp-label-row">
                  <span>Historical Baseline Average</span>
                  <strong>{data.baseline_avg} ms</strong>
                </div>
                <div className="comp-bar-track">
                  <div
                    className="comp-bar-fill baseline"
                    style={{ width: `${Math.min(100, Math.max(15, (data.baseline_avg / Math.max(data.recent_avg, data.baseline_avg, 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="comp-item">
                <div className="comp-label-row">
                  <span>Recent Rolling Window Average</span>
                  <strong>{data.recent_avg} ms</strong>
                </div>
                <div className="comp-bar-track">
                  <div
                    className="comp-bar-fill recent"
                    style={{ width: `${Math.min(100, Math.max(15, (data.recent_avg / Math.max(data.recent_avg, data.baseline_avg, 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="telemetry-card metrics-card">
            <span className="tel-title">Variance & Deviation Engine</span>
            <div className="stats-mini-grid">
              <div className="stat-pill">
                <small>Z-Score Deviation</small>
                <strong>{data.z_score} &sigma;</strong>
              </div>
              <div className="stat-pill">
                <small>Std Deviation (&sigma;)</small>
                <strong>&plusmn;{data.std_dev} ms</strong>
              </div>
              <div className="stat-pill">
                <small>Mean Jitter</small>
                <strong>{data.jitter_ms} ms</strong>
              </div>
              <div className="stat-pill">
                <small>Timeout Ceiling</small>
                <strong>{data.timeout_threshold_seconds}s ({data.timeout_threshold_seconds * 1000}ms)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- FLEET OVERVIEW VIEW ----------------
  const data = fleetData
  if (!data) return null

  const degradingOrCritical = data.monitors.filter(
    m => m.severity === 'degrading' || m.severity === 'critical_risk' || m.severity === 'watch'
  )

  return (
    <div className="radar-fleet-container">
      {/* Fleet Header Summary */}
      <div className="radar-fleet-header">
        <div className="fleet-title-wrap">
          <div className="fleet-icon-box">
            <Radar size={22} />
          </div>
          <div>
            <h3>"Silent Degradation" & Latency Anomaly Radar</h3>
            <p>Predictive SRE intelligence tracking tail latency drift (p95/p99) and performance degradation before failures trigger.</p>
          </div>
        </div>

        <button type="button" className="secondary-btn" onClick={loadData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Analyzing Fleet...' : 'Re-scan Fleet'}
        </button>
      </div>

      {/* Fleet KPI Banner */}
      <div className="radar-fleet-kpis">
        <div className="kpi-card">
          <span className="kpi-label">Fleet-Wide p95 Latency</span>
          <strong className="kpi-val">{data.fleet_p95_ms} <small>ms</small></strong>
          <span className="kpi-sub">Across {data.total_monitors} active monitors</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Nominal Status</span>
          <strong className="kpi-val text-success">{data.nominal_count}</strong>
          <span className="kpi-sub">Operating within normal bounds</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Watch / Jitter Alert</span>
          <strong className="kpi-val text-warn">{data.watch_count}</strong>
          <span className="kpi-sub">Elevated variance or jitter</span>
        </div>

        <div className="kpi-card highlight-danger">
          <span className="kpi-label">Silent Degradation Risk</span>
          <strong className="kpi-val text-danger">
            {data.degrading_count + data.critical_count}
          </strong>
          <span className="kpi-sub">Latency creep &gt; 50% above baseline</span>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="radar-monitors-section">
        <div className="monitors-section-header">
          <h4>
            Endpoints Experiencing Performance Drift & Anomaly ({degradingOrCritical.length})
          </h4>
          <span className="section-hint">Ranked by Predictive SRE Risk Score</span>
        </div>

        {degradingOrCritical.length === 0 ? (
          <div className="fleet-nominal-state">
            <CheckCircle2 size={36} className="text-success" />
            <h4>All Endpoints Operating at Nominal Baseline</h4>
            <p>No silent degradation, tail-latency inflation, or anomalous thread pool saturation detected across your fleet.</p>
          </div>
        ) : (
          <div className="radar-cards-grid">
            {degradingOrCritical.map((m) => (
              <div key={m.monitor_id} className={`radar-service-card ${m.severity}`}>
                <div className="service-card-header">
                  <div>
                    <div className="service-title-row">
                      <h5>{m.monitor_name}</h5>
                      <span className={`severity-badge ${m.severity}`}>
                        {m.severity.replace('_', ' ')}
                      </span>
                    </div>
                    <code className="service-url">{m.url}</code>
                  </div>
                  <div className="service-drift-score">
                    <strong>+{m.drift_percentage}%</strong>
                    <small>Latency Creep</small>
                  </div>
                </div>

                <p className="service-diag">{m.sre_diagnosis}</p>

                <div className="service-stats-bar">
                  <div>
                    <small>Current Response</small>
                    <span>{m.current_response_time || '—'} ms</span>
                  </div>
                  <div>
                    <small>Historical p95</small>
                    <span>{m.baseline_p95} ms</span>
                  </div>
                  <div>
                    <small>Recent p95</small>
                    <span className="text-danger">{m.recent_p95} ms</span>
                  </div>
                  <div>
                    <small>Predictive Risk</small>
                    <span className="risk-tag">{m.predictive_risk_score}/100</span>
                  </div>
                </div>

                <div className="service-footer">
                  {m.estimated_time_to_timeout_hours && (
                    <span className="forecast-tag">
                      <Clock size={11} /> Est. ~{m.estimated_time_to_timeout_hours}h to timeout limit
                    </span>
                  )}
                  {onOpenMonitor && (
                    <button
                      type="button"
                      className="inspect-btn"
                      onClick={() => onOpenMonitor(m.monitor_id)}
                    >
                      Inspect Deep Diagnostics <ArrowUpRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
