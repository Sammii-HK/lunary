export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'threads'
  | 'pinterest';

const getEnvHandle = (key: string, fallback: string) => {
  if (typeof process === 'undefined' || !process.env) return fallback;
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

export const SOCIAL_HANDLES: Record<SocialPlatform, string> = {
  instagram: getEnvHandle('NEXT_PUBLIC_INSTAGRAM_HANDLE', '@lunary.app'),
  tiktok: getEnvHandle('NEXT_PUBLIC_TIKTOK_HANDLE', '@lunaryapp'),
  twitter: getEnvHandle('NEXT_PUBLIC_TWITTER_HANDLE', '@lunaryapp'),
  threads: getEnvHandle('NEXT_PUBLIC_THREADS_HANDLE', '@lunary.app'),
  pinterest: getEnvHandle('NEXT_PUBLIC_PINTEREST_HANDLE', '@lunaryapp'),
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  threads: 'Threads',
  pinterest: 'Pinterest',
};

export const SOCIAL_TAGS = (Object.keys(
  SOCIAL_HANDLES,
) as SocialPlatform[]).map((platform) => ({
  platform,
  label: SOCIAL_PLATFORM_LABELS[platform],
  handle: SOCIAL_HANDLES[platform],
}));

export const getPrimaryHandle = (platform?: string) => {
  if (!platform) return SOCIAL_HANDLES.instagram;
  const normalized = platform.toLowerCase() as SocialPlatform;
  if (normalized in SOCIAL_HANDLES) {
    return SOCIAL_HANDLES[normalized];
  }
  return SOCIAL_HANDLES.instagram;
};
