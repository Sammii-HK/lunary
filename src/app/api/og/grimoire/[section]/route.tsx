import { NextRequest } from 'next/server';
import { loadGoogleFont } from '../../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGFooter,
  OGContentCenter,
  OGStarfield,
  OGGlowOrbs,
  createOGResponse,
} from '../../../../../../utils/og/base';
import { createSectionGradient } from '../../../../../../utils/og/gradients';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 86400;

const sectionData: Record<
  string,
  { title: string; emoji: string; subtitle: string; color: string }
> = {
  tarot: {
    title: 'Tarot',
    emoji: '🎴',
    subtitle: '78 Cards • Major & Minor Arcana',
    color: '#6366f1',
  },
  zodiac: {
    title: 'Zodiac Signs',
    emoji: '♈',
    subtitle: '12 Signs • Elements • Modalities',
    color: '#f59e0b',
  },
  crystals: {
    title: 'Crystals',
    emoji: '💎',
    subtitle: '50+ Crystals • Healing Properties',
    color: '#8b5cf6',
  },
  runes: {
    title: 'Runes',
    emoji: 'ᚱ',
    subtitle: '24 Elder Futhark Runes',
    color: '#64748b',
  },
  chakras: {
    title: 'Chakras',
    emoji: '🔮',
    subtitle: '7 Energy Centers • Balance',
    color: '#ec4899',
  },
  moon: {
    title: 'Moon Phases',
    emoji: '🌙',
    subtitle: 'Lunar Cycles • Moon Magic',
    color: '#94a3b8',
  },
  'birth-chart': {
    title: 'Birth Chart',
    emoji: '⭐',
    subtitle: 'Houses • Planets • Aspects',
    color: '#3b82f6',
  },
  numerology: {
    title: 'Numerology',
    emoji: '🔢',
    subtitle: 'Life Path • Master Numbers',
    color: '#10b981',
  },
  'candle-magic': {
    title: 'Candle Magic',
    emoji: '🕯️',
    subtitle: 'Colors • Rituals • Spells',
    color: '#f97316',
  },
  correspondences: {
    title: 'Correspondences',
    emoji: '📜',
    subtitle: 'Days • Colors • Elements',
    color: '#a855f7',
  },
  meditation: {
    title: 'Meditation',
    emoji: '🧘',
    subtitle: 'Techniques • Breathwork • Grounding',
    color: '#14b8a6',
  },
  divination: {
    title: 'Divination',
    emoji: '🔮',
    subtitle: 'Scrying • Pendulum • Omens',
    color: '#6366f1',
  },
  'modern-witchcraft': {
    title: 'Modern Witchcraft',
    emoji: '✨',
    subtitle: 'Witch Types • Tools • Practices',
    color: '#8b5cf6',
  },
  'wheel-of-the-year': {
    title: 'Wheel of the Year',
    emoji: '☀️',
    subtitle: '8 Sabbats • Seasonal Celebrations',
    color: '#eab308',
  },
  planets: {
    title: 'Planets',
    emoji: '🪐',
    subtitle: 'Celestial Bodies • Influences',
    color: '#3b82f6',
  },
  houses: {
    title: 'Astrological Houses',
    emoji: '🏠',
    subtitle: '12 Houses • Life Areas',
    color: '#6366f1',
  },
  aspects: {
    title: 'Aspects',
    emoji: '△',
    subtitle: 'Conjunctions • Trines • Squares',
    color: '#8b5cf6',
  },
  retrogrades: {
    title: 'Retrogrades',
    emoji: '℞',
    subtitle: 'Mercury • Venus • Mars',
    color: '#ef4444',
  },
  eclipses: {
    title: 'Eclipses',
    emoji: '🌑',
    subtitle: 'Solar • Lunar • Cosmic Portals',
    color: '#1e293b',
  },
  'life-path': {
    title: 'Life Path Numbers',
    emoji: '🔢',
    subtitle: 'Numerology • Destiny',
    color: '#10b981',
  },
  'angel-numbers': {
    title: 'Angel Numbers',
    emoji: '👼',
    subtitle: 'Divine Messages • Synchronicity',
    color: '#fbbf24',
  },
  'lunar-nodes': {
    title: 'Lunar Nodes',
    emoji: '☊',
    subtitle: 'North Node • South Node • Destiny',
    color: '#6366f1',
  },
  astrology: {
    title: 'Astrology',
    emoji: '✨',
    subtitle: 'Signs • Houses • Aspects',
    color: '#a855f7',
  },
  astronomy: {
    title: 'Astronomy',
    emoji: '🔭',
    subtitle: 'Planets • Retrogrades • Sky Events',
    color: '#3b82f6',
  },
  compatibility: {
    title: 'Compatibility',
    emoji: '💞',
    subtitle: 'Synastry • Matches • Love',
    color: '#ec4899',
  },
  transits: {
    title: 'Transits',
    emoji: '🌌',
    subtitle: 'Current Sky • Timing • Meaning',
    color: '#6366f1',
  },
  placements: {
    title: 'Placements',
    emoji: '📍',
    subtitle: 'Planets in Signs • Interpretations',
    color: '#10b981',
  },
  cusps: {
    title: 'Cusps',
    emoji: '⚡',
    subtitle: 'Zodiac Edges • Blended Energies',
    color: '#f59e0b',
  },
  guides: {
    title: 'Guides',
    emoji: '📚',
    subtitle: 'Beginner-Friendly • Step by Step',
    color: '#8b5cf6',
  },
  practices: {
    title: 'Practices',
    emoji: '🧿',
    subtitle: 'Rituals • Tools • Daily Work',
    color: '#14b8a6',
  },
  spells: {
    title: 'Spells',
    emoji: '🪄',
    subtitle: 'Intentions • Timing • Recipes',
    color: '#f97316',
  },
  synastry: {
    title: 'Synastry',
    emoji: '💫',
    subtitle: 'Relationship Astrology • Dynamics',
    color: '#6366f1',
  },
};

const defaultSection = {
  title: 'Grimoire',
  emoji: '📖',
  subtitle: 'Mystical Knowledge & Cosmic Wisdom',
  color: '#6366f1',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> },
): Promise<Response> {
  const { section } = await params;
  const data = sectionData[section] || defaultSection;

  let robotoFont: ArrayBuffer | null = null;
  try {
    robotoFont = await loadGoogleFont(request);
  } catch (error) {
    console.error('Failed to load font:', error);
  }

  const background = createSectionGradient(data.color);

  return createOGResponse(
    <OGWrapper theme={{ background }}>
      <OGStarfield seed={section} count={60} accentColor={data.color} />
      <OGGlowOrbs accentColor={data.color} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '40px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: '400',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Grimoire
          </div>
        </div>

        <OGContentCenter>
          <div
            style={{
              fontSize: '120px',
              display: 'flex',
            }}
          >
            {data.emoji}
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: '600',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.02em',
              display: 'flex',
              marginTop: '30px',
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '300',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              letterSpacing: '0.05em',
              display: 'flex',
              marginTop: '30px',
            }}
          >
            {data.subtitle}
          </div>
        </OGContentCenter>

        <OGFooter />
      </div>
    </OGWrapper>,
    {
      size: 'landscape',
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
