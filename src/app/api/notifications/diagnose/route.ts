import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

interface DiagnosticResult {
  vapidKeys: {
    publicKeyConfigured: boolean;
    privateKeyConfigured: boolean;
    publicKeyLength: number;
    privateKeyLength: number;
    publicKeyFormat: 'valid' | 'invalid' | 'unknown';
    keysMatch: boolean;
    error?: string;
  };
  subscriptions: {
    active: number;
    inactive: number;
    total: number;
    recentlyFailed: number;
    stale: number;
    lastNotificationSent: string | null;
  };
  serviceWorker: {
    accessible: boolean;
    error?: string;
  };
  recentErrors: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
  health: 'healthy' | 'degraded' | 'critical';
  recommendations: string[];
}

export async function GET(request: NextRequest) {
  try {
    const diagnostics: DiagnosticResult = {
      vapidKeys: {
        publicKeyConfigured: false,
        privateKeyConfigured: false,
        publicKeyLength: 0,
        privateKeyLength: 0,
        publicKeyFormat: 'unknown',
        keysMatch: false,
      },
      subscriptions: {
        active: 0,
        inactive: 0,
        total: 0,
        recentlyFailed: 0,
        stale: 0,
        lastNotificationSent: null,
      },
      serviceWorker: {
        accessible: false,
      },
      recentErrors: [],
      health: 'critical',
      recommendations: [],
    };

    // Check VAPID Keys
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const clientPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    diagnostics.vapidKeys.publicKeyConfigured = !!publicKey;
    diagnostics.vapidKeys.privateKeyConfigured = !!privateKey;
    diagnostics.vapidKeys.publicKeyLength = publicKey?.length || 0;
    diagnostics.vapidKeys.privateKeyLength = privateKey?.length || 0;

    // Validate VAPID key format (should be base64 URL-safe, typically 80+ characters)
    if (publicKey) {
      if (publicKey.length >= 80) {
        diagnostics.vapidKeys.publicKeyFormat = 'valid';
      } else {
        diagnostics.vapidKeys.publicKeyFormat = 'invalid';
        diagnostics.recentErrors.push({
          type: 'VAPID_KEY_INVALID',
          message: `Public key too short (${publicKey.length} chars, expected 80+)`,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      diagnostics.vapidKeys.publicKeyFormat = 'invalid';
      diagnostics.recentErrors.push({
        type: 'VAPID_KEY_MISSING',
        message: 'VAPID_PUBLIC_KEY not configured',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if client and server public keys match
    if (publicKey && clientPublicKey) {
      diagnostics.vapidKeys.keysMatch = publicKey === clientPublicKey;
      if (!diagnostics.vapidKeys.keysMatch) {
        diagnostics.recentErrors.push({
          type: 'VAPID_KEY_MISMATCH',
          message: 'Server and client VAPID public keys do not match',
          timestamp: new Date().toISOString(),
        });
      }
    } else if (!clientPublicKey) {
      diagnostics.recentErrors.push({
        type: 'VAPID_KEY_MISSING',
        message: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY not configured',
        timestamp: new Date().toISOString(),
      });
    }

    // Try to configure webpush to validate keys
    if (publicKey && privateKey) {
      try {
        webpush.setVapidDetails(
          'mailto:info@lunary.app',
          publicKey,
          privateKey,
        );
      } catch (error) {
        diagnostics.vapidKeys.error =
          error instanceof Error ? error.message : 'Unknown error';
        diagnostics.recentErrors.push({
          type: 'VAPID_CONFIG_ERROR',
          message: diagnostics.vapidKeys.error,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Check Subscriptions
    try {
      const activeCount = await sql`
        SELECT COUNT(*) as count FROM push_subscriptions WHERE is_active = true
      `;
      const inactiveCount = await sql`
        SELECT COUNT(*) as count FROM push_subscriptions WHERE is_active = false
      `;
      const staleSubscriptions = await sql`
        SELECT COUNT(*) as count
        FROM push_subscriptions
        WHERE is_active = true
        AND (last_notification_sent IS NULL OR last_notification_sent < NOW() - INTERVAL '7 days')
      `;
      const recentlyFailed = await sql`
        SELECT COUNT(*) as count
        FROM push_subscriptions
        WHERE is_active = false
        AND updated_at > NOW() - INTERVAL '7 days'
      `;
      const lastNotification = await sql`
        SELECT MAX(last_notification_sent) as last_sent
        FROM push_subscriptions
        WHERE last_notification_sent IS NOT NULL
      `;

      diagnostics.subscriptions.active = parseInt(
        activeCount.rows[0]?.count || '0',
      );
      diagnostics.subscriptions.inactive = parseInt(
        inactiveCount.rows[0]?.count || '0',
      );
      diagnostics.subscriptions.total =
        diagnostics.subscriptions.active + diagnostics.subscriptions.inactive;
      diagnostics.subscriptions.stale = parseInt(
        staleSubscriptions.rows[0]?.count || '0',
      );
      diagnostics.subscriptions.recentlyFailed = parseInt(
        recentlyFailed.rows[0]?.count || '0',
      );
      diagnostics.subscriptions.lastNotificationSent =
        lastNotification.rows[0]?.last_sent || null;
    } catch (error) {
      diagnostics.recentErrors.push({
        type: 'DATABASE_ERROR',
        message:
          error instanceof Error ? error.message : 'Database query failed',
        timestamp: new Date().toISOString(),
      });
    }

    // Check Service Worker accessibility
    try {
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://lunary.app'
          : 'http://localhost:3000';
      const swResponse = await fetch(`${baseUrl}/sw.js`, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Lunary-Diagnostic/1.0' },
      });
      diagnostics.serviceWorker.accessible = swResponse.ok;
      if (!swResponse.ok) {
        diagnostics.serviceWorker.error = `Service worker returned ${swResponse.status}`;
        diagnostics.recentErrors.push({
          type: 'SERVICE_WORKER_ERROR',
          message: diagnostics.serviceWorker.error,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      diagnostics.serviceWorker.error =
        error instanceof Error ? error.message : 'Unknown error';
      diagnostics.recentErrors.push({
        type: 'SERVICE_WORKER_ERROR',
        message: diagnostics.serviceWorker.error,
        timestamp: new Date().toISOString(),
      });
    }

    // Determine health status
    if (
      diagnostics.vapidKeys.publicKeyConfigured &&
      diagnostics.vapidKeys.privateKeyConfigured &&
      diagnostics.vapidKeys.publicKeyFormat === 'valid' &&
      diagnostics.vapidKeys.keysMatch &&
      diagnostics.subscriptions.active > 0 &&
      diagnostics.serviceWorker.accessible
    ) {
      diagnostics.health = 'healthy';
    } else if (
      diagnostics.vapidKeys.publicKeyConfigured &&
      diagnostics.vapidKeys.privateKeyConfigured &&
      diagnostics.subscriptions.active > 0
    ) {
      diagnostics.health = 'degraded';
    } else {
      diagnostics.health = 'critical';
    }

    // Generate recommendations
    if (!diagnostics.vapidKeys.publicKeyConfigured) {
      diagnostics.recommendations.push(
        'Set VAPID_PUBLIC_KEY environment variable',
      );
    }
    if (!diagnostics.vapidKeys.privateKeyConfigured) {
      diagnostics.recommendations.push(
        'Set VAPID_PRIVATE_KEY environment variable',
      );
    }
    if (!clientPublicKey) {
      diagnostics.recommendations.push(
        'Set NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable',
      );
    }
    if (!diagnostics.vapidKeys.keysMatch && publicKey && clientPublicKey) {
      diagnostics.recommendations.push(
        'Ensure VAPID_PUBLIC_KEY and NEXT_PUBLIC_VAPID_PUBLIC_KEY match',
      );
    }
    if (diagnostics.vapidKeys.publicKeyFormat === 'invalid') {
      diagnostics.recommendations.push(
        'Regenerate VAPID keys (current public key format is invalid)',
      );
    }
    if (diagnostics.subscriptions.active === 0) {
      diagnostics.recommendations.push(
        'No active subscriptions found. Users may need to re-subscribe.',
      );
    }
    if (diagnostics.subscriptions.recentlyFailed > 0) {
      diagnostics.recommendations.push(
        `${diagnostics.subscriptions.recentlyFailed} subscriptions failed recently. Check for expired endpoints.`,
      );
    }
    if (!diagnostics.serviceWorker.accessible) {
      diagnostics.recommendations.push(
        'Service worker not accessible. Check that /sw.js is properly deployed.',
      );
    }
    if (
      diagnostics.subscriptions.lastNotificationSent &&
      new Date(diagnostics.subscriptions.lastNotificationSent) <
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      diagnostics.recommendations.push(
        'No notifications sent in the last 7 days. Check cron jobs and notification triggers.',
      );
    }

    return NextResponse.json({
      success: true,
      diagnostics,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Diagnostic check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        checkedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
