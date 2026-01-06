import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import {
  loadAstronomiconFont,
  loadGoogleFont,
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  checkSeasonalEvents,
  calculateRealAspects,
  getZodiacSymbol,
} from '../../../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs'; // Node.js runtime is faster for CPU-intensive calculations
export const revalidate = 86400; // Cache for 24 hours - cosmic data for a specific date doesn't change

type Ctx = { params: Promise<{ date: string; size: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { date, size } = await ctx.params;
  const normalizedSize = size === 'story' ? 'story' : size;
  const fontData = await loadAstronomiconFont(req);
  if (!fontData) throw new Error('Font load returned null');

  const targetDate = new Date(`${date}T12:00:00Z`);

  // Define image dimensions and responsive styles
  const sizes = {
    square: { width: 1200, height: 1200, padding: '60px 40px' },
    portrait: { width: 1080, height: 1920, padding: '80px 60px' },
    landscape: { width: 1920, height: 1080, padding: '40px 80px' },
    story: { width: 1080, height: 1920, padding: '100px 80px' },
  };

  // const currentSize = sizes[sizeParam as keyof typeof sizes] || sizes.square;

  // Responsive typography and spacing
  const responsive = {
    square: {
      titleSize: 32,
      planetNameSize: 42,
      symbolSize: 222,
      aspectSize: 42,
      constellationSize: 28,
      zodiacSymbolSize: 72,
      energySize: 36,
      dateSize: 28,
      footerSize: 28,
      titlePadding: '100px',
      itemSpacing: '200px',
    },
    portrait: {
      titleSize: 48,
      planetNameSize: 52,
      symbolSize: 280,
      aspectSize: 52,
      constellationSize: 36,
      zodiacSymbolSize: 88,
      energySize: 44,
      dateSize: 36,
      footerSize: 36,
      titlePadding: '120px',
      itemSpacing: '160px',
    },
    landscape: {
      titleSize: 36,
      planetNameSize: 52,
      symbolSize: 250,
      aspectSize: 36,
      constellationSize: 48,
      zodiacSymbolSize: 80,
      energySize: 52,
      dateSize: 50,
      footerSize: 36,
      titlePadding: '60px',
      itemSpacing: '120px',
    },
    story: {
      titleSize: 48,
      planetNameSize: 52,
      symbolSize: 280,
      aspectSize: 52,
      constellationSize: 36,
      zodiacSymbolSize: 88,
      energySize: 44,
      dateSize: 36,
      footerSize: 36,
      titlePadding: '120px',
      itemSpacing: '160px',
    },
  };

  const style =
    responsive[normalizedSize as keyof typeof responsive] || responsive.square;
  const imageSize = sizes[normalizedSize as keyof typeof sizes] || sizes.square;
  const titleMaxWidth =
    normalizedSize === 'story'
      ? '78%'
      : normalizedSize === 'portrait'
        ? '82%'
        : normalizedSize === 'square'
          ? '88%'
          : '92%';
  const titleLetterSpacing = normalizedSize === 'story' ? '0.06em' : '0.1em';
  const titlePaddingX =
    normalizedSize === 'story'
      ? '0 50px'
      : normalizedSize === 'portrait'
        ? '0 40px'
        : '0 20px';

  // Get REAL astronomical data (SAME AS POST ROUTE)
  const positions = getRealPlanetaryPositions(targetDate);
  const moonPhase = getAccurateMoonPhase(targetDate);
  const seasonalEvents = checkSeasonalEvents(positions);
  const aspects = calculateRealAspects(positions);

  // Determine primary event using SAME PRIORITY as post route
  let allEvents: Array<any> = [];

  // 1. MOON PHASES (Priority 10)
  if (moonPhase.isSignificant) {
    allEvents.push({
      name: moonPhase.name,
      energy: moonPhase.energy,
      priority: 10,
      type: 'moon',
      emoji: moonPhase.emoji,
    });
  }

  // 2. EXTRAORDINARY PLANETARY EVENTS (Priority 9)
  const extraordinaryAspects = aspects.filter((a: any) => a.priority >= 9);
  allEvents.push(...extraordinaryAspects);

  // 3. DAILY ASPECTS (Priority 5-7)
  const dailyAspects = aspects.filter((a: any) => a.priority < 9);
  allEvents.push(...dailyAspects);

  // 4. SEASONAL EVENTS (Priority 8)
  allEvents.push(...seasonalEvents);

  // 5. Cosmic flow fallback
  if (allEvents.length === 0) {
    allEvents.push({
      name: 'Cosmic Flow',
      energy: 'Universal Harmony',
      priority: 1,
      type: 'general',
    });
  }

  // Sort by priority
  allEvents.sort((a, b) => b.priority - a.priority);

  // CYCLING LOGIC: Always prioritize moon phases and equinoxes, but cycle through other events
  let primaryEvent;

  // Check for highest priority events (moon phases, equinoxes) - ALWAYS show these
  const highPriorityEvents = allEvents.filter((e) => e.priority >= 10);
  if (highPriorityEvents.length > 0) {
    primaryEvent = highPriorityEvents[0];
  } else {
    // For lower priority events, cycle through them for variety
    const dayOfYear = Math.floor(
      (targetDate.getTime() -
        new Date(targetDate.getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const availableEvents =
      allEvents.length > 0
        ? allEvents
        : [
            {
              name: 'Cosmic Flow',
              energy: 'Universal Harmony',
              priority: 1,
              type: 'general',
            },
          ];

    // Use day of year + hour to cycle through available events for more variety
    const hour = targetDate.getHours();
    const cycleIndex = (dayOfYear + hour) % availableEvents.length;
    primaryEvent = availableEvents[cycleIndex];
  }

  // Get dynamic visual theme
  const daysSinceEpoch = Math.floor(
    targetDate.getTime() / (1000 * 60 * 60 * 24),
  );
  const dayVariation = daysSinceEpoch % 5;
  const themes = [
    {
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
      accent: '#b19cd9',
    },
    {
      background: 'linear-gradient(135deg, #1a1a1a, #2d3561)',
      accent: '#87ceeb',
    },
    {
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
      accent: '#dda0dd',
    },
    {
      background: 'linear-gradient(135deg, #1e2a3a, #2c3e50)',
      accent: '#87cefa',
    },
    {
      background: 'linear-gradient(135deg, #1a1a1a, #1f1f1f)',
      accent: '#f0a0a0',
    },
  ];

  const theme = {
    ...themes[dayVariation],
    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
  };

  // Format date for display
  const formattedDate = targetDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  // Check event types for layout
  const isAspectEvent =
    primaryEvent.planetA && primaryEvent.planetB && primaryEvent.aspect;
  const isAstronomicalEvent =
    !isAspectEvent &&
    primaryEvent.emoji &&
    primaryEvent.description &&
    !primaryEvent.name.includes('Moon');
  const isMoonPhaseEvent = !isAspectEvent && primaryEvent.name.includes('Moon');

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme.background,
        fontFamily: 'Roboto Mono',
        color: 'white',
        padding: imageSize.padding,
        justifyContent: 'space-between',
      }}
    >
      {/* Event Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '40px',
          paddingTop: style.titlePadding,
        }}
      >
        <div
          style={{
            fontSize: `${style.titleSize}px`,
            fontWeight: '400',
            color: 'white',
            textAlign: 'center',
            letterSpacing: titleLetterSpacing,
            fontFamily: 'Roboto Mono',
            display: 'flex',
            maxWidth: titleMaxWidth,
            padding: titlePaddingX,
            lineHeight: '1.2',
            justifyContent: 'center',
          }}
        >
          {primaryEvent.name}
        </div>
      </div>

      {isAspectEvent ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'stretch',
            width: '100%',
            flex: 1,
            padding: '0 200px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: style.itemSpacing,
              width: '100%',
              height: '90%',
            }}
          >
            {/* Planet A Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: `${style.planetNameSize}px`,
                  fontWeight: '300',
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: '50px',
                  display: 'flex',
                }}
              >
                {(primaryEvent as any).planetA.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '180px',
                  height: '180px',
                  borderRadius: '20px',
                  marginBottom: '70px',
                }}
              >
                <div
                  style={{
                    fontSize: `${style.symbolSize}px`,
                    color: 'white',
                    lineHeight: '1',
                    fontFamily: 'Astronomicon',
                  }}
                >
                  {(primaryEvent as any).planetA.symbol}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: `${style.constellationSize}px`,
                    fontWeight: '300',
                    color: 'white',
                    fontFamily: 'Roboto Mono',
                    paddingBottom: '10px',
                  }}
                >
                  {(primaryEvent as any).planetA.constellation}
                </div>
                <div
                  style={{
                    fontSize: `${style.zodiacSymbolSize}px`,
                    color: 'white',
                    fontFamily: 'Astronomicon',
                  }}
                >
                  {(primaryEvent as any).planetA.constellationSymbol}
                </div>
              </div>
            </div>

            {/* Aspect Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around',
                flex: 1,
                height: '400px',
                marginTop: '-78px',
              }}
            >
              {normalizedSize !== 'story' && (
                <div
                  style={{
                    fontSize: `${style.aspectSize}px`,
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    fontFamily: 'Roboto Mono',
                  }}
                >
                  {(primaryEvent as any).aspect?.replace('-', ' ') ||
                    'Conjunction'}
                </div>
              )}
              <div
                style={{
                  fontSize: `${style.symbolSize}px`,
                  color: 'white',
                  lineHeight: '1',
                  width: '180px',
                  height: '180px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Astronomicon',
                  marginBottom: '150px',
                  marginTop: '75px',
                }}
              >
                {(primaryEvent as any).glyph || '!'}
              </div>
            </div>

            {/* Planet B Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: `${style.planetNameSize}px`,
                  fontWeight: '300',
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: '50px',
                }}
              >
                {(primaryEvent as any).planetB.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '180px',
                  height: '180px',
                  borderRadius: '20px',
                  marginBottom: '70px',
                }}
              >
                <div
                  style={{
                    fontSize: `${style.symbolSize}px`,
                    color: 'white',
                    lineHeight: '1',
                    fontFamily: 'Astronomicon',
                  }}
                >
                  {(primaryEvent as any).planetB.symbol}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: `${style.constellationSize}px`,
                    fontWeight: '300',
                    color: 'white',
                    fontFamily: 'Roboto Mono',
                    paddingBottom: '10px',
                  }}
                >
                  {(primaryEvent as any).planetB.constellation}
                </div>
                <div
                  style={{
                    fontSize: `${style.zodiacSymbolSize}px`,
                    color: 'white',
                    fontFamily: 'Astronomicon',
                  }}
                >
                  {(primaryEvent as any).planetB.constellationSymbol}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isAstronomicalEvent ? (
        // Seasonal Event Layout
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '80px',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <div style={{ fontSize: '200px', color: 'white', lineHeight: '1' }}>
            {primaryEvent.emoji}
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: '300',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Roboto Mono',
              maxWidth: '800px',
              lineHeight: '1.2',
            }}
          >
            {primaryEvent.energy}
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '300',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Roboto Mono',
              maxWidth: '900px',
              lineHeight: '1.3',
              opacity: '0.9',
            }}
          >
            {primaryEvent.description}
          </div>
        </div>
      ) : isMoonPhaseEvent ? (
        // Moon Phase Layout with Constellation
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '60px',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '200px',
              color: 'white',
              lineHeight: '1',
            }}
          >
            {moonPhase.emoji || primaryEvent.emoji}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '36px',
              fontWeight: '300',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Roboto Mono',
              maxWidth: '800px',
              lineHeight: '1.2',
            }}
          >
            {primaryEvent.energy}
          </div>
          {/* Moon Constellation Display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                color: 'white',
                fontFamily: 'Astronomicon',
                lineHeight: '1',
              }}
            >
              {getZodiacSymbol(positions.Moon.sign)}
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: '300',
                color: 'white',
                fontFamily: 'Roboto Mono',
                textAlign: 'center',
                display: 'flex',
              }}
            >
              {positions.Moon.sign}
            </div>
          </div>
        </div>
      ) : (
        // Fallback Layout - Cosmic Flow
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '80px',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '200px',
              color: 'white',
              lineHeight: '1',
              fontFamily: 'Astronomicon',
            }}
          >
            R
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: `${style.energySize}px`,
              fontWeight: '300',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Roboto Mono',
            }}
          >
            {primaryEvent.energy || 'Universal Harmony'}
          </div>
        </div>
      )}

      {/* Date */}
      <div
        style={{
          fontSize: `${style.dateSize}px`,
          fontWeight: '300',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'Roboto Mono',
          marginBottom: '20px',
        }}
      >
        {formattedDate}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: `${style.footerSize}px`,
          fontWeight: '300',
          color: 'white',
          letterSpacing: '1px',
          marginBottom: '40px',
        }}
      >
        lunary.app
      </div>
    </div>,
    {
      width: imageSize.width,
      height: imageSize.height,
      fonts: await (async () => {
        const fonts = [];

        try {
          const astronomiconFont = await loadAstronomiconFont(req);
          if (astronomiconFont) {
            fonts.push({
              name: 'Astronomicon',
              data: astronomiconFont,
              style: 'normal' as const,
            });
          }
        } catch (error) {
          console.error('Failed to load Astronomicon font:', error);
        }

        try {
          const robotoFont = await loadGoogleFont(req);
          if (robotoFont) {
            fonts.push({
              name: 'Roboto Mono',
              data: robotoFont,
              style: 'normal' as const,
            });
          }
        } catch (error) {
          console.error('Failed to load Roboto Mono font:', error);
        }

        return fonts;
      })(),
    },
  );
}
