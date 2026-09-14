type Properties = Record<string, unknown>
type Attribution = { source?: string; medium?: string; campaign?: string; content?: string; term?: string; gclid?: string; fbclid?: string; msclkid?: string; landing_page: string }
type StoredAttribution = { first_touch: Attribution; last_touch: Attribution }

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
    posthog?: {
      init: (key: string, options?: Record<string, unknown>) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (id: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
      startSessionRecording?: () => void;
      [key: string]: unknown;
    };
  }
}

const ATTRIBUTION_KEY = 'pingava_attribution'
const DISTINCT_ID_KEY = 'pingava_analytics_id'
const runtimeValue = (name: string) => document.querySelector<HTMLMetaElement>(`meta[name="pingava-analytics-${name}"]`)?.content.trim()
const configValue = (runtimeName: string, buildValue: unknown, fallback = '') => runtimeValue(runtimeName) || String(buildValue || fallback).trim()
const parseEnabled = (value: string) => ['true', '1', 'yes', 'on'].includes(value.trim().replace(/^['"]|['"]$/g, '').toLowerCase())
const enabled = parseEnabled(configValue('enabled', import.meta.env.VITE_ANALYTICS_ENABLED))
const gaId = configValue('ga-measurement-id', import.meta.env.VITE_GA_MEASUREMENT_ID)
const posthogKey = configValue('posthog-key', import.meta.env.VITE_POSTHOG_KEY)
const posthogHost = configValue('posthog-host', import.meta.env.VITE_POSTHOG_HOST, 'https://us.i.posthog.com').replace(/\/$/, '')
let initialized = false
let lastPage = ''

const sharedCookieAttributes = location.hostname === 'pingava.com' || location.hostname.endsWith('.pingava.com') ? '; Domain=.pingava.com; Secure' : ''
const readShared = (key: string) => {
  try {
    const local = localStorage.getItem(key)
    if (local) return local
  } catch { /* storage access denied in iframe */ }
  try {
    const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${key}=`))?.slice(key.length + 1)
    return cookie ? decodeURIComponent(cookie) : null
  } catch {
    return null
  }
}
const writeShared = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch { /* storage access denied in iframe */ }
  try {
    document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=2592000; SameSite=Lax${sharedCookieAttributes}`
  } catch {}
}
const removeShared = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch { /* storage access denied in iframe */ }
  try {
    document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax${sharedCookieAttributes}`
  } catch {}
}

const clean = (value: string | null) => value ? value.slice(0, 200) : undefined
const safePath = () => `${location.pathname}${location.hash}`.slice(0, 300)
const distinctId = () => {
  let id = readShared(DISTINCT_ID_KEY)
  if (!id) {
    try {
      id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`
    } catch {
      id = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`
    }
    writeShared(DISTINCT_ID_KEY, id)
  }
  return id
}

export function captureAttribution(): StoredAttribution | null {
  try {
    const params = new URLSearchParams(location.search)
    const touch: Attribution = {
      source: clean(params.get('utm_source')), medium: clean(params.get('utm_medium')),
      campaign: clean(params.get('utm_campaign')), content: clean(params.get('utm_content')),
      term: clean(params.get('utm_term')), gclid: clean(params.get('gclid')),
      fbclid: clean(params.get('fbclid')), msclkid: clean(params.get('msclkid')),
      landing_page: location.pathname.slice(0, 300),
    }
    const hasCampaign = Object.entries(touch).some(([key, value]) => key !== 'landing_page' && Boolean(value))
    const stored = JSON.parse(readShared(ATTRIBUTION_KEY) || 'null') as StoredAttribution | null
    if (!hasCampaign) return stored
    const next = { first_touch: stored?.first_touch || touch, last_touch: touch }
    writeShared(ATTRIBUTION_KEY, JSON.stringify(next))
    return next
  } catch { return null }
}

const attributionProperties = () => {
  const attribution = captureAttribution()
  if (!attribution) return {}
  return {
    first_touch_source: attribution.first_touch.source,
    first_touch_medium: attribution.first_touch.medium,
    first_touch_campaign: attribution.first_touch.campaign,
    first_touch_landing_page: attribution.first_touch.landing_page,
    last_touch_source: attribution.last_touch.source,
    last_touch_medium: attribution.last_touch.medium,
    last_touch_campaign: attribution.last_touch.campaign,
    last_touch_landing_page: attribution.last_touch.landing_page,
  }
}

const campaignProperties = () => {
  const touch = captureAttribution()?.last_touch
  return touch ? { campaign_source: touch.source, campaign_medium: touch.medium, campaign_name: touch.campaign, campaign_content: touch.content, campaign_term: touch.term } : {}
}

function posthogCapture(event: string, properties: Properties = {}) {
  if (!enabled || !posthogKey) return
  const safeProperties = { distinct_id: distinctId(), $lib: 'pingava-web', ...properties }
  if (typeof window !== 'undefined' && window.posthog?.capture) {
    window.posthog.capture(event, safeProperties)
    return
  }
  const payload = { api_key: posthogKey, event, properties: safeProperties }
  void fetch(`${posthogHost}/capture/`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => undefined)
}

export function initializeAnalytics() {
  if (initialized || !enabled) return
  initialized = true
  captureAttribution()
  if (gaId) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() { window.dataLayer?.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', gaId, { send_page_view: false, anonymize_ip: true })
    const script = document.createElement('script')
    script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`; script.dataset.pingavaGa = 'true'
    document.head.appendChild(script)
  }

  if (posthogKey && typeof window !== 'undefined') {
    // Official PostHog asynchronous web loader
    !(function (t: Document, e: any) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i: string, s: any, a: string) {
          function g(t: any, e: any) {
            var o = e.split(".");
            2 === o.length && ((t = t[o[0]]), (e = o[1])),
              (t[e] = function () {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
              });
          }
          (p = t.createElement("script")).type = "text/javascript",
            (p.crossOrigin = "anonymous"),
            (p.async = !0),
            (p.src =
              s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") +
              "/static/array.js"),
            (r = t.getElementsByTagName("script")[0]).parentNode?.insertBefore(p, r);
          var u = e;
          for (
            void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
              u.people = u.people || [],
              u.toString = function (t: any) {
                var e = "posthog";
                return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
              },
              u.people.toString = function () {
                return u.toString(1) + ".people (stub)";
              },
              o =
                "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(
                  " "
                ),
              n = 0;
            n < o.length;
            n++
          )
            g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1.0));
    })(document, (window as any).posthog || []);

    window.posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false,
      session_recording: {
        recordCrossOriginIframes: true,
        maskAllInputs: false,
      },
    });

    if (typeof window.posthog.startSessionRecording === 'function') {
      window.posthog.startSessionRecording();
    }
  }
}

export function trackPageView(path = safePath()) {
  if (!enabled || path === lastPage) return
  lastPage = path
  const campaign = campaignProperties()
  window.gtag?.('event', 'page_view', { send_to: gaId, page_path: path, page_title: document.title, page_location: `${location.origin}${path}`, ...campaign })
  posthogCapture('$pageview', { $current_url: `${location.origin}${path}`, $pathname: path, ...campaign })
}

export function trackEvent(name: string, properties: Properties = {}) {
  if (!enabled) return
  const safeProperties = { ...attributionProperties(), ...properties }
  const gaName = name === 'user_signed_up' ? 'sign_up' : name
  window.gtag?.('event', gaName, { send_to: gaId, ...safeProperties })
  posthogCapture(name, safeProperties)
}

export function identifyUser(userId: number, properties: Properties = {}) {
  if (!enabled || !posthogKey) return
  const anonymousId = distinctId()
  writeShared(DISTINCT_ID_KEY, String(userId))
  const userProps = { ...attributionProperties(), ...properties }
  if (typeof window !== 'undefined' && window.posthog?.identify) {
    window.posthog.identify(String(userId), userProps)
    return
  }
  posthogCapture('$identify', { $anon_distinct_id: anonymousId, $set: userProps })
}

export function resetAnalytics() {
  if (!enabled) return
  removeShared(DISTINCT_ID_KEY)
  if (typeof window !== 'undefined' && window.posthog?.reset) {
    window.posthog.reset()
  }
  lastPage = ''
}

export function installAnalyticsNavigation() {
  initializeAnalytics(); requestAnimationFrame(() => trackPageView())
  const notify = () => queueMicrotask(() => trackPageView())
  const pushState = history.pushState.bind(history)
  const replaceState = history.replaceState.bind(history)
  history.pushState = (data: unknown, unused: string, url?: string | URL | null) => { pushState(data, unused, url); notify() }
  history.replaceState = (data: unknown, unused: string, url?: string | URL | null) => { replaceState(data, unused, url); notify() }
  addEventListener('popstate', notify)
}
