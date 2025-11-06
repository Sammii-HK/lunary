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

  // Create notification objects for only 1 most significant event (limit for 4-hourly)
  const eventsToSend = notificationWorthyEvents.slice(0, 1);

  for (const event of eventsToSend) {
    events.push(createNotificationFromEvent(event, cosmicData));
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

function createNotificationFromEvent(event: any, cosmicData?: any) {
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
    let body = '';
    switch (event.type) {
      case 'moon':
        body = getMoonPhaseDescription(event.name, cosmicData);
        break;

      case 'aspect':
        body = getAspectDescription(event);
        break;

      case 'seasonal':
        body = getSeasonalDescription(event.name);
        break;

      case 'ingress':
        body = getIngressDescription(event.planet, event.sign);
        break;

      case 'retrograde':
        body = getRetrogradeDescription(event.planet, event.sign);
        break;

      default:
        body = 'Significant cosmic energy shift occurring';
    }

    return body;
  };

  const getMoonPhaseDescription = (
    phaseName: string,
    cosmicData?: any,
  ): string => {
    // Get moon constellation from cosmic data
    const moonSign = cosmicData?.astronomicalData?.planets?.moon?.sign;

    // Import constellations dynamically
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

    let description = '';
    for (const [phase, phaseDesc] of Object.entries(descriptions)) {
      if (phaseName.includes(phase)) {
        description = phaseDesc;
        break;
      }
    }

    if (!description) {
      description = 'Lunar energy shift creating new opportunities for growth';
    }

    // Add moon constellation info if available
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
  };

  const getIngressDescription = (planet: string, sign: string): string => {
    // Use the same influence mappings as horoscope code for consistency
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
        Capricorn:
          'transcendence of material illusions with spiritual authority',
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
