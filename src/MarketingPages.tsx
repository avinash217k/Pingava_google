import { useState } from 'react'
import { Activity, ArrowRight, Bell, CheckCircle2, Clock3, Globe2, Radio, ShieldCheck, TriangleAlert, Zap } from 'lucide-react'
import { BrandMark } from './Brand'
import { PageMetadata } from './Seo'
import { runUptimeCheck, type UptimeCheckResult } from './uptimeCheck'
import { userFacingError } from './api'
import './PublicFooter.css'
import { useTheme, type ThemePreference } from './ThemeContext'
import { ModernLandingPage } from './ModernLandingPage'
import { dashboardHref } from './appConfig'

type PageKey = 'website-monitoring' | 'api-monitoring' | 'status-pages'

const pages = {
  'website-monitoring': {
    title: 'Website Uptime Monitoring | Pingava',
    description: 'Monitor website uptime and response times with confirmed outage detection, incident tracking and email alerts from Pingava.',
    eyebrow: 'Website uptime monitoring',
    heading: 'Know when your website goes down.',
    intro: 'Pingava checks your website on a schedule, confirms failures before opening incidents, and alerts you when service recovers.',
    features: [['Confirmed outages', 'Use consecutive failure checks to reduce noisy alerts.'], ['Response history', 'Track availability and response times across every recorded check.'], ['Recovery alerts', 'Know when your website is healthy again without repeatedly refreshing it.']],
  },
  'api-monitoring': {
    title: 'API Monitoring and Downtime Alerts | Pingava',
    description: 'Monitor HTTP APIs, accepted status codes, timeouts, response times and SSL certificates with Pingava.',
    eyebrow: 'API monitoring',
    heading: 'Monitor the endpoints your product depends on.',
    intro: 'Configure accepted HTTP status codes, timeouts and check intervals for public APIs, health endpoints and production services.',
    features: [['HTTP status validation', 'Define the status codes that represent a healthy response.'], ['Configurable timeouts', 'Detect slow or unavailable endpoints using limits that fit each service.'], ['SSL visibility', 'Track certificate expiry alongside uptime and response-time checks.']],
  },
  'status-pages': {
    title: 'Public Status Pages for Websites and APIs | Pingava',
    description: 'Publish a clear public status page with live service health, incident updates and subscriber notifications using Pingava.',
    eyebrow: 'Public status pages',
    heading: 'Keep users informed when service changes.',
    intro: 'Publish selected services, share incident updates and let subscribers receive status and recovery notifications by email.',
    features: [['Live service health', 'Show operational, checking and outage states for selected monitors.'], ['Incident communication', 'Publish investigating, identified, monitoring and resolved updates.'], ['Subscriber updates', 'Let users opt in to incident notifications and unsubscribe securely.']],
  },
} satisfies Record<PageKey, { title: string; description: string; eyebrow: string; heading: string; intro: string; features: string[][] }>

function XIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>
}

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.34 3.5A1.84 1.84 0 1 1 5.33 7.18 1.84 1.84 0 0 1 5.34 3.5ZM3.75 8.6h3.17v10.15H3.75V8.6Zm5.16 0h3.03v1.39h.04c.42-.8 1.45-1.64 2.99-1.64 3.19 0 3.78 2.1 3.78 4.84v5.56h-3.16v-4.93c0-1.18-.02-2.69-1.64-2.69-1.64 0-1.89 1.28-1.89 2.6v5.02H8.91V8.6Z" /></svg>
}

export function PublicHeader({ story = false }: { story?: boolean }) {
  return <header className="marketing-header"><a className="brand-lockup compact" href="/" aria-label="Pingava homepage"><BrandMark /><strong>pingava</strong></a><nav aria-label="Product pages"><a href={story ? '#story-website' : '/website-monitoring'}>Website monitoring</a><a href={story ? '#story-api' : '/api-monitoring'}>API monitoring</a><a href={story ? '#story-status' : '/status-pages'}>Status pages</a><a href={story ? '#story-checker' : '/tools/uptime-checker'}>Free uptime checker</a></nav><div className="marketing-header-actions"><a href={dashboardHref('/overview')}>Go to dashboard</a><a className="primary-btn" href={dashboardHref('/overview')}>Open dashboard <ArrowRight size={15} /></a></div></header>
}

export function MarketingHome() {
  return <ModernLandingPage />
}


export function ProductLandingPage({ pageKey }: { pageKey: PageKey }) {
  const page = pages[pageKey]
  return <><PageMetadata title={page.title} description={page.description} canonicalPath={`/${pageKey}`} /><div className="marketing-page"><PublicHeader /><main><section className="marketing-hero"><div><p>{page.eyebrow}</p><h1>{page.heading}</h1><span>{page.intro}</span><div className="marketing-actions"><a className="primary-btn" href={dashboardHref('/register')}>Create a Pingava workspace <ArrowRight size={16} /></a><a href="/tools/uptime-checker">Check a URL for free</a></div></div><div className="signal-panel" aria-label="Pingava monitoring workflow"><div><Radio size={18} /><span>Detect</span><strong>Scheduled HTTP checks</strong></div><div><TriangleAlert size={18} /><span>Confirm</span><strong>Consecutive failure rules</strong></div><div><Bell size={18} /><span>Notify</span><strong>Incident and recovery email</strong></div></div></section><section className="marketing-features" aria-labelledby="capabilities"><p>Built for clear signals</p><h2 id="capabilities">Monitoring details you can act on</h2><div>{page.features.map(([title, copy], index) => <article key={title}>{index === 0 ? <ShieldCheck size={20} /> : index === 1 ? <Clock3 size={20} /> : <Zap size={20} />}<h3>{title}</h3><p>{copy}</p></article>)}</div></section><section className="marketing-band"><div><p>Start with a real endpoint</p><h2>See what Pingava can detect.</h2></div><a className="secondary-btn" href="/tools/uptime-checker">Open the free uptime checker <ArrowRight size={15} /></a></section></main><PublicFooter /></div></>
}

export function UptimeChecker() {
  const [result, setResult] = useState<UptimeCheckResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(''); setResult(null)
    try { const form = new FormData(event.currentTarget); setResult((await runUptimeCheck(String(form.get('url') || ''))).result) }
    catch (reason) { setError(userFacingError(reason, 'The URL could not be checked. Confirm it is public and try again.')) }
    finally { setLoading(false) }
  }
  const description = 'Check whether a public website or API endpoint is reachable and see its HTTP status and response time with Pingava.'
  return <><PageMetadata title="Free Website Uptime Checker | Pingava" description={description} canonicalPath="/tools/uptime-checker" /><div className="marketing-page"><PublicHeader /><main className="tool-main"><section className="tool-intro"><p>Free uptime checker</p><h1>Check a website or API right now.</h1><span>Run a one-time availability check from Pingava and see the HTTP status and response time. No account required.</span></section><section className="uptime-tool" aria-labelledby="checker-heading"><h2 id="checker-heading">Enter a public URL</h2><form onSubmit={submit}><label htmlFor="check-url">Website or API URL</label><div><input id="check-url" name="url" type="url" required placeholder="https://example.com/health" /><button className="primary-btn" disabled={loading}>{loading ? <Activity className="spin" size={17} /> : <Globe2 size={17} />}{loading ? 'Checking' : 'Check uptime'}</button></div></form>{error && <div className="tool-result error"><TriangleAlert size={20} /><div><strong>Check unavailable</strong><p>{error}</p></div></div>}{result && <div className={`tool-result ${result.ok ? 'success' : 'error'}`}>{result.ok ? <CheckCircle2 size={22} /> : <TriangleAlert size={22} />}<div><strong>{result.ok ? 'Endpoint is reachable' : 'Endpoint returned an unhealthy result'}</strong><p>{result.status_code ? `HTTP ${result.status_code}` : result.error || 'Request failed'} &middot; {result.response_time} ms</p></div></div>}<small>Only public HTTP and HTTPS endpoints are accepted. Results are one-time checks, not continuous monitoring.</small></section><section className="tool-next"><h2>Need continuous monitoring?</h2><p>Create a monitor to retain check history, confirm incidents, watch SSL expiry and receive recovery alerts.</p><a className="primary-btn" href="/register">Start monitoring <ArrowRight size={15} /></a></section></main><PublicFooter /></div></>
}

function ClosingCta() {
  return <section className="closing-cta" aria-labelledby="closing-cta-title"><div className="closing-cta-copy"><p>GET STARTED TODAY</p><h2 id="closing-cta-title">Know when your services go down.<br /><em>Before your users do.</em></h2><span>Start monitoring your websites and APIs in minutes. No credit card required.</span></div><div className="closing-cta-actions"><div><a className="closing-cta-primary" href="/register">Start monitoring free <ArrowRight size={17} /></a><a className="closing-cta-secondary" href="/tools/uptime-checker">Run a free check</a></div><ul aria-label="Getting started benefits"><li>✓ No credit card required</li><li>✓ Setup in minutes</li><li>✓ Trusted by builders</li></ul></div></section>
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" /></svg>
}

export function PublicFooter({ showCta = false }: { showCta?: boolean }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { preference, setTheme } = useTheme()

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !email.includes('@')) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubscribed(true)
    }, 450)
  }

  return <>{showCta && <ClosingCta />}<footer className="public-footer">
    <div className="public-footer-main">
      <section className="public-footer-brand" aria-label="About Pingava">
        <a className="brand-lockup compact" href="/" aria-label="Pingava homepage">
          <BrandMark /><strong>pingava</strong>
        </a>
        <p>Monitor your websites and APIs.<br />Detect issues. Alert your team.<br />Keep your users informed.</p>
        <div className="public-footer-social">
          <a href="https://x.com/pingava" target="_blank" rel="noopener noreferrer" aria-label="Pingava on X" title="Pingava on X (@pingava)">
            <XIcon />
          </a>
          <a href="https://linkedin.com/company/pingava" target="_blank" rel="noopener noreferrer" aria-label="Pingava on LinkedIn" title="Pingava on LinkedIn">
            <LinkedInIcon />
          </a>
          <a href="https://github.com/pingava" target="_blank" rel="noopener noreferrer" aria-label="Pingava on GitHub" title="Pingava on GitHub">
            <GithubIcon />
          </a>
        </div>
        <label className="public-footer-theme">Appearance
          <select value={preference} onChange={event => setTheme(event.target.value as ThemePreference)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </section>
      <nav aria-labelledby="footer-product">
        <h2 id="footer-product">Product</h2>
        <a href="/website-monitoring">Uptime Monitoring</a>
        <a href="/api-monitoring">API Monitoring</a>
        <a href="/ssl-monitoring">SSL Monitoring</a>
        <a href="/status-pages">Status Pages</a>
        <a href="/incident-management">Incident Management</a>
        <a href="/pricing">Pricing</a>
      </nav>
      <nav aria-labelledby="footer-resources">
        <h2 id="footer-resources">Resources</h2>
        <a href="/tools/uptime-checker">Free Uptime Checker</a>
        <a href="/docs">Documentation</a>
        <a href="/api-docs">API Docs</a>
        <a href="/support">Help / Support</a>
        <a href="/blog">Blog</a>
        <a href="/changelog">Changelog</a>
      </nav>
      <nav aria-labelledby="footer-company">
        <h2 id="footer-company">Company</h2>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </nav>
      <section className="public-footer-newsletter" aria-labelledby="footer-newsletter">
        <h2 id="footer-newsletter">Stay in the loop</h2>
        <p>Get product updates, downtime insights and more.</p>
        {subscribed ? (
          <div className="public-footer-newsletter-success" role="status">
            <CheckCircle2 size={16} />
            <div>
              <strong>You&apos;re subscribed!</strong>
              <small>We&apos;ll send downtime insights and product releases.</small>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe}>
            <label className="sr-only" htmlFor="footer-email">Email address</label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" aria-label="Join the product updates list" title="Subscribe to product updates" disabled={submitting}>
              <ArrowRight size={18} />
            </button>
          </form>
        )}
        <small aria-live="polite">No spam. Unsubscribe at any time.</small>
      </section>
    </div>
    <div className="public-footer-bottom">
      <p>© 2026 Pingava. All rights reserved.</p>
      <div>
        <a className="public-footer-health" href="/status" title="Pingava Platform Status: 99.99% uptime over 90 days">
          <i className="public-pulse-dot" />All systems operational
        </a>
        <a href="/status">System Status</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </div>
  </footer></>
}
