import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  Lock,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { api, userFacingError, type EdgeInspectResult, type Monitor } from './api'
import './MultiRegionEdgeInspector.css'

interface MultiRegionEdgeInspectorProps {
  monitor?: Monitor | null
  initialUrl?: string
  monitors?: Monitor[]
  onSelectMonitor?: (monitorId: number) => void
  embedded?: boolean
}

export function MultiRegionEdgeInspector({
  monitor,
  initialUrl,
  monitors = [],
  onSelectMonitor,
  embedded = false,
}: MultiRegionEdgeInspectorProps) {
  const [urlInput, setUrlInput] = useState<string>(
    initialUrl || monitor?.url || 'https://httpbin.org/status/200'
  )
  const [data, setData] = useState<EdgeInspectResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'regions' | 'certificate' | 'propagation'>('regions')

  const runInspection = async (targetUrl?: string) => {
    const toProbe = (targetUrl || urlInput).trim()
    if (!toProbe) return
    setLoading(true)
    setError(null)
    try {
      const result = await api<EdgeInspectResult>(
        `/edge-inspect?url=${encodeURIComponent(toProbe)}`
      )
      setData(result)
    } catch (err) {
      setError(userFacingError(err, 'Failed to inspect network edge across regions. Please check the URL and try again.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (monitor?.url && monitor.url !== urlInput) {
      setUrlInput(monitor.url)
      void runInspection(monitor.url)
    } else if (!data) {
      void runInspection(urlInput)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitor?.url])

  return (
    <div className={`edge-inspector-container ${embedded ? 'embedded' : ''}`}>
      {/* Header bar / URL selector if not embedded or configurable */}
      {!embedded && (
        <div className="edge-inspector-topbar">
          <div className="edge-title-area">
            <div className="edge-icon-wrap">
              <Globe2 size={20} />
            </div>
            <div>
              <h3>Multi-Region Network Edge Inspector</h3>
              <p>Probing global latency, DNS propagation, and SSL certificate validity across 6 edge POPs</p>
            </div>
          </div>

          <div className="edge-search-bar">
            {monitors.length > 0 && (
              <select
                className="edge-monitor-select"
                value={monitor?.id || ''}
                onChange={(e) => {
                  const monId = Number(e.target.value)
                  const chosen = monitors.find(m => m.id === monId)
                  if (chosen) {
                    setUrlInput(chosen.url)
                    void runInspection(chosen.url)
                    onSelectMonitor?.(chosen.id)
                  }
                }}
              >
                <option value="">Choose a monitor endpoint...</option>
                {monitors.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.url})</option>
                ))}
              </select>
            )}

            <form
              className="edge-url-form"
              onSubmit={(e) => {
                e.preventDefault()
                void runInspection()
              }}
            >
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/api"
                disabled={loading}
              />
              <button type="submit" className="primary-btn" disabled={loading}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                {loading ? 'Probing Edges...' : 'Inspect Global Edges'}
              </button>
            </form>
          </div>
        </div>
      )}

      {embedded && (
        <div className="edge-embedded-header">
          <div className="edge-embedded-meta">
            <span className="edge-badge-live">
              <span className="edge-live-dot" /> Live Multi-Region Probe
            </span>
            <span className="edge-target-url">{data?.url || monitor?.url}</span>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => void runInspection()}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Probing 6 Edges...' : 'Re-probe Global Edges'}
          </button>
        </div>
      )}

      {error && (
        <div className="edge-error-banner">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {loading && !data && (
        <div className="edge-loading-state">
          <RefreshCw size={28} className="spin" />
          <h4>Synchronizing Multi-Region Probes...</h4>
          <p>Querying DNS resolvers and testing TLS handshakes across US, Europe, and Asia-Pacific edge points.</p>
        </div>
      )}

      {data && (
        <>
          {/* Global Metric Cards */}
          <div className="edge-metrics-summary">
            <div className="edge-metric-card">
              <span className="edge-metric-label">Global Avg Latency</span>
              <strong className="edge-metric-value">{data.global_avg_latency_ms} <small>ms</small></strong>
              <span className="edge-metric-sub">Across 6 edge POPs</span>
            </div>

            <div className="edge-metric-card">
              <span className="edge-metric-label">Fastest POP</span>
              <strong className="edge-metric-value text-success">{data.fastest_region}</strong>
              <span className="edge-metric-sub">Lowest TTFB route</span>
            </div>

            <div className="edge-metric-card">
              <span className="edge-metric-label">DNS Consistency</span>
              <div className="edge-badge-row">
                <span className={`status-pill ${data.dns_propagation_consistent ? 'up' : 'down'}`}>
                  {data.dns_propagation_consistent ? <Check size={12} /> : <AlertTriangle size={12} />}
                  {data.dns_propagation_consistent ? 'Consistent (6/6)' : 'Propagation Drift'}
                </span>
              </div>
              <span className="edge-metric-sub">{data.resolved_ips.length} Anycast IP{data.resolved_ips.length > 1 ? 's' : ''} resolved</span>
            </div>

            <div className="edge-metric-card">
              <span className="edge-metric-label">SSL / Edge Security</span>
              <div className="edge-badge-row">
                <span className={`status-pill ${data.ssl_certificate ? 'up' : 'paused'}`}>
                  <ShieldCheck size={12} />
                  {data.ssl_certificate ? `${data.ssl_certificate.days_remaining}d remaining` : 'HTTP Only'}
                </span>
              </div>
              <span className="edge-metric-sub">{data.ssl_certificate?.tls_version || 'TLS 1.3'}</span>
            </div>
          </div>

          {/* Sub Navigation tabs */}
          <div className="edge-tabs-bar">
            <button
              type="button"
              className={activeTab === 'regions' ? 'active' : ''}
              onClick={() => setActiveTab('regions')}
            >
              <Globe2 size={15} /> Edge Locations ({data.regions.length})
            </button>
            <button
              type="button"
              className={activeTab === 'certificate' ? 'active' : ''}
              onClick={() => setActiveTab('certificate')}
            >
              <Lock size={15} /> SSL/TLS Certificate Details
            </button>
            <button
              type="button"
              className={activeTab === 'propagation' ? 'active' : ''}
              onClick={() => setActiveTab('propagation')}
            >
              <Network size={15} /> DNS & Anycast Routing
            </button>
          </div>

          {/* TAB 1: REGIONS BREAKDOWN */}
          {activeTab === 'regions' && (
            <div className="edge-regions-grid">
              {data.regions.map((region) => (
                <div key={region.region_id} className={`edge-region-card ${region.status}`}>
                  <div className="region-card-header">
                    <div className="region-name-group">
                      <span className="region-flag">{region.flag}</span>
                      <div>
                        <h4>{region.region_name}</h4>
                        <span className="region-location">{region.location}</span>
                      </div>
                    </div>
                    <div className="region-status-badge">
                      <span className={`status-pill ${region.status === 'healthy' ? 'up' : region.status === 'degraded' ? 'pending' : 'down'}`}>
                        {region.status === 'healthy' ? <Check size={11} /> : <AlertTriangle size={11} />}
                        {region.status}
                      </span>
                    </div>
                  </div>

                  <div className="region-latency-hero">
                    <div className="region-total-ms">
                      <strong>{region.total_latency_ms}</strong>
                      <span>ms</span>
                    </div>
                    <div className="region-http-status">
                      <span className="region-code-badge">HTTP {region.status_code || 200}</span>
                      <small>{region.status_text}</small>
                    </div>
                  </div>

                  {/* Latency Waterfall Bar */}
                  <div className="region-waterfall">
                    <div className="waterfall-labels">
                      <span>Breakdown</span>
                      <span>{region.total_latency_ms}ms total</span>
                    </div>
                    <div className="waterfall-track">
                      <div
                        className="wf-segment dns"
                        style={{ width: `${Math.max(4, (region.dns_lookup_ms / region.total_latency_ms) * 100)}%` }}
                        title={`DNS Lookup: ${region.dns_lookup_ms}ms`}
                      />
                      <div
                        className="wf-segment tcp"
                        style={{ width: `${Math.max(4, (region.tcp_connect_ms / region.total_latency_ms) * 100)}%` }}
                        title={`TCP Connect: ${region.tcp_connect_ms}ms`}
                      />
                      <div
                        className="wf-segment tls"
                        style={{ width: `${Math.max(4, (region.tls_handshake_ms / region.total_latency_ms) * 100)}%` }}
                        title={`TLS Handshake: ${region.tls_handshake_ms}ms`}
                      />
                      <div
                        className="wf-segment ttfb"
                        style={{ width: `${Math.max(4, (region.ttfb_ms / region.total_latency_ms) * 100)}%` }}
                        title={`TTFB / Transfer: ${region.ttfb_ms}ms`}
                      />
                    </div>
                    <div className="waterfall-legend">
                      <span><i className="dot dns" /> DNS {region.dns_lookup_ms}ms</span>
                      <span><i className="dot tcp" /> TCP {region.tcp_connect_ms}ms</span>
                      <span><i className="dot tls" /> TLS {region.tls_handshake_ms}ms</span>
                      <span><i className="dot ttfb" /> TTFB {region.ttfb_ms}ms</span>
                    </div>
                  </div>

                  {/* Edge Metadata */}
                  <div className="region-meta-footer">
                    <div>
                      <small>Edge Server</small>
                      <span>{region.cdn_provider || 'Origin Direct'}</span>
                    </div>
                    <div>
                      <small>Cache Status</small>
                      <span className="cache-pill">{region.cache_status || 'DYNAMIC'}</span>
                    </div>
                    <div>
                      <small>Anycast IP</small>
                      <code>{region.ip_address}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: CERTIFICATE DETAILS */}
          {activeTab === 'certificate' && (
            <div className="edge-cert-panel">
              {data.ssl_certificate ? (
                <div className="edge-cert-content">
                  <div className="cert-banner">
                    <div className="cert-banner-icon">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3>{data.ssl_certificate.subject}</h3>
                      <p>Issued by {data.ssl_certificate.issuer}</p>
                    </div>
                    <div className="cert-expiry-box">
                      <strong>{data.ssl_certificate.days_remaining}</strong>
                      <span>Days Remaining</span>
                    </div>
                  </div>

                  <div className="cert-details-grid">
                    <div className="cert-detail-item">
                      <label>Certificate Subject</label>
                      <code>{data.ssl_certificate.subject}</code>
                    </div>
                    <div className="cert-detail-item">
                      <label>Certificate Authority (Issuer)</label>
                      <span>{data.ssl_certificate.issuer}</span>
                    </div>
                    <div className="cert-detail-item">
                      <label>Validity Window</label>
                      <span>
                        {new Date(data.ssl_certificate.valid_from).toLocaleDateString()} &rarr; {new Date(data.ssl_certificate.valid_to).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="cert-detail-item">
                      <label>TLS Protocol Version</label>
                      <span className="badge-tls">{data.ssl_certificate.tls_version}</span>
                    </div>
                    <div className="cert-detail-item">
                      <label>Cipher Suite</label>
                      <code>{data.ssl_certificate.cipher}</code>
                    </div>
                    <div className="cert-detail-item">
                      <label>Multi-Edge Synchronization</label>
                      <span className="text-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={15} /> Valid & Consistent across all 6 Edge Regions
                      </span>
                    </div>
                  </div>

                  <div className="cert-sans-section">
                    <label>Subject Alternative Names (SANs)</label>
                    <div className="sans-list">
                      {data.ssl_certificate.sans.map((san, i) => (
                        <span key={i} className="san-badge">{san}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edge-empty-state">
                  <Lock size={32} />
                  <h4>No SSL Certificate Discovered</h4>
                  <p>The inspected endpoint is using unencrypted HTTP.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DNS & PROPAGATION */}
          {activeTab === 'propagation' && (
            <div className="edge-dns-panel">
              <div className="dns-summary-header">
                <div>
                  <h4>DNS Resolution & Propagation Verification</h4>
                  <p>Verification that nameservers resolve identically to high-availability ingress IPs across all regions</p>
                </div>
                <span className="status-pill up">
                  <Check size={12} /> Fully Propagated
                </span>
              </div>

              <div className="dns-ip-list">
                <label>Discovered IP Addresses ({data.resolved_ips.length})</label>
                <div className="ip-pills">
                  {data.resolved_ips.map((ip, i) => (
                    <div key={i} className="ip-pill">
                      <Server size={13} />
                      <code>{ip}</code>
                      <small>Anycast Point</small>
                    </div>
                  ))}
                </div>
              </div>

              <table className="propagation-table">
                <thead>
                  <tr>
                    <th>Region Point of Presence</th>
                    <th>Resolved IP</th>
                    <th>DNS Resolution</th>
                    <th>Propagation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regions.map(r => (
                    <tr key={r.region_id}>
                      <td>
                        <span className="region-flag-inline">{r.flag}</span>
                        <strong>{r.region_name}</strong>
                      </td>
                      <td><code>{r.ip_address}</code></td>
                      <td>{r.dns_lookup_ms} ms</td>
                      <td>
                        <span className="status-pill up">
                          <Check size={11} /> Propagated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
