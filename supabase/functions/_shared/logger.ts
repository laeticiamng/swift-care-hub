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
 *   log.captureError(error);             // persists error to error_logs table
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    /** Persist an error to the error_logs table (fire-and-forget). */
    captureError(err: unknown, meta?: Record<string, unknown>) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      emit("error", functionName, message, meta);

      try {
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        // Fire-and-forget — don't await to avoid slowing down the response
        adminClient.from("error_logs").insert({
          source: "edge-function",
          function_name: functionName,
          message: message.slice(0, 2000),
          stack: stack?.slice(0, 5000) ?? null,
          metadata: meta ?? {},
        }).then(({ error: insertErr }) => {
          if (insertErr) console.error(JSON.stringify({ level: "error", message: "error_logs insert failed", error: insertErr.message }));
        });
      } catch {
        // Silent fail — error tracking should never break the function
      }
    },

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
