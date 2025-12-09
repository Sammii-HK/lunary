import { Metadata } from 'next';
import Link from 'next/link';
import { Wind } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

const breathworkTechniques = [
  {
    slug: 'deep-belly-breathing',
    name: 'Deep Belly Breathing',
    aka: 'Diaphragmatic Breathing',
    description: 'Foundation technique for stress relief and relaxation',
    difficulty: 'Beginner',
  },
  {
    slug: 'box-breathing',
    name: 'Box Breathing',
    aka: '4-4-4-4 Breathing',
    description: 'Equal counts for inhale, hold, exhale, hold',
    difficulty: 'Beginner',
  },
  {
    slug: '4-7-8-breathing',
    name: '4-7-8 Breathing',
    aka: 'Relaxing Breath',
    description: 'Calming technique for sleep and anxiety',
    difficulty: 'Beginner',
  },
  {
    slug: 'alternate-nostril',
    name: 'Alternate Nostril Breathing',
    aka: 'Nadi Shodhana',
    description: 'Balances left and right brain hemispheres',
    difficulty: 'Intermediate',
  },
  {
    slug: 'breath-of-fire',
    name: 'Breath of Fire',
    aka: 'Kapalabhati',
    description: 'Energizing rapid breathing technique',
    difficulty: 'Intermediate',
  },
  {
    slug: 'holotropic-breathwork',
    name: 'Holotropic Breathwork',
    aka: 'Transformational Breathing',
    description: 'Intense practice for altered states',
    difficulty: 'Advanced',
  },
];

export const metadata: Metadata = {
  title: 'Breathwork Techniques: Box Breathing, 4-7-8 & Pranayama - Lunary',
  description:
    'Master breathwork techniques from box breathing to pranayama. Learn how conscious breathing transforms stress, energy, and spiritual practice. Free breathwork guide.',
  keywords: [
    'breathwork',
    'breathing techniques',
    'pranayama',
    'box breathing',
    '4-7-8 breathing',
    'meditation breathing',
    'breath of fire',
    'alternate nostril breathing',
  ],
  openGraph: {
    title: 'Breathwork Techniques: Box Breathing, 4-7-8 & Pranayama | Lunary',
    description:
      'Master breathwork from box breathing to pranayama. Transform stress and energy with conscious breathing.',
    url: 'https://lunary.app/grimoire/meditation/breathwork',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/meditation',
        width: 1200,
        height: 630,
        alt: 'Breathwork Techniques Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breathwork Techniques | Lunary',
    description:
      'Master conscious breathing for stress relief and spiritual practice.',
    images: ['/api/og/grimoire/meditation'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/meditation/breathwork',
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
    question: 'How often should I practice breathwork?',
    answer:
      'Start with 5-10 minutes daily. You can practice anytime—before meditation, during stressful moments, or as part of your morning routine. Consistency matters more than duration. Even 3 deep breaths can shift your state.',
  },
  {
    question: 'Can breathwork help with anxiety?',
    answer:
      'Yes! Breathwork directly affects your nervous system. Slow, deep breathing activates the parasympathetic response, reducing anxiety and stress. Box breathing and 4-7-8 are especially effective for anxiety relief.',
  },
  {
    question: 'What if I feel dizzy during breathwork?',
    answer:
      'Stop immediately and return to normal breathing. Dizziness usually means breathing too fast or holding too long. Start with gentler techniques and build up gradually. Never force your breath.',
  },
  {
    question: 'Which breathwork technique is best for beginners?',
    answer:
      'Deep belly breathing is the foundation—start there. Then try box breathing (4-4-4-4) for its simplicity. Once comfortable, explore 4-7-8 for relaxation. Avoid advanced techniques like Breath of Fire until you have experience.',
  },
  {
    question: 'Can breathwork help with energy work and magic?',
    answer:
      'Absolutely! Breathwork is essential for energy work. It helps raise, direct, and ground energy. Many practitioners use specific breathing patterns during spellwork and rituals to enhance their effectiveness.',
  },
];

export default function BreathworkIndexPage() {
  const breathworkListSchema = createItemListSchema({
    name: 'Breathwork Techniques',
    description:
      'Complete guide to breathwork techniques from beginner to advanced, including box breathing, pranayama, and transformational breathwork.',
    url: 'https://lunary.app/grimoire/meditation/breathwork',
    items: breathworkTechniques.map((technique) => ({
      name: technique.name,
      url: `https://lunary.app/grimoire/meditation/breathwork/${technique.slug}`,
      description: technique.description,
    })),
  });

  return (
    <>
      {renderJsonLd(breathworkListSchema)}
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <SEOContentTemplate
          title='Breathwork Techniques | Lunary'
          h1='Breathwork: Master Box Breathing, 4-7-8 & Pranayama'
          description='Conscious breathing is one of the most powerful tools for transformation. Learn techniques to calm anxiety, increase energy, and access altered states.'
          keywords={[
            'breathwork',
            'breathing techniques',
            'pranayama',
            'box breathing',
            'meditation',
          ]}
          canonicalUrl='https://lunary.app/grimoire/meditation/breathwork'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Meditation', href: '/grimoire/meditation' },
            { label: 'Breathwork', href: '/grimoire/meditation/breathwork' },
          ]}
          whatIs={{
            question: 'What is breathwork?',
            answer:
              'Breathwork is the practice of conscious, controlled breathing to regulate energy, calm the mind, and achieve specific mental, physical, or spiritual states. Rooted in yogic pranayama and used across cultures for millennia, breathwork directly affects your nervous system, allowing you to shift from stress to calm, or from lethargy to energy.',
          }}
          tldr='Breathwork uses conscious breathing to transform your state. Start with deep belly breathing, progress to box breathing (4-4-4-4), then 4-7-8 for sleep. Practice 5-10 minutes daily for best results.'
          meaning={`Breathwork connects your conscious mind with your body's energy systems. Your breath is the bridge between the physical and energetic realms. By controlling your breath, you can regulate your energy, calm your nervous system, and prepare for magical or spiritual work.

**The Science of Breathwork:**

Different breathing patterns activate different nervous system responses:

- **Slow, deep breathing** activates the parasympathetic nervous system (rest and digest), promoting relaxation and reducing stress hormones.
- **Rapid breathing** activates the sympathetic nervous system (fight or flight), increasing energy and alertness.
- **Balanced breathing** (like box breathing) creates equilibrium and mental clarity.

**Breathwork Categories:**

**Calming Techniques:** Deep belly breathing, 4-7-8 breathing. Slow the heart rate, reduce anxiety, prepare for sleep.

**Balancing Techniques:** Box breathing, alternate nostril breathing. Create mental clarity, balance energy, improve focus.

**Energizing Techniques:** Breath of Fire, rapid breathing. Increase alertness, raise energy, prepare for action.

**Transformational Techniques:** Holotropic breathwork, rebirthing. Access altered states, process emotions, spiritual experiences.

**Benefits of Regular Practice:**

- Reduced stress and anxiety
- Improved focus and mental clarity
- Better sleep quality
- Enhanced energy levels
- Deeper meditation experiences
- More effective magical practice
- Emotional regulation`}
          howToWorkWith={[
            'Start with deep belly breathing as your foundation',
            'Practice 5-10 minutes daily at the same time',
            'Never force or strain your breath',
            'Use calming techniques before sleep',
            'Use balancing techniques before meditation',
            'Use energizing techniques before physical activity',
            'Keep a breathwork journal to track effects',
            'Combine with other practices (meditation, yoga, magic)',
          ]}
          tables={[
            {
              title: 'Breathwork Technique Guide',
              headers: ['Technique', 'Pattern', 'Best For'],
              rows: [
                [
                  'Deep Belly',
                  'Slow inhale, slow exhale',
                  'Stress relief, grounding',
                ],
                ['Box Breathing', '4-4-4-4 counts', 'Focus, balance, clarity'],
                [
                  '4-7-8 Breathing',
                  '4 in, 7 hold, 8 out',
                  'Sleep, anxiety, calm',
                ],
                [
                  'Alternate Nostril',
                  'Switch nostrils',
                  'Brain balance, energy flow',
                ],
                [
                  'Breath of Fire',
                  'Rapid belly pumps',
                  'Energy, alertness, cleansing',
                ],
              ],
            },
          ]}
          journalPrompts={[
            'How does my body feel before and after breathwork?',
            'Which techniques work best for my needs?',
            'What emotions or thoughts arise during practice?',
            'How has consistent practice changed my baseline state?',
          ]}
          relatedItems={[
            {
              name: 'Meditation Guide',
              href: '/grimoire/meditation',
              type: 'Guide',
            },
            {
              name: 'Grounding',
              href: '/grimoire/meditation/grounding',
              type: 'Practice',
            },
            { name: 'Chakras', href: '/grimoire/chakras', type: 'Guide' },
            {
              name: 'Yoga Poses',
              href: '/grimoire/meditation/techniques',
              type: 'Practice',
            },
          ]}
          internalLinks={[
            { text: 'Meditation Overview', href: '/grimoire/meditation' },
            {
              text: 'Grounding Techniques',
              href: '/grimoire/meditation/grounding',
            },
            { text: 'Chakra Guide', href: '/grimoire/chakras' },
            { text: 'Grimoire Home', href: '/grimoire' },
          ]}
          ctaText='Ready to deepen your practice?'
          ctaHref='/pricing'
          faqs={faqs}
        >
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Breathwork Techniques
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {breathworkTechniques.map((technique) => (
                <Link
                  key={technique.slug}
                  href={`/grimoire/meditation/breathwork/${technique.slug}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-cyan-700/50 transition-all'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        technique.difficulty === 'Beginner'
                          ? 'bg-emerald-900/50 text-emerald-300'
                          : technique.difficulty === 'Intermediate'
                            ? 'bg-amber-900/50 text-amber-300'
                            : 'bg-red-900/50 text-red-300'
                      }`}
                    >
                      {technique.difficulty}
                    </span>
                  </div>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-cyan-300 transition-colors mb-1'>
                    {technique.name}
                  </h3>
                  <p className='text-sm text-zinc-400 mb-2'>{technique.aka}</p>
                  <p className='text-sm text-zinc-400'>
                    {technique.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </SEOContentTemplate>
      </div>
    </>
  );
}
