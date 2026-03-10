import { z } from 'zod';

export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
};

export function jsonResult(data: unknown): ToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function errorResult(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: `Error: ${message}` }],
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
