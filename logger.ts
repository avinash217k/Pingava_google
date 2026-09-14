import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export interface LogContext {
  correlationId: string;
  userId?: number;
  email?: string;
  path?: string;
  method?: string;
  traceId?: string;
  [key: string]: any;
}

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

const GCP_PROJECT_ID = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'project-f5f8108d-d38c-4d2e-97f';

/**
 * Runs a function within an asynchronous logging context.
 */
export function runWithContext<T>(context: LogContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

/**
 * Retrieves the current correlation context, or generates a standalone fallback.
 */
export function getLogContext(): LogContext {
  return asyncLocalStorage.getStore() || { correlationId: `sys_${randomUUID()}` };
}

/**
 * Attaches additional metadata (such as userId, userEmail) to the active transaction.
 */
export function updateLogContext(fields: Partial<LogContext>): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    Object.assign(store, fields);
  }
}

/**
 * Formats a log record for Google Cloud Logging stdout ingestion.
 */
function emitLog(severity: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR', message: string, meta?: Record<string, any>, error?: any) {
  const context = getLogContext();
  const timestamp = new Date().toISOString();

  const logPayload: Record<string, any> = {
    severity,
    message,
    correlation_id: context.correlationId,
    timestamp,
    ...meta
  };

  if (context.userId) logPayload.user_id = context.userId;
  if (context.email) logPayload.user_email = context.email;
  if (context.path) logPayload.http_path = context.path;
  if (context.method) logPayload.http_method = context.method;

  // Link log to Google Cloud Trace if traceId is available
  if (context.traceId && GCP_PROJECT_ID) {
    logPayload['logging.googleapis.com/trace'] = `projects/${GCP_PROJECT_ID}/traces/${context.traceId}`;
  }

  // Google Cloud Error Reporting looks for @type or stack trace
  if (error) {
    logPayload.error_name = error?.name || 'Error';
    logPayload.error_message = error?.message || String(error);
    logPayload.stack_trace = error?.stack || String(error);
  }

  const output = JSON.stringify(logPayload);
  if (severity === 'ERROR') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, any>) => emitLog('DEBUG', message, meta),
  info: (message: string, meta?: Record<string, any>) => emitLog('INFO', message, meta),
  warn: (message: string, meta?: Record<string, any>) => emitLog('WARNING', message, meta),
  error: (message: string, error?: any, meta?: Record<string, any>) => emitLog('ERROR', message, meta, error),

  /**
   * Express middleware to initialize correlation IDs and response headers.
   */
  middleware: (req: any, res: any, next: () => void) => {
    const traceHeader = req.headers['x-cloud-trace-context'] as string | undefined;
    const traceId = traceHeader ? traceHeader.split('/')[0] : undefined;
    const incomingId = req.headers['x-request-id'] as string | undefined;
    const correlationId = incomingId || `req_${randomUUID()}`;

    req.id = correlationId;
    res.setHeader('X-Request-Id', correlationId);

    const start = Date.now();
    const context: LogContext = {
      correlationId,
      path: req.path,
      method: req.method,
      traceId
    };

    res.on('finish', () => {
      // Automatically log all API routes or any failing status codes
      if (req.path.startsWith('/api') || res.statusCode >= 400) {
        const duration = Date.now() - start;
        const severity = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARNING' : 'INFO';
        runWithContext(context, () => {
          emitLog(severity, `${req.method} ${req.originalUrl || req.url} ${res.statusCode} (${duration}ms)`, {
            status_code: res.statusCode,
            duration_ms: duration,
            ip: req.ip || req.headers['x-forwarded-for']
          });
        });
      }
    });

    runWithContext(context, next);
  }
};
