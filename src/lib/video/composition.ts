import { VideoConfig, VideoFrame, VIDEO_DIMENSIONS } from './types';
import type { WeeklyCosmicData } from '../../../utils/blog/weeklyContentGenerator';

export function generateVideoTimeline(config: VideoConfig): VideoFrame[] {
  const { duration } = config;
  const fps = VIDEO_DIMENSIONS[config.format].fps;
  const totalFrames = duration * fps;
  const frames: VideoFrame[] = [];

  const lines = [
    config.moonPhase || '🌙',
    config.title,
    config.subtitle || '',
    config.weekRange || '',
    '✨ LUNARY',
  ].filter(Boolean);

  const lineDelay = duration / (lines.length + 2);

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps;
    const elements = lines.map((content, index) => {
      const lineStart = index * lineDelay;
      const progress = Math.max(0, Math.min(1, (time - lineStart) / 0.5));
      const eased = easeOutCubic(progress);

      return {
        type: (index === 0 ? 'emoji' : 'text') as 'text' | 'emoji',
        content,
        style: {
          opacity: eased,
          y: 20 * (1 - eased),
          scale: index === 0 ? 0.8 + 0.2 * eased : 1,
        },
      };
    });

    frames.push({ time, elements });
  }

  return frames;
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function generateVoiceoverScript(config: VideoConfig): string {
  const parts = [];

  if (config.title) {
    parts.push(config.title.replace(/\|/g, ','));
  }

  if (config.subtitle) {
    parts.push(config.subtitle);
  }

  parts.push('Your weekly cosmic forecast awaits on Lunary.');

  return parts.join('. ');
}

export function estimateVoiceoverDuration(text: string): number {
  const wordsPerSecond = 2.5;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerSecond);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
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

export function generateVoiceoverScriptFromWeeklyData(
  weeklyData: WeeklyCosmicData,
  type: 'short' | 'long',
): string {
  if (type === 'short') {
    // Short-form: 15-30 seconds, use the energetic signature snippet
    const parts: string[] = [];

    parts.push(
      `Your cosmic forecast for the week of ${formatWeekRange(weeklyData.weekStart)}`,
    );

    // Use the energetic signature from major aspects (like the blog intro)
    if (weeklyData.majorAspects.length > 0) {
      const topAspects = weeklyData.majorAspects.slice(0, 3);
      const planets = new Set<string>();
      topAspects.forEach((aspect) => {
        planets.add(aspect.planetA);
        planets.add(aspect.planetB);
      });
      const planetList = Array.from(planets);
      if (planetList.length >= 2) {
        const planetNames = planetList.slice(0, 3).join(', ');
        parts.push(
          `The interplay between ${planetNames} creates a unique energetic signature for this week, offering both challenges and opportunities for growth.`,
        );
      }
    }

    // Top planetary highlight with actual sign name
    if (weeklyData.planetaryHighlights.length > 0) {
      const top = weeklyData.planetaryHighlights[0];
      if (top.event === 'enters-sign' && top.details.toSign) {
        parts.push(
          `${top.planet} enters ${top.details.toSign} on ${formatDate(top.date)}`,
        );
      } else {
        const eventText = top.event.replace(/-/g, ' ');
        parts.push(`${top.planet} ${eventText} on ${formatDate(top.date)}`);
      }
    }

    // Retrograde changes
    if (weeklyData.retrogradeChanges.length > 0) {
      const retro = weeklyData.retrogradeChanges[0];
      parts.push(
        `${retro.planet} ${retro.action === 'begins' ? 'stations retrograde' : 'goes direct'} on ${formatDate(retro.date)}`,
      );
    }

    parts.push('Get your full forecast on Lunary');

    return parts.join('. ');
  } else {
    // Long-form: 5-15 minutes, comprehensive overview
    const parts: string[] = [];

    parts.push(
      `Welcome to your weekly cosmic forecast for ${formatWeekRange(weeklyData.weekStart)}`,
    );
    parts.push(weeklyData.summary);

    // Use energetic signature intro (like blog)
    if (weeklyData.majorAspects.length > 0) {
      const topAspects = weeklyData.majorAspects.slice(0, 3);
      const planets = new Set<string>();
      topAspects.forEach((aspect) => {
        planets.add(aspect.planetA);
        planets.add(aspect.planetB);
      });
      const planetList = Array.from(planets);
      if (planetList.length >= 2) {
        const planetNames = planetList.slice(0, 3).join(' and ');
        parts.push(
          `The interplay between ${planetNames} creates a unique energetic signature for this week, offering both challenges and opportunities for growth.`,
        );
      }
    }

    // Planetary highlights section
    if (weeklyData.planetaryHighlights.length > 0) {
      parts.push('Major planetary highlights this week:');
      weeklyData.planetaryHighlights.slice(0, 5).forEach((highlight) => {
        if (highlight.event === 'enters-sign' && highlight.details.toSign) {
          parts.push(
            `${highlight.planet} enters ${highlight.details.toSign} on ${formatDate(highlight.date)}. ${highlight.description}`,
          );
        } else {
          const eventText = highlight.event.replace(/-/g, ' ');
          parts.push(
            `${highlight.planet} ${eventText} on ${formatDate(highlight.date)}. ${highlight.description}`,
          );
        }
        if (highlight.significance) {
          parts.push(`This is a ${highlight.significance} event.`);
        }
      });
    }

    // Retrograde activity
    if (weeklyData.retrogradeChanges.length > 0) {
      parts.push('Retrograde activity:');
      weeklyData.retrogradeChanges.forEach((change) => {
        parts.push(
          `${change.planet} ${change.action === 'begins' ? 'stations retrograde' : 'goes direct'} in ${change.sign} on ${formatDate(change.date)}`,
        );
      });
    }

    // Moon phases
    if (weeklyData.moonPhases.length > 0) {
      parts.push('Moon phases this week:');
      weeklyData.moonPhases.forEach((phase) => {
        parts.push(
          `${phase.phase} moon in ${phase.sign} on ${formatDate(phase.date)}`,
        );
      });
    }

    // Major aspects - FIX: use planetA and planetB, not planet1/planet2
    if (weeklyData.majorAspects.length > 0) {
      parts.push('Key astrological aspects:');
      weeklyData.majorAspects.slice(0, 5).forEach((aspect) => {
        const aspectType =
          aspect.aspect.charAt(0).toUpperCase() + aspect.aspect.slice(1);
        parts.push(
          `${aspect.planetA} ${aspectType} ${aspect.planetB} on ${formatDate(aspect.date)}. ${aspect.energy || ''}`,
        );
      });
    }

    // Best days
    if (weeklyData.bestDaysFor) {
      const bestDays = Object.entries(weeklyData.bestDaysFor)
        .filter(([_, data]) => data.dates.length > 0)
        .slice(0, 3);
      if (bestDays.length > 0) {
        parts.push('Best days this week:');
        bestDays.forEach(([activity, data]) => {
          const datesStr = data.dates
            .map((d: Date) => formatDate(d))
            .join(' and ');
          parts.push(`Best for ${activity} on ${datesStr}`);
          if (data.reason) {
            parts.push(data.reason);
          }
        });
      }
    }

    parts.push(
      'For your personalized horoscope and daily guidance, visit Lunary',
    );

    return parts.join('. ');
  }
}
