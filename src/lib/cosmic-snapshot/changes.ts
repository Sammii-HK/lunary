import { getCachedSnapshot } from './cache';

export type CosmicChange = {
  type: 'transit' | 'moon_phase' | 'moon_sign' | 'aspect' | 'significant_event';
  description: string;
  priority: number;
  notificationWorthy: boolean;
};

export async function detectCosmicChanges(
  userId: string,
  currentDate: Date,
  previousDate: Date,
  isPayingUser: boolean = false,
): Promise<CosmicChange[]> {
  const [currentSnapshot, previousSnapshot] = await Promise.all([
    getCachedSnapshot(userId, currentDate),
    getCachedSnapshot(userId, previousDate),
  ]);

  if (!currentSnapshot || !previousSnapshot) {
    return [];
  }

  const changes: CosmicChange[] = [];

  if (currentSnapshot.moon && previousSnapshot.moon) {
    if (currentSnapshot.moon.phase !== previousSnapshot.moon.phase) {
      const isSignificant =
        currentSnapshot.moon.phase.includes('New') ||
        currentSnapshot.moon.phase.includes('Full') ||
        currentSnapshot.moon.phase.includes('Quarter');

      changes.push({
        type: 'moon_phase',
        description: `Moon phase changed from ${previousSnapshot.moon.phase} to ${currentSnapshot.moon.phase}`,
        priority: isSignificant ? 10 : 7,
        notificationWorthy: isSignificant,
      });
    }

    if (currentSnapshot.moon.sign !== previousSnapshot.moon.sign) {
      changes.push({
        type: 'moon_sign',
        description: `Moon moved from ${previousSnapshot.moon.sign} to ${currentSnapshot.moon.sign}`,
        priority: 6,
        notificationWorthy: false,
      });
    }
  }

  const currentTransitIds = new Set(
    currentSnapshot.currentTransits?.map(
      (t: any) => `${t.from}-${t.aspect}-${t.to}`,
    ) || [],
  );

  const previousTransitIds = new Set(
    previousSnapshot.currentTransits?.map(
      (t: any) => `${t.from}-${t.aspect}-${t.to}`,
    ) || [],
  );

  const newTransits =
    currentSnapshot.currentTransits?.filter(
      (t: any) => !previousTransitIds.has(`${t.from}-${t.aspect}-${t.to}`),
    ) || [];

  const significantTransits = newTransits.filter(
    (t: any) =>
      t.strength > 0.7 ||
      ['conjunction', 'opposition', 'square'].includes(t.aspect),
  );

  for (const transit of significantTransits.slice(0, 3)) {
    changes.push({
      type: 'transit',
      description: `New transit: ${transit.from} ${transit.aspect} ${transit.to}`,
      priority: transit.strength > 0.7 ? 8 : 6,
      notificationWorthy: transit.strength > 0.7,
    });
  }

  return changes
    .filter((c) => c.notificationWorthy || c.priority >= 8)
    .sort((a, b) => b.priority - a.priority);
}

export function formatChangeNotification(changes: CosmicChange[]): string {
  if (changes.length === 0) {
    return '';
  }

  const topChange = changes[0];
  if (changes.length === 1) {
    return topChange.description;
  }

  return `${topChange.description}. ${changes.length - 1} more cosmic shift${changes.length > 2 ? 's' : ''} detected.`;
}

export function getNotificationTitle(changes: CosmicChange[]): string {
  if (changes.length === 0) {
    return '🌙 Cosmic Changes';
  }

  const topChange = changes[0];
  if (topChange.type === 'moon_phase') {
    return `🌙 ${topChange.description.split(' to ')[1] || 'Moon Phase Change'}`;
  }

  return `🌙 Cosmic Changes Detected`;
}
