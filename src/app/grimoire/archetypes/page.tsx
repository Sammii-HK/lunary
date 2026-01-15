export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'The 12 Lunary Archetypes: A Guide to Your Inner Patterns - Lunary',
  description:
    "Explore the Lunary Archetype System — twelve inner patterns that reveal your emotional cycles, strengths, and spiritual themes. Learn each archetype's meaning, light traits, shadow traits, and how to work with them.",
  keywords: [
    'lunary archetypes',
    'spiritual archetypes',
    'inner patterns',
    'psychological archetypes',
    'archetype meanings',
    'shadow work archetypes',
    'emotional archetypes',
    'spiritual self-discovery',
    'archetype system',
    'soul archetypes',
    'jungian archetypes',
    'personal archetypes',
  ],
  openGraph: {
    title: 'The 12 Lunary Archetypes: A Guide to Your Inner Patterns - Lunary',
    description:
      'Explore the Lunary Archetype System — twelve inner patterns that reveal your emotional cycles, strengths, and spiritual themes.',
    type: 'article',
    url: 'https://lunary.app/grimoire/archetypes',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/archetypes',
  },
};

const ARCHETYPES = [
  {
    id: 'restorer',
    name: 'The Restorer',
    overview:
      'The Restorer archetype embodies the profound capacity for healing and emotional reconstruction. This pattern emerges when the soul is ready to mend what has been broken, restore what has been lost, and rebuild foundations that will support future growth. The Restorer understands that healing is not a passive process but an active, conscious journey toward wholeness.',
    lightTraits: [
      'Deep capacity for self-healing and emotional recovery',
      'Natural resilience that grows stronger through challenges',
      'Ability to hold nurturing space for others in crisis',
      'Intuitive understanding of what truly nourishes the soul',
      'Patient acceptance of the non-linear healing timeline',
    ],
    shadowTraits: [
      'Tendency to isolate when wounded rather than seeking support',
      'Difficulty accepting help from others',
      'Over-identification with the role of healer',
      'Perfectionism about the healing process',
      'Resistance to acknowledging pain or vulnerability',
    ],
    guidance:
      'To work with The Restorer, create intentional space for recovery. Practice radical self-compassion without judgment. Recognize that healing happens in layers—some days will feel like setbacks, but they are part of integration. Consider what truly nourishes you versus what merely distracts. Allow yourself to receive care from others, not just give it.',
  },
  {
    id: 'seeker',
    name: 'The Seeker',
    overview:
      'The Seeker archetype represents the eternal quest for meaning, truth, and deeper understanding. This pattern awakens when the soul is hungry for answers that surface-level explanations cannot provide. The Seeker is driven by sacred curiosity—not anxious questioning, but a genuine desire to understand the why beneath the what.',
    lightTraits: [
      "Insatiable curiosity about life's deeper questions",
      'Openness to new perspectives and unconventional ideas',
      'Courage to question established beliefs and assumptions',
      'Natural philosophical and spiritual inclination',
      'Ability to find meaning even in difficult experiences',
    ],
    shadowTraits: [
      'Restlessness and difficulty committing to one path',
      'Spiritual bypassing of practical matters',
      'Intellectual superiority about depth of understanding',
      'Endless seeking without integration or application',
      'Dismissing simple wisdom in favor of complexity',
    ],
    guidance:
      'To work with The Seeker, balance your quest with periods of integration. Not every question needs an immediate answer—sometimes sitting with mystery is the teaching. Find teachers and traditions that resonate, but remain discerning. Trust that the journey itself is part of the destination. Ground your seeking in practical application.',
  },
  {
    id: 'catalyst',
    name: 'The Catalyst',
    overview:
      'The Catalyst archetype embodies transformative energy that accelerates change. Like a chemical catalyst that speeds reactions without being consumed, this pattern facilitates profound shifts—breaking down what has become stagnant to make way for what is more alive and authentic. The Catalyst works through disruption in service of evolution.',
    lightTraits: [
      'Courage to initiate necessary but difficult changes',
      'Ability to see through illusions and recognize truth',
      'Natural transformative presence that activates others',
      'Comfort with intensity, depth, and emotional honesty',
      'Capacity to hold space for others during transformation',
    ],
    shadowTraits: [
      'Tendency to create unnecessary chaos or drama',
      'Difficulty with stability, routine, and maintenance',
      'Unconsciously provoking others without clear purpose',
      'Resistance to being transformed by external forces',
      'Impatience with slow, organic processes of change',
    ],
    guidance:
      'To work with The Catalyst, distinguish between necessary disruption and restlessness. Ask yourself: is this change in service of growth, or am I simply uncomfortable with stillness? Practice the art of conscious endings—honoring what was before releasing it. Balance your catalytic nature with grounding practices that provide stability during transformation.',
  },
  {
    id: 'grounded-one',
    name: 'The Grounded One',
    overview:
      'The Grounded One archetype represents practical wisdom, stability, and the patience to build lasting foundations. In a world that often celebrates speed and disruption, this pattern offers the counterbalancing power of roots, steady progress, and attention to fundamentals. The Grounded One knows that castles built on sand eventually fall.',
    lightTraits: [
      'Practical wisdom and reliable common sense',
      'Patience with slow, steady, sustainable progress',
      'Ability to create stability for self and others',
      'Natural connection to the physical world and body',
      'Consistent follow-through and dependability',
    ],
    shadowTraits: [
      'Rigidity and resistance to necessary change',
      'Over-attachment to material security and comfort',
      'Dismissal of emotional or spiritual needs as impractical',
      'Excessive caution that prevents growth',
      'Stuckness in comfortable but limiting routines',
    ],
    guidance:
      'To work with The Grounded One, honor the sacred in the mundane. Your attention to practical matters is spiritual practice when done with presence. Balance stability with flexibility—roots should anchor, not imprison. Regularly assess whether your foundations still serve your growth or have become limitations. Remember that the physical world is not separate from the spiritual.',
  },
  {
    id: 'empath',
    name: 'The Empath',
    overview:
      'The Empath archetype represents heightened sensitivity to emotions, energies, and the unspoken currents that flow between people. This pattern is both gift and responsibility—the capacity to feel what others feel can be overwhelming without proper boundaries, yet it also enables profound compassion and intuitive understanding.',
    lightTraits: [
      "Deep attunement to others' emotional states",
      'Natural capacity for genuine compassion',
      'Intuitive understanding of unexpressed needs',
      'Ability to hold space for pain without fixing',
      'Sensitivity to subtle energies and atmospheres',
    ],
    shadowTraits: [
      'Difficulty maintaining healthy boundaries',
      "Tendency to absorb others' emotions as your own",
      'Overwhelm in intense or crowded environments',
      'Codependent relationship patterns',
      'Neglecting personal needs while caring for others',
    ],
    guidance:
      "To work with The Empath, energetic hygiene is essential. Learn to distinguish your feelings from those you've absorbed from others. Create regular practices for clearing and restoring your energy field. Establish firm boundaries not as walls but as filters. Honor your need for solitude and recovery time. Your sensitivity is not weakness—it is a capacity to be consciously developed.",
  },
  {
    id: 'shadow-dancer',
    name: 'The Shadow Dancer',
    overview:
      'The Shadow Dancer archetype represents the courage to face hidden truths and integrate rejected aspects of self. This pattern invites descent into the underworld—not to be consumed by darkness, but to retrieve the gold buried there. The Shadow Dancer knows that wholeness requires acknowledging what we have pushed away.',
    lightTraits: [
      'Courage to face difficult truths about self',
      'Capacity for psychological depth and complexity',
      'Ability to integrate rejected parts of personality',
      'Comfort with paradox and moral ambiguity',
      'Non-judgmental self-awareness and honesty',
    ],
    shadowTraits: [
      'Tendency to dwell in darkness rather than moving through',
      'Over-identification with wounds or trauma as identity',
      'Using shadow work to avoid action in the outer world',
      'Projecting shadow qualities onto others',
      'Romanticizing suffering as evidence of depth',
    ],
    guidance:
      'To work with The Shadow Dancer, remember that integration—not elimination—is the goal. Your shadow contains not only what you reject but also power you have disowned. Notice your strongest judgments of others; these often point to your own shadow. Work with guides or therapists for deeper exploration. Create from your darkness; let it fuel art, writing, or transformation rather than remaining unconscious.',
  },
  {
    id: 'visionary',
    name: 'The Visionary',
    overview:
      'The Visionary archetype represents creative imagination and the capacity to see possibilities that do not yet exist in physical form. This pattern opens the inner eye to futures waiting to be born, bridging the realm of potential with the world of manifestation. The Visionary does not merely observe the future but participates in its creation.',
    lightTraits: [
      'Vivid creative imagination and ideation',
      'Ability to perceive future possibilities',
      'Natural optimism and capacity for hope',
      'Skill at inspiring others with compelling vision',
      'Openness to innovation and unprecedented approaches',
    ],
    shadowTraits: [
      'Difficulty remaining present in current reality',
      'Frustration with slow pace of manifestation',
      'Tendency toward escapism through fantasy',
      'Impatience with practical details and logistics',
      'Overwhelm from seeing too many possibilities at once',
    ],
    guidance:
      'To work with The Visionary, ground your visions in action. Beautiful ideas that never leave imagination serve no one. Learn to become a bridge between possibility and form. Practice discernment about which visions to pursue—not everything glimpsed is meant to be manifested by you. Balance future-focus with present-moment awareness. Share your vision with trusted allies who can help actualize it.',
  },
  {
    id: 'mystic',
    name: 'The Mystic',
    overview:
      "The Mystic archetype represents direct experience of spiritual reality and knowing that bypasses rational analysis. This pattern connects to wisdom beyond the logical mind—truth accessed through intuition, meditation, dreams, and communion with something greater than the personal self. The Mystic's knowledge is experiential, not merely intellectual.",
    lightTraits: [
      'Direct experience of sacred and spiritual dimensions',
      'Deep trust in inner guidance and intuition',
      'Capacity for profound stillness and presence',
      'Natural connection to transpersonal awareness',
      'Ability to receive wisdom through non-rational channels',
    ],
    shadowTraits: [
      'Disconnection from practical reality and responsibilities',
      'Spiritual superiority or escapism from material life',
      'Difficulty communicating mystical experiences',
      'Confusion between genuine intuition and fantasy',
      'Neglecting physical world in favor of transcendence',
    ],
    guidance:
      'To work with The Mystic, develop discernment between genuine spiritual insight and wishful thinking. The most authentic mystics bring their insights back to serve everyday life. Create regular space for contemplative practice and stillness. Record dreams and intuitive impressions to recognize patterns over time. Find community with others who understand direct spiritual experience. Stay grounded even as you explore transcendent dimensions.',
  },
  {
    id: 'protector',
    name: 'The Protector',
    overview:
      'The Protector archetype embodies guardian energy—the capacity to establish boundaries, defend what is sacred, and stand guard for those who cannot protect themselves. This is warrior energy in its most noble form: strength in service of love, fierceness wedded to compassion. The Protector knows that love without boundaries becomes enmeshment.',
    lightTraits: [
      'Strong sense of healthy boundaries',
      'Courage to defend what truly matters',
      'Deep loyalty to those in your care',
      'Capacity for fierce, protective compassion',
      'Discernment about genuine threats versus perceived ones',
    ],
    shadowTraits: [
      'Hypervigilance and inability to relax vigilance',
      'Difficulty trusting or letting guard down',
      'Controlling behavior disguised as protection',
      'Building walls instead of healthy boundaries',
      'Exhaustion from constant guarding and defending',
    ],
    guidance:
      'To work with The Protector, regularly audit your boundaries. Where are you over-giving? Where are you allowing violations? Practice saying no without over-explaining or apologizing. Remember that protecting yourself—your energy, time, peace—is not selfish but necessary. Balance protection with vulnerability in safe relationships. Distinguish between boundaries (filters) and walls (barriers to connection).',
  },
  {
    id: 'heart-opener',
    name: 'The Heart Opener',
    overview:
      'The Heart Opener archetype represents the expansion of capacity for love, authentic intimacy, and relational depth. This pattern knows that our deepest growth happens in relationship with others. The Heart Opener embodies courage—for opening the heart always involves risk of rejection and pain, yet offers the greatest rewards of human experience.',
    lightTraits: [
      'Capacity for deep love and genuine intimacy',
      'Willingness to be vulnerable and truly seen',
      'Skill at relational repair and reconciliation',
      'Natural warmth and open-hearted compassion',
      'Courage to love despite previous wounds',
    ],
    shadowTraits: [
      'Love addiction or codependent patterns',
      'Over-giving in relationships at expense of self',
      'Difficulty with healthy detachment when needed',
      'Opening heart to unsafe or unworthy people',
      'Neglecting self-love while pursuing love from others',
    ],
    guidance:
      'To work with The Heart Opener, practice discernment about where to invest your heart energy. Not every connection deserves full vulnerability—but those that do deserve your willingness to show up fully, imperfect and unguarded. Balance giving love with receiving it. Examine your patterns in relationships; what keeps repeating? Prioritize self-love as the foundation for loving others. Repair what is worth repairing; release what is not.',
  },
  {
    id: 'lunar-weaver',
    name: 'The Lunar Weaver',
    overview:
      'The Lunar Weaver archetype represents attunement to natural cycles, rhythms, and cosmic timing. This pattern recognizes that there is a season for everything—waxing and waning, planting and harvest, action and rest. The Lunar Weaver does not fight these cycles but weaves life in harmony with them, aligning effort with optimal timing.',
    lightTraits: [
      'Sensitivity to moon phases and natural cycles',
      'Patience with organic timing and rhythms',
      'Ability to flow gracefully through transitions',
      'Wisdom about when to act and when to wait',
      'Deep connection to lunar and seasonal energy',
    ],
    shadowTraits: [
      'Using cycles as excuse for chronic inaction',
      'Over-dependence on external timing indicators',
      'Rigidity about following cycles perfectly',
      'Disconnection from inner wisdom in favor of rules',
      'Frustration during necessary fallow periods',
    ],
    guidance:
      'To work with The Lunar Weaver, track your energy through moon cycles to recognize personal patterns. Align intentions with lunar phases—new moon for planting, full moon for harvest and release. Honor fallow periods without judgment; rest is not laziness. Create rituals for transitions between phases. Balance external timing guidance with your own inner knowing. Life is a spiral, not a line—trust the dance.',
  },
  {
    id: 'alchemist',
    name: 'The Alchemist',
    overview:
      "The Alchemist archetype embodies the capacity to transmute experience into wisdom, transforming the base material of life's challenges into gold. Like ancient alchemists who sought physical transmutation, this pattern works with the prima materia of existence—pain, confusion, chaos—to create something precious and meaningful.",
    lightTraits: [
      'Ability to find genuine meaning in difficulty',
      'Capacity for integration and synthesis of experience',
      'Natural understanding of transformation processes',
      'Wisdom born from lived experience, not theory',
      'Ability to help others transmute their suffering',
    ],
    shadowTraits: [
      'Premature meaning-making before fully experiencing',
      'Intellectualizing emotions instead of feeling them',
      'Spiritual bypassing of necessary grief and pain',
      'Compulsive pressure to find silver linings',
      'Avoiding raw experience in favor of processing',
    ],
    guidance:
      'To work with The Alchemist, allow experiences to complete before extracting meaning. Not everything is ready to be transmuted—some things need to be lived first. Identify patterns across different life experiences; what themes recur? Share your hard-won wisdom with others who face similar challenges. Your laboratory is consciousness itself; the gold you create is understanding that changes how you move through the world.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Explore Yourself',
    links: [
      { label: 'Book of Shadows', href: '/book-of-shadows' },
      { label: 'Your Profile', href: '/profile' },
      { label: 'Tarot Reading', href: '/tarot' },
      { label: 'Birth Chart', href: '/birth-chart' },
    ],
  },
  {
    title: 'Grimoire Guides',
    links: [
      {
        label: 'Birth Chart Guide',
        href: '/grimoire/guides/birth-chart-complete-guide',
      },
      { label: 'Moon Phases', href: '/grimoire/moon' },
      { label: 'Tarot Cards', href: '/grimoire/tarot' },
      { label: 'Shadow Work', href: '/grimoire/shadow-work' },
    ],
  },
  {
    title: 'Related Topics',
    links: [
      { label: 'Zodiac Signs', href: '/grimoire/zodiac' },
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Chakras', href: '/grimoire/chakras' },
      { label: 'Numerology', href: '/grimoire/numerology' },
    ],
  },
];

const tableOfContents = [
  { label: '1. What Are Lunary Archetypes?', href: '#what-are-archetypes' },
  { label: '2. How Archetypes Work in Lunary', href: '#how-archetypes-work' },
  { label: '3. The 12 Archetypes', href: '#the-12-archetypes' },
  ...ARCHETYPES.map((archetype, index) => ({
    label: `3.${index + 1}. ${archetype.name}`,
    href: `#${archetype.id}`,
  })),
  {
    label: '4. Working With Your Archetypes',
    href: '#working-with-archetypes',
  },
];

const faqs = [
  {
    question: 'How do I identify my primary archetypes?',
    answer:
      'Observe recurring emotional cycles, dominant defense patterns, and habitual themes in relationships or career. Archetype manifests through both your light gifts and shadow blind spots, so look at what energizes you and what drains you repeatedly.',
  },
  {
    question: 'Can multiple archetypes be active at once?',
    answer:
      'Yes — the Lunary system recognizes dominant, supporting, and emerging archetypes. Start with your strongest patterns and then explore how other archetypes color your responses, especially when you feel activated or out of balance.',
  },
  {
    question: 'How do I work with difficult shadow traits?',
    answer:
      'Shadow work begins with awareness and curiosity. Journal the stories behind each shadow trait, practice self-compassion, and create rituals (breathwork, movement, journaling) that invite gentle integration rather than punishing perfectionism.',
  },
];

const meaningText = `Lunary archetypes map internal patterns — emotional rhythms, relational dynamics, and spiritual callings — so you can see how past experiences sculpt your present behavior. Recognizing each archetype's gifts and shadows helps you lean into strengths while tenderly integrating wounded parts.`;

const howToWorkWith = [
  'Track the archetypes that appear during different seasons, moon phases, or emotional states',
  'Honor both the light gifts and shadows without self-judgment; integration is an ongoing process',
  'Use rituals, breath, or embodiment practices to embody the activated archetype before acting from it',
  'Share insights with mentors or spiritual guides to receive reflection on what you might miss alone',
];

const relatedItems = [
  { name: 'Book of Shadows', href: '/book-of-shadows', type: 'Practice' },
  { name: 'Shadow Work Guide', href: '/grimoire/shadow-work', type: 'Guide' },
  { name: 'Moon Phases', href: '/grimoire/moon', type: 'Guide' },
];

const internalLinks = [
  {
    text: 'Birth Chart Guide',
    href: '/grimoire/guides/birth-chart-complete-guide',
  },
  { text: 'Tarot Guides', href: '/grimoire/guides/tarot-complete-guide' },
  { text: 'Chakras', href: '/grimoire/chakras' },
];

export default function ArchetypesGuidePage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='The 12 Lunary Archetypes'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={metadata.alternates?.canonical as string}
      intro='Discover the twelve archetypal patterns that shape your emotional cycles, reveal your hidden strengths, and illuminate your spiritual themes. Each archetype offers both gifts to embrace and shadows to integrate.'
      meaning={meaningText}
      howToWorkWith={howToWorkWith}
      tableOfContents={tableOfContents}
      relatedItems={relatedItems}
      internalLinks={internalLinks}
      faqs={faqs}
      ctaText='Want a session to map your archetype landscape?'
      ctaHref='/consultation'
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='archetypes-guide'
          title='Cosmic Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <section id='what-are-archetypes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Are Lunary Archetypes?
        </h2>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Four Dimensions of Archetypal Understanding
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h4 className='text-zinc-100 font-medium mb-2'>Symbolism</h4>
              <p className='text-zinc-400 text-sm'>
                Each archetype carries symbolic meaning that resonates across
                cultures and traditions, connecting personal experience to
                universal themes.
              </p>
            </div>
            <div>
              <h4 className='text-zinc-100 font-medium mb-2'>
                Psychological Influence
              </h4>
              <p className='text-zinc-400 text-sm'>
                Archetypes shape how we perceive situations, make decisions, and
                relate to others—often operating below conscious awareness.
              </p>
            </div>
            <div>
              <h4 className='text-zinc-100 font-medium mb-2'>
                Spiritual Meaning
              </h4>
              <p className='text-zinc-400 text-sm'>
                Beyond psychology, archetypes point toward deeper spiritual
                truths about the soul's journey and purpose.
              </p>
            </div>
            <div>
              <h4 className='text-zinc-100 font-medium mb-2'>
                Cosmic Correspondences
              </h4>
              <p className='text-zinc-400 text-sm'>
                Archetypes connect to tarot cards, planetary influences, dream
                symbols, and transit cycles, creating a web of meaning.
              </p>
            </div>
          </div>
        </div>

        <p className='text-zinc-300 leading-relaxed'>
          Archetypes are universal patterns of human experience—recurring themes
          that appear across cultures, mythologies, dreams, and individual
          psyches. The Lunary system blends psychological insight with
          astrology, tarot symbolism, and spiritual practice to give you a
          living, shifting map of the energies influencing your life.
        </p>

        <p className='text-zinc-300 leading-relaxed mt-6'>
          Unlike fixed personality types, archetypes are dynamic. Different
          patterns become active at different times in your life, responding to
          your circumstances, challenges, and growth edges. Understanding these
          archetypes helps you recognize the energies moving through you and
          work with them consciously.
        </p>
      </section>

      <section id='how-archetypes-work' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. How Archetypes Work in Lunary
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Within the Lunary app, archetypes emerge from patterns in your
          personal practice. Rather than assigning you a fixed type, the system
          recognizes which archetypal energies are most active for you right
          now, based on the themes appearing in your experience.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Dream Symbolism
            </h4>
            <p className='text-zinc-400 text-sm'>
              Recurring motifs in your dreams—water, fire, journeys,
              transformations—point toward active archetypes. Dream patterns
              often reveal what the unconscious is processing.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Tarot Patterns
            </h4>
            <p className='text-zinc-400 text-sm'>
              When certain cards appear repeatedly in your readings, they signal
              archetypal themes seeking your attention. Major Arcana cards
              especially correspond to specific archetypes.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Journal Themes
            </h4>
            <p className='text-zinc-400 text-sm'>
              The words and themes that appear in your Book of Shadows entries
              reveal what you're processing. Recurring emotional themes and
              questions point toward active archetypes.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Transit Cycles
            </h4>
            <p className='text-zinc-400 text-sm'>
              Planetary transits activate different archetypal energies. Saturn
              transits may awaken The Grounded One; Neptune transits may call
              forth The Mystic.
            </p>
          </div>
        </div>

        <p className='text-zinc-300 leading-relaxed'>
          Your personal archetype—the one currently most active in your life—is
          revealed through your engagement with Book of Shadows, tarot readings,
          and other practices within the app. This reference guide surfaces the
          full archetypal vocabulary while your personalized insights live
          within your profile and practice.
        </p>
      </section>

      <section id='the-12-archetypes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-8'>
          3. The 12 Archetypes
        </h2>

        <div className='space-y-12'>
          {ARCHETYPES.map((archetype) => (
            <article
              key={archetype.id}
              id={archetype.id}
              className='border border-zinc-800 rounded-xl p-6 md:p-8'
            >
              <h3 className='text-2xl font-light text-zinc-100 mb-4'>
                {archetype.name}
              </h3>

              <p className='text-zinc-300 leading-relaxed mb-6'>
                {archetype.overview}
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div className='bg-lunary-success/10 border border-lunary-success/30 rounded-lg p-5'>
                  <h4 className='text-sm font-medium text-lunary-success mb-3'>
                    Light Traits
                  </h4>
                  <ul className='space-y-2 text-sm text-zinc-300'>
                    {archetype.lightTraits.map((trait, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-lunary-success mt-0.5'>•</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='bg-lunary-error/10 border border-lunary-error/30 rounded-lg p-5'>
                  <h4 className='text-sm font-medium text-lunary-error mb-3'>
                    Shadow Traits
                  </h4>
                  <ul className='space-y-2 text-sm text-zinc-300'>
                    {archetype.shadowTraits.map((trait, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-lunary-error mt-0.5'>•</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className='bg-zinc-900/50 border border-zinc-700 rounded-lg p-5'>
                <h4 className='text-sm font-medium text-lunary-primary-300 mb-3'>
                  Working With This Archetype
                </h4>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {archetype.guidance}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id='working-with-archetypes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Working With Your Archetypes
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Understanding archetypes is not about labeling yourself but about
          recognizing the energies moving through your life. Here are some
          principles for working with archetypal awareness:
        </p>

        <div className='space-y-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Archetypes Are Dynamic
            </h4>
            <p className='text-zinc-400 text-sm'>
              You will work with different archetypes at different life stages.
              A major loss might activate The Restorer; a spiritual awakening
              might call forth The Mystic. Trust what is emerging now.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Every Archetype Has Shadow
            </h4>
            <p className='text-zinc-400 text-sm'>
              There is no &quot;good&quot; or &quot;bad&quot; archetype. Each
              has light gifts and shadow expressions. Integration means
              developing the gifts while becoming conscious of the shadow.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Multiple Archetypes Coexist
            </h4>
            <p className='text-zinc-400 text-sm'>
              While one archetype may be dominant, others are always present.
              You might express The Catalyst in your career while The Empath
              leads in relationships.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Use Archetypes for Self-Compassion
            </h4>
            <p className='text-zinc-400 text-sm'>
              Recognizing an archetypal pattern helps you understand your
              behavior without harsh self-judgment. &quot;The Seeker in me is
              restless&quot; is gentler than &quot;I&apos;m broken.&quot;
            </p>
          </div>
        </div>
      </section>

      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-blue-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Discover Your Active Archetype
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Your personal archetype emerges from patterns in your practice.
          Explore your Book of Shadows, track your tarot readings, and let
          Lunary reveal which energies are most alive for you right now.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button variant='lunary-solid' size='lg' asChild>
            <Link href='/book-of-shadows'>Open Book of Shadows</Link>
          </Button>
          <Button variant='outline' size='lg' asChild>
            <Link href='/tarot'>Draw a Tarot Card</Link>
          </Button>
        </div>
      </section>
    </SEOContentTemplate>
  );
}
