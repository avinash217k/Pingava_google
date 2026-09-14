import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  Check,
  Clipboard,
  Download,
  FileText,
  Layers,
  ListOrdered,
  Printer,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  UserCheck,
  X,
  Zap,
} from 'lucide-react'
import { api, userFacingError, type IncidentPostMortem, type UnifiedIncident } from './api'
import './IncidentPostMortemModal.css'

interface IncidentPostMortemModalProps {
  incident: UnifiedIncident
  isOpen: boolean
  onClose: () => void
  onPostMortemUpdated?: (postMortem: IncidentPostMortem) => void
}

type ViewTab = 'executive' | 'customer' | 'timeline' | 'markdown'

export function IncidentPostMortemModal({
  incident,
  isOpen,
  onClose,
  onPostMortemUpdated,
}: IncidentPostMortemModalProps) {
  const [fetchedPostMortem, setFetchedPostMortem] = useState<IncidentPostMortem | null>(null)
  const postMortem = incident.post_mortem || fetchedPostMortem
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ViewTab>('executive')
  const [copiedMd, setCopiedMd] = useState(false)
  const [copiedNotice, setCopiedNotice] = useState(false)

  const generateOrLoadPostMortem = useCallback(
    async (forceRegenerate = false) => {
      setLoading(true)
      setError(null)
      try {
        const endpoint = `/incidents/${incident.id}/post-mortem`
        const method = forceRegenerate ? 'POST' : 'GET'
        const result = await api<IncidentPostMortem>(endpoint, { method })
        setFetchedPostMortem(result)
        if (onPostMortemUpdated) {
          onPostMortemUpdated(result)
        }
      } catch (err) {
        // If GET returns 404/not generated, try POST to generate
        if (!forceRegenerate) {
          try {
            const genResult = await api<IncidentPostMortem>(`/incidents/${incident.id}/post-mortem`, { method: 'POST' })
            setFetchedPostMortem(genResult)
            if (onPostMortemUpdated) onPostMortemUpdated(genResult)
            return
          } catch (innerErr) {
            setError(userFacingError(innerErr, 'Failed to generate automated post-mortem report.'))
          }
        } else {
          setError(userFacingError(err, 'Failed to regenerate post-mortem.'))
        }
      } finally {
        setLoading(false)
      }
    },
    [incident.id, onPostMortemUpdated]
  )

  // Auto-generate or load when modal opens if not already available
  useEffect(() => {
    if (isOpen && !incident.post_mortem && !fetchedPostMortem) {
      const timer = window.setTimeout(() => {
        void generateOrLoadPostMortem(false)
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [isOpen, incident.post_mortem, fetchedPostMortem, generateOrLoadPostMortem])

  if (!isOpen) return null

  const handleCopyMarkdown = async () => {
    if (!postMortem?.markdown_export) return
    try {
      await navigator.clipboard.writeText(postMortem.markdown_export)
      setCopiedMd(true)
      setTimeout(() => setCopiedMd(false), 2200)
    } catch {
      // Fallback
    }
  }

  const handleCopyNotice = async () => {
    if (!postMortem?.public_announcement) return
    try {
      await navigator.clipboard.writeText(postMortem.public_announcement)
      setCopiedNotice(true)
      setTimeout(() => setCopiedNotice(false), 2200)
    } catch {
      // Fallback
    }
  }

  const handleDownloadMarkdown = () => {
    if (!postMortem?.markdown_export) return
    const filename = `${incident.id}-Post-Mortem.md`
    const blob = new Blob([postMortem.markdown_export], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="postmortem-overlay" role="dialog" aria-modal="true" aria-labelledby="postmortem-title">
      <div className="postmortem-modal">
        {/* Header Bar */}
        <div className="postmortem-header">
          <div className="postmortem-header-left">
            <div className="postmortem-icon-wrap">
              <FileText size={18} />
            </div>
            <div>
              <div className="postmortem-breadcrumb">
                <span className="postmortem-tag">SRE Post-Mortem</span>
                <span className="breadcrumb-sep">/</span>
                <span className="postmortem-inc-id">INC-{String(incident.record_id).padStart(6, '0')}</span>
                {postMortem && (
                  <span className={`postmortem-severity-pill ${postMortem.severity.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                    {postMortem.severity}
                  </span>
                )}
                {postMortem && (
                  <span className="postmortem-engine-badge">
                    <Sparkles size={11} />
                    {postMortem.engine === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'SRE Telemetry Engine'}
                  </span>
                )}
              </div>
              <h2 id="postmortem-title" className="postmortem-title">
                {incident.title}
              </h2>
            </div>
          </div>

          <div className="postmortem-header-actions">
            {postMortem && (
              <>
                <button
                  type="button"
                  className="postmortem-btn"
                  onClick={handleCopyMarkdown}
                  title="Copy full post-mortem in GitHub-flavored Markdown"
                >
                  {copiedMd ? <Check size={14} className="icon-success" /> : <Clipboard size={14} />}
                  <span>{copiedMd ? 'Copied Markdown' : 'Copy Markdown'}</span>
                </button>

                <button
                  type="button"
                  className="postmortem-btn"
                  onClick={handleDownloadMarkdown}
                  title="Download .md file for Notion / Confluence / GitHub"
                >
                  <Download size={14} />
                  <span>Download .md</span>
                </button>

                <button
                  type="button"
                  className="postmortem-btn"
                  onClick={handlePrint}
                  title="Print or export as PDF"
                >
                  <Printer size={14} />
                  <span>Print / PDF</span>
                </button>

                <button
                  type="button"
                  className="postmortem-btn secondary"
                  onClick={() => generateOrLoadPostMortem(true)}
                  disabled={loading}
                  title="Regenerate post-mortem analysis"
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''} />
                  <span>{loading ? 'Analyzing...' : 'Regenerate'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              className="postmortem-close-btn"
              onClick={onClose}
              title="Close modal"
              aria-label="Close post-mortem modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="postmortem-body">
          {error && (
            <div className="postmortem-error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
              <button
                type="button"
                className="postmortem-error-retry"
                onClick={() => generateOrLoadPostMortem(true)}
              >
                Retry
              </button>
            </div>
          )}

          {loading && !postMortem && (
            <div className="postmortem-loading-state">
              <div className="postmortem-loading-spinner">
                <Sparkles size={28} className="pulse-sparkle" />
              </div>
              <h3>Synthesizing Executive Incident Post-Mortem...</h3>
              <p>
                Correlating network telemetry, socket handshakes, HTTP response codes, and resolution timelines into a blameless SRE report.
              </p>
            </div>
          )}

          {!loading && !postMortem && !error && (
            <div className="postmortem-empty-state">
              <div className="postmortem-empty-icon">
                <FileText size={32} />
              </div>
              <h3>Automated Post-Mortem Ready to Generate</h3>
              <p>
                Generate an executive-ready blameless post-mortem covering the root-cause 5-Whys, user impact, chronological timeline, and action items.
              </p>
              <button
                type="button"
                className="postmortem-primary-btn"
                onClick={() => generateOrLoadPostMortem(true)}
              >
                <Sparkles size={15} />
                <span>Generate Post-Mortem with Gemini</span>
              </button>
            </div>
          )}

          {postMortem && (
            <>
              {/* Telemetry Metrics Strip */}
              <div className="postmortem-kpi-strip">
                <div className="kpi-card">
                  <span className="kpi-label">
                    <Timer size={12} /> Total Outage Duration
                  </span>
                  <strong className="kpi-value highlight">{postMortem.duration_human}</strong>
                  <span className="kpi-sub">Started to verified recovery</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">
                    <Zap size={12} /> MTTD (Detection)
                  </span>
                  <strong className="kpi-value">{postMortem.mttd_seconds}s</strong>
                  <span className="kpi-sub">Automated synthetic check</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">
                    <ShieldCheck size={12} /> MTTR (Resolution)
                  </span>
                  <strong className="kpi-value">{Math.max(1, Math.round(postMortem.mttr_seconds / 60))}m</strong>
                  <span className="kpi-sub">Mitigation to steady state</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">
                    <ShieldAlert size={12} /> User Impact
                  </span>
                  <strong className="kpi-value">{postMortem.customer_impact.estimated_impacted_percentage}%</strong>
                  <span className="kpi-sub">{postMortem.customer_impact.error_rate_peak}</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">
                    <UserCheck size={12} /> Incident Lead
                  </span>
                  <strong className="kpi-value investigator">{postMortem.lead_investigator}</strong>
                  <span className="kpi-sub">Pingava Sentinel & Ops</span>
                </div>
              </div>

              {/* View Tabs */}
              <div className="postmortem-nav-tabs">
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'executive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('executive')}
                >
                  <Layers size={14} />
                  <span>Executive Briefing</span>
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  <ListOrdered size={14} />
                  <span>Chronological Timeline ({postMortem.timeline.length})</span>
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customer')}
                >
                  <Send size={14} />
                  <span>Public Announcement</span>
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'markdown' ? 'active' : ''}`}
                  onClick={() => setActiveTab('markdown')}
                >
                  <FileText size={14} />
                  <span>Markdown & Raw Export</span>
                </button>
              </div>

              {/* Tab 1: Executive Briefing */}
              {activeTab === 'executive' && (
                <div className="postmortem-tab-content">
                  {/* Executive Summary */}
                  <section className="postmortem-section">
                    <h3 className="section-title">1. Executive Summary</h3>
                    <div className="summary-callout">
                      <p>{postMortem.executive_summary}</p>
                    </div>
                  </section>

                  {/* Customer & Business Impact */}
                  <section className="postmortem-section">
                    <h3 className="section-title">2. Customer & Business Impact</h3>
                    <div className="impact-grid">
                      <div className="impact-box">
                        <span className="impact-box-label">Inbound Traffic Impact</span>
                        <strong className="impact-box-val">{postMortem.customer_impact.estimated_impacted_percentage}%</strong>
                        <p className="impact-box-desc">{postMortem.customer_impact.user_experience}</p>
                      </div>
                      <div className="impact-box">
                        <span className="impact-box-label">Peak Failure Mode</span>
                        <code className="impact-code">{postMortem.customer_impact.error_rate_peak}</code>
                        <p className="impact-box-desc">Captured by synthetic telemetry probes</p>
                      </div>
                      <div className="impact-box">
                        <span className="impact-box-label">Affected Services</span>
                        <div className="affected-chips">
                          {postMortem.affected_services.map((svc) => (
                            <span key={svc} className="affected-chip">
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Root Cause Analysis & 5-Whys */}
                  <section className="postmortem-section">
                    <h3 className="section-title">3. Root Cause Analysis</h3>
                    <div className="root-cause-banner">
                      <div className="rc-primary">
                        <span className="rc-badge">Primary Factor</span>
                        <strong>{postMortem.root_cause.primary_factor}</strong>
                      </div>
                      <div className="rc-trigger">
                        <span className="rc-label">Trigger:</span>
                        <span>{postMortem.root_cause.trigger}</span>
                      </div>
                    </div>

                    <div className="five-whys-container">
                      <h4 className="sub-title">5-Whys Deep Dive</h4>
                      <div className="five-whys-chain">
                        {postMortem.root_cause.five_whys.map((why, idx) => (
                          <div key={idx} className="why-step">
                            <div className="why-marker">
                              <span>W{idx + 1}</span>
                              {idx < postMortem.root_cause.five_whys.length - 1 && <div className="why-connector" />}
                            </div>
                            <div className="why-content">
                              <span className="why-num">Why {idx + 1}?</span>
                              <p className="why-text">{why}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="technical-details-box">
                      <h4 className="sub-title">Technical Deep Dive</h4>
                      <p>{postMortem.root_cause.technical_details}</p>
                    </div>
                  </section>

                  {/* Corrective & Preventative Action Items */}
                  <section className="postmortem-section">
                    <div className="section-header-flex">
                      <h3 className="section-title">4. Corrective & Preventative Action Items</h3>
                      <span className="items-count">{postMortem.action_items.length} items logged</span>
                    </div>

                    <div className="action-items-table-wrapper">
                      <table className="action-items-table">
                        <thead>
                          <tr>
                            <th style={{ width: '85px' }}>ID</th>
                            <th style={{ width: '80px' }}>Priority</th>
                            <th style={{ width: '110px' }}>Category</th>
                            <th>Action Item</th>
                            <th style={{ width: '130px' }}>Owner</th>
                            <th style={{ width: '100px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {postMortem.action_items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <code className="item-id">{item.id}</code>
                              </td>
                              <td>
                                <span className={`priority-tag ${item.priority.toLowerCase()}`}>
                                  {item.priority}
                                </span>
                              </td>
                              <td>
                                <span className="category-tag">{item.category}</span>
                              </td>
                              <td className="item-desc">{item.description}</td>
                              <td>
                                <span className="owner-badge">@{item.owner}</span>
                              </td>
                              <td>
                                <span className={`status-badge ${item.status}`}>
                                  {item.status === 'completed' ? 'Done' : item.status === 'in_progress' ? 'In Progress' : 'Open'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Lessons Learned */}
                  <section className="postmortem-section">
                    <h3 className="section-title">5. Lessons Learned</h3>
                    <div className="lessons-grid">
                      <div className="lesson-col positive">
                        <div className="lesson-col-header">
                          <Check size={14} />
                          <span>What Went Well</span>
                        </div>
                        <ul>
                          {postMortem.lessons_learned.what_went_well.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="lesson-col warning">
                        <div className="lesson-col-header">
                          <AlertTriangle size={14} />
                          <span>What Went Wrong</span>
                        </div>
                        <ul>
                          {postMortem.lessons_learned.what_went_wrong.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="lesson-col lucky">
                        <div className="lesson-col-header">
                          <Sparkles size={14} />
                          <span>Where We Got Lucky</span>
                        </div>
                        <ul>
                          {postMortem.lessons_learned.where_we_got_lucky.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Tab 2: Chronological Timeline */}
              {activeTab === 'timeline' && (
                <div className="postmortem-tab-content">
                  <section className="postmortem-section">
                    <div className="section-header-flex">
                      <div>
                        <h3 className="section-title">Minute-by-Minute Timeline</h3>
                        <p className="section-sub">
                          Chronological audit trail from automated check failure to verified system recovery.
                        </p>
                      </div>
                    </div>

                    <div className="chronological-timeline">
                      {postMortem.timeline.map((step, idx) => (
                        <div key={idx} className="timeline-node">
                          <div className="node-marker">
                            <span className="node-dot" />
                            {idx < postMortem.timeline.length - 1 && <span className="node-line" />}
                          </div>
                          <div className="node-details">
                            <div className="node-header">
                              <span className="node-offset">{step.relative_offset}</span>
                              <span className="node-time">{step.time} UTC</span>
                              <span className="node-actor">by {step.actor}</span>
                            </div>
                            <p className="node-event">{step.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Tab 3: Customer Announcement */}
              {activeTab === 'customer' && (
                <div className="postmortem-tab-content">
                  <section className="postmortem-section">
                    <div className="section-header-flex">
                      <div>
                        <h3 className="section-title">Customer-Facing Public Notice</h3>
                        <p className="section-sub">
                          Blameless, transparent, and reassuring announcement ready for email blasts or status page subscriber updates.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="postmortem-btn"
                        onClick={handleCopyNotice}
                      >
                        {copiedNotice ? <Check size={14} className="icon-success" /> : <Clipboard size={14} />}
                        <span>{copiedNotice ? 'Copied' : 'Copy Notice'}</span>
                      </button>
                    </div>

                    <div className="customer-notice-card">
                      <div className="customer-notice-header">
                        <span className="notice-badge">Public Announcement</span>
                        <span className="notice-target">Audience: All End Users & Enterprise Customers</span>
                      </div>
                      <blockquote className="customer-notice-text">
                        "{postMortem.public_announcement}"
                      </blockquote>
                      <div className="customer-notice-footer">
                        <span>Status: Verified Operational</span>
                        <span>•</span>
                        <span>Incident: INC-{String(incident.record_id).padStart(6, '0')}</span>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Tab 4: Markdown Export */}
              {activeTab === 'markdown' && (
                <div className="postmortem-tab-content">
                  <section className="postmortem-section">
                    <div className="section-header-flex">
                      <div>
                        <h3 className="section-title">Standardized SRE Markdown</h3>
                        <p className="section-sub">
                          Formatted with tables and headers for direct copy-pasting into Notion, Jira, Confluence, or GitHub.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="postmortem-btn"
                          onClick={handleCopyMarkdown}
                        >
                          {copiedMd ? <Check size={14} className="icon-success" /> : <Clipboard size={14} />}
                          <span>{copiedMd ? 'Copied Markdown' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          className="postmortem-btn"
                          onClick={handleDownloadMarkdown}
                        >
                          <Download size={14} />
                          <span>Download .md</span>
                        </button>
                      </div>
                    </div>

                    <div className="markdown-code-preview">
                      <pre>
                        <code>{postMortem.markdown_export}</code>
                      </pre>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
