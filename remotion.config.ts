import { Config } from '@remotion/cli/config';

/**
 * Remotion Configuration
 *
 * This config is used by:
 * - `npx remotion studio` for local development preview
 * - `npx remotion render` for CLI rendering
 */

// Set the entry point for Remotion
Config.setEntryPoint('./src/remotion/index.ts');

// Enable webpack caching for faster rebuilds
Config.setWebpackCaching(true);

// Set output codec
Config.setCodec('h264');

// Set pixel format for web compatibility
Config.setPixelFormat('yuv420p');

// Configure CRF (quality) - lower = better quality, larger file
// 18-23 is good for web video
Config.setCrf(20);
