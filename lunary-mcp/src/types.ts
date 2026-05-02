import { z } from 'zod';

type ErrorDetails = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ToolResult = {
  isError?: boolean;
  content: Array<{ type: 'text'; text: string }>;
};

export function jsonResult(data: unknown): ToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function statusCategory(status: number) {
  if (status === 401 || status === 403) return 'auth';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'request';
}

export class ToolApiError extends Error {
  constructor(
    message: string,
    public readonly details: ErrorDetails,
  ) {
    super(message);
    this.name = 'ToolApiError';
  }
}

function redactSensitive(value: string) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(
      /([?&](?:api[_-]?key|token|secret|key|password)=)[^&\s]+/gi,
      '$1[redacted]',
    )
    .replace(
      /\b(?:api[_-]?key|token|secret|authorization|password)\b\s*[:=]\s*["']?[^"',\s}]+["']?/gi,
      (match) => match.replace(/[:=].*$/, ': [redacted]'),
    );
}

export function errorResult(error: unknown): ToolResult {
  const message = redactSensitive(
    error instanceof Error ? error.message : String(error),
  );
  const details =
    error &&
    typeof error === 'object' &&
    'details' in error &&
    error.details &&
    typeof error.details === 'object'
      ? error.details
      : undefined;
  const service =
    details &&
    'service' in details &&
    typeof details.service === 'string' &&
    details.service
      ? details.service
      : 'lunary';
  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            ok: false,
            service,
            message,
            ...(details ? { details } : {}),
          },
          null,
          2,
        ),
      },
    ],
  };
}

export const timeParams = {
  time_range: z
    .enum(['7d', '30d', '90d', '365d'])
    .optional()
    .describe('Time window (default 30d)'),
  start: z.string().optional().describe('Custom range start (ISO date)'),
  end: z.string().optional().describe('Custom range end (ISO date)'),
};

export function timeQueryParams(params: {
  time_range?: string;
  start?: string;
  end?: string;
}) {
  const end = params.end ? new Date(params.end) : new Date();
  let start: Date | undefined;

  if (params.start) {
    start = new Date(params.start);
  } else if (params.time_range) {
    const days =
      { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }[params.time_range] ?? 30;
    start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  }

  return {
    ...(start && { start_date: start.toISOString().slice(0, 10) }),
    end_date: end.toISOString().slice(0, 10),
  };
}
