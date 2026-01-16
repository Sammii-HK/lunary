export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { createItemListSchema } from '@/lib/schema';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Crystals from '../components/Crystals';
import {
  crystalCategories,
  crystalDatabase,
  searchCrystals,
} from '@/constants/grimoire/crystals';
import { stringToKebabCase } from 'utils/string';
import { Heading } from '@/components/ui/Heading';

export const metadata: Metadata = {
  title: 'Crystals A-Z: Meanings, Properties & Healing Guide - Lunary',
  description:
    'Complete guide to over 200 crystals, their meanings and usage. Learn how to choose, cleanse, and work with crystals for healing, protection, and magical practice.',
  keywords: [
    'crystals',
    'crystal meanings',
    'crystal healing',
    'crystal guide',
    'gemstones',
    'crystal properties',
    'how to use crystals',
    'crystal magic',
  ],
  openGraph: {
    title: 'Crystals A-Z: Meanings, Properties & Healing Guide - Lunary',
    description:
      'Complete guide to crystals for healing, protection, and magical practice.',
    type: 'article',
    url: 'https://lunary.app/grimoire/crystals',
    images: [
      {
        url: '/api/og/grimoire/crystals',
        width: 1200,
        height: 630,
        alt: 'Crystals Guide - Lunary',
      },
    ],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/crystals',
  },
};

const faqs = [
  {
    question: 'How do I choose the right crystal?',
    answer:
      'Trust your intuition. If a crystal catches your eye or you feel drawn to it, that\'s often the one you need. You can also choose based on intention—research which crystals correspond to your goal. In person, hold several and notice which feels "right" in your hand.',
  },
  {
    question: 'How do I cleanse my crystals?',
    answer:
      'Common methods include: moonlight (leave under a Full Moon overnight), running water (not for soft or water-soluble crystals), salt (bury in salt for 24 hours), smoke (pass through sage or incense smoke), sound (use singing bowls or bells), or selenite (place on a selenite slab overnight).',
  },
  {
    question: 'Which crystals work well together?',
    answer:
      'Complementary crystals enhance each other: Rose Quartz + Clear Quartz (amplify love), Amethyst + Selenite (spiritual cleansing), Black Tourmaline + Clear Quartz (protection with clarity). Avoid pairing conflicting energies (e.g., calming and energizing stones together).',
  },
  {
    question: 'Can I put crystals in water?',
    answer:
      'Some crystals are water-safe (Quartz, Amethyst, Agate), while others dissolve or are damaged (Selenite, Halite, Malachite). Always research your specific crystal before water exposure. When in doubt, use other cleansing methods.',
  },
  {
    question: 'How do I charge a crystal?',
    answer:
      'After cleansing, charge by placing in sunlight or moonlight, holding and visualizing your intention flowing into it, or placing on a crystal cluster. Full Moon light is especially powerful for charging. State your intention clearly as you charge.',
  },
  {
    question:
      'Can I use crystals for magic even if I do not believe they have power?',
    answer:
      'Crystals serve as focus points for intention. Whether you view them as having inherent energy or as psychological tools, they help concentrate your attention on your goal. Skeptical practitioners often find crystals useful as ritual objects and visual reminders of their intentions.',
  },
  {
    question: 'Are some crystals dangerous?',
    answer:
      'Some crystals contain toxic minerals and should not be placed in water or handled extensively without washing hands afterward. Examples include malachite (copper), cinnabar (mercury), and galena (lead). Research any crystal before using in elixirs or prolonged skin contact.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Crystal Uses',
    links: [
      { label: 'Protection Magic', href: '/grimoire/protection' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Meditation', href: '/grimoire/meditation' },
      { label: 'Chakras', href: '/grimoire/chakras' },
    ],
  },
  {
    title: 'Related Topics',
    links: [
      { label: 'Spells & Rituals', href: '/grimoire/spells' },
      { label: 'Moon Magic', href: '/grimoire/moon' },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      {
        label: 'Color Correspondences',
        href: '/grimoire/correspondences/colors',
      },
      { label: 'Chakra Healing', href: '/grimoire/chakras' },
      { label: 'Magical Correspondences', href: '/grimoire/correspondences' },
    ],
  },
  {
    title: 'Related Correspondences',
    links: [
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Colors', href: '/grimoire/correspondences/colors' },
      { label: 'Elements', href: '/grimoire/correspondences/elements' },
    ],
  },
  {
    title: 'Learn More',
    links: [
      {
        label: 'Crystal Healing Guide',
        href: '/grimoire/guides/crystal-healing-guide',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

const tableOfContents = [
  { href: '#how-crystals-work', label: '1. How Crystals Work' },
  { href: '#choosing', label: '2. Choosing Your Crystals' },
  { href: '#cleansing', label: '3. Cleansing & Charging' },
  { href: '#crystal-healing', label: '4. Crystal Healing & Practices' },
  { href: '#working-with', label: '5. Working with Crystals' },
  { href: '#starter-kit', label: '6. Beginner Starter Kit' },
  { href: '#all-crystals', label: '7. All Crystals A-Z' },
  { href: '#faq', label: '8. FAQ' },
];

type CrystalSearchParams = {
  q?: string;
};

export default async function CrystalsPage({
  searchParams,
}: {
  searchParams?: CrystalSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams?.q || '').trim();
  const normalizedQuery = query.toLowerCase();
  const querySlug = stringToKebabCase(query);
  const categoryMatch = query
    ? crystalCategories.find((category) => {
        const normalizedCategory = category.toLowerCase();
        return (
          normalizedCategory === normalizedQuery ||
          normalizedCategory.includes(normalizedQuery) ||
          stringToKebabCase(category) === querySlug
        );
      })
    : undefined;
  const filteredCrystals = query
    ? categoryMatch
      ? crystalDatabase.filter((crystal) =>
          crystal.categories?.includes(categoryMatch),
        )
      : searchCrystals(query)
    : crystalDatabase;
  const totalCount = filteredCrystals.length;
  const categories = crystalCategories
    .map((categoryName) => {
      const crystalsInCategory = filteredCrystals.filter((crystal) =>
        crystal.categories?.includes(categoryName),
      );
      return {
        name: categoryName,
        crystals: crystalsInCategory.map((crystal) => ({
          name: crystal.name,
          properties:
            crystal.description || crystal.metaphysicalProperties || '',
          slug: stringToKebabCase(crystal.name),
        })),
      };
    })
    .filter((category) => category.crystals.length > 0);
  const crystalListSchema = createItemListSchema({
    name: 'Complete Crystal Guide',
    description:
      'Comprehensive guide to crystals, their meanings, properties, and how to work with them.',
    url: 'https://lunary.app/grimoire/crystals',
    items: crystalDatabase.slice(0, 50).map((crystal) => ({
      name: crystal.name,
      url: `https://lunary.app/grimoire/crystals/${crystal.id}`,
      description: crystal.description,
    })),
  });

  return (
    <SEOContentTemplate
      title='Crystals A-Z: Meanings, Properties & Healing Guide - Lunary'
      h1='Crystals'
      subtitle='Meanings, Properties & Healing'
      description='Crystals are powerful allies for healing, protection, and magical work. Each stone carries unique vibrational properties that can support your intentions, balance energy, and amplify your practice.'
      keywords={[
        'crystals',
        'crystal meanings',
        'crystal healing',
        'crystal guide',
        'gemstones',
        'crystal properties',
        'how to use crystals',
        'crystal magic',
      ]}
      canonicalUrl='https://lunary.app/grimoire/crystals'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Crystals', href: '/grimoire/crystals' },
      ]}
      intro={`This is a highlevel overview of working with crystals for healing, protection, and magical practice. For a more comprehensive guide, read the Complete Crystal Healing Guide.`}
      fullGuide={{
        href: '/grimoire/guides/crystal-healing-guide',
        title: 'Complete Crystal Healing Guide',
        description:
          'Learn crystal selection, cleansing, programming, and healing practices',
      }}
      tldr='Crystals support healing, protection, and manifestation—this page summarizes how to choose them, work with their energy, and explore the full library.'
      tableOfContents={tableOfContents}
      faqs={faqs}
      additionalSchemas={[crystalListSchema]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='crystals'
          title='Crystal Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      {/* Section 1 */}
      <section id='how-crystals-work' className='mb-16'>
        <Heading as='h2' variant='h2'>
          1. How Crystals Work
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals form deep within the Earth over millions of years, their
          molecular structures creating unique vibrational frequencies. From a
          metaphysical perspective, these frequencies interact with your own
          energy field, supporting specific intentions.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Practically, crystals serve as:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>
            • <strong>Focus tools:</strong> They anchor your attention on your
            intention
          </li>
          <li>
            • <strong>Symbolic reminders:</strong> Their presence recalls your
            goals
          </li>
          <li>
            • <strong>Ritual objects:</strong> They add weight and meaning to
            magical work
          </li>
          <li>
            • <strong>Energy amplifiers:</strong> They can intensify the energy
            you direct
          </li>
        </ul>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <p className='text-zinc-400 text-sm'>
            Whether you see crystals as having inherent metaphysical properties
            or as psychological tools, they can be valuable allies in your
            practice. Their beauty and earth-born nature connect you to
            something larger than yourself.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id='choosing' className='mb-16'>
        <Heading as='h2' variant='h2'>
          2. Choosing Your Crystals
        </Heading>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              By Intuition
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Which crystal catches your eye? Which do you feel drawn to touch?
              Trust that pull—your subconscious often knows what you need.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              By Intention
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Research which crystals correspond to your goal. Need protection?
              Consider black tourmaline. Seeking love? Try rose quartz.
              Manifesting? Look to citrine.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              By Chakra
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Match crystal colors to chakras: red/root, orange/sacral,
              yellow/solar plexus, green-pink/heart, blue/throat, indigo/third
              eye, violet-white/crown.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              By Feel
            </Heading>
            <p className='text-zinc-400 text-sm'>
              If buying in person, hold several crystals. Notice which feels
              warm, tingly, or &quot;right&quot; in your hand. Your body can
              sense resonance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id='cleansing' className='mb-16'>
        <Heading as='h2' variant='h2'>
          3. Cleansing & Charging
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals absorb energy from their environment and previous handlers.
          Cleansing clears this accumulated energy; charging programs them with
          your intention.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <Heading as='h3' variant='h3'>
            Cleansing Methods
          </Heading>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>Moonlight:</strong> Leave under
              the Full Moon overnight (safe for all crystals)
            </li>
            <li>
              <strong className='text-zinc-200'>Running water:</strong> Hold
              under a stream for a minute (not for soft or water-soluble stones)
            </li>
            <li>
              <strong className='text-zinc-200'>Salt:</strong> Bury in sea salt
              for 24 hours (not for porous stones)
            </li>
            <li>
              <strong className='text-zinc-200'>Smoke:</strong> Pass through
              sage, palo santo, or incense smoke
            </li>
            <li>
              <strong className='text-zinc-200'>Sound:</strong> Use singing
              bowls, bells, or tuning forks
            </li>
            <li>
              <strong className='text-zinc-200'>Selenite:</strong> Place on a
              selenite slab overnight (selenite self-cleanses)
            </li>
          </ul>
        </div>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <Heading
            as='h3'
            variant='h3'
            // className='text-lunary-primary-300 mb-3'
          >
            Charging Your Crystal
          </Heading>
          <ol className='space-y-2 text-zinc-300 text-sm'>
            <li>1. Hold the cleansed crystal in your hands</li>
            <li>2. Close your eyes and take a few deep breaths</li>
            <li>3. Clearly state or visualize your intention</li>
            <li>4. Imagine that intention flowing into the crystal</li>
            <li>5. Say: &quot;I charge this crystal for [purpose]&quot;</li>
          </ol>
        </div>
      </section>

      {/* Section 4 */}
      <section id='crystal-healing' className='mb-16'>
        <Heading as='h2' variant='h2'>
          4. Crystal Healing & Practices
        </Heading>

        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3' className='text-lunary-primary-300'>
              Crystal Grids
            </Heading>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Crystal grids amplify energy by arranging crystals in sacred
              geometric patterns. Place a central crystal (master stone) in the
              center, then arrange supporting stones around it. Activate by
              connecting the stones with intention, visualization, or a wand.
              Common patterns include circles, triangles, and flower of life.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Manifestation, protection, healing, abundance
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3' className='text-lunary-primary-300'>
              Crystal Programming
            </Heading>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Programming sets specific intentions into your crystals. Hold the
              crystal, clear your mind, and visualize your intention flowing
              into the stone. State your intention clearly either aloud or
              silently. The crystal will hold and amplify this energy until
              reprogrammed or cleansed.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Setting specific goals, directing crystal energy
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3' className='text-lunary-primary-300'>
              Crystal Cleansing Methods
            </Heading>
            <div className='space-y-2 text-sm text-zinc-300'>
              <div>
                <strong>Moonlight:</strong> Place crystals under full moon
                overnight (avoid direct sunlight for some crystals)
              </div>
              <div>
                <strong>Sunlight:</strong> Brief exposure to sun (check crystal
                compatibility - some fade)
              </div>
              <div>
                <strong>Water:</strong> Running water or salt water (avoid
                porous/soft crystals)
              </div>
              <div>
                <strong>Smoke:</strong> Pass through sage, palo santo, or
                incense smoke
              </div>
              <div>
                <strong>Sound:</strong> Use singing bowls, bells, or chimes
              </div>
              <div>
                <strong>Earth:</strong> Bury in soil overnight (gentle method)
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3' className='text-lunary-primary-300'>
              Chakra Crystals
            </Heading>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-300'>
              <div>
                <strong>Root:</strong> Red Jasper, Hematite, Black Tourmaline
              </div>
              <div>
                <strong>Sacral:</strong> Carnelian, Orange Calcite, Sunstone
              </div>
              <div>
                <strong>Solar Plexus:</strong> Citrine, Tiger Eye, Yellow Jasper
              </div>
              <div>
                <strong>Heart:</strong> Rose Quartz, Green Aventurine, Jade
              </div>
              <div>
                <strong>Throat:</strong> Blue Lace Agate, Aquamarine, Sodalite
              </div>
              <div>
                <strong>Third Eye:</strong> Amethyst, Lapis Lazuli, Fluorite
              </div>
              <div>
                <strong>Crown:</strong> Clear Quartz, Amethyst, Selenite
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section id='working-with' className='mb-16'>
        <Heading as='h2' variant='h2'>
          5. Working with Crystals
        </Heading>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              Carry Them
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Keep a small tumbled stone in your pocket or bag. Touch it
              throughout the day to reconnect with your intention.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              Wear Them
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Crystal jewelry keeps the stone in contact with your energy field
              all day. Pendants near the heart are especially powerful.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              Meditate With Them
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Hold a crystal during meditation or place it on a relevant chakra.
              Focus on its energy and let impressions arise.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              Place in Space
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Put protective crystals by doors, calming ones in the bedroom,
              focus stones on your desk. Let them anchor energy in your space.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              Use in Rituals
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Include crystals on your altar, in candle spells, in jar spells,
              or as offerings. They amplify ritual energy.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <Heading as='h3' variant='h3'>
              Create Grids
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Arrange multiple crystals in sacred geometric patterns to create
              energy fields for specific purposes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section id='starter-kit' className='mb-16'>
        <Heading as='h2' variant='h2'>
          6. Beginner&apos;s Starter Kit
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          If you&apos;re just starting, these versatile crystals cover most
          common needs:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Link
            href='/grimoire/crystals/clear-quartz'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <Heading as='h3' variant='h3'>
              Clear Quartz
            </Heading>
            <p className='text-zinc-400 text-sm'>
              The &quot;master healer.&quot; Amplifies intention, cleanses
              energy, substitutes for almost any crystal.
            </p>
          </Link>
          <Link
            href='/grimoire/crystals/amethyst'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <Heading as='h3' variant='h3'>
              Amethyst
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Intuition, protection, peace. Excellent for meditation and
              developing psychic abilities.
            </p>
          </Link>
          <Link
            href='/grimoire/crystals/rose-quartz'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <Heading as='h3' variant='h3'>
              Rose Quartz
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Love, self-compassion, heart healing. The go-to stone for
              emotional work.
            </p>
          </Link>
          <Link
            href='/grimoire/crystals/black-tourmaline'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <Heading as='h3' variant='h3'>
              Black Tourmaline
            </Heading>
            <p className='text-zinc-400 text-sm'>
              Protection, grounding, absorbs negativity. Essential for empaths
              and sensitive people.
            </p>
          </Link>
        </div>
      </section>

      {/* Section 6 - Crystals Component */}
      <section id='all-crystals' className='mb-16'>
        <Heading as='h2' variant='h2'>
          7. All Crystals A-Z
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Browse our complete crystal database. Click any crystal to see its
          full properties, correspondences, and uses.
        </p>

        <Crystals
          categories={categories}
          totalCount={totalCount}
          initialQuery={query}
        />
      </section>
    </SEOContentTemplate>
  );
}
