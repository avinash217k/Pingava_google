export type PlanTier = 'free' | 'solo' | 'pro' | 'team'
export type BillingCycle = 'monthly' | 'annually'

export type PlanDefinition = {
  id: PlanTier
  name: string
  tagline: string
  badge?: string
  price_monthly: number
  price_annually_monthly: number
  monitor_limit: number
  check_interval_seconds: number
  edge_regions_count: number
  status_pages_limit: number
  retention_days: number
  features: string[]
  highlight?: boolean
  competitor_comparison: {
    competitor: string
    competitor_price: string
    competitor_monitors: string
    savings: string
  }
}

export type Invoice = {
  id: string
  invoice_number: string
  date: string
  amount_usd: number
  plan_id: PlanTier
  plan_name: string
  billing_cycle: BillingCycle
  status: 'paid' | 'pending'
  pdf_available: boolean
}

export type PaymentMethod = {
  brand: string
  last4: string
  exp_month: number
  exp_year: number
  cardholder_name: string
}

export type SubscriptionData = {
  plan: PlanTier
  plan_name: string
  billing_cycle: BillingCycle
  subscription_status: 'active' | 'trialing' | 'canceled' | 'past_due'
  subscription_renews_at: string
  monitors_count: number
  monitors_limit: number
  payment_method: PaymentMethod | null
  invoices: Invoice[]
}

export type User = {
  id: number
  name: string
  email: string
  is_owner: boolean
  auth_provider: 'password' | 'google'
  avatar_url?: string | null
  plan?: PlanTier
  billing_cycle?: BillingCycle
  subscription_status?: 'active' | 'trialing' | 'canceled' | 'past_due'
  subscription_renews_at?: string
  plan_limit?: number
}
export type Monitor = {
  id: number; user_id?: number; name: string; url: string; interval_minutes: number
  http_method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  execution_mode: 'recurring' | 'manual'; state_change_acknowledged: boolean
  request_headers?: Record<string, string>; query_params?: Record<string, string>; request_body?: unknown | null
  timeout_seconds: number; accepted_statuses: string
  response_time_threshold_ms: number | null
  body_assertion: 'none' | 'contains' | 'not_contains'; body_assertion_value: string | null
  failure_threshold: number; recovery_threshold: number
  failure_streak: number; recovery_streak: number
  alert_on_down: boolean; alert_on_recovery: boolean
  alert_on_ssl_expiry: boolean; ssl_status: 'pending' | 'valid' | 'expiring' | 'expired' | 'error' | 'not_applicable'
  ssl_expires_at: string | null; ssl_days_remaining: number | null; ssl_error: string | null; ssl_last_checked_at: string | null
  ssl_issuer?: string | null; ssl_protocol?: string | null; ssl_subject?: string | null; ssl_alert_sent_tier?: number | null; ssl_valid_from?: string | null
  show_on_status_page: boolean; public_name: string | null; status_page_order: number
  status: 'pending' | 'up' | 'down' | 'paused'; uptime: number
  response_time: number | null; last_checked_at: string | null; created_at: string
}
export type Incident = { id: number; monitor_id: number; cause: string; status?: UnifiedIncidentStatus; started_at: string; resolved_at: string | null }
export type Check = { id: number; monitor_id: number; execution_source: 'scheduled' | 'manual' | 'test'; http_method: Monitor['http_method']; ok: boolean; status_code: number | null; response_time: number; error: string | null; response_headers?: Record<string, string> | null; response_body_preview?: string | null; response_body_truncated?: boolean; response_size_bytes?: number | null; checked_at: string }
export type Dashboard = { monitors: Monitor[]; incidents: Incident[]; recent_checks: Check[]; limit: number }
export type MonitorDetail = { monitor: Monitor; average_response_time: number | null; checks: Check[]; incidents: Incident[] }
export type AlertDelivery = { id: number; monitor_id: number | null; kind: string; recipient: string; status: string; provider_id: string | null; error: string | null; created_at: string; sent_at: string | null }
export type WebhookChannel = { id: number; user_id?: number; name: string; masked_url: string; channel_type?: 'slack' | 'discord' | 'telegram' | 'generic'; alert_on_down: boolean; alert_on_recovery: boolean; alert_on_ssl_expiry: boolean; active: boolean; failure_count: number; created_at: string; updated_at: string }
export type WebhookDelivery = { id: number; webhook_id: number; webhook_name: string; monitor_id: number | null; kind: string; status: string; response_code: number | null; error: string | null; created_at: string; delivered_at: string | null }
export type StatusPage = {
  slug: string;
  title: string;
  description: string;
  published?: boolean;
  email_subscriptions_enabled?: boolean;
  logo_url?: string | null;
  custom_domain?: string | null;
  cname_verified?: boolean;
  overall_status: 'up' | 'down' | 'pending';
  monitors: (Pick<Monitor, 'id' | 'name' | 'status' | 'uptime' | 'last_checked_at'> & { public_name?: string | null; status_page_order?: number })[];
  incidents: Incident[];
  status_incidents: StatusIncident[];
}
export type StatusSubscriber = {
  id: number;
  email: string;
  confirmed: boolean;
  active: boolean;
  created_at: string;
  last_notified_at?: string | null;
}
export type AiDiagnosticResult = {
  incident_id?: string;
  check_id?: number;
  monitor_id: number;
  monitor_name: string;
  target_url: string;
  timestamp: string;
  engine: 'gemini-3.8-flash' | 'pingava-heuristic';
  title: string;
  summary: string;
  category: 'upstream_origin' | 'dns_network' | 'ssl_tls' | 'timeout_load' | 'application_error' | 'content_mismatch' | 'configuration';
  confidence: 'high' | 'medium' | 'low';
  technical_hypothesis: string;
  network_breakdown: {
    dns_status: 'healthy' | 'degraded' | 'failed' | 'not_applicable';
    ssl_status: 'healthy' | 'expiring' | 'failed' | 'not_applicable';
    tcp_connection: 'connected' | 'refused' | 'reset' | 'timeout';
    http_layer: string;
    server_header?: string | null;
    cdn_cache_header?: string | null;
  };
  remediation_steps: string[];
  suggested_status_notice: string;
  suggested_internal_note?: string;
}

export type IncidentPostMortem = {
  incident_id: string;
  title: string;
  severity: 'P1 - Critical' | 'P2 - Major' | 'P3 - Moderate';
  engine: 'gemini-3.8-flash' | 'pingava-heuristic';
  generated_at: string;
  duration_human: string;
  mttd_seconds: number;
  mttr_seconds: number;
  affected_services: string[];
  lead_investigator: string;
  executive_summary: string;
  customer_impact: {
    estimated_impacted_percentage: number;
    error_rate_peak: string;
    user_experience: string;
  };
  root_cause: {
    primary_factor: string;
    five_whys: string[];
    trigger: string;
    technical_details: string;
  };
  timeline: {
    time: string;
    relative_offset: string;
    event: string;
    actor: string;
  }[];
  action_items: {
    id: string;
    description: string;
    owner: string;
    priority: 'P0' | 'P1' | 'P2';
    category: 'Detection' | 'Prevention' | 'Mitigation' | 'Process';
    status: 'open' | 'in_progress' | 'completed';
  }[];
  lessons_learned: {
    what_went_well: string[];
    what_went_wrong: string[];
    where_we_got_lucky: string[];
  };
  markdown_export: string;
  public_announcement: string;
}

export type UnifiedIncidentStatus = 'investigating' | 'acknowledged' | 'resolved' | 'dismissed'
export type IncidentActivity = { id: string; event_type: 'created' | 'detected' | 'status_changed' | 'update_published' | 'notification' | 'recovered' | 'reopened'; status: UnifiedIncidentStatus; message: string; actor_name: string; notification_status: 'sent' | 'failed' | 'skipped' | null; created_at: string }
export type UnifiedIncident = { id: string; record_id: number; source: 'automatic' | 'manual'; title: string; summary: string; status: UnifiedIncidentStatus; monitor_ids: number[]; affected_services: string[]; service_urls: string[]; started_at: string; resolved_at: string | null; activity: IncidentActivity[]; ai_diagnostic?: AiDiagnosticResult; post_mortem?: IncidentPostMortem }
export type StatusIncidentUpdate = { id: number; status: UnifiedIncidentStatus; message: string; actor_name?: string | null; event_type?: string; notification_status?: string | null; created_at: string }
export type StatusIncident = { id: number; title: string; status: UnifiedIncidentStatus; monitor_ids: number[]; created_at: string; resolved_at: string | null; updates: StatusIncidentUpdate[] }
export type AdminOverview = {
  system: { api_ok: boolean; worker_ok: boolean; worker_id: string | null; worker_last_seen_at: string | null; migration: string | null; database_size_bytes: number; blocked_rate_limits: number; database_kind: 'sqlite' | 'postgresql'; backup_management: 'local' | 'provider' }
  counts: { users: number; monitors: number; checks: number; open_incidents: number }
  alert_counts: { sent: number; failed: number; skipped: number; pending: number }
  users: { id: number; name: string; email: string; created_at: string; monitor_count: number }[]
  recent_alerts: { id: number; kind: string; recipient: string; status: string; error: string | null; created_at: string }[]
  backups: { name: string; size_bytes: number; created_at: string; has_checksum: boolean }[]
  retention: { checks_days: number; incidents_days: number; alerts_days: number; tokens_days: number; backups_count: number }
  logging: { ok: boolean; writable: boolean; directory: string; free_bytes: number; min_free_bytes: number; files: { name: string; size_bytes: number }[] }
  recent_errors: LogEvent[]
  recent_security_events: LogEvent[]
}
export type LogEvent = { timestamp: string; level: string; logger: string; message: string; event?: string; correlation_id?: string }

// Multi-Region Network Edge Inspector types
export type EdgeRegionId = 'us-east' | 'us-west' | 'eu-central' | 'eu-west' | 'ap-southeast' | 'ap-northeast'
export type EdgeRegionResult = {
  region_id: EdgeRegionId;
  region_name: string;
  flag: string;
  location: string;
  ip_address: string;
  status: 'healthy' | 'degraded' | 'failed';
  dns_lookup_ms: number;
  tcp_connect_ms: number;
  tls_handshake_ms: number;
  ttfb_ms: number;
  total_latency_ms: number;
  status_code: number | null;
  status_text: string;
  cdn_provider?: string;
  cache_status?: string;
  ssl_valid: boolean;
  ssl_issuer?: string;
  ssl_days_remaining?: number;
}
export type EdgeInspectResult = {
  url: string;
  hostname: string;
  probed_at: string;
  global_avg_latency_ms: number;
  fastest_region: string;
  slowest_region: string;
  dns_propagation_consistent: boolean;
  ssl_propagation_consistent: boolean;
  resolved_ips: string[];
  ssl_certificate: {
    subject: string;
    issuer: string;
    valid_from: string;
    valid_to: string;
    days_remaining: number;
    sans: string[];
    tls_version: string;
    cipher: string;
  } | null;
  regions: EdgeRegionResult[];
}

// API Contract & Schema Drift Guardian types
export type ContractFieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'any'
export type ContractField = {
  path: string;
  expected_type: ContractFieldType;
  required: boolean;
  nullable: boolean;
  description?: string;
  sample_value?: string;
}
export type ApiContract = {
  monitor_id: number;
  enabled: boolean;
  strict_mode: boolean;
  schema_version: string;
  last_inferred_at: string | null;
  contract_fields: ContractField[];
}
export type ContractDriftChange = {
  path: string;
  expected_type: string;
  actual_type: string;
  issue: 'missing_field' | 'type_mismatch' | 'null_not_allowed' | 'unexpected_field';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  sample_received?: string;
}
export type ContractValidationResult = {
  valid: boolean;
  drift_score: number; // 0 to 100
  compliance_rate: number; // 0 to 100%
  timestamp: string;
  checked_url: string;
  breaking_changes: ContractDriftChange[];
  additions: ContractDriftChange[];
  total_expected_fields: number;
  matched_fields: number;
  inferred_contract_fields?: ContractField[];
}

// Silent Degradation & Latency Anomaly Radar types
export type LatencyPercentiles = {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}
export type AnomalySeverity = 'nominal' | 'watch' | 'degrading' | 'critical_risk'
export type MonitorLatencyRadar = {
  monitor_id: number;
  monitor_name: string;
  url: string;
  current_response_time: number | null;
  baseline_avg: number;
  recent_avg: number;
  baseline_p95: number;
  recent_p95: number;
  drift_percentage: number;
  jitter_ms: number;
  std_dev: number;
  z_score: number;
  severity: AnomalySeverity;
  status_label: string;
  timeout_threshold_seconds: number;
  predictive_risk_score: number;
  sre_diagnosis: string;
  sre_remediation_hint: string;
  estimated_time_to_timeout_hours: number | null;
  percentiles: LatencyPercentiles;
  recent_points: { checked_at: string; response_time: number; ok: boolean }[];
}
export type FleetLatencyRadar = {
  total_monitors: number;
  nominal_count: number;
  watch_count: number;
  degrading_count: number;
  critical_count: number;
  fleet_p95_ms: number;
  fleet_avg_ms: number;
  monitors: MonitorLatencyRadar[];
  generated_at: string;
}

export const session = {
  clearLegacy: () => {
    try { localStorage.removeItem('pulsewatchr-token') } catch {}
  },
}

const technicalError = /(traceback|stack trace|sql(?:ite)?|psycopg|axioserror|econn\w*|errno|unexpected token|\/opt\/render|\/usr\/|internal server error|failed to fetch|networkerror)/i

export function userFacingError(reason: unknown, fallback: string): string {
  if (!(reason instanceof Error)) return fallback
  const message = reason.message.trim()
  if (!message || message.length > 280 || technicalError.test(message)) return fallback
  return message
}

const csrfToken = () => document.cookie.split('; ').find((item) => item.startsWith('pingava_csrf='))?.split('=', 2)[1]

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('content-type', 'application/json')
  const csrf = csrfToken()
  if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes((options.method || 'GET').toUpperCase())) headers.set('x-csrf-token', decodeURIComponent(csrf))
  const response = await fetch(`/api${path}`, { ...options, headers, credentials: 'same-origin' })
  if (response.status === 204) return undefined as T
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Invalid response for ${path}`)
  }
  const data = await response.json().catch(() => ({}))
  const requestId = response.headers.get('x-request-id')
  if (!response.ok) {
    const err: any = new Error(data.detail || data.error || 'Request failed')
    if (data.unverified) err.unverified = true
    if (data.email) err.email = data.email
    if (data.not_found) err.not_found = true
    if (requestId) err.requestId = requestId
    err.status = response.status
    throw err
  }
  return data as T
}

export type SslFleetMonitor = {
  id: number;
  name: string;
  url: string;
  ssl_status: 'pending' | 'valid' | 'expiring' | 'expired' | 'error' | 'not_applicable';
  ssl_days_remaining: number | null;
  ssl_expires_at: string | null;
  ssl_valid_from?: string | null;
  ssl_issuer?: string | null;
  ssl_protocol?: string | null;
  ssl_subject?: string | null;
  ssl_error?: string | null;
  alert_on_ssl_expiry: boolean;
}

export type SslFleetSummary = {
  total_https: number;
  valid: number;
  expiring_soon: number;
  expired: number;
  error: number;
  monitors: SslFleetMonitor[];
}

export async function checkMonitorSsl(monitorId: number): Promise<{ success: boolean; monitor: Monitor; ssl: any }> {
  return api<{ success: boolean; monitor: Monitor; ssl: any }>(`/monitors/${monitorId}/ssl-check`, {
    method: 'POST'
  });
}

export async function getSslFleet(): Promise<SslFleetSummary> {
  return api<SslFleetSummary>('/ssl-fleet');
}

export type Heartbeat = {
  id: string;
  user_id: number;
  name: string;
  slug: string;
  token: string;
  period_seconds: number;
  grace_seconds: number;
  status: 'up' | 'late' | 'down' | 'pending' | 'paused';
  last_ping_at: string | null;
  last_ping_ip?: string | null;
  last_ping_duration_ms?: number | null;
  last_ping_status?: 'success' | 'fail';
  last_ping_body?: string | null;
  started_at?: string | null;
  alert_on_miss: boolean;
  alert_sent: boolean;
  miss_count: number;
  hit_count: number;
  created_at: string;
  updated_at: string;
  timing?: {
    expected_at: string | null;
    grace_deadline_at: string | null;
    is_overdue: boolean;
    is_in_grace: boolean;
    seconds_until_expected: number | null;
    seconds_overdue: number | null;
  };
}

export type HeartbeatPing = {
  id: string;
  heartbeat_id: string;
  pinged_at: string;
  ip?: string | null;
  status: 'success' | 'fail';
  duration_ms?: number | null;
  body?: string | null;
  user_agent?: string | null;
}

export type HeartbeatsResponse = {
  heartbeats: Heartbeat[];
  summary: {
    total: number;
    up: number;
    late: number;
    down: number;
    pending: number;
    paused: number;
  };
}

export async function getHeartbeats(): Promise<HeartbeatsResponse> {
  return api<HeartbeatsResponse>('/heartbeats');
}

export async function createHeartbeat(data: { name: string; period_seconds: number; grace_seconds: number; alert_on_miss?: boolean }): Promise<Heartbeat> {
  return api<Heartbeat>('/heartbeats', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateHeartbeat(id: string, data: Partial<Heartbeat>): Promise<Heartbeat> {
  return api<Heartbeat>(`/heartbeats/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function toggleHeartbeat(id: string): Promise<Heartbeat> {
  return api<Heartbeat>(`/heartbeats/${id}/toggle`, {
    method: 'POST'
  });
}

export async function testPingHeartbeat(id: string): Promise<any> {
  return api<any>(`/heartbeats/${id}/test-ping`, {
    method: 'POST'
  });
}

export async function getHeartbeatPings(id: string): Promise<HeartbeatPing[]> {
  return api<HeartbeatPing[]>(`/heartbeats/${id}/pings`);
}

export async function deleteHeartbeat(id: string): Promise<{ success: boolean }> {
  return api<{ success: boolean }>(`/heartbeats/${id}`, {
    method: 'DELETE'
  });
}

// ---------------------------------------------------------
// Pingava Self-Observability & Meta-Guardian API
// ---------------------------------------------------------
export interface InternalException {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'FATAL' | 'WARN';
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  status_code?: number;
  correlation_id?: string;
}

export interface CheckExecutionMetrics {
  expected_hourly: number;
  executed_hourly: number;
  executed_today: number;
  execution_rate_pct: number;
  overdue_monitors_count: number;
  overdue_monitors: Array<{ id: number; name: string; url: string; overdue_by_seconds: number }>;
}

export interface DatabaseTelemetry {
  supabase: {
    status: 'connected' | 'degraded' | 'disconnected';
    latency_ms: number | null;
    total_queries: number;
    failed_queries: number;
    consecutive_errors: number;
  };
  firestore: {
    status: 'connected' | 'degraded' | 'disconnected';
    last_write_latency_ms: number | null;
    total_writes: number;
    failed_writes: number;
    consecutive_errors: number;
  };
}

export interface NotificationTelemetry {
  email: {
    provider: 'brevo_smtp';
    attempted: number;
    sent: number;
    failed: number;
    failure_rate_pct: number;
    last_sent_at: string | null;
    last_failed_at: string | null;
    last_error: string | null;
  };
  webhooks: {
    attempted: number;
    sent: number;
    failed: number;
    failure_rate_pct: number;
    last_sent_at: string | null;
    last_failed_at: string | null;
    last_error: string | null;
  };
}

export interface WorkerLoopTelemetry {
  status: 'healthy' | 'delayed' | 'stalled';
  last_tick_at: string | null;
  tick_interval_ms: number;
  total_ticks: number;
  event_loop_lag_ms: number;
}

export interface MetaGuardianStatus {
  overall_health: 'healthy' | 'warning' | 'critical';
  watchdog_active: boolean;
  last_evaluated_at: string;
  active_alerts: string[];
}

export interface ObservabilitySnapshot {
  timestamp: string;
  meta_guardian: MetaGuardianStatus;
  worker_loop: WorkerLoopTelemetry;
  checks: CheckExecutionMetrics;
  databases: DatabaseTelemetry;
  notifications: NotificationTelemetry;
  process: {
    uptime_seconds: number;
    memory_rss_bytes: number;
    memory_heap_used_bytes: number;
    memory_heap_total_bytes: number;
    node_version: string;
    pid: number;
    cloud_run_revision: string;
  };
  recent_exceptions: InternalException[];
}

export async function getObservabilityMetrics(): Promise<ObservabilitySnapshot> {
  return api<ObservabilitySnapshot>('/observability/metrics');
}

export async function testObservabilityAlert(): Promise<{ success: boolean; delivered_to: string; result: any }> {
  return api<{ success: boolean; delivered_to: string; result: any }>('/observability/test-alert', {
    method: 'POST'
  });
}

export async function clearObservabilityErrors(): Promise<{ success: boolean; message: string }> {
  return api<{ success: boolean; message: string }>('/observability/clear-errors', {
    method: 'POST'
  });
}

/**
 * Normalizes user-entered URLs:
 * - Trims whitespace
 * - If user types "facebook.com", prefixes "https://" -> "https://facebook.com"
 * - If user types with typos like "htttps://", "htps://", "http//", "https//", fixes them to "https://"
 * - Preserves explicit "http://"
 * - Preserves explicit "https://"
 */
export function normalizeEndpointUrl(rawUrl: string): string {
  let url = String(rawUrl || '').trim();
  if (!url) return '';

  // Fix common typo prefixes
  if (/^https?:\/([^\/])/i.test(url)) {
    url = url.replace(/^https?:\/([^\/])/i, 'https://$1');
  } else if (/^https?\/\//i.test(url)) {
    url = url.replace(/^https?\/\//i, 'https://');
  }

  // Handle typos in http/https scheme (e.g. htttps://, htps://, httsp://, httpss://, htttp://)
  if (/^(?:ht+ps?|htt+sp?|https+)(?::\/\/|\/\/)/i.test(url)) {
    if (/^http:\/\//i.test(url)) {
      // keep explicit http
    } else {
      url = url.replace(/^(?:ht+ps?|htt+sp?|https+)(?::\/\/|\/\/)/i, 'https://');
    }
  }

  // If no scheme present, default to https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export type SslFleetOverview = {
  total_https: number;
  valid_count: number;
  expiring_soon_count: number;
  critical_count: number;
  expired_count: number;
  error_count: number;
  scanned_count?: number;
  monitors: {
    id: number;
    name: string;
    url: string;
    ssl_status: string;
    ssl_days_remaining: number | null;
    ssl_expires_at: string | null;
    ssl_issuer: string | null;
    ssl_protocol: string | null;
    ssl_last_checked_at: string | null;
    ssl_error: string | null;
    alert_on_ssl_expiry: boolean;
  }[];
}

export async function verifyStatusPageCname(domain: string) {
  return api<{ verified: boolean; cnameRecords: string[]; target: string; error?: string }>(
    `/status-page/verify-cname?domain=${encodeURIComponent(domain)}`
  );
}

export async function getSslFleetOverview() {
  return api<SslFleetOverview>('/ssl/fleet');
}

export async function scanSslFleet() {
  return api<SslFleetOverview>('/ssl/scan', { method: 'POST' });
}
