import { Metadata } from 'next';
import Link from 'next/link';
import { Code, Zap, Moon, Star, Sparkles, ArrowRight, Key } from 'lucide-react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Lunary API - Astrology & Moon Phase Data for Developers',
  description:
    'Free astrology API for developers. Access moon phases, planetary transits, birth chart calculations, tarot readings, and horoscope data. RESTful JSON endpoints with real astronomical data.',
  keywords: [
    'astrology API',
    'moon phase API',
    'horoscope API',
    'zodiac API',
    'birth chart API',
    'planetary transits API',
    'tarot API',
    'free astrology API',
    'cosmic data API',
    'astronomical API',
    'developer API astrology',
  ],
  openGraph: {
    title: 'Lunary API - Astrology & Moon Phase Data for Developers',
    description:
      'Free API for moon phases, planetary transits, birth charts, and horoscope data. Build cosmic-aware applications with real astronomical calculations.',
    url: 'https://lunary.app/developers',
    siteName: 'Lunary',
    type: 'website',
    images: ['/api/og/cosmic?title=Lunary%20API%20for%20Developers'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary API - Astrology & Moon Phase Data for Developers',
    description:
      'Free API for moon phases, planetary transits, and horoscope data.',
  },
  alternates: {
    canonical: 'https://lunary.app/developers',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebAPI',
      name: 'Lunary Cosmic API',
      description:
        'RESTful API providing astronomical data, moon phases, planetary transits, birth chart calculations, tarot readings, and horoscope information.',
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
      name: 'Lunary API',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Tier',
          price: '0',
          priceCurrency: 'USD',
          description: '100 requests per month, basic endpoints',
        },
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '9',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '9',
            priceCurrency: 'USD',
            billingDuration: 'P1M',
          },
          description: '5,000 requests per month, all endpoints',
        },
        {
          '@type': 'Offer',
          name: 'Developer',
          price: '29',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '29',
            priceCurrency: 'USD',
            billingDuration: 'P1M',
          },
          description: '25,000 requests per month, priority support',
        },
        {
          '@type': 'Offer',
          name: 'Business',
          price: '99',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '99',
            priceCurrency: 'USD',
            billingDuration: 'P1M',
          },
          description:
            '100,000 requests per month, webhooks, dedicated support',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the Lunary API free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Lunary offers a free tier with 100 requests per month. Paid plans start at $9/month for higher limits and additional features.',
          },
        },
        {
          '@type': 'Question',
          name: 'What data does the Lunary API provide?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Lunary API provides moon phases, planetary transits, birth chart calculations, tarot readings, ritual suggestions, and horoscope data based on real astronomical calculations.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need an API key?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Free tier endpoints are available without authentication. Paid tiers require an API key for access to higher rate limits and additional endpoints.',
          },
        },
      ],
    },
  ],
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/gpt/cosmic-today',
    description: "Get today's cosmic weather, moon phase, and key transits",
    response: `{
  "date": "2025-01-15",
  "headline": "Moon in Taurus: Ground your energy",
  "moonPhase": {
    "name": "Waxing Gibbous",
    "emoji": "🌔",
    "sign": "Taurus",
    "illumination": 78
  },
  "keyTransits": [...],
  "ctaUrl": "https://lunary.app"
}`,
    free: true,
  },
  {
    method: 'GET',
    path: '/api/gpt/pricing-summary',
    description: 'Get current Lunary pricing tiers and features',
    response: `{
  "plans": [
    { "name": "Free", "price": 0, "features": [...] },
    { "name": "Lunary+", "price": 4.99, "features": [...] }
  ]
}`,
    free: true,
  },
  {
    method: 'GET',
    path: '/api/gpt/grimoire/search',
    description: 'Search the Lunary grimoire for cosmic knowledge',
    params: [
      {
        name: 'q',
        type: 'string',
        required: true,
        description: 'Search query',
      },
    ],
    response: `{
  "query": "mercury retrograde",
  "results": [
    {
      "slug": "astronomy/planets/mercury",
      "title": "Mercury in Astrology",
      "summary": "...",
      "url": "https://lunary.app/grimoire/..."
    }
  ]
}`,
    free: true,
  },
  {
    method: 'POST',
    path: '/api/gpt/tarot/daily',
    description: 'Draw a daily tarot card with interpretation',
    body: `{ "intent": "guidance" }`,
    response: `{
  "cardName": "The Star",
  "meaning": "Hope, inspiration, and renewed faith...",
  "advice": "Trust in the process...",
  "ctaUrl": "https://lunary.app/tarot"
}`,
    free: true,
  },
  {
    method: 'POST',
    path: '/api/gpt/ritual/suggest',
    description: 'Get ritual suggestions based on intent and moon phase',
    body: `{ "intent": "abundance", "moonPhase": "new" }`,
    response: `{
  "ritualName": "New Moon Abundance Ritual",
  "description": "A ritual for setting abundance intentions...",
  "steps": [...],
  "ctaUrl": "https://lunary.app/rituals"
}`,
    free: true,
  },
  {
    method: 'POST',
    path: '/api/gpt/birth-chart-summary',
    description: 'Get a quick birth chart flavor summary',
    body: `{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthLocation": "New York, NY"
}`,
    response: `{
  "sun": { "sign": "Taurus", "house": 10 },
  "moon": { "sign": "Pisces", "house": 8 },
  "rising": { "sign": "Leo" },
  "summary": "Your chart reveals...",
  "ctaUrl": "https://lunary.app/birth-chart"
}`,
    free: true,
  },
];

export default function DevelopersPage() {
  return (
    <>
      <Script
        id='developers-structured-data'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className='min-h-screen bg-zinc-950 text-zinc-100'>
        <div className='max-w-4xl mx-auto px-4 py-12'>
          {/* Header */}
          <div className='mb-12'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2 rounded-lg bg-lunary-primary-900/20'>
                <Code className='h-6 w-6 text-lunary-primary-400' />
              </div>
              <span className='text-sm text-lunary-primary-400 font-medium'>
                Developer Documentation
              </span>
            </div>
            <h1 className='text-4xl font-light text-zinc-100 mb-4'>
              Lunary Cosmic API
            </h1>
            <p className='text-lg text-zinc-400 mb-6'>
              Access astronomical data, moon phases, and astrological
              calculations via our free API endpoints. Perfect for building
              cosmic-aware applications.
            </p>
            <Link
              href='/developers/dashboard'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
            >
              <Key className='h-5 w-5' />
              Get Your API Key
            </Link>
          </div>

          {/* Features */}
          <div className='grid md:grid-cols-3 gap-4 mb-12'>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
              <Zap className='h-6 w-6 text-lunary-accent mb-3' />
              <h3 className='font-medium text-zinc-100 mb-1'>
                Fast & Reliable
              </h3>
              <p className='text-sm text-zinc-400'>
                Edge-deployed for low latency worldwide
              </p>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
              <Moon className='h-6 w-6 text-lunary-secondary mb-3' />
              <h3 className='font-medium text-zinc-100 mb-1'>Real Astronomy</h3>
              <p className='text-sm text-zinc-400'>
                Based on actual astronomical calculations
              </p>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
              <Sparkles className='h-6 w-6 text-lunary-primary-400 mb-3' />
              <h3 className='font-medium text-zinc-100 mb-1'>Free Tier</h3>
              <p className='text-sm text-zinc-400'>
                Core endpoints available without authentication
              </p>
            </div>
          </div>

          {/* Base URL */}
          <div className='mb-12 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <h2 className='text-sm font-medium text-zinc-400 mb-2'>Base URL</h2>
            <code className='text-lunary-primary-300 bg-zinc-800 px-3 py-1.5 rounded text-sm'>
              https://lunary.app
            </code>
          </div>

          {/* Endpoints */}
          <div className='space-y-8'>
            <h2 className='text-2xl font-medium text-zinc-100'>Endpoints</h2>

            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-center gap-3 mb-4'>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.method === 'GET'
                        ? 'bg-lunary-success-900 text-lunary-success'
                        : 'bg-lunary-secondary-900 text-lunary-secondary'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <code className='text-zinc-100 font-mono text-sm'>
                    {endpoint.path}
                  </code>
                  {endpoint.free && (
                    <span className='px-2 py-1 rounded text-xs bg-lunary-primary-900/20 text-lunary-primary-300'>
                      Free
                    </span>
                  )}
                </div>

                <p className='text-zinc-400 text-sm mb-4'>
                  {endpoint.description}
                </p>

                {endpoint.params && (
                  <div className='mb-4'>
                    <h4 className='text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2'>
                      Parameters
                    </h4>
                    <div className='space-y-2'>
                      {endpoint.params.map((param, i) => (
                        <div
                          key={i}
                          className='flex items-center gap-2 text-sm'
                        >
                          <code className='text-lunary-primary-300 bg-zinc-800 px-2 py-0.5 rounded'>
                            {param.name}
                          </code>
                          <span className='text-zinc-500'>{param.type}</span>
                          {param.required && (
                            <span className='text-lunary-error text-xs'>
                              required
                            </span>
                          )}
                          <span className='text-zinc-400'>
                            — {param.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {endpoint.body && (
                  <div className='mb-4'>
                    <h4 className='text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2'>
                      Request Body
                    </h4>
                    <pre className='text-sm bg-zinc-800 p-3 rounded overflow-x-auto'>
                      <code className='text-zinc-300'>{endpoint.body}</code>
                    </pre>
                  </div>
                )}

                <div>
                  <h4 className='text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2'>
                    Response
                  </h4>
                  <pre className='text-sm bg-zinc-800 p-3 rounded overflow-x-auto'>
                    <code className='text-zinc-300'>{endpoint.response}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Tiers */}
          <div className='mt-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              API Pricing
            </h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='p-5 rounded-lg border border-zinc-800 bg-zinc-900/50'>
                <h3 className='font-medium text-zinc-100 mb-1'>Free</h3>
                <p className='text-2xl font-light text-zinc-100 mb-2'>$0</p>
                <p className='text-sm text-zinc-400 mb-3'>100 requests/month</p>
                <ul className='text-xs text-zinc-500 space-y-1'>
                  <li>• Basic endpoints only</li>
                  <li>• No API key required</li>
                </ul>
              </div>
              <div className='p-5 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
                <h3 className='font-medium text-lunary-primary-300 mb-1'>
                  Starter
                </h3>
                <p className='text-2xl font-light text-zinc-100 mb-2'>
                  $9<span className='text-sm text-zinc-400'>/mo</span>
                </p>
                <p className='text-sm text-zinc-400 mb-3'>
                  5,000 requests/month
                </p>
                <ul className='text-xs text-zinc-500 space-y-1'>
                  <li>• All endpoints</li>
                  <li>• API key access</li>
                </ul>
              </div>
              <div className='p-5 rounded-lg border border-zinc-800 bg-zinc-900/50'>
                <h3 className='font-medium text-zinc-100 mb-1'>Developer</h3>
                <p className='text-2xl font-light text-zinc-100 mb-2'>
                  $29<span className='text-sm text-zinc-400'>/mo</span>
                </p>
                <p className='text-sm text-zinc-400 mb-3'>
                  25,000 requests/month
                </p>
                <ul className='text-xs text-zinc-500 space-y-1'>
                  <li>• Priority support</li>
                  <li>• Higher rate limits</li>
                </ul>
              </div>
              <div className='p-5 rounded-lg border border-zinc-800 bg-zinc-900/50'>
                <h3 className='font-medium text-zinc-100 mb-1'>Business</h3>
                <p className='text-2xl font-light text-zinc-100 mb-2'>
                  $99<span className='text-sm text-zinc-400'>/mo</span>
                </p>
                <p className='text-sm text-zinc-400 mb-3'>
                  100,000 requests/month
                </p>
                <ul className='text-xs text-zinc-500 space-y-1'>
                  <li>• Webhooks</li>
                  <li>• Dedicated support</li>
                </ul>
              </div>
            </div>
            <p className='mt-4 text-sm text-zinc-500 text-center'>
              <Link
                href='/developers/dashboard'
                className='text-lunary-primary-400 hover:underline'
              >
                Get your API key
              </Link>{' '}
              to upgrade your plan
            </p>
          </div>

          {/* Use Cases */}
          <div className='mt-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Use Cases
            </h2>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
                <Star className='h-5 w-5 text-lunary-primary-400 mb-2' />
                <h3 className='font-medium text-zinc-100 mb-1'>
                  ChatGPT Plugins
                </h3>
                <p className='text-sm text-zinc-400'>
                  Build GPT Actions that provide cosmic insights to users
                </p>
              </div>
              <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
                <Moon className='h-5 w-5 text-lunary-secondary mb-2' />
                <h3 className='font-medium text-zinc-100 mb-1'>Moon Widgets</h3>
                <p className='text-sm text-zinc-400'>
                  Display current moon phase on your website or app
                </p>
              </div>
              <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
                <Sparkles className='h-5 w-5 text-lunary-accent mb-2' />
                <h3 className='font-medium text-zinc-100 mb-1'>
                  Daily Horoscopes
                </h3>
                <p className='text-sm text-zinc-400'>
                  Integrate cosmic weather into your daily briefings
                </p>
              </div>
              <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
                <Code className='h-5 w-5 text-lunary-success mb-2' />
                <h3 className='font-medium text-zinc-100 mb-1'>
                  Productivity Apps
                </h3>
                <p className='text-sm text-zinc-400'>
                  Sync tasks with moon phases for cosmic productivity
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className='mt-12 text-center'>
            <Link
              href='/developers/dashboard'
              className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white font-medium text-lg transition-colors'
            >
              <Key className='h-5 w-5' />
              Get Started with the API
            </Link>
            <p className='mt-4 text-sm text-zinc-500'>
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
      </div>
    </>
  );
}
