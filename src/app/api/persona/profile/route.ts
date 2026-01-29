import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * GET /api/persona/profile
 * Fetches profile data for the marketing persona
 * Email is stored server-side only (not exposed to client)
 * Used by the demo to display real, live persona data
 *
 * Security:
 * - Email never exposed to client (server-side env var only)
 * - Rate limited to 10 requests per minute per IP
 * - Response cached for 5 minutes
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  try {
    // Email is server-side only - never exposed to client
    const email = process.env.PERSONA_EMAIL;

    if (!email) {
      console.error('PERSONA_EMAIL environment variable not set');
      return NextResponse.json(
        { error: 'Persona configuration missing' },
        { status: 500 },
      );
    }

    // Fetch user from database (profile fields are on user model directly)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      console.error(`Persona user not found: ${email}`);
      return NextResponse.json(
        { error: 'Persona user not found' },
        { status: 404 },
      );
    }

    // Map database user to UserData format
    // Parse JSON fields if they're stored as strings
    const birthChart = user.birthChart
      ? typeof user.birthChart === 'string'
        ? JSON.parse(user.birthChart)
        : user.birthChart
      : undefined;

    const personalCard = user.personalCard
      ? typeof user.personalCard === 'string'
        ? JSON.parse(user.personalCard)
        : user.personalCard
      : undefined;

    const location = user.location
      ? typeof user.location === 'string'
        ? JSON.parse(user.location)
        : user.location
      : undefined;

    // Marketing persona should always have full access for demo purposes
    // If no subscription, default to 'active' (not 'free')
    const subscriptionStatus = user.subscription?.status || 'active';
    const subscriptionPlan = user.subscription?.planType || 'pro';

    const userData = {
      id: user.id,
      name: user.name || undefined,
      email: user.email,
      birthday: user.birthday || undefined,
      birthChart,
      personalCard,
      location,
      intention: user.intention || undefined,
      stripeCustomerId: user.subscription?.stripeCustomerId || undefined,
      subscriptionStatus,
      subscriptionPlan,
      trialEndsAt: user.subscription?.trialEndsAt?.toISOString() || undefined,
      hasBirthChart: !!(
        birthChart &&
        Array.isArray(birthChart) &&
        birthChart.length > 0
      ),
      hasPersonalCard: !!personalCard,
      isPaid: true, // Always true for marketing persona
    };

    // Aggressive caching headers for marketing page performance
    return NextResponse.json(userData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching persona profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Revalidate every 5 minutes (Next.js cache)
export const revalidate = 300;
