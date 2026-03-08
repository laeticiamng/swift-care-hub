/**
 * Lightweight error reporter that sends errors to the log-error Edge Function.
 * Used by ErrorBoundary, global handlers, and can be called manually.
 *
 * Generates a trace_id per page session and propagates it to edge functions
 * via the X-Trace-Id header for end-to-end correlation.
 */

const LOG_ERROR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-error`;

/** Stable trace_id for the current page session (reset on full reload). */
const SESSION_TRACE_ID = crypto.randomUUID();

/** Get the current session trace_id (useful for logging in components). */
export function getTraceId(): string {
  return SESSION_TRACE_ID;
}

interface ErrorReport {
  source: 'frontend' | 'edge-function';
  message: string;
  stack?: string | null;
  url?: string;
  user_agent?: string;
  function_name?: string;
  trace_id?: string;
  metadata?: Record<string, unknown>;
}

let _reportQueue: ErrorReport[] = [];
let _flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  const batch = _reportQueue.splice(0, 10);
  _flushTimer = null;

  for (const report of batch) {
    try {
      // Fire-and-forget — never block the UI
      fetch(LOG_ERROR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'X-Trace-Id': SESSION_TRACE_ID,
        },
        body: JSON.stringify({ ...report, trace_id: SESSION_TRACE_ID }),
      }).catch(() => {
        // Silent fail — we don't want error reporting to cause errors
      });
    } catch {
      // Silent fail
    }
  }
}

function enqueue(report: ErrorReport) {
  _reportQueue.push(report);
  // Debounce: flush after 1s or when batch reaches 5
  if (_reportQueue.length >= 5) {
    if (_flushTimer) clearTimeout(_flushTimer);
    flush();
  } else if (!_flushTimer) {
    _flushTimer = setTimeout(flush, 1000);
  }
}

/**
 * Report an error to the tracking system.
 */
export function reportError(error: Error | string, metadata?: Record<string, unknown>) {
  const err = typeof error === 'string' ? new Error(error) : error;
  enqueue({
    source: 'frontend',
    message: err.message || String(error),
    stack: err.stack ?? null,
    url: window.location.href,
    user_agent: navigator.userAgent,
    metadata,
  });
}

/**
 * Install global error handlers (call once in main.tsx).
 */
export function installGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, {
      type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    enqueue({
      source: 'frontend',
      message,
      stack: stack ?? null,
      url: window.location.href,
      user_agent: navigator.userAgent,
      metadata: { type: 'unhandled_rejection' },
    });
  });
}
