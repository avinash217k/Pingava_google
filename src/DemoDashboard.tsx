import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  Globe2,
  LayoutDashboard,
  Radar,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import { BrandMark } from './Brand'
import { PageMetadata } from './Seo'
import './DemoDashboard.css'

interface DemoMonitor {
  id: number
  name: string
  url: string
  status: 'up' | 'down' | 'degraded'
  uptime: number
  response_time: number
  interval_seconds: number
  last_checked: string
  bars: number[]
}

const DEMO_MONITORS: DemoMonitor[] = [
  {
    id: 1,
    name: 'Production API Gateway',
    url: 'https://api.pingava.com/v1/health',
    status: 'up',
    uptime: 99.99,
    response_time: 24,
    interval_seconds: 30,
    last_checked: '12 seconds ago',
    bars: [85, 90, 88, 92, 85, 95, 100, 90, 88, 92, 94, 96, 92, 90, 95],
  },
  {
    id: 2,
    name: 'Marketing Site & Public Docs',
    url: 'https://pingava.com',
    status: 'up',
    uptime: 100.0,
    response_time: 42,
    interval_seconds: 60,
    last_checked: '28 seconds ago',
    bars: [95, 92, 96, 90, 95, 94, 98, 92, 90, 95, 96, 94, 98, 95, 96],
  },
  {
    id: 3,
    name: 'Authentication Service',
    url: 'https://auth.pingava.com/healthz',
    status: 'up',
    uptime: 99.96,
    response_time: 31,
    interval_seconds: 30,
    last_checked: '8 seconds ago',
    bars: [80, 85, 90, 95, 92, 94, 88, 90, 92, 95, 96, 94, 90, 92, 94],
  },
  {
    id: 4,
    name: 'Stripe Webhook Receiver',
    url: 'https://api.pingava.com/webhooks/stripe',
    status: 'up',
    uptime: 99.98,
    response_time: 55,
    interval_seconds: 60,
    last_checked: '41 seconds ago',
    bars: [90, 92, 85, 90, 94, 88, 92, 95, 90, 88, 92, 94, 90, 95, 92],
  },
  {
    id: 5,
    name: 'Global Edge CDN Gateway',
    url: 'https://cdn.pingava.com/status',
    status: 'up',
    uptime: 99.95,
    response_time: 19,
    interval_seconds: 15,
    last_checked: '4 seconds ago',
    bars: [95, 98, 92, 96, 94, 98, 100, 95, 98, 96, 94, 98, 100, 96, 98],
  },
]

export function DemoDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'edge' | 'radar' | 'incidents'>('overview')
  const [selectedMonitor, setSelectedMonitor] = useState<DemoMonitor>(DEMO_MONITORS[0])

  return (
    <div className="demo-dashboard-container">
      <PageMetadata
        title="Live Interactive Demo Dashboard | Pingava"
        description="Experience Pingava live with zero authentication. Explore synthetic monitors, edge waterfalls, latency anomaly radar, and incident timelines."
        canonicalPath="/demo"
      />

      {/* Floating Read-Only Banner */}
      <aside className="demo-floating-banner" aria-label="Demo notice">
        <div className="demo-banner-text">
          <span className="demo-banner-badge">INTERACTIVE DEMO</span>
          <span>You are viewing an interactive read-only demo. Ready to monitor your own endpoints?</span>
        </div>
        <a href="/register" className="demo-banner-cta">
          Set Up Your Own Free Account <ArrowRight size={14} />
        </a>
      </aside>

      {/* Demo Top Navigation */}
      <header className="demo-header">
        <a href="/" className="demo-brand">
          <BrandMark />
          <span>pingava</span>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginLeft: '0.2rem' }}>
            DEMO WORKSPACE
          </span>
        </a>

        <nav className="demo-nav-tabs" aria-label="Demo Views">
          <button
            type="button"
            className={`demo-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={15} /> Fleet Overview
          </button>
          <button
            type="button"
            className={`demo-tab-btn ${activeTab === 'edge' ? 'active' : ''}`}
            onClick={() => setActiveTab('edge')}
          >
            <Globe2 size={15} /> Edge Waterfalls
          </button>
          <button
            type="button"
            className={`demo-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            <Radar size={15} /> Latency Radar
          </button>
          <button
            type="button"
            className={`demo-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <TriangleAlert size={15} /> Incidents
          </button>
        </nav>

        <a
          href="/register"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#f8fafc',
            textDecoration: 'none',
            fontSize: '0.84rem',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            fontWeight: 600,
          }}
        >
          Exit Demo
        </a>
      </header>

      {/* Main Content Area */}
      <main className="demo-content">
        {/* KPI Stats Row */}
        <section className="demo-stats-grid" aria-label="Workspace Metrics">
          <article className="demo-stat-card">
            <div className="demo-stat-icon-wrap green">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="demo-stat-label">Fleet Uptime (30d)</div>
              <div className="demo-stat-value">99.98%</div>
            </div>
          </article>

          <article className="demo-stat-card">
            <div className="demo-stat-icon-wrap blue">
              <Zap size={22} />
            </div>
            <div>
              <div className="demo-stat-label">Avg. Response Time</div>
              <div className="demo-stat-value">34 ms</div>
            </div>
          </article>

          <article className="demo-stat-card">
            <div className="demo-stat-icon-wrap violet">
              <Radio size={22} />
            </div>
            <div>
              <div className="demo-stat-label">Active Monitors</div>
              <div className="demo-stat-value">5 / 5</div>
            </div>
          </article>

          <article className="demo-stat-card">
            <div className="demo-stat-icon-wrap amber">
              <Activity size={22} />
            </div>
            <div>
              <div className="demo-stat-label">Open Incidents</div>
              <div className="demo-stat-value">0 Active</div>
            </div>
          </article>
        </section>

        {activeTab === 'overview' && (
          <>
            <section className="demo-panel">
              <div className="demo-panel-title">
                <div>
                  <h2>Configured Endpoints</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                    Live synthetic checks across 6 edge points of presence
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.82rem' }}>
                  <span className="demo-dot" /> All probes passing
                </div>
              </div>

              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Monitor</th>
                      <th>Status</th>
                      <th>30d Availability</th>
                      <th>Latency</th>
                      <th>Interval</th>
                      <th>Last Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_MONITORS.map((m) => (
                      <tr
                        key={m.id}
                        style={{ cursor: 'pointer', background: selectedMonitor.id === m.id ? 'rgba(56,189,248,0.05)' : undefined }}
                        onClick={() => setSelectedMonitor(m)}
                      >
                        <td>
                          <div className="demo-monitor-cell">
                            <span className="demo-dot" />
                            <div>
                              <span className="demo-monitor-name">{m.name}</span>
                              <span className="demo-monitor-url">{m.url}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="demo-status-pill">
                            <Check size={12} /> Operational
                          </span>
                        </td>
                        <td>
                          <div className="demo-sparkline-wrap">
                            <strong className="demo-metric-mono">{m.uptime.toFixed(2)}%</strong>
                            <div className="demo-sparkbars">
                              {m.bars.map((h, idx) => (
                                <span
                                  key={idx}
                                  className={`demo-sparkbar ${idx === 7 ? 'minor' : ''}`}
                                  style={{ height: `${Math.round(h * 0.2)}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="demo-metric-mono" style={{ color: '#38bdf8' }}>
                            <Clock3 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            {m.response_time} ms
                          </span>
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Every {m.interval_seconds}s</td>
                        <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{m.last_checked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Response Time Chart Panel */}
            <section className="demo-panel">
              <div className="demo-panel-title">
                <div>
                  <h2>Response Time Distribution ({selectedMonitor.name})</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                    Telemetry recorded across the last 24 check iterations
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onClick={() => {}}
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '6px',
                  height: '110px',
                  background: 'rgba(2, 6, 23, 0.5)',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const base = selectedMonitor.response_time
                  const height = Math.min(100, Math.max(15, base + ((i * 17) % 25) - 10))
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${height}%`,
                        background: 'linear-gradient(180deg, #38bdf8, #0284c7)',
                        borderRadius: '3px',
                        opacity: 0.85,
                        transition: 'height 0.3s ease',
                      }}
                      title={`Check ${i + 1}: ${Math.round(height)} ms`}
                    />
                  )
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'edge' && (
          <section className="demo-panel">
            <div className="demo-panel-title">
              <div>
                <h2>Global Edge Waterfalls</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Synthetic multi-region waterfall inspection for {selectedMonitor.name}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {[
                { name: 'US-East (N. Virginia)', dns: 4, tls: 8, ttfb: 12, total: 24 },
                { name: 'EU-Central (Frankfurt)', dns: 6, tls: 14, ttfb: 22, total: 42 },
                { name: 'AP-South (Mumbai)', dns: 3, tls: 7, ttfb: 8, total: 18 },
                { name: 'AP-Southeast (Singapore)', dns: 5, tls: 11, ttfb: 15, total: 31 },
                { name: 'AP-Northeast (Tokyo)', dns: 7, tls: 12, ttfb: 19, total: 38 },
                { name: 'AU-East (Sydney)', dns: 8, tls: 16, ttfb: 28, total: 52 },
              ].map((pop) => (
                <div
                  key={pop.name}
                  style={{
                    background: 'rgba(2,6,23,0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <strong style={{ fontSize: '0.86rem', color: '#f1f5f9' }}>{pop.name}</strong>
                    <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                      {pop.total} ms
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    <div>DNS: {pop.dns} ms</div>
                    <div>TLS Handshake: {pop.tls} ms</div>
                    <div>TTFB: {pop.ttfb} ms</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'radar' && (
          <section className="demo-panel">
            <div className="demo-panel-title">
              <div>
                <h2>Predictive Latency Anomaly Radar</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Statistical jitter detection forecasting silent routing degradation
                </p>
              </div>
            </div>
            <div style={{ background: 'rgba(2,6,23,0.6)', padding: '1.5rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Fleet Median (p50)</div>
                  <strong style={{ fontSize: '1.5rem', color: '#34d399', fontFamily: 'monospace' }}>28 ms</strong>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>High Percentile (p95)</div>
                  <strong style={{ fontSize: '1.5rem', color: '#38bdf8', fontFamily: 'monospace' }}>54 ms</strong>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Outlier Spike (p99)</div>
                  <strong style={{ fontSize: '1.5rem', color: '#fbbf24', fontFamily: 'monospace' }}>78 ms</strong>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Jitter Variance</div>
                  <strong style={{ fontSize: '1.5rem', color: '#34d399', fontFamily: 'monospace' }}>&plusmn; 2.4 ms</strong>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
                Radar status: <strong>Optimal stability</strong>. No silent degradation or anomalous latency drift detected across the last 10,000 synthetic probes.
              </p>
            </div>
          </section>
        )}

        {activeTab === 'incidents' && (
          <section className="demo-panel">
            <div className="demo-panel-title">
              <div>
                <h2>Recent Incident Timeline &amp; AI Post-Mortem</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Sample simulated incident resolved automatically by Zero-Noise confirmed recovery
                </p>
              </div>
            </div>

            <div className="demo-incident-card">
              <div className="demo-incident-head">
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>
                    Transient DNS Resolution Hiccup in EU-Central
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Incident #INC-1049 &middot; Resolved 2 days ago &middot; Total duration: 1m 45s
                  </div>
                </div>
                <span className="demo-incident-badge">RESOLVED</span>
              </div>

              <div className="demo-ai-box">
                <div className="demo-ai-title">
                  <Sparkles size={16} /> AI Root Cause Breakdown
                </div>
                <p className="demo-ai-text">
                  <strong>Root Cause:</strong> Upstream DNS recursive resolver timeout at Frankfurt edge node.
                  Secondary probes from US-East and AP-South confirmed the origin server remained healthy, preventing
                  false page escalation. The connection fully recovered upon secondary resolver fallback.
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                  <strong>Recommendation:</strong> Configure secondary NS redundancy and increase authoritative TTL to 300s to avoid resolver cache misses during network peering updates.
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
