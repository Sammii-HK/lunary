import { selectSubredditForPostType } from '@/config/reddit-subreddits';

export type DbPostRow = {
  id: number;
  content: string;
  platform: string;
  post_type: string;
  topic?: string | null;
  scheduled_date: string | null;
  image_url: string | null;
  video_url: string | null;
  week_theme: string | null;
  week_start: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  base_group_key: string | null;
  base_post_id: number | null;
};

export type PlatformPayload = {
  platform: string;
  content: string;
  media: Array<{ type: 'image' | 'video'; url: string; alt: string }>;
  reddit?: { title?: string; subreddit?: string };
  pinterestOptions?: { boardId: string; boardName: string };
  tiktokOptions?: { type: string; coverUrl?: string };
  instagramOptions?: { type: string; coverUrl?: string };
};

export const videoPlatforms = ['instagram', 'tiktok', 'threads'];
export const validPlatforms = [
  'twitter',
  'x',
  'instagram',
  'facebook',
  'linkedin',
  'pinterest',
  'reddit',
  'tiktok',
  'bluesky',
  'threads',
];

export const toPlatformStr = (platform: string) =>
  String(platform).toLowerCase().trim();

export const formatMediaKey = (media: PlatformPayload['media']) =>
  media.map((item) => `${item.type}:${item.url}`).join('|');

export const formatReadableDate = (scheduleDate: Date) => {
  const formattedDate = scheduleDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = scheduleDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${formattedDate} at ${formattedTime}`;
};

export const buildPlatformPayload = (
  post: DbPostRow,
  scheduleDate: Date,
  baseUrl: string,
): PlatformPayload => {
  const platformStr = toPlatformStr(post.platform);
  const content = String(post.content || '').trim();
  const shouldUseVideo = post.video_url && videoPlatforms.includes(platformStr);
  const scheduleLabel = `Lunary cosmic insight - ${scheduleDate.toLocaleDateString()}`;

  let imageUrlForPlatform = post.image_url ? String(post.image_url).trim() : '';
  if (imageUrlForPlatform) {
    try {
      if (
        !imageUrlForPlatform.startsWith('http://') &&
        !imageUrlForPlatform.startsWith('https://')
      ) {
        imageUrlForPlatform = new URL(imageUrlForPlatform, baseUrl).toString();
      }
    } catch (error) {
      console.warn('Failed to normalize image URL:', error);
    }
  }

  if (!shouldUseVideo && platformStr === 'tiktok' && imageUrlForPlatform) {
    try {
      const url = new URL(imageUrlForPlatform);
      const currentFormat = url.searchParams.get('format');
      if (!currentFormat || currentFormat === 'square') {
        url.searchParams.set('format', 'story');
        imageUrlForPlatform = url.toString();
      }
    } catch (error) {
      if (!imageUrlForPlatform.includes('format=')) {
        const separator = imageUrlForPlatform.includes('?') ? '&' : '?';
        imageUrlForPlatform = `${imageUrlForPlatform}${separator}format=story`;
      }
    }
  }

  if (shouldUseVideo && platformStr === 'instagram' && imageUrlForPlatform) {
    try {
      const url = new URL(imageUrlForPlatform);
      url.searchParams.set('format', 'story');
      imageUrlForPlatform = url.toString();
    } catch (error) {
      if (!imageUrlForPlatform.includes('format=')) {
        const separator = imageUrlForPlatform.includes('?') ? '&' : '?';
        imageUrlForPlatform = `${imageUrlForPlatform}${separator}format=story`;
      }
    }
  }

  const media: PlatformPayload['media'] = shouldUseVideo
    ? [
        {
          type: 'video',
          url: String(post.video_url || '').trim(),
          alt: scheduleLabel,
        },
      ]
    : imageUrlForPlatform
      ? [
          {
            type: 'image',
            url: imageUrlForPlatform,
            alt: scheduleLabel,
          },
        ]
      : [];

  const payload: PlatformPayload = {
    platform: platformStr,
    content,
    media,
  };

  if (platformStr === 'reddit') {
    const selectedSubreddit = selectSubredditForPostType(post.post_type);
    const redditTitle =
      content.match(/^[^.!?]+[.!?]/)?.[0] ||
      content.substring(0, 100).replace(/\n/g, ' ').trim();
    payload.reddit = {
      title: redditTitle,
      subreddit: selectedSubreddit.name,
    };
  }

  if (platformStr === 'pinterest') {
    payload.pinterestOptions = {
      boardId: process.env.SUCCULENT_PINTEREST_BOARD_ID || 'lunaryapp/lunary',
      boardName: process.env.SUCCULENT_PINTEREST_BOARD_NAME || 'Lunary',
    };
  }

  if (platformStr === 'tiktok' && media.length > 0) {
    payload.tiktokOptions = {
      type: 'post',
      ...(shouldUseVideo && imageUrlForPlatform
        ? { coverUrl: imageUrlForPlatform }
        : {}),
    };
  }

  if (platformStr === 'instagram' && shouldUseVideo) {
    payload.instagramOptions = {
      type: 'reel',
      ...(imageUrlForPlatform ? { coverUrl: imageUrlForPlatform } : {}),
    };
  }

  return payload;
};

export const buildSucculentPostPayload = ({
  posts,
  scheduleDate,
  baseUrl,
  accountGroupId,
}: {
  posts: DbPostRow[];
  scheduleDate: Date;
  baseUrl: string;
  accountGroupId: string;
}) => {
  const basePostId = posts[0]?.base_post_id;
  const basePost =
    typeof basePostId === 'number'
      ? posts.find((post) => post.id === basePostId)
      : undefined;
  const fallbackBasePost = posts.find((post) => {
    const payload = buildPlatformPayload(post, scheduleDate, baseUrl);
    return payload.media.length > 0;
  });
  const selectedBasePost = basePost || fallbackBasePost || posts[0];

  const basePayload = buildPlatformPayload(
    selectedBasePost,
    scheduleDate,
    baseUrl,
  );

  const basePlatforms = new Set<string>();
  const variants: Record<string, { content: string; media?: string[] }> = {};
  let pinterestOptions: PlatformPayload['pinterestOptions'];
  let tiktokOptions: PlatformPayload['tiktokOptions'];
  let instagramOptions: PlatformPayload['instagramOptions'];
  let redditData: PlatformPayload['reddit'];

  const baseMediaKey = formatMediaKey(basePayload.media);

  for (const post of posts) {
    const payload = buildPlatformPayload(post, scheduleDate, baseUrl);

    if (payload.pinterestOptions) {
      pinterestOptions = payload.pinterestOptions;
    }
    if (payload.tiktokOptions) {
      tiktokOptions = payload.tiktokOptions;
    }
    if (payload.instagramOptions) {
      instagramOptions = payload.instagramOptions;
    }
    if (payload.reddit) {
      redditData = payload.reddit;
    }

    const mediaKey = formatMediaKey(payload.media);
    const differs =
      payload.platform !== basePayload.platform ||
      payload.content !== basePayload.content ||
      mediaKey !== baseMediaKey;

    if (differs) {
      variants[payload.platform] = {
        content: payload.content,
        ...(payload.media.length > 0
          ? { media: payload.media.map((item) => item.url) }
          : {}),
      };
    } else {
      basePlatforms.add(payload.platform);
    }
  }

  if (basePlatforms.size === 0) {
    basePlatforms.add(basePayload.platform);
  }

  const postData: any = {
    accountGroupId,
    name: `Lunary Post - ${formatReadableDate(scheduleDate)}`,
    content: basePayload.content,
    platforms: Array.from(basePlatforms),
    scheduledDate: scheduleDate.toISOString(),
    media: basePayload.media,
  };

  if (Object.keys(variants).length > 0) {
    postData.variants = variants;
  }
  if (redditData) {
    postData.reddit = redditData;
  }
  if (pinterestOptions) {
    postData.pinterestOptions = pinterestOptions;
  }
  if (tiktokOptions) {
    postData.tiktokOptions = tiktokOptions;
  }
  if (instagramOptions) {
    postData.instagramOptions = instagramOptions;
  }

  return {
    postData,
    basePost: selectedBasePost,
  };
};
