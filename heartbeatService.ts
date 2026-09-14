import { randomBytes } from 'node:crypto';

export interface Heartbeat {
  id: string; // e.g. "hb_3a8f19bc"
  user_id: number;
  name: string; // e.g. "Nightly Postgres Backup"
  slug: string;
  token: string; // secret ping token, e.g. "hb_3a8f19bc7e"
  period_seconds: number; // e.g. 86400 (24h)
  grace_seconds: number; // e.g. 1800 (30m)
  status: 'up' | 'late' | 'down' | 'pending' | 'paused';
  last_ping_at: string | null;
  last_ping_ip?: string | null;
  last_ping_duration_ms?: number | null;
  last_ping_status?: 'success' | 'fail';
  last_ping_body?: string | null;
  started_at?: string | null; // For jobs using /start
  alert_on_miss: boolean;
  alert_sent: boolean;
  miss_count: number;
  hit_count: number;
  created_at: string;
  updated_at: string;
}

export interface HeartbeatPing {
  id: string;
  heartbeat_id: string;
  pinged_at: string;
  ip?: string | null;
  status: 'success' | 'fail';
  duration_ms?: number | null;
  body?: string | null;
  user_agent?: string | null;
}

export function generateHeartbeatToken(): string {
  return `hb_${randomBytes(8).toString('hex')}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'job';
}

/**
 * Calculates human-readable remaining time until expected deadline or overdue status.
 */
export function calculateHeartbeatTiming(hb: Heartbeat, nowMs: number = Date.now()): {
  expected_at: string | null;
  grace_deadline_at: string | null;
  is_overdue: boolean;
  is_in_grace: boolean;
  seconds_until_expected: number | null;
  seconds_overdue: number | null;
} {
  if (!hb.last_ping_at || hb.status === 'pending' || hb.status === 'paused') {
    return {
      expected_at: null,
      grace_deadline_at: null,
      is_overdue: false,
      is_in_grace: false,
      seconds_until_expected: null,
      seconds_overdue: null,
    };
  }

  const lastPingMs = new Date(hb.last_ping_at).getTime();
  const expectedMs = lastPingMs + hb.period_seconds * 1000;
  const graceDeadlineMs = expectedMs + hb.grace_seconds * 1000;

  const diffExpected = Math.round((expectedMs - nowMs) / 1000);
  const diffGrace = Math.round((graceDeadlineMs - nowMs) / 1000);

  const isOverdue = nowMs > graceDeadlineMs;
  const isInGrace = nowMs > expectedMs && !isOverdue;

  return {
    expected_at: new Date(expectedMs).toISOString(),
    grace_deadline_at: new Date(graceDeadlineMs).toISOString(),
    is_overdue: isOverdue,
    is_in_grace: isInGrace,
    seconds_until_expected: diffExpected,
    seconds_overdue: isOverdue ? Math.abs(diffGrace) : null,
  };
}
