/**
 * Transit content cache.
 *
 * The unit of caching is the *transit event*, not the user. Saturn entering
 * Pisces is the same astrological event for everyone — generate once, fan out.
 *
 * Server-only. Never import from a client component.
 */
import { prisma } from '@/lib/prisma';
import type { TransitEvent } from './templates';

export type Audience = 'free' | 'plus';

// ---------------------------------------------------------------------------
// TTL table — keyed by the discriminator on TransitEvent.
// ---------------------------------------------------------------------------

const TTL_HOURS_BY_KIND: Record<TransitEvent['kind'], number> = {
  planet_in_sign: 24, // evolves daily
  aspect_to_natal: 6, // sub-day evolution
  retrograde: 24 * 7, // 7 days
  ingress: 24 * 30, // 30 days
  eclipse: 24 * 90, // 90 days
  lunation: 24 * 7, // 7 days
};

export function getDefaultTtlHours(event: TransitEvent): number {
  return TTL_HOURS_BY_KIND[event.kind];
}

// ---------------------------------------------------------------------------
// Canonical (eventType, eventKey) pair for a TransitEvent.
// This is what we store in the DB so that callers can fan-out by event.
// ---------------------------------------------------------------------------

export function eventToKey(event: TransitEvent): {
  eventType: string;
  eventKey: string;
} {
  switch (event.kind) {
    case 'planet_in_sign':
      return {
        eventType: 'planet_in_sign',
        eventKey: `${event.planet}_${event.sign}`,
      };
    case 'aspect_to_natal':
      return {
        eventType: 'aspect_to_natal',
        eventKey: `${event.transitPlanet}_${event.aspect}_${event.natalPlanet}`,
      };
    case 'retrograde':
      return {
        eventType: 'retrograde',
        eventKey: `${event.planet}_${event.phase}`,
      };
    case 'ingress':
      return {
        eventType: 'ingress',
        eventKey: `${event.planet}_${event.sign}`,
      };
    case 'eclipse':
      return {
        eventType: 'eclipse',
        eventKey: event.sign
          ? `${event.kindOfEclipse}_${event.sign}`
          : event.kindOfEclipse,
      };
    case 'lunation':
      return {
        eventType: 'lunation',
        eventKey: event.sign ? `${event.phase}_${event.sign}` : event.phase,
      };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Cache reads/writes. Failures never throw — the orchestrator must always be
// able to fall through to the next tier.
// ---------------------------------------------------------------------------

/**
 * Look up cached content for an event + audience. Returns null on miss,
 * expiry, or any DB error. Never throws.
 */
export async function getCachedContent(
  event: TransitEvent,
  audience: Audience,
): Promise<string | null> {
  const { eventType, eventKey } = eventToKey(event);

  try {
    const row = await prisma.transitContentCache.findUnique({
      where: {
        eventType_eventKey_audience: {
          eventType,
          eventKey,
          audience,
        },
      },
    });

    if (!row) return null;
    if (row.validUntil.getTime() <= Date.now()) return null;

    return row.content;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[transit-content/cache] getCachedContent failed:', err);
    return null;
  }
}

/**
 * Persist cached content. Upserts the (eventType, eventKey, audience) row.
 * Never throws.
 */
export async function setCachedContent(
  event: TransitEvent,
  audience: Audience,
  content: string,
  source: string,
  ttlHours: number,
): Promise<void> {
  const { eventType, eventKey } = eventToKey(event);

  const validFrom = new Date();
  const validUntil = new Date(validFrom.getTime() + ttlHours * 60 * 60 * 1000);

  try {
    await prisma.transitContentCache.upsert({
      where: {
        eventType_eventKey_audience: {
          eventType,
          eventKey,
          audience,
        },
      },
      update: {
        content,
        source,
        validFrom,
        validUntil,
      },
      create: {
        eventType,
        eventKey,
        audience,
        content,
        source,
        validFrom,
        validUntil,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[transit-content/cache] setCachedContent failed:', err);
  }
}
