import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

export function registerAiConversionTools(server: McpServer) {
  server.tool(
    'generate_cta',
    'Generate AI-powered call-to-action copy for a given context',
    {
      context: z.string().describe('Page or feature context for the CTA'),
      page: z.string().optional().describe('Specific page the CTA appears on'),
      variant_count: z
        .number()
        .optional()
        .describe('Number of variants to generate (default 3)'),
    },
    async ({ context, page, variant_count }) => {
      try {
        const data = await lunary('/ai-conversion', {
          method: 'POST',
          body: {
            action: 'generate-cta',
            context,
            ...(page && { page }),
            ...(variant_count && { variantCount: variant_count }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'analyze_funnel',
    'AI analysis of conversion funnel with drop-off insights',
    {
      funnel_name: z
        .string()
        .optional()
        .describe('Specific funnel to analyze (analyzes all if omitted)'),
    },
    async ({ funnel_name }) => {
      try {
        const data = await lunary('/ai-conversion', {
          method: 'POST',
          body: {
            action: 'analyze-funnel',
            ...(funnel_name && { funnelName: funnel_name }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'suggest_tests',
    'AI-suggested A/B tests for improving conversion',
    {
      area: z
        .string()
        .optional()
        .describe(
          'Area to focus test suggestions on (e.g. onboarding, paywall)',
        ),
    },
    async ({ area }) => {
      try {
        const data = await lunary('/ai-conversion', {
          method: 'POST',
          body: {
            action: 'suggest-tests',
            ...(area && { area }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'optimize_email',
    'AI optimization of email subject line and body for engagement',
    {
      subject: z.string().describe('Email subject line to optimize'),
      body: z.string().describe('Email body content to optimize'),
    },
    async ({ subject, body }) => {
      try {
        const data = await lunary('/ai-conversion', {
          method: 'POST',
          body: {
            action: 'optimize-email',
            subject,
            body,
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'predict_churn',
    'AI churn prediction with at-risk user identification',
    {
      segment: z
        .string()
        .optional()
        .describe('User segment to analyze (e.g. free, trial, paid)'),
    },
    async ({ segment }) => {
      try {
        const data = await lunary('/ai-conversion', {
          method: 'POST',
          body: {
            action: 'predict-churn',
            ...(segment && { segment }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'personalize_experience',
    'AI-generated personalization recommendations for a user or context',
    {
      user_id: z
        .string()
        .optional()
        .describe('Specific user ID to personalize for'),
      context: z
        .string()
        .optional()
        .describe('Context for personalization (e.g. homepage, onboarding)'),
    },
    async ({ user_id, context }) => {
      try {
        const data = await lunary('/ai-conversion', {
          method: 'POST',
          body: {
            action: 'personalize-experience',
            ...(user_id && { userId: user_id }),
            ...(context && { context }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
