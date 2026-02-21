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
import { registerAiConversionTools } from './tools/ai-conversion.js';
import { registerAdminTools } from './tools/admin.js';
import { registerVideoScriptTools } from './tools/video-scripts.js';
import { registerOperationsTools } from './tools/operations.js';
import { registerAstralGuideTools } from './tools/astral-guide.js';

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
registerAiConversionTools(server);
registerAdminTools(server);
registerVideoScriptTools(server);
registerOperationsTools(server);
registerAstralGuideTools(server);

// Start with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
