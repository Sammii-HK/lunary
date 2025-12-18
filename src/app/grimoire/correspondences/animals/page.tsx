import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const animals = [
  {
    slug: 'cat',
    name: 'Cat',
    correspondences: ['Independence', 'Magic', 'Mystery', 'Protection'],
  },
  {
    slug: 'owl',
    name: 'Owl',
    correspondences: ['Wisdom', 'Intuition', 'Death', 'Night'],
  },
  {
    slug: 'raven',
    name: 'Raven',
    correspondences: ['Magic', 'Prophecy', 'Transformation', 'Messages'],
  },
  {
    slug: 'wolf',
    name: 'Wolf',
    correspondences: ['Loyalty', 'Instinct', 'Pack', 'Guardian'],
  },
  {
    slug: 'snake',
    name: 'Snake',
    correspondences: ['Transformation', 'Healing', 'Wisdom', 'Rebirth'],
  },
  {
    slug: 'bear',
    name: 'Bear',
    correspondences: ['Strength', 'Protection', 'Dreaming', 'Solitude'],
  },
  {
    slug: 'deer',
    name: 'Deer',
    correspondences: ['Gentleness', 'Grace', 'Forest', 'Sensitivity'],
  },
  {
    slug: 'butterfly',
    name: 'Butterfly',
    correspondences: ['Transformation', 'Joy', 'Soul', 'Lightness'],
  },
  {
    slug: 'crow',
    name: 'Crow',
    correspondences: ['Intelligence', 'Adaptability', 'Magic', 'Change'],
  },
  {
    slug: 'fox',
    name: 'Fox',
    correspondences: ['Cunning', 'Adaptability', 'Invisibility', 'Wisdom'],
  },
];

export const metadata: Metadata = {
  title: 'Animal Correspondences: Spirit Animals & Totems | Lunary',
  description:
    'Complete guide to animal correspondences and spirit animal meanings. Learn about cats, owls, wolves, ravens, and other power animals in magic and spirituality.',
  keywords: [
    'animal correspondences',
    'spirit animals',
    'animal totems',
    'power animals',
    'animal symbolism',
    'animal magic',
  ],
  openGraph: {
    title: 'Animal Correspondences Guide | Lunary',
    description: 'Complete guide to spirit animals, totems, and animal magic.',
    url: 'https://lunary.app/grimoire/correspondences/animals',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Animal Correspondences Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animal Correspondences Guide | Lunary',
    description: 'Complete guide to spirit animals and animal magic.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/animals',
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

const faqs = [
  {
    question: 'What is a spirit animal?',
    answer:
      'A spirit animal is an animal guide that offers wisdom, protection, and guidance throughout your life or during specific situations. Spirit animals can appear in dreams, meditation, repeated sightings, or strong personal resonance.',
  },
  {
    question: 'How do I find my spirit animal?',
    answer:
      'Pay attention to animals that appear repeatedly in your life, dreams, or meditation. Notice which animals you feel strongly drawn to. Guided meditation specifically for meeting your spirit animal is a common practice. Your spirit animal may change throughout different life stages.',
  },
  {
    question: 'What is the difference between a spirit animal and a totem?',
    answer:
      'Spirit animals are personal guides that may change over time. Totems are often clan or family symbols passed through generations. Power animals are called upon for specific tasks or protection. The terms are sometimes used interchangeably in modern practice.',
  },
  {
    question: 'What does it mean when an animal appears repeatedly?',
    answer:
      'Repeated animal sightings often carry messages. The animal may be offering its medicine or qualities you need. Consider what the animal symbolizes and how that relates to your current life situation. Trust your intuition about the message.',
  },
  {
    question: 'Can I have more than one spirit animal?',
    answer:
      'Yes, many people work with multiple animal guides. You may have a lifelong primary spirit animal plus others that appear during specific life phases or situations. Different animals offer different wisdom for different needs.',
  },
];

export default function AnimalsIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Animal Correspondences | Lunary'
        h1='Animal Correspondences: Spirit Animals & Totems'
        description='Animals carry powerful symbolism and spiritual messages. Learn about spirit animals, totems, and animal magic.'
        keywords={[
          'animal correspondences',
          'spirit animals',
          'animal totems',
          'power animals',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/animals'
        whatIs={{
          question: 'What are Animal Correspondences?',
          answer:
            'Animal correspondences are the spiritual meanings, magical associations, and symbolic properties of different animals. Each creature carries unique medicine and wisdom that can guide, protect, and teach us. Understanding animal correspondences helps you interpret messages from spirit animals, work with animal energy in magic, and deepen your connection to the natural world.',
        }}
        tldr='Cat for magic and independence, owl for wisdom and intuition, wolf for loyalty and instinct, raven for prophecy and transformation, snake for healing and rebirth, bear for strength and protection.'
        meaning={`Animals have been spiritual guides and symbols across all human cultures. From cave paintings to modern spirit work, we recognize that animals carry powerful medicine and wisdom.

**Types of Animal Guides:**

**Spirit Animals**: Personal guides offering lifelong or situational wisdom
**Totem Animals**: Clan or family symbols, often inherited
**Power Animals**: Called upon for specific magical tasks
**Shadow Animals**: Animals that frighten us, revealing hidden aspects of self

**How Animals Communicate:**

Animals send messages through:
- Repeated physical sightings
- Dreams and meditation
- Strong emotional responses to certain creatures
- Synchronistic appearances during important moments
- Unusual behavior when you encounter them

**Working with Animal Energy:**

You can call upon animal energy through:
1. **Meditation**: Journey to meet your animal guide
2. **Imagery**: Display images of your power animal
3. **Invocation**: Call upon animal qualities in spellwork
4. **Study**: Learn everything about your animal's habits
5. **Offerings**: Honor animal spirits with appropriate gifts

**Common Animal Symbolism:**

Animals connected to **Air**: Communication, thought, freedom
Animals connected to **Fire**: Passion, transformation, courage
Animals connected to **Water**: Emotion, intuition, healing
Animals connected to **Earth**: Grounding, abundance, stability`}
        howToWorkWith={[
          'Pay attention to animals that appear repeatedly in your life',
          'Research the symbolism and medicine of animals that call to you',
          'Meditate to connect with your spirit animal',
          'Call upon animal energy for specific magical purposes',
          'Honor animal guides with offerings and respect',
        ]}
        relatedItems={[
          {
            name: 'Elements',
            href: '/grimoire/correspondences/elements',
            type: 'Correspondences',
          },
          {
            name: 'Divination',
            href: '/grimoire/divination',
            type: 'Guide',
          },
          {
            name: 'Meditation',
            href: '/grimoire/meditation',
            type: 'Practice',
          },
          {
            name: 'All Correspondences',
            href: '/grimoire/correspondences',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          {
            text: 'Correspondences Overview',
            href: '/grimoire/correspondences',
          },
          { text: 'Elements', href: '/grimoire/correspondences/elements' },
          { text: 'Meditation', href: '/grimoire/meditation' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
        ]}
        ctaText='Want personalized spirit animal insights?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Spirit Animals
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any animal to explore its full symbolism, magical uses, and
            spiritual messages.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {animals.map((animal) => (
              <Link
                key={animal.slug}
                href={`/grimoire/correspondences/animals/${animal.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-orange-700/50 transition-all'
              >
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-orange-300 transition-colors mb-2'>
                  {animal.name}
                </h3>
                <p className='text-sm text-zinc-400'>
                  {animal.correspondences.join(', ')}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12 bg-orange-950/20 border border-orange-900/50 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Animals by Element
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-orange-400 font-medium'>Air Animals:</p>
              <p className='text-zinc-400'>
                Owl, Raven, Crow, Butterfly, Eagle, Hawk
              </p>
            </div>
            <div>
              <p className='text-red-400 font-medium'>Fire Animals:</p>
              <p className='text-zinc-400'>Fox, Lion, Phoenix, Salamander</p>
            </div>
            <div>
              <p className='text-blue-400 font-medium'>Water Animals:</p>
              <p className='text-zinc-400'>Snake, Fish, Dolphin, Frog, Otter</p>
            </div>
            <div>
              <p className='text-emerald-400 font-medium'>Earth Animals:</p>
              <p className='text-zinc-400'>Bear, Wolf, Deer, Cat, Rabbit</p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
