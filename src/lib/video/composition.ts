import { VideoConfig, VideoFrame, VIDEO_DIMENSIONS } from './types';

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
