import { api } from './api'
import { trackEvent } from './analyticsClient'

export type UptimeCheckResult = {
  ok: boolean
  status_code: number | null
  response_time: number
  error: string | null
  final_url?: string | null
}

export function validateUptimeCheckUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error('Enter a valid website or API endpoint.')
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    throw new Error('Only HTTP and HTTPS endpoints are supported.')
  }
  const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`
  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('Enter a valid website or API endpoint.')
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS endpoints are supported.')
  }
  if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') || parsed.username || parsed.password || /\s/.test(candidate)) {
    throw new Error('Enter a valid website or API endpoint.')
  }
  return candidate
}

function friendlyCheckError(reason: unknown): string {
  const message = reason instanceof Error ? reason.message : ''
  if (/rate limit|too many|429/i.test(message)) return 'Rate limit reached. Please wait before trying again.'
  if (/timed? out|timeout/i.test(message)) return 'The request timed out. Try again in a moment.'
  if (/private|localhost|internal|metadata|not allowed/i.test(message)) return 'Private or internal addresses cannot be checked.'
  if (/Only HTTP|unsupported scheme/i.test(message)) return 'Only HTTP and HTTPS endpoints are supported.'
  if (/valid URL|url validation/i.test(message)) return 'Enter a valid public HTTP or HTTPS URL.'
  if (/resolve|name or service|domain|reach|connect/i.test(message)) return 'The host could not be reached.'
  return 'The check could not be completed. Please try again.'
}

export async function runUptimeCheck(value: string, targetType: 'website' | 'api' = 'website'): Promise<{ url: string; result: UptimeCheckResult }> {
  let url: string
  try { url = validateUptimeCheckUrl(value) }
  catch (reason) { trackEvent('free_check_failed', { target_type: targetType, failure_category: 'invalid_url' }); throw reason }
  trackEvent('free_check_started', { target_type: targetType })
  try {
    const result = await api<UptimeCheckResult>('/public/tools/uptime-check', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
    const normalized = { ...result, error: result.error ? friendlyCheckError(new Error(result.error)) : null }
    if (normalized.ok) trackEvent('free_check_completed', { target_type: targetType, success: true, http_status: normalized.status_code, response_time_ms: normalized.response_time })
    else trackEvent('free_check_failed', { target_type: targetType, failure_category: /public HTTP|private/i.test(result.error || '') ? 'blocked_target' : /timed? out/i.test(result.error || '') ? 'timeout' : /resolv|reach|connect/i.test(result.error || '') ? 'unreachable' : 'check_failed' })
    return { url, result: normalized }
  } catch (reason) {
    const message = friendlyCheckError(reason)
    trackEvent('free_check_failed', { target_type: targetType, failure_category: /Rate limit/i.test(message) ? 'rate_limited' : /timed out/i.test(message) ? 'timeout' : /public HTTP/i.test(message) ? 'blocked_target' : /reached/i.test(message) ? 'unreachable' : 'check_failed' })
    throw new Error(message)
  }
}
