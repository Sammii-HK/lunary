import { NextRequest, NextResponse } from 'next/server';
import {
  generateVoiceoverScript,
  estimateVoiceoverDuration,
} from '@/lib/video/composition';
import { estimateCharacterCost } from '@/lib/tts/elevenlabs'; // Deprecated but kept for compatibility

export const dynamic = 'force-dynamic';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

function getMoonPhaseEmoji(date: Date): string {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const knownNewMoon = new Date('2024-01-11');
  const daysSinceNew = Math.floor(
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24),
  );
  const lunarCycle = 29.53;
  const phase = ((daysSinceNew % lunarCycle) + lunarCycle) % lunarCycle;
  const phaseIndex = Math.floor((phase / lunarCycle) * 8) % 8;
  return phases[phaseIndex];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weekOffset = parseInt(searchParams.get('week') || '0');

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + weekOffset * 7);

  const weekStart = getWeekStart(targetDate);
  const weekRange = formatWeekRange(weekStart);
  const moonPhase = getMoonPhaseEmoji(weekStart);

  const title = `Weekly Cosmic Forecast`;
  const subtitle = `${weekRange}`;
  const voiceoverScript = generateVoiceoverScript({
    title: `Your cosmic forecast for ${weekRange}`,
    subtitle: "Major planetary shifts shape this week's energy",
    format: 'story',
    duration: 10,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const imageParams = new URLSearchParams({
    title,
    subtitle,
    week: weekRange,
    moon: moonPhase,
  });

  const content = {
    weekOffset,
    weekStart: weekStart.toISOString(),
    weekRange,
    moonPhase,

    images: {
      landscape: `${baseUrl}/api/social/images?${imageParams}&format=landscape`,
      square: `${baseUrl}/api/social/images?${imageParams}&format=square`,
      portrait: `${baseUrl}/api/social/images?${imageParams}&format=portrait`,
      story: `${baseUrl}/api/social/images?${imageParams}&format=story`,
    },

    captions: {
      short: `${moonPhase} ${title} | ${weekRange}`,
      medium: `${moonPhase} Your cosmic forecast for ${weekRange} is here! Major planetary shifts are shaping this week's energy. ✨`,
      long: `${moonPhase} Weekly Cosmic Forecast | ${weekRange}\n\nThe stars have aligned to bring you insights for the week ahead. Discover what the cosmos has in store for you.\n\n✨ Get your personalized horoscope at lunary.app`,
    },

    hashtags: [
      '#astrology',
      '#horoscope',
      '#zodiac',
      '#cosmicforecast',
      '#weeklyhoroscope',
      '#lunary',
      '#stargazing',
      '#celestial',
    ],

    voiceover: {
      script: voiceoverScript,
      estimatedDuration: estimateVoiceoverDuration(voiceoverScript),
      characterCount: estimateCharacterCost(voiceoverScript),
    },

    video: {
      config: {
        title,
        subtitle,
        weekRange,
        moonPhase,
        duration: 12,
      },
      formats: ['story', 'square'],
    },

    platformOptions: {
      instagram: {
        feed: {
          imageFormat: 'portrait',
          caption: 'medium',
        },
        story: {
          imageFormat: 'story',
          caption: 'short',
        },
        reel: {
          videoFormat: 'story',
          caption: 'medium',
        },
      },
      tiktok: {
        videoFormat: 'story',
        caption: 'short',
        hashtags: true,
      },
      facebook: {
        feed: {
          imageFormat: 'landscape',
          caption: 'long',
        },
        story: {
          imageFormat: 'story',
          caption: 'short',
        },
      },
      twitter: {
        imageFormat: 'landscape',
        caption: 'short',
      },
      linkedin: {
        imageFormat: 'landscape',
        caption: 'long',
      },
      youtube: {
        short: {
          videoFormat: 'story',
          title,
          description: 'long',
        },
      },
    },

    links: {
      substack: `https://lunaryapp.substack.com`,
      app: `${baseUrl}?utm_source=social&utm_medium=post&utm_campaign=weekly_forecast`,
    },
  };

  return NextResponse.json(content);
}
