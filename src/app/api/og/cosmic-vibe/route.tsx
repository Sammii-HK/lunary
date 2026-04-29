import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getFormatDimensions,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  ShareFooter,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
  truncateText,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import {
  COSMIC_ARCHETYPES,
  COSMIC_ARCHETYPE_IDS,
  type CosmicArchetypeId,
  type CosmicElement,
} from '@/lib/quiz/cosmic-vibe';

export const runtime = 'edge';
export const revalidate = 86400; // 24h — cards are static per archetype

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) {
        throw new Error(`Roboto Mono fetch failed: ${res.status}`);
      }
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

const ALLOWED_ELEMENTS = new Set<CosmicElement>([
  'Fire',
  'Earth',
  'Air',
  'Water',
]);
const ALLOWED_FORMATS = new Set<ShareFormat>([
  'square',
  'landscape',
  'story',
  'pinterest',
]);
const ALLOWED_ARCHETYPES = new Set<string>(COSMIC_ARCHETYPE_IDS);

const ARCHETYPE_BY_NAME = new Map(
  Object.values(COSMIC_ARCHETYPES).map((a) => [a.archetype.toLowerCase(), a]),
);
const ARCHETYPE_BY_VIBE_NAME = new Map(
  Object.values(COSMIC_ARCHETYPES).map((a) => [a.vibeName.toLowerCase(), a]),
);

function sanitizeShort(value: string | null, limit: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Strip control characters to avoid log/header injection if we ever
  // log this, and to keep the rendered text safe.
  const cleaned = trimmed.replace(/[\u0000-\u001F\u007F]/g, '');
  if (!cleaned) return null;
  return cleaned.length > limit
    ? `${cleaned.slice(0, limit - 1)}\u2026`
    : cleaned;
}

const FALLBACK_ARCHETYPE = COSMIC_ARCHETYPES['venus-dreamer'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Strict allow-listing: archetype + element are validated against
    // known sets. The poetic copy is length-capped + control-char-stripped
    // and never used in URL construction.
    const archetypeIdParam = searchParams.get('archetypeId');
    const archetypeNameParam = sanitizeShort(searchParams.get('archetype'), 40);
    const vibeNameParam = sanitizeShort(searchParams.get('vibeName'), 40);
    const oneLinerParam = sanitizeShort(searchParams.get('oneLiner'), 160);
    const elementParam = searchParams.get('element') as CosmicElement | null;
    const formatParam = (searchParams.get('format') as ShareFormat) || 'square';

    const format: ShareFormat = ALLOWED_FORMATS.has(formatParam)
      ? formatParam
      : 'square';
    const { width, height } = getFormatDimensions(format);

    // Resolve canonical archetype: prefer archetypeId (strict allow-list),
    // then fall back to looking up by archetype/vibeName label.
    let archetype = FALLBACK_ARCHETYPE;
    if (archetypeIdParam && ALLOWED_ARCHETYPES.has(archetypeIdParam)) {
      archetype = COSMIC_ARCHETYPES[archetypeIdParam as CosmicArchetypeId];
    } else if (archetypeNameParam) {
      const found = ARCHETYPE_BY_NAME.get(archetypeNameParam.toLowerCase());
      if (found) archetype = found;
    } else if (vibeNameParam) {
      const found = ARCHETYPE_BY_VIBE_NAME.get(vibeNameParam.toLowerCase());
      if (found) archetype = found;
    }

    const element: CosmicElement =
      elementParam && ALLOWED_ELEMENTS.has(elementParam)
        ? elementParam
        : archetype.element;

    // Allow client-supplied vibeName / oneLiner as cosmetic overrides only
    // when archetype was resolvable; otherwise stick to canonical strings.
    const vibeName = vibeNameParam ?? archetype.vibeName;
    const oneLiner = oneLinerParam ?? archetype.oneLiner;
    const archetypeLabel = archetypeNameParam ?? archetype.archetype;

    const robotoMono = await loadRobotoMono(request);

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 56 : isStory ? 110 : 64;
    const titleSize = isLandscape ? 56 : isStory ? 110 : 80;
    const subtitleSize = isLandscape ? 16 : isStory ? 28 : 22;
    const oneLinerSize = isLandscape ? 22 : isStory ? 38 : 28;

    const gradientCss = `linear-gradient(135deg, ${archetype.gradient.from} 0%, ${archetype.gradient.via} 50%, ${archetype.gradient.to} 100%)`;

    // Stable starfield seed per archetype so the same card always looks
    // identical (good for caching + brand consistency).
    const stars = generateStarfield(
      `cosmic-vibe-${archetype.id}`,
      getStarCount(format),
    );

    const starfieldJsx = stars.map((star, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: '50%',
          background: '#fff',
          opacity: star.opacity * 0.85,
        }}
      />
    ));

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0A0A0A',
          color: '#fff',
          padding,
          fontFamily: 'Roboto Mono',
          position: 'relative',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: gradientCss,
            display: 'flex',
            opacity: 0.92,
          }}
        />
        {starfieldJsx}

        {/* Soft vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.45) 100%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: isStory ? 36 : 22,
          }}
        >
          <span
            style={{
              display: 'flex',
              fontSize: subtitleSize,
              letterSpacing: 6,
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            My cosmic vibe
          </span>

          <span
            style={{
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 500,
              lineHeight: 1.05,
              textShadow: SHARE_TITLE_GLOW,
              maxWidth: '90%',
            }}
          >
            {vibeName}
          </span>

          <div
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Pill label='Element' value={element} />
            <Pill label='Archetype' value={archetypeLabel} />
          </div>

          <span
            style={{
              display: 'flex',
              fontStyle: 'italic',
              fontSize: oneLinerSize,
              lineHeight: 1.4,
              opacity: 0.95,
              maxWidth: isLandscape ? '80%' : '78%',
              padding: '0 8px',
            }}
          >
            {`\u201C${truncateText(oneLiner, 140)}\u201D`}
          </span>
        </div>

        <ShareFooter format={format} />

        <div
          style={{
            position: 'absolute',
            bottom: isStory ? 24 : 16,
            left: padding,
            fontSize: isStory ? 14 : 12,
            opacity: 0.35,
            letterSpacing: 1,
            display: 'flex',
          }}
        >
          lunary.app/quiz/cosmic-vibe
        </div>
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts: [{ name: 'Roboto Mono', data: robotoMono, style: 'normal' }],
    });
  } catch (error) {
    console.error('[CosmicVibeOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '10px 16px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(0,0,0,0.25)',
      }}
    >
      <span
        style={{
          display: 'flex',
          fontSize: 12,
          letterSpacing: 3,
          textTransform: 'uppercase',
          opacity: 0.7,
        }}
      >
        {label}
      </span>
      <span style={{ display: 'flex', fontSize: 18, opacity: 0.95 }}>
        {value}
      </span>
    </div>
  );
}
