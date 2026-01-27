import React from 'react';
import { RemotionVideo } from './Video';

/**
 * Remotion Root Component
 *
 * Entry point for Remotion rendering.
 * This file is used by:
 * - `npx remotion studio` for local preview
 * - `@remotion/renderer` for production rendering
 */
export const RemotionRoot: React.FC = () => {
  return <RemotionVideo />;
};
