'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { buildCarouselFromSlug } from '@/lib/instagram/carousel-content';
import {
  generateDidYouKnowBatch,
  generateDidYouKnow,
} from '@/lib/instagram/did-you-know-content';
import { generateRankingBatch } from '@/lib/instagram/ranking-content';
import { generateCompatibilityBatch } from '@/lib/instagram/compatibility-content';
import { generateRankingCarousel } from '@/lib/instagram/ranking-content';
import { generateCompatibilityCarousel } from '@/lib/instagram/compatibility-content';
import { generateAngelNumberBatch } from '@/lib/instagram/angel-number-content';
import { generateOneWordBatch } from '@/lib/instagram/one-word-content';
import { generateDailyStoryData } from '@/lib/instagram/story-content';
import {
  generateAffirmation,
  generateRitualTip,
  generateSignOfTheDay,
  generateTransitAlert,
  generateNumerologyStory,
} from '@/lib/instagram/rotating-story-content';
import {
  generateZodiacCaption,
  generateTarotCaption,
  generateCrystalCaption,
  generateCompatibilityCaption,
  generateRankingCaption,
  generateMemeCaption,
  generateAngelNumberCaption,
  generateGenericCaption,
} from '@/lib/instagram/caption-content';
import {
  generateMemeAltText,
  generateCompatibilityAltText,
  generateRankingAltText,
  generateStoryAltText,
  generateCarouselAltText,
  generateAngelNumberAltText,
} from '@/lib/instagram/alt-text';
import type { IGCarouselContent } from '@/lib/instagram/types';
import { sanitizeImageUrl } from '@/utils/url-security';

type Tab =
  | 'memes'
  | 'carousels'
  | 'quotes'
  | 'did_you_know'
  | 'rankings'
  | 'compatibility'
  | 'stories'
  | 'angel_numbers'
  | 'one_word';

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className='px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 transition-colors border border-zinc-600'
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}

const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

const MEME_TEMPLATES = [
  'classic',
  'comparison',
  'callout',
  'hot_take',
] as const;

const SAMPLE_CAROUSEL_SLUGS = [
  'tarot/the-fool',
  'crystals/amethyst',
  'numerology/angel-numbers/111',
  'spells/moon-water',
  'runes/fehu',
  'chakras/heart',
];

const SIGN_MEMES: Record<
  string,
  {
    setup: string;
    punchline: string;
    comparisonTop: string;
    comparisonBottom: string;
    callout: string;
    hotTake: string;
  }
> = {
  aries: {
    setup: 'Aries at 3am:',
    punchline: 'googling "how to start a business" for the 47th time',
    comparisonTop: 'Fearless leader energy',
    comparisonBottom: '"Wait, did I just overshare?"',
    callout: 'Tag the Aries who always hypes you up no matter what',
    hotTake:
      "Hot take: Aries aren't aggressive, they just have zero patience for anyone moving slow",
  },
  taurus: {
    setup: 'Nobody:\nTaurus:',
    punchline: 'third nap of the day with a charcuterie board',
    comparisonTop: 'Completely unbothered',
    comparisonBottom: 'Still thinking about that argument from 2019',
    callout:
      'Send this to the Taurus who knows every good restaurant in a 10-mile radius',
    hotTake:
      "Hot take: Taurus isn't stubborn. Everyone else just gives up too easily.",
  },
  gemini: {
    setup: "POV: You're dating a Gemini",
    punchline: 'three conversations at once and somehow winning all of them',
    comparisonTop: 'Life of the party',
    comparisonBottom: 'Already planning their exit',
    callout: 'Tag the Gemini who can talk to literally anyone about anything',
    hotTake: "Hot take: Gemini isn't two-faced. They just contain multitudes.",
  },
  cancer: {
    setup: 'Cancer energy is',
    punchline: 'ugly crying at a dog food commercial',
    comparisonTop: 'Holding it together',
    comparisonBottom: 'Emotionally spiralling over a song lyric',
    callout: 'Send this to the Cancer who always checks in on you first',
    hotTake:
      'Hot take: Cancer is misunderstood because they feel everything at 10x volume',
  },
  leo: {
    setup: 'Things Leo will never admit',
    punchline: 'they checked their reflection in every surface walking here',
    comparisonTop: 'Main character, always',
    comparisonBottom: '"Why hasn\'t anyone texted me back?"',
    callout: 'Tag the Leo who walks into every room like they own it',
    hotTake:
      "Unpopular opinion: Leos get judged for being confident but it's their superpower",
  },
  virgo: {
    setup: 'Virgo at 3am:',
    punchline: 'reorganising their spice rack by cuisine type',
    comparisonTop: 'Completely calm and collected',
    comparisonBottom: "Stressed about something that hasn't happened yet",
    callout: 'Tag the Virgo who silently fixes everything without being asked',
    hotTake:
      "Hot take: Virgo isn't critical. They just have higher standards than you.",
  },
  libra: {
    setup: 'Being friends with a Libra means',
    punchline: 'waiting 2 hours for them to decide what to eat',
    comparisonTop: 'Charming and effortless',
    comparisonBottom: "Spiralling about whether they're liked",
    callout: 'Send this to the Libra who somehow makes everyone feel special',
    hotTake:
      "Hot take: Libra isn't indecisive. They just see everyone's point of view.",
  },
  scorpio: {
    setup: 'Scorpio energy is',
    punchline: 'already knowing your secrets before you told them',
    comparisonTop: 'Mysterious and calm',
    comparisonBottom: 'A volcano that keeps receipts',
    callout: "Tag the Scorpio who somehow always knows what you're thinking",
    hotTake:
      "Hot take: Scorpio isn't intense. Everyone else is just emotionally lazy.",
  },
  sagittarius: {
    setup: "POV: You're dating a Sagittarius",
    punchline: 'they booked a flight instead of having that conversation',
    comparisonTop: 'Life of the party, zero filter',
    comparisonBottom: 'Lowkey questioning everything',
    callout: 'Tag the Sagittarius who is always down for spontaneous plans',
    hotTake:
      "Unpopular opinion: Sagittarius isn't commitment-phobic. They just refuse to settle.",
  },
  capricorn: {
    setup: 'Nobody:\nCapricorn:',
    punchline: 'working on their 10-year plan at 2am on a Saturday',
    comparisonTop: 'Responsible and put together',
    comparisonBottom: 'Silently judging everyone in the room',
    callout:
      'Send this to the Capricorn who is lowkey the most dependable person you know',
    hotTake:
      "Hot take: Capricorn isn't boring. They're just building an empire while you're scrolling.",
  },
  aquarius: {
    setup: 'Aquarius at 3am:',
    punchline: 'deep in a conspiracy theory rabbit hole they started "for fun"',
    comparisonTop: 'Chill and detached',
    comparisonBottom: "Thinking about humanity's future at all times",
    callout:
      'Tag the Aquarius who goes on the most random tangents but is somehow always right',
    hotTake:
      "Hot take: Aquarius isn't cold. They just process emotions in their own timeline.",
  },
  pisces: {
    setup: 'Things Pisces will never admit',
    punchline: "they've been living in a fantasy world since 2003",
    comparisonTop: 'Dreamy and artistic',
    comparisonBottom: 'One sad song away from a full emotional reset',
    callout: 'Tag the Pisces who cries at every movie including action films',
    hotTake:
      "Hot take: Pisces isn't delusional. They just see a version of reality the rest of us can't.",
  },
};

const SAMPLE_QUOTES = [
  // Famous quotes
  'We are all in the gutter, but some of us are looking at the stars. - Oscar Wilde',
  'The cosmos is within us. We are made of star-stuff. - Carl Sagan',
  'There is no better boat than a horoscope to help a man cross over the sea of life. - Varahamihira',
  'We need not feel ashamed of flirting with the zodiac. The zodiac is well worth flirting with. - D.H. Lawrence',
  'A physician without a knowledge of astrology has no right to call himself a physician. - Hippocrates',
  'The stars in the heavens sing a music, if only we had ears to hear. - Pythagoras',
  // Lunary-branded quotes
  'As above, so below. As within, so without. ~ Lunary',
  "Mercury's going direct, but are you? ~ Lunary",
  'Your birth chart is a map. You still have to walk the path. ~ Lunary',
  "The stars don't control you. They explain you. ~ Lunary",
  "Not everything is Mercury Retrograde's fault. But a lot of things are. ~ Lunary",
  'Your rising sign is who they think you are. Your moon sign is who you actually are. ~ Lunary',
  "The universe doesn't give you what you can't handle. Your chart proves it. ~ Lunary",
  "Astrology isn't about prediction. It's about understanding. ~ Lunary",
  "You're not 'just a [sign].' You're a whole chart. ~ Lunary",
  'Your Saturn return is not a punishment. It is a promotion. ~ Lunary',
  'Stop blaming retrogrades and start reading your transits. ~ Lunary',
  'The Moon changes signs every 2.5 days. Give yourself permission to change too. ~ Lunary',
  'Your North Node is where your soul is headed. Stop looking backward. ~ Lunary',
  "Compatibility isn't about matching signs. It's about understanding differences. ~ Lunary",
  'Every full moon is a chance to release what no longer serves your chart. ~ Lunary',
  "Your Venus sign knows what you need in love. Maybe it's time you listened. ~ Lunary",
  'Void of course Moon? Not the time to start. The perfect time to rest. ~ Lunary',
  'The 12th house holds your secrets. Your birth chart holds them gently. ~ Lunary',
  'A square aspect is not a problem. It is a push to grow. ~ Lunary',
  'You were born at exactly the right time. The sky that night proves it. ~ Lunary',
  "Your Mars sign is your fight song. Learn it. Live it. Don't apologise for it. ~ Lunary",
  'Eclipse season: when the universe rewrites the script you thought you knew. ~ Lunary',
  'The zodiac wheel turns for everyone. Your season is always coming. ~ Lunary',
  'A trine is a gift. A square is a lesson. An opposition is a mirror. ~ Lunary',
];

interface CarouselPreview {
  carousel: IGCarouselContent;
  imageUrls: string[];
}

export default function InstagramPreviewPage() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const VALID_TABS: Tab[] = [
    'memes',
    'carousels',
    'quotes',
    'did_you_know',
    'rankings',
    'compatibility',
    'stories',
    'angel_numbers',
    'one_word',
  ];
  // Always start with 'memes' to match SSR, then sync from hash after hydration
  const [activeTab, setActiveTab] = useState<Tab>('memes');

  useEffect(() => {
    const hash = window.location.hash.slice(1) as Tab;
    if (VALID_TABS.includes(hash)) setActiveTab(hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  }, []);
  const [selectedSign, setSelectedSign] = useState('scorpio');
  const [carouselPreviews, setCarouselPreviews] = useState<CarouselPreview[]>(
    [],
  );
  const [carouselsLoading, setCarouselsLoading] = useState(false);

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'memes', label: 'Memes' },
    { key: 'carousels', label: 'Carousels' },
    { key: 'quotes', label: 'Quotes' },
    { key: 'did_you_know', label: 'Did You Know' },
    { key: 'rankings', label: 'Rankings' },
    { key: 'compatibility', label: 'Compatibility' },
    { key: 'stories', label: 'Stories' },
    { key: 'angel_numbers', label: 'Angel Numbers' },
    { key: 'one_word', label: 'One Word' },
  ];

  const signData = SIGN_MEMES[selectedSign] || SIGN_MEMES.aries;
  const signName = selectedSign.charAt(0).toUpperCase() + selectedSign.slice(1);

  // Load carousel data from grimoire when tab or sign changes
  useEffect(() => {
    if (activeTab !== 'carousels') return;

    let cancelled = false;
    setCarouselsLoading(true);

    async function loadCarousels() {
      const slugs = [`zodiac/${selectedSign}`, ...SAMPLE_CAROUSEL_SLUGS];
      const results = await Promise.all(slugs.map(buildCarouselFromSlug));

      if (cancelled) return;

      const previews: CarouselPreview[] = [];
      for (const carousel of results) {
        if (!carousel) continue;
        const imageUrls = carousel.slides.map((slide) => {
          const params = new URLSearchParams({
            title: slide.title,
            slideIndex: String(slide.slideIndex),
            totalSlides: String(slide.totalSlides),
            content: slide.content,
            category: slide.category,
            variant: slide.variant,
          });
          if (slide.subtitle) params.set('subtitle', slide.subtitle);
          if (slide.symbol) params.set('symbol', slide.symbol);
          return `/api/og/instagram/carousel?${params.toString()}&t=${cacheBuster}`;
        });
        previews.push({ carousel, imageUrls });
      }

      setCarouselPreviews(previews);
      setCarouselsLoading(false);
    }

    loadCarousels();
    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedSign, cacheBuster]);

  const memeUrls = useMemo(() => {
    const templateContent: Record<
      string,
      { setup: string; punchline: string }
    > = {
      classic: { setup: signData.setup, punchline: signData.punchline },
      comparison: {
        setup: signData.comparisonTop,
        punchline: signData.comparisonBottom,
      },
      callout: { setup: signData.callout, punchline: '' },
      hot_take: { setup: signData.hotTake, punchline: '' },
    };

    return MEME_TEMPLATES.map((template) => ({
      template,
      url: `/api/og/instagram/meme?sign=${selectedSign}&template=${template}&setup=${encodeURIComponent(
        templateContent[template].setup,
      )}&punchline=${encodeURIComponent(
        templateContent[template].punchline,
      )}&t=${cacheBuster}`,
    }));
  }, [selectedSign, signData, cacheBuster]);

  const quoteUrls = useMemo(() => {
    return SAMPLE_QUOTES.map((quote) => ({
      quote,
      url: `/api/og/social-quote?text=${encodeURIComponent(quote)}&format=square&t=${cacheBuster}`,
    }));
  }, [cacheBuster]);

  // Did You Know previews
  const didYouKnowPreviews = useMemo(() => {
    const batch = generateDidYouKnowBatch(selectedDate, 4);
    return batch.map((content) => ({
      ...content,
      url: `/api/og/instagram/did-you-know?fact=${encodeURIComponent(content.fact)}&category=${content.category}&source=${encodeURIComponent(content.source)}&t=${cacheBuster}`,
    }));
  }, [selectedDate, cacheBuster]);

  // Ranking previews
  const rankingPreviews = useMemo(() => {
    const batch = generateRankingBatch(selectedDate, 3);
    return batch.map((content) => ({
      ...content,
      url: `/api/og/instagram/sign-ranking?trait=${encodeURIComponent(content.trait)}&rankings=${encodeURIComponent(JSON.stringify(content.rankings))}&t=${cacheBuster}`,
    }));
  }, [selectedDate, cacheBuster]);

  // Compatibility previews
  const compatibilityPreviews = useMemo(() => {
    const batch = generateCompatibilityBatch(selectedDate, 3);
    return batch.map((content) => ({
      ...content,
      url: `/api/og/instagram/compatibility?sign1=${content.sign1}&sign2=${content.sign2}&score=${content.score}&element1=${content.element1}&element2=${content.element2}&headline=${encodeURIComponent(content.headline)}&t=${cacheBuster}`,
    }));
  }, [selectedDate, cacheBuster]);

  // Ranking carousel previews (Fix 7)
  const rankingCarouselPreviews = useMemo(() => {
    const result = generateRankingCarousel(selectedDate);
    const imageUrls = result.slides.map((slide) => {
      const params = new URLSearchParams({
        title: slide.title,
        slideIndex: String(slide.slideIndex),
        totalSlides: String(slide.totalSlides),
        content: slide.content,
        category: slide.category,
        variant: slide.variant,
      });
      if (slide.subtitle) params.set('subtitle', slide.subtitle);
      if (slide.symbol) params.set('symbol', slide.symbol);
      return `/api/og/instagram/carousel?${params.toString()}&t=${cacheBuster}`;
    });
    return { ...result, imageUrls };
  }, [selectedDate, cacheBuster]);

  // Compatibility carousel previews (Fix 8)
  const compatCarouselPreviews = useMemo(() => {
    const result = generateCompatibilityCarousel(selectedDate);
    const imageUrls = result.slides.map((slide) => {
      const params = new URLSearchParams({
        title: slide.title,
        slideIndex: String(slide.slideIndex),
        totalSlides: String(slide.totalSlides),
        content: slide.content,
        category: slide.category,
        variant: slide.variant,
      });
      if (slide.subtitle) params.set('subtitle', slide.subtitle);
      if (slide.symbol) params.set('symbol', slide.symbol);
      return `/api/og/instagram/carousel?${params.toString()}&t=${cacheBuster}`;
    });
    return { ...result, imageUrls };
  }, [selectedDate, cacheBuster]);

  // Angel number carousel previews (Fix 9)
  const angelNumberPreviews = useMemo(() => {
    const batch = generateAngelNumberBatch(selectedDate, 3);
    return batch.map((item) => {
      const imageUrls = item.slides.map((slide) => {
        const params = new URLSearchParams({
          title: slide.title,
          slideIndex: String(slide.slideIndex),
          totalSlides: String(slide.totalSlides),
          content: slide.content,
          category: slide.category,
          variant: slide.variant,
        });
        if (slide.subtitle) params.set('subtitle', slide.subtitle);
        return `/api/og/instagram/carousel?${params.toString()}&t=${cacheBuster}`;
      });
      return { ...item, imageUrls };
    });
  }, [selectedDate, cacheBuster]);

  // One word carousel previews
  const oneWordPreviews = useMemo(() => {
    const batch = generateOneWordBatch(selectedDate, 2);
    return batch.map((item) => {
      const imageUrls = item.slides.map((slide) => {
        if (slide.variant === 'body') {
          // Dedicated hero layout: word is the centrepiece
          const params = new URLSearchParams({
            sign: slide.title,
            word: slide.content,
            explanation: slide.subtitle || '',
            symbol: slide.symbol || '',
            slideIndex: String(slide.slideIndex),
            totalSlides: String(slide.totalSlides),
          });
          return `/api/og/instagram/one-word?${params.toString()}&t=${cacheBuster}`;
        }
        // Cover and CTA use the standard carousel route
        const params = new URLSearchParams({
          title: slide.title,
          slideIndex: String(slide.slideIndex),
          totalSlides: String(slide.totalSlides),
          content: slide.content,
          category: slide.category,
          variant: slide.variant,
        });
        if (slide.subtitle) params.set('subtitle', slide.subtitle);
        if (slide.symbol) params.set('symbol', slide.symbol);
        return `/api/og/instagram/carousel?${params.toString()}&t=${cacheBuster}`;
      });
      return { ...item, imageUrls };
    });
  }, [selectedDate, cacheBuster]);

  // Story previews — construct URLs directly (no absolute URL parsing)
  const storyPreviews = useMemo(() => {
    const stories = generateDailyStoryData(selectedDate);
    return stories.map((story) => {
      const params = new URLSearchParams({
        ...story.params,
        t: String(cacheBuster),
      });
      return { ...story, url: `${story.endpoint}?${params.toString()}` };
    });
  }, [selectedDate, cacheBuster]);

  // All story types preview — one of each type regardless of rotation
  const allStoryTypePreviews = useMemo(() => {
    const t = String(cacheBuster);
    const stories = generateDailyStoryData(selectedDate);
    // Moon and Tarot are always first two
    const moon = stories[0];
    const tarot = stories[1];

    // Build one of each rotating type
    const affData = generateAffirmation(selectedDate);
    const ritualData = generateRitualTip(selectedDate);
    const signData = generateSignOfTheDay(selectedDate);
    const transitData = generateTransitAlert(selectedDate);
    const numData = generateNumerologyStory(selectedDate);
    const dykData = generateDidYouKnow(selectedDate);

    const items = [
      {
        variant: 'daily_moon',
        title: moon.title,
        subtitle: moon.subtitle,
        url: `${moon.endpoint}?${new URLSearchParams({ ...moon.params, t })}`,
      },
      {
        variant: 'tarot_pull',
        title: tarot.title,
        subtitle: tarot.subtitle,
        url: `${tarot.endpoint}?${new URLSearchParams({ ...tarot.params, t })}`,
      },
      {
        variant: 'affirmation',
        title: 'Daily Affirmation',
        subtitle: affData.affirmation,
        url: `/api/og/instagram/story-rotating?${new URLSearchParams({ type: 'affirmation', main: affData.affirmation, secondary: affData.moonPhase, t })}`,
      },
      {
        variant: 'ritual_tip',
        title: 'Ritual Tip',
        subtitle: ritualData.tip,
        url: `/api/og/instagram/story-rotating?${new URLSearchParams({ type: 'ritual_tip', main: ritualData.tip, secondary: ritualData.theme.charAt(0).toUpperCase() + ritualData.theme.slice(1), t })}`,
      },
      {
        variant: 'sign_of_the_day',
        title: signData.sign,
        subtitle: signData.message,
        url: `/api/og/instagram/story-rotating?${new URLSearchParams({ type: 'sign_of_the_day', main: signData.message, secondary: signData.sign, extra: `${signData.element} sign · ${signData.trait}`, t })}`,
      },
      {
        variant: 'transit_alert',
        title: transitData.headline,
        subtitle: transitData.message,
        url: `/api/og/instagram/story-rotating?${new URLSearchParams({ type: 'transit_alert', main: transitData.message, secondary: transitData.headline, extra: transitData.planet, t })}`,
      },
      {
        variant: 'numerology',
        title: numData.label,
        subtitle: numData.mainText,
        url: `/api/og/instagram/story-rotating?${new URLSearchParams({ type: 'numerology', label: numData.label, main: numData.mainText, secondary: numData.secondary, extra: numData.extra, t })}`,
      },
      {
        variant: 'did_you_know',
        title: 'Did You Know?',
        subtitle: dykData.fact,
        url: `/api/og/instagram/did-you-know?${new URLSearchParams({ fact: dykData.fact, category: dykData.category, source: dykData.source, t })}`,
      },
      {
        variant: 'quote',
        title: 'Quote',
        subtitle: '(Loaded from DB at post time)',
        url: `/api/og/social-quote?${new URLSearchParams({ text: 'The cosmos is within us. We are made of star-stuff. - Carl Sagan', format: 'story', v: '4', t })}`,
      },
    ];
    return items;
  }, [selectedDate, cacheBuster]);

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Instagram Content Preview</h1>
          <p className='text-zinc-400 mb-6'>
            Preview all content types: memes, carousels, cards, quotes, facts,
            rankings, compatibility, and stories
          </p>

          {/* Date + Sign selectors */}
          <div className='flex flex-wrap items-center gap-4 mb-6'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Date:</label>
              <input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Sign:</label>
              <select
                value={selectedSign}
                onChange={(e) => setSelectedSign(e.target.value)}
                className='px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
              >
                {SIGNS.map((sign) => (
                  <option key={sign} value={sign}>
                    {sign.charAt(0).toUpperCase() + sign.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setCacheBuster(Date.now())}
              className='px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 rounded-md text-white font-medium transition-colors'
            >
              Refresh All
            </button>
          </div>

          {/* Tabs */}
          <div className='flex flex-wrap gap-2 border-b border-zinc-700 pb-0'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-t-md font-medium transition-colors text-sm ${
                  activeTab === tab.key
                    ? 'bg-zinc-800 text-white border-b-2 border-lunary-primary-500'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'memes' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              Meme Templates &mdash; {signName}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
              {memeUrls.map(({ template, url }) => {
                const caption = generateMemeCaption(
                  selectedSign,
                  template,
                  `${selectedDate}-${template}`,
                );
                const altText = generateMemeAltText(selectedSign, template);
                return (
                  <div
                    key={template}
                    className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'
                  >
                    <div className='p-4 border-b border-zinc-700'>
                      <h3 className='font-bold capitalize'>
                        {template.replace('_', ' ')}
                      </h3>
                    </div>
                    <div className='p-4'>
                      <div className='aspect-[4/5] rounded-lg overflow-hidden border border-zinc-600'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* lgtm[js/xss-through-dom] — admin-only page, URL validated by sanitizeImageUrl, sign from <select> allow-list */}
                        <img
                          src={sanitizeImageUrl(url)}
                          alt={altText}
                          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                        />
                      </div>
                      <div className='flex gap-2 mt-3'>
                        <CopyButton
                          text={caption.fullCaption}
                          label='Copy Caption'
                        />
                        <CopyButton text={altText} label='Copy Alt Text' />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'carousels' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              Grimoire Carousel Previews
            </h2>
            {carouselsLoading ? (
              <div className='text-zinc-400 py-8 text-center'>
                Loading carousel data from grimoire...
              </div>
            ) : (
              <div className='space-y-8'>
                {carouselPreviews.map(({ carousel, imageUrls }) => (
                  <div
                    key={carousel.slug}
                    className='bg-zinc-900 rounded-lg border border-zinc-700 p-6'
                  >
                    <div className='flex items-center gap-3 mb-4'>
                      <h3 className='font-bold text-lg'>{carousel.title}</h3>
                      <span className='text-xs px-2 py-1 rounded-full bg-zinc-800 text-lunary-primary-400'>
                        {carousel.category}
                      </span>
                      <span className='text-xs text-zinc-500'>
                        {carousel.slides.length} slides
                      </span>
                      <CopyButton
                        text={
                          carousel.category === 'zodiac'
                            ? generateZodiacCaption(
                                carousel.title.toLowerCase(),
                                `carousel-${carousel.slug}`,
                              ).fullCaption
                            : carousel.category === 'tarot'
                              ? generateTarotCaption(
                                  carousel.title,
                                  `carousel-${carousel.slug}`,
                                ).fullCaption
                              : carousel.category === 'crystals'
                                ? generateCrystalCaption(
                                    carousel.title,
                                    `carousel-${carousel.slug}`,
                                  ).fullCaption
                                : generateGenericCaption(
                                    carousel.title,
                                    carousel.category,
                                    `carousel-${carousel.slug}`,
                                  ).fullCaption
                        }
                        label='Copy Caption'
                      />
                      <CopyButton
                        text={generateCarouselAltText(
                          carousel.title,
                          carousel.category,
                        )}
                        label='Copy Alt Text'
                      />
                    </div>
                    <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                      {carousel.slides.map((slide, i) => (
                        <div key={i}>
                          <div className='aspect-[4/5] rounded-lg overflow-hidden border border-zinc-600 bg-zinc-800'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sanitizeImageUrl(imageUrls[i])}
                              alt={`${carousel.title} - ${slide.subtitle || `Slide ${i + 1}`}`}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <p className='text-xs text-zinc-400 mt-1 text-center truncate'>
                            {slide.variant === 'cover'
                              ? 'Cover'
                              : slide.variant === 'cta'
                                ? 'CTA'
                                : slide.subtitle || `Slide ${i + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>Quote Cards</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {quoteUrls.map(({ quote, url }) => (
                <div
                  key={quote}
                  className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'
                >
                  <div className='p-4 border-b border-zinc-700'>
                    <p className='text-sm text-zinc-300 line-clamp-2'>
                      {quote}
                    </p>
                  </div>
                  <div className='p-4'>
                    <div className='aspect-square rounded-lg overflow-hidden border border-zinc-600'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sanitizeImageUrl(url)}
                        alt='Quote card'
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'did_you_know' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              Did You Know &mdash; {selectedDate}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
              {didYouKnowPreviews.map((item, i) => (
                <div
                  key={i}
                  className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'
                >
                  <div className='p-4 border-b border-zinc-700'>
                    <span className='text-xs px-2 py-1 rounded-full bg-zinc-800 text-lunary-primary-400'>
                      {item.category}
                    </span>
                    <p className='text-sm text-zinc-300 mt-2 line-clamp-2'>
                      {item.fact}
                    </p>
                  </div>
                  <div className='p-4'>
                    <div className='aspect-square rounded-lg overflow-hidden border border-zinc-600'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sanitizeImageUrl(item.url)}
                        alt={`Did you know - ${item.category}`}
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rankings' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              Sign Rankings &mdash; {selectedDate}
            </h2>

            {/* Ranking Carousel Variant (Fix 7) */}
            <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-6 mb-8'>
              <div className='flex items-center gap-3 mb-4'>
                <h3 className='font-bold text-lg'>
                  Carousel: Ranked by {rankingCarouselPreviews.trait}
                </h3>
                <span className='text-xs px-2 py-1 rounded-full bg-zinc-800 text-lunary-primary-400'>
                  carousel
                </span>
                <span className='text-xs text-zinc-500'>
                  {rankingCarouselPreviews.slides.length} slides
                </span>
                <CopyButton
                  text={
                    generateRankingCaption(
                      rankingCarouselPreviews.trait,
                      rankingCarouselPreviews.rankings[0]?.sign || 'aries',
                      selectedDate,
                    ).fullCaption
                  }
                  label='Copy Caption'
                />
                <CopyButton
                  text={generateRankingAltText(rankingCarouselPreviews.trait)}
                  label='Copy Alt Text'
                />
              </div>
              <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3'>
                {rankingCarouselPreviews.slides.map((slide, i) => (
                  <div key={i}>
                    <div className='aspect-[4/5] rounded-lg overflow-hidden border border-zinc-600 bg-zinc-800'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sanitizeImageUrl(
                          rankingCarouselPreviews.imageUrls[i],
                        )}
                        alt={`Ranking slide ${i + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <p className='text-xs text-zinc-400 mt-1 text-center truncate'>
                      {slide.variant === 'cover'
                        ? 'Cover'
                        : slide.variant === 'cta'
                          ? 'CTA'
                          : slide.subtitle || `Slide ${i + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Static Rankings */}
            <h3 className='font-bold mb-3'>Static Rankings</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {rankingPreviews.map((item, i) => {
                const caption = generateRankingCaption(
                  item.trait,
                  item.rankings[0]?.sign || 'aries',
                  `${selectedDate}-${i}`,
                );
                const altText = generateRankingAltText(item.trait);
                return (
                  <div
                    key={i}
                    className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'
                  >
                    <div className='p-4 border-b border-zinc-700'>
                      <h3 className='font-bold capitalize'>
                        Ranked by: {item.trait}
                      </h3>
                      <p className='text-xs text-zinc-400 mt-1'>
                        Top 3:{' '}
                        {item.rankings
                          .slice(0, 3)
                          .map((r) => r.sign)
                          .join(', ')}
                      </p>
                    </div>
                    <div className='p-4'>
                      <div className='aspect-[4/5] rounded-lg overflow-hidden border border-zinc-600'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sanitizeImageUrl(item.url)}
                          alt={altText}
                          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                        />
                      </div>
                      <div className='flex gap-2 mt-3'>
                        <CopyButton
                          text={caption.fullCaption}
                          label='Copy Caption'
                        />
                        <CopyButton text={altText} label='Copy Alt Text' />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'compatibility' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              Compatibility &mdash; {selectedDate}
            </h2>

            {/* Compatibility Carousel Variant (Fix 8) */}
            <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-6 mb-8'>
              <div className='flex items-center gap-3 mb-4'>
                <h3 className='font-bold text-lg capitalize'>
                  Carousel: {compatCarouselPreviews.sign1} +{' '}
                  {compatCarouselPreviews.sign2} ({compatCarouselPreviews.score}
                  %)
                </h3>
                <span className='text-xs px-2 py-1 rounded-full bg-zinc-800 text-lunary-primary-400'>
                  carousel
                </span>
                <CopyButton
                  text={
                    generateCompatibilityCaption(
                      compatCarouselPreviews.sign1,
                      compatCarouselPreviews.sign2,
                      compatCarouselPreviews.score,
                      selectedDate,
                    ).fullCaption
                  }
                  label='Copy Caption'
                />
                <CopyButton
                  text={generateCompatibilityAltText(
                    compatCarouselPreviews.sign1,
                    compatCarouselPreviews.sign2,
                    compatCarouselPreviews.score,
                  )}
                  label='Copy Alt Text'
                />
              </div>
              <div className='grid grid-cols-3 md:grid-cols-5 gap-3'>
                {compatCarouselPreviews.slides.map((slide, i) => (
                  <div key={i}>
                    <div className='aspect-[4/5] rounded-lg overflow-hidden border border-zinc-600 bg-zinc-800'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sanitizeImageUrl(
                          compatCarouselPreviews.imageUrls[i],
                        )}
                        alt={`Compatibility slide ${i + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <p className='text-xs text-zinc-400 mt-1 text-center truncate'>
                      {slide.variant === 'cover'
                        ? 'Cover'
                        : slide.variant === 'cta'
                          ? 'CTA'
                          : slide.subtitle || `Slide ${i + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Static Compatibility Cards */}
            <h3 className='font-bold mb-3'>Static Cards</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {compatibilityPreviews.map((item, i) => {
                const caption = generateCompatibilityCaption(
                  item.sign1,
                  item.sign2,
                  item.score,
                  `${selectedDate}-${i}`,
                );
                const altText = generateCompatibilityAltText(
                  item.sign1,
                  item.sign2,
                  item.score,
                );
                return (
                  <div
                    key={i}
                    className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'
                  >
                    <div className='p-4 border-b border-zinc-700'>
                      <h3 className='font-bold capitalize'>
                        {item.sign1.charAt(0).toUpperCase() +
                          item.sign1.slice(1)}{' '}
                        +{' '}
                        {item.sign2.charAt(0).toUpperCase() +
                          item.sign2.slice(1)}
                      </h3>
                      <p className='text-xs text-zinc-400 mt-1'>
                        Score: {item.score}% &middot; {item.headline}
                      </p>
                    </div>
                    <div className='p-4'>
                      <div className='aspect-square rounded-lg overflow-hidden border border-zinc-600'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sanitizeImageUrl(item.url)}
                          alt={altText}
                          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                        />
                      </div>
                      <div className='flex gap-2 mt-3'>
                        <CopyButton
                          text={caption.fullCaption}
                          label='Copy Caption'
                        />
                        <CopyButton text={altText} label='Copy Alt Text' />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              Today&apos;s Stories &mdash; {selectedDate}
            </h2>
            <p className='text-sm text-zinc-400 mb-4'>
              These 4 stories will be posted today based on the rotation
              schedule.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-12'>
              {storyPreviews.map((item, i) => (
                <div
                  key={i}
                  className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'
                >
                  <div className='p-4 border-b border-zinc-700'>
                    <span className='text-xs px-2 py-1 rounded-full bg-zinc-800 text-lunary-primary-400'>
                      {item.variant.replace('_', ' ')}
                    </span>
                    <h3 className='font-bold mt-2'>{item.title}</h3>
                    <p className='text-xs text-zinc-400 mt-1'>
                      {item.subtitle}
                    </p>
                  </div>
                  <div className='p-4'>
                    <div className='aspect-[9/16] max-h-[600px] rounded-lg overflow-hidden border border-zinc-600 mx-auto'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sanitizeImageUrl(item.url)}
                        alt={generateStoryAltText(item.variant, item.title)}
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                    <div className='flex gap-2 mt-3 justify-center'>
                      <CopyButton
                        text={generateStoryAltText(item.variant, item.title)}
                        label='Copy Alt Text'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className='text-xl font-bold mb-4'>
              All Story Types &mdash; {selectedDate}
            </h2>
            <p className='text-sm text-zinc-400 mb-4'>
              Preview of every story type. Only 4 are posted each day via the
              weekly rotation.
            </p>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
              {allStoryTypePreviews.map((item, i) => (
                <div
                  key={i}
                  className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'
                >
                  <div className='p-3 border-b border-zinc-700'>
                    <span className='text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-lunary-primary-400'>
                      {item.variant.replace(/_/g, ' ')}
                    </span>
                    <h3 className='font-bold text-sm mt-1 truncate'>
                      {item.title}
                    </h3>
                  </div>
                  <div className='p-3'>
                    <div className='aspect-[9/16] rounded-lg overflow-hidden border border-zinc-600'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sanitizeImageUrl(item.url)}
                        alt={`${item.variant} story preview`}
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Angel Numbers (Fix 9) */}
        {activeTab === 'angel_numbers' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              Angel Number Carousels &mdash; {selectedDate}
            </h2>
            <div className='space-y-8'>
              {angelNumberPreviews.map((item) => {
                const caption = generateAngelNumberCaption(
                  item.number,
                  `angel-${item.number}-${selectedDate}`,
                );
                const altText = generateAngelNumberAltText(item.number);
                return (
                  <div
                    key={item.number}
                    className='bg-zinc-900 rounded-lg border border-zinc-700 p-6'
                  >
                    <div className='flex items-center gap-3 mb-4'>
                      <h3 className='font-bold text-lg'>
                        Angel Number {item.number}
                      </h3>
                      <span className='text-xs px-2 py-1 rounded-full bg-zinc-800 text-lunary-primary-400'>
                        numerology
                      </span>
                      <span className='text-xs text-zinc-500'>
                        {item.slides.length} slides
                      </span>
                      <CopyButton
                        text={caption.fullCaption}
                        label='Copy Caption'
                      />
                      <CopyButton text={altText} label='Copy Alt Text' />
                    </div>
                    <div className='grid grid-cols-3 md:grid-cols-5 gap-3'>
                      {item.slides.map((slide, i) => (
                        <div key={i}>
                          <div className='aspect-[4/5] rounded-lg overflow-hidden border border-zinc-600 bg-zinc-800'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sanitizeImageUrl(item.imageUrls[i])}
                              alt={`Angel number ${item.number} slide ${i + 1}`}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <p className='text-xs text-zinc-400 mt-1 text-center truncate'>
                            {slide.variant === 'cover'
                              ? 'Cover'
                              : slide.variant === 'cta'
                                ? 'CTA'
                                : slide.subtitle || `Slide ${i + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* One Word Carousels (Fix 10) */}
        {activeTab === 'one_word' && (
          <div>
            <h2 className='text-xl font-bold mb-4'>
              &quot;Your Sign&apos;s [Trait] in One Word&quot; &mdash;{' '}
              {selectedDate}
            </h2>
            <div className='space-y-8'>
              {oneWordPreviews.map((item) => {
                const caption = generateGenericCaption(
                  `Your sign's ${item.traitLabel} in one word`,
                  'zodiac',
                  `oneword-${item.traitKey}-${selectedDate}`,
                );
                return (
                  <div
                    key={item.traitKey}
                    className='bg-zinc-900 rounded-lg border border-zinc-700 p-6'
                  >
                    <div className='flex items-center gap-3 mb-4'>
                      <h3 className='font-bold text-lg'>
                        Your Sign&apos;s {item.traitLabel} in One Word
                      </h3>
                      <span className='text-xs px-2 py-1 rounded-full bg-zinc-800 text-lunary-primary-400'>
                        zodiac
                      </span>
                      <span className='text-xs text-zinc-500'>
                        {item.slides.length} slides
                      </span>
                      <CopyButton
                        text={caption.fullCaption}
                        label='Copy Caption'
                      />
                    </div>
                    <div className='grid grid-cols-4 md:grid-cols-7 gap-2'>
                      {item.slides.map((slide, i) => (
                        <div key={i}>
                          <div className='aspect-[4/5] rounded-lg overflow-hidden border border-zinc-600 bg-zinc-800'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sanitizeImageUrl(item.imageUrls[i])}
                              alt={`${item.traitLabel} one word slide ${i + 1}`}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <p className='text-xs text-zinc-400 mt-1 text-center truncate'>
                            {slide.variant === 'cover'
                              ? 'Cover'
                              : slide.variant === 'cta'
                                ? 'CTA'
                                : slide.subtitle || `Slide ${i + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-700'>
          <h3 className='text-xl font-bold mb-4'>Quick Links</h3>
          <div className='flex flex-wrap gap-4'>
            <a
              href='/admin/daily-posts-preview'
              className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white font-medium transition-colors'
            >
              Daily Posts Preview
            </a>
            <a
              href='/admin/scheduler'
              className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white font-medium transition-colors'
            >
              Scheduler
            </a>
            <button
              onClick={() => setCacheBuster(Date.now())}
              className='px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 rounded-md text-white font-medium transition-colors'
            >
              Refresh Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
