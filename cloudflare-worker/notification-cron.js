/**
 * Cloudflare Worker for Lunary Push Notifications
 * Uses your cosmic API's allEvents array
 * Updated with improved descriptions and duplicate prevention
 */

export default {
  async scheduled(event, env, ctx) {
    console.log(
      '🔔 Cloudflare notification cron started at:',
      new Date().toISOString(),
    );

    try {
      const today = new Date().toISOString().split('T')[0];
      const baseUrl = 'https://www.lunary.app';

      // Get cosmic data to check for events
      const cosmicResponse = await fetch(
        `${baseUrl}/api/og/cosmic-post/${today}`,
        {
          headers: { 'User-Agent': 'Lunary-Cloudflare-Notification/1.0' },
        },
      );

      if (!cosmicResponse.ok) {
        throw new Error(
          `Failed to fetch cosmic data: ${cosmicResponse.status}`,
        );
      }

      const cosmicData = await cosmicResponse.json();

      // Check what events have already been sent today
      const checkSentResponse = await fetch(
        `${baseUrl}/api/notifications/check-sent-events?date=${today}`,
        {
          headers: {
            Authorization: `Bearer ${env.CRON_SECRET}`,
          },
        },
      );

      let sentEvents = new Set();
      if (checkSentResponse.ok) {
        const sentData = await checkSentResponse.json();
        if (sentData.events) {
          sentEvents = new Set(sentData.events);
        }
      }

      // Get notification-worthy events using the same logic as Vercel cron
      const notificationEvents = getNotificationWorthyEvents(cosmicData);

      // Filter out events that have already been sent
      const newEvents = notificationEvents.filter((event) => {
        const eventKey = `${event.type}-${event.name}-${event.priority}`;
        return !sentEvents.has(eventKey);
      });

      if (newEvents.length === 0) {
        console.log('📭 No new events to notify about (already sent)');
        return new Response(
          JSON.stringify({
            success: true,
            notificationsSent: 0,
            primaryEvent: cosmicData.primaryEvent?.name || 'none',
            message: 'No new events (may have already been sent)',
            checkTime: new Date().toISOString(),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      // Only send 1 notification per check (limit spam)
      const eventToSend = newEvents[0];

      // Send notification
      try {
        const notification = createNotificationFromEvent(
          eventToSend,
          cosmicData,
        );

        const response = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            payload: {
              type: getNotificationType(eventToSend.type),
              title: notification.title,
              body: notification.body,
              data: {
                date: today,
                eventName: eventToSend.name,
                priority: eventToSend.priority,
                eventType: eventToSend.type,
                source: 'cloudflare-worker',
              },
            },
          }),
        });

        const result = await response.json();

        // Mark event as sent
        const eventKey = `${eventToSend.type}-${eventToSend.name}-${eventToSend.priority}`;
        await fetch(`${baseUrl}/api/notifications/mark-sent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            date: today,
            eventKey,
            type: eventToSend.type,
            name: eventToSend.name,
            priority: eventToSend.priority,
            checkType: '4-hourly',
          }),
        });

        console.log(`✅ Cloudflare notification sent: ${notification.title}`);

        return new Response(
          JSON.stringify({
            success: true,
            notificationsSent: result.recipientCount || 0,
            primaryEvent: cosmicData.primaryEvent?.name,
            eventSent: eventToSend.name,
            checkTime: new Date().toISOString(),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
      } catch (eventError) {
        console.error(
          `Failed to send notification for event ${eventToSend.name}:`,
          eventError,
        );
        throw eventError;
      }
    } catch (error) {
      console.error('❌ Cloudflare notification check failed:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Unknown error',
          checkTime: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  },

  // Handle manual triggers via HTTP
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/trigger' && request.method === 'POST') {
      // Manual trigger for testing
      return this.scheduled(null, env, ctx);
    }

    return new Response(
      'Lunary Notification Worker - Use POST /trigger to test',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      },
    );
  },
};

function getNotificationType(type) {
  const mapping = {
    moon: 'moon_phase',
    aspect: 'major_aspect',
    ingress: 'planetary_transit',
    seasonal: 'sabbat',
    retrograde: 'retrograde',
  };
  return mapping[type] || 'moon_phase';
}

function getNotificationWorthyEvents(cosmicData) {
  const events = [];
  const allEvents = [];

  // Get primary event
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
      planet: cosmicData.astronomicalData?.primaryEvent?.planet,
      sign: cosmicData.astronomicalData?.primaryEvent?.sign,
      planetA: cosmicData.astronomicalData?.primaryEvent?.planetA,
      planetB: cosmicData.astronomicalData?.primaryEvent?.planetB,
      aspect: cosmicData.astronomicalData?.primaryEvent?.aspect,
      emoji: cosmicData.primaryEvent.emoji,
      ...cosmicData.astronomicalData?.primaryEvent,
    });
  }

  // Add aspect events
  if (cosmicData.aspectEvents && Array.isArray(cosmicData.aspectEvents)) {
    allEvents.push(
      ...cosmicData.aspectEvents.map((event) => ({
        ...event,
        type: event.type || 'aspect',
      })),
    );
  }

  // Add ingress events
  if (cosmicData.ingressEvents && Array.isArray(cosmicData.ingressEvents)) {
    allEvents.push(
      ...cosmicData.ingressEvents.map((event) => ({
        ...event,
        type: event.type || 'ingress',
        priority: event.priority || 4,
      })),
    );
  }

  // Add seasonal events
  if (cosmicData.seasonalEvents && Array.isArray(cosmicData.seasonalEvents)) {
    allEvents.push(
      ...cosmicData.seasonalEvents.map((event) => ({
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
      ...cosmicData.retrogradeEvents.map((event) => ({
        ...event,
        type: event.type || 'retrograde',
        priority: event.priority || 6,
      })),
    );
  }

  // Sort by priority
  allEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Filter notification-worthy events
  const notificationWorthyEvents = allEvents.filter((event) => {
    return isEventNotificationWorthy(event);
  });

  // Only return 1 event (most important)
  return notificationWorthyEvents.slice(0, 1);
}

function isEventNotificationWorthy(event) {
  if (event.priority >= 9) return true;

  if (event.type === 'moon' && event.priority === 10) {
    const significantPhases = [
      'New Moon',
      'Full Moon',
      'First Quarter',
      'Last Quarter',
    ];
    return significantPhases.some((phase) => event.name.includes(phase));
  }

  if (event.priority === 8) return true;

  if (event.type === 'aspect' && event.priority >= 7) {
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    return outerPlanets.some(
      (planet) =>
        event.name?.includes(planet) || event.description?.includes(planet),
    );
  }

  return false;
}

function createNotificationFromEvent(event, cosmicData) {
  const baseEvent = {
    name: event.name,
    type: event.type,
    priority: event.priority,
  };

  const createNotificationTitle = (event) => {
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

  const createNotificationBody = (event) => {
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

  return {
    ...baseEvent,
    title: createNotificationTitle(event),
    body: createNotificationBody(event),
  };
}

function getMoonPhaseDescription(phaseName, cosmicData) {
  const moonSign = cosmicData?.astronomicalData?.planets?.moon?.sign;

  const constellations = {
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

  const descriptions = {
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

  if (moonSign) {
    const constellationKey = moonSign.toLowerCase();
    const constellation = constellations[constellationKey];
    if (constellation) {
      return `Moon enters ${constellation.name}: ${constellation.information} ${description}`;
    }
    return `Moon in ${moonSign}: ${description}`;
  }

  return description;
}

function getIngressDescription(planet, sign) {
  const planetInfluences = {
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

function getAspectDescription(event) {
  const planetA = event.planetA?.name || event.planetA;
  const planetB = event.planetB?.name || event.planetB;
  const aspectDescriptions = {
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

function getSeasonalDescription(eventName) {
  if (eventName.includes('Equinox')) {
    return 'Equal day and night mark a powerful balance point, supporting new beginnings and equilibrium';
  }
  if (eventName.includes('Solstice')) {
    return 'Peak daylight or darkness marks a turning point, supporting reflection and seasonal transition';
  }
  return 'Seasonal energy shift brings new themes and opportunities for growth';
}

function getRetrogradeDescription(planet, sign) {
  const retrogradeMeanings = {
    Mercury:
      'invites reflection on communication, technology, and mental patterns',
    Venus: 'encourages review of relationships, values, and what brings beauty',
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

  const meaning = retrogradeMeanings[planet] || 'invites reflection and review';
  const baseMessage = `This ${meaning}`;
  if (sign) {
    return `${baseMessage} in ${sign}. Starts retrograde today`;
  }
  return `${baseMessage}. Starts retrograde today`;
}

function getPlanetEmoji(event) {
  const text = event.name || event.description || '';
  const emojis = {
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
