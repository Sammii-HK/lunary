export async function recordCheckIn(): Promise<void> {
  try {
    await fetch('/api/streak/check-in', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.error('[Streak] Failed to record check-in:', error);
  }
}
