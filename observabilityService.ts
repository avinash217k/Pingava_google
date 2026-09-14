/**
 * Pingava Self-Observability & Meta-Monitoring Watchdog Service
 * "Monitoring the Monitor": Tracks internal engine health, check execution rates,
 * database latencies, notification reliability, and backend exceptions.
 */

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
    pool_total?: number;
    pool_idle?: number;
    pool_waiting?: number;
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

class ObservabilityService {
  private exceptions: InternalException[] = [];
  private maxExceptions = 100;

  // Worker loop metrics
  private lastWorkerTickAt: number = Date.now();
  private workerTickCount = 0;
  private expectedWorkerIntervalMs = 20000;
  private eventLoopLagMs = 0;

  // Check execution counters
  private hourlyExecutedChecks: number[] = []; // Timestamps of checks in last 60m
  private todayExecutedCount = 0;

  // Database metrics
  private supabaseLatencyMs: number | null = null;
  private supabaseQueriesTotal = 0;
  private supabaseQueriesFailed = 0;
  private supabaseConsecutiveErrors = 0;

  private firestoreLatencyMs: number | null = null;
  private firestoreWritesTotal = 0;
  private firestoreWritesFailed = 0;
  private firestoreConsecutiveErrors = 0;

  // Notifications
  private emailAttempted = 0;
  private emailSent = 0;
  private emailFailed = 0;
  private emailLastSentAt: string | null = null;
  private emailLastFailedAt: string | null = null;
  private emailLastError: string | null = null;

  private webhookAttempted = 0;
  private webhookSent = 0;
  private webhookFailed = 0;
  private webhookLastSentAt: string | null = null;
  private webhookLastFailedAt: string | null = null;
  private webhookLastError: string | null = null;

  // Watchdog state
  private activeAlerts: string[] = [];
  private lastWatchdogEvalAt: string = new Date().toISOString();
  private alertDispatchCallback: ((alert: { severity: 'warning' | 'critical'; title: string; message: string }) => Promise<void>) | null = null;

  constructor() {
    this.startEventLoopLagMonitor();
  }

  /**
   * Registers a callback to trigger real-time Meta-Guardian alerts to the owner.
   */
  public setAlertDispatcher(fn: (alert: { severity: 'warning' | 'critical'; title: string; message: string }) => Promise<void>) {
    this.alertDispatchCallback = fn;
  }

  private startEventLoopLagMonitor() {
    let start = Date.now();
    setInterval(() => {
      const now = Date.now();
      this.eventLoopLagMs = Math.max(0, now - start - 1000);
      start = now;
    }, 1000).unref();
  }

  // -------------------------------------------------------------
  // EXCEPTION RECORDING
  // -------------------------------------------------------------
  public recordException(err: Error | any, meta: { endpoint?: string; method?: string; status_code?: number; correlation_id?: string; level?: 'ERROR' | 'FATAL' | 'WARN' } = {}) {
    const item: InternalException = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      level: meta.level || 'ERROR',
      message: err?.message || String(err),
      stack: err?.stack,
      endpoint: meta.endpoint,
      method: meta.method,
      status_code: meta.status_code,
      correlation_id: meta.correlation_id,
    };

    this.exceptions.unshift(item);
    if (this.exceptions.length > this.maxExceptions) {
      this.exceptions.pop();
    }
  }

  public clearExceptions() {
    this.exceptions = [];
  }

  // -------------------------------------------------------------
  // WORKER LOOP & CHECK EXECUTION TRACKING
  // -------------------------------------------------------------
  public recordWorkerTick() {
    this.lastWorkerTickAt = Date.now();
    this.workerTickCount++;
  }

  public recordCheckExecuted(count: number = 1) {
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      this.hourlyExecutedChecks.push(now);
    }
    this.todayExecutedCount += count;
  }

  // -------------------------------------------------------------
  // DATABASE DUAL-WRITE TELEMETRY
  // -------------------------------------------------------------
  public recordSupabaseQuery(durationMs: number, success: boolean, errorMsg?: string) {
    this.supabaseQueriesTotal++;
    if (success) {
      this.supabaseLatencyMs = Math.round(durationMs);
      this.supabaseConsecutiveErrors = 0;
    } else {
      this.supabaseQueriesFailed++;
      this.supabaseConsecutiveErrors++;
      if (errorMsg) {
        this.recordException(new Error(`Supabase Database Error: ${errorMsg}`), { level: 'WARN' });
      }
    }
  }

  public recordFirestoreWrite(durationMs: number, success: boolean, errorMsg?: string) {
    this.firestoreWritesTotal++;
    if (success) {
      this.firestoreLatencyMs = Math.round(durationMs);
      this.firestoreConsecutiveErrors = 0;
    } else {
      this.firestoreWritesFailed++;
      this.firestoreConsecutiveErrors++;
      if (errorMsg) {
        this.recordException(new Error(`Firestore Database Error: ${errorMsg}`), { level: 'WARN' });
      }
    }
  }

  // -------------------------------------------------------------
  // NOTIFICATION TELEMETRY
  // -------------------------------------------------------------
  public recordEmailAttempt(success: boolean, errorMsg?: string) {
    this.emailAttempted++;
    const now = new Date().toISOString();
    if (success) {
      this.emailSent++;
      this.emailLastSentAt = now;
    } else {
      this.emailFailed++;
      this.emailLastFailedAt = now;
      this.emailLastError = errorMsg || 'Unknown email delivery failure';
      this.recordException(new Error(`Email Dispatch Failure: ${this.emailLastError}`), { level: 'WARN' });
    }
  }

  public recordWebhookAttempt(success: boolean, errorMsg?: string) {
    this.webhookAttempted++;
    const now = new Date().toISOString();
    if (success) {
      this.webhookSent++;
      this.webhookLastSentAt = now;
    } else {
      this.webhookFailed++;
      this.webhookLastFailedAt = now;
      this.webhookLastError = errorMsg || 'Unknown webhook dispatch failure';
      this.recordException(new Error(`Webhook Dispatch Failure: ${this.webhookLastError}`), { level: 'WARN' });
    }
  }

  // -------------------------------------------------------------
  // WATCHDOG EVALUATION ("META-GUARDIAN")
  // -------------------------------------------------------------
  public evaluateMetaGuardian(monitors: any[]): MetaGuardianStatus {
    this.lastWatchdogEvalAt = new Date().toISOString();
    const activeMonitors = monitors.filter(m => m.status !== 'paused');
    const alerts: string[] = [];

    // 1. Check if worker loop has stalled
    const msSinceLastTick = Date.now() - this.lastWorkerTickAt;
    if (activeMonitors.length > 0 && msSinceLastTick > 60000) {
      alerts.push(`CRITICAL: Monitoring loop has stalled! No checks executed for ${Math.round(msSinceLastTick / 1000)}s.`);
    }

    // 2. Check for overdue monitors
    const now = Date.now();
    const overdueList: string[] = [];
    for (const m of activeMonitors) {
      const intervalMs = (m.interval_minutes || 5) * 60 * 1000;
      const lastCheckTime = m.last_checked_at ? new Date(m.last_checked_at).getTime() : 0;
      if (lastCheckTime > 0 && now - lastCheckTime > intervalMs * 2.5) {
        overdueList.push(m.name);
      }
    }
    if (overdueList.length >= 3) {
      alerts.push(`WARNING: ${overdueList.length} monitors are severely overdue health checks (${overdueList.slice(0, 3).join(', ')}).`);
    }

    // 3. Check for consecutive database failures
    if (this.supabaseConsecutiveErrors >= 3) {
      alerts.push(`CRITICAL: Supabase PostgreSQL has sustained ${this.supabaseConsecutiveErrors} consecutive write failures.`);
    }
    if (this.firestoreConsecutiveErrors >= 3) {
      alerts.push(`CRITICAL: Firestore Cloud Database has sustained ${this.firestoreConsecutiveErrors} consecutive write failures.`);
    }

    // 4. Check for high email failure rate
    if (this.emailAttempted >= 5) {
      const failRate = (this.emailFailed / this.emailAttempted) * 100;
      if (failRate > 50) {
        alerts.push(`WARNING: Alert email delivery failure rate is ${failRate.toFixed(1)}% (${this.emailFailed}/${this.emailAttempted} failed).`);
      }
    }

    const previousHadAlerts = this.activeAlerts.length > 0;
    this.activeAlerts = alerts;

    const overallHealth: 'healthy' | 'warning' | 'critical' =
      alerts.some(a => a.startsWith('CRITICAL')) ? 'critical' : alerts.length > 0 ? 'warning' : 'healthy';

    // Dispatch Meta-Guardian alert if critical condition arises
    if (alerts.length > 0 && this.alertDispatchCallback) {
      const criticalAlert = alerts.find(a => a.startsWith('CRITICAL')) || alerts[0];
      void this.alertDispatchCallback({
        severity: overallHealth === 'critical' ? 'critical' : 'warning',
        title: `[Pingava Engine ${overallHealth.toUpperCase()}] Meta-Guardian Alert`,
        message: alerts.join('\n'),
      }).catch(() => {});
    } else if (previousHadAlerts && alerts.length === 0 && this.alertDispatchCallback) {
      // Auto-recovery notification
      void this.alertDispatchCallback({
        severity: 'warning',
        title: `[Pingava Engine RECOVERED] Meta-Guardian Normal Operations Restored`,
        message: 'All engine subsystems, worker loops, and databases have returned to healthy baseline operation.',
      }).catch(() => {});
    }

    return {
      overall_health: overallHealth,
      watchdog_active: true,
      last_evaluated_at: this.lastWatchdogEvalAt,
      active_alerts: alerts,
    };
  }

  // -------------------------------------------------------------
  // FULL SNAPSHOT GENERATION
  // -------------------------------------------------------------
  public getSnapshot(monitors: any[]): ObservabilitySnapshot {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    this.hourlyExecutedChecks = this.hourlyExecutedChecks.filter(t => t >= oneHourAgo);

    const activeMonitors = monitors.filter(m => m.status !== 'paused');

    // Calculate expected checks per hour: Sum(60 / interval_minutes)
    const expectedHourly = Math.round(
      activeMonitors.reduce((sum, m) => sum + 60 / Math.max(1, m.interval_minutes || 5), 0)
    );
    const executedHourly = this.hourlyExecutedChecks.length;
    const executionRatePct = expectedHourly > 0
      ? Math.min(100, Math.round((executedHourly / expectedHourly) * 100))
      : 100;

    // Check for overdue monitors
    const overdueMonitors: Array<{ id: number; name: string; url: string; overdue_by_seconds: number }> = [];
    for (const m of activeMonitors) {
      const intervalMs = (m.interval_minutes || 5) * 60 * 1000;
      const lastCheckTime = m.last_checked_at ? new Date(m.last_checked_at).getTime() : 0;
      if (lastCheckTime > 0 && now - lastCheckTime > intervalMs * 2) {
        overdueMonitors.push({
          id: m.id,
          name: m.name,
          url: m.url,
          overdue_by_seconds: Math.round((now - lastCheckTime - intervalMs) / 1000),
        });
      }
    }

    const msSinceTick = now - this.lastWorkerTickAt;
    const workerStatus: 'healthy' | 'delayed' | 'stalled' =
      msSinceTick > 60000 ? 'stalled' : msSinceTick > 35000 ? 'delayed' : 'healthy';

    const mem = process.memoryUsage();

    return {
      timestamp: new Date().toISOString(),
      meta_guardian: this.evaluateMetaGuardian(monitors),
      worker_loop: {
        status: workerStatus,
        last_tick_at: new Date(this.lastWorkerTickAt).toISOString(),
        tick_interval_ms: this.expectedWorkerIntervalMs,
        total_ticks: this.workerTickCount,
        event_loop_lag_ms: this.eventLoopLagMs,
      },
      checks: {
        expected_hourly: expectedHourly,
        executed_hourly: executedHourly,
        executed_today: this.todayExecutedCount,
        execution_rate_pct: executionRatePct,
        overdue_monitors_count: overdueMonitors.length,
        overdue_monitors: overdueMonitors,
      },
      databases: {
        supabase: {
          status: this.supabaseConsecutiveErrors >= 3 ? 'disconnected' : this.supabaseConsecutiveErrors > 0 ? 'degraded' : 'connected',
          latency_ms: this.supabaseLatencyMs,
          total_queries: this.supabaseQueriesTotal,
          failed_queries: this.supabaseQueriesFailed,
          consecutive_errors: this.supabaseConsecutiveErrors,
        },
        firestore: {
          status: this.firestoreConsecutiveErrors >= 3 ? 'disconnected' : this.firestoreConsecutiveErrors > 0 ? 'degraded' : 'connected',
          last_write_latency_ms: this.firestoreLatencyMs,
          total_writes: this.firestoreWritesTotal,
          failed_writes: this.firestoreWritesFailed,
          consecutive_errors: this.firestoreConsecutiveErrors,
        },
      },
      notifications: {
        email: {
          provider: 'brevo_smtp',
          attempted: this.emailAttempted,
          sent: this.emailSent,
          failed: this.emailFailed,
          failure_rate_pct: this.emailAttempted > 0 ? Math.round((this.emailFailed / this.emailAttempted) * 100) : 0,
          last_sent_at: this.emailLastSentAt,
          last_failed_at: this.emailLastFailedAt,
          last_error: this.emailLastError,
        },
        webhooks: {
          attempted: this.webhookAttempted,
          sent: this.webhookSent,
          failed: this.webhookFailed,
          failure_rate_pct: this.webhookAttempted > 0 ? Math.round((this.webhookFailed / this.webhookAttempted) * 100) : 0,
          last_sent_at: this.webhookLastSentAt,
          last_failed_at: this.webhookLastFailedAt,
          last_error: this.webhookLastError,
        },
      },
      process: {
        uptime_seconds: Math.round(process.uptime()),
        memory_rss_bytes: mem.rss,
        memory_heap_used_bytes: mem.heapUsed,
        memory_heap_total_bytes: mem.heapTotal,
        node_version: process.version,
        pid: process.pid,
        cloud_run_revision: process.env.K_REVISION || 'local-dev',
      },
      recent_exceptions: this.exceptions,
    };
  }
}

export const observability = new ObservabilityService();
