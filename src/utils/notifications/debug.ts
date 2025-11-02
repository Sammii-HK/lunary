/**
 * Debug utilities for push notifications
 * Call these functions from the browser console to diagnose issues
 */

export function debugPushNotifications() {
  console.group('🔍 Push Notification Debug Info');

  // Check browser support
  console.log('Browser Support:');
  console.log('  - Notifications:', 'Notification' in window ? '✅' : '❌');
  console.log(
    '  - Service Worker:',
    'serviceWorker' in navigator ? '✅' : '❌',
  );
  console.log('  - Push Manager:', 'PushManager' in window ? '✅' : '❌');
  console.log('  - Secure Context:', window.isSecureContext ? '✅' : '❌');

  // Check permissions
  if ('Notification' in window) {
    console.log('\nNotification Permission:', Notification.permission);
  }

  // Check VAPID key
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  console.log('\nVAPID Key:');
  console.log('  - Configured:', vapidKey ? '✅' : '❌');
  console.log('  - Length:', vapidKey?.length || 0);

  // Check service worker registration
  navigator.serviceWorker
    .getRegistration()
    .then((registration) => {
      if (registration) {
        console.log('\nService Worker Registration:');
        console.log('  - Registered:', '✅');
        console.log('  - Scope:', registration.scope);
        console.log('  - Active:', registration.active ? '✅' : '❌');
        console.log('  - Installing:', registration.installing ? '⏳' : '-');
        console.log('  - Waiting:', registration.waiting ? '⏳' : '-');

        // Check for existing subscription
        registration.pushManager
          .getSubscription()
          .then((sub) => {
            if (sub) {
              console.log('\nPush Subscription:');
              console.log('  - Subscribed:', '✅');
              console.log(
                '  - Endpoint:',
                sub.endpoint.substring(0, 50) + '...',
              );
              console.log('  - Has Keys:', !!(sub as any).keys);
            } else {
              console.log('\nPush Subscription:');
              console.log('  - Subscribed:', '❌ No subscription found');
            }

            console.groupEnd();
          })
          .catch((err) => {
            console.error('Error getting subscription:', err);
            console.groupEnd();
          });
      } else {
        console.log('\nService Worker Registration:');
        console.log('  - Registered:', '❌ Not registered');
        console.groupEnd();
      }
    })
    .catch((err) => {
      console.error('Error getting registration:', err);
      console.groupEnd();
    });
}

export async function testServiceWorkerRegistration(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker not supported');
      return false;
    }

    let registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      console.log('Registering service worker...');
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
    }

    await navigator.serviceWorker.ready;
    console.log('✅ Service worker is ready');
    return true;
  } catch (error) {
    console.error('❌ Service worker registration failed:', error);
    return false;
  }
}

export async function testPushSubscription(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidKey) {
      console.error('❌ VAPID key not configured');
      return false;
    }

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      console.log('✅ Already subscribed');
      return true;
    }

    console.log('Attempting to subscribe...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    console.log(
      '✅ Subscription successful:',
      subscription.endpoint.substring(0, 50),
    );
    return true;
  } catch (error) {
    console.error('❌ Subscription failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
      });
    }
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugPushNotifications = debugPushNotifications;
  (window as any).testServiceWorkerRegistration = testServiceWorkerRegistration;
  (window as any).testPushSubscription = testPushSubscription;
}
