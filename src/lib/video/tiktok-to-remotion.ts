/**
 * TikTok Script → Remotion Props Transformer
 *
 * Converts a TikTokScript to AppDemoVideoProps for Remotion rendering.
 */

import type { TikTokScript } from './tiktok-scripts';
import type { AppDemoVideoProps } from '@/remotion/compositions/AppDemoVideo';
import type { Overlay } from '@/remotion/components/TextOverlays';
import type { ZoomPoint } from '@/remotion/components/ZoomRegion';
import type { TapPoint } from '@/remotion/components/TapIndicator';
import { getCategoryVisuals } from '@/remotion/config/category-visuals';
import {
  scriptToAudioSegments,
  scriptToSceneAlignedSegments,
} from './remotion-renderer';

/**
 * Maps TikTok script IDs to category-visual category keys.
 */
const TIKTOK_CATEGORY_MAP: Record<string, string> = {
  'dashboard-overview': 'transits',
  'horoscope-deepdive': 'zodiac',
  'tarot-patterns': 'tarot',
  'astral-guide': 'divination',
  'birth-chart': 'birth-chart',
  'profile-circle': 'zodiac',
  'sky-now-deepdive': 'transits',
  'numerology-deepdive': 'numerology',
  'pattern-timeline': 'tarot',
  'ritual-system': 'spells',
  'transit-wisdom-deepdive': 'transits',
  'streaks-progress': 'lunar',
  'tarot-spreads': 'tarot',
  'crystals-overview': 'crystals',
  'spells-overview': 'spells',
  'grimoire-search': 'divination',
};

/**
 * Extract highlight terms from a script.
 * Picks planet names, numbers, and key astrology terms from the voiceover.
 */
function extractHighlightTerms(script: TikTokScript): string[] {
  const planetNames = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
    'Chiron',
    'Lilith',
  ];

  const astroTerms = [
    'retrograde',
    'transit',
    'house',
    'aspect',
    'orb',
    'conjunction',
    'trine',
    'square',
    'opposition',
    'sextile',
    'Celtic Cross',
    'Tower',
    'Cups',
  ];

  const allTerms = [...planetNames, ...astroTerms];
  const voText = script.voiceover.toLowerCase();

  return allTerms.filter((term) => voText.includes(term.toLowerCase()));
}

/**
 * Derive zoom punch-in windows from a script's scenes.
 *
 * Scenes with an explicit `zoomTo` use those coordinates.
 * Scenes with action 'click' or 'expand' without `zoomTo` get a default
 * center-screen zoom at 1.2× to add visual dynamics automatically.
 */
function deriveZoomPoints(script: TikTokScript): ZoomPoint[] {
  const zoomPoints: ZoomPoint[] = [];
  let t = script.hook.durationSeconds;

  for (const scene of script.scenes) {
    const sceneStart = t;
    const sceneEnd = t + scene.durationSeconds;

    if (scene.zoomTo) {
      // Explicit zoom target defined on this scene
      zoomPoints.push({
        startTime: sceneStart + 0.15,
        endTime: sceneEnd - 0.15,
        scale: scene.zoomTo.scale,
        x: scene.zoomTo.x,
        y: scene.zoomTo.y,
      });
    } else if (
      (scene.action === 'click' || scene.action === 'expand') &&
      scene.durationSeconds >= 1.5
    ) {
      // Auto-derive: gentle zoom for interaction scenes without explicit target
      zoomPoints.push({
        startTime: sceneStart + 0.2,
        endTime: sceneEnd - 0.2,
        scale: 1.2,
        x: 0.5,
        y: 0.45,
      });
    }

    t = sceneEnd;
  }

  return zoomPoints;
}

/**
 * Derive tap ripple positions from a script's scenes.
 *
 * Scenes with an explicit `tapPosition` use those coordinates.
 * Scenes with action 'click' or 'expand' without `tapPosition` get a
 * default center-screen tap.
 */
function deriveTapPoints(
  script: TikTokScript,
  accentColor?: string,
): TapPoint[] {
  const tapPoints: TapPoint[] = [];
  let t = script.hook.durationSeconds;

  for (const scene of script.scenes) {
    if (scene.action === 'click' || scene.action === 'expand') {
      tapPoints.push({
        time: t + 0.3,
        x: scene.tapPosition?.x ?? 0.5,
        y: scene.tapPosition?.y ?? 0.45,
        color: accentColor,
      });
    }
    t += scene.durationSeconds;
  }

  return tapPoints;
}

/**
 * Convert a TikTokScript to AppDemoVideoProps for Remotion rendering.
 *
 * @param script — The TikTok script definition
 * @param videoSrc — Path to the screen recording relative to public/ (e.g. "app-demos/dashboard-overview.webm")
 * @param audioUrl — Path to the TTS audio relative to public/ (e.g. "app-demos/tts/dashboard-overview.mp3")
 * @param audioDuration — Duration of the TTS audio in seconds (for subtitle timing)
 */
export function scriptToAppDemoProps(
  script: TikTokScript,
  videoSrc: string,
  audioUrl?: string,
  audioDuration?: number,
): AppDemoVideoProps {
  // Effective duration — extend if TTS audio is longer than script
  const effectiveDuration = audioDuration
    ? Math.max(script.totalSeconds, Math.ceil(audioDuration))
    : script.totalSeconds;

  // Hook timing
  const hookStartTime = 0;
  const hookEndTime = script.hook.durationSeconds;

  // Map text overlays to Remotion Overlay format
  const overlays: Overlay[] = script.textOverlays.map((overlay) => ({
    text: overlay.text,
    startTime: overlay.startSeconds,
    endTime: overlay.startSeconds + overlay.durationSeconds,
    style: 'chapter' as const,
  }));

  // Outro timing — anchored to actual end so CTA is always the last thing on screen
  const outroStartTime = effectiveDuration - script.outro.durationSeconds;
  const outroEndTime = effectiveDuration;

  // Subtitle segments — use scene-aligned if voiceoverLine data exists, else fallback
  const hasVoiceoverLines = script.scenes.some((s) => s.voiceoverLine);
  const segments =
    audioDuration && audioDuration > 0
      ? hasVoiceoverLines
        ? scriptToSceneAlignedSegments(script, audioDuration)
        : scriptToAudioSegments(script.voiceover, audioDuration)
      : undefined;

  // Category visuals
  const categoryKey = TIKTOK_CATEGORY_MAP[script.id] || 'transits';
  const categoryVisuals = getCategoryVisuals(categoryKey);

  // Highlight terms
  const highlightTerms = extractHighlightTerms(script);

  // Recording dead time before the first scene is visible:
  // - Hook wait: 800ms (all scripts)
  // - DISMISS_MODALS beforeSteps: 600ms (Escape 300ms + wait 300ms) — only some scripts
  const SCRIPTS_WITH_DISMISS_MODALS = new Set([
    'dashboard-overview',
    'sky-now-deepdive',
    'ritual-system',
  ]);
  const audioStartOffset = SCRIPTS_WITH_DISMISS_MODALS.has(script.id)
    ? 1.4 // 600ms modals + 800ms hook
    : 0.8; // 800ms hook only

  const zoomPoints = deriveZoomPoints(script);
  const tapPoints = deriveTapPoints(script, categoryVisuals?.accentColor);

  return {
    videoSrc,
    hookText: script.hook.text,
    hookStartTime,
    hookEndTime,
    overlays,
    outroText: script.outro.text,
    outroStartTime,
    outroEndTime,
    audioUrl,
    segments,
    categoryVisuals,
    highlightTerms,
    showProgress: true,
    audioStartOffset,
    backgroundMusicUrl: 'audio/series/lunary-bed-v1.mp3',
    backgroundMusicVolume: 0.15,
    zoomPoints,
    tapPoints,
    zodiacSign: script.zodiacSign,
  };
}
