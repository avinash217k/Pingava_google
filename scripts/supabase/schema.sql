-- ============================================================================
-- Pingava Comprehensive PostgreSQL Schema & Views for Supabase
-- Target Database: PostgreSQL 15+ (Supabase)
-- Covers all data models and features across Pingava
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE (Accounts, Auth, Subscription, Session Revocation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT,
    auth_provider TEXT DEFAULT 'local',
    is_owner BOOLEAN DEFAULT FALSE,
    plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_renews_at TIMESTAMPTZ,
    billing_cycle TEXT DEFAULT 'monthly',
    avatar_url TEXT,
    token_version INT DEFAULT 1,
    verification_token TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    reset_token TEXT,
    reset_token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- ----------------------------------------------------------------------------
-- 2. PLAN CATALOG TABLE (Catalog of available tiers & limits)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    badge TEXT,
    highlight BOOLEAN DEFAULT FALSE,
    price_monthly NUMERIC(10, 2) NOT NULL,
    price_annually_monthly NUMERIC(10, 2) NOT NULL,
    monitor_limit INT NOT NULL,
    check_interval_seconds INT NOT NULL,
    edge_regions_count INT NOT NULL,
    status_pages_limit INT NOT NULL,
    retention_days INT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    competitor_comparison JSONB DEFAULT '{}'::jsonb
);

-- ----------------------------------------------------------------------------
-- 3. USER INVOICES TABLE (Billing receipts & invoices)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_invoices (
    id TEXT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    amount_usd NUMERIC(10, 2) NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'refunded', 'void')),
    pdf_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_invoices_user_id ON user_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invoices_date ON user_invoices(date DESC);

-- ----------------------------------------------------------------------------
-- 4. USER PAYMENT METHODS TABLE (Billing cards & payment instruments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_payment_methods (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    last4 VARCHAR(4) NOT NULL,
    exp_month INT NOT NULL,
    exp_year INT NOT NULL,
    cardholder_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. MONITORS TABLE (Synthetic HTTP / API Check Configurations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitors (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    interval_minutes INT DEFAULT 1,
    http_method TEXT DEFAULT 'GET' CHECK (http_method IN ('GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE')),
    execution_mode TEXT DEFAULT 'recurring' CHECK (execution_mode IN ('recurring', 'manual')),
    state_change_acknowledged BOOLEAN DEFAULT TRUE,
    request_headers JSONB DEFAULT '{}'::jsonb,
    query_params JSONB DEFAULT '{}'::jsonb,
    request_body JSONB,
    timeout_seconds INT DEFAULT 30,
    accepted_statuses TEXT DEFAULT '200-299',
    response_time_threshold_ms INT,
    body_assertion TEXT DEFAULT 'none' CHECK (body_assertion IN ('none', 'contains', 'not_contains')),
    body_assertion_value TEXT,
    failure_threshold INT DEFAULT 1,
    recovery_threshold INT DEFAULT 1,
    failure_streak INT DEFAULT 0,
    recovery_streak INT DEFAULT 0,
    alert_on_down BOOLEAN DEFAULT TRUE,
    alert_on_recovery BOOLEAN DEFAULT TRUE,
    alert_on_ssl_expiry BOOLEAN DEFAULT TRUE,
    ssl_status TEXT DEFAULT 'valid' CHECK (ssl_status IN ('pending', 'valid', 'expiring', 'expired', 'error', 'not_applicable')),
    ssl_expires_at TIMESTAMPTZ,
    ssl_days_remaining INT,
    ssl_error TEXT,
    ssl_last_checked_at TIMESTAMPTZ,
    show_on_status_page BOOLEAN DEFAULT TRUE,
    public_name TEXT,
    status_page_order INT DEFAULT 0,
    status TEXT DEFAULT 'up' CHECK (status IN ('pending', 'up', 'down', 'paused')),
    uptime NUMERIC(5, 2) DEFAULT 100.00,
    response_time INT DEFAULT 0,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(status);
CREATE INDEX IF NOT EXISTS idx_monitors_last_checked ON monitors(last_checked_at DESC);

-- ----------------------------------------------------------------------------
-- 6. CHECKS (TELEMETRY LOGS & HTTP TRANSACTION PROBES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checks (
    id BIGINT PRIMARY KEY,
    monitor_id BIGINT REFERENCES monitors(id) ON DELETE SET NULL,
    execution_source TEXT DEFAULT 'scheduled' CHECK (execution_source IN ('scheduled', 'manual', 'test')),
    http_method TEXT DEFAULT 'GET',
    ok BOOLEAN NOT NULL,
    status_code INT,
    response_time INT NOT NULL,
    response_size_bytes INT,
    response_headers JSONB DEFAULT '{}'::jsonb,
    response_body_preview TEXT,
    response_body_truncated BOOLEAN DEFAULT FALSE,
    error TEXT,
    checked_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checks_monitor_id_checked_at ON checks(monitor_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_checks_ok ON checks(ok);
CREATE INDEX IF NOT EXISTS idx_checks_checked_at ON checks(checked_at DESC);

-- ----------------------------------------------------------------------------
-- 7. INCIDENTS (LEGACY / SIMPLE DOWNTIME TRACKING)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT PRIMARY KEY,
    monitor_id BIGINT REFERENCES monitors(id) ON DELETE SET NULL,
    cause TEXT,
    status TEXT DEFAULT 'resolved',
    started_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incidents_monitor_id ON incidents(monitor_id);
CREATE INDEX IF NOT EXISTS idx_incidents_started_at ON incidents(started_at DESC);

-- ----------------------------------------------------------------------------
-- 8. UNIFIED INCIDENTS (AI-AUGMENTED INCIDENTS, POST-MORTEMS & TIMELINES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unified_incidents (
    id TEXT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    record_id BIGINT,
    source TEXT DEFAULT 'automatic' CHECK (source IN ('automatic', 'manual')),
    title TEXT NOT NULL,
    summary TEXT,
    status TEXT NOT NULL CHECK (status IN ('investigating', 'acknowledged', 'resolved', 'dismissed', 'identified', 'monitoring')),
    monitor_ids JSONB DEFAULT '[]'::jsonb,
    affected_services JSONB DEFAULT '[]'::jsonb,
    service_urls JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    activity JSONB DEFAULT '[]'::jsonb,
    ai_diagnostic JSONB,
    post_mortem JSONB
);

CREATE INDEX IF NOT EXISTS idx_unified_incidents_status ON unified_incidents(status);
CREATE INDEX IF NOT EXISTS idx_unified_incidents_started ON unified_incidents(started_at DESC);

-- ----------------------------------------------------------------------------
-- 9. STATUS INCIDENTS (PUBLIC STATUS PAGE NOTICE EVENTS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS status_incidents (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'acknowledged', 'resolved', 'dismissed')),
    monitor_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS status_incident_updates (
    id BIGINT PRIMARY KEY,
    incident_id BIGINT REFERENCES status_incidents(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('investigating', 'acknowledged', 'resolved', 'dismissed')),
    message TEXT NOT NULL,
    actor_name TEXT,
    event_type TEXT,
    notification_status TEXT,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_incident_updates_inc ON status_incident_updates(incident_id);

-- ----------------------------------------------------------------------------
-- 10. WEBHOOKS TABLE (Alert notification endpoints)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhooks (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    masked_url TEXT NOT NULL,
    raw_url TEXT NOT NULL,
    alert_on_down BOOLEAN DEFAULT TRUE,
    alert_on_recovery BOOLEAN DEFAULT TRUE,
    alert_on_ssl_expiry BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    failure_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);

-- ----------------------------------------------------------------------------
-- 11. WEBHOOK DELIVERIES TABLE (Webhook dispatch execution log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id BIGINT PRIMARY KEY,
    webhook_id BIGINT REFERENCES webhooks(id) ON DELETE CASCADE,
    webhook_name TEXT NOT NULL,
    monitor_id BIGINT REFERENCES monitors(id) ON DELETE SET NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'retrying')),
    response_code INT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_wh_id ON webhook_deliveries(webhook_id);

-- ----------------------------------------------------------------------------
-- 12. STATUS PAGE CONFIG TABLE (Public status page settings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS status_page_config (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    published BOOLEAN DEFAULT TRUE,
    email_subscriptions_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_page_slug ON status_page_config(slug);

-- ----------------------------------------------------------------------------
-- 13. STATUS PAGE SUBSCRIBERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS status_subscribers (
    id BIGINT PRIMARY KEY,
    email TEXT NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_status_subscribers_email ON status_subscribers(email);

-- ----------------------------------------------------------------------------
-- 14. ALERT DELIVERIES TABLE (SMTP & Notification Dispatch Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_deliveries (
    id BIGINT PRIMARY KEY,
    monitor_id BIGINT REFERENCES monitors(id) ON DELETE CASCADE,
    recipient TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    provider_id TEXT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alert_deliveries_monitor_id ON alert_deliveries(monitor_id);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_created_at ON alert_deliveries(created_at DESC);

-- ----------------------------------------------------------------------------
-- 15. API CONTRACTS TABLE (API Contract Guardian schema definitions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_contracts (
    monitor_id BIGINT PRIMARY KEY REFERENCES monitors(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    strict_mode BOOLEAN DEFAULT FALSE,
    schema_version TEXT DEFAULT '1.0.0',
    last_inferred_at TIMESTAMPTZ,
    contract_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 16. LATENCY RADAR BASELINES TABLE (Anomaly radar statistical metrics)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS latency_radar_baselines (
    monitor_id BIGINT PRIMARY KEY REFERENCES monitors(id) ON DELETE CASCADE,
    baseline_avg NUMERIC(10, 2) DEFAULT 0,
    recent_avg NUMERIC(10, 2) DEFAULT 0,
    baseline_p95 NUMERIC(10, 2) DEFAULT 0,
    recent_p95 NUMERIC(10, 2) DEFAULT 0,
    drift_percentage NUMERIC(6, 2) DEFAULT 0,
    jitter_ms NUMERIC(10, 2) DEFAULT 0,
    std_dev NUMERIC(10, 2) DEFAULT 0,
    z_score NUMERIC(6, 2) DEFAULT 0,
    severity TEXT DEFAULT 'nominal' CHECK (severity IN ('nominal', 'watch', 'degrading', 'critical_risk')),
    predictive_risk_score INT DEFAULT 0,
    sre_diagnosis TEXT,
    sre_remediation_hint TEXT,
    estimated_time_to_timeout_hours NUMERIC(6, 1),
    percentiles JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 17. EDGE PROBE HISTORY TABLE (Multi-Region Global PoP Diagnostics)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS edge_probe_history (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT REFERENCES monitors(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    hostname TEXT NOT NULL,
    probed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    global_avg_latency_ms NUMERIC(10, 2),
    fastest_region TEXT,
    slowest_region TEXT,
    dns_propagation_consistent BOOLEAN DEFAULT TRUE,
    ssl_propagation_consistent BOOLEAN DEFAULT TRUE,
    resolved_ips JSONB DEFAULT '[]'::jsonb,
    ssl_certificate JSONB,
    regions JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_edge_probe_monitor ON edge_probe_history(monitor_id);
CREATE INDEX IF NOT EXISTS idx_edge_probe_probed_at ON edge_probe_history(probed_at DESC);

-- ============================================================================
-- SQL VIEWS FOR FAST & EASY INSPECTION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VIEW 1: Active Monitors & Fleet Health
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_active_monitors CASCADE;
CREATE VIEW v_active_monitors AS
SELECT
    m.id AS monitor_id,
    m.name AS monitor_name,
    m.url AS target_url,
    m.status AS current_status,
    m.uptime AS uptime_percentage,
    m.response_time AS latest_latency_ms,
    m.failure_streak,
    m.recovery_streak,
    m.ssl_status,
    m.ssl_days_remaining,
    m.last_checked_at,
    u.id AS owner_user_id,
    u.name AS owner_name,
    u.email AS owner_email,
    u.plan AS owner_plan
FROM monitors m
LEFT JOIN users u ON m.user_id = u.id
ORDER BY m.id ASC;

-- ----------------------------------------------------------------------------
-- VIEW 2: 24-Hour Monitor Performance & Rolling Aggregates
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_monitor_health_24h CASCADE;
CREATE VIEW v_monitor_health_24h AS
SELECT
    m.id AS monitor_id,
    m.name AS monitor_name,
    m.url AS target_url,
    COUNT(c.id) AS total_checks_24h,
    COUNT(c.id) FILTER (WHERE c.ok = TRUE) AS successful_checks,
    COUNT(c.id) FILTER (WHERE c.ok = FALSE) AS failed_checks,
    ROUND(
        COALESCE(
            (COUNT(c.id) FILTER (WHERE c.ok = TRUE)::NUMERIC / NULLIF(COUNT(c.id), 0)) * 100.0,
            100.0
        ),
        2
    ) AS availability_pct_24h,
    ROUND(
        COALESCE(
            AVG(c.response_time) FILTER (WHERE c.ok = TRUE),
            0
        )::numeric,
        1
    ) AS avg_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY c.response_time) FILTER (WHERE c.ok = TRUE) AS p95_latency_ms,
    MAX(c.checked_at) AS most_recent_check_at
FROM monitors m
LEFT JOIN checks c ON m.id = c.monitor_id AND c.checked_at >= (NOW() - INTERVAL '24 hours')
GROUP BY m.id, m.name, m.url
ORDER BY m.id ASC;

-- ----------------------------------------------------------------------------
-- VIEW 3: Incidents Summary with AI Diagnostics
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_incident_summary CASCADE;
CREATE VIEW v_incident_summary AS
SELECT
    ui.id AS incident_id,
    ui.title,
    ui.status,
    ui.source,
    ui.started_at,
    ui.resolved_at,
    ROUND(
        (EXTRACT(EPOCH FROM (COALESCE(ui.resolved_at, NOW()) - ui.started_at)) / 60.0)::numeric,
        1
    ) AS outage_duration_minutes,
    ui.affected_services,
    ui.ai_diagnostic->>'category' AS ai_root_cause_category,
    ui.ai_diagnostic->>'title' AS ai_diagnostic_headline,
    ui.ai_diagnostic->>'engine' AS ai_model_used,
    jsonb_array_length(COALESCE(ui.activity, '[]'::jsonb)) AS timeline_event_count
FROM unified_incidents ui
ORDER BY ui.started_at DESC;

-- ----------------------------------------------------------------------------
-- VIEW 4: Recent Check Failures (Triage View)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_recent_check_failures CASCADE;
CREATE VIEW v_recent_check_failures AS
SELECT
    c.id AS check_id,
    c.checked_at,
    m.id AS monitor_id,
    m.name AS monitor_name,
    m.url AS target_url,
    c.status_code,
    c.response_time AS latency_ms,
    c.error,
    c.execution_source
FROM checks c
JOIN monitors m ON c.monitor_id = m.id
WHERE c.ok = FALSE
ORDER BY c.checked_at DESC;

-- ----------------------------------------------------------------------------
-- VIEW 5: User Subscriptions & Quota Usage
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_user_subscriptions CASCADE;
CREATE VIEW v_user_subscriptions AS
SELECT
    u.id AS user_id,
    u.email,
    u.name,
    u.plan,
    u.subscription_status,
    u.subscription_renews_at,
    u.billing_cycle,
    u.is_owner,
    COUNT(m.id) AS total_monitors_configured,
    COUNT(m.id) FILTER (WHERE m.status = 'up') AS active_monitors,
    COUNT(m.id) FILTER (WHERE m.status = 'down') AS down_monitors,
    COUNT(m.id) FILTER (WHERE m.status = 'paused') AS paused_monitors
FROM users u
LEFT JOIN monitors m ON u.id = m.user_id
GROUP BY u.id, u.email, u.name, u.plan, u.subscription_status, u.subscription_renews_at, u.billing_cycle, u.is_owner
ORDER BY u.id ASC;

-- ----------------------------------------------------------------------------
-- VIEW 6: Billing & Invoices Overview
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_billing_invoices CASCADE;
CREATE VIEW v_billing_invoices AS
SELECT
    inv.id AS invoice_id,
    inv.invoice_number,
    inv.date AS billing_date,
    inv.amount_usd,
    inv.plan_name,
    inv.billing_cycle,
    inv.status,
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email
FROM user_invoices inv
JOIN users u ON inv.user_id = u.id
ORDER BY inv.date DESC;

-- ----------------------------------------------------------------------------
-- VIEW 7: API Contract Guardian Status
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_api_contract_status CASCADE;
CREATE VIEW v_api_contract_status AS
SELECT
    ac.monitor_id,
    m.name AS monitor_name,
    m.url AS target_url,
    ac.enabled AS contract_enabled,
    ac.strict_mode,
    ac.schema_version,
    jsonb_array_length(COALESCE(ac.contract_fields, '[]'::jsonb)) AS total_expected_fields,
    ac.last_inferred_at
FROM api_contracts ac
JOIN monitors m ON ac.monitor_id = m.id
ORDER BY ac.monitor_id ASC;

-- ----------------------------------------------------------------------------
-- VIEW 8: Webhook Channel Health & Dispatch Stats
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_webhook_health CASCADE;
CREATE VIEW v_webhook_health AS
SELECT
    w.id AS webhook_id,
    w.name AS channel_name,
    w.masked_url,
    w.active,
    w.failure_count,
    COUNT(d.id) AS total_deliveries,
    COUNT(d.id) FILTER (WHERE d.status = 'sent') AS successful_deliveries,
    COUNT(d.id) FILTER (WHERE d.status = 'failed') AS failed_deliveries,
    MAX(d.delivered_at) AS last_delivered_at
FROM webhooks w
LEFT JOIN webhook_deliveries d ON w.id = d.webhook_id
GROUP BY w.id, w.name, w.masked_url, w.active, w.failure_count
ORDER BY w.id ASC;

-- ----------------------------------------------------------------------------
-- VIEW 9: Latency Radar Anomaly Alerting
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_latency_radar_anomalies CASCADE;
CREATE VIEW v_latency_radar_anomalies AS
SELECT
    l.monitor_id,
    m.name AS monitor_name,
    m.url AS target_url,
    l.severity,
    l.predictive_risk_score,
    l.drift_percentage,
    l.jitter_ms,
    l.baseline_avg,
    l.recent_avg,
    l.sre_diagnosis,
    l.sre_remediation_hint,
    l.estimated_time_to_timeout_hours
FROM latency_radar_baselines l
JOIN monitors m ON l.monitor_id = m.id
ORDER BY l.predictive_risk_score DESC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Supabase Security Hardening)
-- ============================================================================

-- Enable RLS across all tables to block unauthorized public REST API access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE latency_radar_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_probe_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access strictly for public plan catalog and published status pages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'plan_catalog' AND policyname = 'Public can view plans'
    ) THEN
        CREATE POLICY "Public can view plans" ON plan_catalog FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'status_page_config' AND policyname = 'Public can view published status page'
    ) THEN
        CREATE POLICY "Public can view published status page" ON status_page_config FOR SELECT USING (published = true);
    END IF;
END $$;
