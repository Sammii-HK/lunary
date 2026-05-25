import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  loadIGFonts,
  IGBrandTag,
  IGCategoryBadge,
  IGProgressDots,
  truncateIG,
  renderIGStarfield,
  renderConstellation,
} from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  CATEGORY_ACCENT,
  CATEGORY_GRADIENT,
  MEME_BACKGROUNDS,
  SIGN_ACCENT,
} from '@/lib/instagram/design-system';
import { OG_COLORS } from '@/lib/share/og-utils';
import type { ThemeCategory } from '@/lib/social/types';
import type { CarouselSlideVariant } from '@/lib/instagram/types';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
const LUNARY_GOLD = '#D4AF37';
const LUNARY_CREAM = '#F5E6C8';
const LUNARY_INK = '#0B0F1A';

type VisualMode = 'aspect' | 'chart' | 'check' | 'insight';
type VisualStyle =
  | 'title_hero'
  | 'transit_receipt'
  | 'transit_aspect'
  | 'chart_check'
  | 'split_explainer'
  | 'myth_vs_reality'
  | 'checklist'
  | 'symbol_cards'
  | 'diagram_check'
  | 'save_cta';

const VISUAL_STYLES: VisualStyle[] = [
  'title_hero',
  'transit_receipt',
  'transit_aspect',
  'chart_check',
  'split_explainer',
  'myth_vs_reality',
  'checklist',
  'symbol_cards',
  'diagram_check',
  'save_cta',
];

const VISUAL_STYLE_ALIASES: Record<string, VisualStyle> = {
  editorial_cover: 'title_hero',
  cover: 'title_hero',
  receipt: 'transit_receipt',
  aspect: 'transit_aspect',
  aspect_map: 'transit_aspect',
  mini_chart: 'chart_check',
  chart: 'chart_check',
  chart_wheel: 'chart_check',
  house_check: 'chart_check',
  comparison_split: 'split_explainer',
  compare: 'split_explainer',
  split: 'split_explainer',
  myth_reality: 'myth_vs_reality',
  myth: 'myth_vs_reality',
  steps: 'checklist',
  how_to: 'checklist',
  method: 'checklist',
  symbols: 'symbol_cards',
  icon_cards: 'symbol_cards',
  diagram: 'diagram_check',
  flow: 'diagram_check',
  cta: 'save_cta',
  save: 'save_cta',
};

const VISUAL_STYLE_META: Record<
  VisualStyle,
  { accent: string; gradient: string; textMaxWidth: number }
> = {
  title_hero: {
    accent: LUNARY_GOLD,
    gradient: `linear-gradient(135deg, ${LUNARY_INK} 0%, #101727 54%, #05070D 100%)`,
    textMaxWidth: 860,
  },
  transit_receipt: {
    accent: LUNARY_GOLD,
    gradient: `linear-gradient(135deg, ${LUNARY_INK} 0%, #142033 50%, #080B12 100%)`,
    textMaxWidth: 520,
  },
  transit_aspect: {
    accent: '#F5C76B',
    gradient: 'linear-gradient(135deg, #080B12 0%, #18213A 54%, #070911 100%)',
    textMaxWidth: 510,
  },
  chart_check: {
    accent: '#A8A9C7',
    gradient: 'linear-gradient(135deg, #070A12 0%, #101B2B 50%, #0B0F1A 100%)',
    textMaxWidth: 500,
  },
  split_explainer: {
    accent: '#8BC8F2',
    gradient: 'linear-gradient(135deg, #07111D 0%, #10223A 48%, #080B12 100%)',
    textMaxWidth: 500,
  },
  myth_vs_reality: {
    accent: '#E6B17E',
    gradient: 'linear-gradient(135deg, #100B11 0%, #1D1A2D 48%, #080B12 100%)',
    textMaxWidth: 510,
  },
  checklist: {
    accent: '#B4E1C5',
    gradient: 'linear-gradient(135deg, #07120F 0%, #102235 52%, #080B12 100%)',
    textMaxWidth: 520,
  },
  symbol_cards: {
    accent: LUNARY_GOLD,
    gradient: `linear-gradient(135deg, ${LUNARY_INK} 0%, #111827 48%, #080B12 100%)`,
    textMaxWidth: 520,
  },
  diagram_check: {
    accent: '#C5A8FF',
    gradient: 'linear-gradient(135deg, #0B0B18 0%, #18213A 50%, #080B12 100%)',
    textMaxWidth: 500,
  },
  save_cta: {
    accent: LUNARY_CREAM,
    gradient: `linear-gradient(135deg, ${LUNARY_INK} 0%, #151827 52%, #070911 100%)`,
    textMaxWidth: 520,
  },
};

function parseBoundedInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(max, parsed));
}

function normaliseVisualStyle(
  value: string,
  fallback: VisualStyle,
): VisualStyle {
  const key = value.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const alias = VISUAL_STYLE_ALIASES[key];
  if (alias) return alias;
  if (VISUAL_STYLES.includes(key as VisualStyle)) return key as VisualStyle;
  return fallback;
}

function inferVisualStyle(
  variant: CarouselSlideVariant,
  subtitle: string,
  content: string,
): VisualStyle {
  if (variant === 'cover') return 'title_hero';
  if (variant === 'cta') return 'save_cta';

  const blob = `${subtitle} ${content}`.toLowerCase();
  if (/\b(myth|reality|truth|mistake|not this|read this)\b/.test(blob)) {
    return 'myth_vs_reality';
  }
  if (/\b(house|chart|placement|rising|where it lands)\b/.test(blob)) {
    return 'chart_check';
  }
  if (/\b(conjunct|square|trine|sextile|opposition|aspect)\b/.test(blob)) {
    return 'transit_aspect';
  }
  if (/\b(transit|timing|event|exact|degree|window)\b/.test(blob)) {
    return 'transit_receipt';
  }
  if (/\b(compare|versus|vs|love|career|difference)\b/.test(blob)) {
    return 'split_explainer';
  }
  if (/\b(how to|step|use|practice|ritual|check|find|notice)\b/.test(blob)) {
    return 'checklist';
  }
  if (
    /\b(keywords|strengths|ingredients|associations|alignments)\b/.test(blob)
  ) {
    return 'symbol_cards';
  }
  return 'diagram_check';
}

function editorialFrame(
  accent: string,
  slideIndex: number,
  totalSlides: number,
) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 46,
          left: 46,
          right: 46,
          bottom: 46,
          border: `1px solid ${accent}70`,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 104,
          left: 76,
          display: 'flex',
          color: accent,
          fontSize: 22,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Lunary / {String(slideIndex + 1).padStart(2, '0')} of{' '}
        {String(totalSlides).padStart(2, '0')}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 76,
          width: 230,
          height: 1,
          background: `${accent}88`,
          display: 'flex',
        }}
      />
    </>
  );
}

function orbitDiagram(accent: string, mode: VisualMode) {
  const faint = `${accent}33`;
  if (mode === 'chart') {
    return (
      <div
        style={{
          position: 'absolute',
          right: 82,
          bottom: 178,
          width: 360,
          height: 360,
          borderRadius: 999,
          border: `2px solid ${accent}88`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.92,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: 999,
            border: `1px solid ${faint}`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 112,
            height: 112,
            borderRadius: 999,
            border: `1px solid ${faint}`,
            display: 'flex',
          }}
        />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 2,
              height: 334,
              background: `${accent}30`,
              transform: `rotate(${i * 45}deg)`,
              display: 'flex',
            }}
          />
        ))}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 40px ${accent}80`,
            display: 'flex',
          }}
        />
      </div>
    );
  }
  if (mode === 'aspect') {
    return (
      <div
        style={{
          position: 'absolute',
          right: 72,
          bottom: 210,
          width: 440,
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.9,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 20,
            width: 128,
            height: 128,
            borderRadius: 999,
            border: `2px solid ${accent}99`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 20,
            width: 128,
            height: 128,
            borderRadius: 999,
            border: `2px solid ${LUNARY_CREAM}55`,
            display: 'flex',
          }}
        />
        <div
          style={{
            width: 210,
            height: 2,
            background: `${accent}88`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            border: `2px solid ${accent}44`,
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />
      </div>
    );
  }
  if (mode === 'check') {
    return (
      <div
        style={{
          position: 'absolute',
          right: 86,
          bottom: 190,
          width: 360,
          height: 300,
          border: `1px solid ${accent}70`,
          background: 'rgba(8, 12, 22, 0.42)',
          padding: 34,
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: 18, alignItems: 'center' }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: accent,
                opacity: 1 - i * 0.22,
                display: 'flex',
              }}
            />
            <div
              style={{
                height: 2,
                width: 220 - i * 42,
                background: `${accent}66`,
                display: 'flex',
              }}
            />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        right: 72,
        bottom: 184,
        width: 350,
        height: 350,
        borderRadius: 999,
        border: `1px solid ${accent}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
      }}
    >
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: 999,
          border: `2px solid ${accent}70`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 44px ${accent}66`,
            display: 'flex',
          }}
        />
      </div>
    </div>
  );
}

function visualPanel(
  accent: string,
  style: VisualStyle,
  mode: VisualMode,
  heading: string,
) {
  const value = style;
  const panelBase = {
    position: 'absolute' as const,
    right: 72,
    bottom: 176,
    width: 390,
    height: 390,
    display: 'flex',
  };

  if (value === 'transit_receipt') {
    return (
      <div
        style={{
          ...panelBase,
          height: 430,
          flexDirection: 'column',
          padding: 32,
          border: `1px solid ${accent}66`,
          background: 'rgba(7, 11, 20, 0.72)',
          gap: 18,
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: 22,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          Transit receipt
        </div>
        <div
          style={{
            color: LUNARY_CREAM,
            fontSize: 30,
            lineHeight: 1.25,
            display: 'flex',
          }}
        >
          {truncateIG(heading || 'Sky fact', 42)}
        </div>
        {['Event', 'Timing', 'Check'].map((label, i) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${accent}${i === 0 ? '66' : '33'}`,
              paddingTop: 18,
            }}
          >
            <span
              style={{
                color: accent,
                fontSize: 20,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {label}
            </span>
            <span
              style={{
                width: 132 - i * 20,
                height: 2,
                background: `${accent}88`,
                display: 'flex',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (value === 'transit_aspect' || mode === 'aspect') {
    return (
      <div
        style={{
          ...panelBase,
          width: 420,
          height: 318,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: 138,
            height: 138,
            borderRadius: 999,
            border: `2px solid ${accent}99`,
            boxShadow: `0 0 42px ${accent}26`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            width: 138,
            height: 138,
            borderRadius: 999,
            border: `2px solid ${LUNARY_CREAM}55`,
            display: 'flex',
          }}
        />
        <div
          style={{
            width: 226,
            height: 2,
            background: `${accent}88`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: 330,
            padding: '18px 22px',
            border: `1px solid ${accent}55`,
            color: LUNARY_CREAM,
            fontSize: 20,
            lineHeight: 1.35,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          {truncateIG(heading || 'Transit proof', 46)}
        </div>
      </div>
    );
  }

  if (value === 'chart_check' || mode === 'chart') {
    return orbitDiagram(accent, 'chart');
  }

  if (value === 'split_explainer') {
    return (
      <div
        style={{
          ...panelBase,
          flexDirection: 'row',
          gap: 16,
        }}
      >
        {['Sky fact', 'Where it lands'].map((label, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              border: `1px solid ${accent}${i === 0 ? '77' : '44'}`,
              background: i === 0 ? `${accent}16` : 'rgba(8, 12, 22, 0.58)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                color: accent,
                fontSize: 19,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {label}
            </div>
            <div
              style={{
                height: i === 0 ? 150 : 92,
                border: `1px solid ${accent}55`,
                borderRadius: i === 0 ? 999 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: i === 0 ? 42 : 118,
                  height: i === 0 ? 42 : 2,
                  borderRadius: 999,
                  background: accent,
                  display: 'flex',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (value === 'myth_vs_reality') {
    return (
      <div
        style={{
          ...panelBase,
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {[
          ['Not this', 'rgba(80, 22, 32, 0.55)'],
          ['Read this', `${accent}18`],
        ].map(([label, bg], i) => (
          <div
            key={label}
            style={{
              flex: 1,
              border: `1px solid ${accent}${i === 0 ? '44' : '88'}`,
              background: bg,
              padding: 26,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                border: `2px solid ${accent}88`,
                color: accent,
                fontSize: 26,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              {i === 0 ? 'x' : '+'}
            </div>
            <div
              style={{
                color: i === 0 ? '#C7B9A2' : LUNARY_CREAM,
                fontSize: 24,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (value === 'checklist' || mode === 'check') {
    const labels = ['Find', 'Name', 'Act'];
    return (
      <div
        style={{
          ...panelBase,
          height: 330,
          flexDirection: 'column',
          gap: 22,
          padding: 30,
          border: `1px solid ${accent}66`,
          background: 'rgba(7, 11, 20, 0.72)',
        }}
      >
        {labels.map((label, i) => (
          <div
            key={label}
            style={{ display: 'flex', gap: 18, alignItems: 'center' }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: `1px solid ${accent}88`,
                color: accent,
                fontSize: 18,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                color: LUNARY_CREAM,
                fontSize: 24,
                display: 'flex',
                width: 82,
              }}
            >
              {label}
            </div>
            <div
              style={{
                width: 156 - i * 36,
                height: 2,
                background: `${accent}66`,
                display: 'flex',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (value === 'symbol_cards') {
    return (
      <div
        style={{
          ...panelBase,
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 112,
              border: `1px solid ${accent}${i === 0 ? '88' : '44'}`,
              background: i === 0 ? `${accent}16` : 'rgba(8, 12, 22, 0.54)',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 22,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 999,
                border: `1px solid ${accent}88`,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: 24 + i * 7,
                  height: 24 + i * 7,
                  borderRadius: 999,
                  background: accent,
                  opacity: 0.9 - i * 0.2,
                  display: 'flex',
                }}
              />
            </div>
            <div
              style={{
                width: 190 - i * 34,
                height: 2,
                background: `${accent}66`,
                display: 'flex',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (value === 'diagram_check') {
    return (
      <div
        style={{
          ...panelBase,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 18 + i * 126,
              top: 126 + (i % 2) * 76,
              width: 104,
              height: 104,
              borderRadius: 999,
              border: `2px solid ${accent}${i === 1 ? '99' : '55'}`,
              background: i === 1 ? `${accent}18` : 'rgba(8, 12, 22, 0.58)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent,
              fontSize: 28,
            }}
          >
            {i + 1}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: 104,
            top: 188,
            width: 220,
            height: 2,
            background: `${accent}66`,
            transform: 'rotate(17deg)',
            display: 'flex',
          }}
        />
      </div>
    );
  }

  if (value === 'save_cta') {
    return (
      <div
        style={{
          ...panelBase,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        <div
          style={{
            width: 180,
            height: 240,
            border: `3px solid ${accent}99`,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            display: 'flex',
          }}
        />
        <div
          style={{
            color: accent,
            fontSize: 24,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          Save the chart check
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...panelBase,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        justifyContent: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 84,
            border: `1px solid ${accent}${i === 0 ? '88' : '44'}`,
            background: i === 0 ? `${accent}16` : 'rgba(8, 12, 22, 0.52)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 26,
            gap: 18,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: accent,
              display: 'flex',
              opacity: 1 - i * 0.2,
            }}
          />
          <div
            style={{
              width: 220 - i * 38,
              height: 2,
              background: `${accent}66`,
              display: 'flex',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function visualModeFromText(text: string, subtitle: string) {
  const blob = `${text} ${subtitle}`.toLowerCase();
  if (/\b(house|chart|where it lands|placement|rising)\b/.test(blob))
    return 'chart';
  if (
    /\b(conjunct|square|trine|sextile|opposition|mars|venus|mercury|saturn|jupiter|uranus|neptune|pluto|sun|moon)\b/.test(
      blob,
    )
  )
    return 'aspect';
  if (/\b(check|step|use|find|save|notice|track|compare)\b/.test(blob))
    return 'check';
  return 'insight';
}

function visualModeFromStyle(style: string, text: string, subtitle: string) {
  const value = normaliseVisualStyle(
    style,
    inferVisualStyle('body', subtitle, text),
  );
  if (
    [
      'chart',
      'chart_wheel',
      'chart_check',
      'house_check',
      'placement_map',
    ].includes(value)
  ) {
    return 'chart';
  }
  if (
    [
      'aspect',
      'transit_aspect',
      'transit_receipt',
      'planet_pair',
      'timing_window',
    ].includes(value)
  ) {
    return 'aspect';
  }
  if (
    [
      'checklist',
      'step_check',
      'save_checklist',
      'save_cta',
      'method',
      'how_to',
      'product_bridge',
      'mistake',
      'receipt',
      'compare',
    ].includes(value)
  ) {
    return 'check';
  }
  return visualModeFromText(text, subtitle);
}

function getCTABullets(category: ThemeCategory): string[] {
  const bullets: Record<string, string[]> = {
    zodiac: [
      '100% free \u00B7 No ads',
      '2,000+ articles in the grimoire',
      'Personalised to your birth chart',
    ],
    tarot: [
      'Pull your daily tarot card free',
      '78 card meanings with full guides',
      'No ads \u00B7 No sign-up required',
    ],
    crystals: [
      '100+ crystals with healing guides',
      'Chakra connections & pairings',
      'Free forever \u00B7 No ads',
    ],
    numerology: [
      'Calculate your life path number',
      'Angel number meanings & guides',
      'Free \u00B7 No ads \u00B7 No sign-up',
    ],
    spells: [
      '200+ spells in the grimoire',
      'Step-by-step casting guides',
      'Free forever \u00B7 No ads',
    ],
    runes: [
      'Full Elder Futhark guide',
      'Upright & reversed meanings',
      'Free forever \u00B7 No ads',
    ],
    chakras: [
      '7 chakra healing guides',
      'Affirmations & practices',
      'Free forever \u00B7 No ads',
    ],
    sabbat: [
      'Follow the Wheel of the Year',
      'Rituals & traditions for each sabbat',
      'Free forever \u00B7 No ads',
    ],
  };
  return (
    bullets[category] || [
      '100% free \u00B7 No ads',
      '2,000+ articles in the grimoire',
      'Personalised to your birth chart',
    ]
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Grimoire Guide';
    const slideIndex = parseBoundedInt(searchParams.get('slideIndex'), 0, 19);
    const totalSlides = Math.max(
      1,
      parseBoundedInt(searchParams.get('totalSlides'), 5, 20),
    );
    const content = searchParams.get('content') || '';
    const subtitle = searchParams.get('subtitle') || '';
    const category = (searchParams.get('category') || 'tarot') as ThemeCategory;
    const variant = (searchParams.get('variant') ||
      'body') as CarouselSlideVariant;
    const styleVariant = (searchParams.get('styleVariant') || '').toLowerCase();
    const visualStyle = searchParams.get('visualStyle') || '';
    const slideStyle = searchParams.get('slideStyle') || '';
    const slideRole = searchParams.get('slideRole') || '';
    const symbol = searchParams.get('symbol') || '';
    const nextSubtitle = searchParams.get('nextSubtitle') || '';
    const requestedVisualStyle = normaliseVisualStyle(
      visualStyle || slideStyle || slideRole,
      inferVisualStyle(variant, subtitle, content),
    );
    const styleMeta = VISUAL_STYLE_META[requestedVisualStyle];

    // Reverse map: Astronomicon zodiac glyph → sign name for constellation rendering
    const SYMBOL_TO_SIGN: Record<string, string> = {
      A: 'aries',
      B: 'taurus',
      C: 'gemini',
      D: 'cancer',
      E: 'leo',
      F: 'virgo',
      G: 'libra',
      H: 'scorpio',
      I: 'sagittarius',
      J: 'capricorn',
      K: 'aquarius',
      L: 'pisces',
    };
    const zodiacSign =
      category === 'zodiac'
        ? title.toLowerCase()
        : symbol
          ? SYMBOL_TO_SIGN[symbol]
          : undefined;

    let accent = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.tarot;
    let gradient = CATEGORY_GRADIENT[category] || CATEGORY_GRADIENT.tarot;
    const STYLE_VARIANTS: Record<string, { accent: string; gradient: string }> =
      {
        ledger: {
          accent: '#22D3EE',
          gradient:
            'linear-gradient(135deg, #071826 0%, #102542 48%, #0A0F1F 100%)',
        },
        spotlight: {
          accent: '#FBBF24',
          gradient:
            'linear-gradient(135deg, #111827 0%, #1E1B4B 52%, #0B1020 100%)',
        },
        atlas: {
          accent: '#34D399',
          gradient:
            'linear-gradient(135deg, #062620 0%, #0F2142 50%, #090F1F 100%)',
        },
        axis: {
          accent: '#A78BFA',
          gradient:
            'linear-gradient(135deg, #10172A 0%, #062B32 52%, #0B1020 100%)',
        },
        eclipse: {
          accent: '#E5E7EB',
          gradient:
            'linear-gradient(135deg, #18181B 0%, #33203D 50%, #09090B 100%)',
        },
        zodiac_map: {
          accent: '#C77DFF',
          gradient:
            'linear-gradient(135deg, #251044 0%, #13213F 50%, #090F1F 100%)',
        },
      };
    if (STYLE_VARIANTS[styleVariant]) {
      accent = STYLE_VARIANTS[styleVariant].accent;
      gradient = STYLE_VARIANTS[styleVariant].gradient;
    }
    if (!STYLE_VARIANTS[styleVariant]) {
      accent = styleMeta.accent;
      gradient = styleMeta.gradient;
    }

    // Use sign-specific background and accent for zodiac sign carousels
    if (category === 'zodiac') {
      const signKey = title.toLowerCase();
      if (MEME_BACKGROUNDS[signKey]) gradient = MEME_BACKGROUNDS[signKey];
      if (SIGN_ACCENT[signKey]) accent = SIGN_ACCENT[signKey];
    }
    const lineAccent = accent;
    const editorialGradient =
      styleVariant === 'classic' || styleVariant === 'category'
        ? gradient
        : gradient;
    const { width, height } = IG_SIZES.portrait;

    const fonts = await loadIGFonts(request, {
      includeAstronomicon: true,
      includeRunic: category === 'runes',
    });

    let layoutJsx: React.ReactElement;

    if (variant === 'cover') {
      // Cover slide: dominant hook text hero, badge top-left, strong swipe CTA
      const hookText = content || '';
      layoutJsx = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: editorialGradient,
            paddingTop: 60,
            paddingBottom: 60,
            paddingLeft: 60,
            paddingRight: 60,
            position: 'relative',
            fontFamily: 'Roboto Mono',
            overflow: 'hidden',
          }}
        >
          {renderIGStarfield(`cover-${title}`)}
          {zodiacSign && renderConstellation(zodiacSign, accent, width, height)}
          {editorialFrame(lineAccent, slideIndex, totalSlides)}

          {/* Symbol ghost backdrop — centered */}
          {symbol && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: 1200,
                  color: accent,
                  opacity: 0.1,
                  display: 'flex',
                  lineHeight: 1,
                }}
              >
                {symbol}
              </div>
            </div>
          )}

          {/* Category badge — top-left, out of content flow */}
          <div
            style={{ position: 'absolute', top: 60, left: 60, display: 'flex' }}
          >
            <IGCategoryBadge category={category} />
          </div>

          {hookText ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* HERO: maxWidth + textAlign center */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  maxWidth: 860,
                  fontSize: 80,
                  color: OG_COLORS.textPrimary,
                  lineHeight: 1.15,
                  fontWeight: 800,
                  marginBottom: 36,
                  textAlign: 'center',
                }}
              >
                {truncateIG(hookText, 70)}
              </div>

              {/* Title — secondary, accent colour */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  maxWidth: 700,
                  fontSize: 30,
                  color: accent,
                  lineHeight: 1.3,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                {truncateIG(title, 50)}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* No hook: title is the hero */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  maxWidth: 860,
                  fontSize: IG_TEXT.dark.title,
                  color: OG_COLORS.textPrimary,
                  lineHeight: 1.2,
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                {truncateIG(title, 80)}
              </div>
              {subtitle && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    maxWidth: 800,
                    fontSize: IG_TEXT.dark.subtitle,
                    color: OG_COLORS.textSecondary,
                    lineHeight: 1.4,
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  {truncateIG(subtitle, 100)}
                </div>
              )}
            </div>
          )}

          {/* Swipe indicator — prominent, accent colour */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              position: 'absolute',
              bottom: 100,
            }}
          >
            <span
              style={{
                fontSize: 30,
                color: accent,
                letterSpacing: '0.2em',
                display: 'flex',
                fontWeight: 700,
              }}
            >
              SWIPE
            </span>
            <span
              style={{
                fontSize: 44,
                color: accent,
                display: 'flex',
                fontWeight: 700,
              }}
            >
              {'\u2192'}
            </span>
          </div>

          <IGBrandTag baseUrl={SHARE_BASE_URL} />
        </div>
      );
    } else if (variant === 'cta') {
      // CTA slide: Stronger app promotion (Fix 5)
      const ctaBullets = getCTABullets(category);
      layoutJsx = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: editorialGradient,
            padding: '60px',
            position: 'relative',
            fontFamily: 'Roboto Mono',
          }}
        >
          {renderIGStarfield(`cta-${title}`)}
          {editorialFrame(lineAccent, slideIndex, totalSlides)}

          {/* Progress dots */}
          <div
            style={{
              position: 'absolute',
              top: 48,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <IGProgressDots
              current={slideIndex}
              total={totalSlides}
              accent={accent}
            />
          </div>

          {/* Benefit headline — larger, bolder */}
          <div
            style={{
              fontSize: IG_TEXT.dark.subtitle + 4,
              color: OG_COLORS.textPrimary,
              textAlign: 'center',
              lineHeight: 1.3,
              maxWidth: '85%',
              display: 'flex',
              fontWeight: 600,
              marginBottom: 48,
            }}
          >
            {content || 'Explore your full cosmic profile'}
          </div>

          {/* Feature bullets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              marginBottom: 52,
              maxWidth: '85%',
            }}
          >
            {ctaBullets.map((bullet, i) => (
              <div
                key={i}
                style={{
                  fontSize: 30,
                  color: OG_COLORS.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span style={{ color: accent, display: 'flex', fontSize: 36 }}>
                  {'\u2022'}
                </span>
                <span style={{ display: 'flex' }}>{bullet}</span>
              </div>
            ))}
          </div>

          {/* URL — LARGE in accent colour */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '24px 64px',
              borderRadius: 20,
              background: `${accent}28`,
              border: `2px solid ${accent}60`,
              gap: 12,
              marginBottom: 32,
              boxShadow: `0 0 40px ${accent}30`,
            }}
          >
            <span
              style={{
                fontSize: 44,
                color: accent,
                fontWeight: 700,
                letterSpacing: '0.05em',
                display: 'flex',
              }}
            >
              lunary.app
            </span>
          </div>

          {/* Subtle prompt */}
          <div
            style={{
              fontSize: IG_TEXT.dark.caption,
              color: OG_COLORS.textTertiary,
              display: 'flex',
              letterSpacing: '0.05em',
            }}
          >
            Tap the link in bio
          </div>

          <IGBrandTag baseUrl={SHARE_BASE_URL} />
        </div>
      );
    } else {
      // Body slides: Numbered content — reduced text density (Fix 4)
      // Parse content for structured display (pills, key facts)
      const isStructured = content.includes('\n') || content.includes(', ');
      const contentLines = content.split('\n').filter(Boolean);
      const isPills =
        subtitle === 'Strengths' ||
        subtitle === 'Keywords' ||
        (isStructured && contentLines.length === 1 && content.includes(', '));
      const isElementSlide = subtitle === 'Element & Ruler';
      const visualMode = visualModeFromStyle(
        requestedVisualStyle,
        content,
        subtitle,
      ) as VisualMode;

      layoutJsx = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: editorialGradient,
            padding: '60px',
            position: 'relative',
            fontFamily: 'Roboto Mono',
            overflow: 'hidden',
          }}
        >
          {renderIGStarfield(`body-${title}-${slideIndex}`)}
          {zodiacSign && renderConstellation(zodiacSign, accent, width, height)}
          {editorialFrame(lineAccent, slideIndex, totalSlides)}

          {/* Symbol ghost backdrop — centered */}
          {symbol && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: 1100,
                  color: accent,
                  opacity: 0.08,
                  display: 'flex',
                  lineHeight: 1,
                }}
              >
                {symbol}
              </div>
            </div>
          )}
          {visualPanel(
            lineAccent,
            requestedVisualStyle,
            visualMode,
            subtitle || title,
          )}

          {/* Top bar: title + progress dots */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              marginTop: 120,
              marginBottom: 42,
              maxWidth: styleMeta.textMaxWidth,
            }}
          >
            <div
              style={{
                fontSize: IG_TEXT.dark.caption,
                color: accent,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {truncateIG(title, 50)}
            </div>

            <IGProgressDots
              current={slideIndex}
              total={totalSlides}
              accent={accent}
            />
          </div>

          {/* Subtitle / section label — larger */}
          {subtitle && (
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle + 8,
                color: LUNARY_CREAM,
                lineHeight: 1.3,
                marginBottom: 32,
                display: 'flex',
                fontWeight: 700,
                maxWidth: styleMeta.textMaxWidth,
              }}
            >
              {truncateIG(subtitle, 80)}
            </div>
          )}

          {/* Content — structured display based on slide type */}
          {/* paddingBottom shifts content above true centre for better optical weight */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              gap: 20,
              paddingBottom: '80px',
              maxWidth: styleMeta.textMaxWidth,
            }}
          >
            {isPills ? (
              /* Keyword cards layout — rounded squares matching app design */
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 20,
                }}
              >
                {content
                  .split(', ')
                  .slice(0, 6)
                  .map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '20px 28px',
                        borderRadius: 16,
                        background: `${accent}15`,
                        border: `1px solid ${accent}35`,
                        display: 'flex',
                      }}
                    >
                      <span
                        style={{
                          fontSize: IG_TEXT.dark.body,
                          color: accent,
                          fontWeight: 500,
                          display: 'flex',
                        }}
                      >
                        {item.trim()}
                      </span>
                    </div>
                  ))}
              </div>
            ) : isElementSlide ? (
              /* Element & Ruler: visual layout, not paragraph */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                }}
              >
                {contentLines.map((line, i) => {
                  const [label, value] = line.split(': ').map((s) => s.trim());
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: IG_TEXT.dark.caption,
                          color: OG_COLORS.textTertiary,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          display: 'flex',
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: IG_TEXT.dark.subtitle + 4,
                          color: accent,
                          fontWeight: 600,
                          display: 'flex',
                        }}
                      >
                        {value || label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : contentLines.length > 1 ? (
              /* Multi-line: label + body blocks with clear separation */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 36,
                }}
              >
                {contentLines.slice(0, 3).map((line, i) => {
                  const colonIdx = line.indexOf(': ');
                  const label = colonIdx !== -1 ? line.slice(0, colonIdx) : '';
                  const value =
                    colonIdx !== -1 ? line.slice(colonIdx + 2) : line;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {label ? (
                        <div
                          style={{
                            fontSize: IG_TEXT.dark.body,
                            color: accent,
                            fontWeight: 700,
                            display: 'flex',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {label}
                        </div>
                      ) : null}
                      <div
                        style={{
                          fontSize: IG_TEXT.dark.body - 2,
                          color: '#E6D6BA',
                          lineHeight: 1.6,
                          display: 'flex',
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single paragraph: show key fact large, rest smaller */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <div
                  style={{
                    fontSize: IG_TEXT.dark.body + 2,
                    color: '#E6D6BA',
                    lineHeight: 1.5,
                    display: 'flex',
                    fontWeight: 500,
                  }}
                >
                  {content}
                </div>
              </div>
            )}
          </div>

          {/* "Next up" teaser — keeps viewers swiping */}
          {nextSubtitle && (
            <div
              style={{
                position: 'absolute',
                bottom: 68,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: '70%',
                  height: 1,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: IG_TEXT.dark.caption,
                    color: OG_COLORS.textTertiary,
                    letterSpacing: '0.08em',
                    display: 'flex',
                  }}
                >
                  NEXT:
                </span>
                <span
                  style={{
                    fontSize: IG_TEXT.dark.caption,
                    color: accent,
                    fontWeight: 600,
                    display: 'flex',
                  }}
                >
                  {truncateIG(nextSubtitle, 40)}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    color: accent,
                    display: 'flex',
                  }}
                >
                  {'\u2192'}
                </span>
              </div>
            </div>
          )}

          <IGBrandTag baseUrl={SHARE_BASE_URL} bottom={32} />
        </div>
      );
    }

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
      headers: {
        'Cache-Control':
          'public, s-maxage=604800, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=604800',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[IG Carousel] Error:', error);
    return new Response('Failed to generate carousel image', { status: 500 });
  }
}
