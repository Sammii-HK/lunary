const normalizeOrigin = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '');
  }
  return `https://${trimmed.replace(/\/+$/, '')}`;
};

const getStaticOrigins = (): string[] => {
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://lunary.app',
    'https://www.lunary.app',
    'https://admin.lunary.app',
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_ADMIN_APP_URL,
    process.env.ADMIN_APP_HOST,
    process.env.ADMIN_DASHBOARD_HOST,
    process.env.NEXT_PUBLIC_ADMIN_APP_HOST,
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ]
    .map(normalizeOrigin)
    .filter(Boolean) as string[];
};

const originPatterns = [
  /^https:\/\/[a-z0-9][a-z0-9-]*-sammiis-projects\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*-sammiis-projects\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*\.lunary\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*--lunary\.app$/i,
];

export function isValidOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;

  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  const staticOrigins = getStaticOrigins();
  if (staticOrigins.includes(normalized)) {
    return true;
  }

  return originPatterns.some((pattern) => pattern.test(normalized));
}

export function getCorsHeaders(origin: string | null | undefined): HeadersInit {
  if (!isValidOrigin(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin!,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
  };
}

export function getAllowedOrigins(): string[] {
  return getStaticOrigins();
}
