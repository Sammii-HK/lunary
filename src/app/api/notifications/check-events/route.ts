import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import {
  sendUnifiedNotification,
  NotificationEvent,
} from '@/lib/notifications/unified-service';

// Lazy initialization of VAPID keys (only when actually needed)
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

// This endpoint checks for significant astronomical events and sends notifications
export async function GET(request: NextRequest) {
  try {
    // Configure VAPID keys when actually needed (not at module load time)
    ensureVapidConfigured();

    // Verify cron request
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    console.log('🔔 Checking astronomical events for notifications:', today);

    // Fetch cosmic data using your existing API
    const cosmicData = await checkAstronomicalEvents(today);

    if (!cosmicData) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cosmic data',
      });
    }

    const eventsToNotify: any[] = [];

    // Check if primary event is notification-worthy
    const primaryEvent = cosmicData.primaryEvent;
    if (primaryEvent && isNotificationWorthy(primaryEvent)) {
      eventsToNotify.push(primaryEvent);
    }

    // Check secondary events for high-priority items
    if (cosmicData.allEvents) {
      const significantEvents = cosmicData.allEvents
        .filter((event: any) => event.priority >= 8 && event !== primaryEvent)
        .slice(0, 2); // Limit to 2 additional notifications per day

      for (const event of significantEvents) {
        if (isNotificationWorthy(event)) {
          eventsToNotify.push(event);
        }
      }
    }

    // Send notifications using unified service
    const results = [];
    for (const event of eventsToNotify) {
      try {
        const notificationEvent: NotificationEvent = {
          name: event.name || 'Cosmic Event',
          type: event.type || 'unknown',
          priority: event.priority || 0,
          planet: event.planet,
          sign: event.sign,
          planetA: event.planetA,
          planetB: event.planetB,
          aspect: event.aspect,
          emoji: event.emoji,
          energy: event.energy,
          description: event.description,
        };

        const sendResult = await sendUnifiedNotification(
          notificationEvent,
          cosmicData,
          'daily',
        );
        results.push({
          success: sendResult.success,
          notification: event.name,
          recipientCount: sendResult.recipientCount,
          successful: sendResult.successful,
          failed: sendResult.failed,
          eventKey: sendResult.eventKey,
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          notification: event.name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      primaryEvent: primaryEvent?.name,
      notificationsSent: eventsToNotify.length,
      results,
    });
  } catch (error) {
    console.error('Error checking astronomical events:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function checkAstronomicalEvents(date: string) {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/og/cosmic-post/${date}`, {
      headers: { 'User-Agent': 'Lunary-Notification-Service/1.0' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cosmic data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching astronomical events:', error);
    return null;
  }
}

function isNotificationWorthy(event: any): boolean {
  // Only send notifications for significant events
  if (event.priority >= 9) return true; // Extraordinary planetary events

  // Moon phases (but not every day - only exact phases)
  if (event.type === 'moon' && event.priority === 10) {
    const significantPhases = [
      'New Moon',
      'Full Moon',
      'First Quarter',
      'Last Quarter',
    ];
    return significantPhases.some((phase) => event.name.includes(phase));
  }

  // Seasonal events (equinoxes, solstices, sabbats)
  if (event.priority === 8) return true;

  // Major aspects involving outer planets
  if (event.type === 'aspect' && event.priority >= 7) {
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    return outerPlanets.some(
      (planet) =>
        event.name?.includes(planet) || event.description?.includes(planet),
    );
  }

  return false;
}

function createNotificationFromEvent(event: any, cosmicData: any) {
  const baseNotification = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      date: cosmicData.date,
      eventType: event.type,
      priority: event.priority,
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-72x72.png',
      },
    ],
  };

  // Customize based on event type
  switch (event.type) {
    case 'moon':
      const moonSign = cosmicData?.astronomicalData?.planets?.moon?.sign;
      const moonBody = getMoonDescriptionWithConstellation(
        event.name || 'Moon Phase',
        moonSign,
      );
      return {
        ...baseNotification,
        title: `${event.emoji || '🌙'} ${event.name || 'Moon Phase'}`,
        body: moonBody,
        tag: 'lunary-moon-phase',
        data: { ...baseNotification.data, phase: event.name || 'moon' },
      };

    case 'aspect':
      const aspectBody = getAspectDescriptionDetailed(event);
      return {
        ...baseNotification,
        title: `${getPlanetEmoji(event)} ${event.name || 'Planetary Aspect'}`,
        body: aspectBody,
        tag: 'lunary-planetary-aspect',
        data: { ...baseNotification.data, aspect: event.name || 'aspect' },
      };

    case 'seasonal':
      const seasonalBody = getSeasonalDescriptionDetailed(event.name);
      return {
        ...baseNotification,
        title: `🌿 ${event.name}`,
        body: seasonalBody,
        tag: 'lunary-seasonal',
        data: { ...baseNotification.data, season: event.name },
      };

    case 'ingress':
      const ingressBody = getIngressDescriptionDetailed(
        event.planet || event.name?.split(' ')[0],
        event.sign || event.name?.split(' ')[2],
      );
      return {
        ...baseNotification,
        title: `${getPlanetEmoji(event)} ${event.name || 'Planetary Ingress'}`,
        body: ingressBody,
        tag: 'lunary-planetary-ingress',
        data: { ...baseNotification.data, ingress: event.name || 'ingress' },
      };

    default:
      return {
        ...baseNotification,
        title: `✨ ${event.name || 'Cosmic Event'}`,
        body:
          event.energy ||
          event.description ||
          'Significant cosmic event occurring',
        tag: 'lunary-cosmic-event',
      };
  }
}

function getMoonDescriptionWithConstellation(
  phaseName: string,
  moonSign?: string,
): string {
  const constellations: Record<string, any> = {
    aries: {
      name: 'Aries',
      information:
        'Aries is known for its courage, initiative, and leadership. This is a time to take bold actions, start new projects, and assert yourself confidently.',
    },
    taurus: {
      name: 'Taurus',
      information:
        "Taurus emphasizes stability, security, and sensuality. It's a time to build solid foundations, enjoy life's pleasures, and value consistency.",
    },
    gemini: {
      name: 'Gemini',
      information:
        'Gemini is characterized by adaptability, communication, and intellect. This is a time to explore new ideas, connect with others, and stay curious.',
    },
    cancer: {
      name: 'Cancer',
      information:
        "Cancer is associated with nurturing, emotion, and home. It's a time to care for yourself and loved ones, create a cozy home environment, and honor your feelings.",
    },
    leo: {
      name: 'Leo',
      information:
        'Leo shines with creativity, confidence, and generosity. This is a time to express your talents, lead with confidence, and give generously.',
    },
    virgo: {
      name: 'Virgo',
      information:
        "Virgo values analysis, perfection, and service. It's a time to focus on details, improve your skills, and be of service to others.",
    },
    libra: {
      name: 'Libra',
      information:
        'Libra seeks balance, harmony, and relationships. This is a time to cultivate partnerships, seek fairness, and create beauty.',
    },
    scorpio: {
      name: 'Scorpio',
      information:
        "Scorpio is known for its intensity, transformation, and mystery. It's a time to delve deep into your psyche, embrace change, and explore hidden truths.",
    },
    sagittarius: {
      name: 'Sagittarius',
      information:
        'Sagittarius is adventurous, philosophical, and freedom-loving. This is a time to broaden your horizons, seek truth, and embrace new experiences.',
    },
    capricorn: {
      name: 'Capricorn',
      information:
        "Capricorn emphasizes ambition, discipline, and practicality. It's a time to set long-term goals, work hard, and stay focused on your ambitions.",
    },
    aquarius: {
      name: 'Aquarius',
      information:
        'Aquarius is innovative, individualistic, and humanitarian. This is a time to embrace your unique qualities, think outside the box, and contribute to the greater good.',
    },
    pisces: {
      name: 'Pisces',
      information:
        "Pisces is compassionate, imaginative, and spiritual. It's a time to connect with your inner self, explore your creativity, and show empathy to others.",
    },
  };

  const guidance: Record<string, string> = {
    'New Moon':
      'A powerful reset point for manifestation and new beginnings. Set intentions aligned with your deeper purpose.',
    'Full Moon':
      'Peak illumination brings clarity to accomplishments and reveals areas ready for release and transformation.',
    'First Quarter':
      'A critical decision point supporting decisive action and breakthrough moments.',
    'Last Quarter':
      'A time for reflection, release, and preparing for the next lunar cycle.',
  };

  let description = '';
  for (const [phase, message] of Object.entries(guidance)) {
    if (phaseName.includes(phase)) {
      description = message;
      break;
    }
  }

  if (!description) {
    description = 'Lunar energy shift creating new opportunities for growth';
  }

  if (moonSign) {
    const constellationKey =
      moonSign.toLowerCase() as keyof typeof constellations;
    const constellation = constellations[constellationKey];
    if (constellation) {
      return `Moon enters ${constellation.name}: ${constellation.information} ${description}`;
    }
    return `Moon in ${moonSign}: ${description}`;
  }

  return description;
}

function getIngressDescriptionDetailed(planet?: string, sign?: string): string {
  if (!planet || !sign) {
    return 'Planetary energy shift creating new opportunities';
  }

  const planetInfluences: Record<string, Record<string, string>> = {
    Mars: {
      Aries: 'action, courage, and pioneering initiative',
      Taurus: 'stability, patience, and material progress',
      Gemini: 'communication, learning, and mental agility',
      Cancer: 'emotional security and nurturing actions',
      Leo: 'creative expression and confident leadership',
      Virgo: 'precision and disciplined action in work and health',
      Libra: 'balance in partnerships and harmonious action',
      Scorpio: 'transformation and deep emotional focus',
      Sagittarius: 'adventure and philosophical exploration',
      Capricorn: 'structured ambition and long-term goals',
      Aquarius: 'innovation and revolutionary change',
      Pisces: 'intuitive action and compassionate service',
    },
    Venus: {
      Aries: 'passionate attraction and bold romance',
      Taurus: 'sensuality, stability, and material beauty',
      Gemini: 'lighthearted connections and intellectual attraction',
      Cancer: 'emotional bonds and nurturing love',
      Leo: 'dramatic romance and creative expression',
      Virgo: 'practical love and service in relationships',
      Libra: 'partnerships and artistic beauty',
      Scorpio: 'transformative love and deep connections',
      Sagittarius: 'adventurous romance and philosophical bonds',
      Capricorn: 'committed, structured relationships',
      Aquarius: 'unconventional connections and friendly love',
      Pisces: 'dreamy romance and spiritual connection',
    },
    Mercury: {
      Aries: 'directness and pioneering ideas',
      Taurus: 'practicality and grounded wisdom',
      Gemini: 'mental agility, communication, and learning',
      Cancer: 'emotional intelligence and intuition',
      Leo: 'confidence and creative expression',
      Virgo: 'precision and analytical clarity',
      Libra: 'harmony and balanced dialogue',
      Scorpio: 'deep, transformative conversations',
      Sagittarius: 'philosophical discourse and exploration',
      Capricorn: 'practical achievement through communication',
      Aquarius: 'unconventional ideas and technology',
      Pisces: 'intuitive understanding and artistic expression',
    },
    Jupiter: {
      Aries: 'leadership and pioneering ventures',
      Taurus: 'financial growth and material abundance',
      Gemini: 'learning, communication, and short-distance travel',
      Cancer: 'home, family, and emotional security',
      Leo: 'creativity, entertainment, and self-expression',
      Virgo: 'health, work, and service to others',
      Libra: 'partnerships, justice, and artistic pursuits',
      Scorpio: 'transformation, research, and shared resources',
      Sagittarius: 'higher education, philosophy, and long-distance travel',
      Capricorn: 'career recognition and public achievement',
      Aquarius: 'friendship and humanitarian causes',
      Pisces: 'spirituality, compassion, and artistic inspiration',
    },
    Saturn: {
      Aries: 'discipline in personal expression and independence',
      Taurus: 'structure in material values and financial stability',
      Gemini: 'responsibility in communication and learning',
      Cancer: 'structure in emotional security and family',
      Leo: 'discipline in creative expression and leadership',
      Virgo: 'structure in work methods and health routines',
      Libra: 'commitment in partnerships and relationships',
      Scorpio: 'transformation through power structures and healing',
      Sagittarius: 'structure in belief systems and education',
      Capricorn: 'authority and institutional achievement',
      Aquarius: 'structured social change',
      Pisces: 'discipline in spiritual practice',
    },
    Uranus: {
      Aries: 'personal independence and pioneering spirit',
      Taurus: 'material values and earth-conscious innovation',
      Gemini: 'communication technology and mental liberation',
      Cancer: 'family structures and emotional freedom',
      Leo: 'creative expression and individual uniqueness',
      Virgo: 'work methods and health innovations',
      Libra: 'relationship patterns and social justice',
      Scorpio: 'power structures and transformational healing',
      Sagittarius: 'belief systems and educational reform',
      Capricorn: 'authority structures and institutional change',
      Aquarius: 'collective consciousness and technological advancement',
      Pisces: 'spiritual awakening and artistic inspiration',
    },
    Neptune: {
      Aries: 'spiritual leadership and intuitive action',
      Taurus: 'material attachment and earth spirituality',
      Gemini: 'intuitive communication and mental clarity',
      Cancer: 'emotional boundaries and family mysticism',
      Leo: 'creative expression and heart-centered art',
      Virgo: 'service and practical spirituality',
      Libra: 'relationship ideals and artistic beauty',
      Scorpio: 'hidden truths and mystical transformation',
      Sagittarius: 'spiritual seeking and higher knowledge',
      Capricorn: 'transcendence of material illusions with spiritual authority',
      Aquarius: 'collective dreams and humanitarian vision',
      Pisces: 'universal compassion and divine connection',
    },
    Pluto: {
      Aries: 'personal power and individual transformation',
      Taurus: 'material values and resource transformation',
      Gemini: 'communication power and mental transformation',
      Cancer: 'emotional depth and family transformation',
      Leo: 'creative power and self-expression transformation',
      Virgo: 'work and health transformation',
      Libra: 'relationship power and social transformation',
      Scorpio: 'deep psychological and spiritual transformation',
      Sagittarius: 'belief systems and educational transformation',
      Capricorn: 'power structures and institutional transformation',
      Aquarius: 'collective consciousness and technological transformation',
      Pisces: 'spiritual evolution and universal consciousness',
    },
  };

  const influence = planetInfluences[planet]?.[sign];
  if (influence) {
    return `This amplifies focus on ${influence} energies`;
  }
  return `This amplifies focus on ${sign} themes and energies`;
}

function getAspectDescriptionDetailed(event: any): string {
  const planetA = event.planetA?.name || event.planetA;
  const planetB = event.planetB?.name || event.planetB;
  const aspectDescriptions: Record<string, string> = {
    conjunction: 'unite their energies',
    trine: 'flow harmoniously together',
    square: 'create dynamic tension',
    sextile: 'offer cooperative opportunities',
    opposition: 'seek balance between',
  };
  const aspectAction = aspectDescriptions[event.aspect] || 'align';
  if (planetA && planetB) {
    return `${planetA} and ${planetB} ${aspectAction}, creating powerful cosmic influence`;
  }
  return 'Powerful cosmic alignment creating new opportunities';
}

function getSeasonalDescriptionDetailed(eventName: string): string {
  if (eventName.includes('Equinox')) {
    return 'Equal day and night mark a powerful balance point, supporting new beginnings and equilibrium';
  }
  if (eventName.includes('Solstice')) {
    return 'Peak daylight or darkness marks a turning point, supporting reflection and seasonal transition';
  }
  return 'Seasonal energy shift brings new themes and opportunities for growth';
}

function getPlanetEmoji(event: any): string {
  const text = event.name || event.description || '';
  const emojis: Record<string, string> = {
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    Sun: '☉',
    Moon: '☽',
  };

  for (const [planet, emoji] of Object.entries(emojis)) {
    if (text.includes(planet)) return emoji;
  }

  return '⭐';
}

// Map event types to preference keys
function getPreferenceKey(eventType: string): string | null {
  const mapping: Record<string, string> = {
    moon: 'moonPhases',
    aspect: 'majorAspects',
    ingress: 'planetaryTransits',
    retrograde: 'retrogrades',
    seasonal: 'sabbats',
    eclipse: 'eclipses',
    moon_phase: 'moonPhases',
    planetary_transit: 'planetaryTransits',
    sabbat: 'sabbats',
  };
  return mapping[eventType] || null;
}

async function sendNotificationToSubscribers(notification: any) {
  try {
    console.log('📤 Sending notification:', notification.title);

    // Get the event type to filter subscriptions by preferences
    const eventType = notification.data?.eventType;
    const preferenceKey = eventType ? getPreferenceKey(eventType) : null;

    // Fetch active subscriptions from PostgreSQL based on preferences
    let subscriptions;
    if (preferenceKey) {
      // Filter by event type preference
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth, user_id, preferences
        FROM push_subscriptions 
        WHERE is_active = true 
        AND preferences->>${preferenceKey} = 'true'
      `;
    } else {
      // Get all active subscriptions (fallback if no mapping found)
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth, user_id, preferences
        FROM push_subscriptions 
        WHERE is_active = true
      `;
    }

    if (subscriptions.rows.length === 0) {
      console.log(
        '📭 No active push subscriptions found for event type:',
        eventType,
        'preference key:',
        preferenceKey,
      );
      return {
        success: true,
        notification: notification.title,
        recipientCount: 0,
        message: 'No subscribers for this event type',
      };
    }

    console.log(`📱 Sending to ${subscriptions.rows.length} subscribers`);

    // Send notifications using web-push
    const sendPromises = subscriptions.rows.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(notification),
        );

        // Update last notification sent timestamp
        await sql`
          UPDATE push_subscriptions 
          SET last_notification_sent = NOW() 
          WHERE endpoint = ${sub.endpoint}
        `;

        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error(
          `Failed to send to ${sub.endpoint.substring(0, 50)}...`,
          error,
        );

        // If subscription is invalid, mark as inactive
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

        return {
          success: false,
          endpoint: sub.endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failed = results.length - successful;

    console.log(
      `✅ Notification sent: ${successful} successful, ${failed} failed`,
    );

    return {
      success: successful > 0,
      notification: notification.title,
      recipientCount: subscriptions.rows.length,
      successful,
      failed,
      results: results.map((r) =>
        r.status === 'fulfilled'
          ? r.value
          : { success: false, error: 'Promise rejected' },
      ),
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      notification: notification.title,
    };
  }
}
