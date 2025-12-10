import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const result = await sql`
      SELECT 
        id,
        name,
        description,
        color,
        icon,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM collections WHERE folder_id = collection_folders.id) as item_count
      FROM collection_folders
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      folders: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        icon: row.icon,
        itemCount: parseInt(row.item_count || '0', 10),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
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
    const body = await request.json();

    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Folder name is required' },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO collection_folders (user_id, name, description, color, icon)
      VALUES (
        ${user.id},
        ${name},
        ${description || null},
        ${color || '#6366f1'},
        ${icon || 'book'}
      )
      RETURNING id, name, description, color, icon, created_at, updated_at
    `;

    const folder = result.rows[0];

    return NextResponse.json({
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        color: folder.color,
        icon: folder.icon,
        itemCount: 0,
        createdAt: folder.created_at,
        updatedAt: folder.updated_at,
      },
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('id');

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Folder ID is required' },
        { status: 400 },
      );
    }

    const folderCheck = await sql`
      SELECT id FROM collection_folders
      WHERE id = ${parseInt(folderId, 10)} AND user_id = ${user.id}
    `;

    if (folderCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 },
      );
    }

    await sql`
      UPDATE collections
      SET folder_id = NULL
      WHERE folder_id = ${parseInt(folderId, 10)} AND user_id = ${user.id}
    `;

    await sql`
      DELETE FROM collection_folders
      WHERE id = ${parseInt(folderId, 10)} AND user_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
