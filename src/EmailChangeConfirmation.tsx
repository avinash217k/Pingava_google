import { useEffect, useState } from 'react'
import { CheckCircle2, Mail, TriangleAlert } from 'lucide-react'
import { api, session, userFacingError } from './api'

export function EmailChangeConfirmation({ token }: { token: string }) {
  const [message, setMessage] = useState('Verifying your email...')
  const [ok, setOk] = useState(false)
  useEffect(() => { api<{ message: string }>(`/public/email-change/confirm?token=${encodeURIComponent(token)}`).then((result) => { session.clearLegacy(); setMessage(result.message); setOk(true) }).catch((reason) => setMessage(userFacingError(reason, 'This verification link is invalid or has expired.'))) }, [token])
  return <div className="public-status-shell"><div className="public-status-empty">{ok ? <CheckCircle2 size={28} /> : message.startsWith('Verifying') ? <Mail size={28} /> : <TriangleAlert size={28} />}<h1>Email verification</h1><p>{message}</p><a className="primary-btn" href="/login">Return to sign in</a></div></div>
}
