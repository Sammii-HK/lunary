/**
 * Remotion Entry Point
 *
 * This file is the main entry point for Remotion bundling and rendering.
 * It exports the root component that defines all compositions.
 */

export { RemotionRoot } from './Root';
export { RemotionVideo } from './Video';

// Re-export compositions for direct use
export * from './compositions';

// Re-export components for custom compositions
export * from './components';

// Re-export utilities
export * from './utils/animations';
export * from './utils/timing';

// Re-export theme
export * from './styles/theme';
