export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleWithSpeakableSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';

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

export default function CrystalHealingGuidePage() {
  const articleSchema = createArticleWithSpeakableSchema({
    headline: 'Crystal Healing: The Complete Guide to Crystals & Their Powers',
    description:
      'Discover the healing properties of crystals and gemstones. Learn how to cleanse, charge, and use crystals for healing and manifestation.',
    url: 'https://lunary.app/grimoire/guides/crystal-healing-guide',
    keywords: [
      'crystal healing',
      'crystals',
      'gemstones',
      'healing stones',
      'crystal properties',
    ],
    section: 'Crystal Guides',
    speakableSections: [
      'h1',
      'h2',
      'header p',
      '#what-is-crystal-healing p',
      '#cleansing p',
    ],
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}

      {/* Breadcrumbs */}
      <nav className='text-sm text-zinc-400 mb-8'>
        <Link href='/grimoire' className='hover:text-lunary-primary-400'>
          Grimoire
        </Link>
        <span className='mx-2'>→</span>
        <Link
          href='/grimoire/crystals'
          className='hover:text-lunary-primary-400'
        >
          Crystals
        </Link>
        <span className='mx-2'>→</span>
        <span className='text-zinc-300'>Complete Guide</span>
      </nav>

      {/* Hero Section */}
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Crystal Healing: The Complete Guide
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Discover the Power of Crystals
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed mb-6'>
          For thousands of years, crystals have been used for healing,
          protection, and spiritual growth. This comprehensive guide will teach
          you everything you need to know about working with crystals—from
          choosing and cleansing to programming and placement.
        </p>
        <div className='flex flex-wrap gap-4'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/grimoire/crystals'>Explore Crystal Library</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='#essential-crystals'>Start Learning</Link>
          </Button>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a
              href='#what-is-crystal-healing'
              className='hover:text-lunary-primary-400'
            >
              1. What is Crystal Healing?
            </a>
          </li>
          <li>
            <a
              href='#how-crystals-work'
              className='hover:text-lunary-primary-400'
            >
              2. How Do Crystals Work?
            </a>
          </li>
          <li>
            <a
              href='#essential-crystals'
              className='hover:text-lunary-primary-400'
            >
              3. 8 Essential Crystals for Beginners
            </a>
          </li>
          <li>
            <a
              href='#choosing-crystals'
              className='hover:text-lunary-primary-400'
            >
              4. How to Choose the Right Crystal
            </a>
          </li>
          <li>
            <a href='#cleansing' className='hover:text-lunary-primary-400'>
              5. Cleansing Your Crystals
            </a>
          </li>
          <li>
            <a href='#charging' className='hover:text-lunary-primary-400'>
              6. Charging and Programming Crystals
            </a>
          </li>
          <li>
            <a href='#chakras' className='hover:text-lunary-primary-400'>
              7. Crystals for Each Chakra
            </a>
          </li>
          <li>
            <a href='#using-crystals' className='hover:text-lunary-primary-400'>
              8. Ways to Use Crystals
            </a>
          </li>
          <li>
            <a href='#zodiac' className='hover:text-lunary-primary-400'>
              9. Crystals by Zodiac Sign
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              10. Frequently Asked Questions
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1: What is Crystal Healing */}
      <section id='what-is-crystal-healing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What is Crystal Healing?
        </h2>

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
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Common Uses for Crystals
          </h3>
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
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. How Do Crystals Work?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals are believed to work through their unique molecular
          structures, which create consistent vibrational frequencies. These
          frequencies can interact with the body&apos;s energy field (aura) and
          energy centers (chakras).
        </p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-lunary-secondary mb-2'>
              Piezoelectricity
            </h4>
            <p className='text-sm text-zinc-400'>
              Crystals like quartz can generate electrical charge when pressure
              is applied—this is why quartz is used in watches and electronics.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-lunary-secondary mb-2'>
              Entrainment
            </h4>
            <p className='text-sm text-zinc-400'>
              The theory that a crystal&apos;s stable vibration can influence
              and &quot;entrain&quot; the less stable vibrations of our energy
              field.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-lunary-secondary mb-2'>
              Intention Amplification
            </h4>
            <p className='text-sm text-zinc-400'>
              Crystals act as physical anchors for intentions, helping focus the
              mind and amplify manifestation practices.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Essential Crystals */}
      <section id='essential-crystals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. 8 Essential Crystals for Beginners
        </h2>

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
                  <h4 className='text-lg font-medium text-zinc-100'>
                    {crystal.name}
                  </h4>
                  <p className='text-sm text-lunary-primary-400 mb-2'>
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
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. How to Choose the Right Crystal
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Choosing crystals is a deeply personal process. While you can select
          based on specific properties or intentions, the most powerful
          connections often come from intuition.
        </p>

        <div className='space-y-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Follow Your Intuition
            </h4>
            <p className='text-zinc-400'>
              Often the crystal that catches your eye or that you feel drawn to
              is exactly what you need. Trust your instincts when browsing
              crystals—your subconscious knows what energy you require.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Choose by Intention
            </h4>
            <p className='text-zinc-400'>
              Identify what you want to manifest or heal. For love, try Rose
              Quartz. For protection, Black Tourmaline. For abundance, Citrine.
              Match your crystal to your specific goal.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Choose by Chakra
            </h4>
            <p className='text-zinc-400'>
              If you feel blocked in a specific area, choose a crystal that
              corresponds to that chakra. Heart chakra issues? Green or pink
              stones. Throat chakra? Blue stones.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Choose by Zodiac
            </h4>
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
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Cleansing Your Crystals
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals absorb energy from their environment and the people who
          handle them. Cleansing removes unwanted energies and resets the
          crystal to its natural state.
        </p>

        <div className='space-y-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🌙 Moonlight Cleansing
            </h4>
            <p className='text-zinc-400'>
              Place crystals under the full moon overnight. This gentle method
              works for all crystals and is especially powerful during lunar
              eclipses.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🌿 Smoke Cleansing
            </h4>
            <p className='text-zinc-400'>
              Pass crystals through the smoke of sage, palo santo, or incense.
              Set the intention for the smoke to carry away negative energy.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🔔 Sound Cleansing
            </h4>
            <p className='text-zinc-400'>
              Use singing bowls, bells, or tuning forks. The sound vibrations
              break up stagnant energy. Great for cleansing multiple crystals at
              once.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              ✨ Selenite Charging
            </h4>
            <p className='text-zinc-400'>
              Place crystals on a selenite plate or near a selenite tower.
              Selenite is self-cleansing and can cleanse other crystals too.
            </p>
          </div>
        </div>

        <div className='bg-lunary-accent-900/20 border border-lunary-accent-700 rounded-lg p-6 mt-6'>
          <h4 className='text-lg font-medium text-lunary-accent-300 mb-2'>
            ⚠️ Water-Sensitive Crystals
          </h4>
          <p className='text-zinc-300'>
            Never cleanse these crystals with water: Selenite, Halite,
            Malachite, Pyrite, Hematite, Lepidolite, Azurite, Kyanite. Use
            moonlight or smoke cleansing instead.
          </p>
        </div>
      </section>

      {/* Section 6: Charging and Programming */}
      <section id='charging' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Charging and Programming Crystals
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          After cleansing, charging restores a crystal&apos;s energy, while
          programming sets a specific intention. Both practices enhance your
          crystal&apos;s effectiveness.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-lunary-primary-300 mb-3'>
              Charging Methods
            </h4>
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
            <h4 className='text-lg font-medium text-lunary-primary-300 mb-3'>
              Programming Steps
            </h4>
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
          <h4 className='text-lg font-medium text-lunary-primary-300 mb-2'>
            When to Recharge
          </h4>
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
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Crystals for Each Chakra
        </h2>

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
              <div className='flex items-center gap-3 mb-2'>
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
                <h4 className='text-lg font-medium text-zinc-100'>
                  {item.chakra} Chakra
                </h4>
              </div>
              <p className='text-zinc-400 text-sm'>
                {item.crystals.join(' • ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 8: Using Crystals */}
      <section id='using-crystals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. Ways to Use Crystals
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🧘 Meditation
            </h4>
            <p className='text-zinc-400 text-sm'>
              Hold crystals during meditation or place them on your body. Focus
              on the crystal&apos;s energy as you breathe.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              💎 Jewelry
            </h4>
            <p className='text-zinc-400 text-sm'>
              Wear crystal jewelry to keep their energy close throughout the
              day. Choose based on your intentions.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🏠 Home Placement
            </h4>
            <p className='text-zinc-400 text-sm'>
              Place crystals in specific areas: protection by doors, love in
              bedrooms, abundance in offices.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              💤 Sleep Support
            </h4>
            <p className='text-zinc-400 text-sm'>
              Put calming crystals like Amethyst or Selenite under your pillow
              or on your nightstand.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              📿 Crystal Grids
            </h4>
            <p className='text-zinc-400 text-sm'>
              Arrange multiple crystals in geometric patterns to amplify and
              combine their energies.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🎒 Carry Them
            </h4>
            <p className='text-zinc-400 text-sm'>
              Keep tumbled stones in your pocket or bag for on-the-go protection
              and support.
            </p>
          </div>
        </div>
      </section>

      {/* Section 9: Crystals by Zodiac */}
      <section id='zodiac' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          9. Crystals by Zodiac Sign
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each zodiac sign has crystals that resonate with its unique energy.
          Working with your birth sign crystals enhances your natural strengths
          and helps balance challenges.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♈ Aries</h4>
            <p className='text-sm text-zinc-400'>
              Carnelian, Red Jasper, Bloodstone
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♉ Taurus</h4>
            <p className='text-sm text-zinc-400'>
              Rose Quartz, Emerald, Malachite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♊ Gemini</h4>
            <p className='text-sm text-zinc-400'>
              Citrine, Tiger&apos;s Eye, Aquamarine
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♋ Cancer</h4>
            <p className='text-sm text-zinc-400'>Moonstone, Pearl, Selenite</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♌ Leo</h4>
            <p className='text-sm text-zinc-400'>
              Sunstone, Citrine, Tiger&apos;s Eye
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♍ Virgo</h4>
            <p className='text-sm text-zinc-400'>
              Amazonite, Peridot, Moss Agate
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♎ Libra</h4>
            <p className='text-sm text-zinc-400'>
              Rose Quartz, Lapis Lazuli, Lepidolite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♏ Scorpio</h4>
            <p className='text-sm text-zinc-400'>
              Obsidian, Labradorite, Malachite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♐ Sagittarius</h4>
            <p className='text-sm text-zinc-400'>
              Turquoise, Sodalite, Lapis Lazuli
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♑ Capricorn</h4>
            <p className='text-sm text-zinc-400'>
              Garnet, Black Tourmaline, Smoky Quartz
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♒ Aquarius</h4>
            <p className='text-sm text-zinc-400'>
              Amethyst, Aquamarine, Labradorite
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-1'>♓ Pisces</h4>
            <p className='text-sm text-zinc-400'>
              Amethyst, Aquamarine, Fluorite
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          10. Frequently Asked Questions
        </h2>

        <div className='space-y-4'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                {faq.question}
              </h3>
              <p className='text-zinc-300 leading-relaxed'>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-cyan-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Ready to Start Your Crystal Journey?
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Explore our complete crystal library to find the perfect stones for
          your needs. Discover crystals matched to your zodiac sign and life
          intentions.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/grimoire/crystals'
            className='px-8 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            Browse Crystal Library
          </Link>
          <Link
            href='/pricing'
            className='px-8 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            Get Personalized Crystals
          </Link>
        </div>
      </section>

      <ExploreGrimoire />
    </div>
  );
}
