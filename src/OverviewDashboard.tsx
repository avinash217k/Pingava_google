import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowRight, Check, CheckCircle2, Clock3, Code2, Copy, ExternalLink, Globe2,
  HeartPulse, Lock, MoreHorizontal, Pause, Play, Plus, RefreshCw, ShieldCheck, Trash2, TriangleAlert, X,
} from 'lucide-react'
import { api, userFacingError, type Dashboard, type Incident, type Monitor, type StatusPage, type User } from './api'
import { publicHref } from './appConfig'
import { formatResponseDuration } from './formatDuration'
import './OverviewDashboard.css'

type Range = '24h' | '7d' | '30d'
type MonitorFilter = 'all' | 'up' | 'down' | 'paused'
type IncidentFilter = 'active' | 'resolved' | 'all'
type Metrics = {
  checks: number; successful_checks: number; failed_checks: number; uptime: number | null
  average_response_time: number | null; p95_response_time: number | null; slowest_response_time: number | null
  incident_count: number; downtime_seconds: number
}
type SeriesPoint = {
  monitor_id: number | null; checked_at: string; response_time: number; ok: boolean
  status_code: number | null; error: string | null; sample_count: number; aggregated: boolean
}
type AnalyticsData = {
  range: Range; period_start: string; period_end: string; summary: Metrics
  monitors: ({ id: number; name: string } & Metrics)[]; series: SeriesPoint[]
}
type Props = {
  user: User; dashboard: Dashboard; onAddMonitor: () => void; onOpenMonitor: (id: number) => void
  onNavigate: (view: any) => void
  onMonitorAction: (monitor: Monitor, action: 'toggle' | 'check' | 'delete') => Promise<void>
}

const ranges: { id: Range; label: string; description: string }[] = [
  { id: '24h', label: '24h', description: 'Last 24 hours' },
  { id: '7d', label: '7d', description: 'Last 7 days' },
  { id: '30d', label: '30d', description: 'Last 30 days' },
]

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

function relativeTime(value: string | null) {
  if (!value) return 'Waiting'
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function incidentAge(incident: Incident) {
  const end = incident.resolved_at ? new Date(incident.resolved_at).getTime() : Date.now()
  const minutes = Math.max(1, Math.round((end - new Date(incident.started_at).getTime()) / 60000))
  if (minutes < 60) return `${minutes} min`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr`
  return `${Math.floor(minutes / 1440)} day`
}

function niceMaximum(value: number) {
  if (value <= 0) return 1000
  const target = value * 1.15
  const power = 10 ** Math.floor(Math.log10(target))
  const normalized = target / power
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return step * power
}

function formatChartDuration(milliseconds: number | null | undefined) {
  if (milliseconds == null || !Number.isFinite(milliseconds)) return '—'
  if (milliseconds < 1) return `${Math.max(1, Math.round(milliseconds * 1000))} µs`
  if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`
  if (milliseconds < 60_000) return `${Number((milliseconds / 1000).toFixed(2))} s`
  const totalSeconds = Math.round(milliseconds / 1000)
  return `${Math.floor(totalSeconds / 60)}m ${String(totalSeconds % 60).padStart(2, '0')}s`
}

function percentile(values: number[], fraction: number) {
  if (!values.length) return null
  const position = (values.length - 1) * fraction
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return values[lower]
  return values[lower] + (values[upper] - values[lower]) * (position - lower)
}

function timeLabel(value: number, range: Range) {
  const date = new Date(value)
  if (range === '24h') return date.toLocaleTimeString([], { hour: 'numeric' })
  if (range === '7d') return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function safeHost(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function FirstMonitorState({ firstName, onAddMonitor }: { firstName: string; onAddMonitor: () => void }) {
  return <div className="overview-dashboard overview-first-monitor">
    <header className="overview-welcome"><div><h1>{greeting()}, {firstName}</h1><p>Let&apos;s start monitoring your first service.</p></div></header>
    <section className="overview-onboarding">
      <div className="overview-onboarding-visual" aria-hidden="true"><Globe2 size={28} /><Activity size={38} /></div>
      <h2>Nothing to monitor yet</h2>
      <p>Add your first website or API endpoint and Pingava will start checking its uptime and response time. You&apos;ll get alerted when something goes wrong.</p>
      <button className="primary-btn" onClick={onAddMonitor}><Plus size={16} />Create your first monitor <ArrowRight size={15} /></button>
      <div className="overview-monitor-choices">
        <button onClick={onAddMonitor}><Globe2 size={18} /><span><strong>Monitor a website</strong><small>Check any URL over HTTP/HTTPS</small></span></button>
        <button onClick={onAddMonitor}><Code2 size={18} /><span><strong>Monitor an API</strong><small>GET, POST, PUT and more</small></span></button>
      </div>
      <div className="overview-next-steps">
        <h3>What happens next?</h3>
        <ol>
          <li><b>1</b><span><strong>We monitor</strong><small>Pingava checks your service at the configured interval.</small></span></li>
          <li><b>2</b><span><strong>You get alerted</strong><small>Get notified when a confirmed outage occurs.</small></span></li>
          <li><b>3</b><span><strong>Stay ahead</strong><small>Track incidents, uptime and recovery automatically.</small></span></li>
        </ol>
      </div>
    </section>
  </div>
}

export function OverviewDashboard({ user, dashboard, onAddMonitor, onOpenMonitor, onNavigate, onMonitorAction }: Props) {
  const monitors = dashboard.monitors
  const incidents = dashboard.incidents
  const firstName = user.name.trim().split(/\s+/)[0] || 'there'
  const [range, setRange] = useState<Range>('24h')
  const [chartMonitor, setChartMonitor] = useState<'all' | number>('all')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [statusPage, setStatusPage] = useState<StatusPage | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(monitors.length > 0)
  const [analyticsError, setAnalyticsError] = useState('')
  const [monitorFilter, setMonitorFilter] = useState<MonitorFilter>('all')
  const [incidentFilter, setIncidentFilter] = useState<IncidentFilter>('active')
  const [tipVisible, setTipVisible] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)
  const effectiveChartMonitor = chartMonitor === 'all' || monitors.some((monitor) => monitor.id === chartMonitor) ? chartMonitor : 'all'

  useEffect(() => {
    if (!monitors.length) return
    let cancelled = false
    const monitorQuery = effectiveChartMonitor === 'all' ? '' : `&monitor_id=${effectiveChartMonitor}`
    void api<AnalyticsData>(`/analytics?range=${range}${monitorQuery}`).then((metrics) => {
      if (cancelled) return
      setAnalytics(metrics)
      setAnalyticsError('')
    }).catch((reason) => {
      if (!cancelled) setAnalyticsError(userFacingError(reason, "We couldn't retrieve response-time history."))
    }).finally(() => {
      if (!cancelled) setAnalyticsLoading(false)
    })
    return () => { cancelled = true }
  }, [effectiveChartMonitor, monitors.length, range, reloadVersion])
  useEffect(() => { void api<StatusPage | null>('/status-page').then(setStatusPage).catch(() => setStatusPage(null)) }, [])

  const reloadAnalytics = () => { setAnalyticsLoading(true); setReloadVersion((value) => value + 1) }

  const counts = useMemo(() => ({
    all: monitors.length,
    up: monitors.filter((monitor) => monitor.status === 'up').length,
    down: monitors.filter((monitor) => monitor.status === 'down').length,
    paused: monitors.filter((monitor) => monitor.status === 'paused').length,
  }), [monitors])
  const allPaused = monitors.length > 0 && counts.paused === monitors.length
  const hasCompletedCheck = dashboard.recent_checks.length > 0 || monitors.some((monitor) => monitor.last_checked_at)
  const waitingForFirstCheck = monitors.length > 0 && !hasCompletedCheck && !allPaused
  const openIncidents = incidents.filter((incident) => !incident.resolved_at && incident.status !== 'dismissed')
  const visibleMonitors = monitors.filter((monitor) => monitorFilter === 'all' || monitor.status === monitorFilter).slice(0, 6)
  const visibleIncidents = incidents.filter((incident) => incidentFilter === 'all' || (incidentFilter === 'active' ? !incident.resolved_at : Boolean(incident.resolved_at))).slice(0, 3)
  const httpsMonitors = monitors.filter((monitor) => monitor.url.startsWith('https://'))
  const expiringSslMonitors = httpsMonitors.filter((monitor) => monitor.ssl_status === 'expiring' || (monitor.ssl_days_remaining !== null && monitor.ssl_days_remaining <= 30 && monitor.ssl_days_remaining > 0))
  const expiredSslMonitors = httpsMonitors.filter((monitor) => monitor.ssl_status === 'expired' || (monitor.ssl_days_remaining !== null && monitor.ssl_days_remaining <= 0))
  const [overdueHeartbeats, setOverdueHeartbeats] = useState<any[]>([])

  useEffect(() => {
    api<any>('/heartbeats').then((res) => {
      const overdue = (res.heartbeats || []).filter((h: any) => h.status === 'down' || h.status === 'late')
      setOverdueHeartbeats(overdue)
    }).catch(() => {})
  }, [])
  const selectedMonitor = effectiveChartMonitor === 'all' ? null : monitors.find((monitor) => monitor.id === effectiveChartMonitor) || null
  const selectedPeriod = ranges.find((item) => item.id === range)!
  const periodEmpty = Boolean(analytics && analytics.summary.checks === 0 && hasCompletedCheck && !waitingForFirstCheck)
  const statusUrl = statusPage ? publicHref(`/status/${statusPage.slug}`) : ''
  const chartMetrics = useMemo(() => {
    const seriesList = Array.isArray(analytics?.series) ? analytics.series : []
    const values = seriesList.map((point) => point.response_time).filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
    return {
      average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
      median: percentile(values, .5),
      p95: percentile(values, .95),
      p99: percentile(values, .99),
      fastest: values[0] ?? null,
      slowest: values.at(-1) ?? null,
    }
  }, [analytics])

  const chart = useMemo(() => {
    if (!Array.isArray(analytics?.series) || !analytics.series.length || !analytics.period_start || !analytics.period_end) return null
    const width = 820; const height = 196; const left = 58; const right = 14; const top = 10; const bottom = 30
    const start = new Date(analytics.period_start).getTime(); const end = new Date(analytics.period_end).getTime()
    const highest = Math.max(...analytics.series.map((point) => point.response_time), selectedMonitor?.response_time_threshold_ms || 0)
    const maximum = niceMaximum(highest)
    const x = (time: string | number) => left + ((typeof time === 'number' ? time : new Date(time).getTime()) - start) / Math.max(end - start, 1) * (width - left - right)
    const y = (value: number) => top + (1 - value / maximum) * (height - top - bottom)
    const line = analytics.series.map((point) => `${x(point.checked_at)},${y(point.response_time)}`).join(' ')
    const area = `${left},${height - bottom} ${line} ${x(analytics.series.at(-1)!.checked_at)},${height - bottom}`
    const yTicks = Array.from({ length: 5 }, (_, index) => maximum * (4 - index) / 4)
    const xTicks = Array.from({ length: 6 }, (_, index) => start + (end - start) * index / 5)
    return { width, height, left, right, top, bottom, start, end, x, y, line, area, yTicks, xTicks }
  }, [analytics, selectedMonitor])

  const hoveredCheck = hoveredPoint == null || !Array.isArray(analytics?.series) ? null : analytics?.series[hoveredPoint] || null
  const hoveredMonitor = hoveredCheck?.monitor_id ? monitors.find((monitor) => monitor.id === hoveredCheck.monitor_id) : null
  const nearestChartPoint = (time: number) => {
    if (!Array.isArray(analytics?.series) || !analytics.series.length) return null
    return analytics.series.reduce((nearest, point) => Math.abs(new Date(point.checked_at).getTime() - time) < Math.abs(new Date(nearest.checked_at).getTime() - time) ? point : nearest)
  }
  const chartIncidents = incidents.filter((incident) => {
    if (!chart) return false
    if (selectedMonitor && Number(incident.monitor_id) !== Number(selectedMonitor.id)) return false
    const started = new Date(incident.started_at).getTime()
    const resolved = incident.resolved_at ? new Date(incident.resolved_at).getTime() : null
    return (started >= chart.start && started <= chart.end) || (resolved != null && resolved >= chart.start && resolved <= chart.end)
  }).slice(0, 12)

  if (!monitors.length) return <FirstMonitorState firstName={firstName} onAddMonitor={onAddMonitor} />

  const renderChartBody = () => {
    if (analyticsLoading) return <div className="overview-chart-skeleton" aria-label="Loading response-time chart" />
    if (analyticsError) return <div className="overview-chart-state error"><TriangleAlert size={25} /><strong>Unable to load response-time data</strong><span>{analyticsError}</span><button className="secondary-btn" onClick={reloadAnalytics}><RefreshCw size={14} />Try again</button></div>
    if (waitingForFirstCheck) return <div className="overview-chart-state waiting"><span className="overview-waiting-icon"><Activity size={30} /><Clock3 size={14} /></span><strong>Monitoring started · First check pending</strong><p>Pingava will show response-time data after your monitor completes its first check. This usually takes a few minutes.</p><div className="overview-progress" aria-label="Monitor created; checks and response data pending"><span className="done">Monitor created</span><span>Running checks</span><span>Data will appear here</span></div></div>
    if (periodEmpty) return <div className="overview-chart-state"><Activity size={25} /><strong>No response-time data for the {selectedPeriod.description.toLowerCase()}</strong><p>We couldn&apos;t find any checks in this time range. Try a longer period to see data from your monitors.</p><div>{range === '24h' && <button className="secondary-btn" onClick={() => setRange('7d')}>View 7d</button>}<button className="secondary-btn" onClick={() => setRange('30d')}>View 30d</button></div></div>
    if (!chart || !analytics) return <div className="overview-chart-state"><Activity size={25} /><strong>No response data yet</strong><p>Response trends appear after checks run.</p></div>
    return <div className="overview-chart" onMouseLeave={() => setHoveredPoint(null)} onMouseMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      const time = chart.start + Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)) * (chart.end - chart.start)
      let nearest = 0
      analytics.series.forEach((point, index) => { if (Math.abs(new Date(point.checked_at).getTime() - time) < Math.abs(new Date(analytics.series[nearest].checked_at).getTime() - time)) nearest = index })
      setHoveredPoint(nearest)
    }}>
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} preserveAspectRatio="none" role="img" aria-label={`Response time for ${selectedMonitor?.name || 'all monitors'}, ${selectedPeriod.description}`}>
        <defs><linearGradient id="overviewArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#45d6a1" stopOpacity=".06"/><stop offset="1" stopColor="#45d6a1" stopOpacity=".11"/></linearGradient></defs>
        {chart.yTicks.map((tick) => <g key={tick}><line className="grid-line" x1={chart.left} y1={chart.y(tick)} x2={chart.width - chart.right} y2={chart.y(tick)} /><text className="axis-label y-label" x={chart.left - 10} y={chart.y(tick) + 4}>{formatChartDuration(tick)}</text></g>)}
        {chart.xTicks.map((tick) => <text className="axis-label x-label" key={tick} x={chart.x(tick)} y={chart.height - 9}>{timeLabel(tick, range)}</text>)}
        {selectedMonitor?.response_time_threshold_ms != null && <g><line className="threshold-line" x1={chart.left} y1={chart.y(selectedMonitor.response_time_threshold_ms)} x2={chart.width - chart.right} y2={chart.y(selectedMonitor.response_time_threshold_ms)} /><text className="threshold-label" x={chart.width - chart.right} y={chart.y(selectedMonitor.response_time_threshold_ms) - 6}>Response threshold · {formatChartDuration(selectedMonitor.response_time_threshold_ms)}</text></g>}
        <polygon className="chart-area" points={chart.area} /><polyline className="chart-line" points={chart.line} />
        {chartIncidents.map((incident) => { const started = new Date(incident.started_at).getTime(); const resolved = incident.resolved_at ? new Date(incident.resolved_at).getTime() : null; const name = monitors.find((item) => Number(item.id) === Number(incident.monitor_id))?.name || 'Monitor'; const startedPoint = nearestChartPoint(started); const resolvedPoint = resolved == null ? null : nearestChartPoint(resolved); return <g key={`event-${incident.id}`}>{startedPoint && started >= chart.start && started <= chart.end && <><line className="event-line incident" x1={chart.x(started)} y1={chart.top} x2={chart.x(started)} y2={chart.y(startedPoint.response_time)} /><circle className="event-dot incident" cx={chart.x(started)} cy={chart.y(startedPoint.response_time)} r="4"><title>Incident started: {name} · {incident.cause}</title></circle></>}{resolvedPoint && resolved != null && resolved >= chart.start && resolved <= chart.end && <><line className="event-line recovery" x1={chart.x(resolved)} y1={chart.top} x2={chart.x(resolved)} y2={chart.y(resolvedPoint.response_time)} /><circle className="event-dot recovery" cx={chart.x(resolved)} cy={chart.y(resolvedPoint.response_time)} r="4"><title>Incident recovered: {name} · Duration {incidentAge(incident)}</title></circle></>}</g> })}
        {hoveredCheck && <g><line className="hover-line" x1={chart.x(hoveredCheck.checked_at)} y1={chart.top} x2={chart.x(hoveredCheck.checked_at)} y2={chart.height - chart.bottom}/><circle className="hover-dot" cx={chart.x(hoveredCheck.checked_at)} cy={chart.y(hoveredCheck.response_time)} r="4" /></g>}
      </svg>
      {hoveredCheck && <div className="overview-chart-tooltip" style={{ left: `${Math.max(18, Math.min(82, (chart.x(hoveredCheck.checked_at) / chart.width) * 100))}%` }}><strong>{formatChartDuration(hoveredCheck.response_time)}</strong><span>{hoveredCheck.aggregated ? `All monitors · ${hoveredCheck.sample_count} checks` : hoveredMonitor?.name || selectedMonitor?.name || 'Monitor'}</span><span className={hoveredCheck.ok ? 'up' : 'down'}>{hoveredCheck.status_code ? `${hoveredCheck.status_code} ${hoveredCheck.ok ? 'OK' : 'Failed'}` : hoveredCheck.ok ? 'All checks passed' : hoveredCheck.error || 'Check failed'} · {hoveredCheck.ok ? 'Up' : 'Failed'}</span><time>{new Date(hoveredCheck.checked_at).toLocaleString()}</time></div>}
    </div>
  }

  return <div className="overview-dashboard">
    <header className="overview-welcome"><div><h1>{greeting()}, {firstName}</h1><p>{allPaused ? 'Your monitors are currently paused.' : waitingForFirstCheck ? "Your monitors are set up. We're starting to collect data." : "Here's how your services are doing."}</p></div></header>
    <section className="overview-kpis" aria-label="Current service health">
      {analyticsLoading && !analytics ? Array.from({ length: 4 }, (_, index) => <article className="overview-kpi-loading" key={index}><span className="overview-kpi-icon" /><div><i /><b /><i /></div></article>) : <>
        <button type="button" onClick={() => onNavigate('monitors')}><span className={`overview-kpi-icon ${!counts.all ? 'paused' : allPaused ? 'paused' : 'up'}`}>{allPaused ? <Pause size={20} /> : <Check size={21} />}</span><div><span>{allPaused ? 'Total monitors' : 'Operational'}</span><strong>{!counts.all ? '0' : allPaused ? counts.all : counts.up}</strong><small>{!counts.all ? 'No monitors configured' : allPaused ? 'All paused' : counts.down ? `${counts.down} ${counts.down === 1 ? 'service needs' : 'services need'} attention` : 'All systems running'}</small></div></button>
        <button type="button" onClick={() => onNavigate('monitors')}><span className="overview-kpi-icon down"><TriangleAlert size={20} /></span><div><span>Down</span><strong>{counts.down}</strong><small>{counts.down ? 'Needs attention' : 'No outages detected'}</small></div></button>
        <button type="button" onClick={() => onNavigate('incidents')}><span className="overview-kpi-icon incident"><Activity size={20} /></span><div><span>Incidents</span><strong>{openIncidents.length}</strong><small>{openIncidents.length ? `Active ${openIncidents.length === 1 ? 'incident' : 'incidents'}` : 'No active incidents'}</small></div></button>
        <article className={analytics?.summary.uptime != null && analytics.summary.uptime < 95 ? 'overview-kpi-warning' : ''}><span className="overview-kpi-icon uptime"><ShieldCheck size={20} /></span><div><span>Overall uptime</span><strong>{analyticsLoading || analytics?.summary.uptime == null || !counts.all ? '—' : `${analytics.summary.uptime.toFixed(2)}%`}</strong><small>{analyticsLoading ? 'Updating selected period' : analytics?.summary.uptime == null || !counts.all ? 'No monitors available' : selectedPeriod.description}</small></div></article>
      </>}
    </section>
    <section className="overview-chart-card">
      <div className="overview-card-heading overview-response-heading"><div><h2>Response time</h2><p>{analyticsLoading && !analytics ? 'Loading response history' : waitingForFirstCheck ? 'Waiting for the first check' : `${analytics?.summary.checks || 0} checks · ${selectedPeriod.description}`}</p></div><div className="overview-chart-controls"><div className="overview-range" role="tablist" aria-label="Response-time period">{ranges.map((item) => <button key={item.id} role="tab" aria-selected={range === item.id} className={range === item.id ? 'active' : ''} onClick={() => { setAnalyticsLoading(true); setRange(item.id) }}>{item.label}</button>)}</div><select aria-label="Monitor shown in response-time graph" value={effectiveChartMonitor} onChange={(event) => { setAnalyticsLoading(true); setChartMonitor(event.target.value === 'all' ? 'all' : Number(event.target.value)) }}><option value="all">All monitors</option>{monitors.map((monitor) => <option value={monitor.id} key={monitor.id}>{monitor.name}</option>)}</select><button className="overview-refresh" aria-label="Refresh response-time data" title="Refresh" disabled={analyticsLoading} onClick={reloadAnalytics}><RefreshCw className={analyticsLoading ? 'spin' : ''} size={15} /></button></div></div>
      {!waitingForFirstCheck && !analyticsError && <div className="overview-response-metrics"><div><strong>{formatChartDuration(analyticsLoading ? null : chartMetrics.average)}</strong><span>Average</span></div><div><strong>{formatChartDuration(analyticsLoading ? null : chartMetrics.median)}</strong><span>Median (P50)</span></div><div><strong>{formatChartDuration(analyticsLoading ? null : chartMetrics.p95)}</strong><span>P95</span></div><div><strong>{formatChartDuration(analyticsLoading ? null : chartMetrics.p99)}</strong><span>P99</span></div><div><strong>{formatChartDuration(analyticsLoading ? null : chartMetrics.fastest)}</strong><span>Fastest</span></div><div><strong>{formatChartDuration(analyticsLoading ? null : chartMetrics.slowest)}</strong><span>Slowest</span></div></div>}
      {allPaused && <div className="overview-paused-banner"><Pause size={16} /><span><strong>Monitoring is currently paused</strong><small>Your monitors are paused, so no new checks are being run. Historical data remains visible.</small></span><button className="secondary-btn" onClick={() => onNavigate('monitors')}><Play size={14} />Manage monitors</button></div>}
      <div className="overview-chart-frame">{renderChartBody()}</div>
    </section>
    {(expiredSslMonitors.length > 0 || expiringSslMonitors.length > 0) && (
      <div
        className="overview-ssl-alert-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: '8px',
          background: expiredSslMonitors.length > 0 ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${expiredSslMonitors.length > 0 ? '#fecaca' : '#fde68a'}`,
          color: expiredSslMonitors.length > 0 ? '#991b1b' : '#92400e',
          margin: '0 0 16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={18} />
          <span>
            <strong>SSL Certificate Guardian: </strong>
            {expiredSslMonitors.length > 0
              ? `${expiredSslMonitors.length} certificate${expiredSslMonitors.length > 1 ? 's have' : ' has'} expired!`
              : `${expiringSslMonitors.length} certificate${expiringSslMonitors.length > 1 ? 's are' : ' is'} expiring soon.`}
            {' '}({ (expiredSslMonitors[0] || expiringSslMonitors[0]).name } - { (expiredSslMonitors[0] || expiringSslMonitors[0]).ssl_days_remaining !== null ? `${(expiredSslMonitors[0] || expiringSslMonitors[0]).ssl_days_remaining}d remaining` : 'Expired' })
          </span>
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => onOpenMonitor((expiredSslMonitors[0] || expiringSslMonitors[0]).id)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Inspect Certificate <ArrowRight size={13} />
        </button>
      </div>
    )}
    {overdueHeartbeats.length > 0 && (
      <div
        className="overview-hb-alert-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: '8px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          margin: '0 0 16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={18} />
          <span>
            <strong>Cron Heartbeat Alert: </strong>
            {overdueHeartbeats.length === 1
              ? `"${overdueHeartbeats[0].name}" missed its scheduled check-in window!`
              : `${overdueHeartbeats.length} background jobs are overdue or missed their check-in.`}
          </span>
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => onNavigate('heartbeats')}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          View Heartbeats <ArrowRight size={13} />
        </button>
      </div>
    )}
    <div className="overview-grid">
      <section className="overview-card overview-monitors">
        <div className="overview-card-heading"><div><h2>Monitors</h2><p>{counts.all} of {dashboard.limit} monitors used</p></div><button className="overview-link" onClick={() => onNavigate('monitors')}>View all <ArrowRight size={14} /></button></div>
        <div className="overview-filters" role="tablist" aria-label="Monitor status">{(['all', 'up', 'down', 'paused'] as MonitorFilter[]).map((filter) => <button key={filter} role="tab" aria-selected={monitorFilter === filter} className={monitorFilter === filter ? 'active' : ''} onClick={() => setMonitorFilter(filter)}>{filter === 'all' ? 'All' : filter[0].toUpperCase() + filter.slice(1)} <span>{counts[filter]}</span></button>)}</div>
        <div className="overview-monitor-table"><div className="overview-monitor-head"><span>Name</span><span>Status</span><span>Uptime</span><span>Response</span><span>Last checked</span><span /></div>{visibleMonitors.map((monitor) => <div className={`overview-monitor-row ${monitor.status === 'down' ? 'needs-attention' : ''}`} role="button" tabIndex={0} key={monitor.id} onClick={() => onOpenMonitor(monitor.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenMonitor(monitor.id) } }}><div className="overview-monitor-name"><i className={monitor.status} /><span><strong>{monitor.name}</strong><small>{monitor.http_method} {safeHost(monitor.url)}{monitor.ssl_days_remaining !== null && monitor.ssl_days_remaining <= 30 && <span style={{ color: monitor.ssl_days_remaining <= 7 ? '#ef4444' : '#d97706', fontWeight: 600, marginLeft: 6 }}>· SSL {monitor.ssl_days_remaining <= 0 ? 'Expired' : `${monitor.ssl_days_remaining}d`}</span>}</small></span></div><span><b className={`overview-status ${monitor.status}`}>{monitor.status === 'up' ? 'Up' : monitor.status === 'down' ? 'Down' : monitor.status === 'paused' ? 'Paused' : 'Pending'}</b></span><span>{monitor.last_checked_at ? `${(monitor.uptime ?? 100).toFixed(2)}%` : '—'}</span><span>{formatResponseDuration(monitor.response_time)}</span><span>{relativeTime(monitor.last_checked_at)}</span><span className="overview-row-actions" onClick={(event) => event.stopPropagation()}><details><summary aria-label={`Actions for ${monitor.name}`}><MoreHorizontal size={16} /></summary><div><button disabled={monitor.status === 'paused'} onClick={() => void onMonitorAction(monitor, 'check')}><RefreshCw size={14} />Run check</button><button onClick={() => void onMonitorAction(monitor, 'toggle')}>{monitor.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}{monitor.status === 'paused' ? 'Resume' : 'Pause'}</button><button className="danger" onClick={() => void onMonitorAction(monitor, 'delete')}><Trash2 size={14} />Delete</button></div></details></span></div>)}{!visibleMonitors.length && <div className="overview-empty compact"><Activity size={23} /><strong>No {monitorFilter} monitors</strong><span>Choose another filter to view your services.</span></div>}</div>
      </section>
      <div className="overview-side-stack">
        <section className="overview-card overview-incidents"><div className="overview-card-heading"><div><h2>Incidents</h2><p>Service interruptions</p></div><button className="overview-link" onClick={() => onNavigate('incidents')}>View all <ArrowRight size={14} /></button></div><div className="overview-filters" role="tablist" aria-label="Incident status">{(['active', 'resolved', 'all'] as IncidentFilter[]).map((filter) => { const count = filter === 'active' ? openIncidents.length : filter === 'resolved' ? incidents.length - openIncidents.length : incidents.length; return <button key={filter} role="tab" aria-selected={incidentFilter === filter} className={incidentFilter === filter ? 'active' : ''} onClick={() => setIncidentFilter(filter)}>{filter[0].toUpperCase() + filter.slice(1)} <span>{count}</span></button> })}</div><div className="overview-incident-list">{visibleIncidents.map((incident) => { const monitor = monitors.find((item) => Number(item.id) === Number(incident.monitor_id)); return <article className={incident.resolved_at ? 'resolved' : ''} key={incident.id}><span><TriangleAlert size={16} /></span><div><strong>{monitor?.name || 'Deleted monitor'}</strong><p title={incident.cause}>{incident.cause}</p><small><Clock3 size={12} />{incident.resolved_at ? 'Resolved' : 'Started'} {incidentAge(incident)} ago · {incident.resolved_at ? 'Resolved' : `Ongoing for ${incidentAge(incident)}`}</small><button onClick={() => onNavigate('incidents')}>View incident <ArrowRight size={12} /></button></div><b>{incident.resolved_at ? 'Resolved' : 'Ongoing'}</b></article> })}{!visibleIncidents.length && <div className="overview-empty compact"><CheckCircle2 size={23} /><strong>{incidentFilter === 'active' ? 'Everything looks good.' : 'No incidents found'}</strong><span>{incidentFilter === 'active' ? 'No active incidents right now.' : 'Nothing matches this filter yet.'}</span></div>}</div></section>
        <section className="overview-card overview-status-page"><div className="overview-card-heading"><div><h2>Status page</h2><p>Keep users informed</p></div>{statusPage && <button className="overview-link" onClick={() => onNavigate('status')}>Manage <ArrowRight size={14} /></button>}</div>{statusPage ? <div className="overview-status-summary"><span className={`overview-status-icon ${statusPage.overall_status}`}><Globe2 size={18} /></span><div><strong>{statusPage.title}</strong><small className="status-url" title={statusUrl}>{statusUrl}</small><small>{statusPage.monitors.length} {statusPage.monitors.length === 1 ? 'service' : 'services'} · {statusPage.overall_status === 'down' ? 'Service disruption' : statusPage.overall_status === 'pending' ? 'Checking services' : 'Operational'}</small></div><span className="overview-status-actions"><a href={statusUrl} target="_blank" rel="noreferrer">View page <ExternalLink size={13} /></a><button aria-label="Copy status page link" title="Copy link" onClick={() => void navigator.clipboard.writeText(statusUrl)}><Copy size={14} /></button></span></div> : <div className="overview-empty compact status-compact"><Globe2 size={22} /><strong>Keep users informed during incidents.</strong><button className="overview-link" onClick={() => onNavigate('status')}>Create status page <ArrowRight size={14} /></button></div>}</section>
      </div>
    </div>
    {tipVisible && !statusPage && <aside className="overview-tip"><span><Globe2 size={18} /></span><div><strong>Keep your users informed during incidents.</strong><p>Build trust with a public status page in seconds.</p></div><button className="secondary-btn" onClick={() => onNavigate('status')}>Create status page <ArrowRight size={14} /></button><button className="overview-tip-close" title="Dismiss" aria-label="Dismiss status page suggestion" onClick={() => setTipVisible(false)}><X size={15} /></button></aside>}
  </div>
}
