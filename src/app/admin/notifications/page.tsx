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

      // Check primary event
      if (data.primaryEvent) {
        const wouldSend = data.primaryEvent.priority >= 7;
        previews.push({
          title: createNotificationTitle(data.primaryEvent),
          body: createNotificationBody(data.primaryEvent),
          type: data.primaryEvent.type || 'unknown',
          priority: data.primaryEvent.priority || 0,
          eventName: data.primaryEvent.name,
          wouldSend,
        });
      }

      // Check all events with priority 7+
      if (data.allEvents) {
        const significantEvents = data.allEvents
          .filter(
            (event: any) => event.priority >= 7 && event !== data.primaryEvent,
          )
          .slice(0, 3);

        for (const event of significantEvents) {
          previews.push({
            title: createNotificationTitle(event),
            body: createNotificationBody(event),
            type: event.type || 'unknown',
            priority: event.priority || 0,
            eventName: event.name,
            wouldSend: true,
          });
        }
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

  const createNotificationTitle = (event: any) => {
    switch (event.type) {
      case 'moon':
        return `${event.emoji || '🌙'} ${event.name}`;
      case 'aspect':
        return `${getPlanetEmoji(event)} ${event.name}`;
      case 'seasonal':
        return `🌿 ${event.name}`;
      case 'ingress':
        return `${getPlanetEmoji(event)} ${event.name}`;
      default:
        return `✨ ${event.name}`;
    }
  };

  const createNotificationBody = (event: any) => {
    const baseBody = event.energy || 'Cosmic event occurring';

    switch (event.type) {
      case 'moon':
        return `${baseBody} - ${getPhaseGuidance(event.name)}`;
      case 'aspect':
        return `${baseBody} - Powerful cosmic alignment forming`;
      case 'seasonal':
        return `${baseBody} - Seasonal energy shift begins`;
      case 'ingress':
        return `${baseBody} - New cosmic energy emerges`;
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

  const getPlanetEmoji = (event: any) => {
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
  };

  const sendTestNotification = async (notification: NotificationPreview) => {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
        },
        body: JSON.stringify({
          testType: 'custom',
          title: notification.title,
          body: notification.body,
          eventType: notification.type,
        }),
      });

      const result = await response.json();
      alert(
        `Test sent! ${result.notificationsSent || 0} notifications delivered`,
      );
    } catch (error) {
      alert('Test failed: ' + error);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>
          🔔 Notification Admin Dashboard
        </h1>

        {/* Date Selector */}
        <div className='mb-8'>
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
            📊 Active Subscribers: {subscribers}
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
              📱 Notifications for {selectedDate}
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
                    className={`border rounded-lg p-4 ${
                      notification.wouldSend
                        ? 'border-green-600 bg-green-950/20'
                        : 'border-zinc-700 bg-zinc-800/50'
                    }`}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div className='flex-1'>
                        <div className='font-semibold text-lg mb-1'>
                          {notification.title}
                        </div>
                        <div className='text-zinc-300 mb-2'>
                          {notification.body}
                        </div>
                        <div className='flex gap-4 text-sm text-zinc-400'>
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
                              ? '✅ Will Send'
                              : '❌ Filtered Out'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => sendTestNotification(notification)}
                        className='ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors'
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
                  🔍 Debug: Raw Cosmic Data
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
