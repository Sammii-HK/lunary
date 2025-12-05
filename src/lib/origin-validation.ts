const normalizeOrigin = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '');
  }
  return `https://${trimmed.replace(/\/+$/, '')}`;
};

const originPatterns = [
  /^https:\/\/[a-z0-9][a-z0-9-]*-sammiis-projects\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*-sammiis-projects\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*\.vercel\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*\.lunary\.app$/i,
  /^https:\/\/[a-z0-9][a-z0-9-]*--lunary\.app$/i,
];

function matchesOriginPattern(origin: string): boolean {
  return originPatterns.some((pattern) => pattern.test(origin));
}

function isValidOriginPattern(origin: string | null | undefined): boolean {
  if (!origin) return false;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  return matchesOriginPattern(normalized);
}

const getStaticOrigins = (): string[] => {
  const origins: string[] = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://192.168.68.107:3002',
    'http://192.168.68.107:3003',
    'http://admin.localhost:3000',
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
  ]
    .map(normalizeOrigin)
    .filter(Boolean) as string[];

  const vercelUrl = process.env.VERCEL_URL
    ? normalizeOrigin(`https://${process.env.VERCEL_URL}`)
    : null;

  if (vercelUrl) {
    if (isValidOriginPattern(vercelUrl)) {
      origins.push(vercelUrl);
    }
  }

  const uniqueOrigins = Array.from(new Set(origins));

  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.DEBUG_AUTH === 'true'
    ) {
      console.log('🔐 Better Auth trustedOrigins:', uniqueOrigins);
    }
  }

  return uniqueOrigins;
};

let cachedAllowedOrigins: string[] | null = null;

export function getAllowedOrigins(): string[] {
  // In development, don't cache to allow hot reloading of origin changes
  if (process.env.NODE_ENV === 'development') {
    return getStaticOrigins();
  }

  if (cachedAllowedOrigins === null) {
    cachedAllowedOrigins = getStaticOrigins();
  }
  return cachedAllowedOrigins;
}

export function isValidOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;

  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  const staticOrigins = getAllowedOrigins();
  if (staticOrigins.includes(normalized)) {
    return true;
  }

  return matchesOriginPattern(normalized);
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
