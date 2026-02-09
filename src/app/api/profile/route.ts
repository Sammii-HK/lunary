import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { encrypt, decrypt } from '@/lib/encryption';
import { normalizeIsoDateOnly } from '@/lib/date-only';
import { decryptLocation, encryptLocation } from '@/lib/location-encryption';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile from user_profiles
    let profileResult = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
    `;

    let profile = profileResult.rows[0] || null;

    // Get subscription from subscriptions table
    const subscriptionResult = await sql`
      SELECT * FROM subscriptions WHERE user_id = ${user.id} LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0] || null;

    // Decrypt sensitive PII fields (name and birthday are encrypted)
    const decryptedName = profile?.name ? decrypt(profile.name) : null;
    const decryptedBirthdayRaw = profile?.birthday
      ? decrypt(profile.birthday)
      : null;
    const decryptedBirthday = normalizeIsoDateOnly(decryptedBirthdayRaw);

    return NextResponse.json(
      {
        profile: profile
          ? {
              id: profile.id,
              userId: profile.user_id,
              name: decryptedName,
              birthday: decryptedBirthday,
              birthChart: profile.birth_chart,
              personalCard: profile.personal_card,
              location: decryptLocation(profile.location),
              stripeCustomerId: profile.stripe_customer_id,
              intention: profile.intention,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            }
          : null,
        subscription: subscription
          ? {
              status: subscription.status || 'free',
              planType: subscription.plan_type,
              stripeCustomerId: subscription.stripe_customer_id,
              stripeSubscriptionId: subscription.stripe_subscription_id,
              trialEndsAt: subscription.trial_ends_at,
              currentPeriodEnd: subscription.current_period_end,
            }
          : { status: 'free' },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error: any) {
    // Handle missing table gracefully
    if (error?.code === '42P01') {
      console.error('[Profile] Table does not exist:', error.message);
      return NextResponse.json(
        { profile: null, subscription: { status: 'free' } },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      birthday,
      birthChart,
      personalCard,
      location,
      intention,
      stripeCustomerId,
      stripeSubscriptionId,
      userEmail,
    } = body;

    const normalizedBirthday = normalizeIsoDateOnly(birthday);

    // Encrypt sensitive PII data
    const encryptedName = name ? encrypt(name) : null;
    const encryptedBirthday = normalizedBirthday
      ? encrypt(normalizedBirthday)
      : null;

    const encryptedLocation = location ? encryptLocation(location) : null;

    const result = await sql`
      INSERT INTO user_profiles (
        user_id,
        name,
        birthday,
        birth_chart,
        personal_card,
        location,
        intention,
        stripe_customer_id
      )
      VALUES (
        ${user.id}, 
        ${encryptedName}, 
        ${encryptedBirthday},
        ${birthChart ? JSON.stringify(birthChart) : null}::jsonb,
        ${personalCard ? JSON.stringify(personalCard) : null}::jsonb,
        ${encryptedLocation ? JSON.stringify(encryptedLocation) : null}::jsonb,
        ${intention || null},
        ${stripeCustomerId || null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, user_profiles.name),
        birthday = COALESCE(EXCLUDED.birthday, user_profiles.birthday),
        birth_chart = COALESCE(EXCLUDED.birth_chart, user_profiles.birth_chart),
        personal_card = COALESCE(EXCLUDED.personal_card, user_profiles.personal_card),
        location = COALESCE(EXCLUDED.location, user_profiles.location),
        intention = COALESCE(EXCLUDED.intention, user_profiles.intention),
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_profiles.stripe_customer_id),
        updated_at = NOW()
      RETURNING *
    `;

    const profile = result.rows[0];

    if (stripeCustomerId || stripeSubscriptionId || userEmail) {
      try {
        await sql`
          INSERT INTO subscriptions (
            user_id,
            user_email,
            status,
            plan_type,
            stripe_customer_id,
            stripe_subscription_id
          ) VALUES (
            ${user.id},
            ${userEmail || null},
            'free',
            'free',
            ${stripeCustomerId || null},
            ${stripeSubscriptionId || null}
          )
          ON CONFLICT (user_id) DO UPDATE SET
            stripe_customer_id = COALESCE(
              EXCLUDED.stripe_customer_id,
              subscriptions.stripe_customer_id
            ),
            stripe_subscription_id = COALESCE(
              EXCLUDED.stripe_subscription_id,
              subscriptions.stripe_subscription_id
            ),
            user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
            updated_at = NOW()
        `;
      } catch (error) {
        console.error('Failed to persist Stripe identifiers:', error);
      }
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        userId: profile.user_id,
        name: profile.name ? decrypt(profile.name) : null,
        birthday: profile.birthday ? decrypt(profile.birthday) : null,
        birthChart: profile.birth_chart,
        personalCard: profile.personal_card,
        location: decryptLocation(profile.location),
        stripeCustomerId: profile.stripe_customer_id,
        intention: profile.intention,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
