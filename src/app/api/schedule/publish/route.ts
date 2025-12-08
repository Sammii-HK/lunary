import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch drafts from GitHub
    const draftsResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/content/drafts`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'lunary-blog-api',
        },
      },
    );

    if (!draftsResponse.ok) {
      if (draftsResponse.status === 404) {
        return NextResponse.json({
          message: 'No drafts folder found',
          published: [],
        });
      }
      throw new Error(`GitHub API error: ${draftsResponse.status}`);
    }

    const drafts = await draftsResponse.json();
    const published = [];

    for (const draft of drafts) {
      if (!draft.name.endsWith('.mdx')) continue;

      // Get file content
      const fileResponse = await fetch(draft.download_url);
      const content = await fileResponse.text();

      // Extract date from frontmatter
      const dateMatch = content.match(/^date:\s*["']?([^"'\n]+)["']?/m);
      if (!dateMatch) continue;

      const postDate = dateMatch[1];
      if (postDate <= today) {
        // Move to blog folder
        const slug = draft.name.replace('.mdx', '');
        const newPath = `content/blog/${draft.name}`;

        // Create in blog folder
        const createResponse = await fetch(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${newPath}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
              'User-Agent': 'lunary-blog-api',
            },
            body: JSON.stringify({
              message: `Publish scheduled post: ${slug}`,
              content: Buffer.from(content, 'utf8').toString('base64'),
              branch: process.env.GITHUB_DEFAULT_BRANCH || 'main',
            }),
          },
        );

        if (createResponse.ok) {
          // Delete from drafts folder
          await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${draft.path}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'lunary-blog-api',
              },
              body: JSON.stringify({
                message: `Remove published draft: ${slug}`,
                sha: draft.sha,
                branch: process.env.GITHUB_DEFAULT_BRANCH || 'main',
              }),
            },
          );

          published.push({ slug, date: postDate, path: newPath });
        }
      }
    }

    return NextResponse.json({
      message: `Published ${published.length} posts`,
      published,
      checkedDate: today,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to publish posts' },
      { status: 500 },
    );
  }
}
