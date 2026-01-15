export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Candle Magic: Colours, Flames & Ritual Fire - Lunary',
  description:
    'Complete guide to candle magic: color meanings, anointing and dressing techniques, safety, reading flames and wax, and simple candle rituals. Learn to work with fire magic.',
  keywords: [
    'candle magic',
    'candle spells',
    'candle colors meaning',
    'candle rituals',
    'anointing candles',
    'candle magic guide',
    'how to do candle magic',
  ],
  openGraph: {
    title: 'Candle Magic: Colours, Flames & Ritual Fire - Lunary',
    description:
      'Complete guide to candle magic: color meanings, techniques, safety, and rituals.',
    type: 'article',
    url: 'https://lunary.app/grimoire/candle-magic',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/candle-magic',
  },
};

const CANDLE_COLORS = [
  {
    color: 'White',
    hex: '#f5f5f5',
    uses: 'Purification, protection, peace, truth, all-purpose',
  },
  {
    color: 'Black',
    hex: '#1a1a1a',
    uses: 'Banishing, protection, absorbing negativity, endings',
  },
  {
    color: 'Red',
    hex: '#dc2626',
    uses: 'Passion, love, courage, strength, vitality',
  },
  {
    color: 'Pink',
    hex: '#f472b6',
    uses: 'Self-love, friendship, emotional healing, romance',
  },
  {
    color: 'Orange',
    hex: '#f97316',
    uses: 'Creativity, success, attraction, enthusiasm',
  },
  {
    color: 'Yellow',
    hex: '#facc15',
    uses: 'Clarity, communication, intellect, confidence',
  },
  {
    color: 'Green',
    hex: '#22c55e',
    uses: 'Prosperity, growth, fertility, luck, healing',
  },
  {
    color: 'Blue',
    hex: '#3b82f6',
    uses: 'Peace, healing, truth, wisdom, patience',
  },
  {
    color: 'Purple',
    hex: '#a855f7',
    uses: 'Spirituality, psychic power, wisdom, royalty',
  },
  {
    color: 'Brown',
    hex: '#92400e',
    uses: 'Grounding, stability, home, animal magic',
  },
  {
    color: 'Gold',
    hex: '#fbbf24',
    uses: 'Wealth, success, solar magic, masculine energy',
  },
  {
    color: 'Silver',
    hex: '#9ca3af',
    uses: 'Intuition, lunar magic, dreams, feminine energy',
  },
];

const faqs = [
  {
    question: 'What color candle should I use?',
    answer:
      'Choose colors based on your intention: red for love/passion, green for prosperity, blue for peace/healing, white for protection/purification (or as an all-purpose substitute), black for banishing. White can substitute for any color in a pinch.',
  },
  {
    question: 'Do I need special candles for magic?',
    answer:
      'No. Any candle can be used for magic. Many practitioners prefer unscented, solid-colored candles, but birthday candles, tea lights, and jar candles all work. Your intention matters more than the candle type.',
  },
  {
    question: 'Is it safe to leave candles burning overnight?',
    answer:
      'No. Never leave burning candles unattended. If your spell requires extended burning, use a jar candle in a safe location, or work in intervals. Some practitioners use LED candles for extended rituals.',
  },
  {
    question: 'What do different flame behaviors mean?',
    answer:
      'A strong, steady flame indicates focused energy. Flickering may suggest spirit presence or obstacles. A weak flame can indicate low energy or resistance. Dancing flames suggest strong activity. However, also check practical causes like drafts.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Candle Magic Resources',
    links: [
      { label: 'Candle Colors', href: '/grimoire/candle-magic/colors' },
      { label: 'Anointing Guide', href: '/grimoire/candle-magic/anointing' },
      { label: 'Incantations', href: '/grimoire/candle-magic/incantations' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Spell Library', href: '/grimoire/spells' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
    ],
  },
];

const tableOfContents = [
  { label: 'Why Candles Are Used in Magic', href: '#why-candles' },
  { label: 'Candle Colours & Their Meanings', href: '#colors' },
  { label: 'Anointing, Dressing & Carving', href: '#techniques' },
  { label: 'Candle Safety & Ethical Use', href: '#safety' },
  { label: 'Reading Candle Flames & Wax', href: '#reading' },
  { label: 'A Simple Candle Ritual', href: '#simple-ritual' },
  {
    label: 'Linking with Moon Phases & Planetary Days',
    href: '#timing',
  },
  { label: 'Frequently Asked Questions', href: '#faq' },
];

const whatIs = {
  question: 'Why is candle magic such a beloved practice?',
  answer:
    'Candle magic transforms thought into visible fire, making your intention lived and seen. The candle becomes a symbolic vessel that releases your focus into the cosmos, mirroring the journey from idea to manifestation.',
};

const intro =
  'Candle magic is one of the most accessible and powerful forms of spellwork. By combining color correspondences, focused intention, and the transformative element of fire, candles become vessels for manifestation, release, and change.\n\n' +
  'Candle magic works through sympathetic magic—the principle that symbolic actions create real-world results. The candle becomes a focal point for your intention. As it burns, it releases your intention into the cosmos.';

const howToWorkWith = [
  'Accessible: Candles are affordable and available everywhere, making them an easy entry point for magic.',
  'Visual: The flame provides a meditative focus and anchors intention in movement and light.',
  'Symbolic: Colors, carvings, and herbs layer meaning into your work, matching the intention with the vessel.',
  'Complete: Burning gives a clear beginning, middle, and end to the ritual.',
  'Versatile: Candle magic works for nearly any intention you wish to manifest or release.',
];

const relatedItems = [
  {
    name: 'Candle Color Guide',
    href: '/grimoire/candle-magic/colors',
    type: 'Color meanings',
  },
  {
    name: 'Spellcraft Fundamentals',
    href: '/grimoire/spells/fundamentals',
    type: 'Spellcraft basics',
  },
  {
    name: 'Moon Rituals',
    href: '/grimoire/moon/rituals',
    type: 'Timing & cycles',
  },
  {
    name: 'Correspondences',
    href: '/grimoire/correspondences',
    type: 'Magical resources',
  },
];

export default function CandleMagicPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Candle Magic'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={metadata.alternates?.canonical as string}
      tableOfContents={tableOfContents}
      whatIs={whatIs}
      intro={intro}
      meaning='Candle magic balances intention, color, timing, and careful ritual structure so you can direct energy with confidence and clarity.'
      howToWorkWith={howToWorkWith}
      internalLinks={[
        {
          text: 'Candle Anointing & Dressing',
          href: '/grimoire/candle-magic/anointing',
        },
        {
          text: 'Candle Colors Reference',
          href: '/grimoire/candle-magic/colors',
        },
        {
          text: 'Candle Incantations',
          href: '/grimoire/candle-magic/incantations',
        },
        { text: 'Magical Correspondences', href: '/grimoire/correspondences' },
      ]}
      faqs={faqs}
      relatedItems={relatedItems}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='candle-magic'
          title='Candle Magic Connections'
          sections={cosmicConnectionsSections}
        />
      }
      ctaText='Design a candle ritual'
      ctaHref='/grimoire/candle-magic/anointing'
    >
      <section id='why-candles' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. Why Candles Are Used in Magic
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Fire is transformation made visible. When you light a candle, you
          create a living element that consumes the material (wax) and releases
          energy (light and heat). This mirrors the magical process: taking an
          intention (material thought) and releasing it into the universe
          (manifestation).
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Candle magic works through sympathetic magic—the principle that
          symbolic actions create real-world results. The candle becomes a focal
          point for your intention. As it burns, it releases your intention into
          the cosmos. The flame transforms desire from thought into action, from
          potential into reality.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Why Candle Magic Is Popular
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              • Accessible: Candles are affordable and available everywhere
            </li>
            <li>
              • Visual: The flame provides focus for meditation and intention
            </li>
            <li>• Symbolic: Colors and carvings add layers of meaning</li>
            <li>
              • Complete: Burning creates a natural beginning, middle, and end
            </li>
            <li>• Versatile: Works for nearly any type of intention</li>
          </ul>
        </div>
      </section>

      <section id='colors' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Candle Colours & Their Meanings
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Color is one of the primary ways to align your candle with your
          intention. Each color carries specific energetic properties that
          amplify particular types of magic.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-6'>
          {CANDLE_COLORS.map((item) => (
            <div
              key={item.color}
              className='flex items-center gap-3 p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'
            >
              <div
                className='w-8 h-8 rounded-full border border-zinc-700 flex-shrink-0'
                style={{ backgroundColor: item.hex }}
              />
              <div>
                <span className='text-zinc-100 font-medium'>{item.color}</span>
                <p className='text-xs text-zinc-400'>{item.uses}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <p className='text-zinc-300 text-sm'>
            <strong className='text-lunary-primary-300'>Tip:</strong> White
            candles can substitute for any color in a pinch. They represent pure
            light and can be charged with any intention.
          </p>
        </div>

        <div className='mt-4'>
          <Link
            href='/grimoire/candle-magic/colors'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Explore detailed color meanings →
          </Link>
        </div>
      </section>

      <section id='techniques' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Anointing, Dressing & Carving
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Preparing a candle—through anointing with oil, dressing with herbs, or
          carving with symbols—adds layers of intention and personalizes the
          working.
        </p>

        <div className='space-y-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Anointing
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Anointing means coating the candle with oil that corresponds to
              your intention. Olive oil works as a base; add essential oils for
              specific purposes (lavender for peace, cinnamon for prosperity).
            </p>
            <p className='text-zinc-500 text-xs'>
              <strong>Direction matters:</strong> For drawing things toward you,
              anoint from top to middle, then bottom to middle. For banishing,
              anoint from middle outward in both directions.
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>Dressing</h3>
            <p className='text-zinc-400 text-sm mb-3'>
              After anointing, you can roll the candle in dried herbs, glitter,
              or powders that correspond to your intention. Be cautious—some
              herbs are flammable and can create unexpected flames.
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>Carving</h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Use a pin, athame, or sharp tool to carve words, names, dates,
              symbols, or sigils into the candle. Carving personalizes the spell
              and literally inscribes your intention into the wax.
            </p>
            <p className='text-zinc-500 text-xs'>
              <strong>Direction:</strong> Carve top-to-bottom for attracting,
              bottom-to-top for releasing or banishing.
            </p>
          </div>
        </div>
      </section>

      <section id='safety' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Candle Safety & Ethical Use
        </h2>

        <div className='bg-lunary-error-900/20 border border-lunary-error-700 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-lunary-error-300 mb-3'>
            Fire Safety Essentials
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>• Never leave burning candles unattended</li>
            <li>• Keep candles away from flammable materials</li>
            <li>• Place on heat-resistant, stable surfaces</li>
            <li>• Keep wicks trimmed to 1/4 inch</li>
            <li>• Extinguish if flame becomes too high or erratic</li>
            <li>• Have water or a fire extinguisher accessible</li>
            <li>• Be extra cautious with dressed candles (herbs can flare)</li>
          </ul>
        </div>

        <p className='text-zinc-300 leading-relaxed'>
          <strong>Ethical use:</strong> Candle magic, like all magic, should
          respect free will. Avoid spells that attempt to control another
          person. Focus on attracting love (not a specific person), creating
          opportunities (not taking from others), and healing yourself (not
          forcing change on unwilling recipients).
        </p>
      </section>

      <section id='reading' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Reading Candle Flames & Wax
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Many practitioners read the behavior of the flame and the remaining
          wax for additional insight. While these signs can be meaningful,
          always check for practical explanations first (drafts, wick issues,
          etc.).
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Flame Behavior</h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>
                <strong>Strong, steady:</strong> Good energy, focused intention
              </li>
              <li>
                <strong>Flickering:</strong> Spirits present, or obstacles ahead
              </li>
              <li>
                <strong>Dancing wildly:</strong> High energy, powerful working
              </li>
              <li>
                <strong>Weak, low:</strong> Low energy, possible resistance
              </li>
              <li>
                <strong>Sputtering:</strong> Communication from spirits
              </li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Wax Reading</h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>
                <strong>Clean burn:</strong> Spell completed successfully
              </li>
              <li>
                <strong>Lots of residue:</strong> Obstacles or lingering energy
              </li>
              <li>
                <strong>Shapes in wax:</strong> Interpret symbolically
              </li>
              <li>
                <strong>Black soot:</strong> Negativity being cleared
              </li>
              <li>
                <strong>Tunneling:</strong> Intention may need more focus
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id='simple-ritual' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. A Simple Candle Ritual
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Here is a basic candle ritual framework you can adapt for any
          intention:
        </p>

        <ol className='space-y-4'>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              1. Choose your candle
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Select a color that matches your intention. Cleanse it by holding
              it and visualizing white light clearing any previous energy.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              2. Prepare the candle (optional)
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Carve your intention, name, or symbols. Anoint with oil if
              desired.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              3. Create sacred space
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Ground and center yourself. Clear the space. Set up your altar or
              working area.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              4. State your intention
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Speak your intention clearly, either aloud or silently. Feel it as
              already accomplished.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              5. Light the candle
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              As you light it, visualize your intention being activated. Watch
              the flame and feel your intention releasing into the universe.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              6. Close the ritual
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Let the candle burn completely if safe, or snuff it (don&apos;t
              blow) and relight later. When done, thank any forces you invoked
              and release the working.
            </p>
          </li>
        </ol>
      </section>

      <section id='timing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Linking with Moon Phases & Planetary Days
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          For added power, align your candle work with cosmic timing:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Moon Phases
            </h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                <strong className='text-zinc-200'>New Moon:</strong> New
                beginnings, setting intentions
              </li>
              <li>
                <strong className='text-zinc-200'>Waxing:</strong> Attracting,
                building, increasing
              </li>
              <li>
                <strong className='text-zinc-200'>Full Moon:</strong>{' '}
                Manifestation, charging, power work
              </li>
              <li>
                <strong className='text-zinc-200'>Waning:</strong> Banishing,
                releasing, decreasing
              </li>
            </ul>
            <Link
              href='/grimoire/moon/rituals'
              className='text-lunary-primary-400 text-sm hover:underline mt-3 inline-block'
            >
              Moon rituals guide →
            </Link>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Planetary Days
            </h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                <strong className='text-zinc-200'>Sunday:</strong> Success, gold
                candles
              </li>
              <li>
                <strong className='text-zinc-200'>Monday:</strong> Intuition,
                silver/white candles
              </li>
              <li>
                <strong className='text-zinc-200'>Tuesday:</strong> Courage, red
                candles
              </li>
              <li>
                <strong className='text-zinc-200'>Wednesday:</strong>{' '}
                Communication, yellow candles
              </li>
              <li>
                <strong className='text-zinc-200'>Thursday:</strong> Abundance,
                green/purple candles
              </li>
              <li>
                <strong className='text-zinc-200'>Friday:</strong> Love,
                pink/red candles
              </li>
              <li>
                <strong className='text-zinc-200'>Saturday:</strong> Banishing,
                black candles
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-orange-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Explore Candle Magic Further
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Discover specific candle color meanings, incantations, and detailed
          anointing guides in our Candle Magic section.
        </p>
        <div className='flex flex-wrap gap-4 justify-center'>
          <Link
            href='/grimoire/candle-magic/colors'
            className='px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            Candle Color Guide
          </Link>
          <Link
            href='/grimoire/spells'
            className='px-6 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            Browse Spells
          </Link>
        </div>
      </section>
    </SEOContentTemplate>
  );
}
