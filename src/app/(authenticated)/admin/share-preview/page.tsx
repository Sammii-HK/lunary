'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { useUser } from '@/context/UserContext';

type ShareFormat = 'square' | 'landscape' | 'story';

interface PreviewCardProps {
  title: string;
  url: string;
  format: ShareFormat;
  onRefresh: () => void;
}

function PreviewCard({ title, url, format, onRefresh }: PreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const dimensions = {
    square: { width: 1080, height: 1080 },
    landscape: { width: 1200, height: 630 },
    story: { width: 1080, height: 1920 },
  }[format];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setImageKey((prev) => prev + 1);
    setImageError(false);
    setImageLoading(true);
    onRefresh();
  };

  return (
    <div className='border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50'>
      <div className='p-4 border-b border-zinc-800 flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-lg font-medium text-zinc-100'>{title}</h3>
          <p className='text-xs text-zinc-500 mt-1'>
            {dimensions.width} × {dimensions.height}px
          </p>
          {imageError && (
            <p className='text-xs text-red-400 mt-1'>Failed to load image</p>
          )}
        </div>
        <div className='flex gap-2'>
          <button
            onClick={handleRefresh}
            className='p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors'
            title='Refresh image'
          >
            <RefreshCw className='w-4 h-4' />
          </button>
          <button
            onClick={handleCopy}
            className='relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors'
            title='Copy URL'
          >
            <Copy className='w-4 h-4' />
            {copied && (
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded whitespace-nowrap'>
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>
      <div className='p-4 bg-zinc-950 flex items-center justify-center min-h-[300px]'>
        {imageLoading && !imageError && (
          <div className='text-zinc-500 text-sm'>Loading image...</div>
        )}
        {imageError ? (
          <div className='text-center'>
            <p className='text-red-400 mb-2'>Failed to load</p>
            <button
              onClick={handleRefresh}
              className='text-xs text-zinc-400 hover:text-zinc-200'
            >
              Try again
            </button>
          </div>
        ) : (
          <div
            className='relative bg-zinc-900 border border-zinc-800'
            style={{
              width: format === 'story' ? '216px' : '100%',
              maxWidth: format === 'landscape' ? '600px' : '540px',
            }}
          >
            <img
              key={imageKey}
              src={url}
              alt={title}
              className='w-full h-auto'
              loading='lazy'
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharePreviewPage() {
  const { user } = useUser();
  const [format, setFormat] = useState<ShareFormat>('square');
  const [refreshKey, setRefreshKey] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's actual data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch horoscope data
        const horoscopeRes = await fetch('/api/horoscope/daily');
        const horoscope = horoscopeRes.ok ? await horoscopeRes.json() : null;

        // Fetch current cosmic data
        const cosmicRes = await fetch('/api/cosmic/current');
        const cosmic = cosmicRes.ok ? await cosmicRes.json() : null;

        setUserData({
          name: user?.name || 'You',
          firstName: user?.name?.split(' ')[0] || 'You',
          profile: user, // Store user as profile for backward compatibility
          horoscope,
          cosmic,
          birthChart: user?.birthChart,
          birthDate: user?.birthday,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleRefreshAll = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Build URLs with real user data
  const buildShares = () => {
    if (!userData) {
      // Fallback to demo data if user data not loaded
      return [
        {
          title: 'Birth Chart',
          url: `/api/og/share/birth-chart?shareId=demo&format=${format}`,
        },
        {
          title: 'Daily Insight',
          url: `/api/og/daily-insight?format=${format}&name=Demo`,
        },
        {
          title: 'Cosmic State',
          url: `/api/og/share/cosmic-state?shareId=demo&format=${format}`,
        },
        {
          title: 'Sky Now',
          url: `/api/og/share/sky-now?shareId=demo&format=${format}`,
        },
        {
          title: 'Weekly Pattern',
          url: `/api/og/share/weekly-pattern?shareId=demo&format=${format}`,
        },
        {
          title: 'Zodiac Season',
          url: `/api/og/share/zodiac-season?shareId=demo&format=${format}`,
        },
        {
          title: 'Retrograde Badge',
          url: `/api/og/share/retrograde-badge?shareId=demo&format=${format}`,
        },
        {
          title: 'Horoscope',
          url: `/api/og/share/horoscope?shareId=demo&format=${format}`,
        },
        {
          title: 'Numerology',
          url: `/api/og/share/numerology?shareId=demo&format=${format}`,
        },
      ];
    }

    const { firstName, profile, horoscope, birthChart, name } = userData;

    // Extract birth chart data
    const sun = birthChart?.find((p: any) => p.body === 'Sun')?.sign || 'Leo';
    const moon =
      birthChart?.find((p: any) => p.body === 'Moon')?.sign || 'Cancer';
    const rising =
      birthChart?.find((p: any) => p.body === 'Ascendant')?.sign || 'Virgo';

    // Calculate element and modality from birth chart
    const signs = birthChart?.map((p: any) => p.sign) || [];
    const elementCounts: Record<string, number> = {
      Fire: 0,
      Earth: 0,
      Air: 0,
      Water: 0,
    };
    const modalityCounts: Record<string, number> = {
      Cardinal: 0,
      Fixed: 0,
      Mutable: 0,
    };

    signs.forEach((sign: string) => {
      const signLower = sign.toLowerCase();
      // Fire signs
      if (['aries', 'leo', 'sagittarius'].includes(signLower))
        elementCounts.Fire++;
      // Earth signs
      else if (['taurus', 'virgo', 'capricorn'].includes(signLower))
        elementCounts.Earth++;
      // Air signs
      else if (['gemini', 'libra', 'aquarius'].includes(signLower))
        elementCounts.Air++;
      // Water signs
      else if (['cancer', 'scorpio', 'pisces'].includes(signLower))
        elementCounts.Water++;

      // Cardinal
      if (['aries', 'cancer', 'libra', 'capricorn'].includes(signLower))
        modalityCounts.Cardinal++;
      // Fixed
      else if (['taurus', 'leo', 'scorpio', 'aquarius'].includes(signLower))
        modalityCounts.Fixed++;
      // Mutable
      else if (['gemini', 'virgo', 'sagittarius', 'pisces'].includes(signLower))
        modalityCounts.Mutable++;
    });

    const dominantElement = Object.entries(elementCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];
    const dominantModality = Object.entries(modalityCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    // Build a more detailed insight for birth chart
    const birthChartInsight =
      birthChart?.length > 0
        ? `${dominantElement} energy dominates with ${dominantModality} expression. Your Sun in ${sun}, Moon in ${moon}, and ${rising} rising create a unique cosmic signature.`
        : 'Your cosmic blueprint reveals unique celestial patterns.';

    // Get sun sign for horoscope
    const sunSign = sun || 'Aquarius';

    // Get cosmic data from fetched API data
    const { cosmic, horoscope: horoscopeData } = userData;

    // Build cosmic state URL with real data
    const cosmicMoonPhase = cosmic?.moonPhase?.name || 'Waning Crescent';
    const cosmicZodiacSeason = cosmic?.zodiacSeason || sunSign;
    const cosmicInsight =
      cosmic?.insight ||
      `Today's cosmic energies align favorably for ${sunSign}.`;
    const cosmicTransitHeadline =
      cosmic?.transit?.headline || 'Venus enters harmonious aspect';
    const cosmicTransitDesc =
      cosmic?.transit?.description || 'A time for connection and creativity.';

    // Build horoscope URL with real data
    const horoscopeHeadline =
      horoscopeData?.headline ||
      `Innovation and connection light your path, ${firstName}`;
    const horoscopeOverview =
      horoscopeData?.overview ||
      `Today brings opportunities for creative breakthroughs. Your unique ${sunSign} perspective is valued.`;
    const personalDayNumber = horoscopeData?.numerologyNumber || 7;

    // Get current zodiac season data
    const currentDate = new Date();
    const zodiacSeasonSign = cosmic?.zodiacSeason || 'Aquarius';
    const zodiacElement = ['Aries', 'Leo', 'Sagittarius'].includes(
      zodiacSeasonSign,
    )
      ? 'Fire'
      : ['Taurus', 'Virgo', 'Capricorn'].includes(zodiacSeasonSign)
        ? 'Earth'
        : ['Gemini', 'Libra', 'Aquarius'].includes(zodiacSeasonSign)
          ? 'Air'
          : 'Water';
    const zodiacModality = ['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(
      zodiacSeasonSign,
    )
      ? 'Cardinal'
      : ['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(zodiacSeasonSign)
        ? 'Fixed'
        : 'Mutable';

    // Build sky now positions from cosmic data
    const skyPositions = cosmic?.planets || {
      Sun: { sign: sunSign, retrograde: false },
      Moon: { sign: moon, retrograde: false },
      Mercury: { sign: 'Capricorn', retrograde: false },
      Venus: { sign: 'Pisces', retrograde: false },
      Mars: { sign: 'Cancer', retrograde: false },
      Jupiter: { sign: 'Gemini', retrograde: false },
      Saturn: { sign: 'Pisces', retrograde: false },
      Uranus: { sign: 'Taurus', retrograde: true },
      Neptune: { sign: 'Pisces', retrograde: false },
      Pluto: { sign: 'Aquarius', retrograde: false },
    };

    // Calculate life path number from birth date
    const { birthDate } = userData;
    let lifePath = 7;
    let soulUrge = 3;
    let expression = 5;
    if (birthDate) {
      const date = new Date(birthDate);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      let sum = day + month + year;
      while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = String(sum)
          .split('')
          .reduce((a, b) => a + parseInt(b), 0);
      }
      lifePath = sum;
      // Simple soul urge from name
      soulUrge = (firstName.length % 9) + 1;
      expression = ((firstName.length + (name?.length || 0)) % 9) + 1;
    }

    return [
      {
        title: 'Birth Chart',
        url: `/api/og/share/birth-chart?format=${format}&name=${encodeURIComponent(firstName)}&sun=${sun}&moon=${moon}&rising=${rising}&element=${dominantElement}&modality=${dominantModality}&insight=${encodeURIComponent(birthChartInsight)}`,
      },
      {
        title: 'Daily Insight',
        url: `/api/og/daily-insight?name=${encodeURIComponent(firstName)}&format=${format}&tarot=The Star&tarotKeywords=hope healing inspiration&crystal=Rose Quartz&crystalReason=Aligns with your ${sun} Sun energy&insight=${encodeURIComponent(`Today brings harmonious energy for ${sun}. Focus on creative expression and trust your intuition.`)}&personalized=true`,
      },
      {
        title: 'Cosmic State',
        url: `/api/og/share/cosmic-state?format=${format}&name=${encodeURIComponent(firstName)}&moonPhase=${encodeURIComponent(cosmicMoonPhase)}&zodiacSeason=${cosmicZodiacSeason}&insight=${encodeURIComponent(cosmicInsight)}&transitHeadline=${encodeURIComponent(cosmicTransitHeadline)}&transitDesc=${encodeURIComponent(cosmicTransitDesc)}`,
      },
      {
        title: 'Sky Now',
        url: `/api/og/share/sky-now?format=${format}&name=${encodeURIComponent(firstName)}&positions=${encodeURIComponent(JSON.stringify(skyPositions))}&date=${currentDate.toISOString().split('T')[0]}`,
      },
      {
        title: 'Weekly Pattern',
        url: `/api/og/share/weekly-pattern?format=${format}&name=${encodeURIComponent(firstName)}&seasonName=${encodeURIComponent('Season of Reflection')}&seasonSuit=Cups&dominantSuit=Cups&dominantPercentage=60&topCards=${encodeURIComponent(
          JSON.stringify([
            { name: 'The Star', count: 3 },
            { name: 'Two of Cups', count: 2 },
            { name: 'Ace of Cups', count: 2 },
          ]),
        )}`,
      },
      {
        title: 'Zodiac Season',
        url: `/api/og/share/zodiac-season?format=${format}&name=${encodeURIComponent(firstName)}&sign=${zodiacSeasonSign}&element=${zodiacElement}&modality=${zodiacModality}&themes=${encodeURIComponent('Innovation,Community,Progress')}`,
      },
      {
        title: 'Retrograde Badge',
        url: `/api/og/share/retrograde-badge?format=${format}&name=${encodeURIComponent(firstName)}&planet=Mercury&badgeLevel=silver&survivalDays=10&isCompleted=false&sign=Aquarius`,
      },
      {
        title: 'Horoscope',
        url: `/api/og/share/horoscope?format=${format}&name=${encodeURIComponent(firstName)}&sunSign=${sunSign}&headline=${encodeURIComponent(horoscopeHeadline)}&overview=${encodeURIComponent(horoscopeOverview)}&numerologyNumber=${personalDayNumber}&date=${currentDate.toISOString().split('T')[0]}`,
      },
      {
        title: 'Numerology',
        url: `/api/og/share/numerology?format=${format}&name=${encodeURIComponent(firstName)}&birthDate=${birthDate || ''}&lifePath=${lifePath}&soulUrge=${soulUrge}&expression=${expression}&lifePathMeaning=${encodeURIComponent('The Seeker - wisdom and introspection')}&soulUrgeMeaning=${encodeURIComponent('The Creative - self-expression and joy')}&expressionMeaning=${encodeURIComponent('The Explorer - freedom and change')}`,
      },
    ];
  };

  const shares = buildShares();

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-light mb-2'>Share OG Image Preview</h1>
          <p className='text-zinc-400'>
            Preview all share images across different formats
          </p>
          {loading && (
            <p className='text-sm text-zinc-500 mt-2'>Loading your data...</p>
          )}
          {userData && (
            <p className='text-sm text-zinc-500 mt-2'>
              Showing previews for: {userData.firstName}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className='mb-8 flex items-center justify-between'>
          <div className='flex gap-2'>
            <button
              onClick={() => setFormat('square')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                format === 'square'
                  ? 'bg-lunary-primary-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Square (1080×1080)
            </button>
            <button
              onClick={() => setFormat('landscape')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                format === 'landscape'
                  ? 'bg-lunary-primary-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Landscape (1200×630)
            </button>
            <button
              onClick={() => setFormat('story')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                format === 'story'
                  ? 'bg-lunary-primary-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Story (1080×1920)
            </button>
          </div>

          <button
            onClick={handleRefreshAll}
            className='flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors'
          >
            <RefreshCw className='w-4 h-4' />
            Refresh All
          </button>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {shares.map((share) => (
            <PreviewCard
              key={`${share.title}-${format}-${refreshKey}`}
              title={share.title}
              url={share.url}
              format={format}
              onRefresh={handleRefreshAll}
            />
          ))}
        </div>

        {/* Footer */}
        <div className='mt-12 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500'>
          <p>
            Admin tool for QA and testing.{' '}
            {userData
              ? 'Showing personalized previews with your data.'
              : 'Images use demo data when not logged in.'}
          </p>
        </div>
      </div>
    </div>
  );
}
