import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

export function registerVideoScriptTools(server: McpServer) {
  server.tool(
    'list_video_scripts',
    'List all video scripts with status and metadata',
    {},
    async () => {
      try {
        const data = await lunary('/video-scripts');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_video_script',
    'Get a specific video script by ID with full content',
    {
      id: z.string().describe('Video script ID'),
    },
    async ({ id }) => {
      try {
        const data = await lunary(`/video-scripts/${id}`);
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'generate_video_script',
    'Generate a new video script using AI',
    {
      topic: z.string().optional().describe('Topic or theme for the video'),
      type: z
        .string()
        .optional()
        .describe(
          'Video type (e.g. daily-horoscope, retrograde-alert, zodiac-deep-dive)',
        ),
      zodiac_sign: z
        .string()
        .optional()
        .describe('Target zodiac sign if applicable'),
    },
    async ({ topic, type, zodiac_sign }) => {
      try {
        const data = await lunary('/video-scripts/generate', {
          method: 'POST',
          body: {
            ...(topic && { topic }),
            ...(type && { type }),
            ...(zodiac_sign && { zodiacSign: zodiac_sign }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'generate_videos',
    'Trigger Remotion video generation from scripts',
    {
      script_ids: z
        .array(z.string())
        .optional()
        .describe(
          'Specific script IDs to render (renders all pending if omitted)',
        ),
    },
    async ({ script_ids }) => {
      try {
        const data = await lunary('/video-scripts/generate-videos', {
          method: 'POST',
          body: {
            ...(script_ids && { scriptIds: script_ids }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'requeue_video',
    'Requeue a single failed video for re-rendering',
    {
      script_id: z.string().describe('Script ID of the video to requeue'),
    },
    async ({ script_id }) => {
      try {
        const data = await lunary('/video-scripts/requeue-single', {
          method: 'POST',
          body: { scriptId: script_id },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
