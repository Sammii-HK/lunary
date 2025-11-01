'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { PushSubscription } from '../../schema';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export function NotificationSettings() {
  const { me } = useAccount();
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });
  const [subscription, setSubscription] =
    useState<globalThis.PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default',
      });

      // If permission is granted, check for existing subscription
      if (currentPermission === 'granted' && 'serviceWorker' in navigator) {
        await getExistingSubscription();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const getExistingSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();

      if (existingSub) {
        setSubscription(existingSub);
        console.log('✅ Found existing push subscription');
      } else {
        console.log('ℹ️ No existing push subscription found');
      }
    } catch (error) {
      console.error('Error getting existing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission({
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      });

      if (permission === 'granted') {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(subscription);

      await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('Error subscribing to push:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  const sendSubscriptionToServer = async (
    subscription: globalThis.PushSubscription,
  ) => {
    try {
      if (!me?.root) {
        console.error('No user account available');
        return;
      }

      if (!(me.root as any).pushSubscriptions) {
        (me.root as any).pushSubscriptions = [];
      }

      const clientSubscription = PushSubscription.create({
        endpoint: subscription.endpoint,
        p256dh: (subscription as any).keys.p256dh,
        auth: (subscription as any).keys.auth,
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString(),
        preferences: {
          moonPhases: true,
          planetaryTransits: true,
          retrogrades: true,
          sabbats: true,
          eclipses: true,
          majorAspects: true,
        },
      });

      const pushSubscriptions = (me.root as any).pushSubscriptions;
      if (pushSubscriptions) {
        const existingIndex = pushSubscriptions.findIndex(
          (sub: any) => sub?.endpoint === subscription.endpoint,
        );

        if (existingIndex >= 0) {
          pushSubscriptions[existingIndex] = clientSubscription;
        } else {
          pushSubscriptions.push(clientSubscription);
        }
      }

      console.log('✅ Push subscription saved to client storage');

      try {
        // Serialize subscription properly for API
        const subscriptionJson = subscription.toJSON();
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: {
              endpoint: subscriptionJson.endpoint,
              keys: {
                p256dh: subscriptionJson.keys?.p256dh,
                auth: subscriptionJson.keys?.auth,
              },
            },
            preferences: {
              moonPhases: true,
              planetaryTransits: true,
              retrogrades: true,
              sabbats: true,
              eclipses: true,
              majorAspects: true,
            },
            userId: (me as any).id || 'unknown',
            userEmail: (me.profile as any)?.name || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save subscription');
        }

        console.log('✅ Push subscription saved to PostgreSQL');
      } catch (pgError) {
        console.error(
          '⚠️ Failed to save to PostgreSQL (client storage still works):',
          pgError,
        );
        alert(
          'Failed to save subscription to server. Notifications may not work properly.',
        );
      }
    } catch (error) {
      console.error('Error saving subscription to client storage:', error);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      if (me?.root) {
        const pushSubscriptions = (me.root as any).pushSubscriptions;
        if (pushSubscriptions) {
          const subscriptionIndex = pushSubscriptions.findIndex(
            (sub: any) => sub?.endpoint === subscription.endpoint,
          );

          if (subscriptionIndex >= 0) {
            pushSubscriptions.splice(subscriptionIndex, 1);
            console.log('✅ Push subscription removed from client storage');
          }
        }
      }

      try {
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
        console.log('✅ Push subscription removed from PostgreSQL');
      } catch (pgError) {
        console.error('⚠️ Failed to remove from PostgreSQL:', pgError);
      }

      setPermission({
        granted: false,
        denied: false,
        default: true,
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to disable notifications. Please try again.');
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (isLoading) {
    return (
      <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400'></div>
        </div>
      </div>
    );
  }

  if (!('Notification' in window)) {
    return (
      <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
        <h3 className='text-lg font-semibold text-white mb-3'>
          Push Notifications
        </h3>
        <p className='text-sm text-zinc-400'>
          Your browser does not support push notifications.
        </p>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
      <h3 className='text-lg font-semibold text-white mb-3'>
        Push Notifications
      </h3>
      <p className='text-xs text-zinc-400 mb-4'>
        Get notified about moon phases, planetary transits, retrogrades,
        sabbats, and eclipses
      </p>

      {permission.denied ? (
        <div className='space-y-3'>
          <p className='text-sm text-red-400'>
            Notifications are blocked. Please enable them in your browser
            settings.
          </p>
        </div>
      ) : subscription && permission.granted ? (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-green-400 font-medium'>
                🔔 Notifications Enabled
              </p>
              <p className='text-xs text-zinc-400 mt-1'>
                You'll receive notifications for cosmic events
              </p>
            </div>
          </div>
          <button
            onClick={unsubscribe}
            className='w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium'
          >
            Disable Notifications
          </button>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='text-xs text-zinc-500 space-y-1'>
            <p>• New & Full Moons</p>
            <p>• Planetary ingresses & retrogrades</p>
            <p>• Sabbats & seasonal shifts</p>
            <p>• Eclipses & major aspects</p>
          </div>
          <button
            onClick={requestPermission}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium'
          >
            Enable Notifications
          </button>
        </div>
      )}
    </div>
  );
}
