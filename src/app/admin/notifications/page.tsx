'use client';

import { useState, useEffect } from 'react';

interface NotificationPreview {
  title: string;
  body: string;
  type: string;
  priority: number;
  eventName: string;
  wouldSend: boolean;
}

export default function NotificationAdminPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [cosmicData, setCosmicData] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribers, setSubscribers] = useState(0);

  useEffect(() => {
    loadNotificationPreview(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadNotificationPreview = async (date: string) => {
    setLoading(true);
    try {
      // Fetch cosmic data
      const response = await fetch(`/api/og/cosmic-post/${date}`);
      const data = await response.json();
      setCosmicData(data);

      // Generate notification previews
      const previews: NotificationPreview[] = [];

      // Build allEvents array from available data
      const allEvents: any[] = [];

      // Get primary event with full metadata
      const primaryEventType =
        data.astronomicalData?.primaryEvent?.type || 'unknown';
      const primaryEventPriority =
        data.astronomicalData?.primaryEvent?.priority || 0;

      if (data.primaryEvent) {
        allEvents.push({
          name: data.primaryEvent.name,
          energy: data.primaryEvent.energy,
          type: primaryEventType,
          priority: primaryEventPriority,
          ...data.astronomicalData?.primaryEvent,
        });
      }

      // Add aspect events
      if (data.aspectEvents && Array.isArray(data.aspectEvents)) {
        allEvents.push(
          ...data.aspectEvents.map((event: any) => ({
            ...event,
            type: event.type || 'aspect',
          })),
        );
      }

      // Add ingress events
      if (data.ingressEvents && Array.isArray(data.ingressEvents)) {
        allEvents.push(
          ...data.ingressEvents.map((event: any) => ({
            ...event,
            type: event.type || 'ingress',
            priority: event.priority || 4,
          })),
        );
      }

      // Add seasonal events
      if (data.seasonalEvents && Array.isArray(data.seasonalEvents)) {
        allEvents.push(
          ...data.seasonalEvents.map((event: any) => ({
            ...event,
            type: event.type || 'seasonal',
            priority: event.priority || 8,
          })),
        );
      }

      // Add retrograde events
      if (data.retrogradeEvents && Array.isArray(data.retrogradeEvents)) {
        allEvents.push(
          ...data.retrogradeEvents.map((event: any) => ({
            ...event,
            type: event.type || 'retrograde',
            priority: event.priority || 6,
          })),
        );
      }

      // Add retrograde ingress events
      if (data.retrogradeIngress && Array.isArray(data.retrogradeIngress)) {
        allEvents.push(
          ...data.retrogradeIngress.map((event: any) => ({
            ...event,
            type: event.type || 'retrograde',
            priority: event.priority || 6,
          })),
        );
      }

      // Sort by priority
      allEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      // Get notification-worthy events (priority >= 7, or moon phases/seasonal)
      const notificationWorthyEvents = allEvents.filter((event: any) => {
        const priority = event.priority || 0;
        if (priority >= 7) return true;
        if (event.type === 'moon' && priority >= 10) return true;
        if (event.type === 'seasonal' && priority >= 8) return true;
        return false;
      });

      // Create previews for up to 5 most significant events
      const eventsToShow = notificationWorthyEvents.slice(0, 5);

      for (const event of eventsToShow) {
        const wouldSend = isNotificationWorthy(event);
        previews.push({
          title: createNotificationTitle(event),
          body: createNotificationBody(event),
          type: event.type || 'unknown',
          priority: event.priority || 0,
          eventName: event.name,
          wouldSend,
        });
      }

      setNotifications(previews);

      // Get subscriber count
      const subResponse = await fetch('/api/admin/subscriber-count');
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscribers(subData.count || 0);
      }
    } catch (error) {
      console.error('Error loading notification preview:', error);
    }
    setLoading(false);
  };

  const isNotificationWorthy = (event: any): boolean => {
    const priority = event.priority || 0;

    // Extraordinary planetary events
    if (priority >= 9) return true;

    // Moon phases (only exact phases)
    if (event.type === 'moon' && priority === 10) {
      const significantPhases = [
        'New Moon',
        'Full Moon',
        'First Quarter',
        'Last Quarter',
      ];
      return significantPhases.some((phase) => event.name?.includes(phase));
    }

    // Seasonal events
    if (event.type === 'seasonal' && priority >= 8) return true;

    // Major aspects involving outer planets
    if (event.type === 'aspect' && priority >= 7) {
      const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
      const eventText = (event.name || event.description || '').toLowerCase();
      return outerPlanets.some((planet) =>
        eventText.includes(planet.toLowerCase()),
      );
    }

    // Retrograde events with high priority
    if (event.type === 'retrograde' && priority >= 7) return true;

    return false;
  };

  const createNotificationTitle = (event: any) => {
    const eventName = event.name || 'Cosmic Event';

    switch (event.type) {
      case 'moon':
        return eventName;

      case 'aspect':
        // Make aspect titles descriptive
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
        // Make ingress titles descriptive
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

  const sendTestNotification = async (notification: NotificationPreview) => {
    try {
      // Map notification type to the format expected by the send endpoint
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

      const notificationPayload = {
        type: getNotificationType(notification.type),
        title: notification.title,
        body: notification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
          url: '/',
          date: selectedDate,
          eventName: notification.eventName,
          priority: notification.priority,
          eventType: notification.type,
          isTest: true,
        },
      };

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: notificationPayload,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `Notification sent successfully!\n\n${result.recipientCount || 0} recipients\n${result.successful || 0} successful\n${result.failed || 0} failed`,
        );
      } else {
        alert(
          `Notification send failed: ${result.error || result.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      console.error('Test notification error:', error);
      alert(
        `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-2xl md:text-3xl font-bold mb-6 md:mb-8'>
          Notification Admin Dashboard
        </h1>

        {/* Date Selector */}
        <div className='mb-6 md:mb-8'>
          <label className='block text-sm font-medium mb-2'>
            Preview Date:
          </label>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white'
          />
          <div className='text-sm text-zinc-400 mt-2'>
            Active Subscribers: {subscribers}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className='text-center py-8'>
            <div className='text-zinc-400'>Loading cosmic data...</div>
          </div>
        )}

        {/* Notification Previews */}
        {!loading && (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold'>
              Notifications for {selectedDate}
            </h2>

            {notifications.length === 0 ? (
              <div className='text-zinc-400 text-center py-8'>
                No notifications would be sent for this date
              </div>
            ) : (
              <div className='grid gap-4'>
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 md:p-6 ${
                      notification.wouldSend
                        ? 'border-green-600 bg-green-950/20'
                        : 'border-zinc-700 bg-zinc-800/50'
                    }`}
                  >
                    <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-4'>
                      <div className='flex-1'>
                        <div className='font-semibold text-lg md:text-xl mb-2'>
                          {notification.title}
                        </div>
                        <div className='text-zinc-300 mb-3 md:mb-4'>
                          {notification.body}
                        </div>
                        <div className='flex flex-wrap gap-4 text-sm text-zinc-400'>
                          <span>Priority: {notification.priority}</span>
                          <span>Type: {notification.type}</span>
                          <span
                            className={
                              notification.wouldSend
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            {notification.wouldSend
                              ? 'Will Send'
                              : 'Filtered Out'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => sendTestNotification(notification)}
                        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors whitespace-nowrap'
                      >
                        Test Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cosmic Data Debug */}
            {cosmicData && (
              <details className='mt-8'>
                <summary className='cursor-pointer text-zinc-400 hover:text-white'>
                  Debug: Raw Cosmic Data
                </summary>
                <pre className='bg-zinc-900 p-4 rounded mt-2 text-xs overflow-auto'>
                  {JSON.stringify(cosmicData, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
