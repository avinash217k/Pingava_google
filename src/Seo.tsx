import { useEffect } from 'react'

export const SEO_TITLE = 'Pingava – Uptime & API Monitoring for Websites'
export const SEO_DESCRIPTION = 'Monitor website uptime, APIs and response times with Pingava. Get downtime alerts, incident tracking and public status pages.'
const PUBLIC_ORIGIN = 'https://www.pingava.com'

type Props = { title?: string; description?: string; canonicalPath?: string; noIndex?: boolean; preserveCanonical?: boolean }

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

export function PageMetadata({ title = SEO_TITLE, description = SEO_DESCRIPTION, canonicalPath = '/', noIndex = false, preserveCanonical = false }: Props) {
  useEffect(() => {
    const authTitles: Record<string, string> = { '/login': 'Sign in to Pingava', '/register': 'Create your Pingava account', '/app': 'Pingava dashboard' }
    const privateTitle = authTitles[window.location.pathname]
    const resolvedTitle = title === SEO_TITLE && privateTitle ? privateTitle : title
    const resolvedDescription = title === SEO_TITLE && privateTitle ? 'Access your private Pingava monitoring workspace.' : description
    const resolvedNoIndex = noIndex || Boolean(privateTitle)
    const canonicalUrl = new URL(canonicalPath, PUBLIC_ORIGIN).toString()
    document.title = resolvedTitle
    setMeta('meta[name="description"]', 'name', 'description', resolvedDescription)
    setMeta('meta[name="robots"]', 'name', 'robots', resolvedNoIndex ? 'noindex, nofollow' : 'index, follow')
    setMeta('meta[property="og:title"]', 'property', 'og:title', resolvedTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', resolvedDescription)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Pingava')
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', resolvedTitle)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', resolvedDescription)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (resolvedNoIndex && !preserveCanonical) canonical?.remove()
    else {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
      canonical.href = canonicalUrl
    }
  }, [canonicalPath, description, noIndex, preserveCanonical, title])
  return null
}
