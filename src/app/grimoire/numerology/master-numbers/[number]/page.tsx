import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyProfileCalculator } from '@/components/grimoire/NumerologyProfileCalculator';
import { lifePathNumbers } from '@/constants/grimoire/numerology-data';

const masterNumberKeys = ['11', '22', '33'];

export async function generateStaticParams() {
  return masterNumberKeys.map((number) => ({
    number: number,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const numberData = lifePathNumbers[number as keyof typeof lifePathNumbers];

  if (!numberData || !masterNumberKeys.includes(number)) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `Master Number ${number}: ${numberData.meaning} - Complete Guide | Lunary`;
  const description = `Discover the powerful meaning of Master Number ${number} in numerology. Learn about ${numberData.meaning.toLowerCase()} energy, spiritual gifts, challenges, and how to harness this master number's potential.`;

  return {
    title,
    description,
    keywords: [
      `master number ${number}`,
      `${number} master number`,
      `numerology ${number}`,
      `${numberData.meaning.toLowerCase()} numerology`,
      'master numbers meaning',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/numerology/master-numbers/${number}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/numerology',
          width: 1200,
          height: 630,
          alt: `Master Number ${number}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/cosmic'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/numerology/master-numbers/${number}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function MasterNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = lifePathNumbers[number as keyof typeof lifePathNumbers];

  if (!numberData || !masterNumberKeys.includes(number)) {
    notFound();
  }

  const reducedNumber = number === '11' ? '2' : number === '22' ? '4' : '6';

  const faqs = [
    {
      question: `What does Master Number ${number} mean?`,
      answer: `Master Number ${number} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}`,
    },
    {
      question: `Why is ${number} called a Master Number?`,
      answer: `Master numbers (11, 22, 33) are called "master" because they carry intensified spiritual energy and higher potential. Master Number ${number} combines the energy of ${reducedNumber} with amplified spiritual power, bringing both gifts and challenges.`,
    },
    {
      question: `What are the traits of Master Number ${number}?`,
      answer: `People with Master Number ${number} are typically ${numberData.traits.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `What are the challenges of Master Number ${number}?`,
      answer: `Master Number ${number} challenges include ${numberData.challenges.slice(0, 3).join(', ').toLowerCase()}. The heightened energy of master numbers can feel overwhelming without proper grounding.`,
    },
    {
      question: `How do I work with Master Number ${number} energy?`,
      answer: `Work with Master Number ${number} by ${numberData.strengths[0]?.toLowerCase() || 'developing your spiritual gifts'}. Balance the intensity with grounding practices and self-care.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`Master Number ${number} - Lunary`}
        h1={`Master Number ${number}: ${numberData.meaning}`}
        description={`Discover the powerful meaning of Master Number ${number}. Learn about ${numberData.meaning.toLowerCase()} energy, spiritual gifts, and how to harness this master number's potential.`}
        keywords={[
          `master number ${number}`,
          `${number} numerology`,
          `${numberData.meaning.toLowerCase()}`,
          'master numbers',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/numerology/master-numbers/${number}`}
        intro={`Master Number ${number} is one of the most powerful numbers in numerology, representing ${numberData.meaning.toLowerCase()}. ${numberData.description}`}
        tldr={`Master Number ${number} carries intensified ${numberData.meaning.toLowerCase()} energy. Those with this number possess ${numberData.traits[0]?.toLowerCase() || 'exceptional gifts'} but face heightened challenges.`}
        meaning={`Master numbers are special double-digit numbers that are not reduced to a single digit in numerology. The three master numbers—11, 22, and 33—carry intensified spiritual energy and represent higher octaves of their base numbers.

Master Number ${number} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}

Unlike core numbers, master numbers bring both exceptional potential and significant challenges. The doubled energy creates a powerful vibrational frequency that can be difficult to handle without spiritual development and self-awareness.

Master Number ${number} relates to its base number ${reducedNumber}, but amplifies and elevates that energy to a spiritual level. Those who carry this number often feel called to make a significant impact in the world.

Key aspects of Master Number ${number}:
- Heightened spiritual awareness and intuition
- Greater potential for achievement and impact
- Increased sensitivity and intensity
- Need for balance and grounding
- Responsibility to use gifts for higher purposes

Working with Master Number ${number} requires dedication, self-discipline, and spiritual practice. The rewards for mastering this energy include profound fulfillment and the ability to inspire and transform others.`}
        emotionalThemes={numberData.traits}
        howToWorkWith={[
          `Develop your ${numberData.meaning.toLowerCase()} gifts consciously`,
          `Ground the intense energy through daily practices`,
          `Use your strengths: ${numberData.strengths[0]?.toLowerCase() || 'spiritual gifts'}`,
          `Work on challenges: ${numberData.challenges[0]?.toLowerCase() || 'personal growth'}`,
          `Serve others with your heightened abilities`,
          `Balance spiritual work with practical life`,
        ]}
        tables={[
          {
            title: `Master Number ${number} Overview`,
            headers: ['Aspect', 'Description'],
            rows: [
              ['Meaning', numberData.meaning],
              ['Base Number', reducedNumber],
              ['Key Traits', numberData.traits.slice(0, 3).join(', ')],
              ['Strengths', numberData.strengths.slice(0, 3).join(', ')],
              ['Challenges', numberData.challenges.slice(0, 3).join(', ')],
              ['Keywords', numberData.keywords.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `How does Master Number ${number} energy manifest in my life?`,
          `What spiritual gifts do I carry with this number?`,
          `How can I ground my ${numberData.meaning.toLowerCase()} energy?`,
          `What challenges do I face with ${number}'s intensity?`,
          `How can I use my Master Number ${number} gifts to serve others?`,
        ]}
        numerology={`Master Number: ${number}
Base Number: ${reducedNumber}
Meaning: ${numberData.meaning}
Keywords: ${numberData.keywords.join(', ')}`}
        relatedItems={[
          {
            name: `Life Path ${number}`,
            href: `/grimoire/life-path/${number}`,
            type: 'Life Path',
          },
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: `Core Number ${reducedNumber}`,
            href: `/grimoire/numerology/core-numbers/${reducedNumber}`,
            type: 'Core Number',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          {
            label: 'Master Numbers',
            href: '/grimoire/numerology/master-numbers',
          },
          {
            label: `Number ${number}`,
            href: `/grimoire/numerology/master-numbers/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          {
            text: `Life Path ${number}`,
            href: `/grimoire/life-path/${number}`,
          },
          { text: 'Calculate Your Life Path', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Discover if you have a Master Number in your chart`}
        ctaHref='/pricing'
        faqs={faqs}
        childrenPosition='before-faqs'
      >
        <NumerologyProfileCalculator />
      </SEOContentTemplate>
    </div>
  );
}
