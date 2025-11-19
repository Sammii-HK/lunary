import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  checkSeasonalEvents,
  calculateRealAspects,
  getZodiacSymbol,
  getPlanetSymbol,
  getAspectGlyph,
  loadAstronomiconFont,
  loadGoogleFont,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';
export const revalidate = 3600; // Cache for 1 hour - base OG image updates hourly

// Request deduplication
const pendingRequests = new Map<string, Promise<Response>>();

function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return signs[index];
}

async function generateImage(req: NextRequest): Promise<Response> {
  const fontData = await loadAstronomiconFont(req);
  if (!fontData) throw new Error('Font load returned null');

  const today = new Date();
  const targetDate = new Date(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T12:00:00Z`,
  );

  const style = {
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
  };

  const positions = getRealPlanetaryPositions(targetDate);
  const moonPhase = getAccurateMoonPhase(targetDate);
  const seasonalEvents = checkSeasonalEvents(positions);
  const aspects = calculateRealAspects(positions);

  let allEvents: Array<any> = [];

  if (moonPhase.isSignificant) {
    allEvents.push({
      name: moonPhase.name,
      energy: moonPhase.energy,
      priority: 10,
      type: 'moon',
      emoji: moonPhase.emoji,
    });
  }

  const extraordinaryAspects = aspects.filter((a) => a.priority >= 9);
  allEvents.push(...extraordinaryAspects);

  const dailyAspects = aspects.filter((a) => a.priority < 9);
  allEvents.push(...dailyAspects);

  allEvents.push(...seasonalEvents);

  if (allEvents.length === 0) {
    allEvents.push({
      name: 'Cosmic Flow',
      energy: 'Universal Harmony',
      priority: 1,
      type: 'general',
    });
  }

  allEvents.sort((a, b) => b.priority - a.priority);
  const primaryEvent = allEvents[0];

  const isAspectEvent = primaryEvent.type === 'aspect';
  const sunPosition = positions.Sun;
  const sunZodiac = getZodiacSign(sunPosition.longitude);
  const sunSymbol = getZodiacSymbol(sunPosition.longitude);

  const theme = {
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #312e81 70%, #1e1b2e 100%)',
  };

  return new ImageResponse(
    (
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
          padding: '60px 40px',
          justifyContent: 'space-between',
        }}
      >
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
              letterSpacing: '0.1em',
              fontFamily: 'Roboto Mono',
              display: 'flex',
            }}
          >
            Lunary
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
                  {primaryEvent.planetA.name}
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
                    {primaryEvent.planetA.symbol}
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
                    {primaryEvent.planetA.constellation}
                  </div>
                  <div
                    style={{
                      fontSize: `${style.zodiacSymbolSize}px`,
                      color: 'white',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {primaryEvent.planetA.constellationSymbol}
                  </div>
                </div>
              </div>

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
                <div
                  style={{
                    fontSize: `${style.aspectSize}px`,
                    color: 'white',
                    fontFamily: 'Astronomicon',
                  }}
                >
                  {getAspectGlyph(primaryEvent.aspect)}
                </div>
                <div
                  style={{
                    fontSize: `${style.constellationSize}px`,
                    fontWeight: '300',
                    color: 'white',
                    fontFamily: 'Roboto Mono',
                    textAlign: 'center',
                  }}
                >
                  {primaryEvent.aspect}
                </div>
              </div>

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
                  {primaryEvent.planetB.name}
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
                    {primaryEvent.planetB.symbol}
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
                    {primaryEvent.planetB.constellation}
                  </div>
                  <div
                    style={{
                      fontSize: `${style.zodiacSymbolSize}px`,
                      color: 'white',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {primaryEvent.planetB.constellationSymbol}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              width: '100%',
            }}
          >
            {primaryEvent.emoji && (
              <div
                style={{
                  fontSize: '120px',
                  marginBottom: '40px',
                  display: 'flex',
                }}
              >
                {primaryEvent.emoji}
              </div>
            )}
            <div
              style={{
                fontSize: `${style.energySize}px`,
                fontWeight: '300',
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                marginTop: '40px',
                fontFamily: 'Roboto Mono',
                display: 'flex',
              }}
            >
              {primaryEvent.energy || 'Cosmic Guidance'}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '40px',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: `${style.zodiacSymbolSize}px`,
              color: 'white',
              fontFamily: 'Astronomicon',
            }}
          >
            {sunSymbol}
          </div>
          <div
            style={{
              fontSize: `${style.constellationSize}px`,
              fontWeight: '300',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Roboto Mono',
            }}
          >
            {sunZodiac}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Astronomicon',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}

export async function GET(req: NextRequest): Promise<Response> {
  const cacheKey = 'cosmic-og-base';

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const promise = generateImage(req)
    .then((response) => {
      const headers = new Headers(response.headers);
      headers.set(
        'Cache-Control',
        'public, s-maxage=3600, stale-while-revalidate=1800, max-age=3600',
      );
      headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
      headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=3600');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, promise);
  return promise;
}
