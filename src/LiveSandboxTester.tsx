import { useState } from 'react'
import { ArrowRight, CheckCircle2, Globe2, Link2, RefreshCw, ShieldAlert, Sparkles, TriangleAlert } from 'lucide-react'
import './LiveSandboxTester.css'

export interface SandboxProbeResult {
  ok: boolean
  url: string
  status_code: number | null
  status_text: string
  dns_time_ms: number | null
  ttfb_ms: number | null
  total_time_ms?: number
  ssl: {
    status: string
    days_remaining: number | null
    issuer: string | null
    protocol: string | null
    expires_at: string | null
  } | null
  error?: string | null
  tested_at: string
  ip_address?: string | null
}

export function LiveSandboxTester() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SandboxProbeResult | null>(null)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)

  const handleRunProbe = async (targetUrl?: string) => {
    const candidate = (targetUrl || url).trim()
    if (!candidate) return

    setLoading(true)
    setRateLimitError(null)
    setResult(null)

    try {
      const res = await fetch('/api/public/sandbox/probe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ url: candidate }),
      })

      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({}))
        setRateLimitError(
          errorData.error ||
            'Rate limit exceeded (maximum 5 checks per minute). Please wait a moment before trying again.'
        )
        return
      }

      const data: SandboxProbeResult = await res.json()
      setResult(data)
      if (data.url) setUrl(data.url)
    } catch {
      setRateLimitError('Unable to connect to Pingava sandbox runner. Please verify your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreset = (presetUrl: string) => {
    setUrl(presetUrl)
    void handleRunProbe(presetUrl)
  }

  const getStatusBadgeClass = (statusCode: number | null) => {
    if (!statusCode) return 'status-5xx'
    if (statusCode >= 200 && statusCode < 300) return 'status-2xx'
    if (statusCode >= 300 && statusCode < 400) return 'status-3xx'
    if (statusCode >= 400 && statusCode < 500) return 'status-4xx'
    return 'status-5xx'
  }

  const currentUrl = result?.url || url || 'https://yourdomain.com'
  const onboardingLink = `/register?url=${encodeURIComponent(currentUrl)}`

  return (
    <section className="sandbox-tester-container" id="sandbox-probe" aria-label="Interactive Live Probe Sandbox">
      <div className="sandbox-tester-header">
        <div className="sandbox-pill">
          <Sparkles size={14} /> Zero-Auth Live Synthetic Sandbox
        </div>
        <h2 className="sandbox-tester-title">Test your website or REST API right now</h2>
        <p className="sandbox-tester-desc">
          Enter any public URL or API endpoint. We will ping it on-demand from our edge cluster to measure DNS
          resolution time, TTFB latency, HTTP status, and SSL certificate health.
        </p>
      </div>

      <div className="sandbox-form-card">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleRunProbe()
          }}
        >
          <div className="sandbox-input-group">
            <div className="sandbox-input-wrap">
              <Link2 size={18} className="sandbox-input-icon" />
              <input
                type="text"
                className="sandbox-input"
                placeholder="Enter your site or API URL: https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                aria-label="URL to test"
              />
            </div>
            <button type="submit" className="sandbox-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" /> Probing...
                </>
              ) : (
                <>
                  <Globe2 size={16} /> Run Instant Test
                </>
              )}
            </button>
          </div>
        </form>

        <div className="sandbox-presets-row">
          <span>Quick test:</span>
          <button
            type="button"
            className="sandbox-preset-chip"
            onClick={() => handlePreset('https://github.com')}
          >
            github.com
          </button>
          <button
            type="button"
            className="sandbox-preset-chip"
            onClick={() => handlePreset('https://stripe.com')}
          >
            stripe.com
          </button>
          <button
            type="button"
            className="sandbox-preset-chip"
            onClick={() => handlePreset('https://cloudflare.com')}
          >
            cloudflare.com
          </button>
          <button
            type="button"
            className="sandbox-preset-chip"
            onClick={() => handlePreset('https://httpbin.org/status/200')}
          >
            httpbin (200 OK)
          </button>
        </div>

        {rateLimitError && (
          <div className="sandbox-alert-card" role="alert">
            <ShieldAlert size={20} color="#f87171" />
            <span>{rateLimitError}</span>
          </div>
        )}

        {result && (
          <div className="sandbox-terminal-card" role="region" aria-label="Probe Results Terminal">
            <div className="sandbox-terminal-header">
              <div className="sandbox-terminal-dots">
                <span className="sandbox-terminal-dot red" />
                <span className="sandbox-terminal-dot yellow" />
                <span className="sandbox-terminal-dot green" />
              </div>
              <span className="sandbox-terminal-title">pingava-probe ~ live-synthetic-test</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {new Date(result.tested_at).toLocaleTimeString()}
              </span>
            </div>

            <div className="sandbox-terminal-body">
              <div className="sandbox-terminal-command">
                <span className="prompt">$</span>
                <span>pingava probe --url {result.url} --regions global</span>
              </div>

              <table className="sandbox-terminal-metrics-table">
                <tbody>
                  <tr>
                    <td className="metric-label">HTTP Status</td>
                    <td className="metric-value">
                      <span className={`sandbox-badge ${getStatusBadgeClass(result.status_code)}`}>
                        {result.status_code ? (
                          <>
                            {result.ok ? <CheckCircle2 size={13} /> : <TriangleAlert size={13} />}
                            {result.status_code} {result.status_text}
                          </>
                        ) : (
                          <>
                            <TriangleAlert size={13} /> {result.status_text || 'Error'}
                          </>
                        )}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="metric-label">DNS Resolution Time</td>
                    <td className="metric-value">
                      {result.dns_time_ms != null ? (
                        <span style={{ color: '#34d399' }}>{result.dns_time_ms} ms</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>N/A</span>
                      )}
                      {result.ip_address && (
                        <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: '0.6rem' }}>
                          (Resolved to {result.ip_address})
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="metric-label">Time to First Byte (TTFB)</td>
                    <td className="metric-value">
                      {result.ttfb_ms != null ? (
                        <span style={{ color: result.ttfb_ms < 150 ? '#38bdf8' : '#fbbf24' }}>
                          {result.ttfb_ms} ms
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>N/A</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="metric-label">SSL Certificate</td>
                    <td className="metric-value">
                      {result.ssl ? (
                        <span>
                          <strong
                            style={{
                              color: result.ssl.status === 'valid' ? '#34d399' : '#f87171',
                              marginRight: '0.4rem',
                            }}
                          >
                            {result.ssl.status.toUpperCase()}
                          </strong>
                          {result.ssl.days_remaining != null && (
                            <span style={{ color: '#94a3b8' }}>
                              ({result.ssl.days_remaining} days remaining
                              {result.ssl.issuer ? ` · ${result.ssl.issuer}` : ''})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Not applicable (HTTP scheme or unavailable)</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {result.error && (
                <div style={{ color: '#f87171', fontSize: '0.82rem', margin: '0.5rem 0' }}>
                  Notice: {result.error}
                </div>
              )}

              <div className="sandbox-terminal-footer">
                <p>
                  Monitor this endpoint every 60 seconds for free &rarr;
                </p>
                <a href={onboardingLink} className="sandbox-cta-link">
                  Create Monitor with this URL <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
