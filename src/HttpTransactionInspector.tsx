import { useMemo, useState } from 'react'
import {
  Check as CheckIcon,
  Clipboard,
  Clock3,
  Code2,
  Globe2,
  Lock,
  Play,
  Radar,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import type { Check, Monitor } from './api'
import { AiRootCauseDiagnostic } from './AiRootCauseDiagnostic'
import { MultiRegionEdgeInspector } from './MultiRegionEdgeInspector'
import { ApiContractGuardian } from './ApiContractGuardian'
import { LatencyAnomalyRadar } from './LatencyAnomalyRadar'
import { SslCertificateGuardian } from './SslCertificateGuardian'

export type Tab = 'request' | 'response' | 'ssl' | 'diagnostic' | 'edge' | 'contract' | 'radar'

const statusText: Record<number, string> = { 200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Content', 429: 'Too Many Requests', 500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout' }

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return <button type="button" className="inspector-copy" onClick={() => void copy()} title={`Copy ${label}`}><Clipboard size={13} />{copied ? 'Copied' : 'Copy'}</button>
}

function KeyValueList({ values, empty }: { values?: Record<string, string> | null; empty: string }) {
  const entries = Object.entries(values || {})
  return entries.length ? <div className="inspector-kv">{entries.map(([key, value]) => <div key={key}><code>{key}</code><span>=</span><code>{value}</code></div>)}</div> : <p className="inspector-empty-value">{empty}</p>
}

function JsonViewer({ value, copyLabel }: { value: unknown; copyLabel: string }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return <div className="inspector-code"><CopyButton value={text} label={copyLabel} /><pre>{text}</pre></div>
}

function RequestDetails({ monitor }: { monitor: Monitor }) {
  return <div className="inspector-request inspector-sections">
    <div className="inspector-summary-grid"><section><span>Method</span><strong>{monitor.http_method}</strong></section><section><span>Execution</span><strong>{monitor.execution_mode === 'manual' ? 'Manual only' : `Every ${monitor.interval_minutes} min`}</strong></section><section><span>Timeout</span><strong>{monitor.timeout_seconds} seconds</strong></section><section><span>Expected status</span><strong>{monitor.accepted_statuses}</strong></section><section><span>Response assertion</span><strong>{monitor.body_assertion === 'contains' ? `Contains “${monitor.body_assertion_value}”` : monitor.body_assertion === 'not_contains' ? `Excludes “${monitor.body_assertion_value}”` : 'None'}</strong></section></div>
    <section><h3>URL</h3><code className="inspector-url">{monitor.url}</code></section>
    <section><h3>Query parameters</h3><KeyValueList values={monitor.query_params} empty="No query parameters" /></section>
    <section><h3>Headers</h3><KeyValueList values={monitor.request_headers} empty="No request headers" /></section>
    <section><h3>Request body</h3>{monitor.request_body == null ? <p className="inspector-empty-value">No request body</p> : <JsonViewer value={monitor.request_body} copyLabel="request body" />}</section>
  </div>
}

function prettyResponseBody(check: Check): string | null {
  if (!check.response_body_preview) return null
  const contentType = Object.entries(check.response_headers || {}).find(([key]) => key.toLowerCase() === 'content-type')?.[1] || ''
  if (!contentType.toLowerCase().includes('json')) return check.response_body_preview
  try { return JSON.stringify(JSON.parse(check.response_body_preview), null, 2) }
  catch { return check.response_body_preview }
}

function ValidationResult({ monitor, check }: { monitor: Monitor; check: Check }) {
  const statusFailure = check.error?.startsWith('Expected status')
  const assertionFailure = check.error?.startsWith('Response assertion') || check.error?.startsWith('Response body contained')
  const assertionConfigured = monitor.body_assertion !== 'none'
  return <div className="inspector-validation">
    <div className={statusFailure ? 'failed' : 'passed'}>{statusFailure ? <X size={14} /> : <CheckIcon size={14} />}<span><strong>Status validation</strong><small>{statusFailure ? check.error : `Received an accepted ${check.status_code} response`}</small></span></div>
    {assertionConfigured && <div className={assertionFailure ? 'failed' : check.ok ? 'passed' : 'neutral'}>{assertionFailure ? <X size={14} /> : check.ok ? <CheckIcon size={14} /> : <Clock3 size={14} />}<span><strong>Response assertion</strong><small>{assertionFailure ? check.error : check.ok ? `Response ${monitor.body_assertion === 'contains' ? 'contains' : 'excludes'} “${monitor.body_assertion_value}”` : 'Not evaluated because an earlier rule failed'}</small></span></div>}
  </div>
}

function ResponseDetails({ monitor, check, onRun }: { monitor: Monitor; check: Check | null; onRun: () => Promise<void> }) {
  const [running, setRunning] = useState(false)
  const body = useMemo(() => check ? prettyResponseBody(check) : null, [check])
  const run = async () => { setRunning(true); try { await onRun() } finally { setRunning(false) } }
  if (!check) return <div className="inspector-empty"><Code2 size={30} /><h3>No response yet</h3><p>Run the monitor to capture its first response.</p><button className="primary-btn" disabled={running || monitor.status === 'paused'} onClick={() => void run()}><Play size={14} />{running ? 'Running check...' : 'Run check'}</button></div>
  if (check.status_code === null) return <div className="inspector-failure"><TriangleAlert size={24} /><div><h3>No HTTP response received</h3><p>{check.error || 'The endpoint could not be reached.'}</p><small>{new Date(check.checked_at).toLocaleString()}</small></div></div>
  return <div className="inspector-response inspector-sections">
    <div className="inspector-summary-grid"><section><span>HTTP status</span><strong className={check.ok ? 'success-text' : 'failure-text'}>{check.status_code} {statusText[check.status_code] || ''}</strong></section><section><span>Response time</span><strong>{check.response_time} ms</strong></section><section><span>Response size</span><strong>{check.response_size_bytes == null ? 'Unavailable' : `${check.response_size_bytes.toLocaleString()} bytes`}</strong></section><section><span>Final result</span><strong className={check.ok ? 'success-text' : 'failure-text'}>{check.ok ? 'Up' : 'Down'}</strong></section></div>
    <section><h3>Checked at</h3><p>{new Date(check.checked_at).toLocaleString()}</p></section>
    <ValidationResult monitor={monitor} check={check} />
    {check.error && !check.error.startsWith('Expected status') && !check.error.startsWith('Response assertion') && !check.error.startsWith('Response body contained') && <div className="inspector-rule-error"><TriangleAlert size={15} />{check.error}</div>}
    <section><h3>Response headers</h3><KeyValueList values={check.response_headers} empty="No response headers captured" /></section>
    <section><h3>Response body</h3>{body ? <JsonViewer value={body} copyLabel="response" /> : <p className="inspector-empty-value">{check.response_size_bytes ? `Binary response received (${check.response_size_bytes.toLocaleString()} bytes)` : 'No response body'}</p>}{check.response_body_truncated && <p className="inspector-truncated">Response truncated to the first 20 KB.</p>}</section>
  </div>
}

export function HttpTransactionInspector({ monitor, check, tab, onTabChange, onRun }: { monitor: Monitor; check: Check | null; tab: Tab; onTabChange: (tab: Tab) => void; onRun: () => Promise<void> }) {
  return <section className="detail-panel transaction-inspector">
    <header><div className="request-command"><span>{monitor.http_method}</span><code>{monitor.url}</code></div>{check && <small>{check.execution_source === 'scheduled' ? 'Scheduled' : 'Manual'} {check.http_method} check from {new Date(check.checked_at).toLocaleString()}</small>}</header>
    <div className="inspector-tabs" role="tablist" aria-label="HTTP transaction">
      <button role="tab" aria-selected={tab === 'request'} className={tab === 'request' ? 'active' : ''} onClick={() => onTabChange('request')}>Request</button>
      <button role="tab" aria-selected={tab === 'response'} className={tab === 'response' ? 'active' : ''} onClick={() => onTabChange('response')}>Response</button>
      <button role="tab" aria-selected={tab === 'ssl'} className={tab === 'ssl' ? 'active' : ''} onClick={() => onTabChange('ssl')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Lock size={13} style={{ color: monitor.ssl_days_remaining !== null && monitor.ssl_days_remaining <= 30 ? '#d97706' : 'var(--primary)' }} />
        SSL Guardian
        {monitor.ssl_days_remaining !== null && monitor.ssl_days_remaining <= 30 && (
          <span style={{ fontSize: '10px', background: monitor.ssl_days_remaining <= 7 ? '#ef4444' : '#f59e0b', color: '#fff', padding: '1px 5px', borderRadius: '10px', fontWeight: 700 }}>
            {monitor.ssl_days_remaining <= 0 ? 'Expired' : `${monitor.ssl_days_remaining}d`}
          </span>
        )}
      </button>
      <button role="tab" aria-selected={tab === 'radar'} className={tab === 'radar' ? 'active' : ''} onClick={() => onTabChange('radar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Radar size={13} style={{ color: 'var(--primary)' }} />
        Latency Radar
      </button>
      <button role="tab" aria-selected={tab === 'contract'} className={tab === 'contract' ? 'active' : ''} onClick={() => onTabChange('contract')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ShieldCheck size={13} style={{ color: 'var(--primary)' }} />
        Contract Guardian
      </button>
      <button role="tab" aria-selected={tab === 'edge'} className={tab === 'edge' ? 'active' : ''} onClick={() => onTabChange('edge')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Globe2 size={13} style={{ color: 'var(--primary)' }} />
        Edge Inspector
      </button>
      <button role="tab" aria-selected={tab === 'diagnostic'} className={tab === 'diagnostic' ? 'active' : ''} onClick={() => onTabChange('diagnostic')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Sparkles size={13} style={{ color: 'var(--primary)' }} />
        AI Root Cause
      </button>
    </div>
    <div role="tabpanel">
      {tab === 'request' ? (
        <RequestDetails monitor={monitor} />
      ) : tab === 'response' ? (
        <ResponseDetails monitor={monitor} check={check} onRun={onRun} />
      ) : tab === 'ssl' ? (
        <div style={{ padding: '16px' }}>
          <SslCertificateGuardian monitor={monitor} />
        </div>
      ) : tab === 'radar' ? (
        <div style={{ padding: '16px' }}>
          <LatencyAnomalyRadar mode="monitor" monitor={monitor} />
        </div>
      ) : tab === 'contract' ? (
        <div style={{ padding: '16px' }}>
          <ApiContractGuardian monitor={monitor} />
        </div>
      ) : tab === 'edge' ? (
        <div style={{ padding: '16px' }}>
          <MultiRegionEdgeInspector monitor={monitor} embedded={true} />
        </div>
      ) : (
        <div style={{ padding: '16px' }}>
          <AiRootCauseDiagnostic
            monitorId={monitor.id}
            checkId={check?.id}
            compact={false}
          />
        </div>
      )}
    </div>
  </section>
}
