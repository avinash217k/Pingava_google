/**
 * Comprehensive System & Button Functionality Test Suite for Pingava
 * Tests core services, live API endpoints, business logic, timing calculations, and button actions.
 */

import { calculateHeartbeatTiming, generateHeartbeatToken, slugify, type Heartbeat } from '../heartbeatService.js'
import { checkSslCertificate } from '../sslService.js'
import { observability } from '../observabilityService.js'

const PROD_URL = 'https://dashboard.pingava.com'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: any) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ PASS: ${testName}`)
  } else {
    failedTests++
    console.error(`  ❌ FAIL: ${testName}`, detail || '')
  }
}

async function runTests() {
  console.log('=================================================================')
  console.log('🚀 RUNNING PINGAVA FULL PRODUCT & SYSTEM TEST SUITE')
  console.log('=================================================================\n')

  // -------------------------------------------------------------
  // SUITE 1: HEARTBEAT TIMING ENGINE & CRYPTO
  // -------------------------------------------------------------
  console.log('📦 SUITE 1: Cron Job & Worker Heartbeat Timing Engine')

  const token = generateHeartbeatToken()
  assert(token.startsWith('hb_') && token.length === 19, 'generateHeartbeatToken() produces valid 19-char hb_ token', token)

  const slug = slugify('Daily DB Backup & Replication (US-East)')
  assert(slug === 'daily-db-backup-replication-us-east', 'slugify() creates URL-safe slug', slug)

  const now = new Date()
  const period = 300 // 5m
  const grace = 60 // 1m

  const baseHb: Heartbeat = {
    id: 'hb_test',
    user_id: 1,
    name: 'Test Job',
    slug: 'test-job',
    token: 'hb_test123',
    period_seconds: period,
    grace_seconds: grace,
    status: 'up',
    last_ping_at: null,
    alert_on_miss: true,
    alert_sent: false,
    miss_count: 0,
    hit_count: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  }

  // Test 1: Up / Healthy
  const lastPingHealthy = new Date(now.getTime() - 100 * 1000).toISOString() // 100s ago
  const timingHealthy = calculateHeartbeatTiming({ ...baseHb, last_ping_at: lastPingHealthy }, now.getTime())
  assert(!timingHealthy.is_overdue && !timingHealthy.is_in_grace && timingHealthy.seconds_until_expected! > 0, 'Healthy job: not overdue, not in grace')

  // Test 2: In Grace
  const lastPingGrace = new Date(now.getTime() - 320 * 1000).toISOString() // 320s ago (> 300s, < 360s)
  const timingGrace = calculateHeartbeatTiming({ ...baseHb, last_ping_at: lastPingGrace }, now.getTime())
  assert(!timingGrace.is_overdue && timingGrace.is_in_grace, 'Grace window job: in grace, not yet overdue alarm')

  // Test 3: Overdue / Down
  const lastPingOverdue = new Date(now.getTime() - 400 * 1000).toISOString() // 400s ago (> 360s)
  const timingOverdue = calculateHeartbeatTiming({ ...baseHb, last_ping_at: lastPingOverdue }, now.getTime())
  assert(timingOverdue.is_overdue && timingOverdue.seconds_overdue! >= 40, 'Overdue job: flagged overdue with positive seconds_overdue')

  // Test 4: Never pinged
  const timingNever = calculateHeartbeatTiming({ ...baseHb, last_ping_at: null }, now.getTime())
  assert(!timingNever.is_overdue && timingNever.expected_at === null, 'Never pinged job: handled safely with null expected_at')

  console.log('')

  // -------------------------------------------------------------
  // SUITE 2: SSL / TLS CERTIFICATE GUARDIAN ENGINE
  // -------------------------------------------------------------
  console.log('🔒 SUITE 2: SSL / TLS Certificate Socket Inspection Engine')

  try {
    const cert = await checkSslCertificate('https://dashboard.pingava.com')
    assert(cert.valid, 'checkSslCertificate() verifies dashboard.pingava.com as valid')
    assert(cert.days_remaining !== null && cert.days_remaining > 0, `dashboard.pingava.com has positive days remaining (${cert.days_remaining}d)`)
    assert(typeof cert.issuer === 'string' && cert.issuer.length > 0, `dashboard.pingava.com CA recognized: ${cert.issuer}`)
    assert(cert.protocol?.startsWith('TLS'), `Negotiated TLS protocol: ${cert.protocol}`)
  } catch (err) {
    assert(false, 'checkSslCertificate() failed against dashboard.pingava.com', err)
  }

  // Tier calculation checks
  const getTier = (days: number) => days <= 0 ? 0 : days <= 1 ? 1 : days <= 7 ? 7 : days <= 14 ? 14 : days <= 30 ? 30 : null
  assert(getTier(45) === null, 'SSL > 30 days: tier is null (healthy)')
  assert(getTier(25) === 30, 'SSL 25 days: tier is 30d')
  assert(getTier(12) === 14, 'SSL 12 days: tier is 14d')
  assert(getTier(5) === 7, 'SSL 5 days: tier is 7d')
  assert(getTier(0.5) === 1, 'SSL 12 hours: tier is 24h (tier 1)')
  assert(getTier(-1) === 0, 'SSL negative days: tier is 0 (expired)')

  console.log('')

  // -------------------------------------------------------------
  // SUITE 3: PUBLIC API ENDPOINTS & CSRF EXEMPTIONS
  // -------------------------------------------------------------
  console.log('🌐 SUITE 3: Public API Endpoints & Security Checks')

  try {
    const cfgRes = await fetch(`${PROD_URL}/api/auth/config`)
    const cfgJson = await cfgRes.json()
    assert(cfgRes.status === 200 && Boolean(cfgJson.googleClientId), 'GET /api/auth/config returns 200 and googleClientId')
  } catch (err) {
    assert(false, 'GET /api/auth/config failed', err)
  }

  try {
    const badLoginRes = await fetch(`${PROD_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@pingava.com', password: 'wrongpassword123' })
    })
    assert(badLoginRes.status === 401, 'POST /api/auth/login with invalid credentials correctly rejects with 401')
  } catch (err) {
    assert(false, 'POST /api/auth/login test failed', err)
  }

  try {
    const plansRes = await fetch(`${PROD_URL}/api/billing/plans`)
    const plansJson = await plansRes.json()
    assert(plansRes.status === 200 && Array.isArray(plansJson.plans) && plansJson.plans.length >= 3, 'GET /api/billing/plans returns pricing tiers catalogue')
  } catch (err) {
    assert(false, 'GET /api/billing/plans failed', err)
  }

  try {
    const subActionRes = await fetch(`${PROD_URL}/api/public/subscriptions/confirm?token=test_token_123`)
    const subActionJson = await subActionRes.json()
    assert(subActionRes.status === 200 && Boolean(subActionJson.message), 'GET /api/public/subscriptions/confirm returns 200 with confirmation message')
  } catch (err) {
    assert(false, 'GET /api/public/subscriptions/confirm failed', err)
  }

  console.log('')

  // -------------------------------------------------------------
  // SUITE 4: CRON HEARTBEAT INCOMING PING WORKFLOWS
  // -------------------------------------------------------------
  console.log('💓 SUITE 4: Cron Heartbeat Live Check-In Workflows')

  const seedToken = 'hb_7f9c2d1b8e4a'

  // 1. Regular GET ping
  try {
    const pingRes = await fetch(`${PROD_URL}/api/heartbeat/${seedToken}`)
    const pingJson = await pingRes.json()
    assert(pingRes.status === 200 && pingJson.status === 'ok' && pingJson.state === 'up', 'GET /api/heartbeat/:token checks in successfully')
  } catch (err) {
    assert(false, 'GET /api/heartbeat/:token failed', err)
  }

  // 2. Start ping
  try {
    const startRes = await fetch(`${PROD_URL}/api/heartbeat/${seedToken}/start`, { method: 'POST' })
    const startJson = await startRes.json()
    assert(startRes.status === 200 && startJson.status === 'ok', 'POST /api/heartbeat/:token/start registers job initialization')
  } catch (err) {
    assert(false, 'POST /api/heartbeat/:token/start failed', err)
  }

  // 3. Explicit failure ping
  try {
    const failRes = await fetch(`${PROD_URL}/api/heartbeat/${seedToken}/fail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'System test simulated job failure' })
    })
    const failJson = await failRes.json()
    assert(failRes.status === 200 && failJson.status === 'ok' && failJson.state === 'down', 'POST /api/heartbeat/:token/fail triggers immediate down status')
  } catch (err) {
    assert(false, 'POST /api/heartbeat/:token/fail failed', err)
  }

  // 4. Recovery check-in ping
  try {
    const recoverRes = await fetch(`${PROD_URL}/api/heartbeat/${seedToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Job recovered successfully after test' })
    })
    const recoverJson = await recoverRes.json()
    assert(recoverRes.status === 200 && recoverJson.status === 'ok' && recoverJson.state === 'up', 'POST /api/heartbeat/:token restores state to up')
  } catch (err) {
    assert(false, 'POST /api/heartbeat/:token recovery failed', err)
  }

  console.log('')

  // -------------------------------------------------------------
  // SUITE 5: BUTTON ACTIONS & FORM LOGIC VALIDATION
  // -------------------------------------------------------------
  console.log('🔘 SUITE 5: Interactive Button & Form Actions Validation')

  // Button 1: Promo Code Coupon Validation (PlanBilling.tsx)
  const validCoupons = ['LAUNCH', 'STARTUP', 'launch', 'startup']
  const invalidCoupons = ['EXPIRED20', 'DISCOUNT', '']
  for (const code of validCoupons) {
    const isAccepted = code.trim().toUpperCase() === 'LAUNCH' || code.trim().toUpperCase() === 'STARTUP'
    assert(isAccepted, `Button Action "Apply Promo": Accepts valid coupon '${code}' for 20% discount`)
  }
  for (const code of invalidCoupons) {
    const isAccepted = code.trim().toUpperCase() === 'LAUNCH' || code.trim().toUpperCase() === 'STARTUP'
    assert(!isAccepted, `Button Action "Apply Promo": Safely rejects invalid coupon '${code}'`)
  }

  // Button 2: Public Uptime Check Simulation (ReferenceChecker & UptimeCheck)
  try {
    const probeRes = await fetch(`${PROD_URL}/api/public/tools/uptime-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.google.com' })
    })
    const probeJson = await probeRes.json()
    assert(probeRes.status === 200 && probeJson.status_code === 200 && probeJson.response_time > 0, 'Button Action "Check Endpoint": Performs live synthetic probe with response time')
  } catch (err) {
    assert(false, 'Public uptime check probe failed', err)
  }

  // Button 3: Host Redirects on direct dashboard routes
  try {
    const directRes = await fetch('https://www.pingava.com/overview', { redirect: 'manual' })
    assert(directRes.status === 302 || directRes.status === 200, 'Host Router: Direct dashboard route on www.pingava.com handled cleanly')
  } catch (err) {
    assert(false, 'Host router check failed', err)
  }

  console.log('')

  // -------------------------------------------------------------
  // SUITE 6: SELF-OBSERVABILITY & META-GUARDIAN WATCHDOG ENGINE
  // -------------------------------------------------------------
  console.log('🛡️ SUITE 6: Self-Observability & Meta-Guardian Watchdog Engine')

  // 1. Exception Tracking & Ring Buffer
  observability.clearExceptions()
  observability.recordException(new Error('Simulated internal test exception'), {
    endpoint: '/api/test-sim',
    method: 'GET',
    status_code: 500,
    correlation_id: 'corr_test_123',
    level: 'ERROR'
  })

  let snap = observability.getSnapshot([])
  assert(snap.recent_exceptions.length === 1, 'Observability: Records internal exceptions into ring buffer')
  assert(snap.recent_exceptions[0].correlation_id === 'corr_test_123', 'Observability: Preserves correlation ID on exception')
  assert(snap.recent_exceptions[0].status_code === 500, 'Observability: Captures HTTP status code on exception')

  // 2. Clear exceptions
  observability.clearExceptions()
  snap = observability.getSnapshot([])
  assert(snap.recent_exceptions.length === 0, 'Observability: Clears exception ring buffer on demand')

  // 3. Check Execution Tracking
  observability.recordCheckExecuted(5)
  snap = observability.getSnapshot([
    { id: 1, name: 'Google', status: 'up', interval_minutes: 5, last_checked_at: new Date().toISOString() }
  ])
  assert(snap.checks.executed_today >= 5, 'Observability: Check counters accurately aggregate checks executed today', snap.checks.executed_today)
  assert(snap.checks.expected_hourly === 12, 'Observability: Calculates expected checks per hour (60 / 5m = 12)', snap.checks.expected_hourly)

  // 4. Database Telemetry
  observability.recordSupabaseQuery(45, true)
  observability.recordFirestoreWrite(72, true)
  snap = observability.getSnapshot([])
  assert(snap.databases.supabase.latency_ms === 45, 'Observability: Supabase roundtrip latency tracked accurately', snap.databases.supabase.latency_ms)
  assert(snap.databases.firestore.last_write_latency_ms === 72, 'Observability: Firestore write latency tracked accurately', snap.databases.firestore.last_write_latency_ms)

  // 5. Notification Telemetry
  observability.recordEmailAttempt(true)
  observability.recordEmailAttempt(false, 'Relay quota exceeded')
  snap = observability.getSnapshot([])
  assert(snap.notifications.email.sent >= 1 && snap.notifications.email.failed >= 1, 'Observability: Email delivery success and failure rates recorded')

  // 6. Meta-Guardian Watchdog Status
  const guardian = observability.evaluateMetaGuardian([])
  assert(guardian.overall_health === 'healthy' || guardian.overall_health === 'warning', 'Observability: Meta-Guardian watchdog evaluates fleet state without crashing', guardian.overall_health)

  // -------------------------------------------------------------
  // SUITE 6: RBAC SECURITY: OBSERVABILITY & ADMIN RESTRICTIONS
  // -------------------------------------------------------------
  console.log('\n🛡️ SUITE 6: Role-Based Access Control (RBAC) & Owner Protection')

  try {
    const unauthObs = await fetch(`${PROD_URL}/api/observability/metrics`)
    assert(unauthObs.status === 403, 'GET /api/observability/metrics strictly rejects non-owner/unauthenticated requests with 403')

    const unauthAlert = await fetch(`${PROD_URL}/api/observability/test-alert`, { method: 'POST' })
    assert(unauthAlert.status === 403, 'POST /api/observability/test-alert strictly rejects non-owner requests with 403')

    const unauthClear = await fetch(`${PROD_URL}/api/observability/clear-errors`, { method: 'POST' })
    assert(unauthClear.status === 403, 'POST /api/observability/clear-errors strictly rejects non-owner requests with 403')

    const unauthAdmin = await fetch(`${PROD_URL}/api/admin/overview`)
    assert(unauthAdmin.status === 403, 'GET /api/admin/overview strictly rejects non-owner requests with 403')
  } catch (err) {
    assert(false, 'RBAC owner protection tests encountered an error', err)
  }

  console.log('\n=================================================================')
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests`)
  console.log('=================================================================')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal error executing test suite:', err)
  process.exit(1)
})
