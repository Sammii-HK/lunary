import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import {
  getSentEvents,
  markEventAsSent,
  cleanupOldDates,
} from '@/app/api/cron/shared-notification-tracker';
import {
  batchGetUserProfiles,
  personalizeNotificationTitle,
  personalizeNotificationBody,
  shouldPersonalize,
} from './personalization';
import { addContextualInfo } from './content-generator';

function ensureVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    const missingKeys = [];
    if (!publicKey) missingKeys.push('VAPID_PUBLIC_KEY');
    if (!privateKey) missingKeys.push('VAPID_PRIVATE_KEY');

    const errorMsg = `VAPID keys not configured. Missing: ${missingKeys.join(', ')}. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment variables.`;
    console.error('❌ VAPID Configuration Error:', {
      missingKeys,
      publicKeyConfigured: !!publicKey,
      privateKeyConfigured: !!privateKey,
      publicKeyLength: publicKey?.length || 0,
      privateKeyLength: privateKey?.length || 0,
    });
    throw new Error(errorMsg);
  }

  // Validate key format
  if (publicKey.length < 80) {
    console.warn(
      `⚠️ VAPID public key appears invalid (length: ${publicKey.length}, expected 80+)`,
    );
  }

  try {
    webpush.setVapidDetails('mailto:info@lunary.app', publicKey, privateKey);
  } catch (error) {
    console.error('❌ Failed to configure VAPID details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      publicKeyLength: publicKey.length,
      privateKeyLength: privateKey.length,
    });
    throw error;
  }
}

export interface NotificationEvent {
  name: string;
  type: string;
  priority: number;
  planet?: string;
  sign?: string;
  planetA?: any;
  planetB?: any;
  aspect?: string;
  emoji?: string;
  energy?: string;
  description?: string;
}

export interface NotificationResult {
  success: boolean;
  recipientCount: number;
  successful: number;
  failed: number;
  eventKey?: string;
  error?: string;
}

function validateEvent(event: NotificationEvent): {
  valid: boolean;
  error?: string;
} {
  if (!event) {
    return { valid: false, error: 'Event is required' };
  }
  if (!event.type || !event.type.trim()) {
    return { valid: false, error: 'Event type is required' };
  }
  if (!event.name || !event.name.trim()) {
    return { valid: false, error: 'Event name is required' };
  }
  if (event.priority === undefined || event.priority === null) {
    return { valid: false, error: 'Event priority is required' };
  }
  return { valid: true };
}

function createEventKey(event: NotificationEvent): string {
  const eventName = event.name && event.name.trim() ? event.name : 'unknown';
  const eventType = event.type && event.type.trim() ? event.type : 'unknown';
  const priority = event.priority ?? 0;
  return `${eventType}-${eventName}-${priority}`;
}

function getPreferenceKey(eventType: string): string | null {
  const mapping: Record<string, string> = {
    moon: 'moonPhases',
    moon_phase: 'moonPhases',
    aspect: 'majorAspects',
    ingress: 'planetaryTransits',
    planetary_transit: 'planetaryTransits',
    predictive_transit: 'planetaryTransits',
    retrograde: 'retrogrades',
    seasonal: 'sabbats',
    sabbat: 'sabbats',
    eclipse: 'eclipses',
  };
  return mapping[eventType] || null;
}

function createNotificationFromEvent(
  event: NotificationEvent,
  cosmicData?: any,
): {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  data: Record<string, any>;
  actions: Array<{ action: string; title: string; icon: string }>;
  vibrate: number[];
} {
  if (!event.name || !event.name.trim()) {
    event.name = 'Cosmic Event';
  }
  if (!event.type || !event.type.trim()) {
    event.type = 'cosmic';
  }
  if (event.priority === undefined || event.priority === null) {
    event.priority = 0;
  }

  const baseNotification = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      date: cosmicData?.date || new Date().toISOString().split('T')[0],
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

  const getIngressDescription = (planet?: string, sign?: string): string => {
    if (!planet || !planet.trim() || !sign || !sign.trim()) {
      return 'Planetary energy shift creating new opportunities';
    }

    const planetInfluences: Record<string, Record<string, string>> = {
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
    const trimmedSign = sign?.trim();
    if (trimmedSign) {
      return `This amplifies focus on ${trimmedSign} themes and energies`;
    }
    return 'Planetary energy shift creating new opportunities';
  };

  const getAspectDescription = (event: NotificationEvent): string => {
    if (!event.aspect || !event.aspect.trim()) {
      return 'Powerful cosmic alignment creating new opportunities';
    }

    const planetA = event.planetA?.name || event.planetA;
    const planetB = event.planetB?.name || event.planetB;

    if (
      !planetA ||
      !planetB ||
      typeof planetA !== 'string' ||
      typeof planetB !== 'string'
    ) {
      return 'Powerful cosmic alignment creating new opportunities';
    }

    const aspectDescriptions: Record<string, string> = {
      conjunction: 'unite their energies',
      trine: 'flow harmoniously together',
      square: 'create dynamic tension',
      sextile: 'offer cooperative opportunities',
      opposition: 'seek balance between',
    };
    const aspectAction = aspectDescriptions[event.aspect] || 'align';
    return `${planetA} and ${planetB} ${aspectAction}, creating powerful cosmic influence`;
  };

  const getMoonDescription = (phaseName: string, moonSign?: string): string => {
    if (!phaseName || !phaseName.trim()) {
      phaseName = 'Moon Phase';
    }

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

    if (moonSign && moonSign.trim()) {
      return `Moon in ${moonSign}: ${description}`;
    }

    return description;
  };

  const getRetrogradeDescription = (planet?: string, sign?: string): string => {
    if (!planet || !planet.trim()) {
      return 'Planetary retrograde invites reflection and review';
    }

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
    if (sign && sign.trim()) {
      return `This ${meaning} in ${sign}`;
    }
    return `This ${meaning}`;
  };

  const getSeasonalDescription = (eventName: string): string => {
    if (!eventName || !eventName.trim()) {
      return 'Seasonal energy shift brings new themes and opportunities for growth';
    }
    if (eventName.includes('Equinox')) {
      return 'Equal day and night mark a powerful balance point, supporting new beginnings and equilibrium';
    }
    if (eventName.includes('Solstice')) {
      return 'Peak daylight or darkness marks a turning point, supporting reflection and seasonal transition';
    }
    return 'Seasonal energy shift brings new themes and opportunities for growth';
  };

  const createTitle = (event: NotificationEvent): string => {
    const eventName =
      event.name && event.name.trim() ? event.name : 'Cosmic Event';

    switch (event.type) {
      case 'moon':
        return eventName || 'Moon Phase';

      case 'aspect':
        if (
          event.planetA &&
          event.planetB &&
          event.aspect &&
          event.aspect.trim()
        ) {
          const planetAName =
            (typeof event.planetA === 'string'
              ? event.planetA
              : event.planetA?.name) || 'Planet';
          const planetBName =
            (typeof event.planetB === 'string'
              ? event.planetB
              : event.planetB?.name) || 'Planet';
          if (planetAName !== 'Planet' && planetBName !== 'Planet') {
            const aspectName =
              event.aspect.charAt(0).toUpperCase() + event.aspect.slice(1);
            return `${planetAName}-${planetBName} ${aspectName}`;
          }
        }
        return eventName || 'Planetary Aspect';

      case 'seasonal':
        return eventName || 'Seasonal Event';

      case 'ingress':
        if (
          event.planet &&
          event.planet.trim() &&
          event.sign &&
          event.sign.trim()
        ) {
          return `${event.planet} Enters ${event.sign}`;
        }
        if (eventName && eventName.includes('Enters')) {
          return eventName;
        }
        return eventName || 'Planetary Ingress';

      case 'retrograde':
        if (event.planet && event.planet.trim()) {
          return `${event.planet} Retrograde Begins`;
        }
        if (eventName && eventName.includes('Retrograde')) {
          return eventName;
        }
        return eventName || 'Planetary Retrograde';

      default:
        return eventName || 'Cosmic Event';
    }
  };

  const createBody = (event: NotificationEvent): string => {
    switch (event.type) {
      case 'moon':
        const moonSign = cosmicData?.astronomicalData?.planets?.moon?.sign;
        const moonPhaseName =
          event.name && event.name.trim() ? event.name : 'Moon Phase';
        return getMoonDescription(moonPhaseName, moonSign);

      case 'aspect':
        return getAspectDescription(event);

      case 'seasonal':
        const seasonalName =
          event.name && event.name.trim() ? event.name : 'Seasonal Event';
        return getSeasonalDescription(seasonalName);

      case 'ingress':
        let ingressPlanet = event.planet;
        let ingressSign = event.sign;

        if (!ingressPlanet && event.name) {
          const nameParts = event.name.split(' ');
          ingressPlanet = nameParts[0] || undefined;
        }
        if (!ingressSign && event.name) {
          const nameParts = event.name.split(' ');
          ingressSign = nameParts[2] || undefined;
        }

        return getIngressDescription(ingressPlanet, ingressSign);

      case 'retrograde':
        let retrogradePlanet = event.planet;

        if (!retrogradePlanet && event.name) {
          const nameParts = event.name.split(' ');
          retrogradePlanet = nameParts[0] || undefined;
        }

        return getRetrogradeDescription(retrogradePlanet, event.sign);

      default:
        return (
          (event.energy && event.energy.trim()) ||
          (event.description && event.description.trim()) ||
          'Significant cosmic event occurring'
        );
    }
  };

  let title = createTitle(event);
  let body = createBody(event);

  body = addContextualInfo(body, event, cosmicData);

  return {
    ...baseNotification,
    title,
    body,
    tag: `lunary-${event.type}`,
    data: {
      ...baseNotification.data,
      eventName: event.name || 'Cosmic Event',
      ...(event.type === 'moon' && event.name && { phase: event.name }),
      ...(event.type === 'aspect' && event.name && { aspect: event.name }),
      ...(event.type === 'seasonal' && event.name && { season: event.name }),
      ...(event.type === 'ingress' && event.name && { ingress: event.name }),
    },
  };
}

async function createPersonalizedNotification(
  event: NotificationEvent,
  cosmicData: any,
  userProfile: any,
): Promise<{
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  data: Record<string, any>;
  actions: Array<{ action: string; title: string; icon: string }>;
  vibrate: number[];
}> {
  const baseNotification = createNotificationFromEvent(event, cosmicData);

  if (shouldPersonalize(userProfile, event.type)) {
    baseNotification.title = personalizeNotificationTitle(
      baseNotification.title,
      userProfile.name,
    );
    baseNotification.body = personalizeNotificationBody(
      baseNotification.body,
      event.type,
      userProfile,
    );
  }

  return baseNotification;
}

export async function sendUnifiedNotification(
  event: NotificationEvent,
  cosmicData?: any,
  sentBy: 'daily' | '4-hourly' = 'daily',
): Promise<NotificationResult> {
  try {
    ensureVapidConfigured();

    const validation = validateEvent(event);
    if (!validation.valid) {
      console.error(`Invalid event: ${validation.error}`, event);
      return {
        success: false,
        recipientCount: 0,
        successful: 0,
        failed: 0,
        error: validation.error,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const eventKey = createEventKey(event);

    await cleanupOldDates(1);

    const sentEvents = await getSentEvents(today);
    if (sentEvents.has(eventKey)) {
      console.log(
        `⏭️ Event ${eventKey} already sent today, skipping duplicate`,
      );
      return {
        success: true,
        recipientCount: 0,
        successful: 0,
        failed: 0,
        eventKey,
      };
    }

    const notification = createNotificationFromEvent(event, cosmicData);
    const preferenceKey = getPreferenceKey(event.type);

    let subscriptions;
    if (preferenceKey) {
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth, user_id, preferences
        FROM push_subscriptions 
        WHERE is_active = true 
        AND preferences->>${preferenceKey} = 'true'
      `;
    } else {
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth, user_id, preferences
        FROM push_subscriptions 
        WHERE is_active = true
      `;
    }

    if (subscriptions.rows.length === 0) {
      console.log(
        `📭 No active subscriptions found for event type: ${event.type}`,
      );
      await markEventAsSent(
        today,
        eventKey,
        event.type,
        event.name,
        event.priority,
        sentBy,
      );
      return {
        success: true,
        recipientCount: 0,
        successful: 0,
        failed: 0,
        eventKey,
      };
    }

    console.log(
      `📱 Sending notification to ${subscriptions.rows.length} subscribers`,
    );

    // Batch fetch all user profiles to avoid N+1 queries
    const userIds = subscriptions.rows
      .map((sub: any) => sub.user_id)
      .filter(Boolean);
    const uniqueUserIds = [...new Set(userIds)] as string[];
    const profileMap =
      uniqueUserIds.length > 0
        ? await batchGetUserProfiles(uniqueUserIds)
        : new Map();

    const sendPromises = subscriptions.rows.map(async (sub: any) => {
      try {
        let personalizedNotification = notification;

        if (sub.user_id) {
          const userProfile = profileMap.get(sub.user_id) ?? null;
          if (userProfile && shouldPersonalize(userProfile, event.type)) {
            personalizedNotification = await createPersonalizedNotification(
              event,
              cosmicData,
              userProfile,
            );
          }
        }

        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(personalizedNotification),
        );

        await sql`
          UPDATE push_subscriptions 
          SET last_notification_sent = NOW() 
          WHERE endpoint = ${sub.endpoint}
        `;

        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        const errorObj = error as any;
        const statusCode = errorObj?.statusCode;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const endpointPreview = sub.endpoint.substring(0, 50);

        // Enhanced error logging with VAPID and subscription details
        console.error(
          `❌ Failed to send notification to ${endpointPreview}...`,
          {
            endpoint: endpointPreview,
            userId: sub.user_id || 'anonymous',
            statusCode,
            error: errorMessage,
            errorType: errorObj?.name || 'Unknown',
            hasVapidKeys: !!(
              process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
            ),
            timestamp: new Date().toISOString(),
          },
        );

        const isExpired =
          statusCode === 410 ||
          statusCode === 404 ||
          errorMessage.includes('410') ||
          errorMessage.includes('404') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('unsubscribed') ||
          errorMessage.includes('Gone') ||
          errorMessage.includes('Not Found');

        if (isExpired) {
          console.log(
            `🔄 Marking subscription as inactive due to ${statusCode || 'expired'}: ${endpointPreview}...`,
          );
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false, updated_at = NOW()
            WHERE endpoint = ${sub.endpoint}
          `;
        }

        return {
          success: false,
          endpoint: sub.endpoint,
          error: errorMessage,
          statusCode,
        };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failed = results.length - successful;

    await markEventAsSent(
      today,
      eventKey,
      event.type,
      event.name,
      event.priority,
      sentBy,
    );

    console.log(
      `✅ Notification sent: ${successful} successful, ${failed} failed`,
    );

    return {
      success: successful > 0,
      recipientCount: subscriptions.rows.length,
      successful,
      failed,
      eventKey,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error sending unified notification:', {
      error: errorMessage,
      eventType: event?.type,
      eventName: event?.name,
      errorType: error instanceof Error ? error.name : 'Unknown',
      hasVapidKeys: !!(
        process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
      ),
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      recipientCount: 0,
      successful: 0,
      failed: 0,
      error: errorMessage,
    };
  }
}
