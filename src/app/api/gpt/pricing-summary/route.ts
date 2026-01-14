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
            'Birth chart overview',
            'Daily moon phases',
            'General tarot card of the day',
            'Basic grimoire access',
            'Cosmic weather overview',
          ],
          limitations: [
            'No personalized insights',
            'Astral Guide limited to 3 messages/day',
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
          limitations: ['Astral Guide limited to 50 messages/day'],
          ctaUrl: 'https://lunary.app/pricing?from=gpt_pricing_plus',
          ctaLabel: 'Start free trial',
        },
        {
          name: 'Lunary+ AI',
          price: 8.99,
          priceCurrency: 'USD',
          interval: 'month',
          features: [
            'Everything in Lunary+',
            'Up to 300 messages/day AI chat + extended context memory',
            'Weekly cosmic reports',
            'Downloadable PDFs',
            'Advanced pattern analysis',
            'Priority support',
          ],
          limitations: [],
          ctaUrl: 'https://lunary.app/pricing?from=gpt_pricing_ai',
          ctaLabel: 'Start free trial',
        },
        {
          name: 'Lunary+ AI Annual',
          price: 89.99,
          priceCurrency: 'USD',
          interval: 'year',
          savings: '17% off monthly price',
          features: [
            'Everything in Lunary+ AI',
            'Billed annually (saves ~17%)',
            'All features unlocked',
          ],
          limitations: [],
          ctaUrl: 'https://lunary.app/pricing?from=gpt_pricing_annual',
          ctaLabel: 'Get Best Value',
        },
      ],
      trialInfo: {
        available: true,
        durationDaysMonthly: 7,
        durationDaysAnnual: 14,
        creditCardRequired: true,
        note: 'Monthly plans include a 7-day trial; annual plans include a 14-day trial. Cancel anytime.',
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
