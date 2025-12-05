import { NextRequest, NextResponse } from 'next/server';
import { loadUserMemory, deleteUserMemory } from '@/lib/ai/user-memory';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

async function getUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memories = await loadUserMemory(user.id, 50);

    return NextResponse.json({
      success: true,
      memories,
    });
  } catch (error) {
    console.error('Error fetching user memory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memories' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get('id');

    if (memoryId) {
      // Delete specific memory
      await sql`
        DELETE FROM user_memory 
        WHERE id = ${parseInt(memoryId, 10)} 
        AND user_id = ${user.id}
      `;
      return NextResponse.json({ success: true, deleted: memoryId });
    } else {
      // Delete all memories for user
      await deleteUserMemory(user.id);
      return NextResponse.json({ success: true, deleted: 'all' });
    }
  } catch (error) {
    console.error('Error deleting user memory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete memory' },
      { status: 500 },
    );
  }
}
