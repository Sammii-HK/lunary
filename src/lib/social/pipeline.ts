import { generateVoiceover } from '@/lib/tts';
import { normalizeHashtagsForPlatform } from '@/lib/social/social-copy-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';

const IMAGE_FORMATS = ['landscape', 'square', 'portrait', 'story'] as const;

export interface SocialAssets {
  week: number;
  substackUrl: string;
  images: {
    landscape: string;
    square: string;
    portrait: string;
    story: string;
  };
  voiceover?: {
    url: string;
    duration: number;
  };
  captions: {
    short: string;
    medium: string;
    long: string;
  };
  hashtags: string[];
  platforms: {
    instagram: { feed: string; story: string };
    tiktok: { video: string };
    facebook: { post: string; story: string };
    twitter: { post: string };
    linkedin: { post: string };
  };
}

export async function generateSocialAssets(
  week: number,
  baseUrl: string,
  options: {
    generateVoiceover?: boolean;
    substackUrl?: string;
  } = {},
): Promise<SocialAssets> {
  const contentResponse = await fetch(
    `${baseUrl}/api/social/content?week=${week}`,
  );
  if (!contentResponse.ok) {
    throw new Error(`Failed to fetch content: ${contentResponse.status}`);
  }
  const content = await contentResponse.json();

  const images: Record<string, string> = {};
  for (const format of IMAGE_FORMATS) {
    images[format] =
      `${baseUrl}/api/social/images?week=${week}&format=${format}`;
  }

  let voiceover: SocialAssets['voiceover'] | undefined;
  if (options.generateVoiceover && content.voiceover?.script) {
    try {
      const audioBuffer = await generateVoiceover(content.voiceover.script, {
        voiceName: 'alloy',
        speed: 1.0,
      });
      const base64 = Buffer.from(audioBuffer).toString('base64');
      voiceover = {
        url: `data:audio/mpeg;base64,${base64}`,
        duration: content.voiceover.estimatedDuration,
      };
    } catch (error) {
      console.error('Failed to generate voiceover:', error);
    }
  }

  return {
    week,
    substackUrl: options.substackUrl || '',
    images: images as SocialAssets['images'],
    voiceover,
    captions: content.captions,
    hashtags: content.hashtags,
    platforms: {
      instagram: {
        feed: normalizeHashtagsForPlatform(
          normalizeGeneratedContent(
            `${content.captions.medium}\n\n${content.hashtags.join(' ')}`,
          ),
          'instagram',
        ),
        story: content.captions.short,
      },
      tiktok: {
        video: normalizeHashtagsForPlatform(
          normalizeGeneratedContent(
            `${content.captions.short} ${content.hashtags
              .slice(0, 5)
              .join(' ')}`,
          ),
          'tiktok',
        ),
      },
      facebook: {
        post: normalizeHashtagsForPlatform(
          normalizeGeneratedContent(content.captions.long),
          'facebook',
        ),
        story: content.captions.short,
      },
      twitter: {
        post: normalizeHashtagsForPlatform(
          normalizeGeneratedContent(
            `${content.captions.short}\n\n${content.hashtags
              .slice(0, 3)
              .join(' ')}`,
          ),
          'twitter',
        ),
      },
      linkedin: {
        post: normalizeHashtagsForPlatform(
          normalizeGeneratedContent(content.captions.long),
          'linkedin',
        ),
      },
    },
  };
}

export function getAyrsharePayload(assets: SocialAssets) {
  return {
    instagram: {
      post: {
        mediaUrl: assets.images.portrait,
        caption: assets.platforms.instagram.feed,
      },
      story: {
        mediaUrl: assets.images.story,
        caption: assets.platforms.instagram.story,
      },
    },
    tiktok: {
      mediaUrl: assets.images.story,
      caption: assets.platforms.tiktok.video,
    },
    facebook: {
      post: {
        mediaUrl: assets.images.landscape,
        caption: assets.platforms.facebook.post,
      },
      story: {
        mediaUrl: assets.images.story,
      },
    },
    twitter: {
      mediaUrl: assets.images.landscape,
      caption: assets.platforms.twitter.post,
    },
    linkedin: {
      mediaUrl: assets.images.landscape,
      caption: assets.platforms.linkedin.post,
    },
  };
}
