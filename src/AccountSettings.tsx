import { useState } from 'react'
import { Bell, Check, ExternalLink, KeyRound, LockKeyhole, LogOut, Mail, Save, ShieldCheck, Sparkles, Trash2, UserRound } from 'lucide-react'
import { api, userFacingError, type Monitor, type User } from './api'
import { UserAvatar } from './UserAvatar'
import { useTheme, type ThemeMode } from './ThemeContext'
import { PlanBilling } from './PlanBilling'
import { publicHref } from './appConfig'

export type SettingsTab = 'profile' | 'security' | 'notifications' | 'billing'

const tabs = [
  { id: 'profile' as const, label: 'Profile', icon: UserRound },
  { id: 'security' as const, label: 'Security', icon: LockKeyhole },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'billing' as const, label: 'Plan & Early Access', icon: Sparkles },
]

export function AccountSettings({ user, monitors, limit, activeTab, onTabChange, onUserChange, onRefresh, onLogout }: { user: User; monitors: Monitor[]; limit: number; activeTab: SettingsTab; onTabChange: (tab: SettingsTab) => void; onUserChange: (user: User) => void; onRefresh: () => Promise<void>; onLogout: () => void }) {
  const { theme, setTheme } = useTheme()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  const logoutAllDevices = async () => {
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await api('/auth/logout-all', { method: 'POST' })
      onLogout()
    } catch (reason) {
      setError(userFacingError(reason, 'Could not log out of all devices. Please try again.'))
      setSaving(false)
    }
  }

  const updateName = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); setMessage(''); setSaving(true); try { const updated = await api<User>('/me/profile', { method: 'PATCH', body: JSON.stringify({ name: new FormData(event.currentTarget).get('name') }) }); onUserChange(updated); setMessage('Profile updated.') } catch (reason) { setError(userFacingError(reason, 'Your profile could not be updated. Please try again.')) } finally { setSaving(false) } }
  const requestEmailChange = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); setMessage(''); setSaving(true); const formElement = event.currentTarget; const form = new FormData(formElement); try { const result = await api<{ message: string }>('/me/email-change', { method: 'POST', body: JSON.stringify({ new_email: form.get('new_email'), current_password: form.get('current_password') }) }); setMessage(result.message); formElement.reset() } catch (reason) { setError(userFacingError(reason, 'The email change could not be started. Please try again.')) } finally { setSaving(false) } }
  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); setMessage(''); setSaving(true); const form = new FormData(event.currentTarget); const payload = { current_password: form.get('current_password'), new_password: form.get('new_password'), confirm_password: form.get('confirm_password') }; if (payload.new_password !== payload.confirm_password) { setError('New passwords do not match'); setSaving(false); return } try { await api('/me/password', { method: 'POST', body: JSON.stringify(payload) }); onLogout() } catch (reason) { setError(userFacingError(reason, 'Your password could not be changed. Please try again.')); setSaving(false) } }
  const setNotification = async (field: 'alert_on_down' | 'alert_on_recovery' | 'alert_on_ssl_expiry', enabled: boolean) => { setError(''); setMessage(''); setSaving(true); try { await Promise.all(monitors.map((monitor) => api(`/monitors/${monitor.id}`, { method: 'PATCH', body: JSON.stringify({ [field]: enabled }) }))); await onRefresh(); setMessage('Notification preferences updated.') } catch (reason) { setError(userFacingError(reason, 'Notification preferences could not be updated. Please try again.')) } finally { setSaving(false) } }
  const enabledCount = (field: 'alert_on_down' | 'alert_on_recovery' | 'alert_on_ssl_expiry') => monitors.filter((monitor) => monitor[field]).length

  const deleteAccount = async () => {
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await api('/me', {
        method: 'DELETE',
        body: JSON.stringify({
          confirmation: deleteConfirmText.trim().toUpperCase(),
          confirm_text: deleteConfirmText.trim().toUpperCase(),
          current_password: deletePassword,
          password: deletePassword,
        })
      })
      setShowDeleteModal(false)
      onLogout()
    } catch (reason) {
      setError(userFacingError(reason, 'Could not delete account. Please try again.'))
      setShowDeleteModal(false)
    } finally {
      setSaving(false)
    }
  }

  return <section className="account-settings"><div className="settings-tabs" role="tablist" aria-label="Settings sections">{tabs.map(({ id, label, icon: Icon }) => <button role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} onClick={() => { setError(''); setMessage(''); onTabChange(id) }} key={id}><Icon size={17} />{label}</button>)}</div>{message && <div className="alert-message settings-message">{message}</div>}{error && <div className="form-error">{error}</div>}
    {activeTab === 'profile' && <>
      <section className="settings-card"><header><h2>Profile</h2><p>Your personal information and account details.</p></header><form className="settings-form" onSubmit={updateName}><div className="profile-identity"><UserAvatar user={user} size="large" /><div><strong>{user.name}</strong><span>{user.email}</span>{user.auth_provider === 'google' && <small><Check size={13} />Signed in with Google</small>}</div></div><label>Display name<input name="name" required minLength={2} maxLength={80} defaultValue={user.name} /><small>This is how your name appears in Pingava.</small></label><label>Email address<input type="email" value={user.email} readOnly aria-readonly="true" /><small>{user.auth_provider === 'google' ? 'Your email is managed by Google and cannot be changed here.' : 'Manage email changes from the Security tab.'}</small></label><button className="primary-btn" disabled={saving}><Save size={16} />{saving ? 'Saving...' : 'Save changes'}</button></form></section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <section className="settings-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <header>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExternalLink size={18} />
              Public site
            </h2>
            <p>Explore Pingava public product pages, pricing, and system status.</p>
          </header>
          <div style={{ padding: '10px 24px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '16px' }}>
            <p style={{ fontSize: '13px', color: '#667085', margin: 0, lineHeight: 1.5 }}>
              Visit the live public status pages, incident communication hubs, and marketing showcase.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <a
                href={publicHref('/')}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: 600 }}
              >
                <ExternalLink size={15} />
                Visit public site
              </a>
            </div>
          </div>
        </section>

        <section className="settings-card danger-card" style={{ borderColor: '#fecdca', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <header>
            <h2 style={{ color: '#d92d20', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={18} />
              Delete account
            </h2>
            <p>Permanently delete your account and remove all your data.</p>
          </header>
          <div style={{ padding: '10px 24px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '16px' }}>
            <p style={{ fontSize: '13px', color: '#667085', margin: 0, lineHeight: 1.5 }}>
              Once confirmed, your account and all associated monitors, uptime history, and alert settings will be permanently removed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <button
                type="button"
                className="danger-btn"
                disabled={saving}
                onClick={() => { setDeleteConfirmText(''); setShowDeleteModal(true) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: 600 }}
              >
                <Trash2 size={15} />
                Delete account
              </button>
            </div>
          </div>
        </section>
      </div>
    </>}
    {activeTab === 'security' && (
      <div className="settings-stack">
        {user.auth_provider === 'google' ? (
          <section className="settings-card"><header><h2>Security</h2><p>Your connected sign-in method.</p></header><div className="connected-auth"><span><ShieldCheck size={22} /></span><div><strong>Google account</strong><small><Check size={13} />Google connected</small><p>Signed in securely using Google. No Pingava password is required.</p></div></div></section>
        ) : (
          <>
            <section className="settings-card"><header><h2>Change password</h2><p>Use a strong password you do not reuse elsewhere.</p></header><form className="settings-form" onSubmit={changePassword}><label>Current password<input name="current_password" type="password" required autoComplete="current-password" /></label><div className="form-grid"><label>New password<input name="new_password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label><label>Confirm new password<input name="confirm_password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label></div><small>Use at least 8 characters with a letter and a number.</small><button className="primary-btn" disabled={saving}><KeyRound size={16} />{saving ? 'Updating...' : 'Update password'}</button></form></section>
            <section className="settings-card"><header><h2>Change email</h2><p>The new address must be verified before activation.</p></header><form className="settings-form" onSubmit={requestEmailChange}><div className="form-grid"><label>New email<input name="new_email" type="email" required autoComplete="email" /></label><label>Current password<input name="current_password" type="password" required autoComplete="current-password" /></label></div><small>Verification expires after 30 minutes. Confirming signs out all existing sessions.</small><button className="secondary-btn" disabled={saving}><Mail size={16} />Send verification</button></form></section>
          </>
        )}
        <section className="settings-card">
          <header>
            <h2>Session Management</h2>
            <p>Control active logins across all your browsers and devices.</p>
          </header>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ fontSize: '14px', color: '#101828' }}>Log out of all devices</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#667085' }}>
                Invalidates all active session tokens immediately across every browser and device.
              </p>
            </div>
            <button
              type="button"
              className="secondary-btn"
              disabled={saving}
              onClick={logoutAllDevices}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: 600 }}
            >
              <LogOut size={15} />
              Log out everywhere
            </button>
          </div>
        </section>
      </div>
    )}
    {activeTab === 'notifications' && <section className="settings-card"><header><h2>Notification preferences</h2><p>Apply email alert preferences across your monitors.</p></header><div className="notification-settings">{([['alert_on_down', 'Email alerts', 'Receive notifications when a monitor goes down.'], ['alert_on_recovery', 'Recovery notifications', 'Receive notifications when a monitor recovers.'], ['alert_on_ssl_expiry', 'SSL expiry warnings', 'Receive warnings before monitored certificates expire.']] as const).map(([field, title, description]) => { const count = enabledCount(field); return <div key={field}><div><strong>{title}</strong><p>{description}</p><small>{monitors.length ? `Enabled for ${count} of ${monitors.length} monitors` : 'Add a monitor to configure this preference'}</small></div><label className="settings-toggle"><input type="checkbox" checked={monitors.length > 0 && count === monitors.length} disabled={saving || !monitors.length} onChange={(event) => void setNotification(field, event.target.checked)} /><span /></label></div> })}</div></section>}
    {activeTab === 'billing' && <PlanBilling user={user} monitors={monitors} limit={limit} onRefresh={onRefresh} onUserChange={onUserChange} />}
    <section className="settings-card appearance-card"><header><h2>Appearance</h2><p>Choose how Pingava looks on this device.</p></header><div className="theme-options" role="radiogroup" aria-label="Theme"><ThemeOption value="light" label="Light" selected={theme} onSelect={setTheme} /><ThemeOption value="dark" label="Dark" selected={theme} onSelect={setTheme} /></div></section>

    {showDeleteModal && (
      <div className="modal-backdrop" onMouseDown={() => setShowDeleteModal(false)}>
        <div className="modal confirm-modal" onMouseDown={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div className="modal-icon danger" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trash2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#101828' }}>Delete your account?</h2>
              <p style={{ fontSize: '13px', color: '#667085', margin: '4px 0 0' }}>This action is permanent and cannot be undone.</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#475467', lineHeight: 1.5, marginBottom: '16px' }}>
            All monitoring schedules for <strong>{user.email}</strong> will terminate, historical uptime logs will be wiped, and your access will be revoked immediately.
          </p>
          {user.auth_provider !== 'google' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#344054', display: 'block', marginBottom: '6px' }}>
                Enter your current password:
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Current password"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', fontSize: '13px' }}
                required
              />
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#344054', display: 'block', marginBottom: '6px' }}>
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', fontSize: '13px' }}
              autoFocus
            />
          </div>
          <div className="confirm-actions" style={{ padding: 0 }}>
            <button
              type="button"
              className="secondary-btn"
              disabled={saving}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="danger-btn"
              disabled={saving || deleteConfirmText.trim().toUpperCase() !== 'DELETE' || (user.auth_provider !== 'google' && !deletePassword)}
              onClick={deleteAccount}
            >
              <Trash2 size={16} />
              {saving ? 'Deleting...' : 'Permanently delete account'}
            </button>
          </div>
        </div>
      </div>
    )}
  </section>
}

function ThemeOption({ value, label, selected, onSelect }: { value: ThemeMode; label: string; selected: ThemeMode; onSelect: (value: ThemeMode) => void }) {
  return <button type="button" role="radio" aria-checked={selected === value} className={`theme-option ${selected === value ? 'selected' : ''}`} onClick={() => onSelect(value)}><span className={`theme-preview ${value}`} aria-hidden="true" /><span>{label}</span>{selected === value && <Check size={15} />}</button>
}
