/**
 * Sanitizes values before logging to prevent log injection attacks.
 * Replaces newlines and other control characters that could be used for log forgery.
 */
export function sanitizeForLog(value: unknown): string {
  const str = String(value);
  // Replace newlines, carriage returns, and other control characters
  return str
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove other control characters
}

/**
 * Safely logs an object by sanitizing all string values.
 */
export function sanitizeObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeForLog(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
