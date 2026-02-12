import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Gather all user data in parallel
    const [
      profile,
      subscription,
      tarotReadings,
      notes,
      aiThreads,
      streaks,
      pushSubscriptions,
      collections,
      collectionFolders,
      relationshipProfiles,
      synastryReports,
      cosmicReports,
      ritualHabits,
      weeklyRitualUsage,
      emailPreferences,
      friendConnections,
      moonCircleInsights,
      communityPosts,
      userMemory,
      userProgress,
      consentLog,
      analyticsActivity,
    ] = await Promise.all([
      prisma.user_profiles.findFirst({ where: { user_id: userId } }),
      prisma.subscriptions.findUnique({ where: { user_id: userId } }),
      prisma.tarot_readings.findMany({ where: { user_id: userId } }),
      prisma.user_notes.findMany({ where: { user_id: userId } }),
      prisma.aiThread.findMany({ where: { userId: userId } }),
      prisma.user_streaks.findFirst({ where: { user_id: userId } }),
      prisma.push_subscriptions.findMany({ where: { user_id: userId } }),
      prisma.collections.findMany({ where: { user_id: userId } }),
      prisma.collection_folders.findMany({ where: { user_id: userId } }),
      prisma.relationship_profiles.findMany({ where: { user_id: userId } }),
      prisma.synastry_reports.findMany({ where: { user_id: userId } }),
      prisma.cosmic_reports.findMany({ where: { user_id: userId } }),
      prisma.ritual_habits.findMany({ where: { user_id: userId } }),
      prisma.weekly_ritual_usage.findMany({ where: { user_id: userId } }),
      prisma.email_preferences.findFirst({ where: { user_id: userId } }),
      prisma.friend_connections.findMany({ where: { user_id: userId } }),
      prisma.moon_circle_insights.findMany({ where: { user_id: userId } }),
      prisma.community_posts.findMany({ where: { user_id: userId } }),
      prisma.user_memory.findMany({ where: { user_id: userId } }),
      prisma.user_progress.findMany({ where: { user_id: userId } }),
      prisma.consent_log.findMany({ where: { user_id: userId } }),
      prisma.analytics_user_activity.findMany({
        where: { user_id: userId },
      }),
    ]);

    // Decrypt sensitive fields
    const decryptedProfile = profile
      ? {
          ...profile,
          name: profile.name ? decrypt(profile.name) : null,
          birthday: profile.birthday ? decrypt(profile.birthday) : null,
        }
      : null;

    // Decrypt user_memory fact_encrypted fields
    const decryptedMemory = userMemory.map((memory) => ({
      ...memory,
      fact: memory.fact_encrypted ? decrypt(memory.fact_encrypted) : null,
      fact_encrypted: undefined,
    }));

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      email: userEmail,
      profile: decryptedProfile,
      subscription: subscription || null,
      tarotReadings,
      notes,
      aiConversations: aiThreads.map((thread) => ({
        ...thread,
        messageCount: Array.isArray(thread.messages)
          ? thread.messages.length
          : 0,
      })),
      streaks: streaks || null,
      pushSubscriptions: pushSubscriptions.length,
      collections,
      collectionFolders,
      relationshipProfiles,
      synastryReports,
      cosmicReports,
      ritualHabits,
      weeklyRitualUsage,
      emailPreferences: emailPreferences || null,
      friendConnections,
      moonCircleInsights,
      communityPosts,
      userMemory: decryptedMemory,
      userProgress,
      consentLog,
      analyticsActivity,
      dataRetentionInfo: {
        description:
          'Your data is retained as long as your account is active. You can request deletion at any time.',
        deletionPolicy:
          'Account deletion is processed within 30 days. Some data may be retained for legal compliance.',
      },
    };

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lunary-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 },
    );
  }
}
