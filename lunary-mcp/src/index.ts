import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerHealthTools } from './tools/health.js';
import { registerAnalyticsTools } from './tools/analytics.js';
import { registerRevenueTools } from './tools/revenue.js';
import { registerGrowthTools } from './tools/growth.js';
import { registerContentTools } from './tools/content.js';
import { registerAbTestingTools } from './tools/ab-testing.js';
import { registerSocialTools } from './tools/social.js';
import { registerFeatureTools } from './tools/features.js';

const server = new McpServer({
  name: 'lunary',
  version: '1.0.0',
});

// Register all tool groups
registerHealthTools(server);
registerAnalyticsTools(server);
registerRevenueTools(server);
registerGrowthTools(server);
registerContentTools(server);
registerAbTestingTools(server);
registerSocialTools(server);
registerFeatureTools(server);

// Start with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
