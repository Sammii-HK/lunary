/**
 * Native Push Sender
 *
 * Server-side service for sending FCM push notifications to native iOS/Android devices.
 * Uses Firebase Admin SDK.
 *
 * Environment variables required:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY (base64 encoded or raw with \n)
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import { sql } from '@vercel/postgres';

interface NativePushToken {
  id: number;
  user_id: string;
  token: string;
  platform: string;
  timezone: string | null;
  is_active: boolean;
  preferences: Record<string, boolean>;
}

interface NativePushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

interface SendResult {
  successful: number;
  failed: number;
  tokens: number;
  errors: Array<{ token: string; error: string }>;
}

let firebaseApp: App | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase(): boolean {
  if (firebaseApp) return true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.log('[NativePush] Firebase not configured - skipping native push');
    return false;
  }

  try {
    // Handle base64 encoded private key (common for env vars)
    if (!privateKey.includes('-----BEGIN')) {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    }

    // Handle escaped newlines
    privateKey = privateKey.replace(/\\n/g, '\n');

    if (getApps().length === 0) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      firebaseApp = getApps()[0];
    }

    messaging = getMessaging(firebaseApp);
    console.log('[NativePush] Firebase Admin initialized');
    return true;
  } catch (error) {
    console.error('[NativePush] Firebase init failed:', error);
    return false;
  }
}

/**
 * Get active native push tokens
 */
export async function getActiveNativeTokens(
  notificationType?: string,
): Promise<NativePushToken[]> {
  try {
    const result = await sql`
      SELECT id, user_id, token, platform, timezone, is_active, preferences
      FROM native_push_tokens
      WHERE is_active = true
    `;

    let tokens = result.rows as NativePushToken[];

    // Filter by notification type preference if specified
    if (notificationType) {
      tokens = tokens.filter((t) => {
        const prefs = t.preferences || {};
        // Default to true if preference not set
        return prefs[notificationType] !== false;
      });
    }

    return tokens;
  } catch (error) {
    console.error('[NativePush] Failed to fetch tokens:', error);
    return [];
  }
}

/**
 * Get native push tokens for a specific user
 */
export async function getUserNativeTokens(
  userId: string,
): Promise<NativePushToken[]> {
  try {
    const result = await sql`
      SELECT id, user_id, token, platform, timezone, is_active, preferences
      FROM native_push_tokens
      WHERE user_id = ${userId} AND is_active = true
    `;

    return result.rows as NativePushToken[];
  } catch (error) {
    console.error('[NativePush] Failed to fetch user tokens:', error);
    return [];
  }
}

/**
 * Send push notification to native devices
 */
export async function sendNativePush(
  tokens: NativePushToken[],
  payload: NativePushPayload,
): Promise<SendResult> {
  if (!initializeFirebase() || !messaging) {
    return { successful: 0, failed: 0, tokens: 0, errors: [] };
  }

  if (tokens.length === 0) {
    return { successful: 0, failed: 0, tokens: 0, errors: [] };
  }

  const fcmTokens = tokens.map((t) => t.token);
  const errors: Array<{ token: string; error: string }> = [];
  let successful = 0;
  let failed = 0;

  // FCM supports batch sending up to 500 tokens
  const batchSize = 500;
  for (let i = 0; i < fcmTokens.length; i += batchSize) {
    const batch = fcmTokens.slice(i, i + batchSize);

    try {
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
        },
        data: payload.data || {},
        tokens: batch,
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'lunary_notifications',
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);
      successful += response.successCount;
      failed += response.failureCount;

      // Track failed tokens for cleanup
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          errors.push({
            token: batch[idx],
            error: resp.error.message,
          });

          // Mark invalid tokens as inactive
          if (
            resp.error.code === 'messaging/invalid-registration-token' ||
            resp.error.code === 'messaging/registration-token-not-registered'
          ) {
            deactivateToken(batch[idx]).catch(() => {});
          }
        }
      });
    } catch (error) {
      console.error('[NativePush] Batch send failed:', error);
      failed += batch.length;
    }
  }

  // Update last notification sent timestamp
  if (successful > 0) {
    const successfulTokens = tokens
      .filter((t) => !errors.some((e) => e.token === t.token))
      .map((t) => t.token);

    if (successfulTokens.length > 0) {
      try {
        await sql.query(
          `
          UPDATE native_push_tokens
          SET last_notification_sent = NOW(), updated_at = NOW()
          WHERE token = ANY($1::text[])
        `,
          [successfulTokens],
        );
      } catch (error) {
        console.error('[NativePush] Failed to update timestamps:', error);
      }
    }
  }

  console.log(
    `[NativePush] Sent: ${successful} success, ${failed} failed out of ${tokens.length}`,
  );

  return {
    successful,
    failed,
    tokens: tokens.length,
    errors,
  };
}

/**
 * Send notification to all active native devices
 */
export async function broadcastNativePush(
  payload: NativePushPayload,
  notificationType?: string,
): Promise<SendResult> {
  const tokens = await getActiveNativeTokens(notificationType);
  return sendNativePush(tokens, payload);
}

/**
 * Send notification to a specific user's devices
 */
export async function sendToUser(
  userId: string,
  payload: NativePushPayload,
): Promise<SendResult> {
  const tokens = await getUserNativeTokens(userId);
  return sendNativePush(tokens, payload);
}

/**
 * Deactivate an invalid token
 */
async function deactivateToken(token: string): Promise<void> {
  try {
    await sql`
      UPDATE native_push_tokens
      SET is_active = false, updated_at = NOW()
      WHERE token = ${token}
    `;
    console.log('[NativePush] Deactivated invalid token');
  } catch (error) {
    console.error('[NativePush] Failed to deactivate token:', error);
  }
}

/**
 * Update user notification preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Record<string, boolean>,
): Promise<boolean> {
  try {
    await sql`
      UPDATE native_push_tokens
      SET preferences = preferences || ${JSON.stringify(preferences)}::jsonb,
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('[NativePush] Failed to update preferences:', error);
    return false;
  }
}

/**
 * Get user notification preferences
 */
export async function getUserPreferences(
  userId: string,
): Promise<Record<string, boolean> | null> {
  try {
    const result = await sql`
      SELECT preferences
      FROM native_push_tokens
      WHERE user_id = ${userId} AND is_active = true
      LIMIT 1
    `;

    if (result.rows.length === 0) return null;
    return (result.rows[0].preferences as Record<string, boolean>) || {};
  } catch (error) {
    console.error('[NativePush] Failed to get preferences:', error);
    return null;
  }
}
