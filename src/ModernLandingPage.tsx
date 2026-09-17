import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Code2,
  Globe2,
  LayoutDashboard,
  Lock,
  Plus,
  Radio,
  Radar,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import { BrandMark } from './Brand'
import { PageMetadata } from './Seo'
import { PublicFooter } from './MarketingPages'
import { dashboardHref } from './appConfig'
import { DogfoodingStatusWidget } from './DogfoodingStatusWidget'
import { LiveSandboxTester } from './LiveSandboxTester'
import './ModernLandingPage.css'

export type ShowcaseTab = 'overview' | 'edge' | 'radar' | 'contract' | 'aidiagnostics' | 'statuspage'

export function ModernLandingPage() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('overview')

  // Interactive edge region selection in edge showcase
  const [selectedEdgeRegion, setSelectedEdgeRegion] = useState<string>('us-east-1')

  // Services suite interactive state
  const [serviceCategory, setServiceCategory] = useState<'all' | 'reliability' | 'intelligence' | 'operations'>('all')
  const [simulatedStep, setSimulatedStep] = useState<number>(3)
  const [edgePopHover, setEdgePopHover] = useState<string>('iad')

  return (
    <div className="modern-landing">
      <PageMetadata
        title="Pingava – Know Before Your Users Do | Website & API Uptime Monitoring"
        description="Monitor websites and APIs globally. Confirm real outages, catch performance problems, and know before your users do."
      />

      <div className="modern-landing-glow-1" />
      <div className="modern-landing-glow-2" />
      <div className="modern-landing-glow-3" />
      <div className="modern-hero-watermark" aria-hidden="true" />

      {/* Modern Sticky Navigation */}
      <header className="modern-nav">
        <a href="/" className="modern-nav-brand">
          <BrandMark />
          <span>pingava</span>
        </a>

        <nav className="modern-nav-links" aria-label="Main Navigation">
          <a href="#services">Services</a>
          <a href="#pingava-showcase" onClick={() => setActiveTab('edge')}>Edge Inspector</a>
          <a href="#pingava-showcase" onClick={() => setActiveTab('radar')}>Latency Radar</a>
          <a href="#pingava-showcase" onClick={() => setActiveTab('contract')}>API Guardian</a>
          <a href="#pingava-showcase" onClick={() => setActiveTab('aidiagnostics')}>AI Diagnostics</a>
          <a href="#sandbox-probe">Live Sandbox</a>
          <a href="/demo" style={{ color: '#38bdf8', fontWeight: 600 }}>Live Demo</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="modern-nav-actions">
          <a href={dashboardHref('/overview')} className="modern-btn-ghost">
            Sign In
          </a>
          <a href={dashboardHref('/register')} className="modern-btn-primary">
            Start Free <ArrowRight size={15} />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="modern-hero-section">
        <a href="#pingava-showcase" onClick={() => setActiveTab('aidiagnostics')} className="modern-hero-badge">
          <span className="pulse-dot" />
          <span>THE COMPLETE SRE &amp; RELIABILITY SUITE: AI Root Cause Diagnostics + Latency Jitter Radar</span>
          <ArrowRight size={13} />
        </a>

        <h1 className="modern-hero-title">
          Next-Gen Uptime &amp; API Reliability. <br />
          <span className="gradient-text">Engineered to Reduce False Alarms.</span>
        </h1>

        <p className="modern-hero-subtitle">
          Monitor websites and APIs globally. Confirm real outages, catch performance problems, and know before your users do.
        </p>

        <p className="modern-hero-capabilities">
          Multi-region checks · API validation · Latency intelligence · AI diagnostics
        </p>

        <div className="modern-hero-cta">
          <a href={dashboardHref('/register')} className="modern-btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
            Start Monitoring Free <ArrowRight size={17} />
          </a>
          <a href="/demo" className="modern-btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
            <LayoutDashboard size={16} style={{ color: '#38bdf8' }} /> View Live Demo
          </a>
          <a href="#sandbox-probe" className="modern-btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
            <Zap size={16} style={{ color: '#34d399' }} /> Test Endpoint Live
          </a>
        </div>

        {/* Live Dogfooding Edge Status Widget directly beneath primary Hero CTA */}
        <DogfoodingStatusWidget />

        <div className="modern-hero-proof">
          <span><ShieldCheck size={16} /> 15s to 60s checks</span>
          <span><Globe2 size={16} /> 6 Global Edge Regions</span>
          <span><Sparkles size={16} style={{ color: '#34d399' }} /> AI Diagnostics</span>
          <span><Radar size={16} style={{ color: '#60a5fa' }} /> Predictive Jitter Radar</span>
          <span><Lock size={16} /> SSL Expiry Guardian</span>
          <span><Bell size={16} /> 100% Free Early Access</span>
        </div>
      </section>

      {/* REAL DASHBOARD SHOWCASE WITH INTERACTIVE LIVE TABS */}
      <section id="pingava-showcase" className="modern-showcase-container" aria-label="Pingava Dashboard Showcase">
        <div className="modern-showcase-tabs-header">
          <span className="modern-showcase-tabs-label">EXPLORE LIVE DASHBOARD VIEWS:</span>
          {/* Showcase View Tabs */}
          <div className="modern-showcase-tabs">
            <button
              type="button"
              className={`modern-showcase-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={15} />
              <span>Fleet Overview</span>
            </button>
            <button
              type="button"
              className={`modern-showcase-tab ${activeTab === 'edge' ? 'active' : ''}`}
              onClick={() => setActiveTab('edge')}
            >
              <Globe2 size={15} />
              <span>Global Edge Inspector</span>
              <span className="tab-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>6 PoPs</span>
            </button>
            <button
              type="button"
              className={`modern-showcase-tab ${activeTab === 'radar' ? 'active' : ''}`}
              onClick={() => setActiveTab('radar')}
            >
              <Radar size={15} />
              <span>Latency Anomaly Radar</span>
              <span className="tab-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>SRE</span>
            </button>
            <button
              type="button"
              className={`modern-showcase-tab ${activeTab === 'contract' ? 'active' : ''}`}
              onClick={() => setActiveTab('contract')}
            >
              <Code2 size={15} />
              <span>API Contract Guardian</span>
              <span className="tab-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>Drift</span>
            </button>
            <button
              type="button"
              className={`modern-showcase-tab ${activeTab === 'aidiagnostics' ? 'active' : ''}`}
              onClick={() => setActiveTab('aidiagnostics')}
            >
              <Sparkles size={15} style={{ color: '#10b981' }} />
              <span>AI Root Cause Diagnostics</span>
              <span className="tab-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>AI</span>
            </button>
            <button
              type="button"
              className={`modern-showcase-tab ${activeTab === 'statuspage' ? 'active' : ''}`}
              onClick={() => setActiveTab('statuspage')}
            >
              <ShieldCheck size={15} />
              <span>Public Status Page</span>
            </button>
          </div>
        </div>

        {/* Realistic Dark macOS Window Frame */}
        <div className="modern-browser-frame">
          <div className="modern-browser-header">
            <div className="modern-browser-dots">
              <span className="dot-red" />
              <span className="dot-yellow" />
              <span className="dot-green" />
            </div>

            <div className="modern-browser-address">
              <Lock size={12} />
              <span>
                https://dashboard.pingava.com
                {activeTab === 'overview'
                  ? '/overview'
                  : activeTab === 'edge'
                  ? '/edge-inspector?target=api.acme.com'
                  : activeTab === 'radar'
                  ? '/latency-radar'
                  : activeTab === 'contract'
                  ? '/monitors/1/contract-guardian'
                  : activeTab === 'aidiagnostics'
                  ? '/incidents/inc-104/ai-diagnostics'
                  : '/status-pages/acme'}
              </span>
            </div>

            <div className="modern-browser-live-pill">
              <span className="dot" />
              <span>Telemetry Connected (15s polling)</span>
            </div>
          </div>

          {/* TAB 1: FLEET OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="modern-dashboard-layout">
              {/* Simulated Left Sidebar */}
              <aside className="sim-sidebar">
                <div className="sim-sidebar-top">
                  <div className="sim-sidebar-brand">
                    <BrandMark />
                    <span>pingava</span>
                  </div>

                  <nav className="sim-sidebar-nav">
                    <div className="sim-nav-item active" onClick={() => setActiveTab('overview')}>
                      <div>
                        <LayoutDashboard size={15} />
                        <span>Overview</span>
                      </div>
                    </div>
                    <div className="sim-nav-item" onClick={() => setActiveTab('edge')}>
                      <div>
                        <Globe2 size={15} />
                        <span>Edge Inspector</span>
                      </div>
                      <span className="sim-nav-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>6</span>
                    </div>
                    <div className="sim-nav-item" onClick={() => setActiveTab('radar')}>
                      <div>
                        <Radar size={15} />
                        <span>Latency Radar</span>
                      </div>
                      <span className="sim-nav-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>SRE</span>
                    </div>
                    <div className="sim-nav-item" onClick={() => setActiveTab('contract')}>
                      <div>
                        <Code2 size={15} />
                        <span>API Guardian</span>
                      </div>
                    </div>
                    <div className="sim-nav-item" onClick={() => setActiveTab('aidiagnostics')}>
                      <div>
                        <Sparkles size={15} style={{ color: '#34d399' }} />
                        <span>AI Diagnostics</span>
                      </div>
                      <span className="sim-nav-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>AI</span>
                    </div>
                    <div className="sim-nav-item" onClick={() => setActiveTab('statuspage')}>
                      <div>
                        <ShieldCheck size={15} />
                        <span>Status Page</span>
                      </div>
                    </div>
                  </nav>
                </div>

                <div className="sim-sidebar-usage">
                  <div className="sim-usage-header">
                    <span>Monitors Used</span>
                    <strong>12 / 60 (Pro)</strong>
                  </div>
                  <div className="sim-usage-bar">
                    <div className="sim-usage-progress" style={{ width: '20%' }} />
                  </div>
                </div>
              </aside>

              {/* Simulated Main Dashboard Content */}
              <div className="sim-content">
                <div className="sim-header">
                  <div className="sim-header-title">
                    <h2>Acme Production Fleet</h2>
                    <p>Live health, response latency distribution, and confirmed outage triage.</p>
                  </div>
                  <div className="sim-header-actions">
                    <button type="button" className="sim-btn-add">
                      <Plus size={14} /> Add monitor
                    </button>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="sim-stats-grid">
                  <div className="sim-stat-card">
                    <div className="sim-stat-icon green">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="sim-stat-info">
                      <span className="sim-stat-label">Overall Uptime</span>
                      <span className="sim-stat-value">99.98%</span>
                      <span className="sim-stat-sub">Based on 14,280 checks</span>
                    </div>
                  </div>

                  <div className="sim-stat-card">
                    <div className="sim-stat-icon blue">
                      <Zap size={18} />
                    </div>
                    <div className="sim-stat-info">
                      <span className="sim-stat-label">Avg. Response Time</span>
                      <span className="sim-stat-value">114 ms</span>
                      <span className="sim-stat-sub">Across 12 active monitors</span>
                    </div>
                  </div>

                  <div
                    className="sim-stat-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTab('aidiagnostics')}
                    title="Click to view AI Root Cause Diagnostics"
                  >
                    <div className="sim-stat-icon amber">
                      <TriangleAlert size={18} />
                    </div>
                    <div className="sim-stat-info">
                      <span className="sim-stat-label">Active Incidents</span>
                      <span className="sim-stat-value" style={{ color: '#fbbf24' }}>1</span>
                      <span className="sim-stat-sub alert" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Sparkles size={11} style={{ color: '#34d399' }} /> Payments API · AI Diagnosed &rarr;
                      </span>
                    </div>
                  </div>

                  <div className="sim-stat-card">
                    <div className="sim-stat-icon purple">
                      <Radio size={18} />
                    </div>
                    <div className="sim-stat-info">
                      <span className="sim-stat-label">Active Monitors</span>
                      <span className="sim-stat-value">12</span>
                      <span className="sim-stat-sub">12 running · 0 paused</span>
                    </div>
                  </div>
                </div>

                {/* Latency Performance Chart */}
                <div className="sim-chart-panel">
                  <div className="sim-chart-header">
                    <div>
                      <h3>Recent Response Time Waterfall</h3>
                      <p>Latest checks across your production endpoints (showing 120ms baseline with isolated 502 spike)</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      <RefreshCw size={12} style={{ display: 'inline', marginRight: 4 }} /> Polled 2s ago
                    </span>
                  </div>

                  <div className="sim-chart-body">
                    {[
                      { ms: 110, ok: true },
                      { ms: 95, ok: true },
                      { ms: 140, ok: true },
                      { ms: 120, ok: true },
                      { ms: 105, ok: true },
                      { ms: 88, ok: true },
                      { ms: 130, ok: true },
                      { ms: 160, ok: true },
                      { ms: 115, ok: true },
                      { ms: 90, ok: true },
                      { ms: 102, ok: true },
                      { ms: 145, ok: true },
                      { ms: 135, ok: true },
                      { ms: 125, ok: true },
                      { ms: 180, ok: true },
                      { ms: 110, ok: true },
                      { ms: 98, ok: true },
                      { ms: 105, ok: true },
                      { ms: 512, ok: false }, // Incident spike!
                      { ms: 115, ok: true },
                      { ms: 92, ok: true },
                      { ms: 130, ok: true },
                      { ms: 108, ok: true },
                      { ms: 124, ok: true },
                    ].map((item, idx) => {
                      const heightPct = Math.min(100, Math.max(12, (item.ms / 500) * 90))
                      return (
                        <div key={idx} className="sim-chart-bar-wrap" title={`${item.ms}ms ${item.ok ? 'OK' : 'Failed'}`}>
                          <div
                            className={`sim-chart-bar ${item.ok ? '' : 'failed'}`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="sim-chart-axis">
                    <span>1 hour ago</span>
                    <span style={{ color: '#ef4444' }}>⚠️ 14:22 UTC - Consecutive 502 Spike Confirmed</span>
                    <span>Now</span>
                  </div>
                </div>

                {/* Real Monitors Table */}
                <div className="sim-table-wrap">
                  <div className="sim-table-head">
                    <span>Monitor</span>
                    <span>Status</span>
                    <span>Uptime</span>
                    <span>Response</span>
                    <span>Last Checked</span>
                    <span />
                  </div>

                  {/* Row 1: Production API Gateway */}
                  <div className="sim-table-row">
                    <div className="sim-monitor-name">
                      <span className="sim-monitor-dot up" />
                      <div className="sim-monitor-title">
                        <strong>Production API Gateway</strong>
                        <small>https://api.acme.com/v1/health</small>
                      </div>
                    </div>
                    <div>
                      <span className="sim-status-pill up">
                        <Check size={11} /> 200 OK
                      </span>
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: '#fff' }}>99.98%</strong>
                      <div className="sim-uptime-bars">
                        {Array.from({ length: 14 }, (_, i) => (
                          <span key={i} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#cbd5e1' }}>98 ms</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>1m ago</span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <RefreshCw size={13} />
                    </div>
                  </div>

                  {/* Row 2: Payments API (Active Incident) */}
                  <div
                    className="sim-table-row"
                    style={{ background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer' }}
                    onClick={() => setActiveTab('aidiagnostics')}
                    title="Click to view AI Root Cause Diagnostics"
                  >
                    <div className="sim-monitor-name">
                      <span className="sim-monitor-dot down" />
                      <div className="sim-monitor-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ color: '#f87171' }}>Payments Processing API</strong>
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: 3,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Sparkles size={10} /> AI Diagnosed
                          </span>
                        </div>
                        <small>https://api.acme.com/v1/charge · 🚨 Confirmed Incident #inc-104</small>
                      </div>
                    </div>
                    <div>
                      <span className="sim-status-pill down">
                        <TriangleAlert size={11} /> 502 Outage
                      </span>
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: '#f87171' }}>97.42%</strong>
                      <div className="sim-uptime-bars">
                        {Array.from({ length: 11 }, (_, i) => (
                          <span key={i} />
                        ))}
                        <span className="warn" />
                        <span style={{ background: '#ef4444' }} />
                        <span style={{ background: '#ef4444' }} />
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>5,120 ms</span>
                    </div>
                    <div>
                      <span style={{ color: '#f87171' }}>Just now</span>
                    </div>
                    <div style={{ color: '#34d399' }}>
                      <Sparkles size={14} />
                    </div>
                  </div>

                  {/* Row 3: Marketing Website */}
                  <div className="sim-table-row">
                    <div className="sim-monitor-name">
                      <span className="sim-monitor-dot up" />
                      <div className="sim-monitor-title">
                        <strong>Marketing &amp; Docs Site</strong>
                        <small>https://acme.com</small>
                      </div>
                    </div>
                    <div>
                      <span className="sim-status-pill up">
                        <Check size={11} /> 200 OK
                      </span>
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: '#fff' }}>100.0%</strong>
                      <div className="sim-uptime-bars">
                        {Array.from({ length: 14 }, (_, i) => (
                          <span key={i} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#cbd5e1' }}>42 ms</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>2m ago</span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <RefreshCw size={13} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL MULTI-REGION EDGE INSPECTOR */}
          {activeTab === 'edge' && (
            <div className="sim-edge-view">
              <div className="sim-edge-header">
                <div className="sim-edge-title-row">
                  <div>
                    <div className="sim-edge-tag">
                      <Globe2 size={13} /> MULTI-REGION ANYCAST EDGE NETWORK
                    </div>
                    <h3>Global Network Probing &amp; Latency Waterfalls</h3>
                    <p>
                      Probing <code>https://api.acme.com</code> concurrently from 6 Tier-1 edge PoPs to verify DNS consistency, TLS negotiation, and regional TTFB.
                    </p>
                  </div>
                  <div className="sim-edge-summary-stat">
                    <div>
                      <span>Global Avg. TTFB</span>
                      <strong>68 ms</strong>
                    </div>
                    <div>
                      <span>Fastest PoP</span>
                      <strong style={{ color: '#34d399' }}>US-East (18 ms)</strong>
                    </div>
                    <div>
                      <span>DNS Consistency</span>
                      <strong style={{ color: '#34d399' }}>6/6 Consistent</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edge Map & Regional Waterfall Layout */}
              <div className="sim-edge-grid">
                {/* Regional PoP selector & ping cards */}
                <div className="sim-edge-pops-list">
                  {[
                    { id: 'us-east-1', name: 'US East (N. Virginia)', flag: '🇺🇸', latency: 18, dns: 4, tcp: 6, tls: 8, ttfb: 14, ip: '104.21.52.110', status: 'optimal' },
                    { id: 'us-west-1', name: 'US West (Oregon)', flag: '🇺🇸', latency: 42, dns: 5, tcp: 12, tls: 14, ttfb: 36, ip: '104.21.52.110', status: 'optimal' },
                    { id: 'eu-central-1', name: 'Europe Central (Frankfurt)', flag: '🇩🇪', latency: 84, dns: 8, tcp: 24, tls: 28, ttfb: 76, ip: '104.21.52.110', status: 'optimal' },
                    { id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', flag: '🇯🇵', latency: 128, dns: 10, tcp: 36, tls: 42, ttfb: 116, ip: '104.21.52.110', status: 'optimal' },
                    { id: 'sa-east-1', name: 'South America (São Paulo)', flag: '🇧🇷', latency: 146, dns: 12, tcp: 44, tls: 48, ttfb: 132, ip: '104.21.52.110', status: 'optimal' },
                    { id: 'ap-southeast-2', name: 'Australia (Sydney)', flag: '🇦🇺', latency: 172, dns: 14, tcp: 52, tls: 58, ttfb: 154, ip: '104.21.52.110', status: 'optimal' },
                  ].map((pop) => (
                    <div
                      key={pop.id}
                      className={`sim-edge-pop-card ${selectedEdgeRegion === pop.id ? 'active' : ''}`}
                      onClick={() => setSelectedEdgeRegion(pop.id)}
                    >
                      <div className="sim-pop-head">
                        <span className="sim-pop-flag">{pop.flag}</span>
                        <div>
                          <strong>{pop.name}</strong>
                          <small>IP: {pop.ip}</small>
                        </div>
                        <div className="sim-pop-latency">
                          <strong>{pop.latency} ms</strong>
                          <span className="sim-pop-dot" />
                        </div>
                      </div>

                      {/* Mini visual waterfall bar */}
                      <div className="sim-waterfall-bar">
                        <div className="wf-segment dns" style={{ width: '15%' }} title={`DNS: ${pop.dns}ms`} />
                        <div className="wf-segment tcp" style={{ width: '25%' }} title={`TCP: ${pop.tcp}ms`} />
                        <div className="wf-segment tls" style={{ width: '30%' }} title={`TLS: ${pop.tls}ms`} />
                        <div className="wf-segment ttfb" style={{ width: '30%' }} title={`TTFB: ${pop.ttfb}ms`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Region Detailed Protocol Waterfall */}
                <div className="sim-edge-detail-panel">
                  <div className="sim-detail-header">
                    <h4>Protocol Timing Breakdown — {selectedEdgeRegion.toUpperCase()}</h4>
                    <span className="sim-ssl-tag">
                      <Lock size={12} /> TLS 1.3 · RSA 2048 · Valid for 142 days
                    </span>
                  </div>

                  <div className="sim-waterfall-legend">
                    <span><i className="dns-dot" /> DNS Lookup (4ms)</span>
                    <span><i className="tcp-dot" /> TCP Connect (6ms)</span>
                    <span><i className="tls-dot" /> TLS Handshake (8ms)</span>
                    <span><i className="ttfb-dot" /> Server TTFB (14ms)</span>
                  </div>

                  <div className="sim-waterfall-stages">
                    <div className="sim-wf-stage">
                      <div className="stage-label"><span>1. DNS Resolution</span><strong>4.2 ms</strong></div>
                      <div className="stage-progress"><div style={{ width: '8%', background: '#38bdf8' }} /></div>
                      <small>Resolved Anycast IPs: <code>104.21.52.110</code>, <code>172.67.182.204</code></small>
                    </div>

                    <div className="sim-wf-stage">
                      <div className="stage-label"><span>2. TCP 3-Way Handshake</span><strong>6.8 ms</strong></div>
                      <div className="stage-progress"><div style={{ width: '14%', background: '#818cf8' }} /></div>
                      <small>SYN &rarr; SYN-ACK &rarr; ACK established on port 443</small>
                    </div>

                    <div className="sim-wf-stage">
                      <div className="stage-label"><span>3. TLS 1.3 Negotiation</span><strong>8.4 ms</strong></div>
                      <div className="stage-progress"><div style={{ width: '18%', background: '#c084fc' }} /></div>
                      <small>Cipher: TLS_AES_128_GCM_SHA256 (0-RTT Session Resumed)</small>
                    </div>

                    <div className="sim-wf-stage">
                      <div className="stage-label"><span>4. Time to First Byte (TTFB)</span><strong>14.1 ms</strong></div>
                      <div className="stage-progress"><div style={{ width: '28%', background: '#34d399' }} /></div>
                      <small>HTTP GET /v1/health returned HTTP 200 OK</small>
                    </div>
                  </div>

                  <div className="sim-edge-footer-note">
                    <CheckCircle2 size={15} style={{ color: '#34d399' }} />
                    <span>Global routing verified across North America, Europe, Asia-Pacific, and South America with zero DNS propagation drift.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREDICTIVE LATENCY ANOMALY RADAR */}
          {activeTab === 'radar' && (
            <div className="sim-radar-view">
              <div className="sim-radar-hero-bar">
                <div className="sim-radar-badge">
                  <Radar size={15} /> PREDICTIVE SRE ENGINE
                </div>
                <h3>Catch Silent Latency Drift Before Hard 500 Outages Strike</h3>
                <p>
                  Most catastrophic cloud incidents begin with gradual P99 tail latency spikes and connection pool saturation.
                  Pingava&apos;s SRE radar monitors jitter standard deviation to alert you hours ahead of downtime.
                </p>
              </div>

              <div className="sim-radar-grid">
                {/* Radar visualization card */}
                <div className="sim-radar-card">
                  <div className="sim-radar-card-header">
                    <h4>Fleet Jitter &amp; Percentile Telemetry</h4>
                    <span className="radar-live-indicator"><span /> Real-time tracking</span>
                  </div>

                  <div className="sim-radar-canvas-mock">
                    <div className="radar-sweep-circle">
                      <div className="radar-sweep-line" />
                      <div className="radar-ping-dot dot-1" title="API Gateway: 42ms" />
                      <div className="radar-ping-dot dot-2" title="Auth Service: 54ms" />
                      <div className="radar-ping-dot dot-3 anomaly" title="Payments API: 480ms (Jitter Alert!)" />
                      <div className="radar-ping-dot dot-4" title="Docs Site: 28ms" />
                    </div>
                    <div className="radar-stat-overlay">
                      <div className="stat-pill"><small>P50 Latency</small><strong>48 ms</strong></div>
                      <div className="stat-pill"><small>P90 Latency</small><strong>124 ms</strong></div>
                      <div className="stat-pill warn"><small>P99 Latency</small><strong style={{ color: '#fbbf24' }}>482 ms</strong></div>
                      <div className="stat-pill alert"><small>Jitter Drift</small><strong style={{ color: '#f87171' }}>+340%</strong></div>
                    </div>
                  </div>
                </div>

                {/* Anomaly list */}
                <div className="sim-radar-anomalies">
                  <h4>Detected Jitter Anomalies (Fleet Scope)</h4>

                  <div className="anomaly-item high-risk">
                    <div className="anomaly-head">
                      <span className="anomaly-tag alert">HIGH SEVERITY DRIFT</span>
                      <small>Payments Processing API</small>
                    </div>
                    <div className="anomaly-body">
                      <strong>Tail Latency Escalation (P99 jumped from 110ms &rarr; 482ms)</strong>
                      <p>
                        High variance observed over 18 consecutive checks. Database connection pool queue length increased 4.2x.
                      </p>
                    </div>
                    <div className="anomaly-footer">
                      <span>Threshold: &gt; 250ms P99</span>
                      <strong style={{ color: '#f87171' }}>Action Required &rarr;</strong>
                    </div>
                  </div>

                  <div className="anomaly-item low-risk">
                    <div className="anomaly-head">
                      <span className="anomaly-tag normal">HEALTHY BASELINE</span>
                      <small>Production API Gateway</small>
                    </div>
                    <div className="anomaly-body">
                      <strong>Low Jitter (P50: 38ms · P99: 58ms)</strong>
                      <p>Consistent response times observed across all 6 global probe locations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API CONTRACT & SCHEMA DRIFT GUARDIAN */}
          {activeTab === 'contract' && (
            <div className="sim-contract-view">
              <div className="sim-contract-header">
                <div className="sim-contract-tag">
                  <Code2 size={13} /> REST API SCHEMA GUARDIAN
                </div>
                <h3>Detect Breaking Payload Changes Before Client Apps Crash</h3>
                <p>
                  Status code 200 is not enough. If your API accidentally drops a required field or mutates a type from <code>number</code> to <code>string</code>, Pingava alerts you immediately.
                </p>
              </div>

              <div className="sim-contract-grid">
                {/* Schema tree view */}
                <div className="sim-contract-card">
                  <div className="contract-card-header">
                    <h4>Expected JSON Contract — <code>GET /v1/user/profile</code></h4>
                    <span className="status-pill up"><Check size={12} /> OpenAPI v3 Synced</span>
                  </div>

                  <div className="contract-schema-table">
                    <div className="schema-row header">
                      <span>Field Path</span>
                      <span>Expected Type</span>
                      <span>Required</span>
                      <span>Validation</span>
                    </div>
                    <div className="schema-row">
                      <code>data.id</code>
                      <span className="type-badge">string (uuid)</span>
                      <span className="req-badge">Yes</span>
                      <span className="val-badge ok"><Check size={11} /> Matched</span>
                    </div>
                    <div className="schema-row">
                      <code>data.email</code>
                      <span className="type-badge">string</span>
                      <span className="req-badge">Yes</span>
                      <span className="val-badge ok"><Check size={11} /> Matched</span>
                    </div>
                    <div className="schema-row drift-row">
                      <code>data.account_tier</code>
                      <span className="type-badge warn">string</span>
                      <span className="req-badge">Yes</span>
                      <span className="val-badge error"><TriangleAlert size={11} /> DROPPED KEY</span>
                    </div>
                    <div className="schema-row">
                      <code>data.created_at</code>
                      <span className="type-badge">number (timestamp)</span>
                      <span className="req-badge">Yes</span>
                      <span className="val-badge ok"><Check size={11} /> Matched</span>
                    </div>
                  </div>
                </div>

                {/* Diff inspection */}
                <div className="sim-contract-card diff">
                  <div className="contract-card-header">
                    <h4>Live Response Diff Alert</h4>
                    <span className="status-pill down"><AlertTriangle size={12} /> Schema Drift Detected</span>
                  </div>

                  <div className="sim-code-diff">
                    <div className="diff-line unchanged">{`{`}</div>
                    <div className="diff-line unchanged">{`  "status": "ok",`}</div>
                    <div className="diff-line unchanged">{`  "data": {`}</div>
                    <div className="diff-line unchanged">{`    "id": "usr_99a8b1c4",`}</div>
                    <div className="diff-line unchanged">{`    "email": "sarah@acme.com",`}</div>
                    <div className="diff-line removed">{`-   "account_tier": "enterprise",  // MISSING IN RECENT DEPLOY`}</div>
                    <div className="diff-line unchanged">{`    "created_at": 1726245000`}</div>
                    <div className="diff-line unchanged">{`  }`}</div>
                    <div className="diff-line unchanged">{`}`}</div>
                  </div>

                  <div className="diff-alert-box">
                    <TriangleAlert size={16} color="#f87171" />
                    <div>
                      <strong>Breaking Change Flagged:</strong>
                      <p>Field <code>data.account_tier</code> was removed in production build without API version bump. Mobile app clients will encounter null reference errors.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI ROOT CAUSE DIAGNOSTICS */}
          {activeTab === 'aidiagnostics' && (
            <div className="sim-ai-view">
              <div className="sim-ai-card">
                <div className="sim-ai-header">
                  <div className="sim-ai-brand-row">
                    <div className="sim-ai-icon">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="sim-ai-tags">
                        <h3>AI Failure Synthesis</h3>
                        <span className="tag-model">AI Engine</span>
                        <span className="tag-conf">94% CONFIDENCE</span>
                        <span className="tag-origin">UPSTREAM INGRESS TIMEOUT</span>
                      </div>
                      <p>
                        Incident #inc-104: Continuous HTTP 502 Bad Gateway detected on <code>https://api.acme.com/v1/charge</code>.
                      </p>
                    </div>
                  </div>

                  <div className="sim-ai-actions">
                    <span className="ai-exec-time">Synthesized in 1.4s</span>
                    <button type="button" className="sim-ai-refresh-btn">
                      <RefreshCw size={13} /> Re-analyze Incident
                    </button>
                  </div>
                </div>

                {/* Primary Hypothesis Box */}
                <div className="sim-ai-hypothesis">
                  <div className="hypo-title">
                    <TriangleAlert size={18} />
                    <strong>Primary Root Cause Hypothesis:</strong>
                  </div>
                  <p>
                    The Cloudflare Anycast edge connected to the Kubernetes cluster ingress controller in 18ms, but the backend pod pool <code>payments-worker</code> timed out after 5,000ms. Socket connection was forcibly closed with <code>ECONNRESET</code> due to connection pool starvation on Postgres database replica <code>db-read-02</code>.
                  </p>
                </div>

                {/* Remediation & Public Notice Grid */}
                <div className="sim-ai-details-grid">
                  <div className="sim-ai-subcard">
                    <div className="subcard-title">
                      <ShieldAlert size={15} style={{ color: '#38bdf8' }} />
                      <span>Recommended SRE Remediation Runbook</span>
                    </div>
                    <ol>
                      <li>Check active connections on PostgreSQL cluster: <code>SELECT count(*) FROM pg_stat_activity;</code></li>
                      <li>Drain and restart saturated worker pods in deployment <code>payments-worker-deployment</code>.</li>
                      <li>Temporarily route card authorization traffic to standby backup gateway.</li>
                    </ol>
                  </div>

                  <div className="sim-ai-subcard">
                    <div className="subcard-title">
                      <Bell size={15} style={{ color: '#34d399' }} />
                      <span>Auto-Drafted Public Status Notice</span>
                    </div>
                    <div className="ai-notice-quote">
                      &quot;We are currently investigating elevated 502 Bad Gateway errors affecting transaction processing. Checkout sessions are temporarily queued and our engineering team is actively rerouting traffic.&quot;
                    </div>
                    <small>Ready to publish to your public status page with 1 click.</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BRANDED PUBLIC STATUS PAGE */}
          {activeTab === 'statuspage' && (
            <div className="sim-statuspage-view">
              <div className="sim-sp-header">
                <div className="sim-sp-brand">
                  <BrandMark />
                  <span>Acme Platform Status</span>
                </div>
                <button type="button" className="sim-sp-subscribe-btn">
                  <Bell size={13} /> Subscribe to updates (38 subscribers)
                </button>
              </div>

              <div className="sim-sp-banner">
                <TriangleAlert size={20} color="#d97706" />
                <div>
                  <strong>Active Incident: Investigating Payments Processing Degradation</strong>
                  <p>
                    Card authorizations are experiencing intermittent 502 errors. All core authentication and API endpoints remain fully operational.
                  </p>
                </div>
              </div>

              <div className="sim-sp-services">
                <div className="sim-sp-service-header">
                  <h4>Component Status &amp; 90-Day Histograms</h4>
                  <span>99.98% 90-day fleet uptime</span>
                </div>

                <div className="sim-sp-row">
                  <div className="sp-name">
                    <strong>Production API Gateway</strong>
                    <small>Core REST services</small>
                  </div>
                  <div className="sp-bars">
                    {Array.from({ length: 42 }, (_, i) => (
                      <span key={i} title="100% operational" />
                    ))}
                  </div>
                  <span className="sp-status up"><CheckCircle2 size={14} /> Operational</span>
                </div>

                <div className="sim-sp-row">
                  <div className="sp-name">
                    <strong>Payments &amp; Checkout API</strong>
                    <small>Card transaction gateway</small>
                  </div>
                  <div className="sp-bars">
                    {Array.from({ length: 39 }, (_, i) => (
                      <span key={i} title="Operational" />
                    ))}
                    <span style={{ background: '#f59e0b' }} title="Latency degradation" />
                    <span style={{ background: '#ef4444' }} title="502 Outage" />
                    <span style={{ background: '#ef4444' }} title="Active Incident" />
                  </div>
                  <span className="sp-status degraded"><TriangleAlert size={14} /> Degraded</span>
                </div>

                <div className="sim-sp-row">
                  <div className="sp-name">
                    <strong>Customer Dashboard &amp; Webhook Delivery</strong>
                    <small>Management interface</small>
                  </div>
                  <div className="sp-bars">
                    {Array.from({ length: 42 }, (_, i) => (
                      <span key={i} title="100% operational" />
                    ))}
                  </div>
                  <span className="sp-status up"><CheckCircle2 size={14} /> Operational</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE ZERO-AUTH LIVE SANDBOX TESTER */}
      <div id="uptime-checker">
        <LiveSandboxTester />
      </div>

      {/* THE 6 CORE SERVICES OF PINGAVA (THE COMPLETE RELIABILITY SUITE) */}
      <section id="services" className="modern-bento-section">
        <div style={{ textAlign: 'center' }}>
          <div className="modern-section-pill">
            <ShieldCheck size={14} /> The Pingava Reliability Cloud
          </div>
          <h2 className="modern-section-title">Everything modern engineering teams need for 99.99% uptime</h2>
          <p className="modern-section-desc">
            Replace fragmented monitoring tools with high-fidelity synthetic checks, global edge telemetry, and automated AI diagnostics.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="modern-category-filter">
            <button
              className={`category-pill ${serviceCategory === 'all' ? 'active' : ''}`}
              onClick={() => setServiceCategory('all')}
            >
              All 6 Capabilities
            </button>
            <button
              className={`category-pill ${serviceCategory === 'reliability' ? 'active' : ''}`}
              onClick={() => setServiceCategory('reliability')}
            >
              <ShieldCheck size={14} /> Reliability &amp; Edge
            </button>
            <button
              className={`category-pill ${serviceCategory === 'intelligence' ? 'active' : ''}`}
              onClick={() => setServiceCategory('intelligence')}
            >
              <Sparkles size={14} /> AI &amp; Schema Guardian
            </button>
            <button
              className={`category-pill ${serviceCategory === 'operations' ? 'active' : ''}`}
              onClick={() => setServiceCategory('operations')}
            >
              <Bell size={14} /> Status Pages &amp; Alerts
            </button>
          </div>
        </div>

        <div className="modern-services-grid">
          {/* Card 1: Zero-Noise Synthetic Monitoring */}
          {(serviceCategory === 'all' || serviceCategory === 'reliability') && (
            <div className="modern-service-card">
              <div className="service-card-top">
                <div className="service-header-row">
                  <div className="service-icon green">
                    <ShieldCheck size={22} />
                  </div>
                  <span className="service-badge green">REDUCE FALSE ALARMS</span>
                </div>
                <h3>Zero-Noise Synthetic Monitoring</h3>
                <p>
                  Verify outages through multi-step failure thresholds before triggering an on-call page.
                </p>
              </div>

              <div className="service-card-visual">
                <div className="visual-pipeline-head">
                  <span>Threshold Verification Pipeline</span>
                  <button
                    className="visual-sim-btn"
                    onClick={() => setSimulatedStep((prev) => (prev % 3) + 1)}
                    title="Click to simulate next check state"
                  >
                    <RefreshCw size={11} /> Simulate Step {simulatedStep}/3
                  </button>
                </div>

                <div className="visual-dual-threshold-stepper">
                  <div className={`stepper-item ${simulatedStep >= 1 ? 'pass' : 'pending'}`}>
                    <div className="stepper-badge"><Check size={12} /></div>
                    <div className="stepper-info">
                      <strong>Check 1: 200 OK</strong>
                      <span>28ms • Nominal state</span>
                    </div>
                  </div>

                  <div className={`stepper-item ${simulatedStep >= 2 ? 'warn' : 'pending'}`}>
                    <div className="stepper-badge"><TriangleAlert size={12} /></div>
                    <div className="stepper-info">
                      <strong>Check 2: 502 Timeout</strong>
                      <span className="pill-soft">Soft Hiccup • Suppressed</span>
                    </div>
                  </div>

                  <div className={`stepper-item ${simulatedStep >= 3 ? 'danger confirmed' : 'pending'}`}>
                    <div className="stepper-badge"><TriangleAlert size={12} /></div>
                    <div className="stepper-info">
                      <strong>Check 3: 502 Outage</strong>
                      <span className="pill-alert">3/3 Threshold Met • Alert Dispatched</span>
                    </div>
                  </div>
                </div>

                <div className="visual-badge-note">
                  Configured: 3 consecutive failures before incident · 2 successes to resolve
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Multi-Region Global Edge Inspector */}
          {(serviceCategory === 'all' || serviceCategory === 'reliability') && (
            <div className="modern-service-card">
              <div className="service-card-top">
                <div className="service-header-row">
                  <div className="service-icon blue">
                    <Globe2 size={22} />
                  </div>
                  <span className="service-badge blue">6 EDGE POPS</span>
                </div>
                <h3>Global Multi-Region Edge Inspector</h3>
                <p>
                  Probe endpoints from 6 Tier-1 edge locations with protocol waterfalls (DNS, TLS, TTFB).
                </p>
              </div>

              <div className="service-card-visual">
                <div className="edge-latency-matrix">
                  <div
                    className={`edge-row ${edgePopHover === 'iad' ? 'selected' : ''}`}
                    onMouseEnter={() => setEdgePopHover('iad')}
                  >
                    <span className="edge-loc">🇺🇸 US-East (IAD)</span>
                    <div className="edge-bar-wrap">
                      <div className="edge-bar fast" style={{ width: '24%' }} />
                    </div>
                    <span className="edge-latency">18ms</span>
                  </div>

                  <div
                    className={`edge-row ${edgePopHover === 'sfo' ? 'selected' : ''}`}
                    onMouseEnter={() => setEdgePopHover('sfo')}
                  >
                    <span className="edge-loc">🇺🇸 US-West (SFO)</span>
                    <div className="edge-bar-wrap">
                      <div className="edge-bar fast" style={{ width: '38%' }} />
                    </div>
                    <span className="edge-latency">38ms</span>
                  </div>

                  <div
                    className={`edge-row ${edgePopHover === 'fra' ? 'selected' : ''}`}
                    onMouseEnter={() => setEdgePopHover('fra')}
                  >
                    <span className="edge-loc">🇩🇪 Europe (FRA)</span>
                    <div className="edge-bar-wrap">
                      <div className="edge-bar med" style={{ width: '58%' }} />
                    </div>
                    <span className="edge-latency">82ms</span>
                  </div>

                  <div
                    className={`edge-row ${edgePopHover === 'nrt' ? 'selected' : ''}`}
                    onMouseEnter={() => setEdgePopHover('nrt')}
                  >
                    <span className="edge-loc">🇯🇵 Asia (NRT)</span>
                    <div className="edge-bar-wrap">
                      <div className="edge-bar med" style={{ width: '74%' }} />
                    </div>
                    <span className="edge-latency">126ms</span>
                  </div>

                  <div
                    className={`edge-row ${edgePopHover === 'gru' ? 'selected' : ''}`}
                    onMouseEnter={() => setEdgePopHover('gru')}
                  >
                    <span className="edge-loc">🇧🇷 S. America (GRU)</span>
                    <div className="edge-bar-wrap">
                      <div className="edge-bar med" style={{ width: '84%' }} />
                    </div>
                    <span className="edge-latency">144ms</span>
                  </div>

                  <div
                    className={`edge-row ${edgePopHover === 'syd' ? 'selected' : ''}`}
                    onMouseEnter={() => setEdgePopHover('syd')}
                  >
                    <span className="edge-loc">🇦🇺 Australia (SYD)</span>
                    <div className="edge-bar-wrap">
                      <div className="edge-bar slow" style={{ width: '96%' }} />
                    </div>
                    <span className="edge-latency">168ms</span>
                  </div>
                </div>

                <div className="visual-badge-note">
                  Anycast routing consistency · Multi-region TCP &amp; TLS handshake waterfalls
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Predictive Latency Anomaly Radar */}
          {(serviceCategory === 'all' || serviceCategory === 'reliability') && (
            <div className="modern-service-card">
              <div className="service-card-top">
                <div className="service-header-row">
                  <div className="service-icon purple">
                    <Radar size={22} />
                  </div>
                  <span className="service-badge purple">P50 / P90 / P99</span>
                </div>
                <h3>Predictive Latency Anomaly Radar</h3>
                <p>
                  Detect silent degradation and tail latency drift before customer-facing outages occur.
                </p>
              </div>

              <div className="service-card-visual">
                {/* Metric Strip */}
                <div className="radar-metric-strip">
                  <div className="radar-chip">
                    <small>P50 Median</small>
                    <strong className="text-emerald">42ms</strong>
                  </div>
                  <div className="radar-chip">
                    <small>P90 Target</small>
                    <strong className="text-blue">89ms</strong>
                  </div>
                  <div className="radar-chip alert">
                    <small>P99 Tail Spike</small>
                    <strong className="text-rose">480ms ⚠️</strong>
                  </div>
                </div>

                <div className="visual-jitter-chart-enhanced">
                  <div className="jitter-threshold-line" title="Latency SLO Threshold (200ms)">
                    <span>200ms SLO</span>
                  </div>
                  <div className="jitter-bars-flex">
                    <div className="j-bar" style={{ height: '24%' }}><span className="j-tooltip">48ms</span></div>
                    <div className="j-bar" style={{ height: '28%' }}><span className="j-tooltip">56ms</span></div>
                    <div className="j-bar" style={{ height: '26%' }}><span className="j-tooltip">52ms</span></div>
                    <div className="j-bar" style={{ height: '32%' }}><span className="j-tooltip">64ms</span></div>
                    <div className="j-bar spike" style={{ height: '94%' }}><span className="j-tooltip">480ms (P99)</span></div>
                    <div className="j-bar" style={{ height: '28%' }}><span className="j-tooltip">56ms</span></div>
                    <div className="j-bar" style={{ height: '22%' }}><span className="j-tooltip">44ms</span></div>
                  </div>
                </div>

                <div className="visual-badge-note">
                  Jitter standard deviation drift detected (σ=±54ms) · Saturation warning
                </div>
              </div>
            </div>
          )}

          {/* Card 4: API Contract & Schema Drift Guardian */}
          {(serviceCategory === 'all' || serviceCategory === 'intelligence') && (
            <div className="modern-service-card">
              <div className="service-card-top">
                <div className="service-header-row">
                  <div className="service-icon amber">
                    <Code2 size={22} />
                  </div>
                  <span className="service-badge amber">SCHEMA VALIDATION</span>
                </div>
                <h3>API Contract &amp; Schema Drift Guardian</h3>
                <p>
                  Validate live JSON response structures to prevent breaking changes in production.
                </p>
              </div>

              <div className="service-card-visual">
                <div className="contract-code-window">
                  <div className="code-window-bar">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                    <span className="code-title">GET /api/v2/user/session</span>
                  </div>
                  <div className="code-body">
                    <div className="code-line pass">
                      <span className="sign">✓</span>
                      <code>&quot;id&quot;: 9042,</code>
                      <span className="tag">type: number</span>
                    </div>
                    <div className="code-line pass">
                      <span className="sign">✓</span>
                      <code>&quot;email&quot;: &quot;alex@corp.com&quot;,</code>
                      <span className="tag">type: string</span>
                    </div>
                    <div className="code-line fail">
                      <span className="sign">✖</span>
                      <code>&quot;tier&quot;: undefined</code>
                      <span className="tag-alert">DROPPED KEY</span>
                    </div>
                  </div>
                </div>

                <div className="visual-badge-note">
                  Alert: Breaking schema drift detected on live API payload
                </div>
              </div>
            </div>
          )}

          {/* Card 5: AI Root Cause Diagnostics */}
          {(serviceCategory === 'all' || serviceCategory === 'intelligence') && (
            <div className="modern-service-card">
              <div className="service-card-top">
                <div className="service-header-row">
                  <div className="service-icon green" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <Sparkles size={22} />
                  </div>
                  <span className="service-badge green">AI DIAGNOSTICS</span>
                </div>
                <h3>AI Root Cause Diagnostics</h3>
                <p>
                  Synthesize headers, response bodies, and latency spikes into actionable fixes in 1.2s.
                </p>
              </div>

              <div className="service-card-visual">
                <div className="ai-diagnostic-box">
                  <div className="ai-diag-header">
                    <div className="ai-diag-title">
                      <Sparkles size={14} color="#34d399" />
                      <strong>Root Cause Synthesis</strong>
                    </div>
                    <span className="ai-conf-badge">98% Confidence • 1.1s</span>
                  </div>

                  <div className="ai-diag-body">
                    <div className="ai-cause-row">
                      <span className="ai-label">Incident:</span>
                      <span className="ai-value">HTTP 504 Gateway Timeout on /checkout</span>
                    </div>
                    <div className="ai-cause-row">
                      <span className="ai-label">Root Cause:</span>
                      <span className="ai-value-highlight">
                        Replica db-read-02 pool exhaustion (150/150 connections)
                      </span>
                    </div>
                    <div className="ai-cause-row">
                      <span className="ai-label">Fix:</span>
                      <code className="ai-cmd">kubectl scale deployment api-worker --replicas=8</code>
                    </div>
                  </div>
                </div>

                <div className="visual-badge-note">
                  Instant post-mortem report and public status incident summary generated
                </div>
              </div>
            </div>
          )}

          {/* Card 6: Branded Status Pages & Fast Alerts */}
          {(serviceCategory === 'all' || serviceCategory === 'operations') && (
            <div className="modern-service-card">
              <div className="service-card-top">
                <div className="service-header-row">
                  <div className="service-icon cyan">
                    <ShieldCheck size={22} />
                  </div>
                  <span className="service-badge cyan">99.99% SLA</span>
                </div>
                <h3>Branded Status Pages &amp; Fast Alerts</h3>
                <p>
                  Host custom-domain status pages with 90-day history and multi-channel notifications.
                </p>
              </div>

              <div className="service-card-visual">
                <div className="status-mockup-wrap">
                  <div className="status-browser-bar">
                    <Lock size={10} color="#34d399" />
                    <span>status.yourdomain.com</span>
                    <span className="status-uptime-pill">99.99% Uptime</span>
                  </div>

                  <div className="status-uptime-timeline">
                    {Array.from({ length: 30 }, (_, i) => (
                      <span
                        key={i}
                        className={i === 18 ? 'status-tick degraded' : 'status-tick ok'}
                        title={i === 18 ? 'Day 19: 99.82% (Minor incident)' : `Day ${i + 1}: 100% Operational`}
                      />
                    ))}
                  </div>

                  <div className="alert-channels-row">
                    <span className="channel-pill">
                      <span className="ch-dot slack" /> Slack <small>&lt;0.4s</small>
                    </span>
                    <span className="channel-pill">
                      <span className="ch-dot discord" /> Discord <small>&lt;0.5s</small>
                    </span>
                    <span className="channel-pill">
                      <span className="ch-dot pager" /> PagerDuty <small>&lt;0.6s</small>
                    </span>
                    <span className="channel-pill">
                      <span className="ch-dot sms" /> SMS <small>&lt;0.9s</small>
                    </span>
                  </div>
                </div>

                <div className="visual-badge-note">
                  Sub-second webhook &amp; email delivery with double opt-in subscriber management
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VALUE & COMPETITOR BENCHMARK */}
      <section id="pricing" className="modern-pricing-comparison-section">
        <div style={{ textAlign: 'center' }}>
          <div className="modern-section-pill">
            <Sparkles size={14} /> Early Access Launch
          </div>
          <h2 className="modern-section-title">100% Free During Public Launch. Paid Plans Coming Soon.</h2>
          <p className="modern-section-desc">
            Why pay $15 for only 10 monitors on legacy platforms? Pingava is 100% free during our early access period while merchant payment processing is being finalized. Get multi-region edge inspection, SSL expiry tracking, and zero false alarms without entering a credit card.
          </p>
        </div>

        <div className="modern-pricing-table-wrap">
          <table className="modern-pricing-table">
            <thead>
              <tr>
                <th>Feature / Capability</th>
                <th className="highlight-col">
                  <strong>Pingava Early Access</strong>
                  <span className="price-tag" style={{ color: '#10b981' }}>$0 / Free Forever</span>
                </th>
                <th className="highlight-col-pro">
                  <span className="pro-badge">COMING SOON</span>
                  <strong>Pingava Pro Tiers</strong>
                  <span className="price-tag" style={{ color: '#38bdf8' }}>Paid Plans Coming Soon</span>
                </th>
                <th>
                  <span>Pingdom</span>
                  <span className="competitor-price">$15 / mo</span>
                </th>
                <th>
                  <span>UptimeRobot</span>
                  <span className="competitor-price">$8 / mo</span>
                </th>
                <th>
                  <span>Better Uptime</span>
                  <span className="competitor-price">$29 / mo</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Synthetic Monitors Included</td>
                <td className="highlight-col font-bold">10 Monitors (Free)</td>
                <td className="highlight-col-pro font-bold">60+ Monitors</td>
                <td>10 Monitors</td>
                <td>10 Monitors</td>
                <td>50 Monitors</td>
              </tr>
              <tr>
                <td>Cost per Monitor</td>
                <td className="highlight-col text-emerald font-bold">$0.00 (100% Free)</td>
                <td className="highlight-col-pro text-emerald font-bold">Early Adopter Perks</td>
                <td>$1.50 / mon</td>
                <td>$0.80 / mon</td>
                <td>$0.58 / mon</td>
              </tr>
              <tr>
                <td>Check Frequency</td>
                <td className="highlight-col font-bold">1 minute</td>
                <td className="highlight-col-pro font-bold">30 seconds</td>
                <td>1 minute</td>
                <td>1 minute</td>
                <td>3 minutes</td>
              </tr>
              <tr>
                <td>Multi-Region Edge PoPs</td>
                <td className="highlight-col font-bold">3 Regions</td>
                <td className="highlight-col-pro font-bold">6 Regions</td>
                <td>Add-on ($$)</td>
                <td>Basic</td>
                <td>Basic</td>
              </tr>
              <tr>
                <td>Predictive Latency Radar (P50–P99)</td>
                <td className="highlight-col text-emerald font-bold">✓ Included</td>
                <td className="highlight-col-pro text-emerald font-bold">✓ Included</td>
                <td className="text-muted">✗ None</td>
                <td className="text-muted">✗ None</td>
                <td className="text-muted">✗ None</td>
              </tr>
              <tr>
                <td>API Contract &amp; Schema Guardian</td>
                <td className="highlight-col text-emerald font-bold">✓ Included</td>
                <td className="highlight-col-pro text-emerald font-bold">✓ Included</td>
                <td className="text-muted">✗ None</td>
                <td className="text-muted">✗ None</td>
                <td className="text-muted">✗ None</td>
              </tr>
              <tr>
                <td>AI Root Cause Diagnostics</td>
                <td className="highlight-col text-muted">—</td>
                <td className="highlight-col-pro text-emerald font-bold">✓ Included</td>
                <td className="text-muted">✗ None</td>
                <td className="text-muted">✗ None</td>
                <td className="text-muted">✗ None</td>
              </tr>
              <tr>
                <td>Public Status Pages</td>
                <td className="highlight-col font-bold">Unlimited</td>
                <td className="highlight-col-pro font-bold">Unlimited</td>
                <td>1 included</td>
                <td>1 included</td>
                <td>1 included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SOCIAL PROOF & STATS STRIP */}
      <section className="modern-metrics-strip">
        <div className="modern-metric-item">
          <h4>99.99%</h4>
          <p>Probe Dispatch Reliability</p>
        </div>
        <div className="modern-metric-item">
          <h4>6 Global</h4>
          <p>Tier-1 Anycast Edge PoPs</p>
        </div>
        <div className="modern-metric-item">
          <h4>0</h4>
          <p>False Alarms with Dual Rules</p>
        </div>
        <div className="modern-metric-item">
          <h4>1.4s</h4>
          <p>Average AI Root Cause Synthesis</p>
        </div>
      </section>

      {/* FINAL HIGH-IMPACT CALL TO ACTION */}
      <section className="modern-cta-section">
        <h2>Stop finding out about downtime from angry customer tweets</h2>
        <p>
          Join thousands of developers, DevOps engineers, and tech leads who trust Pingava for mission-critical uptime monitoring,
          incident triage, and transparent status communication.
        </p>

        <div className="modern-cta-actions">
          <a href="/register" className="modern-btn-primary" style={{ padding: '0.85rem 2.2rem', fontSize: '1.05rem' }}>
            Create Your Free Workspace <ArrowRight size={17} />
          </a>
          <a href="#uptime-checker" className="modern-btn-secondary" style={{ padding: '0.85rem 2.2rem', fontSize: '1.05rem' }}>
            Run a Free Check First
          </a>
        </div>

        <div style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
          ✓ Free tier available forever · ✓ No credit card required · ✓ Setup in under 60 seconds
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  )
}
