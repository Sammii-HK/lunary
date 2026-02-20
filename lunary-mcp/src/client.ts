const BASE_URL = process.env.LUNARY_API_URL || 'https://www.lunary.app';
const ADMIN_KEY = process.env.LUNARY_ADMIN_KEY || '';

export async function lunary<T = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, string | undefined>;
  } = {},
): Promise<T> {
  const { method = 'GET', body, params } = options;

  const url = new URL(`/api/admin${path}`, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_KEY}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Lunary API ${method} ${path}: ${res.status} ${text.slice(0, 300)}`,
    );
  }

  return res.json() as Promise<T>;
}
