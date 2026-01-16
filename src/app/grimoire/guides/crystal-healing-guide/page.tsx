export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { zodiacSymbol } from '@/constants/symbols';

export const metadata: Metadata = {
  title:
    'Crystal Healing: The Complete Guide to Crystals & Their Powers - Lunary',
  description:
    'Discover the healing properties of crystals and gemstones. Learn how to cleanse, charge, and use crystals for healing, meditation, and manifestation. Complete guide with zodiac and chakra correspondences.',
  keywords: [
    'crystal healing',
    'healing crystals',
    'crystal meanings',
    'crystal properties',
    'crystals for healing',
    'crystals and zodiac',
    'chakra crystals',
    'crystal guide',
    'how to use crystals',
    'crystal cleansing',
    'crystal charging',
    'gemstone meanings',
    'crystal energy',
    'crystal meditation',
  ],
  openGraph: {
    title:
      'Crystal Healing: The Complete Guide to Crystals & Their Powers - Lunary',
    description:
      'Discover the healing properties of crystals and gemstones. Learn how to cleanse, charge, and use crystals for healing and manifestation.',
    type: 'article',
    url: 'https://lunary.app/grimoire/guides/crystal-healing-guide',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/guides/crystal-healing-guide',
  },
};

const ESSENTIAL_CRYSTALS = [
  {
    name: 'Clear Quartz',
    nickname: 'The Master Healer',
    properties: ['amplification', 'clarity', 'healing', 'manifestation'],
    chakra: 'Crown',
    zodiac: ['All signs'],
    color: 'bg-zinc-200',
  },
  {
    name: 'Amethyst',
    nickname: 'The Intuitive Stone',
    properties: ['spiritual growth', 'intuition', 'calm', 'protection'],
    chakra: 'Third Eye, Crown',
    zodiac: ['Pisces', 'Virgo', 'Aquarius'],
    color: 'bg-lunary-primary-400',
  },
  {
    name: 'Rose Quartz',
    nickname: 'The Love Stone',
    properties: [
      'unconditional love',
      'self-love',
      'emotional healing',
      'compassion',
    ],
    chakra: 'Heart',
    zodiac: ['Taurus', 'Libra'],
    color: 'bg-lunary-rose-300',
  },
  {
    name: 'Black Tourmaline',
    nickname: 'The Protection Stone',
    properties: [
      'protection',
      'grounding',
      'EMF shield',
      'negativity absorber',
    ],
    chakra: 'Root',
    zodiac: ['Capricorn', 'Scorpio'],
    color: 'bg-zinc-900',
  },
  {
    name: 'Citrine',
    nickname: 'The Abundance Stone',
    properties: ['abundance', 'joy', 'manifestation', 'confidence'],
    chakra: 'Solar Plexus',
    zodiac: ['Aries', 'Gemini', 'Leo', 'Libra'],
    color: 'bg-lunary-accent',
  },
  {
    name: 'Selenite',
    nickname: 'The Purifier',
    properties: ['cleansing', 'clarity', 'connection to guides', 'peace'],
    chakra: 'Crown',
    zodiac: ['Taurus', 'Cancer'],
    color: 'bg-zinc-100',
  },
  {
    name: 'Labradorite',
    nickname: 'The Transformation Stone',
    properties: ['transformation', 'psychic abilities', 'protection', 'magic'],
    chakra: 'Third Eye, Throat',
    zodiac: ['Leo', 'Scorpio', 'Sagittarius'],
    color: 'bg-lunary-secondary',
  },
  {
    name: 'Carnelian',
    nickname: 'The Creativity Stone',
    properties: ['creativity', 'courage', 'motivation', 'vitality'],
    chakra: 'Sacral',
    zodiac: ['Aries', 'Leo', 'Virgo'],
    color: 'bg-lunary-rose',
  },
];

const CHAKRA_CRYSTALS = [
  {
    chakra: 'Root',
    color: 'red',
    crystals: ['Black Tourmaline', 'Hematite', 'Red Jasper', 'Smoky Quartz'],
  },
  {
    chakra: 'Sacral',
    color: 'orange',
    crystals: ['Carnelian', 'Orange Calcite', 'Sunstone', "Tiger's Eye"],
  },
  {
    chakra: 'Solar Plexus',
    color: 'yellow',
    crystals: ['Citrine', 'Yellow Jasper', 'Pyrite', "Golden Tiger's Eye"],
  },
  {
    chakra: 'Heart',
    color: 'green',
    crystals: ['Rose Quartz', 'Green Aventurine', 'Malachite', 'Rhodonite'],
  },
  {
    chakra: 'Throat',
    color: 'blue',
    crystals: ['Blue Lace Agate', 'Lapis Lazuli', 'Aquamarine', 'Sodalite'],
  },
  {
    chakra: 'Third Eye',
    color: 'indigo',
    crystals: ['Amethyst', 'Labradorite', 'Fluorite', 'Lepidolite'],
  },
  {
    chakra: 'Crown',
    color: 'violet',
    crystals: ['Clear Quartz', 'Selenite', 'Howlite', 'Moonstone'],
  },
];

const faqs = [
  {
    question: 'How do crystals work for healing?',
    answer:
      "Crystals are believed to work through their unique vibrational frequencies that can interact with the body's energy field. Each crystal has a specific molecular structure that produces a consistent vibration, which practitioners believe can help balance, clear, or amplify energy in and around the body. While scientific evidence is limited, many people report feeling calmer, more focused, and balanced when working with crystals.",
  },
  {
    question: 'How do I cleanse my crystals?',
    answer:
      'There are several methods to cleanse crystals: 1) Moonlight—place under a full moon overnight, 2) Smoke cleansing with sage, palo santo, or incense, 3) Sound using singing bowls or bells, 4) Running water (for water-safe crystals only), 5) Burying in the earth, 6) Placing on a selenite or clear quartz charging plate. Choose a method that feels right and is safe for your specific crystal.',
  },
  {
    question: 'How often should I cleanse my crystals?',
    answer:
      'Cleanse your crystals when you first get them, after heavy use, when they feel energetically heavy, or at least once a month during the full moon. Crystals used for protection or healing work may need more frequent cleansing. Trust your intuition—if a crystal feels like it needs clearing, cleanse it.',
  },
  {
    question: 'Can I put crystals in water?',
    answer:
      'Not all crystals are water-safe. Avoid water with: Selenite, Halite, Malachite, Pyrite, Hematite, Lepidolite, and any crystals ending in "-ite." Safe for water: Quartz varieties (clear, rose, amethyst, citrine), Jasper, Agate, and Carnelian. When in doubt, use dry cleansing methods instead.',
  },
  {
    question: 'How do I choose the right crystal for me?',
    answer:
      "Trust your intuition—often the crystal that catches your eye or the one you're drawn to is the one you need. You can also choose based on: 1) Your intention or what you want to manifest, 2) Your zodiac sign, 3) A chakra you want to balance, or 4) A specific property you need (protection, love, abundance). Let yourself be drawn to the crystal that resonates with you.",
  },
  {
    question: 'Where should I place crystals in my home?',
    answer:
      'Place crystals based on intention: Black Tourmaline by the front door for protection, Rose Quartz in the bedroom for love, Citrine in your workspace or wallet area for abundance, Amethyst on your nightstand for restful sleep, Clear Quartz in your meditation space for amplification. Consider feng shui principles and your personal energy flow.',
  },
  {
    question: 'Can I wear crystals as jewelry?',
    answer:
      "Yes! Crystal jewelry is a wonderful way to keep crystals' energy close throughout the day. Choose pieces based on your intention: Wear Rose Quartz for attracting love, Citrine for confidence and success, Black Tourmaline for protection, or Amethyst for spiritual connection. Just remember to cleanse your jewelry regularly.",
  },
  {
    question: 'How do I program or charge a crystal?',
    answer:
      'To program a crystal: 1) Cleanse it first, 2) Hold it in your hands, 3) Close your eyes and take deep breaths, 4) Clearly state or visualize your intention, 5) Imagine your intention flowing into the crystal, 6) Thank the crystal and place it somewhere meaningful. Recharge crystals in sunlight (for energizing) or moonlight (for intuitive work).',
  },
];

const tableOfContents = [
  { href: '#what-is-crystal-healing', label: '1. What is Crystal Healing?' },
  { href: '#how-crystals-work', label: '2. How Do Crystals Work?' },
  {
    href: '#essential-crystals',
    label: '3. 8 Essential Crystals for Beginners',
  },
  { href: '#choosing-crystals', label: '4. How to Choose the Right Crystal' },
  { href: '#cleansing', label: '5. Cleansing Your Crystals' },
  { href: '#charging', label: '6. Charging and Programming Crystals' },
  { href: '#chakras', label: '7. Crystals for Each Chakra' },
  { href: '#healing-practices', label: '8. Crystal Healing Practices' },
  { href: '#working-with', label: '9. Working with Crystals' },
  { href: '#starter-kit', label: '10. Beginner Starter Kit' },
  { href: '#zodiac', label: '11. Crystals by Zodiac Sign' },
  { href: '#faq', label: '12. Frequently Asked Questions' },
];

export default function CrystalHealingGuidePage() {
  return (
    <SEOContentTemplate
      title='Crystal Healing: The Complete Guide'
      h1='Crystal Healing: The Complete Guide'
      subtitle='Discover the Power of Crystals'
      description='Discover the healing properties of crystals and gemstones. Learn how to cleanse, charge, and use crystals for healing and manifestation.'
      keywords={[
        'crystal healing',
        'healing crystals',
        'crystal meanings',
        'crystal properties',
        'crystals for healing',
        'crystal guide',
        'how to use crystals',
        'crystal cleansing',
        'crystal charging',
        'gemstone meanings',
        'crystal energy',
        'crystal meditation',
      ]}
      canonicalUrl='https://lunary.app/grimoire/guides/crystal-healing-guide'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Guides', href: '/grimoire/guides' },
        { label: 'Crystal Healing Guide' },
      ]}
      intro='For thousands of years, crystals have been used for healing, protection, and spiritual growth. This comprehensive guide will teach you everything you need to know about working with crystals—from choosing and cleansing to programming and placement.'
      tldr='Crystal healing combines intention with mineral energy. Learn how crystals support healing, protection, and manifestation, plus how to cleanse, charge, and place them effectively.'
      faqs={faqs}
      heroContent={
        <div className='flex flex-wrap gap-4'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/grimoire/crystals'>Explore Crystal Library</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='#essential-crystals'>Start Learning</Link>
          </Button>
        </div>
      }
      tableOfContents={tableOfContents}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='crystals'
          title='Crystal Connections'
        />
      }
    >
      {/* Section 1: What is Crystal Healing */}
      <section id='what-is-crystal-healing' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          1. What is Crystal Healing?
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystal healing is an ancient practice that uses the natural energy of
          crystals and gemstones to promote physical, emotional, and spiritual
          wellbeing. Civilizations from Ancient Egypt to China have recognized
          crystals as powerful tools for transformation and healing.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Today, crystal healing is used alongside other wellness practices to
          help reduce stress, increase focus, deepen meditation, protect energy,
          and manifest intentions. Whether you&apos;re drawn to their beauty or
          their metaphysical properties, crystals offer a tangible way to
          connect with the earth&apos;s energy.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-6'>
          <Heading
            as='h3'
            variant='h3'
            className='text-lunary-primary-300 mb-3'
          >
            Common Uses for Crystals
          </Heading>
          <ul className='grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-300'>
            <li>✦ Meditation and mindfulness</li>
            <li>✦ Protection from negative energy</li>
            <li>✦ Manifestation and intention setting</li>
            <li>✦ Chakra balancing and healing</li>
            <li>✦ Home and space clearing</li>
            <li>✦ Jewelry and personal adornment</li>
            <li>✦ Sleep and dream work</li>
            <li>✦ Stress relief and emotional support</li>
          </ul>
        </div>
      </section>

      {/* Section 2: How Crystals Work */}
      <section id='how-crystals-work' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          2. How Do Crystals Work?
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals are believed to work through their unique molecular
          structures, which create consistent vibrational frequencies. These
          frequencies can interact with the body's energy field (aura) and
          energy centers (chakras).
        </p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading
              as='h4'
              variant='h4'
              className='text-lunary-secondary mb-2'
            >
              Piezoelectricity
            </Heading>
            <p className='text-sm text-zinc-400'>
              Crystals like quartz can generate electrical charge when pressure
              is applied—this is why quartz is used in watches and electronics.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading
              as='h4'
              variant='h4'
              className='text-lunary-secondary mb-2'
            >
              Entrainment
            </Heading>
            <p className='text-sm text-zinc-400'>
              The theory that a crystal&apos;s stable vibration can influence
              and &quot;entrain&quot; the less stable vibrations of our energy
              field.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading
              as='h4'
              variant='h4'
              className='text-lunary-secondary mb-2'
            >
              Intention Amplification
            </Heading>
            <p className='text-sm text-zinc-400'>
              Crystals act as physical anchors for intentions, helping focus the
              mind and amplify manifestation practices.
            </p>
          </div>
        </div>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>
            • <strong>Focus tools:</strong> They anchor your attention on a
            specific intention, making visualization easier.
          </li>
          <li>
            • <strong>Symbolic reminders:</strong> Their presence recalls your
            goals throughout the day.
          </li>
          <li>
            • <strong>Ritual objects:</strong> Their shape, color, and texture
            add weight and sacredness to personal practice.
          </li>
          <li>
            • <strong>Energy amplifiers:</strong> When charged, crystals can
            intensify the energy you direct, especially when paired with strong
            intention.
          </li>
        </ul>
      </section>

      {/* Section 3: Essential Crystals */}
      <section id='essential-crystals' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          3. 8 Essential Crystals for Beginners
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          If you&apos;re new to crystals, start with these versatile and
          powerful stones. Together, they cover protection, love, abundance,
          intuition, and healing.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {ESSENTIAL_CRYSTALS.map((crystal) => (
            <Link
              key={crystal.name}
              href={`/grimoire/crystals/${crystal.name.toLowerCase().replace(/ /g, '-')}`}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-lunary-primary transition-colors'
            >
              <div className='flex items-start gap-4'>
                <div
                  className={`w-10 h-10 rounded-lg ${crystal.color} flex-shrink-0`}
                />
                <div>
                  <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                    {crystal.name}
                  </Heading>
                  <p className='text-sm text-lunary-primary-400 mb-4'>
                    {crystal.nickname}
                  </p>
                  <div className='flex flex-wrap gap-1'>
                    {crystal.properties.slice(0, 3).map((prop) => (
                      <span
                        key={prop}
                        className='px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded'
                      >
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 4: Choosing Crystals */}
      <section id='choosing-crystals' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          4. How to Choose the Right Crystal
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Choosing crystals is a deeply personal process. While you can select
          based on specific properties or intentions, the most powerful
          connections often come from intuition.
        </p>

        <div className='space-y-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              Follow Your Intuition
            </Heading>
            <p className='text-zinc-400'>
              Often the crystal that catches your eye or that you feel drawn to
              is exactly what you need. Trust your instincts when browsing
              crystals—your subconscious knows what energy you require.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              Choose by Intention
            </Heading>
            <p className='text-zinc-400'>
              Identify what you want to manifest or heal. For love, try Rose
              Quartz. For protection, Black Tourmaline. For abundance, Citrine.
              Match your crystal to your specific goal.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              Choose by Chakra
            </Heading>
            <p className='text-zinc-400'>
              If you feel blocked in a specific area, choose a crystal that
              corresponds to that chakra. Heart chakra issues? Green or pink
              stones. Throat chakra? Blue stones.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              Choose by Zodiac
            </Heading>
            <p className='text-zinc-400'>
              Each zodiac sign has crystals that resonate with its energy.
              Working with your birth sign crystals can enhance your natural
              strengths and support your challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Cleansing */}
      <section id='cleansing' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          5. Cleansing Your Crystals
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals absorb energy from their environment and the people who
          handle them. Cleansing removes unwanted energies and resets the
          crystal to its natural state.
        </p>

        <div className='space-y-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🌙 Moonlight Cleansing
            </Heading>
            <p className='text-zinc-400'>
              Place crystals under the full moon overnight. This gentle method
              works for all crystals and is especially powerful during lunar
              eclipses.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🌿 Smoke Cleansing
            </Heading>
            <p className='text-zinc-400'>
              Pass crystals through the smoke of sage, palo santo, or incense.
              Set the intention for the smoke to carry away negative energy.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🔔 Sound Cleansing
            </Heading>
            <p className='text-zinc-400'>
              Use singing bowls, bells, or tuning forks. The sound vibrations
              break up stagnant energy. Great for cleansing multiple crystals at
              once.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              ✨ Selenite Charging
            </Heading>
            <p className='text-zinc-400'>
              Place crystals on a selenite plate or near a selenite tower.
              Selenite is self-cleansing and can cleanse other crystals too.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm text-zinc-400'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              ☀️ Sunlight &amp; Water
            </Heading>
            <p>
              Sunlight charges crystals quickly, but keep exposure under 1–2
              hours for fade-prone stones like amethyst or citrine. Water works
              best for hard, water-safe minerals (quartz, jasper, agate); avoid
              soft or water-soluble stones.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🌍 Earth &amp; Selenite
            </Heading>
            <p>
              Bury crystals in soil for 8–12 hours to reconnect with grounding
              energy, then rinse them off. Selenite slabs naturally cleanse
              other stones when placed together and need no cleansing
              themselves.
            </p>
          </div>
        </div>

        <div className='bg-lunary-accent-900/20 border border-lunary-accent-700 rounded-lg p-6 mt-6'>
          <Heading as='h4' variant='h4' className='text-lunary-accent-300 mb-2'>
            ⚠️ Water-Sensitive Crystals
          </Heading>
          <p className='text-zinc-300'>
            Never cleanse these crystals with water: Selenite, Halite,
            Malachite, Pyrite, Hematite, Lepidolite, Azurite, Kyanite. Use
            moonlight or smoke cleansing instead.
          </p>
        </div>
      </section>

      {/* Section 6: Charging and Programming */}
      <section id='charging' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          6. Charging and Programming Crystals
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          After cleansing, charging restores a crystal&apos;s energy, while
          programming sets a specific intention. Both practices enhance your
          crystal&apos;s effectiveness.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading
              as='h4'
              variant='h4'
              className='text-lunary-primary-300 mb-3'
            >
              Charging Methods
            </Heading>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                <strong>Moonlight:</strong> Place under full moon overnight for
                gentle, intuitive energy
              </li>
              <li>
                <strong>Sunlight:</strong> Brief exposure (1-2 hours) for
                energizing crystals
              </li>
              <li>
                <strong>Earth:</strong> Bury in soil overnight to reconnect with
                earth energy
              </li>
              <li>
                <strong>Other crystals:</strong> Place on selenite or clear
                quartz cluster
              </li>
            </ul>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading
              as='h4'
              variant='h4'
              className='text-lunary-primary-300 mb-3'
            >
              Programming Steps
            </Heading>
            <ol className='space-y-2 text-zinc-400 text-sm list-decimal list-inside'>
              <li>Cleanse the crystal first</li>
              <li>Hold it in your hands</li>
              <li>Close your eyes and breathe deeply</li>
              <li>Clearly state or visualize your intention</li>
              <li>Imagine your intention flowing into the crystal</li>
              <li>Thank the crystal and place it meaningfully</li>
            </ol>
          </div>
        </div>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-6'>
          <Heading
            as='h4'
            variant='h4'
            className='text-lunary-primary-300 mb-2'
          >
            When to Recharge
          </Heading>
          <p className='text-zinc-300'>
            Recharge your crystals monthly, after heavy use, or whenever they
            feel energetically dull. The full moon is an ideal time for regular
            recharging. You can reprogram a crystal anytime by cleansing it
            first and setting a new intention.
          </p>
        </div>
      </section>

      {/* Section 7: Chakra Crystals */}
      <section id='chakras' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          7. Crystals for Each Chakra
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each chakra (energy center) corresponds to specific crystals that can
          help balance and heal that area. Use these crystals during meditation
          or place them on the body.
        </p>

        <div className='space-y-3'>
          {CHAKRA_CRYSTALS.map((item) => (
            <div
              key={item.chakra}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'
            >
              <div className='flex items-center align-middle gap-3 mb-2 py-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{
                    backgroundColor:
                      item.color === 'red'
                        ? '#ef4444'
                        : item.color === 'orange'
                          ? '#f97316'
                          : item.color === 'yellow'
                            ? '#eab308'
                            : item.color === 'green'
                              ? '#22c55e'
                              : item.color === 'blue'
                                ? '#3b82f6'
                                : item.color === 'indigo'
                                  ? '#6366f1'
                                  : '#8b5cf6',
                  }}
                />
                <Heading
                  as='h4'
                  variant='h4'
                  className='text-zinc-100 align-middle mb-0'
                >
                  {item.chakra} Chakra
                </Heading>
              </div>
              <p className='text-zinc-400 text-sm'>
                {item.crystals.join(' • ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 8: Healing Practices */}
      <section id='healing-practices' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          8. Crystal Healing Practices
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystal healing becomes more powerful (and easier to repeat) when you
          work with clear structure. These practices help you combine intention,
          placement, and timing so your crystals support you consistently—not
          just as pretty objects on a shelf.
        </p>

        <div className='space-y-6'>
          <div className='rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-5'>
            <Heading as='h3' variant='h3' className='text-lunary-primary-300'>
              Crystal Grids
            </Heading>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Grids amplify energy by arranging crystals into sacred geometry.
              Start with a master stone in the center (clear quartz is a popular
              choice), then surround it with supporting crystals in circles,
              triangles, or the flower of life. Activate by tracing the grid
              with your finger, wand, or visualization while declaring your
              intention.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  How to Build a Grid (Step-by-Step)
                </Heading>
                <ol className='space-y-2 text-sm text-zinc-400 list-decimal list-inside'>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Choose one goal:
                    </span>{' '}
                    protection, confidence, healing, love, or focus.
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>Cleanse</span>{' '}
                    all stones and the space where the grid will sit.
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Place a center stone
                    </span>{' '}
                    (often quartz, but any “anchor” crystal works).
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Add supporting stones
                    </span>{' '}
                    around it in a simple pattern (circle or hexagon is great
                    for beginners).
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>Activate</span>{' '}
                    by tracing lines from stone to stone with intention.
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>Maintain</span>{' '}
                    by refreshing weekly or at the full moon.
                  </li>
                </ol>
              </div>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  Grid Tips That Actually Matter
                </Heading>
                <ul className='space-y-2 text-sm text-zinc-400'>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Keep it simple:
                    </span>{' '}
                    1 center + 6 stones is enough to feel a difference.
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Don’t mix intentions:
                    </span>{' '}
                    one grid = one outcome (avoid “love + hustle + sleep” in the
                    same layout).
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Use a base:
                    </span>{' '}
                    paper, cloth, or a wooden board helps “contain” the grid
                    energy.
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Put it somewhere stable:
                    </span>{' '}
                    grids work best when they aren’t moved daily.
                  </li>
                  <li>
                    <span className='text-lunary-secondary-200'>
                      Close the work:
                    </span>{' '}
                    when you’re done, thank the stones, cleanse, and store them.
                  </li>
                </ul>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  Grid Template: Protection
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Center: Clear Quartz or Black Tourmaline. Surround with Black
                  Tourmaline, Smoky Quartz, Hematite, and Amethyst. Place the
                  grid near your front door or workspace and refresh weekly.
                </p>
              </div>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  Grid Template: Abundance
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Center: Citrine or Clear Quartz. Support with Pyrite, Green
                  Aventurine, and Tiger&apos;s Eye. Place on your desk, near
                  your wallet area, or where you do money planning. Activate
                  with a single intention like “steady, aligned income.”
                </p>
              </div>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  Grid Template: Heart Healing
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Center: Rose Quartz. Support with Rhodonite, Green Aventurine,
                  and Amethyst for calming. Place in your bedroom or on your
                  altar and pair with journaling or breathwork.
                </p>
              </div>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  Grid Template: Sleep &amp; Dreams
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Center: Amethyst or Moonstone. Support with Selenite (nearby,
                  not under water), Howlite, and Clear Quartz to amplify calm.
                  Keep the grid on a nightstand and cleanse after intense
                  dreams.
                </p>
              </div>
            </div>
            <p className='text-xs text-zinc-400 mt-3'>
              Best for manifestation, protection, healing, abundance, and dream
              work.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-5'>
            <Heading as='h3' variant='h3' className='text-lunary-primary-300'>
              Intentional Programming
            </Heading>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Program crystals by holding them, clearing your mind, and focusing
              on one intention. Visualize energy flowing from your heart into
              the stone, then speak or think your intention with clarity. Keep
              the crystal nearby or wear it to reinforce the recorded purpose
              until you decide to reprogram it.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  A Simple Programming Script
                </Heading>
                <ol className='space-y-2 text-sm text-zinc-400 list-decimal list-inside'>
                  <li>Cleanse the crystal and wash your hands.</li>
                  <li>Hold it at your heart or between both palms.</li>
                  <li>Take 6 slow breaths (inhale 4, exhale 6).</li>
                  <li>
                    Say: “I charge this crystal to support{' '}
                    <span className='text-lunary-secondary-200'>
                      [one clear outcome]
                    </span>
                    .”
                  </li>
                  <li>
                    Visualize the outcome already happening for 20–30 seconds.
                  </li>
                  <li>Seal: “So it is.” Then place it where it can work.</li>
                </ol>
              </div>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  Better Intentions (Examples)
                </Heading>
                <ul className='space-y-2 text-sm text-zinc-400'>
                  <li>“I am calm and grounded in stressful conversations.”</li>
                  <li>
                    “I take consistent, confident action toward my goals.”
                  </li>
                  <li>“My home feels protected, peaceful, and clear.”</li>
                  <li>“I sleep deeply and wake up restored.”</li>
                  <li>
                    “I release what I’ve outgrown and welcome what aligns.”
                  </li>
                </ul>
                <p className='text-xs text-zinc-500 mt-3'>
                  Keep intentions specific and present tense. If you feel
                  scattered, choose one sentence and repeat it for a week.
                </p>
              </div>
            </div>
            <p className='text-xs text-zinc-400'>
              Reprogram after cleansing or when your goals shift.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-5'>
            <Heading as='h3' variant='h3' className='text-lunary-primary-300'>
              Chakra &amp; Space Rituals
            </Heading>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Align crystals with chakra energy during meditation or bodywork.
              Place colors that match each chakra or sit with a single stone on
              the area you want to balance. For space clearing, pair crystals
              with smoke or sound cleansing to set a new energetic tone.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  7-Chakra Layout (10 Minutes)
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed mb-3'>
                  Lie down and place one crystal per chakra (or hold just one at
                  the chakra you want to support). Breathe slowly and scan the
                  body from root to crown.
                </p>
                <ul className='space-y-1 text-sm text-zinc-400'>
                  <li>Root: Black Tourmaline or Hematite</li>
                  <li>Sacral: Carnelian</li>
                  <li>Solar Plexus: Citrine or Tiger&apos;s Eye</li>
                  <li>Heart: Rose Quartz or Green Aventurine</li>
                  <li>Throat: Aquamarine or Sodalite</li>
                  <li>Third Eye: Amethyst or Labradorite</li>
                  <li>Crown: Clear Quartz or Selenite</li>
                </ul>
              </div>
              <div className='bg-zinc-950/40 border border-zinc-800 rounded-lg p-4'>
                <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
                  Space Clearing Ritual (5–15 Minutes)
                </Heading>
                <ol className='space-y-2 text-sm text-zinc-400 list-decimal list-inside'>
                  <li>Open a window or door to let energy move out.</li>
                  <li>Use sound (bell, bowl) or smoke if that’s your style.</li>
                  <li>
                    Walk corners first, then doorways, then the center of rooms.
                  </li>
                  <li>
                    Place Black Tourmaline by entrances and Clear Quartz in a
                    central area to “set” the space.
                  </li>
                  <li>
                    End by stating what you want the space to feel like (peace,
                    focus, protection).
                  </li>
                </ol>
              </div>
            </div>
            <p className='text-xs text-zinc-400'>
              Use grids, candles, or breathwork to anchor rituals.
            </p>
          </div>
        </div>
      </section>

      {/* Section 9: Working with Crystals */}
      <section id='working-with' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          9. Working with Crystals
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The best crystal practice is the one you can actually keep. Use these
          methods to build a simple routine, then level up into rituals, home
          placement, and pairing crystals for specific outcomes.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🧘 Meditation
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Hold crystals during meditation, place them on matching chakras,
              or simply keep them nearby to deepen focus. Let their vibration
              guide your breath and allow impressions to surface.
            </p>
            <p className='text-xs text-zinc-500 mt-3'>
              Try this: 3 minutes breathing + 2 minutes intention + 1 minute
              gratitude. Consistency beats long sessions.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              💎 Jewelry
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Wear crystals in rings, necklaces, or bracelets to keep their
              energy touching your aura. Pendants near the heart or throat
              intensify emotional and communication work.
            </p>
            <p className='text-xs text-zinc-500 mt-3'>
              Cleanse jewelry more often (skin contact + daily energy). Smoke,
              sound, or selenite are gentle options.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🏠 Home Placement
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Anchor intentions by placing crystals in key locations: protection
              by entryways, love stones in the bedroom, focus crystals on your
              desk, and calming minerals in the living room.
            </p>
            <ul className='text-xs text-zinc-500 mt-3 space-y-1'>
              <li>Entryways: Black Tourmaline, Smoky Quartz</li>
              <li>Bedroom: Rose Quartz, Amethyst</li>
              <li>Workspace: Citrine, Clear Quartz</li>
              <li>Meditation area: Selenite, Labradorite</li>
            </ul>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              💤 Sleep Support
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Place soothing stones like Selenite, Amethyst, or Howlite under
              your pillow or on your nightstand to invite calm, lucid dreaming,
              and restful sleep.
            </p>
            <p className='text-xs text-zinc-500 mt-3'>
              If a crystal feels “too active” at night (restless dreams), move
              it further from the bed or switch to a more calming stone.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              📅 Daily Selection
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Rotate crystals based on daily needs—carry grounding stones on
              busy days, uplifting ones when you need courage, or protective
              ones during travel. Check in with your energy before choosing.
            </p>
            <p className='text-xs text-zinc-500 mt-3'>
              Quick check-in: “What do I want to feel today?” Choose one stone
              that matches that feeling.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              📿 Crystal Grids
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Expand on single-stone work by creating grids for manifesting
              specific goals. Lay out a center stone, surround it with helpers,
              and draw the layout into your intention as you activate the grid.
            </p>
            <p className='text-xs text-zinc-500 mt-3'>
              Keep grids up for 7–14 days, then cleanse and reset. You’ll notice
              stronger results with a clear time window.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🎒 Carry &amp; Protect
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Keep tumbled stones in pockets, wallets, or travel pouches.
              Touching them throughout the day pulls you back into your
              intention and provides portable grounding or protection.
            </p>
            <p className='text-xs text-zinc-500 mt-3'>
              If you carry multiple stones, separate them in small cloth bags so
              they don’t chip or “muddy” each other’s intention.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🕯️ Ritual &amp; Altar Work
            </Heading>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Use crystals as “anchors” in rituals: place them around candles,
              add them to a simple altar, or hold one while you set an intention
              aloud. Your crystal becomes the physical reminder of your vow.
            </p>
            <p className='text-xs text-zinc-500 mt-3'>
              Tip: choose one “ritual stone” and use it only for that purpose so
              it builds a strong association over time.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <Heading as='h4' variant='h4' className='text-zinc-100 mb-2'>
              🔗 Pairing Crystals (Simple Combos)
            </Heading>
            <ul className='text-sm text-zinc-400 space-y-2'>
              <li>
                <span className='text-lunary-secondary-200'>
                  Rose Quartz + Clear Quartz
                </span>{' '}
                for amplified heart intentions.
              </li>
              <li>
                <span className='text-lunary-secondary-200'>
                  Black Tourmaline + Smoky Quartz
                </span>{' '}
                for grounding + protection.
              </li>
              <li>
                <span className='text-lunary-secondary-200'>
                  Amethyst + Selenite
                </span>{' '}
                for calm, clarity, and spiritual cleansing.
              </li>
              <li>
                <span className='text-lunary-secondary-200'>
                  Citrine + Tiger&apos;s Eye
                </span>{' '}
                for confidence and steady action.
              </li>
            </ul>
            <p className='text-xs text-zinc-500 mt-3'>
              Avoid stacking too many stones at once—2–3 is usually plenty.
            </p>
          </div>
        </div>
      </section>

      {/* Section 10: Beginner Starter Kit */}
      <section id='starter-kit' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          10. Beginner Starter Kit
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          These four stones form a practical starter kit that covers cleansing,
          protection, love, grounding, and manifestation.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-zinc-200 flex-shrink-0' />
              <Heading as='h4' variant='h4' className='text-zinc-100'>
                Clear Quartz (The Amplifier)
              </Heading>
            </div>
            <p className='text-sm text-zinc-400 leading-relaxed'>
              Use Clear Quartz to strengthen any intention and “boost” the other
              stones in your kit. It’s also great for beginners because it’s
              versatile and easy to work with.
            </p>
            <ul className='text-sm text-zinc-400 space-y-1'>
              <li>
                <span className='text-lunary-secondary-200'>Best for:</span>{' '}
                clarity, manifestation, energy cleansing.
              </li>
              <li>
                <span className='text-lunary-secondary-200'>How to use:</span>{' '}
                hold it while setting an intention, place it at the center of a
                grid, or keep it on your desk for focus.
              </li>
            </ul>
          </div>

          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-lunary-primary-400 flex-shrink-0' />
              <Heading as='h4' variant='h4' className='text-zinc-100'>
                Amethyst (The Calmer)
              </Heading>
            </div>
            <p className='text-sm text-zinc-400 leading-relaxed'>
              Amethyst supports calm, intuition, and spiritual protection. It’s
              especially helpful for stress relief, meditation, and sleep.
            </p>
            <ul className='text-sm text-zinc-400 space-y-1'>
              <li>
                <span className='text-lunary-secondary-200'>Best for:</span>{' '}
                anxiety relief, dream work, meditation.
              </li>
              <li>
                <span className='text-lunary-secondary-200'>How to use:</span>{' '}
                meditate with it at your third eye, keep it by your bed, or pair
                it with selenite for gentle energetic clearing.
              </li>
            </ul>
          </div>

          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-lunary-rose-300 flex-shrink-0' />
              <Heading as='h4' variant='h4' className='text-zinc-100'>
                Rose Quartz (The Heart Stone)
              </Heading>
            </div>
            <p className='text-sm text-zinc-400 leading-relaxed'>
              Rose Quartz is the foundation for self-love, emotional healing,
              and gentle relationship work. It’s ideal when you want softness,
              compassion, and openness.
            </p>
            <ul className='text-sm text-zinc-400 space-y-1'>
              <li>
                <span className='text-lunary-secondary-200'>Best for:</span>{' '}
                heart healing, self-compassion, peace in relationships.
              </li>
              <li>
                <span className='text-lunary-secondary-200'>How to use:</span>{' '}
                hold it at your heart while breathing, place it in your bedroom,
                or pair it with clear quartz to amplify love intentions.
              </li>
            </ul>
          </div>

          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-zinc-900 flex-shrink-0' />
              <Heading as='h4' variant='h4' className='text-zinc-100'>
                Black Tourmaline (The Protector)
              </Heading>
            </div>
            <p className='text-sm text-zinc-400 leading-relaxed'>
              Black Tourmaline is grounding and protective—great for sensitive
              people, busy environments, and energetic boundaries.
            </p>
            <ul className='text-sm text-zinc-400 space-y-1'>
              <li>
                <span className='text-lunary-secondary-200'>Best for:</span>{' '}
                protection, grounding, absorbing negativity.
              </li>
              <li>
                <span className='text-lunary-secondary-200'>How to use:</span>{' '}
                place by the front door, carry it in your bag, or hold it during
                a “cut cords” visualization after draining interactions.
              </li>
            </ul>
          </div>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mt-6'>
          <Heading as='h3' variant='h3' className='text-zinc-100 mb-3'>
            A 7-Day Beginner Plan
          </Heading>
          <ol className='space-y-2 text-sm text-zinc-400 list-decimal list-inside'>
            <li>
              Day 1: Cleanse all stones and set one intention for the week.
            </li>
            <li>
              Day 2: Carry Black Tourmaline and notice where you need stronger
              boundaries.
            </li>
            <li>
              Day 3: Meditate with Amethyst for 6 minutes (breath + calm).
            </li>
            <li>Day 4: Place Rose Quartz in your bedroom and journal once.</li>
            <li>
              Day 5: Put Clear Quartz on your desk and focus on one task start
              to finish.
            </li>
            <li>
              Day 6: Create a mini-grid (1 center + 6 stones if you have them).
            </li>
            <li>
              Day 7: Cleanse, thank your stones, and reprogram for next week.
            </li>
          </ol>
        </div>
      </section>

      {/* Section 9: Crystals by Zodiac */}
      <section id='zodiac' className='mb-16'>
        <Heading
          as='h2'
          variant='h2'
          className='text-3xl font-light text-zinc-100 mb-6'
        >
          11. Crystals by Zodiac Sign
        </Heading>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each zodiac sign has crystals that resonate with its unique energy.
          Working with your birth sign crystals enhances your natural strengths
          and helps balance challenges.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.aries}</span>
              Aries
            </Heading>
            <p className='text-sm text-zinc-400'>
              Carnelian, Red Jasper, Bloodstone
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.taurus}</span>
              Taurus
            </Heading>
            <p className='text-sm text-zinc-400'>
              Rose Quartz, Emerald, Malachite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.gemini}</span>
              Gemini
            </Heading>
            <p className='text-sm text-zinc-400'>
              Citrine, Tiger&apos;s Eye, Aquamarine
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.cancer}</span>
              Cancer
            </Heading>
            <p className='text-sm text-zinc-400'>Moonstone, Pearl, Selenite</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2 '
            >
              <span className='font-astro'>{zodiacSymbol.leo}</span>
              Leo
            </Heading>
            <p className='text-sm text-zinc-400'>
              Sunstone, Citrine, Tiger&apos;s Eye
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.virgo}</span>
              Virgo
            </Heading>
            <p className='text-sm text-zinc-400'>
              Amazonite, Peridot, Moss Agate
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.libra}</span>
              Libra
            </Heading>
            <p className='text-sm text-zinc-400'>
              Rose Quartz, Lapis Lazuli, Lepidolite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.scorpio}</span>
              Scorpio
            </Heading>
            <p className='text-sm text-zinc-400'>
              Obsidian, Labradorite, Malachite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.sagittarius}</span>
              Sagittarius
            </Heading>
            <p className='text-sm text-zinc-400'>
              Turquoise, Sodalite, Lapis Lazuli
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.capricorn}</span>
              Capricorn
            </Heading>
            <p className='text-sm text-zinc-400'>
              Garnet, Black Tourmaline, Smoky Quartz
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.aquarius}</span>
              Aquarius
            </Heading>
            <p className='text-sm text-zinc-400'>
              Amethyst, Aquamarine, Labradorite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <Heading
              as='h4'
              variant='h4'
              className='text-zinc-100 mb-1 flex items-center gap-2'
            >
              <span className='font-astro'>{zodiacSymbol.pisces}</span>
              Pisces
            </Heading>
            <p className='text-sm text-zinc-400'>
              Amethyst, Aquamarine, Fluorite
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-cyan-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center'>
        <Heading
          as='h2'
          variant='h2'
          className='text-2xl font-light text-zinc-100 mb-4'
        >
          Ready to Start Your Crystal Journey?
        </Heading>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Explore our complete crystal library to find the perfect stones for
          your needs. Discover crystals matched to your zodiac sign and life
          intentions.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/grimoire/crystals'>Browse Crystal Library</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='/pricing'>Get Personalized Crystals</Link>
          </Button>
        </div>
      </section>

      <ExploreGrimoire />
    </SEOContentTemplate>
  );
}
