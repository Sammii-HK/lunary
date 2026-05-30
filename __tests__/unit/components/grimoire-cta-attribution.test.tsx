/**
 * @jest-environment jsdom
 *
 * Grimoire free-chart CTA attribution (next-build backlog RANK 1).
 *
 * The interpretive grimoire pages (placements, aspect combos, houses,
 * zodiac-in-chart, ...) are Lunary's highest-volume Bing + GEO reach surface and
 * all render their free-chart CTA through the shared SEOContentTemplate. Before
 * this change every caller passed an untagged ctaHref='/birth-chart', so an
 * AI/Bing-referred reader who clicked through was bucketed as "direct" and the
 * per-hub grimoire -> signup conversion was invisible.
 *
 * This pins the measurement-only contract:
 *   1. withGrimoireRef (the template's source-label helper) appends
 *      ?ref=grimoire_<hub> to an internal funnel href, distinguishes the hub,
 *      defaults safely, and never touches external or already-tagged hrefs (so
 *      the copy, position and destination page are unchanged).
 *   2. SEOCTAButton renders the tagged destination and fires trackCtaClick with
 *      the tagged href + hub on click (the click-side telemetry).
 *   3. The grimoire_<hub> ref is recognised by the attribution source-bucketing
 *      keystone (mapUtmToSource) and maps to the "grimoire" channel, NOT
 *      collapsed to direct/undefined - confirming the ref convention rides the
 *      existing first-touch attribution and is not dropped (the bug class PRs
 *      #295/#296/#300 fixed for the other first-party channels).
 *
 * Pure logic + a single rendered client button. No network, no DB.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withGrimoireRef } from '@/lib/grimoire/ctaRef';
import { SEOCTAButton } from '@/components/grimoire/SEOCTAButton';
import { mapUtmToSource } from '@/lib/attribution';

const trackCtaClick = jest.fn();
const trackCtaImpression = jest.fn();

jest.mock('@/lib/analytics', () => ({
  trackCtaClick: (payload: unknown) => trackCtaClick(payload),
  trackCtaImpression: (payload: unknown) => trackCtaImpression(payload),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/grimoire/aspects/sun/conjunction/moon',
}));

// NavParamLink reads search params; stub it to a plain anchor so the button can
// render in isolation without a router/search-params provider.
jest.mock('@/components/NavParamLink', () => ({
  NavParamLink: ({
    href,
    onClick,
    children,
  }: {
    href: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        // Stop jsdom attempting a real navigation (unimplemented) while still
        // exercising the CTA's tracking handler.
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  ),
}));

describe('grimoire CTA - withGrimoireRef source label', () => {
  it('appends ?ref=grimoire_<hub> to an internal free-chart href', () => {
    expect(withGrimoireRef('/birth-chart', 'aspects')).toBe(
      '/birth-chart?ref=grimoire_aspects',
    );
    expect(withGrimoireRef('/birth-chart', 'placements')).toBe(
      '/birth-chart?ref=grimoire_placements',
    );
    // distinguishes sign-in-chart from a bare sign page (both URL-hub "astrology")
    expect(withGrimoireRef('/birth-chart', 'sign_in_chart')).toBe(
      '/birth-chart?ref=grimoire_sign_in_chart',
    );
  });

  it('defaults to grimoire_universal when the hub is missing or blank', () => {
    expect(withGrimoireRef('/birth-chart', '')).toBe(
      '/birth-chart?ref=grimoire_universal',
    );
    expect(withGrimoireRef('/birth-chart', '   ')).toBe(
      '/birth-chart?ref=grimoire_universal',
    );
  });

  it('never tags an external link or an already-parameterised href', () => {
    // external / non-funnel
    expect(withGrimoireRef('https://example.com/x', 'aspects')).toBe(
      'https://example.com/x',
    );
    // already tagged (e.g. the facts UTM CTA) is left exactly as-is
    const factsHref =
      '/birth-chart?utm_source=grimoire&utm_medium=facts&utm_campaign=fact-cta';
    expect(withGrimoireRef(factsHref, 'facts')).toBe(factsHref);
  });
});

describe('grimoire CTA - SEOCTAButton renders the tagged destination + fires tracking', () => {
  beforeEach(() => {
    trackCtaClick.mockClear();
    trackCtaImpression.mockClear();
  });

  it('renders the source-labelled href and fires trackCtaClick with hub + tagged href on click', async () => {
    const taggedHref = withGrimoireRef('/birth-chart', 'aspects');
    render(
      <SEOCTAButton href={taggedHref} label='Get Started' hub='aspects' />,
    );

    const link = screen.getByRole('link', { name: 'Get Started' });
    // The user-visible destination carries the per-hub source label.
    expect(link).toHaveAttribute('href', '/birth-chart?ref=grimoire_aspects');

    await userEvent.click(link);

    await waitFor(() => expect(trackCtaClick).toHaveBeenCalledTimes(1));
    expect(trackCtaClick).toHaveBeenCalledWith(
      expect.objectContaining({
        hub: 'aspects',
        href: '/birth-chart?ref=grimoire_aspects',
        ctaId: 'seo_cta_button',
      }),
    );
  });
});

describe('grimoire CTA - ref is bucketed as the grimoire channel (not dropped)', () => {
  it('maps a grimoire_<hub> ref label to the "grimoire" source bucket', () => {
    // This is the keystone: an internal grimoire -> birth-chart click that DID
    // become first-touch must resolve to "grimoire", not collapse to "direct".
    expect(mapUtmToSource(null, null, 'grimoire_aspects')).toBe('grimoire');
    expect(mapUtmToSource(null, null, 'grimoire_placements')).toBe('grimoire');
    expect(mapUtmToSource(null, null, 'GRIMOIRE_Houses')).toBe('grimoire');
  });

  it('maps utm_source=grimoire (the facts + signup-CTA convention) to "grimoire"', () => {
    expect(mapUtmToSource('grimoire', 'facts', null)).toBe('grimoire');
    expect(mapUtmToSource('grimoire', 'cta', null)).toBe('grimoire');
  });

  it('stays additive: a bare referral code is still not claimed as grimoire', () => {
    expect(mapUtmToSource(null, null, 'bwt')).toBeUndefined();
  });
});
