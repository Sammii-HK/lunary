import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const userEmail = session?.user?.email?.toLowerCase();
    const adminEmails = (
      process.env.ADMIN_EMAILS ||
      process.env.ADMIN_EMAIL ||
      ''
    )
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    return Boolean(userEmail && adminEmails.includes(userEmail));
  } catch {
    return false;
  }
}

interface CreatePostRequest {
  title: string;
  description: string;
  date: string;
  status: 'draft' | 'publish';
  tags?: string[];
  cover?: string;
  body: string;
  openPR?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 },
      );
    }

    const data: CreatePostRequest = await req.json();
    const {
      title,
      description,
      date,
      status,
      tags = [],
      cover,
      body,
      openPR = false,
    } = data;

    if (!title || !description || !date || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);

    // Create frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `description: "${description}"`,
      `date: "${date}"`,
      `slug: "${slug}"`,
      tags.length > 0
        ? `tags: [${tags.map((tag) => `"${tag}"`).join(', ')}]`
        : '',
      cover ? `cover: "${cover}"` : '',
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n');

    const content = frontmatter + body;

    // Determine path based on status
    const folder = status === 'publish' ? 'blog' : 'drafts';
    const path = `content/${folder}/${slug}.mdx`;

    // GitHub API request
    const githubResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'lunary-blog-api',
        },
        body: JSON.stringify({
          message: `Add ${status} post: ${title}`,
          content: Buffer.from(content, 'utf8').toString('base64'),
          branch: process.env.GITHUB_DEFAULT_BRANCH || 'main',
        }),
      },
    );

    if (!githubResponse.ok) {
      const error = await githubResponse.text();
      return NextResponse.json(
        { error: `GitHub API error: ${error}` },
        { status: 500 },
      );
    }

    const result = await githubResponse.json();

    // If published, generate videos asynchronously (don't block response)
    if (status === 'publish') {
      // Generate videos in background (fire and forget)
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://lunary.app'
          : 'http://localhost:3000';

      // Generate short-form video
      fetch(`${baseUrl}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'short',
          week: 0, // Current week
          blogContent: {
            title,
            description,
            body,
            slug,
          },
        }),
      }).catch((err) => {
        console.error('Failed to generate short-form video:', err);
      });

      // Generate medium-form video (30-60s recap)
      fetch(`${baseUrl}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'medium',
          week: 0, // Current week
        }),
      }).catch((err) => {
        console.error('Failed to generate medium-form video:', err);
      });

      // Generate long-form video
      fetch(`${baseUrl}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'long',
          blogContent: {
            title,
            description,
            body,
            slug,
          },
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const videoData = await res.json();
            // Upload to YouTube
            if (videoData.video?.id) {
              // Use postContent (which includes hashtags) if available, otherwise use description
              const youtubeDescription =
                videoData.video.postContent || description;
              await fetch(`${baseUrl}/api/youtube/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  videoUrl: videoData.video.url,
                  videoId: videoData.video.id,
                  title,
                  description: youtubeDescription,
                  type: 'long',
                  tags: tags,
                  publishDate: new Date(date).toISOString(),
                }),
              }).catch((err) => {
                console.error(
                  'Failed to upload long-form video to YouTube:',
                  err,
                );
              });
            }
          }
        })
        .catch((err) => {
          console.error('Failed to generate long-form video:', err);
        });
    }

    return NextResponse.json({
      ok: true,
      path,
      slug,
      sha: result.content.sha,
      url: result.content.html_url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 },
    );
  }
}
