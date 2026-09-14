import { useState } from 'react'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { api, userFacingError } from './api'
import { BrandLockup } from './Brand'

export function ResetPassword({ token }: { token: string }) {
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [saving, setSaving] = useState(false)
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSaving(true)
    const form = new FormData(event.currentTarget)
    const payload = { token, new_password: form.get('new_password'), confirm_password: form.get('confirm_password') }
    if (payload.new_password !== payload.confirm_password) { setError('New passwords do not match'); setSaving(false); return }
    try { await api('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }); setComplete(true) }
    catch (reason) { setError(userFacingError(reason, 'Your password could not be reset. Request a new link and try again.')) }
    finally { setSaving(false) }
  }
  return <div className="auth-page"><section className="auth-brand"><BrandLockup /><div><p>ACCOUNT RECOVERY</p><h1>Choose a new password.</h1><span>Your monitors and incident history stay exactly as they are.</span></div></section><section className="auth-form-wrap">{complete ? <div className="auth-form reset-complete"><CheckCircle2 size={30} /><h2>Password updated</h2><p>All previous sessions have been signed out.</p><a className="primary-btn" href="/login">Return to sign in</a></div> : <form className="auth-form" onSubmit={submit}><div><h2>Set new password</h2><p>This reset link can only be used once.</p></div><label>New password<input name="new_password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label><label>Confirm new password<input name="confirm_password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label><small>Use at least 8 characters with a letter and a number.</small>{error && <div className="form-error">{error}</div>}<button className="primary-btn auth-submit" disabled={saving}><KeyRound size={16} />{saving ? 'Updating...' : 'Reset password'}</button></form>}</section></div>
}
