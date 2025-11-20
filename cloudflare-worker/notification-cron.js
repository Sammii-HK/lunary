/**
 * Cloudflare Worker for Lunary Push Notifications
 * Uses your cosmic API's allEvents array
 * Updated with improved descriptions and duplicate prevention
 */

export default {
  async scheduled(event, env, ctx) {
    const now = new Date();
    const hour = now.getUTCHours();
    const dayOfWeek = now.getUTCDay();
    const today = now.toISOString().split('T')[0];
    const baseUrl = 'https://www.lunary.app';

    console.log(
      '🔔 Cloudflare cron started at:',
      now.toISOString(),
      'Hour:',
      hour,
      'Day:',
      dayOfWeek,
    );

    // Sunday at 10 AM - weekly cosmic report
    if (dayOfWeek === 0 && hour === 10) {
      return await handleWeeklyCosmicReport(baseUrl, env, today);
    }

    // Daily at 8 AM - cosmic pulse and cosmic snapshot update
    if (hour === 8) {
      const results = await Promise.allSettled([
        handleDailyCosmicPulse(baseUrl, env, today),
        handleCosmicSnapshotUpdates(baseUrl, env, today),
      ]);
      return new Response(
        JSON.stringify({
          success: true,
          results: results.map((r) =>
            r.status === 'fulfilled' ? r.value : { error: r.reason },
          ),
          timestamp: now.toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Daily at 2 PM - daily posts (created the day before for next day) and cosmic changes notification
    if (hour === 14) {
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const results = await Promise.allSettled([
        handleDailyPosts(baseUrl, env, tomorrowStr),
        handleCosmicChangesNotification(baseUrl, env, today),
      ]);
      return new Response(
        JSON.stringify({
          success: true,
          results: results.map((r) =>
            r.status === 'fulfilled' ? r.value : { error: r.reason },
          ),
          timestamp: now.toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Daily at 6 PM - personalized tarot
    if (hour === 18) {
      return await handlePersonalizedTarot(baseUrl, env, today);
    }

    // Daily at 2 AM - cleanup, analytics summary, and SEO metrics sync
    if (hour === 2) {
      const results = await Promise.allSettled([
        handleDiscordLogsCleanup(baseUrl, env),
        handleDiscordAnalyticsDaily(baseUrl, env),
        handleSEOMetricsSync(baseUrl, env),
      ]);
      return new Response(
        JSON.stringify({
          success: true,
          results: results.map((r) =>
            r.status === 'fulfilled' ? r.value : { error: r.reason },
          ),
          timestamp: now.toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Daily at 10 AM - moon circles check and cosmic snapshot update
    if (hour === 10) {
      const results = await Promise.allSettled([
        handleMoonCircles(baseUrl, env, today),
        handleCosmicSnapshotUpdates(baseUrl, env, today),
      ]);
      return new Response(
        JSON.stringify({
          success: true,
          results: results.map((r) =>
            r.status === 'fulfilled' ? r.value : { error: r.reason },
          ),
          timestamp: now.toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Every 4 hours (0, 4, 12, 16) - cosmic snapshot updates
    // Note: hours 8 and 20 are handled above
    if ([0, 4, 12, 16].includes(hour)) {
      return await handleCosmicSnapshotUpdates(baseUrl, env, today);
    }

    // Fallback for any other times
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No scheduled task for this time',
        hour,
        timestamp: now.toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const baseUrl = 'https://www.lunary.app';
    const today = new Date().toISOString().split('T')[0];

    if (url.pathname === '/trigger' && request.method === 'POST') {
      return await this.scheduled(null, env, ctx);
    }

    if (url.pathname === '/cosmic-changes' && request.method === 'POST') {
      return await handleCosmicChangesNotification(baseUrl, env, today);
    }

    if (url.pathname === '/cosmic-snapshots' && request.method === 'POST') {
      return await handleCosmicSnapshotUpdates(baseUrl, env, today);
    }

    if (url.pathname === '/daily-cosmic-pulse' && request.method === 'POST') {
      return await handleDailyCosmicPulse(baseUrl, env, today);
    }

    if (url.pathname === '/weekly-report' && request.method === 'POST') {
      return await handleWeeklyCosmicReport(baseUrl, env, today);
    }

    if (url.pathname === '/moon-circles' && request.method === 'POST') {
      return await handleMoonCircles(baseUrl, env, today);
    }

    if (url.pathname === '/daily-posts' && request.method === 'POST') {
      return await handleDailyPosts(baseUrl, env, today);
    }

    if (url.pathname === '/personalized-tarot' && request.method === 'POST') {
      return await handlePersonalizedTarot(baseUrl, env, today);
    }

    if (url.pathname === '/discord-cleanup' && request.method === 'POST') {
      return await handleDiscordLogsCleanup(baseUrl, env);
    }

    if (url.pathname === '/discord-analytics' && request.method === 'POST') {
      return await handleDiscordAnalyticsDaily(baseUrl, env);
    }

    return new Response(
      'Lunary Notification Worker - Use POST /trigger, /cosmic-changes, /cosmic-snapshots, /daily-cosmic-pulse, /weekly-report, /moon-circles, /daily-posts, /personalized-tarot, /discord-cleanup, or /discord-analytics to test',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      },
    );
  },
};

async function handleCosmicChangesNotification(baseUrl, env, today) {
  try {
    console.log('[cosmic-changes] Starting cosmic changes check');

    const response = await fetch(
      `${baseUrl}/api/cron/cosmic-changes-notification`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
        },
      },
    );

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[cosmic-changes] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handleCosmicSnapshotUpdates(baseUrl, env, today) {
  try {
    console.log('[cosmic-snapshots] Starting snapshot updates');

    const now = new Date();
    const hour = now.getUTCHours();

    const results = [];

    // Update global cosmic data (every 2 hours, but we run every 4, so check if divisible by 2)
    if (hour % 2 === 0) {
      try {
        const globalResponse = await fetch(
          `${baseUrl}/api/cron/update-global-cosmic-data`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${env.CRON_SECRET}`,
            },
          },
        );
        const globalResult = await globalResponse.json();
        results.push({ task: 'global-cosmic-data', ...globalResult });
      } catch (error) {
        console.error('[cosmic-snapshots] Global data update failed:', error);
      }
    }

    // Update user snapshots (every 4 hours)
    try {
      const snapshotResponse = await fetch(
        `${baseUrl}/api/cron/update-cosmic-snapshots`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${env.CRON_SECRET}`,
          },
        },
      );
      const snapshotResult = await snapshotResponse.json();
      results.push({ task: 'user-snapshots', ...snapshotResult });
    } catch (error) {
      console.error('[cosmic-snapshots] User snapshot update failed:', error);
    }

    // Cleanup old snapshots (every 6 hours, check if divisible by 6)
    if (hour % 6 === 0) {
      try {
        const cleanupResponse = await fetch(
          `${baseUrl}/api/cron/cleanup-cosmic-snapshots`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${env.CRON_SECRET}`,
            },
          },
        );
        const cleanupResult = await cleanupResponse.json();
        results.push({ task: 'cleanup', ...cleanupResult });
      } catch (error) {
        console.error('[cosmic-snapshots] Cleanup failed:', error);
      }
    }

    // Also run the original notification check
    try {
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

      if (newEvents.length > 0) {
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
          results.push({
            task: 'cosmic-events',
            notificationsSent: result.recipientCount || 0,
            eventSent: eventToSend.name,
          });
        } catch (eventError) {
          console.error(
            `Failed to send notification for event ${eventToSend.name}:`,
            eventError,
          );
        }
      }
    } catch (error) {
      console.error(
        '[cosmic-snapshots] Original notification check failed:',
        error,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[cosmic-snapshots] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

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

async function handleDailyCosmicPulse(baseUrl, env, today) {
  try {
    console.log('[daily-cosmic-pulse] Starting daily cosmic pulse');
    const response = await fetch(`${baseUrl}/api/cron/daily-cosmic-pulse`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[daily-cosmic-pulse] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handleWeeklyCosmicReport(baseUrl, env, today) {
  try {
    console.log('[weekly-report] Starting weekly cosmic report');
    const response = await fetch(`${baseUrl}/api/cron/weekly-cosmic-report`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[weekly-report] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handleMoonCircles(baseUrl, env, today) {
  try {
    console.log('[moon-circles] Starting moon circles check');
    const response = await fetch(`${baseUrl}/api/cron/moon-circles`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[moon-circles] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handleDailyPosts(baseUrl, env, today) {
  try {
    console.log('[daily-posts] Starting daily posts');
    const response = await fetch(`${baseUrl}/api/cron/daily-posts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[daily-posts] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handlePersonalizedTarot(baseUrl, env, today) {
  try {
    console.log('[personalized-tarot] Starting personalized tarot');
    const response = await fetch(`${baseUrl}/api/cron/personalized-tarot`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[personalized-tarot] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handleDiscordLogsCleanup(baseUrl, env) {
  try {
    console.log('[discord-cleanup] Starting Discord logs cleanup');
    const response = await fetch(`${baseUrl}/api/cron/cleanup-discord-logs`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[discord-cleanup] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handleDiscordAnalyticsDaily(baseUrl, env) {
  try {
    console.log('[discord-analytics] Starting Discord analytics daily summary');
    const response = await fetch(
      `${baseUrl}/api/cron/discord-analytics-daily`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
        },
      },
    );
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[discord-analytics] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

async function handleSEOMetricsSync(baseUrl, env) {
  try {
    console.log('[seo-sync] Starting SEO metrics sync');
    const response = await fetch(`${baseUrl}/api/cron/sync-seo-metrics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[seo-sync] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
