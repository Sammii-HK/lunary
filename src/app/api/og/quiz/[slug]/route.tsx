import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  generateStarfield,
  getStarCount,
  OG_COLORS,
} from '@/lib/share/og-utils';
import {
  loadShareFonts,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
} from '@/lib/share/og-share-utils';

export const runtime = 'edge';

// --- Format handling ---------------------------------------------------------
// Pinterest is the only "portrait poster" variant we want for the quiz share
// card, alongside the default story format. Restricting to an explicit
// allow-list avoids any user-controlled URL construction (CodeQL js/log-injection).

type QuizShareFormat = 'story' | 'pinterest';

const QUIZ_FORMAT_SIZES: Record<
  QuizShareFormat,
  { width: number; height: number }
> = {
  story: { width: 1080, height: 1920 },
  pinterest: { width: 1000, height: 1500 },
};

const DEFAULT_FORMAT: QuizShareFormat = 'story';

const ALLOWED_FORMATS = new Set<QuizShareFormat>(['story', 'pinterest']);

function parseFormat(value: string | null): QuizShareFormat {
  if (!value) return DEFAULT_FORMAT;
  const lower = value.toLowerCase();
  return ALLOWED_FORMATS.has(lower as QuizShareFormat)
    ? (lower as QuizShareFormat)
    : DEFAULT_FORMAT;
}

// --- Proof chip parsing ------------------------------------------------------
// The quiz result's shareCard.subtitle is a middot-delimited string, e.g.
// "Scorpio Rising · 1st house · domicile · rules itself · angular".
// We split on the actual middot and fall back to middle-dot-like chars.

function parseChips(subtitle: string): string[] {
  return subtitle
    .split(/\s*[·•]\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, 6); // cap to keep the card clean at small formats
}

// --- Slug validation ---------------------------------------------------------
// We only use the slug to seed the deterministic starfield. Strip anything that
// isn't a safe slug character before seeding / logging.

function sanitizeSlug(raw: string): string {
  return raw.replace(/[^a-z0-9-]/gi, '').slice(0, 64) || 'quiz';
}

// --- Size presets ------------------------------------------------------------

interface QuizSizes {
  padding: number;
  eyebrowSize: number;
  labelSize: number;
  taglineSize: number;
  chipSize: number;
  chipPadding: string;
  chipGap: number;
  wordmarkSize: number;
  heroMaxWidth: number;
  taglineMaxWidth: number;
}

function getQuizSizes(format: QuizShareFormat): QuizSizes {
  if (format === 'story') {
    return {
      padding: 88,
      eyebrowSize: 26,
      labelSize: 116,
      taglineSize: 34,
      chipSize: 22,
      chipPadding: '12px 22px',
      chipGap: 12,
      wordmarkSize: 24,
      heroMaxWidth: 880,
      taglineMaxWidth: 780,
    };
  }
  // pinterest (1000x1500), slightly smaller hero, tighter layout
  return {
    padding: 72,
    eyebrowSize: 22,
    labelSize: 96,
    taglineSize: 30,
    chipSize: 20,
    chipPadding: '10px 18px',
    chipGap: 10,
    wordmarkSize: 22,
    heroMaxWidth: 820,
    taglineMaxWidth: 720,
  };
}

// --- Route handler -----------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug: rawSlug } = await params;
    const safeSlug = sanitizeSlug(rawSlug);

    const { searchParams } = new URL(request.url);
    const format = parseFormat(searchParams.get('format'));
    const { width, height } = QUIZ_FORMAT_SIZES[format];

    // TODO(quiz): when the quiz engine is wired, support ?chartKey=... by
    // re-computing the QuizResult server-side via the engine registered for
    // this slug (see src/lib/quiz/engines/*). For MVP the caller supplies
    // label/subtitle/tagline directly.
    const chartKey = searchParams.get('chartKey');
    if (chartKey) {
      // Intentionally no-op for now. Query-param branch below is the MVP path.
    }

    const label = searchParams.get('label')?.trim() || 'Your Cosmic Archetype';
    const subtitle = searchParams.get('subtitle')?.trim() || '';
    const tagline = searchParams.get('tagline')?.trim() || '';
    const eyebrow =
      searchParams.get('eyebrow')?.trim() || 'Beyond Your Sun Sign';

    const chips = parseChips(subtitle);
    const sizes = getQuizSizes(format);

    // Deterministic starfield seeded by slug + label so re-renders are stable
    const starSeed = `quiz-${safeSlug}-${label.slice(0, 24)}`;
    const stars = generateStarfield(
      starSeed,
      getStarCount(format === 'pinterest' ? 'square' : 'story'),
    );

    // Lunary brand colours, pulled from existing OG templates for consistency
    const BRAND_PRIMARY = '#8458D8'; // lunary-primary (Nebula Violet)
    const BRAND_ACCENT = '#C77DFF'; // Galaxy Haze
    const BRAND_SOFT = '#A78BFA'; // Soft violet (also used in SHARE_TITLE_GLOW)

    // Dark cosmic gradient matching social-quote / share templates
    const background =
      'linear-gradient(160deg, #2a1650 0%, #1a0e3a 45%, #0d0820 100%)';

    const fonts = await loadShareFonts(request);

    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background,
          padding: `${sizes.padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
          overflow: 'hidden',
        }}
      >
        {/* Starfield */}
        {stars.map((star, i) => (
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
              opacity: star.opacity,
            }}
          />
        ))}

        {/* Soft primary glow, top-left */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            left: -180,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND_PRIMARY}55 0%, ${BRAND_PRIMARY}00 70%)`,
            display: 'flex',
          }}
        />
        {/* Soft accent glow, bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND_ACCENT}40 0%, ${BRAND_ACCENT}00 70%)`,
            display: 'flex',
          }}
        />

        {/* Content column, eyebrow pinned top, archetype centred, chips + tagline below, wordmark bottom */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: sizes.eyebrowSize,
                color: BRAND_SOFT,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                display: 'flex',
                opacity: 0.9,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                width: 64,
                height: 1,
                background: `${BRAND_SOFT}80`,
                display: 'flex',
              }}
            />
          </div>

          {/* Hero: archetype label */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 40,
              maxWidth: sizes.heroMaxWidth,
            }}
          >
            <div
              style={{
                fontSize: sizes.labelSize,
                fontWeight: 400,
                lineHeight: 1.05,
                color: OG_COLORS.textPrimary,
                letterSpacing: '0.01em',
                textAlign: 'center',
                display: 'flex',
                textShadow: SHARE_TITLE_GLOW,
              }}
            >
              {label}
            </div>

            {tagline && (
              <div
                style={{
                  fontSize: sizes.taglineSize,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: OG_COLORS.textSecondary,
                  textAlign: 'center',
                  display: 'flex',
                  maxWidth: sizes.taglineMaxWidth,
                }}
              >
                {tagline}
              </div>
            )}
          </div>

          {/* Chips + wordmark */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 40,
              width: '100%',
            }}
          >
            {chips.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: sizes.chipGap,
                  maxWidth: sizes.heroMaxWidth,
                }}
              >
                {chips.map((chip) => (
                  <div
                    key={chip}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: sizes.chipPadding,
                      fontSize: sizes.chipSize,
                      color: OG_COLORS.textPrimary,
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${BRAND_SOFT}40`,
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {chip}
                  </div>
                ))}
              </div>
            )}

            {/* Wordmark, small, bottom-centre */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: BRAND_ACCENT,
                  display: 'flex',
                  boxShadow: `0 0 12px ${BRAND_ACCENT}`,
                }}
              />
              <div
                style={{
                  fontSize: sizes.wordmarkSize,
                  color: OG_COLORS.textSecondary,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                lunary
              </div>
            </div>
          </div>
        </div>
      </div>,
      { width, height, fonts },
    );
  } catch (error) {
    // Avoid logging user-controlled params (CodeQL js/log-injection).
    console.error('[QuizOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
