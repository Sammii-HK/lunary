import type {
  CountdownEvent,
  SignChangeEvent,
  RetrogradeStationEvent,
} from '@/lib/cosmic-snapshot/global-cache';
import { getPredictiveNotificationCopy } from './predictive-copy';

export interface PredictiveNotification {
  type: 'predictive_transit';
  eventKey: string;
  title: string;
  body: string;
  priority: 'high' | 'medium';
  planet: string;
  daysUntil: number;
}

interface UserNatalData {
  name?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}

/**
 * Generate predictive notifications for a user based on upcoming cosmic events.
 * Returns at most 1 notification (highest priority) to respect rate limits.
 */
export function getPredictiveNotifications(
  user: UserNatalData,
  countdowns: CountdownEvent[],
  signChanges: { ingresses: SignChangeEvent[] },
  retroStations: RetrogradeStationEvent[],
): PredictiveNotification[] {
  const candidates: PredictiveNotification[] = [];
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Check countdowns (3-day and 7-day lookaheads)
  for (const countdown of countdowns) {
    const activatesUser = isPersonallyRelevant(
      countdown.planet,
      countdown.sign,
      user,
    );
    const priority = activatesUser ? 'high' : 'medium';

    // Only send high-priority personal activations or important retrogrades
    if (!activatesUser && countdown.daysUntil === 7) continue;

    const copy = getPredictiveNotificationCopy(
      countdown.event,
      countdown.planet,
      countdown.sign,
      countdown.daysUntil,
      user.name,
      activatesUser,
    );

    candidates.push({
      type: 'predictive_transit',
      eventKey: `predictive-${countdown.event}-${countdown.planet}-${countdown.daysUntil}-${dateStr}`,
      title: copy.title,
      body: copy.body,
      priority,
      planet: countdown.planet,
      daysUntil: countdown.daysUntil,
    });
  }

  // 2. Check upcoming sign changes (tomorrow)
  for (const ingress of signChanges.ingresses) {
    const activatesUser = isPersonallyRelevant(
      ingress.planet,
      ingress.sign,
      user,
    );

    if (!activatesUser) continue;

    const copy = getPredictiveNotificationCopy(
      'sign_ingress',
      ingress.planet,
      ingress.sign,
      1,
      user.name,
      true,
    );

    candidates.push({
      type: 'predictive_transit',
      eventKey: `predictive-ingress-${ingress.planet}-1-${dateStr}`,
      title: copy.title,
      body: copy.body,
      priority: 'high',
      planet: ingress.planet,
      daysUntil: 1,
    });
  }

  // 3. Check upcoming retrograde stations (tomorrow)
  for (const station of retroStations) {
    const activatesUser = isPersonallyRelevant(
      station.planet,
      station.sign,
      user,
    );
    const priority = activatesUser ? 'high' : 'medium';

    // Mercury retrograde is always notable
    const isMercury = station.planet === 'Mercury';

    if (!activatesUser && !isMercury) continue;

    const copy = getPredictiveNotificationCopy(
      station.type,
      station.planet,
      station.sign,
      1,
      user.name,
      activatesUser,
    );

    candidates.push({
      type: 'predictive_transit',
      eventKey: `predictive-${station.type}-${station.planet}-1-${dateStr}`,
      title: copy.title,
      body: copy.body,
      priority,
      planet: station.planet,
      daysUntil: 1,
    });
  }

  // Sort by priority (high first), then by daysUntil (sooner first)
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : 1;
    }
    return a.daysUntil - b.daysUntil;
  });

  // Return only the top notification (rate limit: 1 per user per day)
  return candidates.slice(0, 1);
}

/**
 * Check if a planetary event personally activates the user's chart.
 * An event is personally relevant if the planet's sign matches the user's
 * Sun, Moon, or Rising sign.
 */
function isPersonallyRelevant(
  planet: string,
  sign: string,
  user: UserNatalData,
): boolean {
  if (!sign) return false;

  const userSigns = [user.sunSign, user.moonSign, user.risingSign].filter(
    Boolean,
  );

  return userSigns.includes(sign);
}
