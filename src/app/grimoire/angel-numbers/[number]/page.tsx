import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { angelNumbers } from '@/constants/grimoire/numerology-data';

const angelNumberKeys = Object.keys(angelNumbers);

export async function generateStaticParams() {
  return angelNumberKeys.map((number) => ({
    number: number,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const numberData = angelNumbers[number as keyof typeof angelNumbers];

  if (!numberData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${numberData.name} Meaning: Spiritual Significance - Lunary`;
  const description = `Discover the complete meaning of ${numberData.name}. Learn about ${numberData.name} spiritual significance, love meaning, career meaning, and what it means when you see this angel number.`;

  return {
    title,
    description,
    keywords: [
      `${numberData.name} meaning`,
      `angel number ${numberData.number}`,
      `seeing ${numberData.number}`,
      `${numberData.number} spiritual meaning`,
      `${numberData.number} meaning`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/angel-numbers/${number}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${numberData.name}`,
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
      canonical: `https://lunary.app/grimoire/angel-numbers/${number}`,
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

export default async function AngelNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = angelNumbers[number as keyof typeof angelNumbers];

  if (!numberData) {
    notFound();
  }

  const faqs = [
    {
      question: `What does ${numberData.number} mean?`,
      answer: `${numberData.number} is an angel number meaning ${numberData.meaning.toLowerCase()}. ${numberData.description}`,
    },
    {
      question: `What does it mean when I see ${numberData.number}?`,
      answer: `When you see ${numberData.number}, it means ${numberData.message.toLowerCase()}`,
    },
    {
      question: `What does ${numberData.number} mean in love?`,
      answer: `${numberData.loveMeaning}`,
    },
    {
      question: `What does ${numberData.number} mean for my career?`,
      answer: `${numberData.careerMeaning}`,
    },
    {
      question: `What is the spiritual meaning of ${numberData.number}?`,
      answer: `${numberData.spiritualMeaning}`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${numberData.name} - Lunary`}
        h1={`${numberData.name}: Complete Spiritual Guide`}
        description={`Discover the complete meaning of ${numberData.name}. Learn about spiritual significance, love meaning, career meaning, and what it means when you see this angel number.`}
        keywords={[
          `${numberData.name}`,
          `angel number ${numberData.number}`,
          `seeing ${numberData.number}`,
          `${numberData.number} meaning`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/angel-numbers/${number}`}
        intro={`${numberData.name} is a powerful angel number that appears when your angels want to communicate with you. ${numberData.description}`}
        tldr={`${numberData.name} means ${numberData.meaning.toLowerCase()}. When you see this number, ${numberData.message.toLowerCase()}`}
        meaning={`Angel numbers are sequences of numbers that carry divine guidance and messages from your angels and the spiritual realm. ${numberData.number} is particularly significant because it carries the energy of ${numberData.meaning.toLowerCase()}.

${numberData.description}

When ${numberData.number} appears repeatedly in your life - on clocks, license plates, receipts, addresses, or anywhere else - it's a sign that your angels are trying to get your attention. This number carries a specific message for you at this moment in your life.

The appearance of ${numberData.number} is not a coincidence. It's a synchronicity, a meaningful coincidence that carries spiritual significance. Your angels use these numbers to communicate because they're a universal language that transcends barriers.

Understanding what ${numberData.number} means helps you interpret the message your angels are sending and take appropriate action in your life.`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={[
          `Pay attention when you see ${numberData.number}`,
          `Reflect on ${numberData.meaning.toLowerCase()}`,
          `Trust the message your angels are sending`,
          `Take action aligned with ${numberData.number}'s meaning`,
          `Express gratitude for the guidance`,
        ]}
        journalPrompts={[
          `Where have I been seeing ${numberData.number}?`,
          `What does ${numberData.meaning.toLowerCase()} mean to me right now?`,
          `How can I work with ${numberData.number}'s energy?`,
          `What message are my angels sending me?`,
          `What action should I take based on this guidance?`,
        ]}
        numerology={`Angel Number: ${numberData.number}
Meaning: ${numberData.meaning}
Keywords: ${numberData.keywords.join(', ')}`}
        relatedItems={[
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Life Path Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: 'View Today\'s Horoscope', href: '/horoscope' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want personalized numerology insights for your life?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
