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
        console.log('Service Worker not supported');
        setIsLoading(false);
        return;
      }

      if (!('PushManager' in window)) {
        console.log('PushManager not supported');
        setIsLoading(false);
        return;
      }

      // Ensure service worker is registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('Service worker not registered yet');
        setIsLoading(false);
        return;
      }

      registration = await navigator.serviceWorker.ready;
      console.log(
        'Service worker ready, checking for existing subscription...',
      );

      const existingSub = await registration.pushManager.getSubscription();

      if (existingSub) {
        setSubscription(existingSub);
        console.log('✅ Found existing push subscription');
        console.log(
          'Subscription endpoint:',
          existingSub.endpoint.substring(0, 50) + '...',
        );
      } else {
        console.log('ℹ️ No existing push subscription found');
      }
    } catch (error) {
      console.error('❌ Error getting existing subscription:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
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
    if (!('serviceWorker' in navigator)) {
      alert('Service Worker is not supported in this browser');
      console.error('Service Worker not supported');
      return;
    }

    if (!('PushManager' in window)) {
      alert('Push messaging is not supported in this browser');
      console.error('PushManager not supported');
      return;
    }

    try {
      // Ensure service worker is registered and ready
      let registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        console.log('Service worker not registered, registering now...');
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('Service worker registered and ready');
      } else {
        // Wait for existing registration to be ready
        registration = await navigator.serviceWorker.ready;
        console.log('Service worker is ready');
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        const errorMsg =
          'VAPID public key not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your environment variables.';
        console.error(errorMsg);
        alert(errorMsg);
        return;
      }

      // Validate VAPID key format (should be base64 URL-safe string)
      if (vapidPublicKey.length < 80) {
        const errorMsg =
          'VAPID public key appears to be invalid (too short). Please check your environment variables.';
        console.error(errorMsg, 'Key length:', vapidPublicKey.length);
        alert(errorMsg);
        return;
      }

      console.log('Attempting to subscribe to push notifications...');
      console.log('VAPID key length:', vapidPublicKey.length);

      // Check for existing subscription first
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Found existing subscription, reusing it');
        setSubscription(existingSubscription);
        await sendSubscriptionToServer(existingSubscription);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('✅ Successfully subscribed to push notifications');
      console.log(
        'Subscription endpoint:',
        subscription.endpoint.substring(0, 50) + '...',
      );

      setSubscription(subscription);

      await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('❌ Error subscribing to push:', error);

      let errorMessage = 'Failed to enable notifications. ';

      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });

        if (error.message.includes('registration')) {
          errorMessage +=
            'Service worker registration failed. Please refresh the page and try again.';
        } else if (
          error.message.includes('key') ||
          error.message.includes('VAPID')
        ) {
          errorMessage +=
            'Invalid VAPID key configuration. Please contact support.';
        } else if (error.message.includes('permission')) {
          errorMessage +=
            'Notification permission was denied. Please enable notifications in your browser settings.';
        } else {
          errorMessage += error.message;
        }
      }

      alert(errorMessage);
    }
  };

  const sendSubscriptionToServer = async (
    subscription: globalThis.PushSubscription,
  ) => {
    try {
      if (!me?.root) {
        console.error('No user account available');
        alert('Please log in to enable notifications');
        return;
      }

      const root = me.root as any;

      if (!root.pushSubscriptions) {
        root.$jazz.set('pushSubscriptions', []);
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

      const pushSubscriptions = (root.pushSubscriptions || []) as any[];
      const existingIndex = pushSubscriptions.findIndex(
        (sub: any) => sub?.endpoint === subscription.endpoint,
      );

      const updatedSubscriptions =
        existingIndex >= 0
          ? pushSubscriptions.map((sub, index) =>
              index === existingIndex ? clientSubscription : sub,
            )
          : [...pushSubscriptions, clientSubscription];

      root.$jazz.set('pushSubscriptions', updatedSubscriptions);
      console.log('✅ Push subscription saved to client storage');

      try {
        // Serialize subscription properly for API
        const subscriptionJson = subscription.toJSON();

        if (!subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
          throw new Error('Subscription keys are missing');
        }

        console.log('Sending subscription to server...');
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: {
              endpoint: subscriptionJson.endpoint,
              keys: {
                p256dh: subscriptionJson.keys.p256dh,
                auth: subscriptionJson.keys.auth,
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
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Unknown error' }));
          console.error('Server error response:', errorData);
          throw new Error(
            errorData.error || `Server error: ${response.status}`,
          );
        }

        const result = await response.json();
        console.log('✅ Push subscription saved to PostgreSQL:', result);
      } catch (pgError) {
        console.error(
          '⚠️ Failed to save to PostgreSQL (client storage still works):',
          pgError,
        );

        if (pgError instanceof Error) {
          console.error('PostgreSQL error details:', pgError.message);
        }

        // Don't alert for PostgreSQL errors - client storage still works
        // alert(
        //   'Failed to save subscription to server. Notifications may not work properly.',
        // );
      }
    } catch (error) {
      console.error('❌ Error saving subscription to client storage:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      throw error; // Re-throw to let caller handle it
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
        const root = me.root as any;
        const pushSubscriptions = (root.pushSubscriptions || []) as any[];
        const subscriptionIndex = pushSubscriptions.findIndex(
          (sub: any) => sub?.endpoint === subscription.endpoint,
        );

        if (subscriptionIndex >= 0) {
          const updatedSubscriptions = pushSubscriptions.filter(
            (_sub, index) => index !== subscriptionIndex,
          );
          root.$jazz.set('pushSubscriptions', updatedSubscriptions);
          console.log('✅ Push subscription removed from client storage');
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

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const hasVapidKey = !!vapidPublicKey && vapidPublicKey.length >= 80;
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;

  return (
    <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
      <h3 className='text-lg font-semibold text-white mb-3'>
        Push Notifications
      </h3>
      <p className='text-xs text-zinc-400 mb-4'>
        Get notified about moon phases, planetary transits, retrogrades,
        sabbats, and eclipses
      </p>

      {/* Diagnostic info (only show if there's an issue) */}
      {(!hasVapidKey || !hasServiceWorker || !hasPushManager) && (
        <div className='mb-4 p-3 bg-zinc-900 rounded border border-zinc-700'>
          <p className='text-xs font-medium text-yellow-400 mb-2'>
            ⚠️ Setup Status
          </p>
          <div className='text-xs space-y-1 text-zinc-400'>
            {!hasVapidKey && (
              <p className='text-red-400'>
                ❌ VAPID key not configured (required)
              </p>
            )}
            {hasVapidKey && (
              <p className='text-green-400'>✅ VAPID key configured</p>
            )}
            {!hasServiceWorker && (
              <p className='text-red-400'>❌ Service Worker not supported</p>
            )}
            {hasServiceWorker && (
              <p className='text-green-400'>✅ Service Worker supported</p>
            )}
            {!hasPushManager && (
              <p className='text-red-400'>❌ Push Manager not supported</p>
            )}
            {hasPushManager && (
              <p className='text-green-400'>✅ Push Manager supported</p>
            )}
          </div>
        </div>
      )}

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
            disabled={!hasVapidKey || !hasServiceWorker || !hasPushManager}
            className='w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors text-sm font-medium'
          >
            Enable Notifications
          </button>
          {(!hasVapidKey || !hasServiceWorker || !hasPushManager) && (
            <p className='text-xs text-red-400 text-center'>
              Cannot enable: Missing required configuration
            </p>
          )}
        </div>
      )}
    </div>
  );
}
