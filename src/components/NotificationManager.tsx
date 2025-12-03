'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export function NotificationManager() {
  const { user } = useUser();
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
      if (!user) {
        console.error('No user account available');
        return;
      }

      const json = subscription.toJSON();

      if (!json?.keys?.p256dh || !json?.keys?.auth) {
        throw new Error('Subscription keys missing');
      }

      const endpoint = json?.endpoint;
      const p256dh = json?.keys?.p256dh;
      const auth = json?.keys?.auth;

      if (!endpoint || !p256dh || !auth) {
        throw new Error('Subscription JSON missing required keys');
      }

      // Save to PostgreSQL only
      try {
        const birthday = user?.birthday || null;
        const userName = user?.name || null;

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: {
              endpoint,
              keys: {
                p256dh,
                auth,
              },
            },
            preferences: {
              moonPhases: true,
              planetaryTransits: true,
              retrogrades: true,
              sabbats: true,
              eclipses: true,
              majorAspects: true,
              cosmicPulse: true,
              cosmicEvents: true,
              birthday: birthday,
              name: userName,
            },
            userId: user?.id || 'unknown',
            userEmail: null,
          }),
        });
        console.log('✅ Push subscription also saved to PostgreSQL', {
          hasBirthday: !!birthday,
        });
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
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Remove from Postgres only
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
        console.log('✅ Push subscription removed');
      } catch (pgError) {
        console.error('Failed to remove subscription:', pgError);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
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

  // Don't show the bottom notification prompt anymore - settings are in profile page
  return null;
}
