import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

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

    const updates: string[] = [];
    const values: any[] = [user.id, parseInt(id, 10)];
    let paramIndex = 3;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      values.push(tags);
      paramIndex++;
    }

    if (folderId !== undefined) {
      updates.push(`folder_id = $${paramIndex}`);
      values.push(folderId ? parseInt(folderId, 10) : null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE collections
      SET ${sql.raw(updates.join(', '))}, updated_at = NOW()
      WHERE id = $2 AND user_id = $1
      RETURNING id, title, description, category, content, tags, folder_id, created_at, updated_at
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
