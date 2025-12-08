import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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

export async function POST(req: Request) {
  try {
    // Validate secret
    const secret = req.headers.get('x-posts-secret');
    if (!secret || secret !== process.env.POSTS_SHARED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
