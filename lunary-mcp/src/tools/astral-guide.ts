import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

export function registerAstralGuideTools(server: McpServer) {
  server.tool(
    'astral_chat',
    'Chat with the Astral Guide AI — ask astrological questions on behalf of a user. Returns the AI response, thread ID, and metadata.',
    {
      message: z.string().describe('The message to send to the Astral Guide'),
      email: z
        .string()
        .optional()
        .describe('User email (provide email or user_id)'),
      user_id: z
        .string()
        .optional()
        .describe('User UUID (provide email or user_id)'),
      thread_id: z
        .string()
        .optional()
        .describe('Existing thread ID to continue a conversation'),
      mode: z
        .string()
        .optional()
        .describe(
          'Chat mode: "astral" for astrological, "general" for general, or auto-detect',
        ),
    },
    async (params) => {
      try {
        const data = await lunary('/astral-guide/chat', {
          method: 'POST',
          body: {
            message: params.message,
            email: params.email,
            userId: params.user_id,
            threadId: params.thread_id,
            mode: params.mode,
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_astral_context',
    'Get the raw astrological context for a user — birth chart, transits, moon phase, tarot — without sending a chat message. Useful for inspecting what the AI "sees".',
    {
      email: z
        .string()
        .optional()
        .describe('User email (provide email or user_id)'),
      user_id: z
        .string()
        .optional()
        .describe('User UUID (provide email or user_id)'),
      include_personal_transits: z
        .boolean()
        .optional()
        .describe('Include personal transit calculations (default true)'),
      include_patterns: z
        .boolean()
        .optional()
        .describe(
          'Include natal aspect patterns like Grand Trines, T-Squares (default false)',
        ),
    },
    async (params) => {
      try {
        const data = await lunary('/astral-guide/context', {
          method: 'POST',
          body: {
            email: params.email,
            userId: params.user_id,
            includePersonalTransits: params.include_personal_transits ?? true,
            includePatterns: params.include_patterns ?? false,
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'list_chat_threads',
    'List chat threads for a user — shows thread IDs, titles, dates, and message counts',
    {
      email: z
        .string()
        .optional()
        .describe('User email (provide email or user_id)'),
      user_id: z
        .string()
        .optional()
        .describe('User UUID (provide email or user_id)'),
      limit: z
        .number()
        .optional()
        .describe('Max threads to return (default 20, max 100)'),
    },
    async (params) => {
      try {
        const data = await lunary('/astral-guide/threads', {
          params: {
            email: params.email,
            user_id: params.user_id,
            limit: params.limit?.toString(),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_chat_thread',
    'Get a specific chat thread with full message history',
    {
      thread_id: z.string().describe('The thread UUID to retrieve'),
    },
    async (params) => {
      try {
        const data = await lunary(`/astral-guide/threads/${params.thread_id}`);
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
