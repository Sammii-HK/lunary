import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import ModernWitchcraft from '../components/ModernWitchcraft';

export const metadata: Metadata = {
  title: 'Modern Witchcraft: Paths, Tools & Practices - Lunary',
  description:
    'Discover different paths of modern witchcraft, essential tools, ethics, coven vs solitary practice, and creating your Book of Shadows. Comprehensive guide to modern witchcraft for beginners and experienced practitioners.',
  keywords: [
    'modern witchcraft',
    'witchcraft',
    'witchcraft tools',
    'witchcraft ethics',
    'witchcraft paths',
    'book of shadows',
    'witchcraft practices',
    'how to become a witch',
  ],
  openGraph: {
    title: 'Modern Witchcraft: Paths, Tools & Practices - Lunary',
    description:
      'Discover different paths of modern witchcraft, essential tools, ethics, coven vs solitary practice, and creating your Book of Shadows.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Modern Witchcraft: Paths, Tools & Practices - Lunary',
    description:
      'Discover different paths of modern witchcraft, essential tools, ethics, coven vs solitary practice, and creating your Book of Shadows.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft',
  },
};

export default function ModernWitchcraftPage() {
  return (
    <>
      <SEOContentTemplate
        title='Modern Witchcraft: Paths, Tools & Practices - Lunary'
        h1='Modern Witchcraft'
        description='Discover different paths of modern witchcraft, essential tools, ethics, coven vs solitary practice, and creating your Book of Shadows. Comprehensive guide to modern witchcraft.'
        keywords={[
          'modern witchcraft',
          'witchcraft',
          'witchcraft tools',
          'witchcraft ethics',
          'witchcraft paths',
          'book of shadows',
        ]}
        canonicalUrl='https://lunary.app/grimoire/modern-witchcraft'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
        ]}
        intro='Modern witchcraft is a diverse spiritual path that honors nature, works with energy, and empowers practitioners to create positive change. Unlike historical stereotypes, modern witchcraft is a personal, ethical practice that can be adapted to any lifestyle. This comprehensive guide covers different witchcraft paths, essential tools, ethics, and practices for both beginners and experienced practitioners.'
        meaning={`Witchcraft is a spiritual practice that works with natural energies, intention, and the cycles of nature. It's not about supernatural powers but rather about understanding energy, correspondences, and how to align your will with natural forces to create change. Modern witchcraft is highly personal—each practitioner develops their own path, practices, and beliefs.

There are many paths within witchcraft: Green Witchcraft (nature-focused), Kitchen Witchcraft (home and hearth), Hedge Witchcraft (spirit work), Sea Witchcraft (ocean magic), Cosmic Witchcraft (astrology-focused), Eclectic Witchcraft (combining traditions), and many more. Each path offers unique approaches while sharing core principles.

Witchcraft ethics emphasize personal responsibility, harm none (or harm reduction), and respecting free will. The Wiccan Rede ("An it harm none, do what ye will") guides many practitioners, while others develop their own ethical codes. The key is acting with intention, respect, and responsibility.`}
        howToWorkWith={[
          'Choose a witchcraft path that resonates with you',
          'Gather essential tools gradually',
          'Create your Book of Shadows',
          'Develop a regular practice routine',
          'Learn about correspondences and timing',
          'Practice meditation and energy work',
          'Study different traditions and practices',
          'Connect with nature and natural cycles',
        ]}
        faqs={[
          {
            question: 'Do I need to join a coven?',
            answer:
              "No! Many practitioners are solitary witches who practice alone. Covens offer community, mentorship, and shared rituals, but they're not required. Some practitioners join covens later, others remain solitary. Choose what works for your lifestyle and needs.",
          },
          {
            question: 'What tools do I need to start?',
            answer:
              'You can start with minimal tools: candles, a journal (Book of Shadows), basic herbs, and your intention. Essential tools include an athame (ritual knife), wand, chalice, pentacle, and cauldron, but these can be added gradually. Many practitioners start simple and expand their tool collection over time.',
          },
          {
            question: 'Is witchcraft a religion?',
            answer:
              'Witchcraft can be a religion (as in Wicca), a spiritual practice, or simply a set of techniques. Some witches are religious, others are spiritual but not religious, and some are atheist. Witchcraft is flexible and adaptable to your beliefs.',
          },
        ]}
        internalLinks={[
          {
            text: 'Spellcraft Fundamentals',
            href: '/grimoire/spellcraft-fundamentals',
          },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
          { text: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <ModernWitchcraft />
      </div>
    </>
  );
}
