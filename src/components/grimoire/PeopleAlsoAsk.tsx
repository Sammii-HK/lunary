'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';

export interface PAQItem {
  question: string;
  answer: string;
}

interface PeopleAlsoAskProps {
  questions: PAQItem[];
  title?: string;
}

export function PeopleAlsoAsk({
  questions,
  title = 'People Also Ask',
}: PeopleAlsoAskProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className='space-y-4'>
      <Heading as='h2' variant='h2'>
        {title}
      </Heading>
      <div className='space-y-2'>
        {questions.map((item, index) => (
          <div
            key={index}
            className='border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50'
          >
            <button
              onClick={() => toggleQuestion(index)}
              className='w-full flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors px-4 py-1'
              aria-expanded={openIndex === index}
            >
              <Heading
                as='h3'
                variant='h4'
                className='text-lunary-secondary-200 font-normal pt-3'
              >
                {item.question}
              </Heading>
              {openIndex === index ? (
                <ChevronUp className='h-5 w-5 text-zinc-400 flex-shrink-0' />
              ) : (
                <ChevronDown className='h-5 w-5 text-zinc-400 flex-shrink-0' />
              )}
            </button>
            {openIndex === index && (
              <div className='px-4 pb-4 text-zinc-300 text-sm leading-relaxed border-t border-zinc-800'>
                <p className='pt-4'>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Pre-built PAA questions for common topics
export const MERCURY_PAA: PAQItem[] = [
  {
    question: 'What is Mercury in astrology responsible for?',
    answer:
      'Mercury is responsible for communication, thinking, learning, and short-distance travel. It governs how we process information, express ourselves verbally and in writing, and connect with others intellectually. Mercury also rules technology, commerce, and siblings.',
  },
  {
    question: 'How does Mercury affect personality?',
    answer:
      'Mercury influences your communication style, learning approach, and intellectual interests. Your Mercury sign shows how you think and express ideas. For example, Mercury in Gemini creates quick, versatile thinkers, while Mercury in Taurus produces methodical, practical minds.',
  },
  {
    question: 'What zodiac signs does Mercury rule?',
    answer:
      'Mercury rules two zodiac signs: Gemini and Virgo. In Gemini, Mercury expresses its communicative, curious, and versatile side. In Virgo, Mercury shows its analytical, detail-oriented, and practical nature.',
  },
  {
    question: 'How does Mercury retrograde affect communication?',
    answer:
      "During Mercury retrograde, communication tends to experience delays, misunderstandings, and mishaps. Emails may go astray, messages may be misinterpreted, and important conversations may require extra clarity. It's a good time to double-check all communications.",
  },
];

export const MOON_SIGN_PAA: PAQItem[] = [
  {
    question: 'Is your Moon sign more important than your Sun sign?',
    answer:
      'Neither is more important—they serve different purposes. Your Sun sign represents your core identity and ego, while your Moon sign represents your emotional nature and inner needs. Both are essential parts of your astrological profile. Many astrologers consider the Moon sign equally important for understanding your emotional patterns.',
  },
  {
    question: 'How do I find my Moon sign?',
    answer:
      'To find your Moon sign, you need your exact birth time, date, and location. The Moon moves quickly through the zodiac (changing signs every 2-3 days), so precise birth time is crucial. Use an online birth chart calculator or astrology app like Lunary to determine your Moon sign.',
  },
  {
    question: 'What does your Moon sign reveal about you?',
    answer:
      'Your Moon sign reveals your emotional nature, instinctive reactions, and inner needs. It shows how you process feelings, what makes you feel secure, and how you nurture yourself and others. Your Moon sign often becomes more prominent in intimate relationships and private life.',
  },
  {
    question: 'Can your Moon sign affect relationships?',
    answer:
      'Yes, your Moon sign significantly affects relationships because it governs your emotional needs and responses. Compatible Moon signs often lead to emotional understanding between partners. Your Moon sign shows what you need to feel emotionally secure and how you express care for loved ones.',
  },
];

export const RISING_SIGN_PAA: PAQItem[] = [
  {
    question: 'What is your rising sign (Ascendant)?',
    answer:
      'Your rising sign (Ascendant) is the zodiac sign that was rising on the eastern horizon at your exact moment of birth. It represents your outer personality, first impressions, physical appearance, and how you approach new situations. The Ascendant changes approximately every 2 hours.',
  },
  {
    question: 'How do I find my rising sign?',
    answer:
      'You need your exact birth time (within minutes if possible), birth date, and birth location. The rising sign changes every 2 hours, making precise birth time essential. Use a birth chart calculator with accurate location data to determine your Ascendant.',
  },
  {
    question: 'Is rising sign the same as Ascendant?',
    answer:
      'Yes, rising sign and Ascendant are the same thing—two names for the zodiac sign rising on the eastern horizon at birth. Astrologers use both terms interchangeably. The symbol for Ascendant is often abbreviated as "Asc" or "AC" in birth charts.',
  },
  {
    question: 'Why is my rising sign important?',
    answer:
      'Your rising sign is important because it shapes your outward personality, physical appearance, and how others perceive you. It also determines the layout of your entire birth chart, including which signs rule each house of life. Many consider it as important as the Sun and Moon signs.',
  },
];

export const BIRTH_CHART_PAA: PAQItem[] = [
  {
    question: 'Do I need my exact birth time for a birth chart?',
    answer:
      'For the most accurate birth chart, yes—you need your exact birth time. The birth time determines your rising sign (Ascendant) and house cusps, which are crucial for accurate interpretation. Without it, you can still see planet positions in signs, but houses will be approximate.',
  },
  {
    question: 'What is the difference between Sun, Moon, and rising signs?',
    answer:
      'Your Sun sign represents your core identity and ego—who you are at your essence. Your Moon sign is your emotional nature—how you feel and what you need emotionally. Your rising sign is your outer personality—how others see you and first impressions you make.',
  },
  {
    question: 'Can my birth chart change over time?',
    answer:
      "Your birth chart never changes—it's fixed at your moment of birth. However, transiting planets move through your chart, creating different influences over time. Progressions and solar returns also show how you evolve while your natal chart remains constant.",
  },
  {
    question: 'What are the most important parts of a birth chart?',
    answer:
      'The most important parts are typically: Sun sign (core identity), Moon sign (emotions), Rising sign (outer personality), and personal planets (Mercury, Venus, Mars). The aspects between planets and any planets near angles (Ascendant, Midheaven) are also significant.',
  },
];

export const TAROT_PAA: PAQItem[] = [
  {
    question: 'How many cards are in a tarot deck?',
    answer:
      'A standard tarot deck contains 78 cards: 22 Major Arcana cards (representing major life themes and spiritual lessons) and 56 Minor Arcana cards (divided into four suits: Wands, Cups, Swords, and Pentacles, each representing daily life situations).',
  },
  {
    question: 'Can I read tarot for myself?',
    answer:
      'Yes, reading tarot for yourself is a powerful practice for self-reflection and guidance. Many tarot readers began by reading for themselves. The key is to approach readings with an open mind, ask clear questions, and trust your intuition when interpreting the cards.',
  },
  {
    question: 'What do reversed tarot cards mean?',
    answer:
      "Reversed tarot cards (appearing upside-down) can indicate blocked energy, internalized qualities, delays, or the opposite/weakened meaning of the upright card. Some readers don't use reversals at all. Interpretation depends on your reading style and the specific card.",
  },
  {
    question: 'How often should I do tarot readings?',
    answer:
      "There's no strict rule—it depends on your practice. Many people do a daily one-card draw for guidance. For specific questions, it's best to wait until your situation changes before asking again. Over-reading the same question can lead to confusion.",
  },
];
