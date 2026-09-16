import { useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react'
import { Check, Code2, Globe2, Play, Plus, Settings2, X } from 'lucide-react'
import { api, normalizeEndpointUrl, userFacingError } from './api'
import { MonitorRequestFields } from './MonitorRequestFields'
import { monitorRequestPayload } from './monitorRequestPayload'
import './AddMonitor.css'

type Result = { ok: boolean; status_code: number | null; response_time: number; error: string | null; response_headers: Record<string, string> | null; response_body_preview: string | null; response_body_truncated: boolean }

export function AddMonitor({ onClose, onSubmit, rules, error }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; rules: ReactNode; error: string }) {
  const [kind, setKind] = useState<'website' | 'api'>('website')
  const [busy, setBusy] = useState<'test' | 'create' | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [testError, setTestError] = useState('')
  const [tab, setTab] = useState<'Response' | 'Headers' | 'Assertions'>('Response')
  const form = useRef<HTMLFormElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => { document.body.style.overflow = previous }
  }, [])
  const test = async () => {
    if (!form.current) return
    const data = new FormData(form.current)
    const method = String(data.get('http_method') || 'GET')
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !window.confirm(`Send this ${method} request now? It may create, update, or delete data at the destination.`)) return
    if (!form.current.reportValidity()) return
    setBusy('test'); setResult(null); setTestError('')
    try {
      const threshold = String(data.get('response_time_threshold_ms') || '').trim()
      const normalizedTestUrl = normalizeEndpointUrl(String(data.get('url') || ''))
      setResult(await api<Result>('/monitors/test', { method: 'POST', body: JSON.stringify({
        name: String(data.get('name') || 'Test request'), url: normalizedTestUrl, ...monitorRequestPayload(data),
        timeout_seconds: Number(data.get('timeout')), accepted_statuses: data.get('statuses'),
        response_time_threshold_ms: threshold ? Number(threshold) : null,
        body_assertion: data.get('body_assertion'), body_assertion_value: data.get('body_assertion_value') || null,
      }) }))
    } catch (reason) { setTestError(userFacingError(reason, 'The test request could not be completed. Check the endpoint and try again.')) }
    finally { setBusy(null) }
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    setBusy('create')
    try { await onSubmit(event) } finally { setBusy(null) }
  }
  const validation = <><label>Expected status codes<input name="statuses" defaultValue="200-399" required /></label>{rules}</>
  const settings = <div className="form-grid"><label>Check interval<select name="interval" defaultValue="5"><option value="5">Every 5 minutes</option><option value="10">Every 10 minutes</option></select></label><label>Timeout (seconds)<input name="timeout" type="number" min="2" max="60" defaultValue="10" required /></label></div>
  const incidents = (
    <div className="zero-noise-config-panel">
      <div className="form-grid">
        <label>
          Failures before incident
          <input name="failure_threshold" type="number" min="1" max="10" defaultValue="3" required />
          <small>Consecutive failures to confirm outage (e.g. 3)</small>
        </label>
        <label>
          Successes before recovery
          <input name="recovery_threshold" type="number" min="1" max="10" defaultValue="2" required />
          <small>Consecutive successes to confirm recovery (e.g. 2)</small>
        </label>
      </div>
      <p className="add-monitor-hint" style={{ marginTop: '8px' }}>
        🛡️ <strong>Zero-Noise Synthetic Monitoring:</strong> Transient network hiccups won't wake your on-call engineer at 3 AM. Outages are verified through multi-step failure thresholds before creating incidents or dispatching alerts.
      </p>
    </div>
  )
  return <dialog className="add-monitor-dialog" ref={dialog} aria-labelledby="add-monitor-title" aria-busy={Boolean(busy)} onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
    <header><div><span className="add-monitor-eyebrow">New monitor</span><h2 id="add-monitor-title">What would you like to monitor?</h2><p>Choose the type of monitor and we’ll tailor the setup for you.</p></div><button type="button" className="icon-btn" aria-label="Close" disabled={Boolean(busy)} onClick={onClose}><X size={20} /></button></header>
    <form ref={form} onSubmit={submit} onChange={() => { setResult(null); setTestError('') }}>
      <div className="add-monitor-body"><fieldset className="monitor-kind" disabled={Boolean(busy)}><legend>Monitor type</legend>{(['website', 'api'] as const).map((value) => <label key={value} className={kind === value ? 'chosen' : ''}><input type="radio" name="monitor_kind" value={value} checked={kind === value} onChange={() => setKind(value)} />{value === 'website' ? <Globe2 size={25} /> : <Code2 size={25} />}<strong>{value === 'website' ? 'Website / URL' : 'API Endpoint'}</strong><span>{value === 'website' ? 'Simple uptime monitoring for any website.' : 'Methods, headers, body and response validation.'}</span>{kind === value && <Check className="kind-check" size={17} />}</label>)}</fieldset>
      <section className="add-monitor-basics"><h3>Basic information</h3><label>Monitor name<input name="name" required maxLength={80} placeholder={kind === 'website' ? 'My Website' : 'Production API'} /></label>
      {kind === 'website' ? <><input type="hidden" name="http_method" value="GET" /><label>URL<input name="url" type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" required placeholder="https://example.com" onBlur={(e) => { if (e.target.value.trim()) e.target.value = normalizeEndpointUrl(e.target.value) }} /></label><p className="add-monitor-hint">We’ll use sensible defaults that work for most websites.</p></> : <MonitorRequestFields guided />}</section>
      {kind === 'website' ? <details className="add-monitor-options"><summary><Settings2 size={18} /><span>Advanced options<small>Timing, response validation and incident settings</small></span></summary><div>{settings}{validation}{incidents}</div></details> : <><details className="add-monitor-options"><summary>Response validation</summary><div>{validation}</div></details><details className="add-monitor-options"><summary>Incident detection</summary><div>{incidents}</div></details></>}
      {(testError || error) && <p role="alert" className="form-error">{testError || error}</p>}
      {result && <section className="monitor-test-result" aria-live="polite"><div className={result.ok ? 'test-pass' : 'test-fail'}>{result.ok ? <Check size={18} /> : <X size={18} />}<strong>{result.status_code ? `HTTP ${result.status_code}` : 'Connection failed'}</strong><span>{result.response_time} ms</span></div><div className="test-tabs" role="tablist" aria-label="Test result">{(['Response', 'Headers', 'Assertions'] as const).map((value) => <button type="button" role="tab" aria-selected={tab === value} key={value} onClick={() => setTab(value)}>{value}</button>)}</div><pre>{tab === 'Headers' ? JSON.stringify(result.response_headers || {}, null, 2) : tab === 'Assertions' ? result.error || 'All configured checks passed.' : result.response_body_preview || result.error || 'No text response body.'}</pre>{result.response_body_truncated && <small>Response preview truncated to 20 KB.</small>}</section>}
      </div><footer><button type="button" className="secondary-btn" disabled={Boolean(busy)} onClick={onClose}>Cancel</button><div><button type="button" className="secondary-btn" disabled={Boolean(busy)} onClick={() => void test()}><Play className={busy === 'test' ? 'spin' : ''} size={15} />{busy === 'test' ? 'Testing request…' : 'Test request'}</button><button className="primary-btn" disabled={Boolean(busy)}><Plus className={busy === 'create' ? 'spin' : ''} size={16} />{busy === 'create' ? 'Creating monitor…' : 'Create monitor'}</button></div></footer>
    </form>
  </dialog>
}
