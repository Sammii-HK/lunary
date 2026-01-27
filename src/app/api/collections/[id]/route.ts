import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { conversionTracking } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    const result = await sql`
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
      WHERE c.id = ${parseInt(id, 10)}
      AND c.user_id = ${user.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 },
      );
    }

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
        folderName: collection.folder_name,
        folderColor: collection.folder_color,
        folderIcon: collection.folder_icon,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const body = await request.json();

    const { title, description, tags, folderId } = body;

    // Build UPDATE query with only provided fields
    if (
      title === undefined &&
      description === undefined &&
      tags === undefined &&
      folderId === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 },
      );
    }

    // Build query conditionally based on what's provided
    let result;
    if (
      title !== undefined &&
      description !== undefined &&
      tags !== undefined &&
      folderId !== undefined
    ) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, description = ${description}, tags = ${tags}, folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (
      title !== undefined &&
      description !== undefined &&
      tags !== undefined
    ) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, description = ${description}, tags = ${tags}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (
      title !== undefined &&
      description !== undefined &&
      folderId !== undefined
    ) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, description = ${description}, folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (
      title !== undefined &&
      tags !== undefined &&
      folderId !== undefined
    ) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, tags = ${tags}, folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (
      description !== undefined &&
      tags !== undefined &&
      folderId !== undefined
    ) {
      result = await sql`
        UPDATE collections
        SET description = ${description}, tags = ${tags}, folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (title !== undefined && description !== undefined) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, description = ${description}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (title !== undefined && tags !== undefined) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, tags = ${tags}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (title !== undefined && folderId !== undefined) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (description !== undefined && tags !== undefined) {
      result = await sql`
        UPDATE collections
        SET description = ${description}, tags = ${tags}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (description !== undefined && folderId !== undefined) {
      result = await sql`
        UPDATE collections
        SET description = ${description}, folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (tags !== undefined && folderId !== undefined) {
      result = await sql`
        UPDATE collections
        SET tags = ${tags}, folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (title !== undefined) {
      result = await sql`
        UPDATE collections
        SET title = ${title}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (description !== undefined) {
      result = await sql`
        UPDATE collections
        SET description = ${description}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else if (tags !== undefined) {
      result = await sql`
        UPDATE collections
        SET tags = ${tags}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    } else {
      result = await sql`
        UPDATE collections
        SET folder_id = ${folderId ? parseInt(folderId, 10) : null}, updated_at = NOW()
        WHERE id = ${parseInt(id, 10)} AND user_id = ${user.id}
        RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
      `;
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 },
      );
    }

    const collection = result.rows[0];

    // Track journal/dream updates
    if (collection.category === 'dream') {
      conversionTracking.dreamEntryUpdated(user.id, {
        entryId: collection.id,
        fieldsUpdated: Object.keys(body),
      });
    } else if (collection.category === 'journal') {
      conversionTracking.journalEntryUpdated(user.id, {
        entryId: collection.id,
        fieldsUpdated: Object.keys(body),
      });
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
    console.error('Error updating collection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    // Get category before deletion for tracking
    const categoryResult = await sql`
      SELECT category
      FROM collections
      WHERE id = ${parseInt(id, 10)}
      AND user_id = ${user.id}
    `;

    const result = await sql`
      DELETE FROM collections
      WHERE id = ${parseInt(id, 10)}
      AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 },
      );
    }

    // Track journal/dream deletion
    const category = categoryResult.rows[0]?.category;
    if (category === 'dream') {
      conversionTracking.dreamEntryDeleted(user.id, {
        entryId: parseInt(id, 10),
      });
    } else if (category === 'journal') {
      conversionTracking.journalEntryDeleted(user.id, {
        entryId: parseInt(id, 10),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
