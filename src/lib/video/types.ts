export interface VideoConfig {
  title: string;
  subtitle?: string;
  weekRange?: string;
  moonPhase?: string;
  format: 'story' | 'square' | 'landscape';
  duration: number;
  voiceoverText?: string;
}

export interface VideoFrame {
  time: number;
  elements: VideoElement[];
}

export interface VideoElement {
  type: 'text' | 'emoji' | 'shape';
  content: string;
  style: {
    opacity: number;
    y: number;
    scale?: number;
  };
}

export const VIDEO_DIMENSIONS = {
  story: { width: 1080, height: 1920, fps: 30 },
  square: { width: 1080, height: 1080, fps: 30 },
  landscape: { width: 1920, height: 1080, fps: 30 },
} as const;

export const BRAND_COLORS = {
  purple600: '#9333ea',
  purple500: '#a855f7',
  purple400: '#c084fc',
  purple300: '#d8b4fe',
  pink600: '#db2777',
  pink500: '#ec4899',
  zinc900: '#18181b',
  zinc800: '#27272a',
  white: '#ffffff',
  lunaryViolet: '#7358FF',
  lunaryRose: '#FF7B9C',
  lunaryBlue: '#4F5BFF',
  lunaryMidnight: '#0A0A1A',
  lunaryOrchid: '#E066FF',
  lunaryLavender: '#C77DFF',
} as const;
