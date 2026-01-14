import { Fragment } from 'react';
import { Metadata } from 'next';

import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const pageTitle = 'About Lunary';
const pageDescription =
  'Lunary is a chart-first astrology platform that layers precise astronomy, tarots, and rituals onto your natal chart, keeping every insight grounded in your birth map.';
const canonicalUrl = 'https://lunary.app/about/lunary';

export const metadata: Metadata = {
  title: `${pageTitle} | Chart-First Astrology`,
  description: pageDescription,
  alternates: {
    canonical: canonicalUrl,
  },
};

const keywords = [
  'chart-first astrology',
  'personalized astrology',
  'real astronomy',
  'birth chart insights',
  'lunar tracking',
];

type Section = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

const sections: Section[] = [
  {
    id: 'philosophy',
    heading: 'Astrology as a system, not fragments',
    paragraphs: [
      'Lunary is built on the idea that astrology only makes sense when it is treated as a coherent system. In traditional practice, nothing exists in isolation. A transit, a lunar phase, or a symbolic insight only gains meaning when understood in context.',
      'Lunary begins from this principle, designing everything around connection rather than separation.',
    ],
  },
  {
    id: 'method',
    heading: 'The birth chart as the reference point',
    paragraphs: [
      'Every insight in Lunary starts with the full birth chart. Rather than generating generic interpretations and adjusting them later, the natal chart is used as the reference point from the beginning.',
      'Real-time planetary movement is mapped directly onto those placements, so timing, emphasis, and meaning are always personal to the individual.',
    ],
  },
  {
    id: 'scope',
    heading: 'Multiple systems, one framework',
    paragraphs: [
      'Astrology, tarot, lunar cycles, ritual timing, and symbolic practice are not treated as separate tools. They function as different lenses applied to the same underlying chart.',
      'Tarot becomes a reflective layer rather than a standalone message. Lunar phases become timing cues rather than instructions. Each system reinforces the others instead of competing for attention.',
    ],
  },
  {
    id: 'result',
    heading: 'Insight that evolves over time',
    paragraphs: [
      'Because Lunary is chart-first, insight evolves rather than resets. As transits unfold, cycles repeat, and life circumstances change, interpretations adjust naturally.',
      'This allows patterns to emerge gradually, supporting long-term understanding instead of momentary answers.',
    ],
  },
  {
    id: 'positioning',
    heading: 'Designed for depth, not demand',
    paragraphs: [
      'Lunary is designed for people who want astrology to deepen with use, not deliver answers on demand.',
      'It supports reflection, pattern recognition, and timing awareness rather than prediction or urgency.',
    ],
  },
];

const summaryLine =
  'Lunary is built for long-term, chart-based understanding, with optional deeper personalisation for those who want to explore further.';

export default function AboutLunaryPage() {
  const tableOfContents = sections.map((section) => ({
    label: section.heading,
    href: `#${section.id}`,
  }));

  const sectionNodes = sections.map((section, sectionIndex) => (
    <Fragment key={section.id}>
      <section id={section.id} className='space-y-4'>
        <h2 className='text-2xl font-medium text-zinc-100'>
          {section.heading}
        </h2>
        {section.paragraphs.map((paragraph, index) => (
          <p
            key={`${section.id}-p-${index}`}
            className='text-zinc-300 leading-relaxed'
          >
            {paragraph}
          </p>
        ))}
        {section.bullets && (
          <ul className='space-y-2'>
            {section.bullets.map((bullet, bulletIndex) => (
              <li
                key={`${section.id}-bullet-${bulletIndex}`}
                className='flex items-start gap-3 text-zinc-300'
              >
                <span className='text-lunary-accent mt-1'>•</span>
                <span className='break-words'>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {sectionIndex < sections.length - 1 && (
        <div className='flex justify-center text-sm text-zinc-500'>⸻</div>
      )}
    </Fragment>
  ));

  return (
    <SEOContentTemplate
      title='About Lunary | Chart-First Astrology'
      h1='About Lunary'
      description='Get to know Lunary’s chart-first approach, how precise astronomy drives every insight, and why the platform is built for long-term practice.'
      canonicalUrl={canonicalUrl}
      keywords={keywords}
      tableOfContents={tableOfContents}
      whatIs={{
        question: 'What makes Lunary different?',
        answer:
          'Everything starts with your full natal chart, then we map real-time planetary motion onto those placements so every forecast, lunar phase, and tarot insight is personal first.',
      }}
    >
      <div className='space-y-8'>
        {sectionNodes}
        <p className='text-center text-sm text-zinc-500'>{summaryLine}</p>
      </div>
    </SEOContentTemplate>
  );
}
