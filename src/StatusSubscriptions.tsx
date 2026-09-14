import { useEffect, useState } from 'react'
import { Activity, Bell, CheckCircle2, Mail, RefreshCw, TriangleAlert } from 'lucide-react'
import { api, userFacingError } from './api'

export function StatusSubscribe({ slug }: { slug: string }) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSubmitting(true); setMessage('')
    try {
      const result = await api<{ message: string }>(`/public/status/${slug}/subscribe`, { method: 'POST', body: JSON.stringify({ email: form.get('email') }) })
      setMessage(result.message); formElement.reset()
    } catch (reason) { setMessage(userFacingError(reason, 'Subscription could not be completed. Please try again.')) }
    finally { setSubmitting(false) }
  }
  return <aside className="status-subscribe"><div><Mail size={18} /><span><strong>Get incident updates</strong><small>Receive service updates by email.</small></span></div><form onSubmit={submit}><input name="email" type="email" required placeholder="you@example.com" disabled={submitting} /><button className="primary-btn" disabled={submitting}>{submitting ? <Activity className="spin" size={15} /> : null}{submitting ? 'Subscribing...' : 'Subscribe'}</button></form>{message && <p role="status">{message}</p>}</aside>
}

export function SubscriptionAction({ action, token }: { action: 'confirm' | 'unsubscribe'; token: string }) {
  const [message, setMessage] = useState('Working...')
  const [ok, setOk] = useState(false)
  useEffect(() => { api<{ message: string }>(`/public/subscriptions/${action}?token=${encodeURIComponent(token)}`).then((result) => { setMessage(result.message); setOk(true) }).catch((reason) => setMessage(userFacingError(reason, 'This link is invalid or has expired.'))) }, [action, token])
  return <div className="public-status-shell"><div className="public-status-empty">{ok ? <CheckCircle2 size={28} /> : <TriangleAlert size={28} />}<h1>{action === 'confirm' ? 'Email subscription' : 'Unsubscribe'}</h1><p>{message}</p><a className="primary-btn" href="/">Return to Pingava</a></div></div>
}

type Subscriber = { id: number; email: string; confirmed: boolean; active: boolean; created_at: string }
export function SubscriberAdmin() {
  const [items, setItems] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = () => { api<Subscriber[]>('/status-subscribers').then((result) => { setItems(result); setError('') }).catch((reason) => setError(userFacingError(reason, "We couldn't load status subscribers."))).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])
  return <section className="monitors-section subscriber-admin"><div className="section-title"><div><h2>Status subscribers</h2><p>{loading ? 'Loading subscribers...' : `${items.filter((item) => item.active).length} active subscribers`}</p></div><Bell size={18} /></div><div className="subscriber-list">{items.map((item) => <article key={item.id}><div><strong>{item.email}</strong><small>Joined {new Date(item.created_at).toLocaleDateString()}</small></div><span className={`status-pill ${item.active ? 'up' : 'paused'}`}>{item.active ? 'Active' : item.confirmed ? 'Unsubscribed' : 'Pending'}</span></article>)}{loading && !items.length && <div className="empty-state compact"><Activity className="spin" size={22} /><strong>Loading subscribers</strong></div>}{error && !items.length && <div className="empty-state compact"><TriangleAlert size={22} /><strong>Unable to load subscribers</strong><span>{error}</span><button className="secondary-btn" onClick={load}><RefreshCw size={14} />Try again</button></div>}{!loading && !error && !items.length && <div className="empty-state compact"><Mail size={22} /><strong>No subscribers yet</strong><span>Subscribers to your public status page will appear here.</span></div>}</div></section>
}
