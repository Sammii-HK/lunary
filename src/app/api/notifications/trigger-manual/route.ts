import { NextRequest, NextResponse } from 'next/server';
import {
  sendUnifiedNotification,
  NotificationEvent,
} from '@/lib/notifications/unified-service';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

export const dynamic = 'force-dynamic';

/**
 * Manual trigger endpoint for testing notifications
 * Usage: POST /api/notifications/trigger-manual
 * Body: { eventType?: string, force?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { eventType, force } = await request.json();

    // Get today's cosmic data
    const today = new Date().toISOString().split('T')[0];
    const cosmicData = await getGlobalCosmicData(today);

    if (!cosmicData) {
      return NextResponse.json(
        { error: 'Failed to fetch cosmic data' },
        { status: 500 },
      );
    }

    // Determine which event to send
    let event: NotificationEvent | null = null;

    if (eventType) {
      // Find specific event type
      if (cosmicData.allEvents) {
        const foundEvent = cosmicData.allEvents.find(
          (e: any) => e.type === eventType,
        );
        if (foundEvent) {
          event = {
            name: foundEvent.name || 'Cosmic Event',
            type: foundEvent.type || 'unknown',
            priority: foundEvent.priority || 0,
            planet: foundEvent.planet,
            sign: foundEvent.sign,
            planetA: foundEvent.planetA,
            planetB: foundEvent.planetB,
            aspect: foundEvent.aspect,
            emoji: foundEvent.emoji,
            energy: foundEvent.energy,
            description: foundEvent.description,
          };
        }
      }
    } else {
      // Use primary event or first significant event
      if (cosmicData.primaryEvent) {
        const primary = cosmicData.primaryEvent;
        event = {
          name: primary.name || 'Cosmic Event',
          type: primary.type || 'unknown',
          priority: primary.priority || 0,
          planet: primary.planet,
          sign: primary.sign,
          planetA: primary.planetA,
          planetB: primary.planetB,
          aspect: primary.aspect,
          emoji: primary.emoji,
          energy: primary.energy,
          description: primary.description,
        };
      } else if (cosmicData.allEvents && cosmicData.allEvents.length > 0) {
        // Use first event with priority >= 5
        const significantEvent =
          cosmicData.allEvents.find((e: any) => (e.priority || 0) >= 5) ||
          cosmicData.allEvents[0];

        event = {
          name: significantEvent.name || 'Cosmic Event',
          type: significantEvent.type || 'unknown',
          priority: significantEvent.priority || 0,
          planet: significantEvent.planet,
          sign: significantEvent.sign,
          planetA: significantEvent.planetA,
          planetB: significantEvent.planetB,
          aspect: significantEvent.aspect,
          emoji: significantEvent.emoji,
          energy: significantEvent.energy,
          description: significantEvent.description,
        };
      }
    }

    if (!event) {
      return NextResponse.json(
        { error: 'No suitable event found to send notification for' },
        { status: 404 },
      );
    }

    // Send notification (force will bypass duplicate check if needed)
    const result = await sendUnifiedNotification(event, cosmicData, 'daily');

    return NextResponse.json({
      success: result.success,
      message: 'Notification triggered manually',
      event: {
        name: event.name,
        type: event.type,
        priority: event.priority,
      },
      result: {
        recipientCount: result.recipientCount,
        successful: result.successful,
        failed: result.failed,
        eventKey: result.eventKey,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Manual notification trigger failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
