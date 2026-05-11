import { getIndexNowConfig } from '@/lib/indexnow';

export const revalidate = 3600;

export async function GET() {
  const { key } = getIndexNowConfig();

  if (!key) {
    return new Response('IndexNow is not configured.\n', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  return new Response(`${key}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
