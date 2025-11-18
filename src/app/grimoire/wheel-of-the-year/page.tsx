import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import WheelOfTheYear from '../components/WheelOfTheYear';

export const metadata: Metadata = {
  title: 'Wheel of the Year: Sabbats & Seasonal Celebrations - Lunary',
  description:
    'Discover the Wheel of the Year, Sabbats, and seasonal celebrations. Connect with ancient traditions and cosmic cycles. Learn how to honor each sabbat with rituals and practices. Complete guide to pagan holidays.',
  keywords: [
    'wheel of the year',
    'sabbats',
    'pagan holidays',
    'seasonal celebrations',
    'witchcraft holidays',
    'pagan calendar',
    'sabbat rituals',
    'wheel of the year guide',
  ],
  openGraph: {
    title: 'Wheel of the Year: Sabbats & Seasonal Celebrations - Lunary',
    description:
      'Discover the Wheel of the Year, Sabbats, and seasonal celebrations. Connect with ancient traditions and cosmic cycles.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Wheel of the Year: Sabbats & Seasonal Celebrations - Lunary',
    description:
      'Discover the Wheel of the Year, Sabbats, and seasonal celebrations. Connect with ancient traditions and cosmic cycles.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/wheel-of-the-year',
  },
};

export default function WheelOfTheYearPage() {
  return (
    <>
      <SEOContentTemplate
        title='Wheel of the Year: Sabbats & Seasonal Celebrations - Lunary'
        h1='Wheel of the Year'
        description='Discover the Wheel of the Year, Sabbats, and seasonal celebrations. Connect with ancient traditions and cosmic cycles. Learn how to honor each sabbat.'
        keywords={[
          'wheel of the year',
          'sabbats',
          'pagan holidays',
          'seasonal celebrations',
          'witchcraft holidays',
          'pagan calendar',
        ]}
        canonicalUrl='https://lunary.app/grimoire/wheel-of-the-year'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
        ]}
        intro={`The Wheel of the Year is a cycle of eight seasonal festivals that mark the turning of the seasons and the sun's journey through the year. These Sabbats connect modern practitioners with ancient traditions, natural rhythms, and cosmic cycles. Celebrating the Wheel of the Year helps you align with nature, honor the changing seasons, and deepen your spiritual practice. This comprehensive guide covers all eight Sabbats, their meanings, correspondences, and how to celebrate them.`}
        meaning={`The Wheel of the Year represents the eternal cycle of birth, growth, death, and rebirth. It honors both the solar cycle (solstices and equinoxes) and the agricultural cycle (planting, growing, harvesting, resting). Each Sabbat marks a significant point in this cycle and offers opportunities for reflection, celebration, and magical work.

The eight Sabbats are divided into Greater Sabbats (cross-quarter days) and Lesser Sabbats (solstices and equinoxes). Greater Sabbats include Samhain, Imbolc, Beltane, and Lughnasadh. Lesser Sabbats include Yule, Ostara, Litha, and Mabon.

Each Sabbat has specific themes, correspondences, colors, foods, and activities. Understanding these helps you celebrate authentically and align your magical work with seasonal energies. The Wheel of the Year creates a rhythm to your practice and connects you with the natural world.`}
        howToWorkWith={[
          'Learn the dates and meanings of each Sabbat',
          'Create altars with seasonal correspondences',
          'Prepare traditional foods for each celebration',
          'Perform rituals aligned with Sabbat themes',
          'Use seasonal correspondences in spellwork',
          'Honor deities associated with each Sabbat',
          'Connect with nature during each season',
          'Keep a Sabbat journal to track your celebrations',
        ]}
        faqs={[
          {
            question: 'When are the Sabbats celebrated?',
            answer:
              'The dates vary slightly each year. Greater Sabbats: Samhain (Oct 31), Imbolc (Feb 1-2), Beltane (May 1), Lughnasadh (Aug 1). Lesser Sabbats: Yule (Dec 21-22), Ostara (Mar 20-21), Litha (Jun 20-21), Mabon (Sep 22-23). Many celebrate on the nearest weekend for convenience.',
          },
          {
            question: 'Do I need to celebrate all eight Sabbats?',
            answer:
              'No! Celebrate the Sabbats that resonate with you. Some practitioners celebrate all eight, others focus on specific ones. Start with one or two that feel meaningful, and gradually expand your practice. The important thing is authentic connection, not perfection.',
          },
          {
            question: "How do I celebrate Sabbats if I'm solitary?",
            answer:
              "Solitary celebrations can be powerful! Create a simple ritual, prepare seasonal foods, decorate your altar, spend time in nature, perform spellwork aligned with the Sabbat's energy, and reflect on the season's meaning. Even small celebrations honor the Wheel of the Year.",
          },
        ]}
        internalLinks={[
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
        ]}
      />
      <div className='max-w-4xl mx-auto -mt-8'>
        <WheelOfTheYear />
      </div>
    </>
  );
}
