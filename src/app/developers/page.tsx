import { Metadata } from 'next';
import Link from 'next/link';
import { Code, Zap, Moon, Star, Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lunary API Documentation - Cosmic Data for Developers',
  description:
    'Lunary API documentation for developers. Access astronomical data, moon phases, planetary positions, and astrological calculations. Free endpoints for cosmic data.',
  openGraph: {
    title: 'Lunary API Documentation - Cosmic Data for Developers',
    description:
      'Access astronomical data, moon phases, and astrological calculations via the Lunary API.',
    url: 'https://lunary.app/developers',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/developers',
  },
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
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 rounded-lg bg-purple-500/20'>
              <Code className='h-6 w-6 text-purple-400' />
            </div>
            <span className='text-sm text-purple-400 font-medium'>
              Developer Documentation
            </span>
          </div>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary Cosmic API
          </h1>
          <p className='text-lg text-zinc-400'>
            Access astronomical data, moon phases, and astrological calculations
            via our free API endpoints. Perfect for building cosmic-aware
            applications.
          </p>
        </div>

        {/* Features */}
        <div className='grid md:grid-cols-3 gap-4 mb-12'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Zap className='h-6 w-6 text-amber-400 mb-3' />
            <h3 className='font-medium text-zinc-100 mb-1'>Fast & Reliable</h3>
            <p className='text-sm text-zinc-400'>
              Edge-deployed for low latency worldwide
            </p>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Moon className='h-6 w-6 text-blue-400 mb-3' />
            <h3 className='font-medium text-zinc-100 mb-1'>Real Astronomy</h3>
            <p className='text-sm text-zinc-400'>
              Based on actual astronomical calculations
            </p>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Sparkles className='h-6 w-6 text-purple-400 mb-3' />
            <h3 className='font-medium text-zinc-100 mb-1'>Free Tier</h3>
            <p className='text-sm text-zinc-400'>
              Core endpoints available without authentication
            </p>
          </div>
        </div>

        {/* Base URL */}
        <div className='mb-12 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
          <h2 className='text-sm font-medium text-zinc-400 mb-2'>Base URL</h2>
          <code className='text-purple-300 bg-zinc-800 px-3 py-1.5 rounded text-sm'>
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
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className='text-zinc-100 font-mono text-sm'>
                  {endpoint.path}
                </code>
                {endpoint.free && (
                  <span className='px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300'>
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
                      <div key={i} className='flex items-center gap-2 text-sm'>
                        <code className='text-purple-300 bg-zinc-800 px-2 py-0.5 rounded'>
                          {param.name}
                        </code>
                        <span className='text-zinc-500'>{param.type}</span>
                        {param.required && (
                          <span className='text-red-400 text-xs'>required</span>
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

        {/* Rate Limits */}
        <div className='mt-12 p-6 rounded-lg border border-amber-500/30 bg-amber-500/10'>
          <h2 className='text-lg font-medium text-amber-300 mb-2'>
            Rate Limits
          </h2>
          <p className='text-zinc-300 text-sm'>
            Free tier endpoints are rate-limited to 100 requests per minute per
            IP. For higher limits and additional endpoints, please{' '}
            <Link href='/contact' className='text-purple-400 hover:underline'>
              contact us
            </Link>{' '}
            about API partnerships.
          </p>
        </div>

        {/* Use Cases */}
        <div className='mt-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>Use Cases</h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
              <Star className='h-5 w-5 text-purple-400 mb-2' />
              <h3 className='font-medium text-zinc-100 mb-1'>
                ChatGPT Plugins
              </h3>
              <p className='text-sm text-zinc-400'>
                Build GPT Actions that provide cosmic insights to users
              </p>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
              <Moon className='h-5 w-5 text-blue-400 mb-2' />
              <h3 className='font-medium text-zinc-100 mb-1'>Moon Widgets</h3>
              <p className='text-sm text-zinc-400'>
                Display current moon phase on your website or app
              </p>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
              <Sparkles className='h-5 w-5 text-amber-400 mb-2' />
              <h3 className='font-medium text-zinc-100 mb-1'>
                Daily Horoscopes
              </h3>
              <p className='text-sm text-zinc-400'>
                Integrate cosmic weather into your daily briefings
              </p>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
              <Code className='h-5 w-5 text-green-400 mb-2' />
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
            href='/welcome'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium text-lg transition-colors'
          >
            Try Lunary App
            <ArrowRight className='h-5 w-5' />
          </Link>
          <p className='mt-4 text-sm text-zinc-500'>
            Questions? Reach out at{' '}
            <a
              href='mailto:api@lunary.app'
              className='text-purple-400 hover:underline'
            >
              api@lunary.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
