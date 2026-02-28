/**
 * Native Push Service
 *
 * Handles Firebase Cloud Messaging (FCM) for native iOS/Android push notifications.
 * Falls back gracefully on web (where VAPID push is used instead).
 *
 * Setup required:
 * 1. Install: pnpm add @capacitor-firebase/messaging
 * 2. Create Firebase project at console.firebase.google.com
 * 3. Add iOS app (Bundle ID: com.lunary.app)
 * 4. Download GoogleService-Info.plist → ios/App/App/
 * 5. Add Android app (Package: com.lunary.app)
 * 6. Download google-services.json → android/app/
 * 7. Run: npx cap sync
 *
 * Usage:
 *   import { nativePushService } from '@/services/native';
 *   await nativePushService.initialize(userId);
 */

import { Capacitor } from '@capacitor/core';

// Type definitions for Firebase Messaging (actual import requires package)
interface FirebaseMessagingModule {
  requestPermissions(): Promise<{ receive: 'granted' | 'denied' | 'prompt' }>;
  getToken(): Promise<{ token: string }>;
  addListener(
    event: 'tokenReceived',
    callback: (data: { token: string }) => void,
  ): Promise<{ remove: () => void }>;
  addListener(
    event: 'notificationReceived',
    callback: (notification: PushNotification) => void,
  ): Promise<{ remove: () => void }>;
  addListener(
    event: 'notificationActionPerformed',
    callback: (action: { notification: PushNotification }) => void,
  ): Promise<{ remove: () => void }>;
}

interface PushNotification {
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

class NativePushService {
  private isNative: boolean;
  private messaging: FirebaseMessagingModule | null = null;
  private initialized = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Check if native push is available
   */
  isAvailable(): boolean {
    return this.isNative;
  }

  /**
   * Initialize push notifications for a user
   */
  async initialize(userId: string): Promise<boolean> {
    if (!this.isNative) {
      console.log('[Push] Web platform - using VAPID push instead');
      return false;
    }

    if (this.initialized) {
      console.log('[Push] Already initialized');
      return true;
    }

    try {
      // Dynamically import Firebase messaging (only available in native)
      const { FirebaseMessaging } =
        await import('@capacitor-firebase/messaging');
      this.messaging = FirebaseMessaging as unknown as FirebaseMessagingModule;

      // Request permission
      const { receive } = await this.messaging.requestPermissions();
      if (receive !== 'granted') {
        console.log('[Push] Permission denied');
        return false;
      }

      // Get FCM token
      const { token } = await this.messaging.getToken();
      console.log('[Push] FCM token obtained');

      // Register with backend
      await this.registerToken(userId, token);

      // Listen for token refresh
      await this.messaging.addListener('tokenReceived', async (event) => {
        console.log('[Push] Token refreshed');
        await this.registerToken(userId, event.token);
      });

      // Listen for foreground notifications
      await this.messaging.addListener(
        'notificationReceived',
        (notification) => {
          console.log('[Push] Foreground notification:', notification);
          // Could show in-app toast here
        },
      );

      // Listen for notification taps
      await this.messaging.addListener(
        'notificationActionPerformed',
        (action) => {
          console.log('[Push] Notification tapped:', action);
          this.handleNotificationTap(action.notification);
        },
      );

      this.initialized = true;
      console.log('[Push] Initialization complete');
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('not implemented')) {
        // Expected in iOS simulator — Firebase push requires a real device with APNs
        console.debug(
          '[Push] Firebase not available (simulator or missing setup)',
        );
      } else {
        console.error('[Push] Initialization failed:', error);
      }
      return false;
    }
  }

  /**
   * Register FCM token with backend
   */
  private async registerToken(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch('/api/push/register-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          token,
          platform: Capacitor.getPlatform(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      console.log('[Push] Token registered with backend');
    } catch (error) {
      console.error('[Push] Failed to register token:', error);
    }
  }

  /**
   * Handle notification tap - navigate to deep link
   */
  private handleNotificationTap(notification: PushNotification): void {
    const { deepLink, url, type } = notification.data || {};

    const targetUrl = deepLink || url || this.getDefaultUrl(type);
    if (targetUrl && typeof window !== 'undefined') {
      window.location.href = targetUrl;
    }
  }

  /**
   * Get default URL for notification type
   */
  private getDefaultUrl(type?: string): string {
    const urls: Record<string, string> = {
      daily_card: '/tarot',
      moon_phase: '/app',
      transit: '/horoscope',
      journal: '/book-of-shadows/journal/new',
      streak: '/app',
      moon_circle: '/moon-circles',
      weekly_report: '/app',
    };
    return urls[type || ''] || '/app';
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Record<string, boolean>,
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/push/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, preferences }),
      });

      return response.ok;
    } catch (error) {
      console.error('[Push] Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Unregister from push notifications
   */
  async unregister(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/push/unregister-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          platform: Capacitor.getPlatform(),
        }),
      });

      if (response.ok) {
        this.initialized = false;
        console.log('[Push] Unregistered successfully');
      }

      return response.ok;
    } catch (error) {
      console.error('[Push] Failed to unregister:', error);
      return false;
    }
  }
}

// Export singleton instance
export const nativePushService = new NativePushService();
