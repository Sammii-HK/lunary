import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

export function registerAbTestingTools(server: McpServer) {
  server.tool(
    'get_ab_tests',
    'All active A/B tests with variant performance, confidence levels, and recommendations',
    {},
    async () => {
      try {
        const data = await lunary('/ab-testing');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_ab_insights',
    'AI-generated insights and recommendations from A/B test results',
    {},
    async () => {
      try {
        const data = await lunary('/ab-testing/insights');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'apply_ab_winner',
    'Auto-apply the winning variant from an A/B test',
    {
      test_id: z
        .string()
        .optional()
        .describe('Specific test ID to apply (applies all winners if omitted)'),
    },
    async ({ test_id }) => {
      try {
        const data = await lunary('/ab-testing/auto-apply', {
          method: 'POST',
          body: {
            ...(test_id && { testId: test_id }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
