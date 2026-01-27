import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const THREE_WEEK_MS = 21 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tracking = await prisma.testimonialPromptTracking.findUnique({
      where: { userId: session.user.id },
    });

    if (!tracking) {
      // Create initial tracking record
      const newTracking = await prisma.testimonialPromptTracking.create({
        data: {
          userId: session.user.id,
          firstSeen: new Date(),
          dontAskUntil: new Date(),
          submitted: false,
        },
      });

      return NextResponse.json({
        shouldPrompt: false, // Don't prompt immediately on first visit
        tracking: {
          firstSeen: newTracking.firstSeen.getTime(),
          dontAskUntil: newTracking.dontAskUntil.getTime(),
          submitted: newTracking.submitted,
        },
      });
    }

    // Check if should prompt
    const now = Date.now();
    const firstSeen = tracking.firstSeen.getTime();
    const dontAskUntil = tracking.dontAskUntil.getTime();

    const shouldPrompt =
      !tracking.submitted && now >= firstSeen + WEEK_MS && now >= dontAskUntil;

    return NextResponse.json({
      shouldPrompt,
      tracking: {
        firstSeen,
        dontAskUntil,
        submitted: tracking.submitted,
      },
    });
  } catch (error) {
    console.error('Error fetching testimonial prompt tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'dismiss') {
      // User clicked "Maybe later" - schedule for 3 weeks from first seen
      const tracking = await prisma.testimonialPromptTracking.findUnique({
        where: { userId: session.user.id },
      });

      if (!tracking) {
        return NextResponse.json(
          { error: 'Tracking not found' },
          { status: 404 },
        );
      }

      const firstSeen = tracking.firstSeen.getTime();
      const reaskAt = new Date(firstSeen + THREE_WEEK_MS);

      await prisma.testimonialPromptTracking.update({
        where: { userId: session.user.id },
        data: {
          dontAskUntil: reaskAt,
        },
      });

      return NextResponse.json({ success: true });
    } else if (action === 'submitted') {
      // User submitted testimonial - never ask again
      await prisma.testimonialPromptTracking.update({
        where: { userId: session.user.id },
        data: {
          submitted: true,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating testimonial prompt tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
