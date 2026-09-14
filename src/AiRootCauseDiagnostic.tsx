import { useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Cpu,
  Globe,
  Lock,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import { api, userFacingError, type AiDiagnosticResult } from './api'
import './AiRootCauseDiagnostic.css'

export interface AiRootCauseDiagnosticProps {
  diagnostic?: AiDiagnosticResult | null
  incidentId?: string
  recordId?: number
  source?: 'automatic' | 'manual'
  monitorId?: number
  checkId?: number
  onApplyStatusNotice?: (notice: string) => void
  onDiagnosticUpdated?: (diagnostic: AiDiagnosticResult) => void
  compact?: boolean
}

const categoryLabels: Record<AiDiagnosticResult['category'], { label: string; color: string }> = {
  upstream_origin: { label: 'Upstream Origin', color: 'var(--destructive, #ef4444)' },
  timeout_load: { label: 'Timeout & Concurrency', color: 'var(--warning, #f59e0b)' },
  application_error: { label: 'Application Crash', color: 'var(--destructive, #ef4444)' },
  ssl_tls: { label: 'TLS / SSL Certificate', color: 'var(--info, #3b82f6)' },
  dns_network: { label: 'DNS & Network Routing', color: 'var(--warning, #f59e0b)' },
  content_mismatch: { label: 'Payload Schema Drift', color: 'var(--warning, #f59e0b)' },
  configuration: { label: 'Route Configuration', color: 'var(--muted-foreground, #64748b)' },
}

export function AiRootCauseDiagnostic({
  diagnostic: initialDiagnostic,
  incidentId,
  recordId,
  source,
  monitorId,
  checkId,
  onApplyStatusNotice,
  onDiagnosticUpdated,
  compact = false,
}: AiRootCauseDiagnosticProps) {
  const [diagnostic, setDiagnostic] = useState<AiDiagnosticResult | null>(initialDiagnostic || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [noticeCopied, setNoticeCopied] = useState(false)
  const [expanded, setExpanded] = useState(!compact)

  // Keep state in sync if parent passes updated diagnostic
  if (initialDiagnostic && (!diagnostic || diagnostic.timestamp !== initialDiagnostic.timestamp)) {
    setDiagnostic(initialDiagnostic)
  }

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      let result: AiDiagnosticResult
      if (source && recordId != null) {
        result = await api<AiDiagnosticResult>(`/incidents/${source}/${recordId}/diagnose`, { method: 'POST' })
      } else if (incidentId) {
        result = await api<AiDiagnosticResult>(`/incidents/${incidentId}/diagnose`, { method: 'POST' })
      } else {
        result = await api<AiDiagnosticResult>('/diagnostics/analyze', {
          method: 'POST',
          body: JSON.stringify({ monitor_id: monitorId, check_id: checkId, incident_id: incidentId }),
        })
      }
      setDiagnostic(result)
      onDiagnosticUpdated?.(result)
      setExpanded(true)
    } catch (err) {
      setError(userFacingError(err, 'Failed to run AI diagnostic. Please retry.'))
    } finally {
      setLoading(false)
    }
  }

  const copyStep = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch {
      // ignore
    }
  }

  const copyNotice = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setNoticeCopied(true)
      setTimeout(() => setNoticeCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const catMeta = diagnostic?.category ? categoryLabels[diagnostic.category] : null

  return (
    <section className={`ai-diagnostic-card ${compact ? 'compact' : ''}`}>
      <div className="ai-diagnostic-header">
        <div className="ai-diagnostic-title-wrap">
          <div className="ai-badge-pulse">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="ai-title-row">
              <h3>AI Root Cause Diagnostics</h3>
              {diagnostic?.engine && (
                <span className={`ai-engine-tag ${diagnostic.engine === 'gemini-3.8-flash' ? 'gemini' : 'heuristic'}`}>
                  {diagnostic.engine === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Pingava SRE Engine'}
                </span>
              )}
              {diagnostic?.confidence && (
                <span className={`ai-confidence-tag ${diagnostic.confidence}`}>
                  {diagnostic.confidence.toUpperCase()} CONFIDENCE
                </span>
              )}
              {catMeta && (
                <span className="ai-category-tag" style={{ borderColor: catMeta.color, color: catMeta.color }}>
                  {catMeta.label}
                </span>
              )}
            </div>
            <p className="ai-subtitle">
              Automated telemetry synthesis &amp; network protocol triage powered by Google Gemini.
            </p>
          </div>
        </div>

        <div className="ai-header-actions">
          {compact && diagnostic && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Collapse diagnostics' : 'Expand diagnostics'}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            type="button"
            className="ai-analyze-btn"
            disabled={loading}
            onClick={() => void runAnalysis()}
            title="Generate fresh AI diagnosis based on latest HTTP headers and check logs"
          >
            <RefreshCw size={13} className={loading ? 'spinning' : ''} />
            {loading ? 'Analyzing with Gemini...' : diagnostic ? 'Re-analyze' : 'Run AI Diagnosis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="ai-diagnostic-error">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {loading && !diagnostic && (
        <div className="ai-diagnostic-loading">
          <div className="ai-loading-spinner">
            <Sparkles size={20} className="spinning" />
          </div>
          <strong>Synthesizing HTTP transaction headers and timing breakdown...</strong>
          <p>Gemini 3.8 Flash is correlating DNS, TLS handshake, origin socket state, and status codes.</p>
        </div>
      )}

      {!loading && !diagnostic && !error && (
        <div className="ai-diagnostic-empty">
          <Bot size={28} />
          <div>
            <strong>No diagnosis generated yet for this incident.</strong>
            <p>Pingava can inspect recent failed checks, response headers, and latency spikes to pinpoint the root cause.</p>
          </div>
          <button type="button" className="primary-btn" onClick={() => void runAnalysis()}>
            <Sparkles size={14} />
            Diagnose Root Cause with Gemini
          </button>
        </div>
      )}

      {diagnostic && expanded && (
        <div className="ai-diagnostic-body">
          {/* Executive Headline */}
          <div className="ai-headline-box">
            <div className="ai-headline-main">
              <span className="ai-headline-icon">
                <AlertTriangle size={18} />
              </span>
              <div>
                <h4>{diagnostic.title}</h4>
                <p>{diagnostic.summary}</p>
              </div>
            </div>
          </div>

          {/* Technical Hypothesis */}
          <div className="ai-section">
            <div className="ai-section-title">
              <Cpu size={14} />
              <h5>Technical Failure Hypothesis</h5>
            </div>
            <div className="ai-hypothesis-content">
              <p>{diagnostic.technical_hypothesis}</p>
            </div>
          </div>

          {/* Network & Protocol Breakdown */}
          <div className="ai-section">
            <div className="ai-section-title">
              <Network size={14} />
              <h5>Network Layer &amp; Gateway Telemetry</h5>
            </div>
            <div className="ai-network-grid">
              <div className="ai-network-card">
                <div className="ai-net-header">
                  <Globe size={13} />
                  <span>DNS Resolution</span>
                </div>
                <strong className={`status-${diagnostic.network_breakdown.dns_status}`}>
                  {diagnostic.network_breakdown.dns_status.toUpperCase()}
                </strong>
              </div>

              <div className="ai-network-card">
                <div className="ai-net-header">
                  <Lock size={13} />
                  <span>TLS / SSL Handshake</span>
                </div>
                <strong className={`status-${diagnostic.network_breakdown.ssl_status}`}>
                  {diagnostic.network_breakdown.ssl_status.toUpperCase()}
                </strong>
              </div>

              <div className="ai-network-card">
                <div className="ai-net-header">
                  <Server size={13} />
                  <span>TCP Connection</span>
                </div>
                <strong className={`status-tcp-${diagnostic.network_breakdown.tcp_connection}`}>
                  {diagnostic.network_breakdown.tcp_connection.toUpperCase()}
                </strong>
              </div>

              <div className="ai-network-card">
                <div className="ai-net-header">
                  <Zap size={13} />
                  <span>HTTP Protocol Layer</span>
                </div>
                <strong title={diagnostic.network_breakdown.http_layer}>
                  {diagnostic.network_breakdown.http_layer}
                </strong>
              </div>
            </div>

            {(diagnostic.network_breakdown.server_header || diagnostic.network_breakdown.cdn_cache_header) && (
              <div className="ai-headers-substrip">
                {diagnostic.network_breakdown.server_header && (
                  <span>
                    <small>Server Software:</small> <code>{diagnostic.network_breakdown.server_header}</code>
                  </span>
                )}
                {diagnostic.network_breakdown.cdn_cache_header && (
                  <span>
                    <small>CDN Cache State:</small> <code>{diagnostic.network_breakdown.cdn_cache_header}</code>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actionable Remediation Checklist */}
          {diagnostic.remediation_steps?.length > 0 && (
            <div className="ai-section">
              <div className="ai-section-title">
                <Terminal size={14} />
                <h5>Actionable Remediation Steps (SRE Triage)</h5>
              </div>
              <ul className="ai-remediation-list">
                {diagnostic.remediation_steps.map((step, idx) => (
                  <li key={idx} className="ai-remediation-item">
                    <span className="ai-step-number">{idx + 1}</span>
                    <span className="ai-step-text">{step}</span>
                    <button
                      type="button"
                      className="ai-step-copy-btn"
                      onClick={() => void copyStep(step, idx)}
                      title="Copy remediation command"
                    >
                      {copiedIndex === idx ? <Check size={13} /> : <Clipboard size={13} />}
                      {copiedIndex === idx ? 'Copied' : 'Copy'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Customer-Facing Status Page Notice */}
          {diagnostic.suggested_status_notice && (
            <div className="ai-section ai-notice-section">
              <div className="ai-section-title">
                <ShieldCheck size={14} />
                <h5>Suggested Public Status Notice</h5>
                <span className="ai-notice-tag">Customer-ready</span>
              </div>
              <div className="ai-notice-box">
                <p>"{diagnostic.suggested_status_notice}"</p>
                <div className="ai-notice-actions">
                  <button
                    type="button"
                    className="secondary-btn small-btn"
                    onClick={() => void copyNotice(diagnostic.suggested_status_notice)}
                  >
                    {noticeCopied ? <Check size={12} /> : <Clipboard size={12} />}
                    {noticeCopied ? 'Copied to clipboard' : 'Copy notice'}
                  </button>
                  {onApplyStatusNotice && (
                    <button
                      type="button"
                      className="primary-btn small-btn"
                      onClick={() => onApplyStatusNotice(diagnostic.suggested_status_notice)}
                    >
                      <ArrowUpRight size={13} />
                      Use as incident update message
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
