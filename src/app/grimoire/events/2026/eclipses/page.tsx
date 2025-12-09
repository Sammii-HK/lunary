import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title:
    '2026 Eclipses: Solar & Lunar Eclipse Dates, Meaning & Rituals | Lunary',
  description:
    'Complete guide to 2026 eclipses including solar and lunar eclipse dates, astrological meanings, and rituals. Learn how eclipse season affects your life.',
  keywords: [
    '2026 eclipses',
    'solar eclipse 2026',
    'lunar eclipse 2026',
    '2026 eclipse dates',
    'eclipse astrology 2026',
    'eclipse rituals',
  ],
  openGraph: {
    title: '2026 Eclipses | Lunary',
    description: 'Complete guide to solar and lunar eclipses in 2026.',
    images: ['/api/og/cosmic?title=2026%20Eclipses'],
  },
};

export default function Eclipses2026Page() {
  return (
    <SEOContentTemplate
      title='2026 Eclipses'
      h1='2026 Eclipses: Transformation & New Beginnings'
      description='Navigate the powerful eclipse energies of 2026. Learn the dates, astrological meanings, and how to work with eclipse season for personal transformation.'
      keywords={[
        '2026 eclipses',
        'solar eclipse',
        'lunar eclipse',
        'eclipse season',
        'astrology',
        'transformation',
      ]}
      canonicalUrl='https://lunary.app/grimoire/events/2026/eclipses'
      datePublished='2025-12-01'
      dateModified='2025-12-06'
      articleSection='Astrological Events'
      whatIs={{
        question: 'What are the 2026 eclipse dates?',
        answer:
          '2026 features four eclipses across two eclipse seasons. The first eclipse season occurs in late winter/early spring, and the second in late summer/fall. Eclipses are powerful turning points that accelerate change and bring fated events into our lives.',
      }}
      tldr='The 2026 eclipses bring major life shifts and turning points. Eclipse energy is potent—avoid major manifestation rituals during eclipses and instead surrender to the changes unfolding. These are times of release (lunar eclipses) and new beginnings (solar eclipses) happening on cosmic timing.'
      meaning={`Eclipses in 2026 mark pivotal moments of change and transformation. Unlike regular full and new moons, eclipses operate on a different level—they bring sudden shifts, revelations, and fated events that align us with our soul's path.

Solar Eclipses (New Moons amplified):
• Powerful new beginnings and fresh starts
• Unexpected opportunities emerging
• Doors opening that were previously closed
• Setting intentions that manifest over 6 months

Lunar Eclipses (Full Moons amplified):
• Culminations and endings
• Emotional revelations and breakthroughs
• Releasing what no longer serves you
• Truth coming to light

The 2026 eclipses continue shifting the lunar nodes through new signs, activating different areas of your birth chart for major life lessons and evolution.`}
      tables={[
        {
          title: '2026 Eclipse Calendar',
          headers: ['Date', 'Type', 'Sign', 'Theme'],
          rows: [
            [
              'February 2026',
              'Lunar Eclipse',
              'Virgo',
              'Release & Purification',
            ],
            [
              'March 2026',
              'Solar Eclipse',
              'Pisces',
              'Spiritual New Beginnings',
            ],
            ['August 2026', 'Lunar Eclipse', 'Pisces', 'Emotional Completion'],
            [
              'September 2026',
              'Solar Eclipse',
              'Virgo',
              'New Health & Work Cycles',
            ],
          ],
        },
      ]}
      howToWorkWith={[
        'Avoid performing major manifestation rituals during the eclipse itself',
        'Surrender to the changes unfolding rather than forcing outcomes',
        'Journal about what needs to be released (lunar) or begun (solar)',
        'Rest and reflect during eclipse energy—it can be draining',
        'Pay attention to themes that emerge within 2 weeks of each eclipse',
        'Note which houses the eclipses activate in your birth chart',
        'Trust that changes happening are aligned with your highest path',
      ]}
      emotionalThemes={[
        'Sudden realizations and "aha" moments',
        'Feeling ungrounded or disoriented',
        'Intense dreams and intuitive downloads',
        'Fatigue and need for extra rest',
        'Endings that feel fated or destined',
        'New paths opening unexpectedly',
      ]}
      signsMostAffected={['Virgo', 'Pisces', 'Gemini', 'Sagittarius']}
      faqs={[
        {
          question: 'Can I manifest during an eclipse?',
          answer:
            'Traditional wisdom advises against active manifestation during eclipses, as the energy is too volatile and unpredictable. Instead, observe what emerges and set intentions in the weeks following the eclipse when energy has stabilized.',
        },
        {
          question: 'How long do eclipse effects last?',
          answer:
            'Eclipse effects can unfold over 6 months until the next eclipse in that sign. Major shifts often happen within 2 weeks of the eclipse, but the full story reveals itself over several months. Look back at what was activated 6 months later for the complete picture.',
        },
        {
          question: 'Why do I feel tired during eclipses?',
          answer:
            'Eclipses involve powerful cosmic energy shifts that can be physically and emotionally draining. The Sun (vitality) or Moon (emotions) is being blocked, which affects our energy. Rest as needed and avoid over-scheduling during eclipse windows.',
        },
      ]}
      relatedItems={[
        {
          name: 'Moon in Astrology',
          href: '/grimoire/astronomy/planets/moon',
          type: 'Planet',
        },
        {
          name: 'Sun in Astrology',
          href: '/grimoire/astronomy/planets/sun',
          type: 'Planet',
        },
        {
          name: 'Moon Rituals',
          href: '/grimoire/moon-rituals',
          type: 'Ritual',
        },
        {
          name: '2025 Eclipses',
          href: '/grimoire/events/2025/eclipses',
          type: 'Event',
        },
      ]}
      ctaText='See how 2026 eclipses affect your birth chart'
      ctaHref='/welcome?from=eclipses-2026'
      sources={[
        { name: 'NASA Eclipse Data', url: 'https://eclipse.gsfc.nasa.gov/' },
        { name: 'Traditional astrological texts' },
      ]}
    />
  );
}
