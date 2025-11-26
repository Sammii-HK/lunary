import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { loadGoogleFont } from '../../../../../../utils/astrology/cosmic-og';

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

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 30%, ${data.color}40 70%, #1e1b2e 100%)`,
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 40px',
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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '30px',
          }}
        >
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
            }}
          >
            {data.subtitle}
          </div>
        </div>

        <div
          style={{
            fontSize: '24px',
            fontWeight: '300',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.1em',
            paddingBottom: '20px',
            display: 'flex',
          }}
        >
          lunary.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: robotoFont
        ? [
            {
              name: 'Roboto Mono',
              data: robotoFont,
              style: 'normal',
            },
          ]
        : [],
    },
  );
}
