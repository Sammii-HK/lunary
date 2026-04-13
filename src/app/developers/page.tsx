import { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/ui/CodeBlock';
import {
  Code,
  Zap,
  Moon,
  Star,
  Sparkles,
  Key,
  Globe,
  Shield,
  Clock,
  BookOpen,
  Sun,
  Telescope,
} from 'lucide-react';
import { renderJsonLd } from '@/lib/schema';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title:
    'Astrology API for Developers - Birth Charts, Moon Phases, Transits | Lunary',
  description:
    'Free astrology API with real astronomical calculations validated against NOVAS C 3.1 (US Naval Observatory) and JPL Horizons. 15 RESTful endpoints: birth charts, moon phases, planetary positions, synastry, transits, eclipses, progressions, Vedic dasha, and 2,000+ grimoire entries. VSOP87 planetary model, IAU 2000B nutation, JPL DE405 constants.',
  keywords: [
    'astrology API',
    'moon phase API',
    'horoscope API',
    'zodiac API',
    'birth chart API',
    'planetary transits API',
    'synastry API',
    'free astrology API',
    'astronomical API',
    'ephemeris API',
    'vedic astrology API',
    'eclipse API',
    'house system API',
    'natal chart API',
    'astrology REST API',
    'real-time astrology data',
    'astronomy engine API',
    'VSOP87 API',
    'astrology API for developers',
    'astrology calculation API',
  ],
  openGraph: {
    title:
      'Astrology API for Developers - Birth Charts, Moon Phases, Transits | Lunary',
    description:
      'Free API with 15 endpoints: birth charts, synastry, moon phases, transits, eclipses, and 2,000+ grimoire entries. Real astronomical calculations via VSOP87.',
    url: 'https://lunary.app/developers',
    siteName: 'Lunary',
    type: 'website',
    images: [
      {
        url: '/api/og/educational/developers?label=Developers&title=Lunary%20Astrology%20API&subtitle=15%20endpoints%20%E2%80%A2%20Real%20calculations%20%E2%80%A2%20Free%20tier&path=%2Fdevelopers&format=landscape',
        width: 1200,
        height: 630,
        alt: 'Lunary Astrology API for Developers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrology API - Birth Charts, Moon Phases, Synastry | Lunary',
    description:
      '15 RESTful endpoints with real astronomical calculations. Free tier available.',
  },
  alternates: {
    canonical: 'https://lunary.app/developers',
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebAPI',
      name: 'Lunary Astrology API',
      description:
        'RESTful API providing real-time astronomical calculations including birth charts, planetary positions, moon phases, synastry, transits, eclipses, secondary progressions, Vedic dasha periods, and a 2,000+ entry grimoire.',
      url: 'https://lunary.app/developers',
      provider: {
        '@type': 'Organization',
        name: 'Lunary',
        url: 'https://lunary.app',
      },
      documentation: 'https://lunary.app/developers',
      termsOfService: 'https://lunary.app/terms',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Lunary Astrology API',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'USD',
          description:
            '100 requests/month. Moon phases, planetary positions, aspects, cosmic events, grimoire.',
        },
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '9',
          priceCurrency: 'USD',
          description:
            '5,000 requests/month. Birth charts, houses, eclipses, ephemeris.',
        },
        {
          '@type': 'Offer',
          name: 'Developer',
          price: '29',
          priceCurrency: 'USD',
          description:
            '25,000 requests/month. Synastry, transits, progressions, Vedic dasha.',
        },
        {
          '@type': 'Offer',
          name: 'Business',
          price: '99',
          priceCurrency: 'USD',
          description:
            '100,000 requests/month. Everything plus webhooks, SLA, dedicated support.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the Lunary Astrology API free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The free tier includes 100 requests/month with access to moon phases, planetary positions, aspects, cosmic events, and grimoire search. Paid plans start at $9/month for birth charts and more.',
          },
        },
        {
          '@type': 'Question',
          name: 'What calculation engine does Lunary use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Lunary uses the VSOP87 planetary model from the Bureau des Longitudes, with the IAU 2000B nutation model and gravitational parameters from JPL DE405. Calculations are accurate to within 1 arcminute, unit tested against NOVAS C 3.1 (US Naval Observatory Vector Astrometry Software) and JPL Horizons. All data is computed in real time, not pre-generated.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many house systems does the API support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The API supports 5 house systems: Placidus, Koch, Whole Sign, Porphyry, and Alcabitius. Specify the system in the request body.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the grimoire?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Lunary grimoire is a searchable reference of 2,000+ entries covering astrology, tarot, crystals, numerology, spells, and cosmic correspondences. Access it via the grimoire search and entry endpoints.',
          },
        },
      ],
    },
  ],
};

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  tier: 'free' | 'starter' | 'developer' | 'business';
  params?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  body?: string;
  response: string;
  curl: string;
}

const endpoints: Endpoint[] = [
  // Free tier
  {
    method: 'GET',
    path: '/api/v1/astrology/moon-phase',
    description:
      'Current moon phase with sign, illumination, and age. Real-time calculation via astronomy-engine.',
    tier: 'free',
    params: [
      {
        name: 'date',
        type: 'string',
        required: false,
        description: 'ISO date (defaults to today)',
      },
    ],
    response: `{
  "ok": true,
  "data": {
    "date": "2026-04-13",
    "phase": "Waning Gibbous",
    "illumination": 82,
    "sign": "Sagittarius",
    "age": 18.4,
    "trend": "waning"
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/moon-phase"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/planetary-positions',
    description:
      'All 10 planets with sign, degree, retrograde status, and transit duration. Includes daily motion data.',
    tier: 'free',
    params: [
      {
        name: 'date',
        type: 'string',
        required: false,
        description: 'ISO date (defaults to today)',
      },
    ],
    response: `{
  "ok": true,
  "data": {
    "date": "2026-04-13",
    "planets": [
      {
        "planet": "sun",
        "longitude": 23.412,
        "sign": "Aries",
        "degree": 23,
        "minutes": 24,
        "retrograde": false,
        "transit": {
          "totalDays": 30,
          "remainingDays": 7,
          "display": "7 days left in Aries"
        }
      }
    ]
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/planetary-positions?date=2026-04-13"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/aspects',
    description:
      'All active planetary aspects with orb values. Covers conjunction, sextile, square, trine, and opposition.',
    tier: 'free',
    params: [
      {
        name: 'date',
        type: 'string',
        required: false,
        description: 'ISO date',
      },
    ],
    response: `{
  "ok": true,
  "data": {
    "date": "2026-04-13",
    "count": 12,
    "aspects": [
      {
        "planet1": "venus",
        "planet2": "mars",
        "aspect": "conjunction",
        "orb": 2.34,
        "exact": false
      }
    ]
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/aspects"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/cosmic-events',
    description: 'Active retrogrades and their signs.',
    tier: 'free',
    response: `{
  "ok": true,
  "data": {
    "date": "2026-04-13",
    "retrogrades": [
      { "planet": "mercury", "sign": "Aries" }
    ],
    "retrogradeCount": 1
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/cosmic-events"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/grimoire/search',
    description:
      'Search 2,000+ grimoire entries on astrology, tarot, crystals, numerology, and spells.',
    tier: 'free',
    params: [
      {
        name: 'q',
        type: 'string',
        required: true,
        description: 'Search query',
      },
      {
        name: 'category',
        type: 'string',
        required: false,
        description: 'Filter by category',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Max results (default 10, max 50)',
      },
    ],
    response: `{
  "ok": true,
  "data": {
    "query": "mercury retrograde",
    "total": 5,
    "results": [
      {
        "slug": "astronomy/planets/mercury",
        "title": "Mercury in Astrology",
        "category": "astronomy",
        "summary": "Mercury governs communication...",
        "url": "https://lunary.app/grimoire/astronomy/planets/mercury"
      }
    ]
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/grimoire/search?q=mercury+retrograde"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/grimoire/entry',
    description: 'Get a single grimoire entry by slug with related entries.',
    tier: 'free',
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
        description: 'Entry slug (e.g. astronomy/planets/mercury)',
      },
    ],
    response: `{
  "ok": true,
  "data": {
    "slug": "astronomy/planets/mercury",
    "title": "Mercury in Astrology",
    "category": "astronomy",
    "keywords": ["mercury", "communication", "intellect"],
    "summary": "Mercury governs communication, intellect, and travel...",
    "url": "https://lunary.app/grimoire/astronomy/planets/mercury",
    "related": [
      { "slug": "astronomy/aspects/mercury-retrograde", "title": "Mercury Retrograde", "category": "astronomy" }
    ]
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/grimoire/entry?slug=astronomy/planets/mercury"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/grimoire/stats',
    description: 'Grimoire statistics: total entries and category breakdown.',
    tier: 'free',
    response: `{
  "ok": true,
  "data": {
    "totalEntries": 2147,
    "categories": [
      { "name": "astrology", "count": 892 },
      { "name": "tarot", "count": 456 }
    ]
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/grimoire/stats"`,
  },
  // Starter tier
  {
    method: 'POST',
    path: '/api/v1/astrology/birth-chart',
    description:
      'Full birth chart with planets, houses, and aspects. Supports 5 house systems. Real-time VSOP87 calculations.',
    tier: 'starter',
    body: `{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "houseSystem": "placidus"
}`,
    response: `{
  "ok": true,
  "data": {
    "birthDate": "1990-05-15T14:30:00.000Z",
    "location": { "latitude": 40.7128, "longitude": -74.006 },
    "houseSystem": "placidus",
    "planets": [
      { "planet": "sun", "sign": "Taurus", "degree": 24, "longitude": 54.21, "retrograde": false, "house": 10 },
      { "planet": "moon", "sign": "Pisces", "degree": 8, "longitude": 338.15, "retrograde": false, "house": 8 }
    ],
    "houses": [
      { "house": 1, "sign": "Leo", "degree": 15 },
      { "house": 2, "sign": "Virgo", "degree": 8 }
    ]
  }
}`,
    curl: `curl -X POST -H "Authorization: Bearer lun_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","latitude":40.7128,"longitude":-74.006}' \\
  "https://lunary.app/api/v1/astrology/birth-chart"`,
  },
  {
    method: 'POST',
    path: '/api/v1/astrology/houses',
    description:
      'House cusp calculations for any of the 5 supported house systems: Placidus, Koch, Whole Sign, Porphyry, Alcabitius.',
    tier: 'starter',
    body: `{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "houseSystem": "koch"
}`,
    response: `{
  "ok": true,
  "data": {
    "houseSystem": "koch",
    "houses": [
      { "house": 1, "sign": "Leo", "degree": 15, "minute": 32 }
    ]
  }
}`,
    curl: `curl -X POST -H "Authorization: Bearer lun_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","latitude":40.7128,"longitude":-74.006,"houseSystem":"koch"}' \\
  "https://lunary.app/api/v1/astrology/houses"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/eclipses',
    description:
      'Upcoming solar and lunar eclipses with sign, degree, type, and days away.',
    tier: 'starter',
    params: [
      {
        name: 'date',
        type: 'string',
        required: false,
        description: 'Start date (defaults to today)',
      },
      {
        name: 'months',
        type: 'number',
        required: false,
        description: 'Look-ahead period (default 6, max 24)',
      },
    ],
    response: `{
  "ok": true,
  "data": {
    "from": "2026-04-13",
    "months": 6,
    "eclipses": [
      { "type": "solar", "kind": "annular", "sign": "Virgo", "degree": 15, "daysAway": 142 }
    ]
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/eclipses?months=12"`,
  },
  {
    method: 'GET',
    path: '/api/v1/astrology/ephemeris',
    description:
      'Full ephemeris for a location: sunrise, sunset, moonrise, moonset, day length, and planet visibility.',
    tier: 'starter',
    params: [
      {
        name: 'latitude',
        type: 'number',
        required: true,
        description: 'Observer latitude',
      },
      {
        name: 'longitude',
        type: 'number',
        required: true,
        description: 'Observer longitude',
      },
      {
        name: 'date',
        type: 'string',
        required: false,
        description: 'ISO date',
      },
    ],
    response: `{
  "ok": true,
  "data": {
    "date": "2026-04-13",
    "location": { "latitude": 51.5074, "longitude": -0.1278 },
    "sunMoon": {
      "sunrise": "06:12:34",
      "sunset": "19:48:21",
      "dayLength": 13.6,
      "moonPhase": { "illumination": 82 }
    },
    "planets": [
      { "planet": "Venus", "sign": "Pisces", "constellation": "Pisces" }
    ]
  }
}`,
    curl: `curl -H "Authorization: Bearer lun_YOUR_KEY" \\
  "https://lunary.app/api/v1/astrology/ephemeris?latitude=51.5074&longitude=-0.1278"`,
  },
  // Developer tier
  {
    method: 'POST',
    path: '/api/v1/astrology/synastry',
    description:
      'Relationship compatibility analysis between two birth charts. Returns compatibility score, aspects, strengths, and challenges.',
    tier: 'developer',
    body: `{
  "personA": {
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "latitude": 40.7128,
    "longitude": -74.006
  },
  "personB": {
    "birthDate": "1992-08-22",
    "birthTime": "09:15",
    "latitude": 51.5074,
    "longitude": -0.1278
  }
}`,
    response: `{
  "ok": true,
  "data": {
    "compatibilityScore": 74,
    "aspects": [
      { "personAPlanet": "venus", "personBPlanet": "mars", "aspect": "trine", "orb": 3.21, "nature": "harmonious" }
    ],
    "strengths": ["Strong emotional connection", "Complementary communication styles"],
    "challenges": ["Different approaches to conflict"],
    "summary": "This partnership shows strong romantic potential..."
  }
}`,
    curl: `curl -X POST -H "Authorization: Bearer lun_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"personA":{"birthDate":"1990-05-15","latitude":40.71,"longitude":-74},"personB":{"birthDate":"1992-08-22","latitude":51.5,"longitude":-0.13}}' \\
  "https://lunary.app/api/v1/astrology/synastry"`,
  },
  {
    method: 'POST',
    path: '/api/v1/astrology/transits',
    description:
      'Personal transits based on your natal chart. Returns upcoming transit events with significance levels.',
    tier: 'developer',
    body: `{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "latitude": 40.7128,
  "longitude": -74.006,
  "days": 30
}`,
    response: `{
  "ok": true,
  "data": {
    "lookAheadDays": 30,
    "transits": [
      { "type": "aspect", "planet": "saturn", "sign": "Pisces", "significance": "high", "description": "Saturn square natal Sun..." }
    ]
  }
}`,
    curl: `curl -X POST -H "Authorization: Bearer lun_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","latitude":40.71,"longitude":-74,"days":30}' \\
  "https://lunary.app/api/v1/astrology/transits"`,
  },
  {
    method: 'POST',
    path: '/api/v1/astrology/progressions',
    description:
      'Secondary progressions (day-for-a-year): progressed Sun, Moon, Mercury, Venus, and Mars positions.',
    tier: 'developer',
    body: `{
  "birthDate": "1990-05-15T14:30:00Z",
  "targetDate": "2026-04-13"
}`,
    response: `{
  "ok": true,
  "data": {
    "birthDate": "1990-05-15",
    "targetDate": "2026-04-13",
    "progressedSun": { "sign": "Cancer", "degree": 18 },
    "progressedMoon": { "sign": "Scorpio", "degree": 5 }
  }
}`,
    curl: `curl -X POST -H "Authorization: Bearer lun_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"birthDate":"1990-05-15T14:30:00Z"}' \\
  "https://lunary.app/api/v1/astrology/progressions"`,
  },
  {
    method: 'POST',
    path: '/api/v1/astrology/dasha',
    description:
      'Vedic Vimshottari dasha: current mahadasha, antardasha, and upcoming periods based on natal Moon degree.',
    tier: 'developer',
    body: `{
  "moonDegree": 338.15,
  "birthDate": "1990-05-15",
  "upcomingCount": 5
}`,
    response: `{
  "ok": true,
  "data": {
    "current": {
      "mahadasha": "Jupiter",
      "antardasha": "Saturn",
      "daysRemaining": 412,
      "percentComplete": 68,
      "transitionApproaching": false
    },
    "upcoming": [
      { "planet": "Saturn", "startDate": "2027-05-28", "durationYears": 19 }
    ]
  }
}`,
    curl: `curl -X POST -H "Authorization: Bearer lun_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"moonDegree":338.15,"birthDate":"1990-05-15"}' \\
  "https://lunary.app/api/v1/astrology/dasha"`,
  },
];

const TIER_COLORS: Record<string, string> = {
  free: 'bg-lunary-success/20 text-lunary-success border-lunary-success/30',
  starter:
    'bg-lunary-primary-400/20 text-lunary-primary-400 border-lunary-primary-400/30',
  developer:
    'bg-lunary-secondary/20 text-lunary-secondary border-lunary-secondary/30',
  business: 'bg-lunary-accent/20 text-lunary-accent border-lunary-accent/30',
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-lunary-success/20 text-lunary-success',
  POST: 'bg-lunary-secondary/20 text-lunary-secondary',
};

export default function DevelopersPage() {
  return (
    <>
      {renderJsonLd(structuredData)}
      <div className='min-h-screen bg-surface-base text-content-primary flex flex-col'>
        <div className='flex-1 max-w-5xl mx-auto px-4 py-12'>
          {/* Hero */}
          <div className='mb-16'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2 rounded-lg bg-layer-base/20'>
                <Code className='h-6 w-6 text-lunary-primary-400' />
              </div>
              <span className='text-sm text-lunary-primary-400 font-medium'>
                Developer API
              </span>
            </div>
            <h1 className='text-4xl font-light text-content-primary mb-4'>
              Lunary Astrology API
            </h1>
            <p className='text-lg text-content-muted mb-2 max-w-2xl'>
              Real-time astronomical calculations for your apps. 15 RESTful
              endpoints powered by the VSOP87 planetary model. Accurate to
              within 1 arcminute, unit tested against NOVAS C 3.1 (US Naval
              Observatory) and JPL Horizons. Free tier available.
            </p>
            <p className='text-sm text-content-muted mb-8 max-w-2xl'>
              Birth charts with 5 house systems, synastry compatibility,
              personal transits, eclipses, secondary progressions, Vedic dasha
              periods, and a searchable grimoire with 2,000+ entries on
              astrology, tarot, crystals, and numerology. All calculations use
              the IAU 2000B nutation model with gravitational parameters from
              the JPL DE405 ephemeris.
            </p>
            <div className='flex flex-wrap gap-3'>
              <Link
                href='/developers/dashboard'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-lunary-primary-600 hover:bg-layer-high text-white font-medium transition-colors'
              >
                <Key className='h-5 w-5' />
                Get your API key
              </Link>
              <a
                href='#endpoints'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-layer-base/20 hover:bg-layer-base/30 border border-stroke-subtle text-content-primary font-medium transition-colors'
              >
                <BookOpen className='h-5 w-5' />
                View endpoints
              </a>
            </div>
          </div>

          {/* Features */}
          <div className='grid md:grid-cols-4 gap-4 mb-16'>
            <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
              <Telescope className='h-5 w-5 text-lunary-primary-400 mb-2' />
              <h3 className='text-sm font-medium text-content-primary mb-1'>
                Real calculations
              </h3>
              <p className='text-xs text-content-muted'>
                VSOP87 planetary model, validated against NOVAS C 3.1 and JPL
                Horizons. Not pre-generated data.
              </p>
            </div>
            <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
              <Zap className='h-5 w-5 text-lunary-accent mb-2' />
              <h3 className='text-sm font-medium text-content-primary mb-1'>
                15 endpoints
              </h3>
              <p className='text-xs text-content-muted'>
                Moon phases, birth charts, synastry, transits, eclipses, dasha,
                grimoire, and more.
              </p>
            </div>
            <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
              <Shield className='h-5 w-5 text-lunary-success mb-2' />
              <h3 className='text-sm font-medium text-content-primary mb-1'>
                API key auth
              </h3>
              <p className='text-xs text-content-muted'>
                Bearer token authentication with per-key rate limits and monthly
                quota tracking.
              </p>
            </div>
            <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
              <Globe className='h-5 w-5 text-lunary-secondary mb-2' />
              <h3 className='text-sm font-medium text-content-primary mb-1'>
                Multi-domain
              </h3>
              <p className='text-xs text-content-muted'>
                Western + Vedic astrology, tarot, crystals, numerology, spells
                in one API.
              </p>
            </div>
          </div>

          {/* Quick start */}
          <div className='mb-16'>
            <h2 className='text-2xl font-medium text-content-primary mb-4'>
              Quick start
            </h2>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <span className='flex-none w-7 h-7 rounded-full bg-lunary-primary-600 text-white text-sm font-medium flex items-center justify-center'>
                  1
                </span>
                <div className='flex-1'>
                  <p className='text-sm text-content-primary mb-2'>
                    Get your API key from the{' '}
                    <Link
                      href='/developers/dashboard'
                      className='text-lunary-primary-400 hover:underline'
                    >
                      developer dashboard
                    </Link>
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <span className='flex-none w-7 h-7 rounded-full bg-lunary-primary-600 text-white text-sm font-medium flex items-center justify-center'>
                  2
                </span>
                <div className='flex-1'>
                  <p className='text-sm text-content-primary mb-2'>
                    Make your first request:
                  </p>
                  <CodeBlock
                    language='bash'
                    code={`curl -H "Authorization: Bearer lun_YOUR_API_KEY" \\
  "https://lunary.app/api/v1/astrology/moon-phase"`}
                  />
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <span className='flex-none w-7 h-7 rounded-full bg-lunary-primary-600 text-white text-sm font-medium flex items-center justify-center'>
                  3
                </span>
                <div className='flex-1'>
                  <p className='text-sm text-content-primary mb-2'>
                    Or use it in your code:
                  </p>
                  <CodeBlock
                    language='javascript'
                    code={`const response = await fetch(
  "https://lunary.app/api/v1/astrology/birth-chart",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer lun_YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      birthDate: "1990-05-15",
      birthTime: "14:30",
      latitude: 40.7128,
      longitude: -74.006,
      houseSystem: "placidus"
    })
  }
);

const { data } = await response.json();
console.log(data.planets); // Sun in Taurus, Moon in Pisces...`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div className='mb-16 p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
            <h2 className='text-lg font-medium text-content-primary mb-3'>
              Calculation accuracy
            </h2>
            <p className='text-sm text-content-muted mb-4'>
              Every calculation is computed in real time using the{' '}
              <strong className='text-content-primary'>VSOP87</strong> planetary
              model from the Bureau des Longitudes. Positions are accurate to
              within{' '}
              <strong className='text-content-primary'>1 arcminute</strong>,
              unit tested against{' '}
              <strong className='text-content-primary'>NOVAS C 3.1</strong> (US
              Naval Observatory Vector Astrometry Software) and{' '}
              <strong className='text-content-primary'>JPL Horizons</strong>.
            </p>
            <ul className='text-sm text-content-muted space-y-1.5'>
              <li className='flex items-center gap-2'>
                <Telescope className='h-4 w-4 text-lunary-primary-400 flex-none' />{' '}
                VSOP87 planetary model (Bureau des Longitudes)
              </li>
              <li className='flex items-center gap-2'>
                <Telescope className='h-4 w-4 text-lunary-primary-400 flex-none' />{' '}
                IAU 2000B nutation model
              </li>
              <li className='flex items-center gap-2'>
                <Telescope className='h-4 w-4 text-lunary-primary-400 flex-none' />{' '}
                Gravitational parameters from JPL DE405 ephemeris
              </li>
              <li className='flex items-center gap-2'>
                <Telescope className='h-4 w-4 text-lunary-primary-400 flex-none' />{' '}
                Moon positions via E. W. Brown&apos;s lunar theories
              </li>
              <li className='flex items-center gap-2'>
                <Telescope className='h-4 w-4 text-lunary-primary-400 flex-none' />{' '}
                Pluto validated against TOP2013
              </li>
            </ul>
          </div>

          {/* Authentication */}
          <div className='mb-16 p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
            <h2 className='text-lg font-medium text-content-primary mb-3'>
              Authentication
            </h2>
            <p className='text-sm text-content-muted mb-4'>
              Pass your API key in the{' '}
              <code className='text-content-brand bg-surface-card px-1.5 py-0.5 rounded text-xs'>
                Authorization
              </code>{' '}
              header:
            </p>
            <CodeBlock
              language='http'
              code={`Authorization: Bearer lun_YOUR_API_KEY`}
            />
            <p className='text-xs text-content-muted mt-3'>
              Rate limit headers are included in every response:{' '}
              <code className='text-content-brand'>X-RateLimit-Limit</code>,{' '}
              <code className='text-content-brand'>X-RateLimit-Remaining</code>,{' '}
              <code className='text-content-brand'>
                X-Monthly-Requests-Used
              </code>
              .
            </p>
          </div>

          {/* Base URL */}
          <div className='mb-16 p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
            <h2 className='text-sm font-medium text-content-muted mb-2'>
              Base URL
            </h2>
            <code className='text-content-brand bg-surface-card px-3 py-1.5 rounded text-sm'>
              https://lunary.app/api/v1/astrology
            </code>
          </div>

          {/* Endpoints */}
          <div id='endpoints' className='space-y-6 mb-16'>
            <h2 className='text-2xl font-medium text-content-primary'>
              Endpoints
            </h2>

            {/* Group by tier */}
            {(['free', 'starter', 'developer'] as const).map((tier) => {
              const tierEndpoints = endpoints.filter((e) => e.tier === tier);
              if (tierEndpoints.length === 0) return null;

              return (
                <div key={tier}>
                  <h3 className='text-lg font-medium text-content-primary mb-4 flex items-center gap-2 mt-8'>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${TIER_COLORS[tier]}`}
                    >
                      {tier}
                    </span>
                    <span className='text-content-muted text-sm font-normal'>
                      {tier === 'free' && '7 endpoints, no key required'}
                      {tier === 'starter' && '4 endpoints, $9/mo'}
                      {tier === 'developer' && '4 endpoints, $29/mo'}
                    </span>
                  </h3>

                  <div className='space-y-4'>
                    {tierEndpoints.map((endpoint, index) => (
                      <details
                        key={index}
                        className='group rounded-lg border border-stroke-subtle bg-surface-elevated/50 overflow-hidden'
                      >
                        <summary className='cursor-pointer p-4 hover:bg-layer-base/10 transition-colors list-none'>
                          <div className='flex items-center gap-3'>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${METHOD_COLORS[endpoint.method]}`}
                            >
                              {endpoint.method}
                            </span>
                            <code className='text-content-primary font-mono text-sm flex-1'>
                              {endpoint.path}
                            </code>
                            <span className='text-xs text-content-muted hidden sm:inline'>
                              {endpoint.description.split('.')[0]}
                            </span>
                          </div>
                        </summary>

                        <div className='px-4 pb-4 space-y-4 border-t border-stroke-subtle/50 pt-4'>
                          <p className='text-sm text-content-muted'>
                            {endpoint.description}
                          </p>

                          {endpoint.params && (
                            <div>
                              <h4 className='text-xs font-medium text-content-muted uppercase tracking-wider mb-2'>
                                Parameters
                              </h4>
                              <div className='space-y-1.5'>
                                {endpoint.params.map((param, i) => (
                                  <div
                                    key={i}
                                    className='flex items-center gap-2 text-sm'
                                  >
                                    <code className='text-content-brand bg-surface-card px-2 py-0.5 rounded text-xs'>
                                      {param.name}
                                    </code>
                                    <span className='text-content-muted text-xs'>
                                      {param.type}
                                    </span>
                                    {param.required && (
                                      <span className='text-lunary-error text-xs'>
                                        required
                                      </span>
                                    )}
                                    <span className='text-content-muted text-xs'>
                                      {param.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {endpoint.body && (
                            <div>
                              <h4 className='text-xs font-medium text-content-muted uppercase tracking-wider mb-2'>
                                Request body
                              </h4>
                              <CodeBlock code={endpoint.body} />
                            </div>
                          )}

                          <div>
                            <h4 className='text-xs font-medium text-content-muted uppercase tracking-wider mb-2'>
                              Response
                            </h4>
                            <CodeBlock code={endpoint.response} />
                          </div>

                          <div>
                            <h4 className='text-xs font-medium text-content-muted uppercase tracking-wider mb-2'>
                              Example
                            </h4>
                            <CodeBlock language='bash' code={endpoint.curl} />
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing */}
          <div className='mb-16'>
            <h2 className='text-2xl font-medium text-content-primary mb-6'>
              Pricing
            </h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[
                {
                  name: 'Free',
                  price: '$0',
                  period: '',
                  requests: '100/mo',
                  rate: '10/min',
                  endpoints: '7 endpoints',
                  highlight: false,
                },
                {
                  name: 'Starter',
                  price: '$9',
                  period: '/mo',
                  requests: '5,000/mo',
                  rate: '30/min',
                  endpoints: '11 endpoints',
                  highlight: true,
                },
                {
                  name: 'Developer',
                  price: '$29',
                  period: '/mo',
                  requests: '25,000/mo',
                  rate: '60/min',
                  endpoints: 'All 15 endpoints',
                  highlight: false,
                },
                {
                  name: 'Business',
                  price: '$99',
                  period: '/mo',
                  requests: '100,000/mo',
                  rate: '120/min',
                  endpoints: 'All + SLA',
                  highlight: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-5 rounded-lg border ${plan.highlight ? 'border-lunary-primary-700 bg-layer-base/10' : 'border-stroke-subtle bg-surface-elevated/50'}`}
                >
                  <h3
                    className={`font-medium mb-1 ${plan.highlight ? 'text-content-brand' : 'text-content-primary'}`}
                  >
                    {plan.name}
                  </h3>
                  <p className='text-2xl font-light text-content-primary mb-3'>
                    {plan.price}
                    <span className='text-sm text-content-muted'>
                      {plan.period}
                    </span>
                  </p>
                  <ul className='text-xs text-content-muted space-y-1.5'>
                    <li className='flex items-center gap-1.5'>
                      <Clock className='h-3 w-3' />
                      {plan.requests}
                    </li>
                    <li className='flex items-center gap-1.5'>
                      <Zap className='h-3 w-3' />
                      {plan.rate}
                    </li>
                    <li className='flex items-center gap-1.5'>
                      <Code className='h-3 w-3' />
                      {plan.endpoints}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
            <p className='mt-4 text-sm text-content-muted text-center'>
              <Link
                href='/developers/dashboard'
                className='text-lunary-primary-400 hover:underline'
              >
                Get your API key
              </Link>{' '}
              to get started
            </p>
          </div>

          {/* Use cases */}
          <div className='mb-16'>
            <h2 className='text-2xl font-medium text-content-primary mb-6'>
              Use cases
            </h2>
            <div className='grid md:grid-cols-3 gap-4'>
              <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
                <Star className='h-5 w-5 text-lunary-primary-400 mb-2' />
                <h3 className='text-sm font-medium text-content-primary mb-1'>
                  Astrology apps
                </h3>
                <p className='text-xs text-content-muted'>
                  Power your horoscope app with real astronomical data and birth
                  chart calculations.
                </p>
              </div>
              <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
                <Moon className='h-5 w-5 text-lunary-secondary mb-2' />
                <h3 className='text-sm font-medium text-content-primary mb-1'>
                  Moon widgets
                </h3>
                <p className='text-xs text-content-muted'>
                  Display live moon phase, sign, and illumination on your
                  website or dashboard.
                </p>
              </div>
              <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
                <Sparkles className='h-5 w-5 text-lunary-accent mb-2' />
                <h3 className='text-sm font-medium text-content-primary mb-1'>
                  AI agents and GPTs
                </h3>
                <p className='text-xs text-content-muted'>
                  Give your AI assistant real cosmic awareness with
                  MCP-compatible endpoints.
                </p>
              </div>
              <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
                <Sun className='h-5 w-5 text-lunary-primary-400 mb-2' />
                <h3 className='text-sm font-medium text-content-primary mb-1'>
                  Compatibility tools
                </h3>
                <p className='text-xs text-content-muted'>
                  Build relationship analysis features with synastry and
                  composite chart data.
                </p>
              </div>
              <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
                <BookOpen className='h-5 w-5 text-lunary-success mb-2' />
                <h3 className='text-sm font-medium text-content-primary mb-1'>
                  Educational content
                </h3>
                <p className='text-xs text-content-muted'>
                  Access the 2,000+ entry grimoire for astrology courses, books,
                  and reference apps.
                </p>
              </div>
              <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
                <Globe className='h-5 w-5 text-lunary-secondary mb-2' />
                <h3 className='text-sm font-medium text-content-primary mb-1'>
                  Productivity apps
                </h3>
                <p className='text-xs text-content-muted'>
                  Integrate cosmic timing into planning tools with transit data
                  and moon phases.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className='text-center'>
            <Link
              href='/developers/dashboard'
              className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-600 hover:bg-layer-high text-white font-medium text-lg transition-colors'
            >
              <Key className='h-5 w-5' />
              Get started with the API
            </Link>
            <p className='mt-4 text-sm text-content-muted'>
              Need enterprise limits or custom features?{' '}
              <a
                href='mailto:api@lunary.app'
                className='text-lunary-primary-400 hover:underline'
              >
                api@lunary.app
              </a>
            </p>
          </div>
        </div>
        <MarketingFooter />
      </div>
    </>
  );
}
