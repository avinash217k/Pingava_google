import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, CreditCard, ExternalLink, LogOut, Settings } from 'lucide-react'
import type { User } from './api'
import type { SettingsTab } from './AccountSettings'
import { UserAvatar } from './UserAvatar'
import { publicHref } from './appConfig'

export function AccountMenu({ user, onSettings, onLogout }: { user: User; onSettings: (tab: SettingsTab) => void; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const firstItem = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    firstItem.current?.focus()
    const closeOutside = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); root.current?.querySelector<HTMLButtonElement>('.account')?.focus() } }
    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('mousedown', closeOutside); document.removeEventListener('keydown', closeOnEscape) }
  }, [open])
  const moveFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
    if (!items.length) return
    event.preventDefault()
    const current = items.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowDown' ? (current + 1) % items.length : (current - 1 + items.length) % items.length
    items[next].focus()
  }
  const navigate = (tab: SettingsTab) => { setOpen(false); onSettings(tab) }
  return <div className="account-menu-wrap" ref={root}>
    {open && <div className="account-popover" role="menu" aria-label="Account menu" onKeyDown={moveFocus}><header><UserAvatar user={user} size="medium" /><div><strong>{user.name}</strong><small>{user.email}</small><span style={{ textTransform: 'capitalize' }}>{user.plan ? `${user.plan} plan` : 'Pro plan'}</span></div></header><div className="account-popover-links"><button ref={firstItem} role="menuitem" onClick={() => navigate('profile')}><Settings size={16} />Account settings</button><button role="menuitem" onClick={() => navigate('notifications')}><Bell size={16} />Notification preferences</button><button role="menuitem" onClick={() => navigate('billing')}><CreditCard size={16} />Plan &amp; billing</button><a className="account-popover-link" role="menuitem" href={publicHref('/')} target="_blank" rel="noopener noreferrer" title="View public product site"><ExternalLink size={16} />Public site</a></div><button className="account-signout" role="menuitem" onClick={() => { setOpen(false); onLogout() }}><LogOut size={16} />Sign out</button></div>}
    <button className="account" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}><UserAvatar user={user} size="small" /><div><strong>{user.name}</strong><small>{user.email}</small></div><ChevronDown size={16} className={open ? 'open' : ''} /></button>
  </div>
}
