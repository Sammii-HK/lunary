/**
 * Moon Circle Notifications
 *
 * Notifies users when Moon Circles are active and engaging
 */

export interface MoonCircleNotificationContent {
  title: string;
  body: string;
  icon: string;
  data: {
    type: 'moon_circle';
    moonPhase: string;
    action: string;
  };
}

// Moon phases that trigger circle notifications
const CIRCLE_MOON_PHASES = ['New Moon', 'Full Moon'];

// Participation milestones that trigger notifications
const PARTICIPATION_MILESTONES = [10, 25, 50, 100, 250];

/**
 * Check if a moon phase should trigger a circle notification
 *
 * @param moonPhase - Current moon phase name
 * @returns Whether this phase triggers a notification
 */
export function shouldNotifyForMoonPhase(moonPhase: string): boolean {
  return CIRCLE_MOON_PHASES.some((phase) =>
    moonPhase.toLowerCase().includes(phase.toLowerCase()),
  );
}

/**
 * Get notification for moon circle opening
 *
 * @param moonPhase - Current moon phase (e.g., "New Moon", "Full Moon")
 * @param participantCount - Number of people who have participated
 * @returns Notification content or null
 */
export function getMoonCircleOpenNotification(
  moonPhase: string,
  participantCount: number = 0,
): MoonCircleNotificationContent | null {
  if (!shouldNotifyForMoonPhase(moonPhase)) {
    return null;
  }

  const isNewMoon = moonPhase.toLowerCase().includes('new');
  const icon = isNewMoon ? '🌑' : '🌕';

  const participantText =
    participantCount > 0
      ? `${participantCount} people have shared insights. `
      : '';

  return {
    title: `${icon} ${moonPhase} Circle is Open`,
    body: `${participantText}Join the community in reflection and intention-setting.`,
    icon,
    data: {
      type: 'moon_circle',
      moonPhase,
      action: '/moon-circles',
    },
  };
}

/**
 * Get notification for milestone participation
 *
 * @param moonPhase - Current moon phase
 * @param participantCount - Current participant count
 * @returns Notification content or null
 */
export function getMoonCircleMilestoneNotification(
  moonPhase: string,
  participantCount: number,
): MoonCircleNotificationContent | null {
  if (!PARTICIPATION_MILESTONES.includes(participantCount)) {
    return null;
  }

  const icon = moonPhase.toLowerCase().includes('new') ? '🌑' : '🌕';

  return {
    title: `${icon} ${participantCount} People in the Circle`,
    body: `The ${moonPhase} Circle is buzzing! See what the community is sharing.`,
    icon,
    data: {
      type: 'moon_circle',
      moonPhase,
      action: '/moon-circles',
    },
  };
}

/**
 * Get closing reminder notification for moon circle
 *
 * @param moonPhase - Current moon phase
 * @param hoursRemaining - Hours until circle closes
 * @returns Notification content
 */
export function getMoonCircleClosingNotification(
  moonPhase: string,
  hoursRemaining: number,
): MoonCircleNotificationContent {
  const icon = moonPhase.toLowerCase().includes('new') ? '🌑' : '🌕';

  return {
    title: `${icon} ${moonPhase} Circle Closing Soon`,
    body: `${hoursRemaining} hours left to share your ${moonPhase.toLowerCase().includes('new') ? 'intentions' : 'reflections'}.`,
    icon,
    data: {
      type: 'moon_circle',
      moonPhase,
      action: '/moon-circles',
    },
  };
}

/**
 * Get personalized circle notification based on user's moon sign
 *
 * @param moonPhase - Current moon phase
 * @param moonSign - The sign the moon is in
 * @param userMoonSign - User's natal moon sign
 * @returns Personalized notification content
 */
export function getPersonalizedMoonCircleNotification(
  moonPhase: string,
  moonSign: string,
  userMoonSign: string,
): MoonCircleNotificationContent {
  const icon = moonPhase.toLowerCase().includes('new') ? '🌑' : '🌕';
  const isUserMoonActivated =
    moonSign.toLowerCase() === userMoonSign.toLowerCase();

  let body: string;
  if (isUserMoonActivated) {
    body = `This ${moonPhase} in ${moonSign} directly activates your natal Moon. Your emotional wisdom is amplified - share your insights!`;
  } else {
    body = `${moonPhase} in ${moonSign} invites collective reflection. Join ${moonPhase.toLowerCase().includes('new') ? 'intention-setting' : 'gratitude sharing'} with the community.`;
  }

  return {
    title: `${icon} ${moonPhase} Circle in ${moonSign}`,
    body,
    icon,
    data: {
      type: 'moon_circle',
      moonPhase,
      action: '/moon-circles',
    },
  };
}
