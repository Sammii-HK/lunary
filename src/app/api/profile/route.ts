import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { encrypt, decrypt } from '@/lib/encryption';

// Migrate data from Jazz if profile is empty/missing
async function migrateFromJazz(userId: string) {
  try {
    const { loadJazzProfile } = await import('@/lib/jazz/server');
    const jazzProfile = await loadJazzProfile(userId);

    if (!jazzProfile) return null;

    const jazzData = {
      name: (jazzProfile as any)?.name || null,
      birthday: (jazzProfile as any)?.birthday || null,
      birthChart: (jazzProfile as any)?.birthChart || null,
      personalCard: (jazzProfile as any)?.personalCard || null,
      location: (jazzProfile as any)?.location || null,
    };

    // Only save if we have any data
    if (
      jazzData.name ||
      jazzData.birthday ||
      jazzData.birthChart ||
      jazzData.personalCard ||
      jazzData.location
    ) {
      // Encrypt sensitive PII data
      const encryptedName = jazzData.name ? encrypt(jazzData.name) : null;
      const encryptedBirthday = jazzData.birthday
        ? encrypt(jazzData.birthday)
        : null;

      await sql`
        INSERT INTO user_profiles (user_id, name, birthday, birth_chart, personal_card, location)
        VALUES (
          ${userId}, 
          ${encryptedName}, 
          ${encryptedBirthday},
          ${jazzData.birthChart ? JSON.stringify(jazzData.birthChart) : null}::jsonb,
          ${jazzData.personalCard ? JSON.stringify(jazzData.personalCard) : null}::jsonb,
          ${jazzData.location ? JSON.stringify(jazzData.location) : null}::jsonb
        )
        ON CONFLICT (user_id) DO UPDATE SET
          name = COALESCE(user_profiles.name, EXCLUDED.name),
          birthday = COALESCE(user_profiles.birthday, EXCLUDED.birthday),
          birth_chart = COALESCE(user_profiles.birth_chart, EXCLUDED.birth_chart),
          personal_card = COALESCE(user_profiles.personal_card, EXCLUDED.personal_card),
          location = COALESCE(user_profiles.location, EXCLUDED.location),
          updated_at = NOW()
      `;

      console.log(`[Profile] Migrated Jazz data for user ${userId}`);
    }

    return jazzData;
  } catch (error) {
    console.error('[Profile] Jazz migration failed:', error);
    return null;
  }
}

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

    // Self-healing: if no profile or missing key data, try Jazz migration
    if (!profile || (!profile.birthday && !profile.birth_chart)) {
      const jazzData = await migrateFromJazz(user.id);

      if (jazzData) {
        // Refetch after migration
        profileResult = await sql`
          SELECT * FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
        `;
        profile = profileResult.rows[0] || null;
      }
    }

    // Get subscription from subscriptions table
    const subscriptionResult = await sql`
      SELECT * FROM subscriptions WHERE user_id = ${user.id} LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0] || null;

    // Decrypt sensitive PII fields (name and birthday are encrypted)
    const decryptedName = profile?.name ? decrypt(profile.name) : null;
    const decryptedBirthday = profile?.birthday
      ? decrypt(profile.birthday)
      : null;

    return NextResponse.json({
      profile: profile
        ? {
            id: profile.id,
            userId: profile.user_id,
            name: decryptedName,
            birthday: decryptedBirthday,
            birthChart: profile.birth_chart,
            personalCard: profile.personal_card,
            location: profile.location,
            stripeCustomerId: profile.stripe_customer_id,
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
    });
  } catch (error: any) {
    // Handle missing table gracefully
    if (error?.code === '42P01') {
      console.error('[Profile] Table does not exist:', error.message);
      return NextResponse.json({
        profile: null,
        subscription: { status: 'free' },
      });
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
      stripeCustomerId,
      stripeSubscriptionId,
      userEmail,
    } = body;

    // Encrypt sensitive PII data
    const encryptedName = name ? encrypt(name) : null;
    const encryptedBirthday = birthday ? encrypt(birthday) : null;

    const result = await sql`
      INSERT INTO user_profiles (
        user_id,
        name,
        birthday,
        birth_chart,
        personal_card,
        location,
        stripe_customer_id
      )
      VALUES (
        ${user.id}, 
        ${encryptedName}, 
        ${encryptedBirthday},
        ${birthChart ? JSON.stringify(birthChart) : null}::jsonb,
        ${personalCard ? JSON.stringify(personalCard) : null}::jsonb,
        ${location ? JSON.stringify(location) : null}::jsonb,
        ${stripeCustomerId || null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, user_profiles.name),
        birthday = COALESCE(EXCLUDED.birthday, user_profiles.birthday),
        birth_chart = COALESCE(EXCLUDED.birth_chart, user_profiles.birth_chart),
        personal_card = COALESCE(EXCLUDED.personal_card, user_profiles.personal_card),
        location = COALESCE(EXCLUDED.location, user_profiles.location),
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
        location: profile.location,
        stripeCustomerId: profile.stripe_customer_id,
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
