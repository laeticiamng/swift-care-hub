/**
 * Structured JSON logger for Edge Functions.
 * All logs are emitted as single-line JSON for aggregator compatibility.
 *
 * Usage:
 *   import { createLogger } from "../_shared/logger.ts";
 *   const log = createLogger("my-function");
 *   const end = log.start(req);          // logs request start, returns finalizer
 *   // ... do work ...
 *   end(response.status);                // logs request end with duration_ms
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

function emit(level: LogLevel, fn: string, message: string, meta?: Record<string, unknown>) {
  const entry: Record<string, unknown> = {
    level,
    message,
    function_name: fn,
    ts: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function createLogger(functionName: string) {
  const requestId = () => crypto.randomUUID().slice(0, 8);

  return {
    info: (msg: string, meta?: Record<string, unknown>) => emit("info", functionName, msg, meta),
    warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", functionName, msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) => emit("error", functionName, msg, meta),
    debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", functionName, msg, meta),

    /** Call at request start. Returns a finalizer `end(statusCode)` that logs duration. */
    start(req: Request) {
      const rid = requestId();
      const t0 = performance.now();
      const url = new URL(req.url);
      emit("info", functionName, "request_start", {
        request_id: rid,
        method: req.method,
        path: url.pathname,
      });

      return (status: number, extra?: Record<string, unknown>) => {
        const duration_ms = Math.round(performance.now() - t0);
        emit("info", functionName, "request_end", {
          request_id: rid,
          status,
          duration_ms,
          ...extra,
        });
      };
    },
  };
}
