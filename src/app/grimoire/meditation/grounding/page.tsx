import { Metadata } from 'next';
import Link from 'next/link';
import { TreePine } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
const groundingTechniques = [
  {
    slug: 'tree-root-visualization',
    name: 'Tree Root Visualization',
    description: 'Imagine roots growing from your feet into the earth',
    time: '5-10 min',
    type: 'Visualization',
  },
  {
    slug: '5-4-3-2-1-senses',
    name: '5-4-3-2-1 Senses',
    description: 'Engage all five senses to anchor to the present',
    time: '2-5 min',
    type: 'Sensory',
  },
  {
    slug: 'earthing',
    name: 'Earthing / Barefoot Walking',
    description: 'Direct physical contact with the earth',
    time: '10-20 min',
    type: 'Physical',
  },
  {
    slug: 'body-scan',
    name: 'Body Scan Grounding',
    description: 'Systematically feel each part of your body',
    time: '10-15 min',
    type: 'Mindfulness',
  },
  {
    slug: 'grounding-cord',
    name: 'Grounding Cord Meditation',
    description: "Visualize an energetic cord connecting you to Earth's core",
    time: '5-10 min',
    type: 'Visualization',
  },
  {
    slug: 'stone-holding',
    name: 'Stone Holding',
    description: 'Hold a grounding crystal to anchor energy',
    time: '5-10 min',
    type: 'Crystal Work',
  },
];

export const metadata: Metadata = {
  title:
    'Grounding Techniques: Earthing, Tree Root & 5-4-3-2-1 Method - Lunary',
  description:
    'Learn powerful grounding techniques to anchor your energy, reduce anxiety, and connect with the earth. Essential practices for empaths and sensitives.',
  keywords: [
    'grounding techniques',
    'grounding meditation',
    'earthing',
    'energy grounding',
    'how to ground yourself',
  ],
  openGraph: {
    title: 'Grounding Techniques | Lunary',
    description:
      'Learn powerful grounding techniques to anchor your energy and reduce anxiety.',
    url: 'https://lunary.app/grimoire/meditation/grounding',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/meditation/grounding',
  },
};

export default function GroundingIndexPage() {
  const tableOfContents = [
    { label: 'Why Grounding Matters', href: '#why-grounding-matters' },
    { label: 'When to Ground', href: '#when-to-ground' },
    { label: 'Grounding Techniques', href: '#grounding-techniques' },
    { label: 'Explore More', href: '#explore-more' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <TreePine className='w-16 h-16 text-emerald-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Grounding connects you to the earth&apos;s stabilizing energy, helping
        you feel centered, present, and calm. Essential for empaths and after
        spiritual work.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='why-grounding-matters'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          Why Grounding Matters
        </h2>
        <p className='text-zinc-400 mb-4'>
          Grounding is the practice of connecting your energy to the earth. When
          we&apos;re ungrounded, we may feel spacey, anxious, scattered, or
          overwhelmed. Grounding brings us back to center.
        </p>
        <p className='text-zinc-400'>
          Grounding is especially important for: empaths and highly sensitive
          people, after meditation or spiritual work, during times of stress or
          anxiety, and when doing energy healing or magic.
        </p>
        <p className='text-zinc-400 mt-4'>
          Think of grounding as a steadying routine. It creates a baseline of
          stability so intuition feels clearer and your energy is less reactive.
        </p>
      </section>

      <section
        id='when-to-ground'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          When to Ground
        </h2>
        <p className='text-zinc-400 mb-4'>
          Ground before meditation to settle your focus, after ritual work to
          integrate, and whenever you notice your mind spinning. It is also
          useful before sleep and after long screen time.
        </p>
        <p className='text-zinc-400'>
          If you are short on time, use a quick sensory method. If you need a
          deeper reset, choose a longer visualization or earthing practice.
        </p>
        <p className='text-zinc-400 mt-4'>
          A simple daily routine is three minutes of breath, one minute of body
          scan, and one minute of sensory check-in. That short sequence can
          prevent the buildup of stress and keeps you steady throughout the day.
        </p>
      </section>

      <section id='grounding-techniques' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Grounding Techniques
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {groundingTechniques.map((technique) => (
            <Link
              key={technique.slug}
              href={`/grimoire/meditation/grounding/${technique.slug}`}
              className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-emerald-700/50 transition-all'
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300'>
                  {technique.type}
                </span>
                <span className='text-xs text-zinc-400'>{technique.time}</span>
              </div>
              <h3 className='text-lg font-medium text-zinc-100 group-hover:text-emerald-300 transition-colors mb-2'>
                {technique.name}
              </h3>
              <p className='text-sm text-zinc-400'>{technique.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id='explore-more' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>Explore More</h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/meditation'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Meditation
          </Link>
          <Link
            href='/grimoire/meditation/breathwork'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Breathwork
          </Link>
          <Link
            href='/grimoire/crystals'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Crystals
          </Link>
          <Link
            href='/grimoire/chakras'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Chakras
          </Link>
        </div>
      </section>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='Grounding Techniques: Earthing, Tree Root & 5-4-3-2-1 Method - Lunary'
        h1='Grounding Techniques'
        description='Learn powerful grounding practices to anchor your energy, reduce anxiety, and connect with the earth.'
        keywords={[
          'grounding techniques',
          'grounding meditation',
          'earthing',
          'energy grounding',
          'how to ground yourself',
        ]}
        canonicalUrl='https://lunary.app/grimoire/meditation/grounding'
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro='Grounding is a simple, practical way to settle your nervous system and reconnect with your body. These techniques are designed for real life: quick resets when you feel scattered, and deeper practices for post-ritual or post-meditation integration.'
        tldr='Grounding calms the nervous system and anchors your energy. Use sensory, body-based, or visualization methods depending on what you need.'
        meaning={`Grounding brings your attention back into the body and into the present moment. It is especially helpful when you feel anxious, overstimulated, or uncentered after spiritual work.

Signs you may need grounding include racing thoughts, feeling floaty or spaced out, restlessness, or difficulty concentrating. Grounding practices slow you down and reconnect you with your senses, making it easier to make clear decisions.

There are many ways to ground. Sensory techniques like the 5-4-3-2-1 method pull your awareness into the environment. Visualization methods like tree roots or grounding cords create a felt sense of stability. Physical methods like earthing, body scans, or holding a stone bring you back to the weight and warmth of the body.

You do not need a long session for grounding to work. Even two minutes of focused attention can shift your state. The key is consistency and choosing a method that matches your current energy. Over time, grounding becomes a reliable reset you can access anywhere.

Grounding is not about forcing calm. It is about meeting your body where it is and giving it a clear signal of safety. That signal can be sensory, physical, or imaginative as long as it is real to you. Travel, emotional conversations, and long days are all good times to return to a grounding practice, especially when routines shift.`}
        howToWorkWith={[
          'Start with the shortest technique when you are overwhelmed.',
          'Pair grounding with a consistent cue (after meditation, before sleep).',
          'Use physical grounding when your thoughts are racing.',
          'Use visualization when you need to feel supported or contained.',
          'Check in with your body for a clear sense of completion.',
        ]}
        rituals={[
          'Stand barefoot, breathe slowly, and feel your feet for 60 seconds.',
          'Hold a grounding stone and set a clear intention to settle.',
          'Do a three-minute body scan from head to toe.',
          'Place one hand on your belly and one on your heart, then breathe evenly.',
        ]}
        journalPrompts={[
          'When do I feel most ungrounded during the day?',
          'Which grounding method works fastest for me?',
          'What sensations tell me I feel centered?',
          'How can I build grounding into my routine?',
        ]}
        tables={[
          {
            title: 'Grounding Methods Snapshot',
            headers: ['Method', 'Best For', 'Time'],
            rows: [
              ['5-4-3-2-1 Senses', 'Anxiety and overwhelm', '2-5 min'],
              ['Earthing', 'Stress relief and reset', '10-20 min'],
              ['Tree Root Visualization', 'Energetic stability', '5-10 min'],
              ['Body Scan', 'Tension release', '10-15 min'],
            ],
          },
          {
            title: 'Signs and Support',
            headers: ['Sign', 'Grounding Response'],
            rows: [
              ['Racing thoughts', 'Slow breathing and sensory focus'],
              ['Overstimulation', 'Body scan or quiet walk'],
              ['Feeling floaty', 'Earthing or weighted blanket'],
              ['Emotional overload', 'Hold a stone and name your feelings'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Breathwork',
            href: '/grimoire/meditation/breathwork',
            type: 'Practice',
          },
          {
            name: 'Meditation Overview',
            href: '/grimoire/meditation',
            type: 'Guide',
          },
          { name: 'Chakras', href: '/grimoire/chakras', type: 'Guide' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Meditation', href: '/grimoire/meditation' },
          { label: 'Grounding', href: '/grimoire/meditation/grounding' },
        ]}
        internalLinks={[
          {
            text: 'Breathwork Practices',
            href: '/grimoire/meditation/breathwork',
          },
          {
            text: 'Meditation Techniques',
            href: '/grimoire/meditation/techniques',
          },
          { text: 'Root Chakra', href: '/grimoire/chakras/root' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={[
          {
            question: 'How often should I ground?',
            answer:
              'Daily grounding is ideal, especially if you meditate or do energy work. Short, frequent practices are more effective than occasional long ones.',
          },
          {
            question: 'What is the fastest grounding technique?',
            answer:
              'The 5-4-3-2-1 sensory method is one of the quickest because it anchors your attention in the present moment.',
          },
          {
            question: 'Can grounding help with anxiety?',
            answer:
              'Yes. Grounding activates the parasympathetic nervous system and helps interrupt spiraling thoughts.',
          },
          {
            question: 'Do I need crystals or tools to ground?',
            answer:
              'No. Tools can help, but your breath, body, and attention are enough to ground effectively.',
          },
          {
            question: 'How do I know if grounding worked?',
            answer:
              'You may notice slower breathing, clearer thoughts, and a heavier, more settled feeling in your body.',
          },
          {
            question: 'Can grounding be done indoors?',
            answer:
              'Absolutely. While earthing is great outside, many grounding practices work well inside with breath, touch, and sensory awareness.',
          },
          {
            question: 'Is grounding the same as mindfulness?',
            answer:
              'They overlap, but grounding is more body-focused. Mindfulness observes thoughts and sensations, while grounding emphasizes feeling stable, safe, and present in the body.',
          },
        ]}
        ctaText='Try a grounding method now'
        ctaHref='/grimoire/meditation/grounding/earthing'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
