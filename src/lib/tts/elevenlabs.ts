const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

// Faster, clearer voice settings - optimized for both short and long form
const MYSTICAL_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.8, // Higher = more consistent, faster pace
  similarity_boost: 0.85, // Higher = clearer, more natural
  style: 0.6, // Slightly higher = less breathy, more energetic
  use_speaker_boost: true, // Enabled for clarity and faster pace
};

// DEPRECATED: Old voice list removed - use OpenAI voices instead

// DEPRECATED: Use src/lib/tts/index.ts instead
// This file is kept for backward compatibility only
import { generateVoiceover as generateVoiceoverNew } from './index';

export async function generateVoiceover(
  text: string,
  options: {
    voiceId?: string;
    settings?: Partial<VoiceSettings>;
    useMysticalSettings?: boolean;
  } = {},
): Promise<ArrayBuffer> {
  console.warn('⚠️ Using deprecated ElevenLabs TTS. Migrating to OpenAI TTS.');

  // Map old options to new format
  const newOptions = {
    voiceName: 'alloy',
    model: 'gpt-4o-mini-tts',
  };

  return generateVoiceoverNew(text, newOptions);
}

export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  const data = await response.json();
  return data.voices;
}

// DEPRECATED: Stub functions for backward compatibility
export async function checkQuota(): Promise<{
  character_count: number;
  character_limit: number;
  remaining: number;
}> {
  console.warn(
    '⚠️ checkQuota is deprecated. OpenAI TTS uses pay-as-you-go pricing.',
  );
  // Return mock data - OpenAI doesn't have a quota system like ElevenLabs
  return {
    character_count: 0,
    character_limit: Infinity,
    remaining: Infinity,
  };
}

export function estimateCharacterCost(text: string): number {
  // OpenAI TTS: check current pricing for gpt-4o-mini-tts.
  return text.length;
}

// DEPRECATED: Map to OpenAI voices
export const MYSTICAL_VOICES = [
  {
    id: 'nova',
    name: 'Nova',
    description: 'British female voice - clear and natural (OpenAI)',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'British male voice - deep and clear (OpenAI)',
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Female voice - natural (OpenAI)',
  },
  {
    id: 'alloy',
    name: 'Alloy',
    description: 'Neutral voice - versatile (OpenAI)',
  },
];
