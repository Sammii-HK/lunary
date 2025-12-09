import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createHowToSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Dream Interpretation: Common Dreams & What They Mean | Lunary',
  description:
    'Master dream interpretation to understand your subconscious messages. Learn dream symbols, journaling techniques, and how to decode prophetic, lucid, and recurring dreams.',
  keywords: [
    'dream interpretation',
    'dream meanings',
    'dream symbols',
    'dream journal',
    'lucid dreaming',
    'prophetic dreams',
    'recurring dreams',
    'dream analysis',
  ],
  openGraph: {
    title: 'Dream Interpretation: Common Dreams & What They Mean | Lunary',
    description:
      'Master dream interpretation to understand your subconscious messages and spiritual guidance.',
    url: 'https://lunary.app/grimoire/divination/dream-interpretation',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/divination',
        width: 1200,
        height: 630,
        alt: 'Dream Interpretation Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dream Interpretation Guide | Lunary',
    description: 'Decode your dreams and understand their hidden messages.',
    images: ['/api/og/grimoire/divination'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/divination/dream-interpretation',
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
    question: 'What is dream interpretation?',
    answer:
      'Dream interpretation is the practice of analyzing dream content to understand subconscious messages, process emotions, and receive spiritual guidance. Dreams can reveal insights about your waking life, relationships, and inner world.',
  },
  {
    question: 'How do I remember my dreams?',
    answer:
      'Keep a dream journal by your bed and write immediately upon waking. Set an intention before sleep to remember dreams. Avoid sudden movements upon waking, as this can scatter dream memories. Stay still and recall before moving.',
  },
  {
    question: 'What do common dream symbols mean?',
    answer:
      'While symbols can be personal, common meanings include: water (emotions), flying (freedom), falling (anxiety), teeth falling out (change/loss), being chased (avoiding something), and death (transformation). Always consider your personal associations first.',
  },
  {
    question: 'Can dreams predict the future?',
    answer:
      'Some people experience prophetic dreams, though most dreams reflect current concerns, emotions, and subconscious processing. Dreams can provide insight that helps you make better decisions about the future.',
  },
  {
    question: 'What causes recurring dreams?',
    answer:
      'Recurring dreams often indicate unresolved issues, ongoing stress, or lessons your subconscious is trying to teach you. Pay attention to these dreams—they usually stop once you address the underlying issue or understand the message.',
  },
];

export default function DreamInterpretationPage() {
  const dreamHowToSchema = createHowToSchema({
    name: 'How to Interpret Your Dreams',
    description:
      'A step-by-step guide to understanding and interpreting your dreams for personal insight and spiritual guidance.',
    url: 'https://lunary.app/grimoire/divination/dream-interpretation',
    steps: [
      {
        name: 'Keep a Dream Journal',
        text: 'Place a journal by your bed and write dreams immediately upon waking, before moving or checking your phone.',
      },
      {
        name: 'Record All Details',
        text: 'Note emotions, colors, symbols, people, locations, and any dialogue. Include how you felt during and after the dream.',
      },
      {
        name: 'Identify Key Symbols',
        text: 'Pick out the most prominent or emotionally charged symbols in your dream.',
      },
      {
        name: 'Consider Personal Associations',
        text: 'What do these symbols mean to YOU? Personal associations often matter more than universal meanings.',
      },
      {
        name: 'Look for Patterns',
        text: 'Review your journal for recurring themes, symbols, or dream types over time.',
      },
      {
        name: 'Apply the Insight',
        text: 'Consider how the dream message applies to your waking life and what action you might take.',
      },
    ],
  });

  return (
    <>
      {renderJsonLd(dreamHowToSchema)}
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <SEOContentTemplate
          title='Dream Interpretation | Lunary'
          h1='Dream Interpretation: Common Dreams & What They Mean'
          description='Learn dream interpretation techniques to understand your subconscious messages and receive guidance.'
          keywords={[
            'dream interpretation',
            'dream meanings',
            'dream symbols',
            'divination',
          ]}
          canonicalUrl='https://lunary.app/grimoire/divination/dream-interpretation'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Divination', href: '/grimoire/divination' },
            {
              label: 'Dream Interpretation',
              href: '/grimoire/divination/dream-interpretation',
            },
          ]}
          whatIs={{
            question: 'What is dream interpretation?',
            answer:
              'Dream interpretation is the ancient practice of analyzing dream content to understand messages from your subconscious mind, process emotions, and receive spiritual guidance. Dreams communicate through symbols, emotions, and narratives that can reveal insights about your waking life, relationships, fears, desires, and spiritual path.',
          }}
          intro='Dream interpretation is an ancient art of understanding the messages your subconscious sends through dreams. By learning to interpret your dreams, you gain access to profound wisdom and guidance.'
          tldr='Keep a dream journal, write immediately upon waking, look for personal symbol meanings first, notice recurring themes, and trust your intuition for the deepest insights.'
          meaning={`Dreams have fascinated humanity throughout history, viewed as messages from the gods, the subconscious mind, or the spirit world. Dream interpretation helps you understand these nightly visions and apply their wisdom to your waking life.

The science of dreams shows they serve multiple purposes: processing emotions, consolidating memories, problem-solving, and creative inspiration. The spiritual perspective adds that dreams can also provide guidance, warnings, and connections to other realms.

**Types of Dreams:**

**Processing Dreams:** Working through daily experiences and emotions. Most common type.

**Prophetic Dreams:** Glimpses of future possibilities. Often feel vivid and memorable.

**Lucid Dreams:** Awareness within the dream state. Can be cultivated for spiritual work.

**Recurring Dreams:** Patterns indicating unresolved issues. Stop when addressed.

**Nightmares:** Often highlighting fears or avoided topics. Important for shadow work.

**Visitation Dreams:** Contact with deceased loved ones or spirits. Usually feel peaceful and real.

When interpreting dreams, consider both universal symbols and your personal associations. A snake might universally represent transformation, but if you have a pet snake, it might simply represent comfort and companionship.

The most important dream interpretation tool is your own intuition. Notice how symbols feel to you and what emotions arise when you consider different meanings.`}
          emotionalThemes={[
            'Insight',
            'Self-understanding',
            'Guidance',
            'Processing',
          ]}
          howToWorkWith={[
            'Keep a dream journal by your bed',
            'Write dreams immediately upon waking',
            'Note emotions, symbols, and colors',
            'Look for personal associations first',
            'Consider universal symbol meanings',
            'Notice recurring themes over time',
            'Trust your intuitive interpretation',
            'Apply insights to waking life',
          ]}
          tables={[
            {
              title: 'Common Dream Symbols',
              headers: ['Symbol', 'Common Meaning'],
              rows: [
                ['Water', 'Emotions, subconscious, purification'],
                ['Flying', 'Freedom, transcendence, ambition'],
                ['Falling', 'Loss of control, anxiety, letting go'],
                ['House', 'Self, psyche, different rooms = different aspects'],
                ['Death', 'Transformation, endings, rebirth'],
                ['Animals', 'Instincts, aspects of self, spirit guides'],
                ['Teeth falling', 'Anxiety, loss, major life changes'],
                ['Being chased', 'Avoidance, running from problems'],
              ],
            },
            {
              title: 'Dream Types Guide',
              headers: ['Type', 'Characteristics', 'Message'],
              rows: [
                ['Processing', 'Daily events replayed', 'Integration needed'],
                ['Prophetic', 'Vivid, memorable', 'Future possibility'],
                ['Lucid', "Aware you're dreaming", 'Conscious exploration'],
                ['Recurring', 'Same dream repeats', 'Unresolved issue'],
                ['Nightmare', 'Fear, anxiety', 'Shadow work needed'],
              ],
            },
          ]}
          journalPrompts={[
            'What recurring dreams do I have and what might they mean?',
            'What emotions were present in my dream?',
            'What personal meaning do the symbols hold for me?',
            'How does this dream relate to my waking life?',
            'What message is my subconscious trying to send?',
          ]}
          relatedItems={[
            {
              name: 'Divination Guide',
              href: '/grimoire/divination',
              type: 'Guide',
            },
            { name: 'Moon Phases', href: '/grimoire/moon', type: 'Guide' },
            {
              name: 'Meditation',
              href: '/grimoire/meditation',
              type: 'Practice',
            },
            {
              name: 'Shadow Work',
              href: '/grimoire/shadow-work',
              type: 'Practice',
            },
          ]}
          internalLinks={[
            { text: 'Divination Guide', href: '/grimoire/divination' },
            { text: 'Moon Phases', href: '/grimoire/moon' },
            { text: 'Meditation Guide', href: '/grimoire/meditation' },
            { text: 'Grimoire Home', href: '/grimoire' },
          ]}
          ctaText='Explore more divination methods'
          ctaHref='/grimoire/divination'
          faqs={faqs}
        />
      </div>
    </>
  );
}
