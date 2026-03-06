import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get active recommendations from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recommendations = await prisma.activation_recommendations.findMany({
      where: {
        status: 'active',
        generated_at: { gte: sevenDaysAgo },
      },
      orderBy: [
        { priority: 'asc' },
        { category: 'asc' },
        { generated_at: 'desc' },
      ],
      take: 20,
    });

    return NextResponse.json({
      recommendations: recommendations.map((r) => ({
        ...r,
        generated_at: r.generated_at.toISOString(),
        created_at: r.created_at.toISOString(),
        updated_at: r.updated_at.toISOString(),
      })),
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 },
    );
  }
}
