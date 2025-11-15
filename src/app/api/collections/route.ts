import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { hasFeatureAccess } from '../../../../utils/pricing';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status, plan FROM subscriptions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    const hasAccess = hasFeatureAccess(
      subscription?.status || 'free',
      subscription?.plan || undefined,
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
      SELECT status, plan FROM subscriptions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    const hasAccess = hasFeatureAccess(
      subscription?.status || 'free',
      subscription?.plan || undefined,
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
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO collections (user_id, title, description, category, content, tags, folder_id)
      VALUES (
        ${user.id},
        ${title},
        ${description || null},
        ${category},
        ${JSON.stringify(content)}::jsonb,
        ${tags || []}::text[],
        ${folderId ? parseInt(folderId, 10) : null}
      )
      RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
    `;

    const collection = result.rows[0];

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
