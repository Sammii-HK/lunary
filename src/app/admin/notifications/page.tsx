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
    const baseBody = event.energy || 'Cosmic event occurring';

    switch (event.type) {
      case 'moon':
        return `${baseBody} - ${getPhaseGuidance(event.name)}`;

      case 'aspect':
        if (event.aspect) {
          const aspectDesc = getAspectDescription(event.aspect);
          const signA = event.planetA?.constellation || event.signA;
          const signB = event.planetB?.constellation || event.signB;
          if (signA && signB) {
            return `${baseBody} - ${aspectDesc} in ${signA} and ${signB}`;
          }
          return `${baseBody} - ${aspectDesc} forming`;
        }
        return `${baseBody} - Powerful cosmic alignment forming`;

      case 'seasonal':
        return `${baseBody} - Seasonal energy shift begins`;

      case 'ingress':
        if (event.planet && event.sign) {
          return `${baseBody} - ${event.planet} energy shifts to ${event.sign} themes`;
        }
        return `${baseBody} - New cosmic energy emerges`;

      case 'retrograde':
        if (event.planet) {
          return `${baseBody} - ${event.planet} moves retrograde, inviting reflection`;
        }
        return `${baseBody} - Planetary retrograde begins`;

      default:
        return baseBody;
    }
  };

  const getPhaseGuidance = (phaseName: string) => {
    const guidance: Record<string, string> = {
      'New Moon': 'Perfect time for new beginnings and intention setting',
      'Full Moon': 'Time for release, gratitude, and manifestation',
      'First Quarter': 'Take action on your intentions and push forward',
      'Last Quarter': 'Release what no longer serves and reflect',
    };

    for (const [phase, message] of Object.entries(guidance)) {
      if (phaseName.includes(phase)) return message;
    }

    return 'Lunar energy shift occurring';
  };

  const getAspectDescription = (aspect: string) => {
    const descriptions: Record<string, string> = {
      conjunction: 'Planets unite',
      trine: 'Harmonious flow',
      square: 'Dynamic tension',
      sextile: 'Cooperative opportunities',
      opposition: 'Seeking balance',
    };
    return descriptions[aspect] || 'Planetary alignment';
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
