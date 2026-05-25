const DEFAULT_BASE_URL = 'https://lunary.app';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_KEY_PATH = '/indexnow-key.txt';

function normalizeEnvSecret(value: string | undefined) {
  const normalized = value?.replace(/\s+/g, '') || '';
  return normalized || undefined;
}

function normalizeEnvUrl(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function getIndexNowConfig() {
  const key = normalizeEnvSecret(process.env.INDEXNOW_KEY);
  const baseUrl =
    normalizeEnvUrl(process.env.NEXT_PUBLIC_SITE_URL)?.replace(/\/+$/, '') ||
    DEFAULT_BASE_URL;
  const keyLocation =
    normalizeEnvUrl(process.env.INDEXNOW_KEY_LOCATION) ||
    `${baseUrl}${DEFAULT_KEY_PATH}`;
  const publishSecret = normalizeEnvSecret(process.env.INDEXNOW_PUBLISH_SECRET);

  return {
    key,
    baseUrl,
    keyLocation,
    publishSecret,
  };
}

export function isIndexNowConfigured() {
  const { key } = getIndexNowConfig();
  return Boolean(key);
}

export async function submitIndexNowUrls(urlList: string[]) {
  const { key, baseUrl, keyLocation } = getIndexNowConfig();

  if (!key) {
    throw new Error('Missing INDEXNOW_KEY');
  }

  const normalizedUrls = Array.from(
    new Set(
      urlList
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) =>
          url.startsWith('http')
            ? url
            : `${baseUrl}/${url.replace(/^\/+/, '')}`,
        ),
    ),
  );

  if (normalizedUrls.length === 0) {
    throw new Error('No URLs provided for IndexNow submission');
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      host: new URL(baseUrl).host,
      key,
      keyLocation,
      urlList: normalizedUrls,
    }),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`IndexNow submission failed (${response.status}): ${body}`);
  }

  return {
    status: response.status,
    body,
    submitted: normalizedUrls,
  };
}
