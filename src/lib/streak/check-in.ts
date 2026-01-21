export type StreakRecord = {
  current: number;
  longest: number;
};

export async function recordCheckIn(): Promise<{
  streak?: StreakRecord;
} | null> {
  try {
    const response = await fetch('/api/streak/check-in', {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.error('[Streak] Failed to record check-in:', error);
    return null;
  }
}
