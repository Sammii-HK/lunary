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

interface SentNotification {
  id: number;
  date: string;
  eventKey: string;
  eventType: string;
  eventName: string;
  priority: number;
  sentBy: string;
  sentAt: string;
}

interface SentSummary {
  type: string;
  count: number;
  lastSent: string;
}

export default function NotificationAdminPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [cosmicData, setCosmicData] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribers, setSubscribers] = useState(0);
  const [sentHistory, setSentHistory] = useState<SentNotification[]>([]);
  const [sentSummary, setSentSummary] = useState<SentSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');

  useEffect(() => {
    loadNotificationPreview(selectedDate);
    loadSentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadSentHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(
        '/api/admin/notifications/sent-history?days=7&limit=50',
      );
      if (response.ok) {
        const data = await response.json();
        setSentHistory(data.notifications || []);
        setSentSummary(data.summary || []);
      }
    } catch (error) {
      console.error('Error loading sent history:', error);
    }
    setHistoryLoading(false);
  };

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
            priority: event.priority || 8, // Ingress events have priority 8
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
            priority: event.priority || 8, // Retrograde events have priority 8
          })),
        );
      }

      // Add retrograde ingress events
      if (data.retrogradeIngress && Array.isArray(data.retrogradeIngress)) {
        allEvents.push(
          ...data.retrogradeIngress.map((event: any) => ({
            ...event,
            type: event.type || 'retrograde',
            priority: event.priority || 8, // Retrograde ingress events have priority 8
          })),
        );
      }

      // Sort by priority
      allEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      // Filter notification-worthy events using the same logic as crons
      const notificationWorthyEvents = allEvents.filter((event: any) => {
        return isNotificationWorthy(event);
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

    // ALL priority 8 events (seasonal, ingress, retrograde)
    if (priority === 8) return true;

    // Major aspects involving outer planets
    if (event.type === 'aspect' && priority >= 7) {
      const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
      const eventText = (event.name || event.description || '').toLowerCase();
      return outerPlanets.some((planet) =>
        eventText.includes(planet.toLowerCase()),
      );
    }

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

        {/* Tab Navigation */}
        <div className='flex gap-4 mb-6 border-b border-zinc-800'>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sent History
          </button>
        </div>

        {activeTab === 'preview' && (
          <>
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
          </>
        )}

        {activeTab === 'preview' && (
          <>
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
          </>
        )}

        {activeTab === 'history' && (
          <div className='space-y-6'>
            {/* Summary Cards */}
            {sentSummary.length > 0 && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {sentSummary.map((item) => (
                  <div
                    key={item.type}
                    className='bg-zinc-800/50 border border-zinc-700 rounded-lg p-4'
                  >
                    <div className='text-2xl font-bold'>{item.count}</div>
                    <div className='text-sm text-zinc-400 capitalize'>
                      {item.type.replace(/_/g, ' ')}
                    </div>
                    <div className='text-xs text-zinc-500 mt-1'>
                      Last: {new Date(item.lastSent).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className='text-xl font-semibold'>
              Recently Sent Notifications (Last 7 Days)
            </h2>

            {historyLoading ? (
              <div className='text-center py-8'>
                <div className='text-zinc-400'>Loading sent history...</div>
              </div>
            ) : sentHistory.length === 0 ? (
              <div className='text-zinc-400 text-center py-8'>
                No notifications sent in the last 7 days
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='text-left text-zinc-400 border-b border-zinc-800'>
                      <th className='pb-3 pr-4'>Date</th>
                      <th className='pb-3 pr-4'>Event</th>
                      <th className='pb-3 pr-4'>Type</th>
                      <th className='pb-3 pr-4'>Priority</th>
                      <th className='pb-3'>Sent By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentHistory.map((notification) => (
                      <tr
                        key={notification.id}
                        className='border-b border-zinc-800/50 hover:bg-zinc-800/30'
                      >
                        <td className='py-3 pr-4 text-zinc-300'>
                          {new Date(notification.sentAt).toLocaleString()}
                        </td>
                        <td className='py-3 pr-4 font-medium'>
                          {notification.eventName}
                        </td>
                        <td className='py-3 pr-4'>
                          <span className='px-2 py-1 bg-zinc-700 rounded text-xs capitalize'>
                            {notification.eventType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className='py-3 pr-4'>
                          <span
                            className={`${
                              notification.priority >= 9
                                ? 'text-red-400'
                                : notification.priority >= 7
                                  ? 'text-yellow-400'
                                  : 'text-zinc-400'
                            }`}
                          >
                            {notification.priority}
                          </span>
                        </td>
                        <td className='py-3 text-zinc-400'>
                          {notification.sentBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={loadSentHistory}
              className='px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors'
            >
              Refresh History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
