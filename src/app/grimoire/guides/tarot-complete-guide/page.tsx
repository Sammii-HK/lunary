export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleWithSpeakableSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Tarot: The Complete 78-Card Guide (2025 Edition) - Lunary',
  description:
    'Master the tarot with our comprehensive guide to all 78 cards. Learn Major Arcana meanings, Minor Arcana suits, spreads, reading techniques, and interpretation methods. Perfect for beginners and experienced readers.',
  keywords: [
    'tarot guide',
    'tarot cards meaning',
    'major arcana',
    'minor arcana',
    'tarot reading',
    'how to read tarot',
    'tarot spreads',
    'tarot for beginners',
    'tarot interpretation',
    'tarot deck',
    'learn tarot',
    'tarot card meanings',
    '78 tarot cards',
    'tarot symbolism',
  ],
  openGraph: {
    title: 'Tarot: The Complete 78-Card Guide (2025 Edition) - Lunary',
    description:
      'Master the tarot with our comprehensive guide to all 78 cards. Learn Major Arcana, Minor Arcana, spreads, and reading techniques.',
    type: 'article',
    url: 'https://lunary.app/grimoire/guides/tarot-complete-guide',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/guides/tarot-complete-guide',
  },
};

const MAJOR_ARCANA = [
  {
    name: 'The Fool',
    number: 0,
    keywords: ['new beginnings', 'innocence', 'spontaneity', 'free spirit'],
  },
  {
    name: 'The Magician',
    number: 1,
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'],
  },
  {
    name: 'The High Priestess',
    number: 2,
    keywords: [
      'intuition',
      'sacred knowledge',
      'divine feminine',
      'subconscious',
    ],
  },
  {
    name: 'The Empress',
    number: 3,
    keywords: ['femininity', 'beauty', 'nature', 'nurturing', 'abundance'],
  },
  {
    name: 'The Emperor',
    number: 4,
    keywords: ['authority', 'structure', 'control', 'fatherhood'],
  },
  {
    name: 'The Hierophant',
    number: 5,
    keywords: ['spiritual wisdom', 'tradition', 'conformity', 'morality'],
  },
  {
    name: 'The Lovers',
    number: 6,
    keywords: ['love', 'harmony', 'relationships', 'choices', 'alignment'],
  },
  {
    name: 'The Chariot',
    number: 7,
    keywords: ['control', 'willpower', 'success', 'determination'],
  },
  {
    name: 'Strength',
    number: 8,
    keywords: ['courage', 'patience', 'compassion', 'soft control'],
  },
  {
    name: 'The Hermit',
    number: 9,
    keywords: ['soul searching', 'introspection', 'inner guidance', 'solitude'],
  },
  {
    name: 'Wheel of Fortune',
    number: 10,
    keywords: ['good luck', 'karma', 'life cycles', 'destiny'],
  },
  {
    name: 'Justice',
    number: 11,
    keywords: ['fairness', 'truth', 'law', 'cause and effect'],
  },
  {
    name: 'The Hanged Man',
    number: 12,
    keywords: ['surrender', 'letting go', 'new perspectives', 'sacrifice'],
  },
  {
    name: 'Death',
    number: 13,
    keywords: ['endings', 'transformation', 'transition', 'change'],
  },
  {
    name: 'Temperance',
    number: 14,
    keywords: ['balance', 'moderation', 'patience', 'purpose'],
  },
  {
    name: 'The Devil',
    number: 15,
    keywords: ['shadow self', 'attachment', 'addiction', 'restriction'],
  },
  {
    name: 'The Tower',
    number: 16,
    keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'],
  },
  {
    name: 'The Star',
    number: 17,
    keywords: ['hope', 'faith', 'purpose', 'renewal', 'spirituality'],
  },
  {
    name: 'The Moon',
    number: 18,
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious', 'intuition'],
  },
  {
    name: 'The Sun',
    number: 19,
    keywords: ['positivity', 'fun', 'warmth', 'success', 'vitality'],
  },
  {
    name: 'Judgement',
    number: 20,
    keywords: ['rebirth', 'inner calling', 'absolution', 'reflection'],
  },
  {
    name: 'The World',
    number: 21,
    keywords: ['completion', 'integration', 'accomplishment', 'travel'],
  },
];

const SUITS = [
  {
    name: 'Wands',
    element: 'Fire',
    emoji: '🔥',
    themes: ['passion', 'creativity', 'action', 'ambition', 'energy'],
    description:
      'Wands represent the fire element and speak to our passions, creativity, and ambitions. They often relate to career, projects, and what drives us forward.',
  },
  {
    name: 'Cups',
    element: 'Water',
    emoji: '💧',
    themes: ['emotions', 'relationships', 'intuition', 'love', 'feelings'],
    description:
      'Cups represent the water element and deal with emotions, relationships, and matters of the heart. They speak to our inner emotional landscape.',
  },
  {
    name: 'Swords',
    element: 'Air',
    emoji: '💨',
    themes: [
      'intellect',
      'communication',
      'conflict',
      'truth',
      'mental clarity',
    ],
    description:
      'Swords represent the air element and relate to thoughts, communication, and mental challenges. They often indicate conflicts or decisions to be made.',
  },
  {
    name: 'Pentacles',
    element: 'Earth',
    emoji: '🌍',
    themes: ['material world', 'finances', 'health', 'career', 'manifestation'],
    description:
      'Pentacles (or Coins) represent the earth element and focus on material matters—money, career, health, and the physical world.',
  },
];

const faqs = [
  {
    question: 'How many cards are in a tarot deck?',
    answer:
      'A standard tarot deck contains 78 cards: 22 Major Arcana cards representing major life themes and spiritual lessons, and 56 Minor Arcana cards divided into four suits (Wands, Cups, Swords, and Pentacles) representing day-to-day events and situations.',
  },
  {
    question: 'Can I read tarot for myself?',
    answer:
      'Absolutely! Self-reading is a wonderful way to develop your intuition and gain personal insights. Many experienced readers started by reading for themselves. The key is to approach your readings with an open mind and honest reflection.',
  },
  {
    question: 'Do I need to be psychic to read tarot?',
    answer:
      "No, you don't need to be psychic. Tarot is a tool for self-reflection and intuition development that anyone can learn. While some readers may have natural intuitive gifts, the symbolism and meanings of the cards can be studied and understood by everyone.",
  },
  {
    question: 'What is the difference between Major and Minor Arcana?',
    answer:
      'Major Arcana cards (0-21) represent significant life events, spiritual lessons, and major themes. They carry more weight in a reading. Minor Arcana cards (56 cards in four suits) represent everyday situations, emotions, and challenges. Together, they provide a complete picture.',
  },
  {
    question: 'How do I cleanse my tarot deck?',
    answer:
      'Common cleansing methods include: placing crystals (like clear quartz or selenite) on your deck, leaving it in moonlight during a full moon, using sage or palo santo smoke, knocking on the deck three times, or simply shuffling with intention. Choose the method that resonates with you.',
  },
  {
    question: 'What does a reversed card mean?',
    answer:
      "Reversed (upside-down) cards can indicate blocked energy, internal aspects of the card's meaning, delays, or the need for more work in that area. Some readers don't use reversals at all. There's no wrong approach—use what feels right for your practice.",
  },
  {
    question: 'Which tarot deck should I buy as a beginner?',
    answer:
      "The Rider-Waite-Smith deck is the most recommended for beginners because most tarot education is based on its imagery. Other beginner-friendly options include the Modern Witch Tarot, Light Seer's Tarot, or The Wild Unknown. Choose a deck whose imagery speaks to you.",
  },
  {
    question: 'Can tarot predict the future?',
    answer:
      'Tarot shows potential outcomes based on current energies and paths. The future is not fixed—your choices and actions can always change it. Tarot is best used as a tool for reflection, guidance, and understanding possibilities rather than definitive predictions.',
  },
];

export default function TarotCompleteGuidePage() {
  const articleSchema = createArticleWithSpeakableSchema({
    headline: 'Tarot: The Complete 78-Card Guide (2025 Edition)',
    description:
      'Master the tarot with our comprehensive guide to all 78 cards. Learn Major Arcana, Minor Arcana, spreads, and reading techniques.',
    url: 'https://lunary.app/grimoire/guides/tarot-complete-guide',
    keywords: [
      'tarot',
      'tarot cards',
      'major arcana',
      'minor arcana',
      'tarot reading',
    ],
    section: 'Tarot Guides',
    speakableSections: [
      'h1',
      'h2',
      'header p',
      '#what-is-tarot p',
      '#reading-basics p',
    ],
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}

      {/* Breadcrumbs */}
      <nav className='text-sm text-zinc-500 mb-8'>
        <Link href='/grimoire' className='hover:text-purple-400'>
          Grimoire
        </Link>
        <span className='mx-2'>→</span>
        <Link href='/grimoire/tarot' className='hover:text-purple-400'>
          Tarot
        </Link>
        <span className='mx-2'>→</span>
        <span className='text-zinc-300'>Complete Guide</span>
      </nav>

      {/* Hero Section */}
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Tarot: The Complete Guide
          <span className='block text-2xl text-purple-400 mt-2'>
            All 78 Cards Explained
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed mb-6'>
          From the mystical Major Arcana to the everyday wisdom of the Minor
          Arcana, this comprehensive guide will teach you everything you need to
          know about the tarot. Whether you&apos;re a complete beginner or
          looking to deepen your practice, discover the rich symbolism and
          meaning behind every card.
        </p>
        <div className='flex flex-wrap gap-4'>
          <Link
            href='/tarot'
            className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Get a Free Tarot Reading
          </Link>
          <Link
            href='#major-arcana'
            className='px-6 py-3 border border-zinc-700 hover:border-purple-500 text-zinc-300 rounded-lg font-medium transition-colors'
          >
            Start Learning
          </Link>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-is-tarot' className='hover:text-purple-400'>
              1. What is Tarot?
            </a>
          </li>
          <li>
            <a href='#history' className='hover:text-purple-400'>
              2. History of Tarot
            </a>
          </li>
          <li>
            <a href='#deck-structure' className='hover:text-purple-400'>
              3. Understanding the Deck Structure
            </a>
          </li>
          <li>
            <a href='#major-arcana' className='hover:text-purple-400'>
              4. The 22 Major Arcana Cards
            </a>
          </li>
          <li>
            <a href='#minor-arcana' className='hover:text-purple-400'>
              5. The 56 Minor Arcana Cards
            </a>
          </li>
          <li>
            <a href='#suits' className='hover:text-purple-400'>
              6. The Four Suits Explained
            </a>
          </li>
          <li>
            <a href='#court-cards' className='hover:text-purple-400'>
              7. Understanding Court Cards
            </a>
          </li>
          <li>
            <a href='#reading-basics' className='hover:text-purple-400'>
              8. How to Read Tarot
            </a>
          </li>
          <li>
            <a href='#spreads' className='hover:text-purple-400'>
              9. Popular Tarot Spreads
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-purple-400'>
              10. Frequently Asked Questions
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1: What is Tarot */}
      <section id='what-is-tarot' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What is Tarot?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Tarot is a powerful divination tool consisting of 78 illustrated
          cards, each rich with symbolism and meaning. For centuries, these
          cards have been used for spiritual guidance, self-reflection, and
          exploring life&apos;s deeper questions.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Unlike what many believe, tarot isn&apos;t about predicting a fixed
          future. Instead, it&apos;s a mirror that reflects your current
          situation, unconscious thoughts, and potential paths forward. The
          cards speak through archetypes and symbols that resonate with
          universal human experiences.
        </p>

        <div className='bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-medium text-purple-300 mb-3'>
            What Tarot Can Help You With
          </h3>
          <ul className='grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-300'>
            <li>✦ Self-discovery and personal growth</li>
            <li>✦ Decision making and clarity</li>
            <li>✦ Understanding relationship dynamics</li>
            <li>✦ Exploring career paths</li>
            <li>✦ Processing emotions and experiences</li>
            <li>✦ Developing intuition</li>
            <li>✦ Meditation and spiritual practice</li>
            <li>✦ Creative inspiration</li>
          </ul>
        </div>
      </section>

      {/* Section 2: History */}
      <section id='history' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. A Brief History of Tarot
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The tarot&apos;s origins trace back to 15th century Italy, where it
          began as a card game called &quot;tarocchi.&quot; The earliest known
          decks, such as the Visconti-Sforza, were hand-painted for wealthy
          Italian families.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          It wasn&apos;t until the 18th century that tarot became associated
          with divination and mysticism. French occultist Jean-Baptiste Alliette
          (known as Etteilla) was among the first to use tarot for
          fortune-telling and assign specific divinatory meanings to cards.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The modern tarot we know today was largely shaped by the Rider-Waite-
          Smith deck, created in 1909 by Arthur Edward Waite and illustrated by
          Pamela Colman Smith. This deck&apos;s illustrated Minor Arcana cards
          revolutionized tarot reading and remains the foundation for most
          contemporary tarot study.
        </p>
      </section>

      {/* Section 3: Deck Structure */}
      <section id='deck-structure' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Understanding the Deck Structure
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A complete tarot deck contains 78 cards divided into two main
          categories:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-lunary-accent mb-3'>
              Major Arcana (22 cards)
            </h3>
            <p className='text-zinc-300 mb-4'>
              The &quot;Greater Secrets&quot; represent major life themes,
              spiritual lessons, and significant turning points. These cards
              carry more weight in a reading and often point to profound changes
              or important life lessons.
            </p>
            <p className='text-zinc-400 text-sm'>
              Cards 0-21: The Fool through The World
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-lunary-secondary mb-3'>
              Minor Arcana (56 cards)
            </h3>
            <p className='text-zinc-300 mb-4'>
              The &quot;Lesser Secrets&quot; deal with day-to-day situations,
              emotions, and challenges. They&apos;re divided into four suits
              (Wands, Cups, Swords, Pentacles), each with cards Ace through 10
              plus four Court Cards.
            </p>
            <p className='text-zinc-400 text-sm'>
              14 cards per suit × 4 suits = 56 cards
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Major Arcana */}
      <section id='major-arcana' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. The 22 Major Arcana Cards
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The Major Arcana tells the story of &quot;The Fool&apos;s
          Journey&quot;—a spiritual path from innocence through experience to
          enlightenment. Each card represents a significant archetype or life
          lesson.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {MAJOR_ARCANA.map((card) => (
            <Link
              key={card.number}
              href={`/grimoire/tarot/${card.name.toLowerCase().replace(/ /g, '-')}`}
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-purple-500 transition-colors'
            >
              <div className='flex items-center gap-3'>
                <span className='text-2xl font-light text-purple-400 w-8'>
                  {card.number}
                </span>
                <div>
                  <span className='text-zinc-100 font-medium'>{card.name}</span>
                  <p className='text-xs text-zinc-500 mt-1'>
                    {card.keywords.join(' • ')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 6: Four Suits */}
      <section id='suits' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. The Four Suits Explained
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each suit in the Minor Arcana corresponds to an element and governs
          specific areas of life. Understanding the suits helps you quickly
          interpret any Minor Arcana card.
        </p>

        <div className='space-y-4'>
          {SUITS.map((suit) => (
            <div
              key={suit.name}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'
            >
              <div className='flex items-center gap-3 mb-3'>
                <span className='text-2xl'>{suit.emoji}</span>
                <h3 className='text-xl font-medium text-zinc-100'>
                  {suit.name}
                </h3>
                <span className='text-sm text-zinc-500'>({suit.element})</span>
              </div>
              <p className='text-zinc-300 mb-3'>{suit.description}</p>
              <div className='flex flex-wrap gap-2'>
                {suit.themes.map((theme) => (
                  <span
                    key={theme}
                    className='px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded'
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: Court Cards */}
      <section id='court-cards' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Understanding Court Cards
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each suit contains four Court Cards that can represent people in your
          life, aspects of yourself, or energies you need to embody.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>Page</h4>
            <p className='text-sm text-zinc-400'>
              Represents new beginnings, curiosity, and learning. Often
              indicates a young person or someone new to a situation. Messages
              and opportunities.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>Knight</h4>
            <p className='text-sm text-zinc-400'>
              Represents action, pursuit, and movement. Often indicates someone
              in their 20s-30s or situations involving change and momentum.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>Queen</h4>
            <p className='text-sm text-zinc-400'>
              Represents mastery, nurturing, and inward focus. Often indicates a
              mature feminine energy or someone who has internalized the
              suit&apos;s qualities.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>King</h4>
            <p className='text-sm text-zinc-400'>
              Represents authority, mastery, and external expression. Often
              indicates a mature masculine energy or someone who commands the
              suit&apos;s qualities.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Reading Basics */}
      <section id='reading-basics' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. How to Read Tarot
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Reading tarot is both an art and a skill. Here&apos;s a step-by-step
          approach to getting started:
        </p>

        <div className='space-y-4'>
          <div className='flex gap-4'>
            <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
              1
            </span>
            <div>
              <h4 className='text-lg font-medium text-zinc-100'>
                Create Sacred Space
              </h4>
              <p className='text-zinc-400'>
                Find a quiet space, light a candle, or do whatever helps you
                feel centered and focused.
              </p>
            </div>
          </div>
          <div className='flex gap-4'>
            <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
              2
            </span>
            <div>
              <h4 className='text-lg font-medium text-zinc-100'>
                Form Your Question
              </h4>
              <p className='text-zinc-400'>
                Ask open-ended questions like &quot;What do I need to know
                about...&quot; rather than yes/no questions.
              </p>
            </div>
          </div>
          <div className='flex gap-4'>
            <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
              3
            </span>
            <div>
              <h4 className='text-lg font-medium text-zinc-100'>
                Shuffle with Intention
              </h4>
              <p className='text-zinc-400'>
                Hold your question in mind as you shuffle. Stop when it feels
                right.
              </p>
            </div>
          </div>
          <div className='flex gap-4'>
            <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
              4
            </span>
            <div>
              <h4 className='text-lg font-medium text-zinc-100'>
                Draw and Lay Out Cards
              </h4>
              <p className='text-zinc-400'>
                Draw cards for your chosen spread, laying them face-down first.
              </p>
            </div>
          </div>
          <div className='flex gap-4'>
            <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
              5
            </span>
            <div>
              <h4 className='text-lg font-medium text-zinc-100'>
                Interpret the Cards
              </h4>
              <p className='text-zinc-400'>
                Consider each card&apos;s meaning, position in the spread, and
                how cards relate to each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Spreads */}
      <section id='spreads' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          9. Popular Tarot Spreads
        </h2>

        <div className='space-y-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-3'>
              Single Card Draw
            </h3>
            <p className='text-zinc-300 mb-3'>
              Perfect for daily guidance or quick answers. Draw one card and
              reflect on its message for your day or situation.
            </p>
            <p className='text-zinc-500 text-sm'>
              Best for: Daily practice, simple questions
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-3'>
              Three-Card Spread
            </h3>
            <p className='text-zinc-300 mb-3'>
              The most versatile spread. Common variations include:
              Past/Present/Future, Situation/Action/Outcome, or
              Mind/Body/Spirit.
            </p>
            <p className='text-zinc-500 text-sm'>
              Best for: General readings, specific questions
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-3'>
              Celtic Cross (10 cards)
            </h3>
            <p className='text-zinc-300 mb-3'>
              The classic comprehensive spread covering present situation,
              challenges, past influences, future possibilities, and outcome.
            </p>
            <p className='text-zinc-500 text-sm'>
              Best for: In-depth readings, complex situations
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
      <section className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Ready to Explore the Tarot?
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Get a personalized tarot reading with interpretations tailored to your
          question. Discover what the cards have to reveal about your path.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/tarot'
            className='px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Get Free Tarot Reading
          </Link>
          <Link
            href='/grimoire/tarot'
            className='px-8 py-3 border border-purple-500 text-purple-300 hover:bg-purple-500/10 rounded-lg font-medium transition-colors'
          >
            Browse All Cards
          </Link>
        </div>
      </section>
    </div>
  );
}
