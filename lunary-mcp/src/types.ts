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
  return {
    ...(params.time_range && { range: params.time_range }),
    ...(params.start && { start: params.start }),
    ...(params.end && { end: params.end }),
  };
}
