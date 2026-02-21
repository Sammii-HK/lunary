import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const params = request.nextUrl.searchParams;
  const email = params.get('email');
  const userId = params.get('user_id');
  const limit = Math.min(parseInt(params.get('limit') ?? '20', 10), 100);

  if (!email && !userId) {
    return NextResponse.json(
      { error: 'email or user_id query param is required' },
      { status: 400 },
    );
  }

  try {
    // Resolve user ID from email if needed
    let resolvedUserId = userId;
    if (email && !resolvedUserId) {
      const result = await sql`
        SELECT id FROM "user" WHERE email = ${email} LIMIT 1
      `;
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: `User not found: ${email}` },
          { status: 404 },
        );
      }
      resolvedUserId = result.rows[0].id;
    }

    const threads = await prisma.aiThread.findMany({
      where: { userId: resolvedUserId! },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: true,
      },
    });

    return NextResponse.json({
      threads: threads.map((t) => ({
        id: t.id,
        title: t.title,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        messageCount: Array.isArray(t.messages) ? t.messages.length : 0,
      })),
    });
  } catch (error) {
    console.error('[admin/astral-guide/threads] Error:', error);
    return NextResponse.json(
      { error: 'Failed to list threads' },
      { status: 500 },
    );
  }
}
