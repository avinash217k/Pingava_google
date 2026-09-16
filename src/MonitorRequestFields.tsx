import { useState } from 'react'
import { AlertTriangle, Braces, ChevronDown, KeyRound, ListPlus, PlayCircle, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { normalizeEndpointUrl, type Monitor } from './api'

type Pair = { id: number; key: string; value: string }
let nextPairId = 1

function initialPairs(values?: Record<string, string>): Pair[] {
  const pairs = Object.entries(values || {}).map(([key, value]) => ({ id: nextPairId++, key, value }))
  return pairs.length ? pairs : [{ id: nextPairId++, key: '', value: '' }]
}

function KeyValueRows({ kind, initial }: { kind: 'header' | 'query'; initial?: Record<string, string> }) {
  const [rows, setRows] = useState<Pair[]>(() => initialPairs(initial))
  const update = (id: number, field: 'key' | 'value', value: string) => setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row))
  const remove = (id: number) => setRows((current) => current.length === 1 ? [{ id: nextPairId++, key: '', value: '' }] : current.filter((row) => row.id !== id))
  return <div className="request-pairs">
    {rows.map((row) => <div className="request-pair" key={row.id}>
      <input name={`${kind}_key`} value={row.key} onChange={(event) => update(row.id, 'key', event.target.value)} placeholder={kind === 'header' ? 'Header name' : 'Parameter'} aria-label={`${kind} name`} />
      <input name={`${kind}_value`} value={row.value} onChange={(event) => update(row.id, 'value', event.target.value)} placeholder="Value" aria-label={`${kind} value`} />
      <button type="button" className="icon-btn" onClick={() => remove(row.id)} title={`Remove ${kind}`}><Trash2 size={14} /></button>
    </div>)}
    <button type="button" className="request-add" onClick={() => setRows((current) => [...current, { id: nextPairId++, key: '', value: '' }])}><Plus size={14} />Add {kind === 'header' ? 'header' : 'parameter'}</button>
  </div>
}

export function MonitorRequestFields({ monitor, guided = false }: { monitor?: Monitor; guided?: boolean }) {
  const [requestTab, setRequestTab] = useState('Headers')
  const [method, setMethod] = useState(monitor?.http_method || 'GET')
  const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  const [executionMode, setExecutionMode] = useState<'recurring' | 'manual'>(() => monitor?.execution_mode || (['POST', 'PUT', 'PATCH', 'DELETE'].includes(monitor?.http_method || 'GET') ? 'manual' : 'recurring'))
  const [acknowledged, setAcknowledged] = useState(Boolean(monitor?.state_change_acknowledged))
  const [interval, setInterval] = useState(() => unsafe && monitor && ![15, 30, 60, 360, 1440].includes(monitor.interval_minutes) ? 15 : monitor?.interval_minutes || (unsafe ? 30 : 5))
  const [bodyText, setBodyText] = useState(() => monitor?.request_body === null || monitor?.request_body === undefined ? '' : JSON.stringify(monitor.request_body, null, 2))
  const configured = Boolean(Object.keys(monitor?.request_headers || {}).length || Object.keys(monitor?.query_params || {}).length || monitor?.request_body !== null && monitor?.request_body !== undefined)
  return <>
    <div className="request-url-grid">
      <label>HTTP method<select name="http_method" value={method} onChange={(event) => { const next = event.target.value as Monitor['http_method']; const nextUnsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(next); setMethod(next); setAcknowledged(false); setExecutionMode(nextUnsafe ? 'manual' : 'recurring'); setInterval(nextUnsafe ? 30 : 5); if (guided && ['POST', 'PUT', 'PATCH'].includes(next)) setRequestTab('Body') }}><option>GET</option><option>HEAD</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select></label>
      <label>Public URL<input name="url" type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" required defaultValue={monitor?.url} placeholder="https://api.example.com/health" onBlur={(e) => { if (e.target.value.trim()) e.target.value = normalizeEndpointUrl(e.target.value) }} /></label>
    </div>
    <details className="request-options" open={configured || method !== 'GET'}>
      <summary><span><ListPlus size={16} /><span><strong>Request configuration</strong><small>Headers, query parameters, and an optional JSON body</small></span></span><ChevronDown size={16} /></summary>
      <div className="request-options-body">
        {guided && <div className="test-tabs" role="tablist" aria-label="Request configuration">{['Headers', 'Query Params', 'Body'].map((tab) => <button type="button" role="tab" aria-selected={requestTab === tab} key={tab} onClick={() => setRequestTab(tab)}>{tab}</button>)}</div>}
        <section hidden={guided && requestTab !== 'Headers'}><div className="request-subheading"><KeyRound size={15} /><div><strong>Headers</strong><small>Sensitive values are masked after saving.</small></div></div><KeyValueRows kind="header" initial={monitor?.request_headers} /></section>
        <section hidden={guided && requestTab !== 'Query Params'}><div className="request-subheading"><ListPlus size={15} /><div><strong>Query parameters</strong><small>Sent using HTTP query-parameter handling.</small></div></div><KeyValueRows kind="query" initial={monitor?.query_params} /></section>
        {(guided || method !== 'GET') && <section hidden={guided && requestTab !== 'Body'}><div className="request-subheading"><Braces size={15} /><div><strong>JSON request body</strong><small>Content-Type is added automatically unless you provide one.</small></div></div><textarea name="request_body" rows={7} value={bodyText} onChange={(event) => setBodyText(event.target.value)} placeholder={'{\n  "status": "healthy"\n}'} spellCheck={false} /></section>}
      </div>
    </details>
    <section className={`execution-safety ${unsafe ? 'unsafe' : ''}`}>
      <div className="execution-safety-title">{unsafe ? <AlertTriangle size={18} /> : <RefreshCw size={18} />}<div><strong>Execution</strong><small>{unsafe ? `${method} can change data at the destination.` : 'Choose automatic monitoring or run checks yourself.'}</small></div></div>
      {unsafe && <div className="execution-warning" role="note"><AlertTriangle size={17} /><div><strong>This request may create, update, or delete data.</strong><span>Manual only is safest. A timeout is ambiguous: the destination may complete the action even when Pingava receives no response.</span></div></div>}
      <fieldset className="execution-mode"><legend>Run mode</legend><label className={executionMode === 'manual' ? 'selected' : ''}><input type="radio" name="execution_mode" value="manual" checked={executionMode === 'manual'} onChange={() => { setExecutionMode('manual'); setAcknowledged(false) }} /><PlayCircle size={17} /><span><strong>Manual only</strong><small>Run only when you click Run check.</small></span></label><label className={executionMode === 'recurring' ? 'selected' : ''}><input type="radio" name="execution_mode" value="recurring" checked={executionMode === 'recurring'} onChange={() => setExecutionMode('recurring')} /><RefreshCw size={17} /><span><strong>Recurring</strong><small>Run automatically on a schedule.</small></span></label></fieldset>
      {executionMode === 'recurring' && <div className="execution-schedule"><label>Check interval<select name="interval" value={interval} onChange={(event) => setInterval(Number(event.target.value))}>{(unsafe ? [15, 30, 60, 360, 1440] : [5, 10, 15, 30, 60, 360, 1440]).map((minutes) => <option value={minutes} key={minutes}>{minutes < 60 ? `Every ${minutes} minutes` : minutes === 60 ? 'Every hour' : minutes === 1440 ? 'Every day' : `Every ${minutes / 60} hours`}</option>)}</select><small>{Math.round(1440 / interval).toLocaleString()} requests per day</small></label><label>Timeout (seconds)<input name="timeout" type="number" min="2" max="60" defaultValue={monitor?.timeout_seconds || 10} required /></label></div>}
      {executionMode === 'manual' && <><input type="hidden" name="interval" value={interval} /><label>Timeout (seconds)<input name="timeout" type="number" min="2" max="60" defaultValue={monitor?.timeout_seconds || 10} required /></label></>}
      {unsafe && executionMode === 'recurring' && <label className="execution-ack"><input type="checkbox" name="state_change_acknowledged" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} required /><span>I understand Pingava will repeatedly send this {method} request and it may change data.</span></label>}
    </section>
  </>
}
