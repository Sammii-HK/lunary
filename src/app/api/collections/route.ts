import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { hasFeatureAccess, normalizePlanType } from '../../../../utils/pricing';
import { detectMoods } from '@/lib/journal/mood-detector';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status, plan_type FROM subscriptions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    // Normalize status: 'trialing' -> 'trial' for consistency with hasFeatureAccess
    const rawStatus = subscription?.status || 'free';
    const subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    // Normalize plan type to ensure correct feature access
    const planType = normalizePlanType(subscription?.plan_type);
    const hasAccess = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'collections',
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Collections feature requires Lunary+ subscription',
          upgradeRequired: true,
        },
        { status: 403 },
      );
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const folderId = searchParams.get('folder_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.content,
        c.tags,
        c.folder_id,
        c.created_at,
        c.updated_at,
        cf.name as folder_name,
        cf.color as folder_color,
        cf.icon as folder_icon
      FROM collections c
      LEFT JOIN collection_folders cf ON c.folder_id = cf.id
      WHERE c.user_id = ${user.id}
    `;

    // Build query with optional filters
    if (category && folderId) {
      query = sql`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.content,
          c.tags,
          c.folder_id,
          c.created_at,
          c.updated_at,
          cf.name as folder_name,
          cf.color as folder_color,
          cf.icon as folder_icon
        FROM collections c
        LEFT JOIN collection_folders cf ON c.folder_id = cf.id
        WHERE c.user_id = ${user.id}
        AND c.category = ${category}
        AND c.folder_id = ${parseInt(folderId, 10)}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (category) {
      query = sql`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.content,
          c.tags,
          c.folder_id,
          c.created_at,
          c.updated_at,
          cf.name as folder_name,
          cf.color as folder_color,
          cf.icon as folder_icon
        FROM collections c
        LEFT JOIN collection_folders cf ON c.folder_id = cf.id
        WHERE c.user_id = ${user.id}
        AND c.category = ${category}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (folderId) {
      query = sql`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.content,
          c.tags,
          c.folder_id,
          c.created_at,
          c.updated_at,
          cf.name as folder_name,
          cf.color as folder_color,
          cf.icon as folder_icon
        FROM collections c
        LEFT JOIN collection_folders cf ON c.folder_id = cf.id
        WHERE c.user_id = ${user.id}
        AND c.folder_id = ${parseInt(folderId, 10)}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.content,
          c.tags,
          c.folder_id,
          c.created_at,
          c.updated_at,
          cf.name as folder_name,
          cf.color as folder_color,
          cf.icon as folder_icon
        FROM collections c
        LEFT JOIN collection_folders cf ON c.folder_id = cf.id
        WHERE c.user_id = ${user.id}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const result = await query;

    let totalResult;
    if (category && folderId) {
      totalResult = await sql`
        SELECT COUNT(*) as total
        FROM collections
        WHERE user_id = ${user.id}
        AND category = ${category}
        AND folder_id = ${parseInt(folderId, 10)}
      `;
    } else if (category) {
      totalResult = await sql`
        SELECT COUNT(*) as total
        FROM collections
        WHERE user_id = ${user.id}
        AND category = ${category}
      `;
    } else if (folderId) {
      totalResult = await sql`
        SELECT COUNT(*) as total
        FROM collections
        WHERE user_id = ${user.id}
        AND folder_id = ${parseInt(folderId, 10)}
      `;
    } else {
      totalResult = await sql`
        SELECT COUNT(*) as total
        FROM collections
        WHERE user_id = ${user.id}
      `;
    }

    const total = parseInt(totalResult.rows[0]?.total || '0', 10);

    return NextResponse.json({
      success: true,
      collections: result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        content: row.content,
        tags: row.tags || [],
        folderId: row.folder_id,
        folderName: row.folder_name,
        folderColor: row.folder_color,
        folderIcon: row.folder_icon,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status, plan_type FROM subscriptions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    // Normalize status: 'trialing' -> 'trial' for consistency with hasFeatureAccess
    const rawStatus = subscription?.status || 'free';
    const subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    // Normalize plan type to ensure correct feature access
    const planType = normalizePlanType(subscription?.plan_type);
    const hasAccess = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'collections',
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Collections feature requires Lunary+ subscription',
          upgradeRequired: true,
        },
        { status: 403 },
      );
    }

    // Check collection limits for free tier (if they somehow got access)
    if (subscription?.status === 'free' || !subscription) {
      const collectionCount = await sql`
        SELECT COUNT(*) as count FROM collections WHERE user_id = ${user.id}
      `;
      const count = parseInt(collectionCount.rows[0]?.count || '0', 10);
      if (count >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: 'Free tier limited to 5 collections. Upgrade for unlimited.',
            upgradeRequired: true,
          },
          { status: 403 },
        );
      }
    }

    const body = await request.json();

    const { title, description, category, content, tags, folderId } = body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and content are required' },
        { status: 400 },
      );
    }

    const validCategories = [
      'chat',
      'ritual',
      'insight',
      'moon_circle',
      'tarot',
      'journal',
      'intention',
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 },
      );
    }

    // Enforce free-tier intention limit (max 3 active)
    if (category === 'intention') {
      const isFree = !subscription || subscription.status === 'free';
      if (isFree) {
        const activeCount = await sql`
          SELECT COUNT(*) as count FROM collections
          WHERE user_id = ${user.id}
          AND category = 'intention'
          AND content->>'status' = 'active'
        `;
        const count = parseInt(activeCount.rows[0]?.count || '0', 10);
        if (count >= 3) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Free users can have up to 3 active intentions. Upgrade for unlimited.',
              upgradeRequired: true,
            },
            { status: 403 },
          );
        }
      }
    }

    // AUTO-TAG MOODS for journal entries
    let finalContent = content;
    if (category === 'journal' && content.text) {
      try {
        // Check if moodTags already exist (user may have manually tagged)
        if (!content.moodTags || content.moodTags.length === 0) {
          // SMART HYBRID APPROACH:
          // 1. Try keyword detection first (free, fast)
          // 2. If no moods found AND user is Pro → fallback to AI
          // This minimizes costs while maximizing coverage!

          let detection = await detectMoods(content.text, false); // Try keyword first

          // If keyword found nothing AND user has AI plan → try AI
          if (detection.moods.length === 0) {
            const hasAIPlan =
              planType === 'lunary_plus_ai' ||
              planType === 'lunary_plus_ai_annual';

            if (hasAIPlan) {
              console.log(
                '🤖 Keyword found no moods, trying AI for Plus AI user...',
              );
              detection = await detectMoods(content.text, true); // AI fallback
            }
          }

          if (detection.moods.length > 0) {
            finalContent = {
              ...content,
              moodTags: detection.moods,
              autoTagged: true,
              tagMethod: detection.method,
            };
            console.log(
              `✨ Auto-tagged journal with ${detection.moods.length} moods (${detection.method}): ${detection.moods.join(', ')}`,
            );
          } else {
            console.log('ℹ️ No moods detected (text may be too short/neutral)');
          }
        }
      } catch (error) {
        // Don't fail the request if mood detection fails
        console.error('Mood auto-tagging failed (non-critical):', error);
      }
    }

    const result = await sql`
      INSERT INTO collections (user_id, title, description, category, content, tags, folder_id)
      VALUES (
        ${user.id},
        ${title},
        ${description || null},
        ${category},
        ${JSON.stringify(finalContent)}::jsonb,
        ${tags || []}::text[],
        ${folderId ? parseInt(folderId, 10) : null}
      )
      RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
    `;

    const collection = result.rows[0];

    // Track progress for skill trees
    if (
      category === 'journal' ||
      category === 'ritual' ||
      category === 'intention'
    ) {
      try {
        const { incrementProgress } = await import('@/lib/progress/server');
        const isPro =
          subscriptionStatus === 'active' || subscriptionStatus === 'trial';
        if (category === 'journal') {
          await incrementProgress(user.id, 'journal', 1, isPro);
        } else if (category === 'ritual') {
          await incrementProgress(user.id, 'ritual', 1, isPro);
        } else if (category === 'intention') {
          // Set intention: +5 XP (1 action)
          await incrementProgress(user.id, 'manifestation', 1, isPro);
        }
      } catch (progressError) {
        console.warn('[Collections] Failed to track progress:', progressError);
      }
    }

    return NextResponse.json({
      success: true,
      collection: {
        id: collection.id,
        title: collection.title,
        description: collection.description,
        category: collection.category,
        content: collection.content,
        tags: collection.tags || [],
        folderId: collection.folder_id,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
      },
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
