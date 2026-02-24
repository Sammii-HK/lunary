import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

export function registerSocialTools(server: McpServer) {
  server.tool(
    'generate_social_posts',
    'AI-generate social media posts for specified platforms',
    {
      topic: z.string().optional().describe('Topic or theme for the posts'),
      platforms: z
        .array(z.string())
        .optional()
        .describe(
          'Target platforms (e.g. facebook, instagram, threads, tiktok)',
        ),
      count: z
        .number()
        .optional()
        .describe('Number of posts to generate (default 3)'),
    },
    async ({ topic, platforms, count }) => {
      try {
        const data = await lunary('/social-posts/generate', {
          method: 'POST',
          body: {
            ...(topic && { topic }),
            ...(platforms && { platforms }),
            ...(count && { count }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'send_social_post',
    'Send/publish a social post to connected platforms',
    {
      post_id: z.string().describe('ID of the post to send'),
      platforms: z
        .array(z.string())
        .optional()
        .describe('Override target platforms (uses post defaults if omitted)'),
    },
    async ({ post_id, platforms }) => {
      try {
        const data = await lunary('/social-posts/send', {
          method: 'POST',
          body: {
            postId: post_id,
            ...(platforms && { platforms }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_pending_posts',
    "Posts awaiting approval in Lunary's internal social pipeline",
    {},
    async () => {
      try {
        const data = await lunary('/social-posts/pending');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'approve_post',
    'Approve a pending social post for publishing',
    {
      post_id: z.string().describe('ID of the post to approve'),
    },
    async ({ post_id }) => {
      try {
        const data = await lunary('/social-posts/approve', {
          method: 'POST',
          body: { postId: post_id },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_social_schedule',
    'Upcoming scheduled posts with dates and platforms',
    {},
    async () => {
      try {
        const data = await lunary('/social-posts/update-schedule');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_video_jobs',
    'Video generation job status from Remotion pipeline (requeue-failed, requeue-processing)',
    {
      type: z
        .enum(['requeue-failed', 'requeue-processing'])
        .optional()
        .describe('Filter by job type'),
    },
    async ({ type }) => {
      try {
        const endpoint = type
          ? `/video-jobs/${type}`
          : '/video-jobs/requeue-failed';
        const data = await lunary(endpoint);
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_video_performance',
    'TikTok/YouTube video performance metrics',
    {},
    async () => {
      try {
        const data = await lunary('/video-performance');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
