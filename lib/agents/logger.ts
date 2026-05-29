/**
 * Tiny structured logger for the content pipeline. Every line is prefixed with
 * the run id and the step so logs from concurrent runs stay readable, and a
 * full transcript is kept in-memory so the orchestrator can persist it onto the
 * AgentRun document.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  ts: string;
  level: LogLevel;
  step: string;
  message: string;
}

export class Logger {
  readonly entries: LogEntry[] = [];

  constructor(private readonly runId: string, private step = "init") {}

  /** Returns a child logger pinned to a step name (chainable). */
  forStep(step: string): Logger {
    this.step = step;
    return this;
  }

  private write(level: LogLevel, message: string) {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      step: this.step,
      message,
    };
    this.entries.push(entry);
    const line = `[${entry.ts}] [${this.runId.slice(0, 8)}] [${entry.step}] ${message}`;
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }

  info(message: string) {
    this.write("info", message);
  }
  warn(message: string) {
    this.write("warn", message);
  }
  error(message: string) {
    this.write("error", message);
  }
  debug(message: string) {
    if (process.env.AGENT_DEBUG === "1") this.write("debug", message);
  }
}
