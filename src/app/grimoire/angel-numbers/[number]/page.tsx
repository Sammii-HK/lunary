import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { angelNumbers } from '@/constants/grimoire/numerology-data';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

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
}) {
  const { number } = await params;
  const numberData = angelNumbers[number as keyof typeof angelNumbers];

  if (!numberData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${numberData.name}: Meaning in Love, Career & Manifestation - Lunary`,
    description: `${numberData.name} meaning: spiritual significance, love & twin flame messages, career guidance. What does ${numberData.number} mean? Complete angel number interpretation.`,
    keywords: [
      `${numberData.name} meaning`,
      `${numberData.number} angel number`,
      `seeing ${numberData.number}`,
      `${numberData.number} love meaning`,
      `${numberData.number} twin flame`,
      `${numberData.number} manifestation`,
    ],
    url: `/grimoire/angel-numbers/${number}`,
    ogImagePath: '/api/og/grimoire/angel-numbers',
    ogImageAlt: `${numberData.name} Angel Number`,
  });
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

  // Entity schema for Knowledge Graph
  const angelNumberSchema = createCosmicEntitySchema({
    name: numberData.name,
    description: `${numberData.name} spiritual meaning: ${numberData.spiritualMeaning.slice(0, 150)}...`,
    url: `/grimoire/angel-numbers/${number}`,
    additionalType: 'https://en.wikipedia.org/wiki/Angel_number',
    keywords: [
      numberData.name,
      `${numberData.number} meaning`,
      'angel number',
      'spiritual meaning',
      'numerology',
      'divine message',
    ],
  });

  const tableOfContents = [
    { label: 'Meaning & Message', href: '#meaning-section' },
    { label: 'Love & Relationships', href: '#love-section' },
    { label: 'Career & Abundance', href: '#career-section' },
    { label: 'Spiritual Guidance', href: '#spiritual-section' },
    { label: 'Action Plan', href: '#actions-section' },
    { label: 'Synchronicity Diary', href: '#synchronicity-section' },
    { label: 'Journal Prompts', href: '#journal-prompts' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(angelNumberSchema)}
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
        tableOfContents={tableOfContents}
        meaning={`Angel numbers are sequences of numbers that carry divine guidance and messages from your angels and the spiritual realm. ${numberData.number} is particularly significant because it carries the energy of ${numberData.meaning.toLowerCase()}.

${numberData.description}

When ${numberData.number} appears repeatedly in your life - on clocks, license plates, receipts, addresses, or anywhere else - it's a sign that your angels are trying to get your attention. This number carries a specific message for you at this moment in your life.

The appearance of ${numberData.number} is not a coincidence. It's a synchronicity, a meaningful coincidence that carries spiritual significance. Your angels use these numbers to communicate because they're a universal language that transcends barriers.

Understanding what ${numberData.number} means helps you interpret the message your angels are sending and take appropriate action in your life.

**Elemental Reflection:**

- Connect ${numberData.number} with the element that best represents its vibration (fire for courage, water for intuition, air for clarity, earth for grounding).
- Create a small altar offering that mirrors the element and meditate on the number’s qualities for a few minutes.

**Timeline Tracking:**

Keep a quarterly log of when ${numberData.number} shows up. Review the dates alongside moon phases, retrogrades, and personal milestones—you’ll begin to see repeating arcs in how the universe nudges you forward.`}
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
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          {
            label: numberData.name,
            href: `/grimoire/angel-numbers/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want personalized numerology insights for your life?`}
        ctaHref='/pricing'
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-numerology'
            entityKey={numberData.number}
            title='Numerology Resources'
            sections={[
              {
                title: 'Keep Learning',
                links: [
                  {
                    label: 'Angel Numbers Index',
                    href: '/grimoire/angel-numbers',
                  },
                  { label: 'Life Path Numbers', href: '/grimoire/life-path' },
                  { label: 'Mirror Hours', href: '/grimoire/mirror-hours' },
                ],
              },
              {
                title: 'Practical Tools',
                links: [
                  {
                    label: 'Manifestation Guide',
                    href: '/grimoire/manifestation',
                  },
                  { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
                  { label: 'Book of Shadows', href: '/book-of-shadows' },
                ],
              },
            ]}
          />
        }
      >
        <section id='meaning-section' className='mb-10 space-y-4'>
          <h2 className='text-3xl font-light text-zinc-100'>
            {numberData.name} Meaning & Message
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            {numberData.description} Every appearance is an invitation to embody{' '}
            <strong className='text-zinc-100'>
              {numberData.meaning.toLowerCase()}
            </strong>{' '}
            and trust that your angels are walking beside you. Track the dates
            and circumstances in your journal so you can trace patterns across
            weeks and lunar cycles.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Ask yourself: <em>What was I thinking?</em> and{' '}
            <em>What decision am I weighing?</em> The answers will highlight how{' '}
            {numberData.number} wants you to pivot or double down. Remember,
            these synchronicities are collaborative—acknowledge the message and
            act on it to keep the conversation alive.
          </p>
        </section>

        <section id='love-section' className='mb-10 space-y-3'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            {numberData.number} in Love & Relationships
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            {numberData.loveMeaning}
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Notice whether this number appears when you are texting someone,
            about to meet a new person, or reflecting on a partnership. The
            context tells you whether to lean in, establish boundaries, or
            release old patterns that dampen intimacy.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            If you&apos;re calling in partnership, treat this number as a nudge
            to align your heart with your standards. If you&apos;re already
            committed, use it as a cue for conscious communication, healing, or
            celebration— whichever aligns with the message you feel in your
            body.
          </p>
        </section>

        <section id='career-section' className='mb-10 space-y-3'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            {numberData.number} in Career & Abundance
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            {numberData.careerMeaning}
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Pair the message with grounded moves: update your resume, revisit
            your manifestation list, or schedule a money meeting with yourself.
            Angel numbers rarely want you to wait—they want you to partner with
            the energy they deliver.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Think of this number as a progress report from your spiritual team.
            Are you honoring your authentic work, or acting from fear? Consider
            running rituals that support the guidance—money bowls, manifestation
            scripting, or simple gratitude meditations.
          </p>
        </section>

        <section id='spiritual-section' className='mb-10 space-y-3'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Spiritual Guidance from {numberData.number}
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            {numberData.spiritualMeaning}
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Combine the insight with breathwork, sound baths, or moonlit walks.
            Your guides communicate in symbols, but they also respond to how you
            embody the lesson. Move your body, speak the message aloud, and
            treat the number as a mantra you can return to throughout the day.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Pair this number with moon work: note the phase when it appears, and
            perform a mini ritual that echoes the message—breathwork for
            calming, candle magic for clarity, or tarot pulls for deeper
            context.
          </p>
        </section>

        <section id='actions-section' className='mb-10 space-y-3'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Action Plan for {numberData.number}
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Numbers are nudges toward movement. Choose one action from each
            column to anchor the message in your everyday life.
          </p>
          <div className='grid md:grid-cols-2 gap-4 text-zinc-300'>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-zinc-100'>
                Inner Work
              </h3>
              <ul className='list-disc list-inside space-y-1'>
                <li>
                  Write a letter to your guides thanking them for clarity.
                </li>
                <li>
                  Record a five-minute voice memo about the lesson you see.
                </li>
                <li>
                  Pull a tarot card and ask, “How do I embody this number?”
                </li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-zinc-100'>
                Outer Work
              </h3>
              <ul className='list-disc list-inside space-y-1'>
                <li>
                  Schedule the conversation or decision this number highlights.
                </li>
                <li>Create a mini altar offering that reflects its energy.</li>
                <li>
                  Set a reminder to check in with this number in seven days.
                </li>
              </ul>
            </div>
          </div>
          <p className='text-zinc-300 leading-relaxed'>
            Combining inner alignment with tangible steps turns angel numbers
            into catalysts rather than curiosities. Consistency is what
            convinces your guides you’re ready for the next message.
          </p>
        </section>

        <section id='journal-prompts' className='space-y-3'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Journal Prompts
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Use these questions when {numberData.number} pops up. They help lock
            in the lesson and keep you anchored in action.
          </p>
          <ul className='space-y-2 text-zinc-300'>
            {numberData.keywords.map((keyword) => (
              <li key={keyword}>
                • Where does {keyword.toLowerCase()} need my attention?
              </li>
            ))}
          </ul>
        </section>
        <section id='synchronicity-section' className='space-y-3'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Build Your Synchronicity Diary
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Treat angel numbers like data points. Log the date, context,
            emotions, and follow-up action every time the sequence appears.
            Review the log at the end of the month to notice patterns—maybe{' '}
            {numberData.number} shows up before creative breakthroughs or
            whenever it’s time to rest.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            This practice transforms passive observation into active
            partnership. You’ll start to trust your intuition faster, because
            you’ll have proof that the numbers led somewhere tangible.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Eventually the diary becomes a sacred timeline—one that reveals how
            often your angels responded when you asked for guidance. Revisit
            older entries whenever you need reassurance that {numberData.number}{' '}
            always arrived with purpose.
          </p>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
