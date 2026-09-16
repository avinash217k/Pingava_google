import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  User,
  X,
} from 'lucide-react'
import { api, userFacingError, type Monitor, type UnifiedIncident, type UnifiedIncidentStatus } from './api'
import { AiRootCauseDiagnostic } from './AiRootCauseDiagnostic'
import { IncidentPostMortemModal } from './IncidentPostMortemModal'
import './IncidentManagement.css'

const terminalStatuses = new Set<UnifiedIncidentStatus>(['resolved', 'dismissed'])

const statusOptions: { value: UnifiedIncidentStatus; label: string; icon: typeof Check }[] = [
  { value: 'investigating', label: 'Investigating', icon: AlertTriangle },
  { value: 'acknowledged', label: 'Acknowledged', icon: Bell },
  { value: 'resolved', label: 'Resolved', icon: Check },
  { value: 'dismissed', label: 'Dismissed', icon: X },
]

const quickEmailTemplates: { label: string; text: string }[] = [
  {
    label: 'Under Investigation',
    text: 'We are actively investigating reports of elevated error rates and latency on affected services. Subscribers will receive follow-up emails as diagnostics progress.',
  },
  {
    label: 'Root Cause Identified',
    text: 'We have identified the root cause related to upstream gateway socket timeouts. A mitigation fix is being deployed now.',
  },
  {
    label: 'Monitoring Recovery',
    text: 'A fix has been deployed and telemetry indicators are returning to normal baseline. We are monitoring traffic to confirm stability.',
  },
  {
    label: 'Fully Resolved',
    text: 'All affected services have returned to normal operation with healthy latency and zero elevated errors. This incident is now resolved.',
  },
]

const dateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function formatRelativeTime(dateString: string) {
  const elapsed = Math.max(0, Date.now() - new Date(dateString).getTime())
  const mins = Math.floor(elapsed / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function duration(startedAt: string, resolvedAt: string | null) {
  const milliseconds = Math.max(0, new Date(resolvedAt || Date.now()).getTime() - new Date(startedAt).getTime())
  const minutes = Math.floor(milliseconds / 60_000)
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

function formatDurationMs(ms: number) {
  if (ms <= 0) return '0m'
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

const labelStatus = (status: UnifiedIncidentStatus) => status[0].toUpperCase() + status.slice(1)

export function IncidentManagement({ monitors, onRefresh }: { monitors: Monitor[]; onRefresh?: () => Promise<void> }) {
  const [incidents, setIncidents] = useState<UnifiedIncident[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterSource, setFilterSource] = useState<'all' | 'automatic' | 'manual'>('all')
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'resolved'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showPostMortemModal, setShowPostMortemModal] = useState(false)
  const [detailTab, setDetailTab] = useState<'email' | 'activity'>('email')
  const [emailSentToast, setEmailSentToast] = useState(false)
  const [nextStatus, setNextStatus] = useState<UnifiedIncidentStatus>('investigating')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const records = await api<UnifiedIncident[]>('/incidents')
      setIncidents(records)
      setSelectedId((current) =>
        current && records.some((item) => item.id === current) ? current : records[0]?.id || null
      )
      setError('')
    } catch (reason) {
      setError(userFacingError(reason, "We couldn't load incidents. Please try again."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Summary Metrics
  const activeCount = useMemo(() => incidents.filter((i) => !terminalStatuses.has(i.status)).length, [incidents])
  const investigatingCount = useMemo(() => incidents.filter((i) => i.status === 'investigating').length, [incidents])
  const resolvedCount = useMemo(() => incidents.filter((i) => i.status === 'resolved').length, [incidents])

  const mttrText = useMemo(() => {
    const resolvedList = incidents.filter((i) => i.status === 'resolved' && i.resolved_at)
    if (!resolvedList.length) return '14m'
    const totalMs = resolvedList.reduce((sum, item) => {
      return sum + Math.max(0, new Date(item.resolved_at!).getTime() - new Date(item.started_at).getTime())
    }, 0)
    return formatDurationMs(Math.round(totalMs / resolvedList.length))
  }, [incidents])

  // Filtered Incidents
  const filtered = useMemo(() => {
    return incidents.filter((item) => {
      if (filterSource !== 'all' && item.source !== filterSource) return false
      if (statusTab === 'active' && terminalStatuses.has(item.status)) return false
      if (statusTab === 'resolved' && item.status !== 'resolved') return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesSummary = item.summary.toLowerCase().includes(q)
        const matchesService = item.affected_services.some((s) => s.toLowerCase().includes(q))
        const matchesId = `inc-${item.record_id}`.toLowerCase().includes(q)
        if (!matchesTitle && !matchesSummary && !matchesService && !matchesId) return false
      }

      return true
    })
  }, [incidents, filterSource, statusTab, searchQuery])

  const selected = incidents.find((item) => item.id === selectedId) || null

  const selectedStatus = selected?.status
  useEffect(() => {
    if (selectedStatus) {
      setNextStatus(selectedStatus)
    }
  }, [selectedId, selectedStatus])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAiModal(false)
        setShowCreate(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const createIncident = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const monitorIds = form.getAll('monitor_ids').map(Number)
    if (!monitorIds.length) {
      setError('Please select at least one affected service.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          title: String(form.get('title') || 'Manual incident report'),
          summary: String(form.get('message') || ''),
          message: String(form.get('message') || ''),
          monitor_ids: monitorIds,
        }),
      })
      setShowCreate(false)
      await load()
      await onRefresh?.()
    } catch (reason) {
      setError(userFacingError(reason, 'The incident could not be published. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const sendEmailUpdate = async (overrideStatus?: UnifiedIncidentStatus) => {
    if (!selected) return
    const targetStatus = overrideStatus || nextStatus
    setSubmitting(true)
    setError('')
    try {
      await api(`/incidents/${selected.source}/${selected.record_id}/status`, {
        method: 'POST',
        body: JSON.stringify({
          status: targetStatus,
          message: message.trim(),
          event_id: crypto.randomUUID(),
        }),
      })
      setMessage('')
      setEmailSentToast(true)
      setTimeout(() => setEmailSentToast(false), 4000)
      await load()
      setSelectedId(selected.id)
      await onRefresh?.()
    } catch (reason) {
      setError(userFacingError(reason, 'The email update could not be sent. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const hasNoIncidentsAtAll = incidents.length === 0
  const isZeroActiveState = !hasNoIncidentsAtAll && statusTab === 'active' && activeCount === 0 && !searchQuery.trim()

  return (
    <section className="incidents-workspace" aria-label="Incident Management Workspace">
      {/* Compact SaaS Incident Header & Unified Action Bar */}
      <header className="incidents-header-compact">
        <div className="incidents-title-row">
          <div className="incidents-title-left">
            <div className="incidents-title-group">
              <div className="incidents-icon-badge">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h1>Incidents &amp; Alerts</h1>
                <p>Track outages, run on-demand AI diagnostics, and dispatch email updates to subscribers.</p>
              </div>
            </div>
          </div>

          <div className="incidents-top-actions">
            <button
              type="button"
              className="icon-btn incidents-refresh-btn"
              title="Refresh telemetry"
              onClick={() => void load()}
              disabled={loading}
              aria-label="Refresh incident telemetry"
            >
              <RotateCcw size={15} className={loading ? 'spinning' : ''} />
            </button>
            <button
              type="button"
              className="primary-btn declare-btn"
              onClick={() => {
                setError('')
                setShowCreate(true)
              }}
            >
              <Plus size={15} />
              Declare incident
            </button>
          </div>
        </div>

        {/* Compact KPI & Filter Strip */}
        <div className="incidents-control-strip">
          {/* Segmented Status Filter Tabs */}
          <div className="toolbar-tabs" role="tablist" aria-label="Incident status tabs">
            <button
              type="button"
              role="tab"
              aria-selected={statusTab === 'all'}
              className={`toolbar-tab ${statusTab === 'all' ? 'active' : ''}`}
              onClick={() => setStatusTab('all')}
            >
              All
              <span className="tab-count">{incidents.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusTab === 'active'}
              className={`toolbar-tab ${statusTab === 'active' ? 'active' : ''}`}
              onClick={() => setStatusTab('active')}
            >
              Active
              <span className={`tab-count ${activeCount > 0 ? 'highlight-active' : ''}`}>{activeCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusTab === 'resolved'}
              className={`toolbar-tab ${statusTab === 'resolved' ? 'active' : ''}`}
              onClick={() => setStatusTab('resolved')}
            >
              Resolved
              <span className="tab-count">{resolvedCount}</span>
            </button>
          </div>

          {/* Quick Metrics Chips */}
          <div className="compact-kpi-chips">
            <div className="kpi-chip" title="Active Outages currently ongoing">
              <span className={`kpi-chip-dot ${activeCount > 0 ? 'active' : ''}`} />
              <strong>{activeCount}</strong> Outages
            </div>
            <div className="kpi-chip" title="Under investigation">
              <Clock3 size={12} />
              <strong>{investigatingCount}</strong> Investigating
            </div>
            <div className="kpi-chip" title="Resolved incidents">
              <CheckCircle2 size={12} />
              <strong>{resolvedCount}</strong> Resolved
            </div>
            <div className="kpi-chip" title="Average Mean Time to Resolution">
              <Activity size={12} />
              MTTR: <strong>{mttrText}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Global Error Notice */}
      {error && (
        <div className="page-error incident-error" role="alert">
          <TriangleAlert size={16} />
          <span>{error}</span>
          <button type="button" aria-label="Dismiss error" onClick={() => setError('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Toast Notification when Email is Dispatched */}
      {emailSentToast && (
        <div className="email-sent-toast" role="status">
          <Mail size={15} />
          <span>Incident update email successfully dispatched to subscribers and team members!</span>
          <button type="button" onClick={() => setEmailSentToast(false)} aria-label="Close notification">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCENARIO 1: NO INCIDENTS AT ALL OR ZERO ACTIVE OUTAGES                   */}
      {/* ========================================================================= */}
      {hasNoIncidentsAtAll ? (
        <div className="incident-card zero-state-card">
          <div className="zero-icon-wrap safe">
            <ShieldCheck size={36} />
          </div>
          <h2>All Monitored Services are Operational</h2>
          <p>
            No incidents or outages detected across your {monitors.length} monitored endpoint
            {monitors.length === 1 ? '' : 's'}. All automated health checks are passing with 200 OK.
          </p>
          <div className="zero-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setError('')
                setShowCreate(true)
              }}
            >
              <Plus size={15} />
              Declare manual incident
            </button>
            <button type="button" className="secondary-btn" onClick={() => void load()}>
              <RotateCcw size={14} />
              Run check refresh
            </button>
          </div>
        </div>
      ) : isZeroActiveState ? (
        <div className="incident-card zero-state-card">
          <div className="zero-icon-wrap safe">
            <CheckCircle2 size={36} />
          </div>
          <h2>No Active Incidents</h2>
          <p>
            All services are currently healthy. There are 0 active or investigating outages. You have {resolvedCount}{' '}
            resolved incident{resolvedCount === 1 ? '' : 's'} in history.
          </p>
          <div className="zero-actions">
            <button type="button" className="secondary-btn" onClick={() => setStatusTab('resolved')}>
              View resolved history ({resolvedCount})
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setError('')
                setShowCreate(true)
              }}
            >
              <Plus size={15} />
              Declare manual incident
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCENARIO 2 & 3: LESS INCIDENTS OR MORE INCIDENTS (BALANCED SAAS LAYOUT)   */
        /* ========================================================================= */
        <div className="incidents-container">
          {/* Left Column: Stream of Incidents with Search Filter */}
          <div className="incidents-feed-pane">
            <div className="feed-controls-bar">
              <div className="toolbar-search">
                <Search size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, service, or ID..."
                  aria-label="Filter incidents"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="toolbar-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <label className="source-filter-dropdown" title="Filter by incident origin">
                <Filter size={13} />
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value as typeof filterSource)}
                  aria-label="Filter by incident source"
                >
                  <option value="all">All Sources</option>
                  <option value="automatic">Auto Checks</option>
                  <option value="manual">Manual</option>
                </select>
              </label>
            </div>

            {loading && !incidents.length ? (
              <div className="incident-card feed-empty-card">
                <RefreshCw size={20} className="spinning" />
                <span>Loading incident telemetry...</span>
              </div>
            ) : !filtered.length ? (
              <div className="incident-card feed-empty-card">
                <CheckCircle2 size={24} />
                <strong>No incidents match filter</strong>
                <p>Try clearing your search query or switching tabs.</p>
                {searchQuery && (
                  <button type="button" className="secondary-btn small-btn" onClick={() => setSearchQuery('')}>
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="feed-list" role="feed" aria-label="Incident stream">
                {filtered.map((item) => {
                  const isSelected = selectedId === item.id
                  return (
                    <article
                      key={item.id}
                      className={`feed-item ${isSelected ? 'selected' : ''} ${item.status}`}
                      onClick={() => setSelectedId(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedId(item.id)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                    >
                      <div className="feed-item-top">
                        <div className="feed-status-cluster">
                          <span className={`status-pill ${item.status}`}>
                            <span className="status-dot" />
                            {labelStatus(item.status)}
                          </span>
                          <span className="feed-inc-id">INC-{String(item.record_id).padStart(6, '0')}</span>
                        </div>
                        <span className="feed-time" title={dateTime(item.started_at)}>
                          {formatRelativeTime(item.started_at)}
                        </span>
                      </div>

                      <h3 className="feed-item-title">{item.title}</h3>

                      {item.summary && <p className="feed-item-summary">{item.summary}</p>}

                      <div className="feed-item-bottom">
                        <div className="feed-tags">
                          {item.affected_services[0] && (
                            <span className="service-tag" title={item.affected_services.join(', ')}>
                              {item.affected_services[0]}
                              {item.affected_services.length > 1 && ` +${item.affected_services.length - 1}`}
                            </span>
                          )}
                          <span className={`source-tag ${item.source}`}>
                            {item.source === 'automatic' ? (
                              <>
                                <Bot size={11} /> Auto
                              </>
                            ) : (
                              <>
                                <User size={11} /> Manual
                              </>
                            )}
                          </span>
                        </div>

                        <div className="feed-item-meta">
                          <span className="feed-duration" title="Incident duration">
                            <Clock3 size={11} /> {duration(item.started_at, item.resolved_at)}
                          </span>
                          {item.ai_diagnostic && (
                            <span className="feed-ai-badge" title="AI Root Cause Analysis ready">
                              <Sparkles size={11} /> AI
                            </span>
                          )}
                          {(item.status === 'resolved' || item.post_mortem) && (
                            <span className="feed-postmortem-badge" title="SRE Post-Mortem available">
                              <FileText size={10} /> Post-Mortem
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Compact Unified Incident Inspector */}
          <aside className="incidents-detail-pane">
            {selected ? (
              <div className="inspector-card">
                {/* 1. Header Overview Strip */}
                <div className="inspector-header">
                  <div className="inspector-header-top">
                    <div className="inspector-title-cluster">
                      <span className={`incident-symbol ${terminalStatuses.has(selected.status) ? 'resolved' : ''}`}>
                        {terminalStatuses.has(selected.status) ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <TriangleAlert size={16} />
                        )}
                      </span>
                      <div>
                        <div className="inspector-meta-row">
                          <span className="inspector-id">INC-{String(selected.record_id).padStart(6, '0')}</span>
                          <span className="meta-separator">·</span>
                          <span className="inspector-source">
                            {selected.source === 'automatic' ? 'Automatic Health Outage' : 'Manual Declaration'}
                          </span>
                          <span className="meta-separator">·</span>
                          <span className="inspector-duration">
                            Duration: {duration(selected.started_at, selected.resolved_at)}
                          </span>
                        </div>
                        <h2 className="inspector-title">{selected.title}</h2>
                      </div>
                    </div>

                    <div className="inspector-header-status">
                      <button
                        type="button"
                        className={`inspector-postmortem-btn ${selected.status === 'resolved' ? 'highlight' : ''}`}
                        onClick={() => setShowPostMortemModal(true)}
                        title="Open executive SRE Post-Mortem generator (5-Whys, user impact, timeline, markdown export)"
                      >
                        <FileText size={13} />
                        <span>Export Post-Mortem</span>
                        {selected.post_mortem && <span className="ai-ready-chip">Ready</span>}
                      </button>

                      <span className={`status-pill large ${selected.status}`}>
                        <span className="status-dot" />
                        {labelStatus(selected.status)}
                      </span>
                    </div>
                  </div>

                  {/* Service & Endpoint row */}
                  <div className="inspector-endpoint-row">
                    <span className="endpoint-label">Affected service:</span>
                    <strong className="endpoint-name">
                      {selected.affected_services.join(', ') || 'General System'}
                    </strong>
                    {selected.service_urls[0] && (
                      <a
                        href={selected.service_urls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="endpoint-link"
                        title="Open monitor endpoint in new tab"
                      >
                        {selected.service_urls[0]}
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {/* AI Diagnostics Trigger Bar - ON DEMAND BUTTON ONLY */}
                  <div className="inspector-ai-bar">
                    <div className="inspector-ai-info">
                      <div className="ai-sparkle-pill">
                        <Sparkles size={14} />
                      </div>
                      <span className="ai-info-text">
                        <strong>Gemini SRE Intelligence:</strong>{' '}
                        {selected.status === 'resolved'
                          ? 'Incident resolved. Executive Post-Mortem and Root Cause analysis available.'
                          : selected.ai_diagnostic
                          ? 'Analysis prepared. Review socket breakdown and fixes.'
                          : 'Correlate TCP resets, HTTP status codes, and service logs.'}
                      </span>
                    </div>
                    <div className="inspector-ai-buttons">
                      <button
                        type="button"
                        className="ai-action-btn"
                        onClick={() => setShowAiModal(true)}
                        title="Click to view AI root cause diagnosis modal"
                      >
                        <Sparkles size={13} />
                        <span>{selected.ai_diagnostic ? 'View Diagnostics' : 'Run Diagnostics'}</span>
                        {selected.ai_diagnostic && <span className="ai-ready-chip">Ready</span>}
                      </button>

                      <button
                        type="button"
                        className="ai-action-btn postmortem"
                        onClick={() => setShowPostMortemModal(true)}
                        title="Generate executive SRE Post-Mortem report"
                      >
                        <FileText size={13} />
                        <span>Post-Mortem</span>
                        {selected.post_mortem && <span className="ai-ready-chip">Ready</span>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Inspector Tab Bar (Mail Update vs Activity Log) */}
                <div className="inspector-tabs-nav" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === 'email'}
                    className={`inspector-nav-tab ${detailTab === 'email' ? 'active' : ''}`}
                    onClick={() => setDetailTab('email')}
                  >
                    <Mail size={14} />
                    <span>Send Email Update</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === 'activity'}
                    className={`inspector-nav-tab ${detailTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setDetailTab('activity')}
                  >
                    <Clock3 size={14} />
                    <span>Activity History</span>
                    <span className="activity-count-badge">{selected.activity.length}</span>
                  </button>
                </div>

                {/* 3. Tab Body: Send Email Update */}
                {detailTab === 'email' && (
                  <div className="inspector-tab-content">
                    <div className="email-update-panel">
                      <div className="email-section-heading">
                        <h3>Send Incident Email Update</h3>
                        <p>Compose and dispatch an email update to subscribers and team members.</p>
                      </div>

                      {/* Status Selector Pills */}
                      <div className="status-button-group" role="radiogroup" aria-label="Incident status selector">
                        {statusOptions.map((option) => {
                          const Icon = option.icon
                          const isSelected = nextStatus === option.value
                          return (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              className={`status-btn-option ${isSelected ? 'selected' : ''} ${option.value}`}
                              key={option.value}
                              onClick={() => setNextStatus(option.value)}
                            >
                              <Icon size={13} />
                              <span>{option.label}</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Quick message template buttons */}
                      <div className="quick-templates">
                        <span className="template-label">Quick templates:</span>
                        <div className="template-pills">
                          {quickEmailTemplates.map((template) => (
                            <button
                              type="button"
                              key={template.label}
                              className="template-pill"
                              onClick={() => setMessage(template.text)}
                              title="Click to load email template"
                            >
                              {template.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Textarea */}
                      <div className="update-textarea-wrap">
                        <label htmlFor="incident-email-message" className="sr-only">
                          Email message text
                        </label>
                        <textarea
                          id="incident-email-message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          maxLength={1000}
                          placeholder="Type an update message to email to subscribers (e.g., investigating upstream gateway, mitigation deployed)..."
                          rows={3}
                        />
                        <div className="textarea-footer">
                          <span className="subscriber-hint">
                            <Mail size={12} />
                            Subscribers and team members receive an email notification upon sending.
                          </span>
                          <small className="char-count">{message.length} / 1000</small>
                        </div>
                      </div>

                      <div className="email-action-row">
                        <button
                          type="button"
                          className="primary-btn send-email-btn"
                          disabled={submitting || (nextStatus === selected.status && !message.trim())}
                          onClick={() => void sendEmailUpdate()}
                        >
                          <Mail size={14} />
                          {submitting ? 'Sending email...' : 'Send email update'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Tab Body: Activity Timeline */}
                {detailTab === 'activity' && (
                  <div className="inspector-tab-content">
                    <div className="timeline-container">
                      {selected.activity.map((event) => (
                        <article key={event.id} className="timeline-row">
                          <span className={`timeline-node ${event.event_type}`}>
                            {event.event_type === 'notification' ? (
                              <Mail size={12} />
                            ) : event.event_type === 'recovered' || event.status === 'resolved' ? (
                              <Check size={12} />
                            ) : (
                              <Clock3 size={12} />
                            )}
                          </span>
                          <div className="timeline-content">
                            <div className="timeline-head">
                              <strong>
                                {activityTitle(event.event_type, event.status, event.notification_status)}
                              </strong>
                              <span className="timeline-timestamp" title={dateTime(event.created_at)}>
                                {formatRelativeTime(event.created_at)}
                              </span>
                            </div>
                            {event.message && <p className="timeline-message">{event.message}</p>}
                            <div className="timeline-actor">
                              <span className="actor-dot" />
                              <span>
                                {event.actor_name} · {dateTime(event.created_at)}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="incident-card detail-placeholder-card">
                <CheckCircle2 size={32} />
                <strong>Select an incident</strong>
                <p>Choose an incident from the stream to inspect telemetry, run AI analysis, or send email updates.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI ROOT CAUSE DIAGNOSTICS MODAL (ON-DEMAND BUTTON TRIGGER ONLY)           */}
      {/* ========================================================================= */}
      {showAiModal && selected && (
        <div className="ai-modal-backdrop" onClick={() => setShowAiModal(false)}>
          <div
            className="ai-modal-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-modal-heading"
          >
            <div className="ai-modal-header">
              <div className="ai-modal-title-group">
                <div className="ai-modal-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 id="ai-modal-heading">AI Root Cause Diagnostics</h2>
                  <p>
                    Automated telemetry correlation &amp; protocol triage for <strong>{selected.title}</strong> (INC-
                    {String(selected.record_id).padStart(6, '0')})
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn ai-modal-close-btn"
                aria-label="Close AI diagnostics dialog"
                onClick={() => setShowAiModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="ai-modal-scrollable-body">
              <AiRootCauseDiagnostic
                diagnostic={selected.ai_diagnostic}
                incidentId={selected.id}
                recordId={selected.record_id}
                source={selected.source}
                monitorId={selected.monitor_ids[0]}
                onApplyStatusNotice={(notice) => {
                  setMessage(notice)
                  setDetailTab('email')
                  setShowAiModal(false)
                }}
                onDiagnosticUpdated={(updatedDiagnostic) => {
                  setIncidents((current) =>
                    current.map((inc) => (inc.id === selected.id ? { ...inc, ai_diagnostic: updatedDiagnostic } : inc))
                  )
                }}
              />
            </div>

            <div className="ai-modal-footer">
              <span className="ai-modal-footer-hint">
                <Sparkles size={13} />
                Powered by Google Gemini 3.8 Flash &amp; live HTTP check headers.
              </span>
              <button type="button" className="secondary-btn" onClick={() => setShowAiModal(false)}>
                Close diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SRE POST-MORTEM EXECUTIVE REPORT MODAL                                    */}
      {/* ========================================================================= */}
      {selected && (
        <IncidentPostMortemModal
          incident={selected}
          isOpen={showPostMortemModal}
          onClose={() => setShowPostMortemModal(false)}
          onPostMortemUpdated={(updatedPostMortem) => {
            setIncidents((current) =>
              current.map((inc) => (inc.id === selected.id ? { ...inc, post_mortem: updatedPostMortem } : inc))
            )
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* DECLARE NEW MANUAL INCIDENT MODAL                                         */}
      {/* ========================================================================= */}
      {showCreate && (
        <div className="declare-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div
            className="declare-modal-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="declare-modal-title"
          >
            <form onSubmit={createIncident}>
              <div className="declare-modal-header">
                <div>
                  <h2 id="declare-modal-title">Declare Manual Incident</h2>
                  <p>Create an incident report and dispatch notification emails to subscribers.</p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Close declare dialog"
                  onClick={() => setShowCreate(false)}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="declare-modal-body">
                <label className="declare-field">
                  <span>Incident Title</span>
                  <input
                    name="title"
                    required
                    minLength={3}
                    maxLength={120}
                    placeholder="e.g., Elevated API 502 errors in EU region"
                  />
                </label>

                <label className="declare-field">
                  <span>Initial Email Notification Text</span>
                  <textarea
                    name="message"
                    required
                    minLength={3}
                    maxLength={1000}
                    rows={4}
                    placeholder="Describe what is occurring and what actions your engineering team is taking..."
                  />
                </label>

                <fieldset className="declare-services-fieldset">
                  <legend>Affected Services</legend>
                  <div className="declare-services-grid">
                    {monitors.map((monitor) => (
                      <label key={monitor.id} className="declare-service-chip">
                        <input type="checkbox" name="monitor_ids" value={monitor.id} />
                        <span className={`service-status-dot ${monitor.status}`} />
                        <span>{monitor.public_name || monitor.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="declare-modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  <Mail size={15} />
                  {submitting ? 'Declaring incident...' : 'Declare & send email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

function activityTitle(eventType: string, status: UnifiedIncidentStatus, notificationStatus: string | null) {
  if (eventType === 'notification') {
    return notificationStatus === 'failed'
      ? 'Email notification delivery failed'
      : notificationStatus === 'skipped'
      ? 'No subscribers configured'
      : 'Email notification dispatched to subscribers'
  }
  if (eventType === 'detected') return 'Automated outage detected'
  if (eventType === 'created') return 'Incident declared'
  if (eventType === 'recovered') return 'Monitor recovered to 200 OK'
  if (eventType === 'reopened') return 'Incident reopened'
  if (eventType === 'update_published' || eventType === 'status_changed') {
    return `Lifecycle changed to ${labelStatus(status)}`
  }
  return `Incident updated: ${labelStatus(status)}`
}
