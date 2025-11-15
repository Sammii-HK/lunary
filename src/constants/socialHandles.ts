export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'threads'
  | 'pinterest'
  | 'bluesky';

const normalizeHandle = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getEnvHandle = (key: string, fallback?: string) => {
  const envValue =
    typeof process !== 'undefined' && process.env
      ? process.env[key]
      : undefined;
  return normalizeHandle(envValue) ?? normalizeHandle(fallback);
};

const PLATFORM_ORDER: SocialPlatform[] = [
  'instagram',
  'twitter',
  'threads',
  'bluesky',
  'pinterest',
  'tiktok',
];

export const SOCIAL_HANDLES: Record<SocialPlatform, string | undefined> = {
  instagram: getEnvHandle('NEXT_PUBLIC_INSTAGRAM_HANDLE', '@lunary.app'),
  twitter: getEnvHandle('NEXT_PUBLIC_TWITTER_HANDLE', '@lunaryApp'),
  threads: getEnvHandle('NEXT_PUBLIC_THREADS_HANDLE', '@lunary.app'),
  bluesky: getEnvHandle('NEXT_PUBLIC_BLUESKY_HANDLE', '@lunaryapp.bsky.social'),
  pinterest: getEnvHandle('NEXT_PUBLIC_PINTEREST_HANDLE', '@lunaryapp'),
  tiktok: getEnvHandle('NEXT_PUBLIC_TIKTOK_HANDLE'),
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  threads: 'Threads',
  pinterest: 'Pinterest',
  bluesky: 'Bluesky',
};

type SocialTag = {
  platform: SocialPlatform;
  label: string;
  handle: string;
};

export const SOCIAL_TAGS: SocialTag[] = PLATFORM_ORDER.map((platform) => ({
  platform,
  label: SOCIAL_PLATFORM_LABELS[platform],
  handle: SOCIAL_HANDLES[platform] ?? '',
})).filter((tag): tag is SocialTag => Boolean(tag.handle));

export const getPrimaryHandle = (platform?: string) => {
  if (platform) {
    const normalized = platform.toLowerCase() as SocialPlatform;
    const handle = SOCIAL_HANDLES[normalized];
    if (handle) return handle;
  }
  return SOCIAL_TAGS[0]?.handle ?? '@lunary.app';
};
