import { NextRequest, NextResponse } from 'next/server';
import {
  getSentEvents,
  markEventAsSent,
  cleanupOldDates,
  getSentEventsCount,
} from '../shared-notification-tracker';

// This endpoint runs every 4 hours to check for astronomical events
export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const checkTime = now.toISOString();

    console.log('🔔 4-hourly notification check started at:', checkTime);

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://www.lunary.app'
        : 'http://localhost:3000';

    // Get cosmic data to check for events
    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post/${today}`,
      {
        headers: { 'User-Agent': 'Lunary-4Hourly-Notification/1.0' },
      },
    );

    if (!cosmicResponse.ok) {
      throw new Error(`Failed to fetch cosmic data: ${cosmicResponse.status}`);
    }

    const cosmicData = await cosmicResponse.json();

    // Cleanup old tracking data (only keep today + 1 day buffer)
    // We only need to track events for the current day to prevent duplicates
    await cleanupOldDates(1);

    // Get events that have already been sent today (by daily cron or previous 4-hourly checks)
    const sentToday = await getSentEvents(today);
    const alreadySentCount = await getSentEventsCount(today);

    // Check if there are notification-worthy events happening today
    const currentEvents = getNotificationWorthyEvents(cosmicData);

    // Filter out events that have already been notified about today
    // This includes events sent by daily cron AND events sent in previous 4-hourly checks
    const newEvents = currentEvents.filter((event: any) => {
      const eventKey = `${event.type}-${event.name}-${event.priority}`;
      // Event is new if it hasn't been sent yet
      return !sentToday.has(eventKey);
    });

    // Log comparison for debugging
    console.log(
      `📊 Event comparison: ${currentEvents.length} current events, ${alreadySentCount} already sent (by daily cron or previous checks), ${newEvents.length} new events`,
    );

    if (newEvents.length === 0) {
      console.log('📭 No new notification-worthy events in this 4-hour check');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        primaryEvent: cosmicData.primaryEvent?.name,
        message:
          'No new significant events to notify about (may have already been sent)',
        checkTime,
        alreadySent: sentToday.size,
      });
    }

    // Send notifications for significant events
    const results = [];
    let totalSent = 0;

    for (const event of newEvents) {
      try {
        const eventKey = `${event.type}-${event.name}-${event.priority}`;

        // Map event type to notification type format
        const getNotificationType = (type: string): string => {
          const mapping: Record<string, string> = {
            moon: 'moon_phase',
            aspect: 'major_aspect',
            ingress: 'planetary_transit',
            seasonal: 'sabbat',
            retrograde: 'retrograde',
          };
          return mapping[type] || 'moon_phase';
        };

        const response = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            payload: {
              type: getNotificationType(event.type),
              title: event.title,
              body: event.body,
              data: {
                date: today,
                eventName: event.name,
                priority: event.priority,
                eventType: event.type,
                checkType: '4-hourly',
              },
            },
          }),
        });

        const result = await response.json();
        totalSent += result.recipientCount || 0;
        results.push(result);

        // Mark this event as sent in database tracker (so it won't be sent again)
        await markEventAsSent(
          today,
          eventKey,
          event.type,
          event.name,
          event.priority,
          '4-hourly',
        );
      } catch (eventError) {
        console.error(
          `Failed to send notification for event ${event.name}:`,
          eventError,
        );
        results.push({
          success: false,
          error:
            eventError instanceof Error ? eventError.message : 'Unknown error',
          eventName: event.name,
        });
      }
    }

    console.log(
      `✅ 4-hourly notification check completed: ${totalSent} notifications sent, ${newEvents.length} new events`,
    );

    return NextResponse.json({
      success: totalSent > 0,
      notificationsSent: totalSent,
      primaryEvent: cosmicData.primaryEvent?.name,
      newEventsCount: newEvents.length,
      totalEventsToday: currentEvents.length,
      alreadySentToday: alreadySentCount,
      results,
      checkTime,
    });
  } catch (error) {
    console.error('❌ 4-hourly notification check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        checkTime: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Same logic as daily-posts but for 4-hourly checks
function getNotificationWorthyEvents(cosmicData: any) {
  const events: any[] = [];

  // Build allEvents array from available data (same as daily-posts)
  const allEvents: any[] = [];

  // Get primary event with full metadata
  const primaryEventType =
    cosmicData.astronomicalData?.primaryEvent?.type || 'unknown';
  const primaryEventPriority =
    cosmicData.astronomicalData?.primaryEvent?.priority || 0;

  if (cosmicData.primaryEvent) {
    allEvents.push({
      name: cosmicData.primaryEvent.name,
      energy: cosmicData.primaryEvent.energy,
      type: primaryEventType,
      priority: primaryEventPriority,
      ...cosmicData.astronomicalData?.primaryEvent,
    });
  }

  // Add aspect events
  if (cosmicData.aspectEvents && Array.isArray(cosmicData.aspectEvents)) {
    allEvents.push(
      ...cosmicData.aspectEvents.map((event: any) => ({
        ...event,
        type: event.type || 'aspect',
      })),
    );
  }

  // Add ingress events
  if (cosmicData.ingressEvents && Array.isArray(cosmicData.ingressEvents)) {
    allEvents.push(
      ...cosmicData.ingressEvents.map((event: any) => ({
        ...event,
        type: event.type || 'ingress',
        priority: event.priority || 4,
      })),
    );
  }

  // Add seasonal events
  if (cosmicData.seasonalEvents && Array.isArray(cosmicData.seasonalEvents)) {
    allEvents.push(
      ...cosmicData.seasonalEvents.map((event: any) => ({
        ...event,
        type: event.type || 'seasonal',
        priority: event.priority || 8,
      })),
    );
  }

  // Add retrograde events
  if (
    cosmicData.retrogradeEvents &&
    Array.isArray(cosmicData.retrogradeEvents)
  ) {
    allEvents.push(
      ...cosmicData.retrogradeEvents.map((event: any) => ({
        ...event,
        type: event.type || 'retrograde',
        priority: event.priority || 6,
      })),
    );
  }

  // Add retrograde ingress events
  if (
    cosmicData.retrogradeIngress &&
    Array.isArray(cosmicData.retrogradeIngress)
  ) {
    allEvents.push(
      ...cosmicData.retrogradeIngress.map((event: any) => ({
        ...event,
        type: event.type || 'retrograde',
        priority: event.priority || 6,
      })),
    );
  }

  // Sort by priority
  allEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Get notification-worthy events
  const notificationWorthyEvents = allEvents.filter((event: any) => {
    return isEventNotificationWorthy(event);
  });

  // Create notification objects for up to 2 most significant events (limit for 4-hourly)
  const eventsToSend = notificationWorthyEvents.slice(0, 2);

  for (const event of eventsToSend) {
    events.push(createNotificationFromEvent(event));
  }

  return events;
}

function isEventNotificationWorthy(event: any): boolean {
  // Only send notifications for significant events
  if (event.priority >= 9) return true; // Extraordinary planetary events

  // Moon phases (ALL major phases are significant)
  if (event.type === 'moon' && event.priority === 10) {
    const significantPhases = [
      'New Moon',
      'Full Moon',
      'First Quarter',
      'Last Quarter',
      'Quarter',
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

function createNotificationFromEvent(event: any) {
  const baseEvent = {
    name: event.name,
    type: event.type,
    priority: event.priority,
  };

  // Create descriptive titles without emojis (same as daily-posts)
  const createNotificationTitle = (event: any) => {
    const eventName = event.name || 'Cosmic Event';

    switch (event.type) {
      case 'moon':
        return eventName;

      case 'aspect':
        if (event.planetA && event.planetB && event.aspect) {
          const planetAName = event.planetA.name || event.planetA;
          const planetBName = event.planetB.name || event.planetB;
          const aspectName =
            event.aspect.charAt(0).toUpperCase() + event.aspect.slice(1);
          return `${planetAName}-${planetBName} ${aspectName}`;
        }
        return eventName || 'Planetary Aspect';

      case 'seasonal':
        return eventName;

      case 'ingress':
        if (event.planet && event.sign) {
          return `${event.planet} Enters ${event.sign}`;
        }
        return eventName || 'Planetary Ingress';

      case 'retrograde':
        if (event.planet) {
          return `${event.planet} Retrograde Begins`;
        }
        return eventName || 'Planetary Retrograde';

      default:
        return eventName || 'Cosmic Event';
    }
  };

  const createNotificationBody = (event: any) => {
    switch (event.type) {
      case 'moon':
        return getMoonPhaseDescription(event.name);

      case 'aspect':
        return getAspectDescription(event);

      case 'seasonal':
        return getSeasonalDescription(event.name);

      case 'ingress':
        return getIngressDescription(event.planet, event.sign);

      case 'retrograde':
        return getRetrogradeDescription(event.planet, event.sign);

      default:
        return 'Significant cosmic energy shift occurring';
    }
  };

  const getMoonPhaseDescription = (phaseName: string): string => {
    const descriptions: Record<string, string> = {
      'New Moon':
        'A powerful reset point for manifestation and new beginnings. Set intentions aligned with your deeper purpose.',
      'Full Moon':
        'Peak illumination brings clarity to accomplishments and reveals areas ready for release and transformation.',
      'First Quarter':
        'A critical decision point supporting decisive action and breakthrough moments.',
      'Last Quarter':
        'A time for reflection, release, and preparing for the next lunar cycle.',
    };

    for (const [phase, description] of Object.entries(descriptions)) {
      if (phaseName.includes(phase)) return description;
    }

    return 'Lunar energy shift creating new opportunities for growth';
  };

  const getIngressDescription = (planet: string, sign: string): string => {
    const planetInfluences: Record<string, Record<string, string>> = {
      Mars: {
        Aries: 'amplifies action, courage, and pioneering initiative',
        Taurus: 'focuses energy on stability, patience, and material progress',
        Gemini:
          'directs drive toward communication, learning, and mental agility',
        Cancer: 'channels energy into emotional security and nurturing actions',
        Leo: 'ignites creative expression and confident leadership',
        Virgo: 'brings precision and disciplined action to work and health',
        Libra: 'seeks balance in partnerships and harmonious action',
        Scorpio: 'intensifies transformation and deep emotional focus',
        Sagittarius:
          'expands horizons through adventure and philosophical exploration',
        Capricorn: 'builds structured ambition and long-term goals',
        Aquarius: 'fuels innovation and revolutionary change',
        Pisces: 'flows through intuitive action and compassionate service',
      },
      Venus: {
        Aries: 'brings passionate attraction and bold romance',
        Taurus: 'enhances sensuality, stability, and material beauty',
        Gemini: 'fosters lighthearted connections and intellectual attraction',
        Cancer: 'deepens emotional bonds and nurturing love',
        Leo: 'magnifies dramatic romance and creative expression',
        Virgo: 'cultivates practical love and service in relationships',
        Libra: 'harmonizes partnerships and artistic beauty',
        Scorpio: 'intensifies transformative love and deep connections',
        Sagittarius:
          'expands through adventurous romance and philosophical bonds',
        Capricorn: 'builds committed, structured relationships',
        Aquarius: 'creates unconventional connections and friendly love',
        Pisces: 'flows through dreamy romance and spiritual connection',
      },
      Mercury: {
        Aries: 'speaks with directness and pioneering ideas',
        Taurus: 'communicates with practicality and grounded wisdom',
        Gemini: 'enhances mental agility, communication, and learning',
        Cancer: 'expresses through emotional intelligence and intuition',
        Leo: 'communicates with confidence and creative expression',
        Virgo: 'organizes thoughts with precision and analytical clarity',
        Libra: 'seeks harmony in communication and balanced dialogue',
        Scorpio: 'delves into deep, transformative conversations',
        Sagittarius: 'expands through philosophical discourse and exploration',
        Capricorn: 'structures communication for practical achievement',
        Aquarius: 'innovates through unconventional ideas and technology',
        Pisces: 'flows through intuitive understanding and artistic expression',
      },
      Jupiter: {
        Aries: 'expands leadership opportunities and pioneering ventures',
        Taurus: 'amplifies financial growth and material abundance',
        Gemini: 'enhances learning, communication, and short-distance travel',
        Cancer: 'expands home, family, and emotional security',
        Leo: 'magnifies creativity, entertainment, and self-expression',
        Virgo: 'grows through health, work, and service to others',
        Libra: 'expands partnerships, justice, and artistic pursuits',
        Scorpio: 'deepens transformation, research, and shared resources',
        Sagittarius:
          'magnifies higher education, philosophy, and long-distance travel',
        Capricorn: 'advances career recognition and public achievement',
        Aquarius: 'innovates through friendship and humanitarian causes',
        Pisces: 'expands spirituality, compassion, and artistic inspiration',
      },
      Saturn: {
        Aries: 'brings discipline to personal expression and independence',
        Taurus: 'structures material values and financial stability',
        Gemini: 'organizes communication and learning with responsibility',
        Cancer: 'builds emotional security through family structures',
        Leo: 'disciplines creative expression and leadership',
        Virgo: 'structures work methods and health routines',
        Libra: 'builds committed partnerships and balanced relationships',
        Scorpio: 'transforms through power structures and deep healing',
        Sagittarius: 'structures belief systems and educational goals',
        Capricorn: 'builds authority and institutional achievement',
        Aquarius: 'innovates through structured social change',
        Pisces: 'grounds spiritual practice with practical discipline',
      },
      Uranus: {
        Aries: 'revolutionizes personal independence and pioneering spirit',
        Taurus: 'innovates material values and earth-conscious change',
        Gemini: 'transforms communication technology and mental liberation',
        Cancer: 'reforms family structures and emotional freedom',
        Leo: 'awakens creative expression and individual uniqueness',
        Virgo: 'innovates work methods and health approaches',
        Libra: 'transforms relationship patterns and social justice',
        Scorpio: 'revolutionizes power structures and transformational healing',
        Sagittarius: 'reforms belief systems and educational innovation',
        Capricorn: 'transforms authority structures and institutional change',
        Aquarius:
          'magnifies collective consciousness and technological advancement',
        Pisces: 'awakens spiritual inspiration and artistic innovation',
      },
      Neptune: {
        Aries: 'inspires spiritual leadership and intuitive action',
        Taurus: 'blends material attachment with earth spirituality',
        Gemini: 'enhances intuitive communication and mental clarity',
        Cancer: 'deepens emotional boundaries and family mysticism',
        Leo: 'inspires creative expression and heart-centered art',
        Virgo: 'integrates service with practical spirituality',
        Libra: 'idealizes relationships and artistic beauty',
        Scorpio: 'reveals hidden truths and mystical transformation',
        Sagittarius: 'expands spiritual seeking and higher knowledge',
        Capricorn: 'transcends material illusions with spiritual authority',
        Aquarius: 'awakens collective dreams and humanitarian vision',
        Pisces: 'magnifies universal compassion and divine connection',
      },
      Pluto: {
        Aries: 'transforms personal power and individual identity',
        Taurus: 'deeply transforms material values and resources',
        Gemini: 'revolutionizes communication power and mental transformation',
        Cancer: 'transforms emotional depth and family dynamics',
        Leo: 'transforms creative power and self-expression',
        Virgo: 'transforms work and health through deep renewal',
        Libra: 'transforms relationship power and social structures',
        Scorpio: 'magnifies deep psychological and spiritual transformation',
        Sagittarius: 'transforms belief systems and educational approaches',
        Capricorn:
          'revolutionizes power structures and institutional transformation',
        Aquarius: 'transforms collective consciousness and technology',
        Pisces: 'awakens spiritual evolution and universal consciousness',
      },
    };

    const planetInfluence = planetInfluences[planet]?.[sign];
    if (planetInfluence) {
      return `This ${planetInfluence}`;
    }

    return `Planetary energy shifts focus toward ${sign} themes`;
  };

  const getAspectDescription = (event: any): string => {
    if (!event.aspect) {
      return 'Powerful cosmic alignment creating new opportunities';
    }

    const planetA = event.planetA?.name || event.planetA;
    const planetB = event.planetB?.name || event.planetB;
    const signA = event.planetA?.constellation || event.signA;
    const signB = event.planetB?.constellation || event.signB;

    const aspectDescriptions: Record<string, string> = {
      conjunction: 'unite their energies',
      trine: 'flow harmoniously together',
      square: 'create dynamic tension',
      sextile: 'offer cooperative opportunities',
      opposition: 'seek balance between',
    };

    const aspectAction = aspectDescriptions[event.aspect] || 'align';
    const signDescription = signA || 'cosmic';

    if (planetA && planetB) {
      if (signA && signB) {
        return `${planetA} and ${planetB} ${aspectAction}, amplifying ${signDescription} energy and creating new possibilities`;
      }
      return `${planetA} and ${planetB} ${aspectAction}, creating powerful cosmic influence`;
    }

    return 'Planetary alignment forming with significant influence';
  };

  const getSeasonalDescription = (eventName: string): string => {
    if (eventName.includes('Equinox')) {
      return 'Equal day and night mark a powerful balance point, supporting new beginnings and equilibrium';
    }
    if (eventName.includes('Solstice')) {
      return 'Peak daylight or darkness marks a turning point, supporting reflection and seasonal transition';
    }
    return 'Seasonal energy shift brings new themes and opportunities for growth';
  };

  const getRetrogradeDescription = (planet: string, sign?: string): string => {
    const retrogradeMeanings: Record<string, string> = {
      Mercury:
        'invites reflection on communication, technology, and mental patterns',
      Venus:
        'encourages review of relationships, values, and what brings beauty',
      Mars: 'suggests revisiting action, motivation, and how we channel energy',
      Jupiter:
        'invites reflection on expansion, growth, and philosophical beliefs',
      Saturn:
        'encourages review of structures, responsibilities, and long-term goals',
      Uranus:
        'brings revolutionary reflection on change, innovation, and freedom',
      Neptune:
        'invites reflection on dreams, intuition, and spiritual connection',
      Pluto: 'encourages deep transformation through shadow work and renewal',
    };

    const meaning =
      retrogradeMeanings[planet] || 'invites reflection and review';
    if (sign) {
      return `This ${meaning} in ${sign}`;
    }
    return `This ${meaning}`;
  };

  return {
    ...baseEvent,
    title: createNotificationTitle(event),
    body: createNotificationBody(event),
  };
}
