function pairsFromForm(form: FormData, kind: 'header' | 'query'): Record<string, string> {
  const keys = form.getAll(`${kind}_key`).map(String)
  const values = form.getAll(`${kind}_value`).map(String)
  const result: Record<string, string> = {}
  const normalizedNames = new Set<string>()
  keys.forEach((rawKey, index) => {
    const key = rawKey.trim()
    const value = values[index] || ''
    if (!key && !value) return
    if (!key) throw new Error(`Enter a name for every ${kind === 'header' ? 'header' : 'query parameter'}`)
    const normalized = kind === 'header' ? key.toLowerCase() : key
    if (normalizedNames.has(normalized)) throw new Error(`Remove the duplicate ${kind === 'header' ? 'header' : 'query parameter'} “${key}”`)
    normalizedNames.add(normalized)
    result[key] = value
  })
  return result
}

export function monitorRequestPayload(form: FormData) {
  const bodyText = String(form.get('request_body') || '').trim()
  let requestBody: unknown = null
  if (bodyText) {
    try { requestBody = JSON.parse(bodyText) }
    catch { throw new Error('Request body must contain valid JSON') }
  }
  return {
    http_method: String(form.get('http_method') || 'GET'),
    execution_mode: String(form.get('execution_mode') || 'recurring'),
    state_change_acknowledged: form.get('state_change_acknowledged') === 'on',
    request_headers: pairsFromForm(form, 'header'),
    query_params: pairsFromForm(form, 'query'),
    request_body: requestBody,
  }
}
