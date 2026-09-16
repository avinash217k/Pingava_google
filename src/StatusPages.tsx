import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  GripVertical,
  Lightbulb,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Upload,
  X
} from 'lucide-react'
import { api, userFacingError, type Monitor, type StatusPage, type StatusSubscriber, type User } from './api'
import { trackEvent } from './analyticsClient'
import { BrandMark } from './Brand'
import { PageMetadata } from './Seo'
import './StatusPages.css'

// ============================================================================
// Public Facing Status Page (Accessible via /status/:slug)
// ============================================================================
export function PublicStatusPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<StatusPage | null>(null)
  const [error, setError] = useState('')
  const [subEmail, setSubEmail] = useState('')
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [subMessage, setSubMessage] = useState('')

  useEffect(() => {
    api<StatusPage>(`/public/status/${slug}`)
      .then(setPage)
      .catch((reason) => setError(userFacingError(reason, 'This status page is temporarily unavailable. Please try again.')))
  }, [slug])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subEmail || !subEmail.includes('@')) return
    setSubStatus('loading')
    try {
      const res = await api<{ message: string }>(`/public/status/${slug}/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ email: subEmail })
      })
      setSubStatus('success')
      setSubMessage(res.message || 'Subscribed successfully!')
      setSubEmail('')
    } catch (err) {
      setSubStatus('error')
      setSubMessage(userFacingError(err, 'Failed to subscribe. Please try again.'))
    }
  }

  if (error) {
    return (
      <div className="public-status-shell">
        <PageMetadata title="Status page unavailable | Pingava" description="This Pingava status page is unavailable." noIndex />
        <div className="public-status-empty">
          <TriangleAlert size={24} />
          <h1>Status page unavailable</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="loading-screen">
        <PageMetadata title="Service status | Pingava" description="Loading this public Pingava service status page." noIndex />
        <Activity size={28} />
        Loading service status...
      </div>
    )
  }

  const headline =
    page.overall_status === 'down'
      ? 'Some systems are experiencing issues'
      : page.overall_status === 'pending'
      ? 'Service status is being checked'
      : 'All systems operational'

  return (
    <div className="public-status-shell">
      <PageMetadata title={`${page.title} Status | Pingava`} description={page.description} canonicalPath={`/status/${page.slug}`} />
      <main className="public-status">
        <header>
          <div className="public-brand">
            {page.logo_url ? (
              <img src={page.logo_url} alt={`${page.title} logo`} style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            ) : (
              <BrandMark />
            )}
            <h1>{page.title}</h1>
          </div>
          <p>{page.description}</p>
        </header>

        <section className={`public-summary ${page.overall_status}`}>
          <span>{page.overall_status === 'up' ? <CheckCircle2 size={20} /> : <TriangleAlert size={20} />}</span>
          <strong>{headline}</strong>
        </section>

        {page.email_subscriptions_enabled && (
          <section className="public-subscribe-panel" style={{ padding: '16px 20px', borderRadius: 10, background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e4e7ec)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                  <Bell size={15} /> Subscribe to updates
                </strong>
                <small style={{ color: 'var(--muted-foreground, #667085)', display: 'block', marginTop: 2 }}>
                  Get notified by email whenever an incident is reported or resolved.
                </small>
              </div>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, minWidth: 280 }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #d0d5dd', fontSize: 13 }}
                />
                <button
                  type="submit"
                  disabled={subStatus === 'loading'}
                  style={{ padding: '8px 14px', borderRadius: 6, background: '#087a4b', color: '#fff', border: 0, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                >
                  {subStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
            {subMessage && (
              <div style={{ marginTop: 10, fontSize: 12, color: subStatus === 'success' ? '#067647' : '#b42318' }}>
                {subMessage}
              </div>
            )}
          </section>
        )}

        <section className="public-services">
          <h2>Services</h2>
          {page.monitors.map((monitor) => (
            <article key={monitor.id}>
              <div>
                <strong>{monitor.name}</strong>
                <small>{monitor.last_checked_at ? `Updated ${new Date(monitor.last_checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Awaiting first check'}</small>
              </div>
              <span className={`public-state ${monitor.status}`}>
                {monitor.status === 'down' ? 'Outage' : monitor.status === 'pending' ? 'Checking' : 'Operational'}
              </span>
              <b>{monitor.uptime.toFixed(2)}% uptime</b>
            </article>
          ))}
          {!page.monitors.length && <div className="public-empty">No public services yet.</div>}
        </section>

        <section className="public-incidents">
          <h2>Incident updates</h2>
          {page.status_incidents.map((incident) => (
            <article className="public-manual-incident" key={`manual-${incident.id}`}>
              <span className={incident.status === 'resolved' ? 'incident-icon resolved' : 'incident-icon'}>
                {incident.status === 'resolved' ? <Check size={14} /> : <TriangleAlert size={14} />}
              </span>
              <div>
                <strong>{incident.title}</strong>
                {[...incident.updates].reverse().map((update) => (
                  <section key={update.id}>
                    <b>{update.status}</b>
                    <p>{update.message}</p>
                    <small>{new Date(update.created_at).toLocaleString()}</small>
                  </section>
                ))}
              </div>
            </article>
          ))}
          {page.incidents.slice(0, 10).map((incident) => {
            const monitor = page.monitors.find((item) => item.id === incident.monitor_id)
            return (
              <article key={incident.id}>
                <span className={incident.resolved_at ? 'incident-icon resolved' : 'incident-icon'}>
                  {incident.resolved_at ? <Check size={14} /> : <TriangleAlert size={14} />}
                </span>
                <div>
                  <strong>{monitor?.name || 'Service incident'}</strong>
                  <p>{incident.cause}</p>
                  <small>
                    {new Date(incident.started_at).toLocaleString()}
                    {incident.resolved_at ? ` · Resolved ${new Date(incident.resolved_at).toLocaleString()}` : ' · Investigating'}
                  </small>
                </div>
              </article>
            )
          })}
          {!page.status_incidents.length && !page.incidents.length && <div className="public-empty">No incidents reported.</div>}
        </section>

        <footer>
          <BrandMark />
          Powered by <strong>pingava</strong>
        </footer>
      </main>
    </div>
  )
}

// ============================================================================
// Status Page Settings Dashboard View
// ============================================================================
interface StatusPageSettingsProps {
  user: User
  monitors?: Monitor[]
  onRefresh?: () => Promise<void> | void
  onAddMonitor?: () => void
}

type TabKey = 'configuration' | 'subscribers' | 'history' | 'settings'

export function StatusPageSettings({ user, monitors: initialMonitors, onRefresh, onAddMonitor }: StatusPageSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('configuration')
  const [page, setPage] = useState<StatusPage | null>(null)
  const [monitors, setMonitors] = useState<Monitor[]>(initialMonitors || [])
  const [subscribers, setSubscribers] = useState<StatusSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  // Form local state
  const [pageTitle, setPageTitle] = useState('')
  const [pageDescription, setPageDescription] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [emailSubscriptions, setEmailSubscriptions] = useState(true)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFileName, setLogoFileName] = useState<string>('')

  // UI Modals & Popovers
  const [showLearnModal, setShowLearnModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false)
  const [subscriberEmailInput, setSubscriberEmailInput] = useState('')
  const [activeMenuMonitorId, setActiveMenuMonitorId] = useState<number | null>(null)
  const [subscriberSearch, setSubscriberSearch] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // Load status page config and subscribers
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pageData, dashboardData, subsData] = await Promise.all([
        api<StatusPage | null>('/status-page'),
        api<{ monitors: Monitor[] }>('/dashboard'),
        api<StatusSubscriber[]>('/status-subscribers').catch(() => [])
      ])

      if (pageData) {
        setPage(pageData)
        setPageTitle(pageData.title || `${user.name}'s services`)
        setPageDescription(pageData.description || 'Live service availability and incident updates.')
        setPageSlug(pageData.slug || `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-status`)
        setIsPublished(pageData.published !== undefined ? pageData.published : true)
        setEmailSubscriptions(pageData.email_subscriptions_enabled !== undefined ? pageData.email_subscriptions_enabled : true)
        setLogoUrl(pageData.logo_url || null)
      } else {
        const fallbackSlug = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-status`
        setPageTitle(`${user.name}'s services`)
        setPageDescription('Live service availability and incident updates.')
        setPageSlug(fallbackSlug)
        setIsPublished(true)
        setEmailSubscriptions(true)
      }

      if (dashboardData?.monitors) {
        setMonitors(dashboardData.monitors)
      }
      setSubscribers(subsData || [])
    } catch (err) {
      setError(userFacingError(err, 'Failed to load status page settings. Please refresh.'))
    } finally {
      setLoading(false)
    }
  }, [user.name])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Close active dropdown menu when clicking elsewhere
  useEffect(() => {
    const handleWindowClick = () => setActiveMenuMonitorId(null)
    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [])

  // Ordered list of monitors
  const orderedMonitors = useMemo(() => {
    return [...monitors].sort(
      (a, b) => (a.status_page_order || 0) - (b.status_page_order || 0) || a.created_at.localeCompare(b.created_at)
    )
  }, [monitors])

  // Visible monitors for live preview
  const visibleMonitors = useMemo(() => {
    return orderedMonitors.filter((m) => m.show_on_status_page && m.status !== 'paused')
  }, [orderedMonitors])

  // Save changes to backend
  const handleSave = async (customOverrides?: Partial<{ published: boolean; email_subscriptions_enabled: boolean }>) => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: pageTitle.trim() || `${user.name}'s services`,
        description: pageDescription.trim(),
        slug: pageSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'status',
        published: customOverrides?.published !== undefined ? customOverrides.published : isPublished,
        email_subscriptions_enabled:
          customOverrides?.email_subscriptions_enabled !== undefined
            ? customOverrides.email_subscriptions_enabled
            : emailSubscriptions,
        logo_url: logoUrl
      }

      const updated = await api<StatusPage>('/status-page', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      setPage(updated)
      if (customOverrides?.published !== undefined) setIsPublished(customOverrides.published)
      if (customOverrides?.email_subscriptions_enabled !== undefined) setEmailSubscriptions(customOverrides.email_subscriptions_enabled)
      showToast('Status page saved successfully')
      trackEvent('status_page_updated', { slug: updated.slug, published: updated.published })
    } catch (err) {
      setError(userFacingError(err, 'Could not save status page settings. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  // Update a monitor's visibility or public name
  const handleUpdateMonitor = async (monitor: Monitor, changes: Partial<Monitor>) => {
    setError('')
    // Optimistic UI update
    setMonitors((prev) => prev.map((m) => (m.id === monitor.id ? { ...m, ...changes } : m)))

    try {
      await api(`/monitors/${monitor.id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes)
      })
      if (onRefresh) void onRefresh()
    } catch (err) {
      setError(userFacingError(err, 'Failed to update monitor public settings.'))
      void loadData()
    }
  }

  // Move monitor order up or down
  const handleMoveOrder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= orderedMonitors.length) return

    const reordered = [...orderedMonitors]
    const item = reordered[index]
    const swapItem = reordered[targetIndex]
    reordered[index] = swapItem
    reordered[targetIndex] = item

    const updatedWithOrder = reordered.map((m, idx) => ({
      ...m,
      status_page_order: idx
    }))

    setMonitors(updatedWithOrder)

    try {
      await Promise.all(
        updatedWithOrder.map((m) =>
          api(`/monitors/${m.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status_page_order: m.status_page_order })
          })
        )
      )
      if (onRefresh) void onRefresh()
    } catch (err) {
      setError(userFacingError(err, 'Failed to reorder services.'))
      void loadData()
    }
  }

  // Logo file upload (reads data URL locally)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, SVG, or WEBP).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2 MB.')
      return
    }

    setLogoFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setLogoUrl(dataUrl)
      showToast('Logo uploaded. Click "Save changes" to apply.')
    }
    reader.readAsDataURL(file)
  }

  const handleCopyUrl = (text: string) => {
    void navigator.clipboard.writeText(text)
    showToast('Copied status page link to clipboard')
  }

  const fullPublicUrl = `${window.location.origin}/status/${pageSlug || page?.slug || 'status'}`

  // Add subscriber handler
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscriberEmailInput || !subscriberEmailInput.includes('@')) return
    try {
      const newSub = await api<StatusSubscriber>('/status-subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: subscriberEmailInput.trim() })
      })
      setSubscribers((prev) => [newSub, ...prev.filter((s) => s.email !== newSub.email)])
      setSubscriberEmailInput('')
      setShowAddSubscriberModal(false)
      showToast(`Subscriber ${newSub.email} added`)
    } catch (err) {
      setError(userFacingError(err, 'Could not add subscriber.'))
    }
  }

  // Delete subscriber
  const handleDeleteSubscriber = async (id: number) => {
    try {
      await api(`/status-subscribers/${id}`, { method: 'DELETE' })
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
      showToast('Subscriber removed')
    } catch (err) {
      setError(userFacingError(err, 'Could not remove subscriber.'))
    }
  }

  // Filtered subscribers list
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  )

  return (
    <div className="status-page-container">
      {/* PAGE HEADER */}
      <header className="status-page-header">
        <div className="status-header-text">
          <span className="status-eyebrow">STATUS PAGE</span>
          <h1 className="status-page-title">Keep your customers informed</h1>
          <p className="status-page-description">
            Publish a public page showing the current health of your services and real-time incident updates.
          </p>
        </div>
        <button
          className="status-header-action-btn"
          onClick={() => setShowLearnModal(true)}
          title="Learn how status pages increase customer trust"
        >
          <BookOpen size={15} />
          <span>Learn more about status pages →</span>
        </button>
      </header>

      {/* TABS NAVIGATION */}
      <nav className="status-tabs" aria-label="Status page navigation">
        <button
          className={`status-tab-btn ${activeTab === 'configuration' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuration')}
        >
          Configuration
        </button>
        <button
          className={`status-tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscribers')}
        >
          Subscribers
          <span className="status-tab-count">{subscribers.length}</span>
        </button>
        <button
          className={`status-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Incident history
          <span className="status-tab-count">{page?.incidents?.length || 0}</span>
        </button>
        <button
          className={`status-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      {/* ERROR BANNER */}
      {error && (
        <div className="page-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TriangleAlert size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* ======================================================================
          TAB 1: CONFIGURATION (2-COLUMN LAYOUT)
         ====================================================================== */}
      {activeTab === 'configuration' && (
        <div className="status-config-layout">
          {/* LEFT COLUMN: Controls & Management */}
          <div className="status-config-main">
            {/* 1. STATUS CARD (PUBLISHED / UNPUBLISHED) */}
            <div className="status-card status-overview-card">
              <div className="status-state-row">
                <div className="status-badge-wrap">
                  <span className={`status-indicator-dot ${isPublished ? 'published' : 'unpublished'}`} />
                  <div className="status-badge-text">
                    <span className="status-badge-title">
                      {isPublished ? 'Status page is published' : 'Status page is unlisted'}
                    </span>
                    <span className="status-badge-sub">
                      {isPublished
                        ? 'Customers and visitors can view live uptime at your public URL.'
                        : 'Your status page is currently private and invisible to visitors.'}
                    </span>
                  </div>
                </div>

                <div className="status-url-pill">
                  <Globe2 size={13} style={{ color: 'var(--primary, #087a4b)', flexShrink: 0 }} />
                  <span>{fullPublicUrl}</span>
                  <button
                    className="status-copy-btn"
                    title="Copy status page link"
                    onClick={() => handleCopyUrl(fullPublicUrl)}
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="status-actions-row">
                {isPublished ? (
                  <>
                    <a
                      href={`/status/${pageSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="status-view-btn"
                      title="Open public status page in a new window"
                    >
                      <ExternalLink size={14} />
                      View status page
                    </a>
                    <button
                      type="button"
                      className="status-unpublish-btn"
                      onClick={() => void handleSave({ published: false })}
                      disabled={saving}
                      title="Make this status page private"
                    >
                      <EyeOff size={14} />
                      Unpublish
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="status-publish-btn"
                    onClick={() => void handleSave({ published: true })}
                    disabled={saving}
                  >
                    <Globe2 size={14} />
                    Publish status page
                  </button>
                )}
              </div>
            </div>

            {/* 2. GENERAL INFORMATION CARD */}
            <div className="status-card">
              <div className="status-card-header">
                <div>
                  <h2 className="status-card-title">General information</h2>
                  <p className="status-card-subtitle">Basic details displayed on your status page</p>
                </div>
              </div>

              <div className="status-form-group">
                <label className="status-form-label" htmlFor="page-name-input">
                  Page name
                </label>
                <input
                  id="page-name-input"
                  className="status-form-input"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="e.g. Acme Cloud Status"
                  maxLength={100}
                  required
                />
              </div>

              <div className="status-form-group">
                <label className="status-form-label" htmlFor="page-desc-input">
                  Description
                </label>
                <textarea
                  id="page-desc-input"
                  className="status-form-textarea"
                  rows={2}
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  placeholder="Live service availability and incident updates."
                  maxLength={240}
                />
              </div>

              <div className="status-form-2col">
                <div className="status-form-group">
                  <label className="status-form-label" htmlFor="page-slug-input">
                    Public URL
                  </label>
                  <div className="slug-input-wrapper">
                    <span className="slug-prefix">{window.location.origin}/status/</span>
                    <input
                      id="page-slug-input"
                      value={pageSlug}
                      onChange={(e) =>
                        setPageSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '')
                            .replace(/^-+/, '')
                        )
                      }
                      placeholder="acme-status"
                      maxLength={60}
                    />
                    <button
                      type="button"
                      className="slug-copy-btn"
                      title="Copy public URL"
                      onClick={() => handleCopyUrl(fullPublicUrl)}
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <span className="status-form-help">Lowercase letters, numbers, and hyphens.</span>
                </div>

                <div className="status-form-group">
                  <label className="status-form-label">Logo (optional)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    style={{ display: 'none' }}
                  />

                  {logoUrl ? (
                    <div className="logo-preview-box">
                      <img src={logoUrl} alt="Status page logo" className="logo-preview-img" />
                      <div className="logo-preview-info">
                        <span className="logo-preview-name">{logoFileName || 'Custom logo'}</span>
                        <span className="status-form-help">Will appear in header</span>
                      </div>
                      <button
                        type="button"
                        className="logo-remove-btn"
                        title="Remove logo"
                        onClick={() => {
                          setLogoUrl(null)
                          setLogoFileName('')
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="logo-upload-box"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (e.dataTransfer.files?.[0]) {
                          const file = e.dataTransfer.files[0]
                          const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
                          handleLogoUpload(fakeEvent)
                        }
                      }}
                    >
                      <div className="logo-icon-wrap">
                        <Upload size={16} />
                      </div>
                      <span className="logo-upload-title">Click to upload or drag & drop</span>
                      <span className="logo-upload-hint">SVG, PNG, or JPG (max 2 MB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. PUBLIC SERVICES CARD */}
            <div className="status-card">
              <div className="status-card-header">
                <div>
                  <h2 className="status-card-title">Public services</h2>
                  <p className="status-card-subtitle">
                    Select which monitors are visible to customers and customize their display name.
                  </p>
                </div>
                <div className="services-card-header-actions">
                  <button
                    type="button"
                    className="add-service-btn"
                    onClick={() => setShowAddServiceModal(true)}
                  >
                    <Plus size={14} />
                    Add service
                  </button>
                </div>
              </div>

              <div className="services-table-wrapper">
                <table className="services-table">
                  <thead>
                    <tr>
                      <th className="services-col-num">#</th>
                      <th className="services-col-grip"></th>
                      <th className="services-col-internal">Internal monitor</th>
                      <th className="services-col-public">Public display name</th>
                      <th className="services-col-visible">Visible</th>
                      <th className="services-col-actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedMonitors.map((monitor, index) => {
                      const isMenuOpen = activeMenuMonitorId === monitor.id
                      return (
                        <tr key={monitor.id}>
                          <td className="services-col-num">{index + 1}</td>
                          <td className="services-col-grip">
                            <span
                              className="drag-grip-handle"
                              title="Drag or use menu to reorder"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical size={14} />
                            </span>
                          </td>
                          <td className="services-col-internal">
                            <span style={{ fontWeight: 600 }}>{monitor.name}</span>
                            <small
                              style={{
                                display: 'block',
                                color: 'var(--muted-foreground, #667085)',
                                fontSize: '10px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '180px'
                              }}
                            >
                              {monitor.url}
                            </small>
                          </td>
                          <td className="services-col-public">
                            <input
                              className="public-name-input"
                              defaultValue={monitor.public_name || monitor.name}
                              placeholder="Customer-friendly name"
                              maxLength={80}
                              onBlur={(e) => {
                                const val = e.target.value.trim()
                                if (val !== (monitor.public_name || monitor.name)) {
                                  void handleUpdateMonitor(monitor, { public_name: val || monitor.name })
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur()
                                }
                              }}
                            />
                          </td>
                          <td className="services-col-visible">
                            <label className="switch-toggle" title={monitor.show_on_status_page ? 'Visible on status page' : 'Hidden from status page'}>
                              <input
                                type="checkbox"
                                checked={Boolean(monitor.show_on_status_page)}
                                onChange={(e) =>
                                  void handleUpdateMonitor(monitor, { show_on_status_page: e.target.checked })
                                }
                              />
                              <span className="switch-slider"></span>
                            </label>
                          </td>
                          <td className="services-col-actions">
                            <div className="action-menu-wrap" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="action-dots-btn"
                                title="Service options"
                                onClick={() => setActiveMenuMonitorId(isMenuOpen ? null : monitor.id)}
                              >
                                <MoreVertical size={15} />
                              </button>

                              {isMenuOpen && (
                                <div className="action-popover-menu">
                                  <button
                                    type="button"
                                    className="action-popover-item"
                                    disabled={index === 0}
                                    onClick={() => {
                                      setActiveMenuMonitorId(null)
                                      void handleMoveOrder(index, -1)
                                    }}
                                  >
                                    <ArrowUp size={13} /> Move up
                                  </button>
                                  <button
                                    type="button"
                                    className="action-popover-item"
                                    disabled={index === orderedMonitors.length - 1}
                                    onClick={() => {
                                      setActiveMenuMonitorId(null)
                                      void handleMoveOrder(index, 1)
                                    }}
                                  >
                                    <ArrowDown size={13} /> Move down
                                  </button>
                                  <button
                                    type="button"
                                    className="action-popover-item"
                                    onClick={() => {
                                      setActiveMenuMonitorId(null)
                                      void handleUpdateMonitor(monitor, {
                                        show_on_status_page: !monitor.show_on_status_page
                                      })
                                    }}
                                  >
                                    {monitor.show_on_status_page ? (
                                      <>
                                        <EyeOff size={13} /> Hide from page
                                      </>
                                    ) : (
                                      <>
                                        <Eye size={13} /> Show on page
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                    {!orderedMonitors.length && !loading && (
                      <tr>
                        <td colSpan={6} style={{ padding: '28px 16px', textAlign: 'center', color: '#667085' }}>
                          <Activity size={20} style={{ margin: '0 auto 6px', display: 'block', color: '#98a2b3' }} />
                          <strong>No monitors configured yet</strong>
                          <p style={{ margin: '4px 0 0', fontSize: 11 }}>
                            Create your first monitor to display service health on your status page.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. CUSTOMER NOTIFICATIONS CARD */}
            <div className="status-card">
              <div className="status-card-header">
                <div>
                  <h2 className="status-card-title">Customer notifications</h2>
                  <p className="status-card-subtitle">Allow customers to subscribe to incident updates</p>
                </div>
              </div>

              <div className="notification-setting-row">
                <div className="notification-setting-text">
                  <span className="notification-setting-title">Enable email subscriptions</span>
                  <span className="notification-setting-desc">
                    Visitors can enter their email on the status page to receive updates whenever incidents are created or resolved.
                  </span>
                </div>
                <label className="switch-toggle" title="Toggle email subscriptions">
                  <input
                    type="checkbox"
                    checked={emailSubscriptions}
                    onChange={(e) => setEmailSubscriptions(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>

            {/* BOTTOM SAVE BAR */}
            <div className="status-bottom-bar">
              <button
                type="button"
                className="status-save-btn"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save changes
                  </>
                )}
              </button>
              <button
                type="button"
                className="status-preview-action-btn"
                onClick={() => {
                  previewRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Eye size={15} />
                Preview status page
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY LIVE PREVIEW & TIPS */}
          <div className="status-config-side" ref={previewRef}>
            {/* LIVE PREVIEW CARD */}
            <div className="live-preview-card">
              <div className="live-preview-header">
                <div>
                  <h3 className="status-card-title" style={{ fontSize: 14 }}>
                    Live preview
                  </h3>
                  <p className="status-card-subtitle">Real-time view of what visitors see</p>
                </div>
                <a
                  href={`/status/${pageSlug || 'status'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="live-preview-open-link"
                >
                  <ExternalLink size={12} />
                  Open page
                </a>
              </div>

              {/* BROWSER / STATUS PAGE CHROME */}
              <div className="preview-browser-frame">
                {/* PREVIEW TOPBAR */}
                <div className="preview-topbar">
                  <div className="preview-brand-mark">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        style={{ height: 18, width: 'auto', objectFit: 'contain' }}
                      />
                    ) : (
                      <span className="preview-brand-ring" />
                    )}
                    <span>{pageTitle || "Avinash's services"}</span>
                  </div>

                  {emailSubscriptions && (
                    <span className="preview-subscribe-btn">
                      <Bell size={10} />
                      Subscribe
                    </span>
                  )}
                </div>

                {/* PREVIEW BODY */}
                <div className="preview-body-content">
                  <div className="preview-page-info">
                    <h4 className="preview-heading-title">{pageTitle || "Avinash's services"}</h4>
                    <p className="preview-heading-desc">
                      {pageDescription || 'Live service availability and incident updates.'}
                    </p>
                  </div>

                  {/* OVERALL HEALTH BANNER */}
                  <div
                    className={`preview-health-banner ${
                      visibleMonitors.some((m) => m.status === 'down')
                        ? 'outage'
                        : 'operational'
                    }`}
                  >
                    <div className="preview-banner-top">
                      <div className="preview-banner-status">
                        {visibleMonitors.some((m) => m.status === 'down') ? (
                          <>
                            <TriangleAlert size={14} />
                            <span>Some systems degraded</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>All systems operational</span>
                          </>
                        )}
                      </div>
                      <span className="preview-banner-time">Refreshes live</span>
                    </div>
                    <span className="preview-banner-sub">
                      {visibleMonitors.some((m) => m.status === 'down')
                        ? 'We are actively monitoring and resolving detected issues.'
                        : 'All monitored public systems are performing normally.'}
                    </span>
                  </div>

                  {/* SERVICES LIST */}
                  <div className="preview-services-panel">
                    {visibleMonitors.length > 0 ? (
                      visibleMonitors.map((m) => (
                        <div className="preview-service-row" key={m.id}>
                          <span className="preview-service-name">
                            <span
                              className={`service-dot ${
                                m.status === 'down' ? 'outage' : 'operational'
                              }`}
                            />
                            {m.public_name || m.name}
                          </span>
                          <span
                            className={`preview-service-state ${
                              m.status === 'down' ? 'outage' : 'operational'
                            }`}
                          >
                            {m.status === 'down' ? 'Degraded' : 'Operational'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontSize: 11,
                          color: '#98a2b3'
                        }}
                      >
                        No services are currently toggled visible.
                      </div>
                    )}
                  </div>

                  {/* RECENT INCIDENTS PANEL */}
                  <div className="preview-incidents-panel">
                    <div className="preview-section-header">
                      <span>Incident updates</span>
                      <span className="preview-section-link">Past 90 days</span>
                    </div>

                    {page?.incidents && page.incidents.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {page.incidents.slice(0, 2).map((inc) => (
                          <div
                            key={inc.id}
                            style={{
                              fontSize: 10,
                              padding: '6px 8px',
                              borderRadius: 5,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <strong style={{ display: 'block', color: '#1e293b' }}>{inc.cause}</strong>
                            <span style={{ color: '#64748b' }}>
                              {new Date(inc.started_at).toLocaleDateString()} · {inc.resolved_at ? 'Resolved' : 'Active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="preview-empty-incidents">
                        <CheckCircle2 size={16} style={{ color: '#12b76a' }} />
                        <strong>No incidents reported</strong>
                        <span>All systems running smoothly</span>
                      </div>
                    )}
                  </div>

                  {/* SUBSCRIBE MINI CARD (IF SUBSCRIPTION ENABLED) */}
                  {emailSubscriptions && (
                    <div className="preview-subscribe-card">
                      <div className="preview-sub-title">
                        <Mail size={12} style={{ color: 'var(--primary, #087a4b)' }} />
                        <span>Get incident notifications</span>
                      </div>
                      <p className="preview-sub-desc">Subscribe to receive email alerts on status changes.</p>
                      <div className="preview-sub-input-row">
                        <input type="text" placeholder="your.name@company.com" readOnly />
                        <button type="button">Subscribe</button>
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="preview-footer-credits">
                    <BrandMark />
                    <span>Powered by Pingava</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TIP CARD */}
            <div className="status-tip-card">
              <div className="status-tip-icon">
                <Lightbulb size={18} />
              </div>
              <div className="status-tip-content">
                <span className="status-tip-title">Pro-tip for status pages</span>
                <span className="status-tip-text">
                  Status pages build customer trust during outages. Choose clear, customer-friendly service names rather
                  than internal API endpoints or URLs.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 2: SUBSCRIBERS
         ====================================================================== */}
      {activeTab === 'subscribers' && (
        <div className="subscribers-panel">
          {/* METRIC CHIPS */}
          <div className="subscribers-metrics">
            <div className="sub-metric-card">
              <span className="sub-metric-label">Total subscribers</span>
              <strong className="sub-metric-value">{subscribers.length}</strong>
            </div>
            <div className="sub-metric-card">
              <span className="sub-metric-label">Confirmed active</span>
              <strong className="sub-metric-value">
                {subscribers.filter((s) => s.confirmed && s.active).length}
              </strong>
            </div>
            <div className="sub-metric-card">
              <span className="sub-metric-label">Notification channel</span>
              <strong className="sub-metric-value" style={{ fontSize: 16 }}>
                Direct Email (SMTP)
              </strong>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-header">
              <div>
                <h2 className="status-card-title">Status page subscribers</h2>
                <p className="status-card-subtitle">
                  Users who signed up to receive incident and recovery notices via your public page.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#98a2b3' }} />
                  <input
                    placeholder="Search by email..."
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    style={{
                      height: 34,
                      paddingLeft: 30,
                      paddingRight: 12,
                      borderRadius: 6,
                      border: '1px solid #d0d5dd',
                      fontSize: 12
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="add-service-btn"
                  onClick={() => setShowAddSubscriberModal(true)}
                >
                  <Plus size={14} />
                  Add subscriber
                </button>
              </div>
            </div>

            <div className="services-table-wrapper">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Email address</th>
                    <th>Status</th>
                    <th>Subscribed date</th>
                    <th>Last notification</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600 }}>{sub.email}</td>
                      <td>
                        <span
                          className={`status-pill ${sub.active ? 'up' : 'paused'}`}
                          style={{ padding: '2px 8px', fontSize: 11 }}
                        >
                          {sub.active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td style={{ color: '#667085' }}>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ color: '#667085' }}>
                        {sub.last_notified_at
                          ? new Date(sub.last_notified_at).toLocaleDateString()
                          : 'None yet'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="action-dots-btn"
                          title="Remove subscriber"
                          onClick={() => void handleDeleteSubscriber(sub.id)}
                        >
                          <Trash2 size={14} style={{ color: '#d92d20' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredSubscribers.length && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px 16px', color: '#667085' }}>
                        <Mail size={22} style={{ margin: '0 auto 6px', display: 'block', color: '#98a2b3' }} />
                        <strong>No subscribers found</strong>
                        <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                          Subscribers who sign up on your public status page will automatically appear here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 3: INCIDENT HISTORY
         ====================================================================== */}
      {activeTab === 'history' && (
        <div className="incidents-history-panel">
          <div className="status-card">
            <div className="status-card-header">
              <div>
                <h2 className="status-card-title">Public incident history</h2>
                <p className="status-card-subtitle">
                  Incidents automatically shown on your public page to maintain transparency with customers.
                </p>
              </div>
            </div>

            <div className="incident-history-list">
              {page?.incidents && page.incidents.length > 0 ? (
                page.incidents.map((inc) => {
                  const monitor = monitors.find((m) => m.id === inc.monitor_id)
                  return (
                    <div className="incident-history-item" key={inc.id}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            className={`status-pill ${inc.resolved_at ? 'up' : 'down'}`}
                            style={{ padding: '2px 8px', fontSize: 11 }}
                          >
                            {inc.resolved_at ? 'Resolved' : 'Active issue'}
                          </span>
                          <strong style={{ fontSize: 13, color: 'var(--foreground, #182230)' }}>
                            {monitor?.public_name || monitor?.name || 'Monitored Service'}
                          </strong>
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--foreground, #344054)' }}>
                          {inc.cause}
                        </p>
                        <small style={{ color: 'var(--muted-foreground, #667085)', fontSize: 11 }}>
                          Started {new Date(inc.started_at).toLocaleString()}
                          {inc.resolved_at && ` · Resolved ${new Date(inc.resolved_at).toLocaleString()}`}
                        </small>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: inc.resolved_at ? '#067647' : '#b42318',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {inc.resolved_at ? 'Complete' : 'Investigating'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: '#667085' }}>
                  <CheckCircle2 size={24} style={{ color: '#12b76a', margin: '0 auto 8px', display: 'block' }} />
                  <strong>No historical outages recorded</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                    Your services have maintained 100% clean uptime during this cycle.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 4: SETTINGS
         ====================================================================== */}
      {activeTab === 'settings' && (
        <div className="settings-tab-panel">
          <div className="status-card">
            <div className="status-card-header">
              <div>
                <h2 className="status-card-title">Status page visibility & routing</h2>
                <p className="status-card-subtitle">
                  Configure privacy controls and web address for your public page.
                </p>
              </div>
            </div>

            <div className="notification-setting-row" style={{ borderBottom: '1px solid var(--border, #e4e7ec)', paddingBottom: 16 }}>
              <div className="notification-setting-text">
                <span className="notification-setting-title">Published to web</span>
                <span className="notification-setting-desc">
                  When enabled, any customer can navigate to your public URL without requiring login credentials.
                </span>
              </div>
              <label className="switch-toggle">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="status-form-group" style={{ marginTop: 16 }}>
              <label className="status-form-label">Status page slug</label>
              <div className="slug-input-wrapper">
                <span className="slug-prefix">{window.location.origin}/status/</span>
                <input
                  value={pageSlug}
                  onChange={(e) =>
                    setPageSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '')
                        .replace(/^-+/, '')
                    )
                  }
                  placeholder="custom-slug"
                />
              </div>
              <span className="status-form-help">
                Direct URL where customers bookmark and check your service status.
              </span>
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                className="status-save-btn"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: LEARN MORE ABOUT STATUS PAGES
         ====================================================================== */}
      {showLearnModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowLearnModal(false)}>
          <div
            className="modal"
            style={{ maxWidth: 520 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-icon">
                <Globe2 size={19} />
              </div>
              <div>
                <h2>Status pages guide</h2>
                <p>How Pingava status pages help you communicate during incidents</p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowLearnModal(false)}
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="learn-modal-list">
              <div className="learn-modal-item">
                <div className="learn-item-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="learn-item-text">
                  <strong>Build proactive customer trust</strong>
                  <p>
                    Giving customers a single source of truth reduces repetitive support tickets and proves your
                    commitment to reliability.
                  </p>
                </div>
              </div>

              <div className="learn-modal-item">
                <div className="learn-item-icon">
                  <Mail size={16} />
                </div>
                <div className="learn-item-text">
                  <strong>Instant subscriber notifications</strong>
                  <p>
                    When enabled, users subscribe directly with their email to receive immediate dispatch when outages
                    are detected and resolved.
                  </p>
                </div>
              </div>

              <div className="learn-modal-item">
                <div className="learn-item-icon">
                  <Eye size={16} />
                </div>
                <div className="learn-item-text">
                  <strong>Selective service exposure</strong>
                  <p>
                    Keep sensitive internal backend jobs or admin databases private while showcasing customer-facing
                    web applications and APIs.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => setShowLearnModal(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: ADD SERVICE TO STATUS PAGE
         ====================================================================== */}
      {showAddServiceModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowAddServiceModal(false)}>
          <div
            className="modal"
            style={{ maxWidth: 540 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-icon">
                <Plus size={19} />
              </div>
              <div>
                <h2>Add services to status page</h2>
                <p>Toggle visibility on existing monitors or create a new monitor</p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowAddServiceModal(false)}
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto', margin: '14px 0', border: '1px solid var(--border, #e4e7ec)', borderRadius: 8 }}>
              {orderedMonitors.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border, #f0f1f3)'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, display: 'block', color: 'var(--foreground, #182230)' }}>
                      {m.name}
                    </strong>
                    <small style={{ color: 'var(--muted-foreground, #667085)', fontSize: 11 }}>{m.url}</small>
                  </div>
                  <label className="switch-toggle" title="Toggle visibility">
                    <input
                      type="checkbox"
                      checked={Boolean(m.show_on_status_page)}
                      onChange={(e) => void handleUpdateMonitor(m, { show_on_status_page: e.target.checked })}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              {onAddMonitor && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowAddServiceModal(false)
                    onAddMonitor()
                  }}
                >
                  <Plus size={15} />
                  Create new monitor
                </button>
              )}
              <button
                type="button"
                className="primary-btn"
                onClick={() => setShowAddServiceModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: ADD SUBSCRIBER
         ====================================================================== */}
      {showAddSubscriberModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowAddSubscriberModal(false)}>
          <div
            className="modal"
            style={{ maxWidth: 440 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-icon">
                <Mail size={19} />
              </div>
              <div>
                <h2>Add subscriber</h2>
                <p>Register an email to receive automatic incident notices</p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowAddSubscriberModal(false)}
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber}>
              <label>
                Subscriber email address
                <input
                  type="email"
                  required
                  placeholder="lead-engineer@client.com"
                  value={subscriberEmailInput}
                  onChange={(e) => setSubscriberEmailInput(e.target.value)}
                  autoFocus
                />
              </label>

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddSubscriberModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Add subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST POPUP */}
      {toast && (
        <div className="status-toast-wrap">
          <CheckCircle2 size={16} style={{ color: '#12b76a' }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
