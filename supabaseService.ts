import pg from 'pg';
import type { PersistentStoreState } from './firestoreService';
import { observability } from './observabilityService';

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let saveDebounceTimer: NodeJS.Timeout | null = null;

const DEFAULT_SUPABASE_DB_URL =
  process.env.SUPABASE_DB_URL ||
  'postgresql://postgres.fahgatpftgecvfbfhegf:Shambhawi%402175@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

export function getSupabasePool(): pg.Pool | null {
  if (poolInstance) return poolInstance;

  const connectionString = DEFAULT_SUPABASE_DB_URL;
  if (!connectionString) {
    console.warn('[Supabase] No SUPABASE_DB_URL configured. Supabase sync disabled.');
    return null;
  }

  try {
    poolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    poolInstance.on('error', (err) => {
      console.error('[Supabase] Unexpected idle client error:', err.message);
    });

    console.log('[Supabase] Connected to PostgreSQL pool (Dual-Write enabled).');
    return poolInstance;
  } catch (err: any) {
    console.error('[Supabase] Initialization error:', err.message);
    return null;
  }
}

/**
 * Persists application state to Supabase in an asynchronous, non-blocking manner.
 */
export async function syncStateToSupabase(state: PersistentStoreState): Promise<void> {
  const pool = getSupabasePool();
  if (!pool) return;

  const syncStartTime = Date.now();
  const client = await pool.connect();
  try {
    // 1. Sync Users
    if (state.users && state.users.length > 0) {
      for (const u of state.users) {
        await client.query(
          `
          INSERT INTO users (id, email, name, password, auth_provider, is_owner, plan, subscription_status, subscription_renews_at, billing_cycle, avatar_url, token_version, is_verified, verification_token, reset_token, reset_token_expires_at, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, COALESCE($17::timestamptz, NOW()))
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            password = EXCLUDED.password,
            plan = EXCLUDED.plan,
            subscription_status = EXCLUDED.subscription_status,
            subscription_renews_at = EXCLUDED.subscription_renews_at,
            token_version = EXCLUDED.token_version,
            avatar_url = EXCLUDED.avatar_url,
            is_verified = EXCLUDED.is_verified,
            verification_token = EXCLUDED.verification_token,
            reset_token = EXCLUDED.reset_token,
            reset_token_expires_at = EXCLUDED.reset_token_expires_at;
          `,
          [
            u.id,
            u.email,
            u.name || null,
            u.password || null,
            u.auth_provider || 'local',
            Boolean(u.is_owner),
            u.plan || 'free',
            u.subscription_status || 'active',
            u.subscription_renews_at || null,
            u.billing_cycle || 'monthly',
            u.avatar_url || null,
            u.token_version || 1,
            u.is_verified !== false,
            u.verification_token || null,
            u.reset_token || null,
            u.reset_token_expires_at || null,
            u.created_at || null,
          ]
        );
      }
    }

    // 2. Sync Monitors
    if (Array.isArray(state.monitors)) {
      const activeIds = state.monitors.map(m => Number(m.id)).filter(id => !isNaN(id));
      if (activeIds.length > 0) {
        await client.query('DELETE FROM checks WHERE monitor_id IS NOT NULL AND NOT (monitor_id = ANY($1::bigint[]));', [activeIds]);
        await client.query('DELETE FROM incidents WHERE monitor_id IS NOT NULL AND NOT (monitor_id = ANY($1::bigint[]));', [activeIds]);
        await client.query('DELETE FROM monitors WHERE NOT (id = ANY($1::bigint[]));', [activeIds]);
      } else {
        await client.query('DELETE FROM checks WHERE monitor_id IS NOT NULL;');
        await client.query('DELETE FROM incidents WHERE monitor_id IS NOT NULL;');
        await client.query('DELETE FROM monitors;');
      }

      for (const m of state.monitors) {
        await client.query(
          `
          INSERT INTO monitors (id, user_id, name, url, interval_minutes, http_method, execution_mode, state_change_acknowledged, request_headers, query_params, request_body, timeout_seconds, accepted_statuses, response_time_threshold_ms, body_assertion, body_assertion_value, failure_threshold, recovery_threshold, failure_streak, recovery_streak, alert_on_down, alert_on_recovery, alert_on_ssl_expiry, ssl_status, ssl_expires_at, ssl_days_remaining, ssl_error, ssl_last_checked_at, show_on_status_page, public_name, status_page_order, status, uptime, response_time, last_checked_at, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, COALESCE($36::timestamptz, NOW()))
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            url = EXCLUDED.url,
            status = EXCLUDED.status,
            uptime = EXCLUDED.uptime,
            response_time = EXCLUDED.response_time,
            failure_streak = EXCLUDED.failure_streak,
            recovery_streak = EXCLUDED.recovery_streak,
            ssl_status = EXCLUDED.ssl_status,
            ssl_days_remaining = EXCLUDED.ssl_days_remaining,
            ssl_error = EXCLUDED.ssl_error,
            ssl_last_checked_at = EXCLUDED.ssl_last_checked_at,
            last_checked_at = EXCLUDED.last_checked_at;
          `,
          [
            m.id,
            m.user_id || 1,
            m.name,
            m.url,
            m.interval_minutes || 1,
            m.http_method || 'GET',
            m.execution_mode || 'recurring',
            m.state_change_acknowledged !== false,
            JSON.stringify(m.request_headers || {}),
            JSON.stringify(m.query_params || {}),
            m.request_body ? JSON.stringify(m.request_body) : null,
            m.timeout_seconds || 30,
            m.accepted_statuses || '200-299',
            m.response_time_threshold_ms || null,
            m.body_assertion || 'none',
            m.body_assertion_value || null,
            m.failure_threshold || 1,
            m.recovery_threshold || 1,
            m.failure_streak || 0,
            m.recovery_streak || 0,
            m.alert_on_down !== false,
            m.alert_on_recovery !== false,
            m.alert_on_ssl_expiry !== false,
            m.ssl_status || 'valid',
            m.ssl_expires_at || null,
            m.ssl_days_remaining || null,
            m.ssl_error || null,
            m.ssl_last_checked_at || null,
            m.show_on_status_page !== false,
            m.public_name || null,
            m.status_page_order || 0,
            m.status || 'up',
            m.uptime ?? 100.0,
            m.response_time || 0,
            m.last_checked_at || null,
            m.created_at || null,
          ]
        );
      }
    }

    // 3. Sync Recent Checks (insert newest checks that do not exist yet)
    if (state.checks && state.checks.length > 0) {
      const recentChecks = state.checks.slice(0, 50);
      for (const c of recentChecks) {
        await client.query(
          `
          INSERT INTO checks (id, monitor_id, execution_source, http_method, ok, status_code, response_time, response_size_bytes, response_headers, response_body_preview, response_body_truncated, error, checked_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::timestamptz)
          ON CONFLICT (id) DO NOTHING;
          `,
          [
            c.id,
            c.monitor_id,
            c.execution_source || 'scheduled',
            c.http_method || 'GET',
            Boolean(c.ok),
            c.status_code || null,
            c.response_time || 0,
            c.response_size_bytes || null,
            JSON.stringify(c.response_headers || {}),
            c.response_body_preview || null,
            Boolean(c.response_body_truncated),
            c.error || null,
            c.checked_at || new Date().toISOString(),
          ]
        );
      }
    }

    // 4. Sync Unified Incidents
    if (state.unifiedIncidents && state.unifiedIncidents.length > 0) {
      for (const inc of state.unifiedIncidents) {
        await client.query(
          `
          INSERT INTO unified_incidents (id, user_id, record_id, source, title, summary, status, monitor_ids, affected_services, service_urls, started_at, resolved_at, activity, ai_diagnostic, post_mortem)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz, $12::timestamptz, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            status = EXCLUDED.status,
            resolved_at = EXCLUDED.resolved_at,
            activity = EXCLUDED.activity,
            ai_diagnostic = EXCLUDED.ai_diagnostic,
            post_mortem = EXCLUDED.post_mortem;
          `,
          [
            String(inc.id),
            inc.user_id || 1,
            inc.record_id || null,
            inc.source || 'automatic',
            inc.title,
            inc.summary || null,
            inc.status || 'investigating',
            JSON.stringify(inc.monitor_ids || []),
            JSON.stringify(inc.affected_services || []),
            JSON.stringify(inc.service_urls || []),
            inc.started_at,
            inc.resolved_at || null,
            JSON.stringify(inc.activity || []),
            inc.ai_diagnostic ? JSON.stringify(inc.ai_diagnostic) : null,
            inc.post_mortem ? JSON.stringify(inc.post_mortem) : null,
          ]
        );
      }
    }

    // 5. Sync Webhooks
    if (Array.isArray(state.webhooks)) {
      const activeWebhookIds = state.webhooks.map(w => Number(w.id)).filter(id => !isNaN(id));
      if (activeWebhookIds.length > 0) {
        await client.query('DELETE FROM webhook_deliveries WHERE webhook_id IS NOT NULL AND NOT (webhook_id = ANY($1::bigint[]));', [activeWebhookIds]);
        await client.query('DELETE FROM webhooks WHERE NOT (id = ANY($1::bigint[]));', [activeWebhookIds]);
      } else {
        await client.query('DELETE FROM webhook_deliveries WHERE webhook_id IS NOT NULL;');
        await client.query('DELETE FROM webhooks;');
      }

      for (const w of state.webhooks) {
        await client.query(
          `
          INSERT INTO webhooks (id, user_id, name, masked_url, raw_url, alert_on_down, alert_on_recovery, alert_on_ssl_expiry, active, failure_count, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamptz, NOW()), COALESCE($12::timestamptz, NOW()))
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            masked_url = EXCLUDED.masked_url,
            raw_url = EXCLUDED.raw_url,
            active = EXCLUDED.active,
            failure_count = EXCLUDED.failure_count,
            updated_at = NOW();
          `,
          [
            w.id,
            w.user_id || 1,
            w.name,
            w.masked_url || '',
            w.raw_url || w.masked_url || '',
            w.alert_on_down !== false,
            w.alert_on_recovery !== false,
            w.alert_on_ssl_expiry !== false,
            w.active !== false,
            w.failure_count || 0,
            w.created_at || null,
            w.updated_at || null,
          ]
        );
      }
    }

    // 6. Sync Status Page Config
    if (state.statusPageConfig && state.statusPageConfig.slug) {
      const sp = state.statusPageConfig;
      await client.query(
        `
        INSERT INTO status_page_config (slug, user_id, title, description, logo_url, published, email_subscriptions_enabled, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          logo_url = EXCLUDED.logo_url,
          published = EXCLUDED.published,
          email_subscriptions_enabled = EXCLUDED.email_subscriptions_enabled,
          updated_at = NOW();
        `,
        [
          sp.slug,
          sp.user_id || 1,
          sp.title || 'Service Status',
          sp.description || null,
          sp.logo_url || null,
          sp.published !== false,
          sp.email_subscriptions_enabled !== false,
        ]
      );
    }

    // 7. Sync Status Subscribers
    if (Array.isArray(state.statusSubscribers)) {
      const activeSubIds = state.statusSubscribers.map(s => Number(s.id)).filter(id => !isNaN(id));
      if (activeSubIds.length > 0) {
        await client.query('DELETE FROM status_subscribers WHERE NOT (id = ANY($1::bigint[]));', [activeSubIds]);
      } else {
        await client.query('DELETE FROM status_subscribers;');
      }

      for (const sub of state.statusSubscribers) {
        await client.query(
          `
          INSERT INTO status_subscribers (id, email, confirmed, active, created_at, last_notified_at)
          VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()), $6::timestamptz)
          ON CONFLICT (id) DO NOTHING;
          `,
          [
            sub.id,
            sub.email,
            Boolean(sub.confirmed),
            sub.active !== false,
            sub.created_at || null,
            sub.last_notified_at || null,
          ]
        );
      }
    }

    // 8. Sync Alert Deliveries
    if (state.alertDeliveries && state.alertDeliveries.length > 0) {
      const recentAlerts = state.alertDeliveries.slice(0, 20);
      for (const ad of recentAlerts) {
        await client.query(
          `
          INSERT INTO alert_deliveries (id, monitor_id, recipient, kind, status, provider_id, error, created_at, sent_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()), $9::timestamptz)
          ON CONFLICT (id) DO NOTHING;
          `,
          [
            ad.id,
            ad.monitor_id || null,
            ad.recipient,
            ad.kind || 'down',
            ad.status || 'sent',
            ad.provider_id || null,
            ad.error || null,
            ad.created_at || null,
            ad.sent_at || null,
          ]
        );
      }
    }

    const duration = Date.now() - syncStartTime;
    observability.recordSupabaseQuery(duration, true);
    console.log(`[Supabase Dual-Write] Synchronized state to Supabase PostgreSQL successfully (${duration}ms).`);
  } catch (err: any) {
    observability.recordSupabaseQuery(0, false, err?.message || String(err));
    console.error('[Supabase Dual-Write] Warning during state sync:', err.message);
  } finally {
    client.release();
  }
}

/**
 * Debounced background sync to Supabase.
 * Does not block HTTP responses or synthetic check scheduling.
 */
export function scheduleStateSaveToSupabase(state: PersistentStoreState) {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }

  saveDebounceTimer = setTimeout(async () => {
    saveDebounceTimer = null;
    try {
      await syncStateToSupabase(state);
    } catch (err: any) {
      console.warn('[Supabase Dual-Write] Sync failed:', err.message);
    }
  }, 1800);
}

/**
 * Loads all persistent data from Supabase PostgreSQL.
 * Returns null if Supabase is unavailable or empty.
 */
export async function loadStateFromSupabase(): Promise<PersistentStoreState | null> {
  const pool = getSupabasePool();
  if (!pool) return null;

  try {
    const [usersRes, monitorsRes, checksRes, incidentsRes, unifiedRes, webhooksRes, spRes, subsRes, alertsRes] = await Promise.all([
      pool.query('SELECT * FROM users ORDER BY id ASC;'),
      pool.query('SELECT * FROM monitors ORDER BY id ASC;'),
      pool.query('SELECT * FROM checks ORDER BY checked_at DESC LIMIT 150;'),
      pool.query('SELECT * FROM incidents ORDER BY started_at DESC LIMIT 50;'),
      pool.query('SELECT * FROM unified_incidents ORDER BY started_at DESC LIMIT 50;'),
      pool.query('SELECT * FROM webhooks ORDER BY id ASC;'),
      pool.query('SELECT * FROM status_page_config LIMIT 1;'),
      pool.query('SELECT * FROM status_subscribers ORDER BY id ASC;'),
      pool.query('SELECT * FROM alert_deliveries ORDER BY created_at DESC LIMIT 50;'),
    ]);

    if (usersRes.rows.length === 0 && monitorsRes.rows.length === 0) {
      return null;
    }

      console.log(`[Supabase] Loaded state from PostgreSQL (${monitorsRes.rows.length} monitors, ${usersRes.rows.length} users).`);

      return {
        users: usersRes.rows.map(u => ({
          ...u,
          id: Number(u.id),
          token_version: Number(u.token_version || 1),
        })),
        monitors: monitorsRes.rows.map(m => ({
          ...m,
          id: Number(m.id),
          user_id: Number(m.user_id || 1),
          interval_minutes: Number(m.interval_minutes || 1),
          response_time: Number(m.response_time || 0),
          uptime: Number(m.uptime || 100.0),
        })),
        checks: checksRes.rows.map(c => ({
          ...c,
          id: Number(c.id),
          monitor_id: c.monitor_id ? Number(c.monitor_id) : null,
          response_time: Number(c.response_time || 0),
          status_code: c.status_code ? Number(c.status_code) : null,
        })),
        incidents: incidentsRes.rows.map(i => ({
          ...i,
          id: Number(i.id),
          monitor_id: i.monitor_id ? Number(i.monitor_id) : null,
        })),
        unifiedIncidents: unifiedRes.rows.map(ui => ({
          ...ui,
          id: String(ui.id),
          user_id: ui.user_id ? Number(ui.user_id) : 1,
          record_id: ui.record_id ? Number(ui.record_id) : null,
          monitor_ids: Array.isArray(ui.monitor_ids) ? ui.monitor_ids : [],
          affected_services: Array.isArray(ui.affected_services) ? ui.affected_services : [],
          service_urls: Array.isArray(ui.service_urls) ? ui.service_urls : [],
          activity: Array.isArray(ui.activity) ? ui.activity : [],
        })),
        webhooks: webhooksRes.rows.map(w => ({
          ...w,
          id: Number(w.id),
          user_id: Number(w.user_id || 1),
        })),
        statusPageConfig: spRes.rows[0] || {},
        statusSubscribers: subsRes.rows.map(s => ({
          ...s,
          id: Number(s.id),
        })),
        alertDeliveries: alertsRes.rows.map(a => ({
          ...a,
          id: Number(a.id),
          monitor_id: a.monitor_id ? Number(a.monitor_id) : null,
        })),
      };
  } catch (err: any) {
    console.warn('[Supabase] Could not load state from PostgreSQL:', err.message);
    return null;
  }
}

/**
 * Explicitly deletes a monitor and related records from Supabase PostgreSQL.
 */
export async function deleteMonitorFromSupabase(id: number): Promise<void> {
  const pool = getSupabasePool();
  if (!pool) return;
  try {
    await pool.query('DELETE FROM checks WHERE monitor_id = $1;', [id]);
    await pool.query('DELETE FROM incidents WHERE monitor_id = $1;', [id]);
    await pool.query('DELETE FROM monitors WHERE id = $1;', [id]);
    console.log(`[Supabase] Explicitly deleted monitor ${id} from PostgreSQL database.`);
  } catch (err: any) {
    console.error(`[Supabase] Failed to delete monitor ${id}:`, err.message);
  }
}

/**
 * Explicitly deletes a webhook from Supabase PostgreSQL.
 */
export async function deleteWebhookFromSupabase(id: number): Promise<void> {
  const pool = getSupabasePool();
  if (!pool) return;
  try {
    await pool.query('DELETE FROM webhook_deliveries WHERE webhook_id = $1;', [id]);
    await pool.query('DELETE FROM webhooks WHERE id = $1;', [id]);
    console.log(`[Supabase] Explicitly deleted webhook ${id} from PostgreSQL database.`);
  } catch (err: any) {
    console.error(`[Supabase] Failed to delete webhook ${id}:`, err.message);
  }
}

/**
 * Explicitly deletes a status subscriber from Supabase PostgreSQL.
 */
export async function deleteSubscriberFromSupabase(id: number): Promise<void> {
  const pool = getSupabasePool();
  if (!pool) return;
  try {
    await pool.query('DELETE FROM status_subscribers WHERE id = $1;', [id]);
    console.log(`[Supabase] Explicitly deleted subscriber ${id} from PostgreSQL database.`);
  } catch (err: any) {
    console.error(`[Supabase] Failed to delete subscriber ${id}:`, err.message);
  }
}

/**
 * Explicitly deletes a user and their owned monitors from Supabase PostgreSQL.
 */
export async function deleteUserFromSupabase(userId: number): Promise<void> {
  const pool = getSupabasePool();
  if (!pool) return;
  try {
    await pool.query('DELETE FROM monitors WHERE user_id = $1;', [userId]);
    await pool.query('DELETE FROM webhooks WHERE user_id = $1;', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1;', [userId]);
    console.log(`[Supabase] Explicitly deleted user ${userId} and owned resources.`);
  } catch (err: any) {
    console.error(`[Supabase] Failed to delete user ${userId}:`, err.message);
  }
}
