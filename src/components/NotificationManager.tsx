'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { PushSubscription } from '../../schema';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export function NotificationManager() {
  const { me } = useAccount();
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });
  const [subscription, setSubscription] =
    useState<globalThis.PushSubscription | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default',
      });

      // Show prompt if permission is default (not asked yet)
      if (currentPermission === 'default') {
        // Delay showing prompt to avoid overwhelming user on first visit
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    // Get existing subscription if permission is granted
    if (permission.granted && 'serviceWorker' in navigator) {
      getExistingSubscription();
    }
  }, [permission.granted]);

  const getExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      setSubscription(existingSub);
    } catch (error) {
      console.error('Error getting existing subscription:', error);
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
        setShowPrompt(false);
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

      // Get VAPID public key from environment (exposed to client via NEXT_PUBLIC_)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(subscription);

      // Send subscription to both client storage and PostgreSQL
      await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('Error subscribing to push:', error);
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

      // Ensure pushSubscriptions array exists
      if (!(me.root as any).pushSubscriptions) {
        (me.root as any).pushSubscriptions = [];
      }

      // Create client storage subscription object
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

      // Get the pushSubscriptions list safely
      const pushSubscriptions = (me.root as any).pushSubscriptions;
      if (pushSubscriptions) {
        // Check if subscription already exists
        const existingIndex = pushSubscriptions.findIndex(
          (sub: any) => sub?.endpoint === subscription.endpoint,
        );

        if (existingIndex >= 0) {
          // Update existing subscription
          pushSubscriptions[existingIndex] = clientSubscription;
        } else {
          // Add new subscription
          pushSubscriptions.push(clientSubscription);
        }
      }

      console.log('✅ Push subscription saved to client storage');

      // Also send to PostgreSQL via API for server-side notifications
      try {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription,
            preferences: {
              moonPhases: true,
              planetaryTransits: true,
              retrogrades: true,
              sabbats: true,
              eclipses: true,
              majorAspects: true,
            },
            userId: (me as any).id || 'unknown',
            userEmail: me.profile?.name || null, // Better Auth might store email in profile
          }),
        });
        console.log('✅ Push subscription also saved to PostgreSQL');
      } catch (pgError) {
        console.error(
          '⚠️ Failed to save to PostgreSQL (client storage still works):',
          pgError,
        );
      }
    } catch (error) {
      console.error('Error saving subscription to client storage:', error);
    }
  };

  const unsubscribe = async () => {
    if (subscription && me?.root) {
      try {
        await subscription.unsubscribe();
        setSubscription(null);

        // Remove from client storage
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
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  // Helper function to convert VAPID key
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

  if (permission.denied) {
    return null; // Don't show anything if user denied
  }

  if (permission.granted && subscription) {
    return (
      <div className='text-xs text-zinc-400 text-center py-2'>
        🔔 Cosmic notifications enabled
        <button
          onClick={unsubscribe}
          className='ml-2 text-zinc-500 hover:text-zinc-300 underline'
        >
          disable
        </button>
      </div>
    );
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className='fixed bottom-20 left-4 right-4 z-50'>
      <div className='bg-zinc-800 border border-zinc-700 rounded-lg p-4 shadow-lg'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-white flex items-center gap-2'>
              🌙 Cosmic Notifications
            </h3>
            <p className='text-xs text-zinc-400 mt-1'>
              Get notified about moon phases, planetary transits, retrogrades,
              sabbats, and eclipses
            </p>
            <div className='text-xs text-zinc-500 mt-2'>
              • New & Full Moons
              <br />
              • Planetary ingresses & retrogrades
              <br />
              • Sabbats & seasonal shifts
              <br />• Eclipses & major aspects
            </div>
          </div>
          <div className='flex flex-col gap-2 ml-4'>
            <button
              onClick={dismissPrompt}
              className='px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors'
            >
              ✕
            </button>
          </div>
        </div>
        <div className='flex gap-2 mt-3'>
          <button
            onClick={dismissPrompt}
            className='flex-1 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors'
          >
            Maybe Later
          </button>
          <button
            onClick={requestPermission}
            className='flex-1 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors'
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
