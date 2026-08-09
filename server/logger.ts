// Structured Logger helper for production hygiene

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export function log(level: LogLevel, message: string, meta?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  if (level === LogLevel.ERROR) {
    console.error(JSON.stringify(payload));
  } else if (level === LogLevel.WARN) {
    console.warn(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, any>) => log(LogLevel.INFO, msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => log(LogLevel.WARN, msg, meta),
  error: (msg: string, meta?: Record<string, any>) => log(LogLevel.ERROR, msg, meta),
};
