/**
 * Safely check if currently in demo mode
 * Returns true ONLY if explicitly in demo mode
 */
export function isInDemoMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for explicit demo mode flag
  const hasFlag = (window as any).__LUNARY_DEMO_MODE__ === true;

  // Check for demo container
  const hasContainer =
    document.getElementById('demo-preview-container') !== null;

  return hasFlag || hasContainer;
}
