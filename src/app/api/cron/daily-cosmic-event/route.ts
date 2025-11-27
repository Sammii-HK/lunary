import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  checkSeasonalEvents,
  calculateRealAspects,
  checkSignIngress,
  checkRetrogradeEvents,
  checkRetrogradeIngress,
} from '../../../../../utils/astrology/cosmic-og';

function ensureVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment variables.',
    );
  }

  webpush.setVapidDetails('mailto:info@lunary.app', publicKey, privateKey);
}

export async function GET(request: NextRequest) {
  try {
    ensureVapidConfigured();

    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    console.log('🌌 Daily Cosmic Event check for:', dateStr);

    const eventKey = `daily-cosmic-event-${dateStr}`;
    const alreadySent = await sql`
      SELECT id FROM notification_sent_events 
      WHERE date = ${dateStr}::date 
      AND event_key = ${eventKey}
    `;

    if (alreadySent.rows.length > 0) {
      console.log('📭 Daily Cosmic Event already sent today, skipping');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'Already sent today',
        date: dateStr,
      });
    }

    const positions = getRealPlanetaryPositions(today);
    const moonPhase = getAccurateMoonPhase(today);
    const seasonalEvents = checkSeasonalEvents(positions);
    const aspects = calculateRealAspects(positions);
    const ingresses = checkSignIngress(positions, today);
    const retrogradeEvents = checkRetrogradeEvents(positions);
    const retrogradeIngress = checkRetrogradeIngress(positions);

    const allEvents: Array<any> = [];

    if (moonPhase.isSignificant) {
      const significantPhases = [
        'New Moon',
        'Full Moon',
        'First Quarter',
        'Last Quarter',
      ];
      if (significantPhases.some((phase) => moonPhase.name.includes(phase))) {
        allEvents.push({
          name: `${moonPhase.name} in ${positions.Moon.sign}`,
          description: getMoonPhaseDescription(moonPhase.name),
          priority: 10,
          type: 'moon',
          emoji: moonPhase.emoji || '🌙',
        });
      }
    }

    const extraordinaryAspects = aspects.filter((a: any) => a.priority >= 8);
    for (const aspect of extraordinaryAspects) {
      const planetA = aspect.planetA?.name || aspect.planetA;
      const planetB = aspect.planetB?.name || aspect.planetB;
      allEvents.push({
        name: `${planetA}-${planetB} ${aspect.aspect}`,
        description: getAspectDescription(aspect),
        priority: aspect.priority,
        type: 'aspect',
        emoji: getPlanetEmoji(planetA),
      });
    }

    for (const event of retrogradeEvents) {
      if (event.type === 'retrograde_start') {
        allEvents.push({
          name: `${event.planet} Retrograde Begins`,
          description: `${event.planet} stations retrograde in ${event.sign}. ${getRetrogradeDescription(event.planet)}`,
          priority: 9,
          type: 'retrograde_start',
          emoji: '🔄',
        });
      } else if (event.type === 'retrograde_end') {
        allEvents.push({
          name: `${event.planet} Goes Direct`,
          description: `${event.planet} ends retrograde in ${event.sign}. Forward momentum returns for ${event.planet.toLowerCase()}-related matters.`,
          priority: 9,
          type: 'retrograde_end',
          emoji: '⏩',
        });
      }
    }

    for (const ingress of ingresses) {
      if (ingress.planet !== 'Moon') {
        allEvents.push({
          name: `${ingress.planet} enters ${ingress.sign}`,
          description: `${ingress.planet} moves into ${ingress.sign}, shifting cosmic energy.`,
          priority: ingress.priority || 7,
          type: 'ingress',
          emoji: getPlanetEmoji(ingress.planet),
        });
      }
    }

    for (const event of seasonalEvents) {
      allEvents.push({
        name: event.name,
        description: getSeasonalDescription(event.name),
        priority: event.priority || 8,
        type: 'seasonal',
        emoji: '🌿',
      });
    }

    allEvents.sort((a, b) => b.priority - a.priority);

    if (allEvents.length === 0) {
      console.log('📭 No significant cosmic events today');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No significant cosmic events today',
        date: dateStr,
      });
    }

    const primaryEvent = allEvents[0];

    console.log(
      `🌌 Primary cosmic event: ${primaryEvent.name} (priority: ${primaryEvent.priority})`,
    );

    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth, user_id, preferences
      FROM push_subscriptions 
      WHERE is_active = true 
      AND (
        preferences->>'cosmicEvents' = 'true' 
        OR preferences->>'cosmicEvents' IS NULL
        OR preferences->>'majorAspects' = 'true'
        OR preferences->>'moonPhases' = 'true'
      )
    `;

    if (subscriptions.rows.length === 0) {
      console.log('📭 No subscribers for cosmic events');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No subscribers',
        date: dateStr,
      });
    }

    const now = new Date();
    const hour = now.getUTCHours();
    const isQuietHours = hour >= 22 || hour < 8;

    if (isQuietHours) {
      console.log(
        `[daily-cosmic-event] Skipped during quiet hours (${hour}:00 UTC)`,
      );
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'Skipped during quiet hours',
        date: dateStr,
      });
    }

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const pushNotification = {
      title: `${primaryEvent.emoji} ${primaryEvent.name}`,
      body: primaryEvent.description,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'lunary-daily-cosmic-event',
      data: {
        url: baseUrl,
        type: 'daily_cosmic_event',
        date: dateStr,
        eventType: primaryEvent.type,
        isScheduled: true,
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/icon-72x72.png',
        },
      ],
    };

    let pushSent = 0;
    let pushFailed = 0;

    for (const sub of subscriptions.rows) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(pushNotification),
        );

        await sql`
          UPDATE push_subscriptions 
          SET last_notification_sent = NOW() 
          WHERE endpoint = ${sub.endpoint}
        `;

        pushSent++;
      } catch (error) {
        console.error(
          `Failed to send to ${sub.endpoint.substring(0, 50)}...`,
          error,
        );

        if (
          error instanceof Error &&
          (error.message.includes('410') ||
            error.message.includes('invalid') ||
            error.message.includes('expired'))
        ) {
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false 
            WHERE endpoint = ${sub.endpoint}
          `;
        }

        pushFailed++;
      }
    }

    if (pushSent > 0) {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${dateStr}::date, ${eventKey}, 'daily_cosmic_event', ${primaryEvent.name}, ${primaryEvent.priority}, 'daily')
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    }

    console.log(
      `✅ Daily Cosmic Event: ${pushSent} sent, ${pushFailed} failed`,
    );

    return NextResponse.json({
      success: pushSent > 0,
      pushSent,
      pushFailed,
      event: primaryEvent.name,
      eventType: primaryEvent.type,
      totalSubscribers: subscriptions.rows.length,
      date: dateStr,
    });
  } catch (error) {
    console.error('❌ Daily Cosmic Event cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

function getMoonPhaseDescription(phaseName: string): string {
  if (phaseName.includes('New Moon')) {
    return 'A powerful reset point for manifestation and new beginnings.';
  }
  if (phaseName.includes('Full Moon')) {
    return 'Peak illumination brings clarity and reveals areas ready for release.';
  }
  if (phaseName.includes('First Quarter')) {
    return 'A critical decision point supporting decisive action.';
  }
  if (phaseName.includes('Last Quarter')) {
    return 'A time for reflection, release, and preparing for renewal.';
  }
  return 'Lunar energy shift creating new opportunities for growth.';
}

function getAspectDescription(aspect: any): string {
  const planetA = aspect.planetA?.name || aspect.planetA;
  const planetB = aspect.planetB?.name || aspect.planetB;
  const aspectType = aspect.aspect;

  const aspectActions: Record<string, string> = {
    conjunction: 'unite their energies',
    trine: 'flow harmoniously together',
    square: 'create dynamic tension',
    sextile: 'offer cooperative opportunities',
    opposition: 'seek balance between polarities',
  };

  const action = aspectActions[aspectType] || 'align';
  return `${planetA} and ${planetB} ${action}, creating powerful cosmic influence.`;
}

function getRetrogradeDescription(planet: string): string {
  const descriptions: Record<string, string> = {
    Mercury: 'Reflect on communication, technology, and mental patterns.',
    Venus: 'Review relationships, values, and what brings you joy.',
    Mars: 'Revisit action, motivation, and how you channel energy.',
    Jupiter: 'Reflect on expansion, growth, and philosophical beliefs.',
    Saturn: 'Review structures, responsibilities, and long-term goals.',
    Uranus: 'Reflect on change, innovation, and personal freedom.',
    Neptune: 'Examine dreams, intuition, and spiritual connection.',
    Pluto: 'Deep transformation through shadow work and renewal.',
  };
  return descriptions[planet] || 'A time for reflection and review.';
}

function getSeasonalDescription(eventName: string): string {
  if (eventName.includes('Equinox')) {
    return 'Equal day and night mark a powerful balance point.';
  }
  if (eventName.includes('Solstice')) {
    return 'Peak daylight or darkness marks a turning point.';
  }
  return 'Seasonal energy shift brings new themes for growth.';
}

function getPlanetEmoji(planet: string): string {
  const emojis: Record<string, string> = {
    Mercury: '☿️',
    Venus: '♀️',
    Mars: '♂️',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '⛢',
    Neptune: '♆',
    Pluto: '♇',
    Sun: '☀️',
    Moon: '🌙',
  };
  return emojis[planet] || '✨';
}
