import { NextRequest, NextResponse } from 'next/server';
import { requireGptAuth } from '@/lib/gptAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const response = {
      plans: [
        {
          name: 'Free',
          price: 0,
          priceCurrency: 'USD',
          interval: null,
          features: [
            'Daily moon phases',
            'General tarot card of the day',
            'Basic grimoire access',
            'Cosmic weather overview',
          ],
          limitations: [
            'No personalized insights',
            'No birth chart analysis',
            'No AI chat',
          ],
          ctaUrl: 'https://lunary.app/welcome?from=gpt_pricing_free',
          ctaLabel: 'Get Started Free',
        },
        {
          name: 'Lunary+',
          price: 4.99,
          priceCurrency: 'USD',
          interval: 'month',
          features: [
            'Complete birth chart analysis',
            'Personalized daily horoscopes',
            'Personal transit impacts',
            'Moon circle rituals',
            'Crystal recommendations',
            'Tarot readings with patterns',
          ],
          limitations: ['Limited AI chat messages'],
          ctaUrl: 'https://lunary.app/pricing?from=gpt_pricing_plus',
          ctaLabel: 'Start 7-Day Trial',
        },
        {
          name: 'Lunary+ AI',
          price: 7.99,
          priceCurrency: 'USD',
          interval: 'month',
          features: [
            'Everything in Lunary+',
            'Effectively unlimited AI chat and saved threads',
            'Weekly cosmic reports',
            'Downloadable PDFs',
            'Advanced pattern analysis',
            'Priority support',
          ],
          limitations: [],
          ctaUrl: 'https://lunary.app/pricing?from=gpt_pricing_ai',
          ctaLabel: 'Start 7-Day Trial',
        },
        {
          name: 'Lunary+ AI Annual',
          price: 71.99,
          priceCurrency: 'USD',
          interval: 'year',
          savings: '25% off monthly price',
          features: [
            'Everything in Lunary+ AI',
            'Billed annually (saves ~$24/year)',
            'All features unlocked',
          ],
          limitations: [],
          ctaUrl: 'https://lunary.app/pricing?from=gpt_pricing_annual',
          ctaLabel: 'Get Best Value',
        },
      ],
      trialInfo: {
        available: true,
        durationDays: 7,
        creditCardRequired: true,
        note: 'Free 7-day trial on all paid plans. Cancel anytime.',
      },
      lastUpdated: new Date().toISOString().split('T')[0],
      ctaUrl: 'https://lunary.app/pricing?from=gpt_pricing_summary',
      ctaText: 'Compare all plans and features',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('GPT pricing-summary error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve pricing information' },
      { status: 500 },
    );
  }
}
