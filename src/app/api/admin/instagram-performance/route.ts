import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/instagram-performance
 * Fetch aggregated Instagram performance metrics.
 * Query params: ?groupBy=post_type|content_category|hour|day&days=30
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get('groupBy') || 'post_type';
    const days = parseInt(searchParams.get('days') || '30', 10);

    const since = new Date();
    since.setDate(since.getDate() - days);

    if (groupBy === 'post_type') {
      const results = await prisma.instagram_performance.groupBy({
        by: ['post_type'],
        where: { posted_at: { gte: since } },
        _avg: {
          engagement_rate: true,
          save_rate: true,
          impressions: true,
          reach: true,
        },
        _sum: {
          likes: true,
          comments: true,
          saves: true,
          shares: true,
        },
        _count: true,
        orderBy: { _avg: { engagement_rate: 'desc' } },
      });

      return NextResponse.json({ groupBy, days, results });
    }

    if (groupBy === 'content_category') {
      const results = await prisma.instagram_performance.groupBy({
        by: ['content_category'],
        where: {
          posted_at: { gte: since },
          content_category: { not: null },
        },
        _avg: {
          engagement_rate: true,
          save_rate: true,
        },
        _sum: {
          likes: true,
          comments: true,
          saves: true,
          shares: true,
        },
        _count: true,
        orderBy: { _avg: { save_rate: 'desc' } },
      });

      return NextResponse.json({ groupBy, days, results });
    }

    // Top posts
    const topPosts = await prisma.instagram_performance.findMany({
      where: { posted_at: { gte: since } },
      orderBy: { engagement_rate: 'desc' },
      take: 10,
    });

    return NextResponse.json({ groupBy: 'top_posts', days, results: topPosts });
  } catch (error) {
    console.error('[IG Performance GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/instagram-performance
 * Record performance metrics for a post.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      post_type,
      content_category,
      post_url,
      image_url,
      impressions,
      reach,
      likes,
      comments,
      saves,
      shares,
      posted_at,
      metadata,
    } = body;

    if (!post_type) {
      return NextResponse.json(
        { error: 'post_type is required' },
        { status: 400 },
      );
    }

    // Calculate rates
    const totalEngagement =
      (likes || 0) + (comments || 0) + (saves || 0) + (shares || 0);
    const engagement_rate = reach ? totalEngagement / reach : 0;
    const save_rate = reach ? (saves || 0) / reach : 0;

    const record = await prisma.instagram_performance.create({
      data: {
        post_type,
        content_category: content_category || null,
        post_url: post_url || null,
        image_url: image_url || null,
        impressions: impressions || 0,
        reach: reach || 0,
        likes: likes || 0,
        comments: comments || 0,
        saves: saves || 0,
        shares: shares || 0,
        engagement_rate,
        save_rate,
        posted_at: posted_at ? new Date(posted_at) : new Date(),
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error('[IG Performance POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record performance data' },
      { status: 500 },
    );
  }
}
