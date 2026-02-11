import { getWeek } from 'date-fns';

/**
 * Check if a user is currently in their Saturn Return (ages 27-30).
 */
export function isInSaturnReturn(birthday: string | Date | null): boolean {
  if (!birthday) return false;

  const birthDate =
    birthday instanceof Date ? birthday : new Date(String(birthday));
  if (isNaN(birthDate.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 27 && age <= 30;
}

/**
 * Get the current weekly theme from Saturn Return space metadata.
 * Cycles through 7 themes based on ISO week number.
 */
export function getCurrentWeeklyTheme(
  metadata: { weekly_themes?: string[] } | null | undefined,
): { theme: string; weekIndex: number } | null {
  const themes = metadata?.weekly_themes;
  if (!themes || themes.length === 0) return null;

  const weekNumber = getWeek(new Date());
  const weekIndex = weekNumber % themes.length;

  return {
    theme: themes[weekIndex],
    weekIndex,
  };
}
