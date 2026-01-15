import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ZODIAC_CUSPS,
  getCuspData,
  generateAllCuspParams,
  CuspId,
} from '@/constants/seo/cusps';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export async function generateStaticParams() {
  return generateAllCuspParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cusp: string }>;
}): Promise<Metadata> {
  const { cusp } = await params;

  const cuspInfo = ZODIAC_CUSPS.find((c) => c.id === cusp);
  if (!cuspInfo) {
    return { title: 'Cusp Not Found | Lunary' };
  }

  const data = getCuspData(cusp as CuspId);

  const title = `${data.sign1}-${data.sign2} Cusp: The ${data.name} (${data.dates}) | Lunary`;
  const description = `Born on the ${data.sign1}-${data.sign2} cusp? The ${data.name} combines ${data.element1} and ${data.element2} energy. Discover your unique cusp personality, traits, and compatibility.`;

  return {
    title,
    description,
    keywords: [
      `${data.sign1.toLowerCase()} ${data.sign2.toLowerCase()} cusp`,
      `born on ${data.sign1.toLowerCase()} ${data.sign2.toLowerCase()} cusp`,
      data.name.toLowerCase(),
      `${data.dates} birthday`,
      'zodiac cusp',
      'cusp personality',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/cusps/${cusp}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/cusps/${cusp}`,
    },
  };
}

export default async function CuspPage({
  params,
}: {
  params: Promise<{ cusp: string }>;
}) {
  const { cusp } = await params;

  const cuspInfo = ZODIAC_CUSPS.find((c) => c.id === cusp);
  if (!cuspInfo) {
    notFound();
  }

  const data = getCuspData(cusp as CuspId);

  const faqs = [
    {
      question: `What is the ${data.sign1}-${data.sign2} cusp?`,
      answer: `The ${data.sign1}-${data.sign2} cusp, known as the ${data.name}, occurs between ${data.dates}. Those born on this cusp blend ${data.sign1}'s ${data.element1} energy with ${data.sign2}'s ${data.element2} qualities.`,
    },
    {
      question: 'Are cusps real in astrology?',
      answer:
        'Cusps are a popular way to describe people born near a sign change, but your exact Sun sign is determined by the Sun’s precise degree. Many astrologers use cusps as a descriptive layer while relying on the full birth chart for accuracy.',
    },
    {
      question: `What are ${data.name} personality traits?`,
      answer: `People born on the ${data.name} cusp tend to be ${data.traits.slice(0, 4).join(', ').toLowerCase()}.`,
    },
    {
      question: `What are the strengths of ${data.name} cusp?`,
      answer: `${data.name} cusp strengths include ${data.strengths.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `What are the challenges for ${data.name} cusp?`,
      answer: `${data.name} cusp challenges include ${data.challenges.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `Who is ${data.name} cusp compatible with?`,
      answer: `${data.name} cusp is most compatible with ${data.compatibility.slice(0, 3).join(', ')}.`,
    },
    {
      question: 'Can I have both signs as my Sun sign?',
      answer:
        'No. The Sun is in one sign at your exact birth time. You can still feel both signs strongly if your chart has placements in each sign or if you were born near the boundary.',
    },
  ];

  return (
    <SEOContentTemplate
      title={`${data.sign1}-${data.sign2} Cusp: The ${data.name}`}
      h1={`The ${data.name}: ${data.sign1}-${data.sign2} Cusp`}
      description={data.description}
      keywords={[`${data.sign1} ${data.sign2} cusp`, data.name, ...data.traits]}
      canonicalUrl={`https://lunary.app/grimoire/cusps/${cusp}`}
      intro={`The ${data.name} cusp blends ${data.sign1} and ${data.sign2} into a single, layered personality. If you were born between ${data.dates}, you may carry traits from both signs, which can feel like living in two elements at once. This guide explains what makes your cusp distinct and how to work with that dual energy in relationships, career, and self-growth.`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Zodiac Cusps'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Cusps', href: '/grimoire/cusps' },
        { label: `${data.sign1}-${data.sign2} Cusp` },
      ]}
      whatIs={{
        question: `What is the ${data.sign1}-${data.sign2} cusp?`,
        answer: `The ${data.sign1}-${data.sign2} cusp, known as the ${data.name}, occurs between ${data.dates}. Those born on this cusp blend ${data.sign1}'s ${data.element1} energy with ${data.sign2}'s ${data.element2} qualities, creating a unique and dynamic personality.`,
      }}
      tldr={`${data.sign1}-${data.sign2} Cusp (${data.dates}): The ${data.name}. Elements: ${data.element1} + ${data.element2}. Key traits: ${data.traits.slice(0, 3).join(', ')}.`}
      meaning={`
## The ${data.name}

${data.description}

### Birth Dates

Those born between ${data.dates} may identify with this cusp.

### Elemental Blend

The ${data.sign1}-${data.sign2} cusp uniquely blends ${data.element1} and ${data.element2} energy:
- ${data.sign1}: ${data.element1} sign - ${data.element1 === 'Fire' ? 'passion, action, initiative' : data.element1 === 'Earth' ? 'stability, practicality, grounding' : data.element1 === 'Air' ? 'intellect, communication, ideas' : 'emotion, intuition, depth'}
- ${data.sign2}: ${data.element2} sign - ${data.element2 === 'Fire' ? 'passion, action, initiative' : data.element2 === 'Earth' ? 'stability, practicality, grounding' : data.element2 === 'Air' ? 'intellect, communication, ideas' : 'emotion, intuition, depth'}

### Core Traits

People born on this cusp tend to be: ${data.traits.join(', ')}.

### Strengths

${data.strengths.map((s) => `- ${s}`).join('\n')}

### Challenges

${data.challenges.map((c) => `- ${c}`).join('\n')}

### Famous People Born on This Cusp

${data.celebrities.join(', ')}

### Are You Truly a Cusp?

Astrologers differ on how strongly cusps apply. Your exact birth time determines which sign your Sun is actually in. If you were born very near the boundary, you may feel both energies, but your full birth chart (Moon, Rising, and planetary placements) adds far more nuance than the Sun sign alone.

### How to Use Cusp Energy

The key is integration. Let one sign guide your instincts and the other refine your actions. When you feel pulled in two directions, ask which sign supports the next honest step instead of choosing one permanently.

### Cusp Myth vs. Birth Chart Reality

Cusps are a helpful lens, but your exact Sun degree is still the foundation. If you were born on the boundary, your birth time determines the sign the Sun was actually in. Other placements—Moon, Rising, Venus, Mars—can echo the neighboring sign, which is why the cusp feeling is so common.

### Elemental Harmony

When your cusp combines two elements, think in terms of balance. Fire + Air is expressive and fast, Earth + Water is steady and intuitive, while Fire + Water or Earth + Air can feel like a push-pull. The work is to build routines and rituals that support both energies without forcing a choice.

Try seasonal rituals that honor both signs—one for grounding, one for growth. Over time, you learn how to move between energies rather than getting stuck in indecision.
      `}
      emotionalThemes={data.traits.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={[data.sign1, data.sign2]}
      howToWorkWith={[
        `Notice when ${data.sign1} traits show up and when ${data.sign2} traits take over`,
        'Use journaling to track how each sign appears in different environments',
        'Lean on the sign that brings balance when you feel pulled in two directions',
        'Study your birth chart to see which sign is more emphasized',
        'Focus on strengths that arise from blending both energies',
      ]}
      rituals={[
        'Write two short lists: one for each sign’s strengths. Combine them into a single intention.',
        'Create a small altar with two symbolic colors or elements from each sign.',
        'Meditate on how to harmonize opposing impulses rather than choosing one.',
        'On your birthday, set an intention for balance and integration.',
      ]}
      journalPrompts={[
        `Where do I feel most ${data.sign1.toLowerCase()}, and where do I feel most ${data.sign2.toLowerCase()}?`,
        'How can I use my dual nature as an advantage?',
        'What decision feels conflicted, and which sign offers clarity?',
        'How does my cusp energy show up in relationships?',
      ]}
      tables={[
        {
          title: 'Cusp Overview',
          headers: ['Property', 'Value'],
          rows: [
            ['Cusp Name', data.name],
            ['Signs', `${data.sign1} - ${data.sign2}`],
            ['Dates', data.dates],
            ['Elements', `${data.element1} + ${data.element2}`],
          ],
        },
        {
          title: 'Compatibility',
          headers: ['Best Cusp Matches'],
          rows: data.compatibility.map((c) => [c]),
        },
      ]}
      relatedItems={[
        {
          name: data.sign1,
          href: `/grimoire/zodiac/${data.sign1.toLowerCase()}`,
          type: 'Zodiac',
        },
        {
          name: data.sign2,
          href: `/grimoire/zodiac/${data.sign2.toLowerCase()}`,
          type: 'Zodiac',
        },
        { name: 'Cusps Overview', href: '/grimoire/cusps', type: 'Guide' },
      ]}
      internalLinks={[
        { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
        { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
        { text: 'Astrology Transits', href: '/grimoire/transits' },
      ]}
      ctaText="Discover if you're a cusp baby"
      ctaHref='/birth-chart'
      sources={[{ name: 'Cusp astrology interpretations' }]}
      faqs={faqs}
    >
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>All Zodiac Cusps</h3>
        <div className='flex flex-wrap gap-2'>
          {ZODIAC_CUSPS.map((c) => (
            <Link
              key={c.id}
              href={`/grimoire/cusps/${c.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                c.id === cusp
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {c.sign1}-{c.sign2}
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
