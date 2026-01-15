export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Moon Signs Today: How the Moon Affects Your Mood - Lunary',
  description:
    'Learn how moon signs affect daily life, emotional energy, and moods. Discover the meaning of each moon sign and how to align with cosmic rhythms.',
  openGraph: {
    title: 'Moon Signs Today: How the Moon Affects Your Mood - Lunary',
    description:
      'Learn how moon signs affect daily life, emotional energy, and moods. Discover the meaning of each moon sign and how to align with cosmic rhythms.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Moon Signs Today: How the Moon Affects Your Mood - Lunary',
    description:
      'Learn how moon signs affect daily life, emotional energy, and moods. Discover the meaning of each moon sign and how to align with cosmic rhythms.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon/signs',
  },
};

export default function MoonSignsPage() {
  return (
    <SEOContentTemplate
      title='Moon Signs Today: How the Moon Affects Your Mood - Lunary'
      h1='Moon Signs & Daily Influence'
      description='The moon changes signs every 2-3 days, influencing emotional energy, moods, and daily experiences. Understanding moon signs helps you align with cosmic rhythms.'
      keywords={[
        'moon signs',
        'moon in signs',
        'daily moon sign',
        'moon sign meaning',
        'emotional moon signs',
        'moon sign influence',
      ]}
      canonicalUrl='https://lunary.app/grimoire/moon/signs'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Moon', href: '/grimoire/moon' },
        {
          label: 'Moon Signs',
          href: '/grimoire/moon/signs',
        },
      ]}
      intro={`The Moon moves quickly, shifting signs every 2–3 days. That change in sign can feel like a change in mood, motivation, or focus. Tracking moon signs helps you plan: fire days for action, earth days for grounding, air days for connection, and water days for emotional processing.`}
      tldr='Moon signs describe the daily emotional tone. Align tasks to the element of the current moon sign: fire for action, earth for stability, air for connection, and water for reflection.'
      meaning={`The moon changes signs every 2-3 days, influencing emotional energy, moods, and daily experiences. Understanding moon signs helps you align with cosmic rhythms.

The daily Moon sign is different from your natal Moon sign. Your natal Moon sign describes your baseline emotional needs, while the daily Moon sign describes the current weather. When the daily Moon matches your natal Moon, you may feel more at ease.

**Fire Moon Signs (Aries, Leo, Sagittarius):**
Passionate, energetic, and action-oriented. Good for starting projects, taking risks, and expressing creativity. Emotions run hot and direct. Best activities: Starting new projects, creative work, physical activity, taking action. Emotional energy: Direct, passionate, impulsive. Challenges: May be too impulsive or aggressive.

**Earth Moon Signs (Taurus, Virgo, Capricorn):**
Grounded, practical, and stable. Ideal for building, organizing, and making tangible progress. Emotions are steady and reliable. Best activities: Organizing, building, practical tasks, financial planning. Emotional energy: Stable, reliable, practical. Challenges: May be too rigid or resistant to change.

**Air Moon Signs (Gemini, Libra, Aquarius):**
Communicative, social, and intellectual. Perfect for discussions, learning, and connecting with others. Emotions are expressed through words and ideas. Best activities: Communication, learning, socializing, brainstorming. Emotional energy: Expressive, social, intellectual. Challenges: May be too detached or scattered.

**Water Moon Signs (Cancer, Scorpio, Pisces):**
Intuitive, emotional, and deeply feeling. Best for emotional work, healing, and connecting with intuition. Emotions run deep and sensitive. Best activities: Emotional healing, intuitive work, creative expression, deep reflection. Emotional energy: Deep, intuitive, sensitive. Challenges: May be too emotional or overwhelmed.

**How Moon Signs Affect Daily Life:**
- Emotional energy: Each moon sign brings different emotional qualities that influence how you feel and react
- Best activities: Align your activities with the moon sign for better results and flow
- Relationships: Moon signs affect how you connect emotionally with others
- Decision-making: Some moon signs are better for certain types of decisions
- Self-care: Adjust your self-care practices based on the moon sign's energy

**Practical Timing**
If you feel scattered, pick one task that matches the element of the day. If you feel emotionally flooded, switch to a stabilizing task. Small alignment choices create smoother days.`}
      howToWorkWith={[
        'Check the daily moon sign before planning important conversations.',
        'Use fire moon days to start projects and take bold steps.',
        'Use earth moon days to organize, budget, and stabilize routines.',
        'Use air moon days for learning, writing, and social connection.',
        'Use water moon days for rest, intuition, and emotional processing.',
        'Notice how your sleep and mood change across the 2–3 day cycle.',
      ]}
      rituals={[
        'Set one small intention each time the moon changes signs.',
        'On water moon days, take a grounding bath and release heavy emotions.',
        'On air moon days, write a short clarity list and prioritize communication.',
        'On fire moon days, light a candle and commit to one bold action.',
        'On earth moon days, clean your space and reset your schedule.',
        'When the moon changes signs, do a short check-in on energy and focus.',
      ]}
      journalPrompts={[
        'Which moon sign feels most supportive to me and why?',
        'What task always goes better on earth or air moon days?',
        'How does my mood shift from fire to water signs?',
        'What do I want to release on water moon days?',
        'What do I want to initiate on fire moon days?',
        "How does my natal Moon sign respond to today's Moon?",
      ]}
      tables={[
        {
          title: 'Moon Sign Quick Guide',
          headers: ['Element', 'Best Focus'],
          rows: [
            ['Fire', 'Action and momentum'],
            ['Earth', 'Stability and planning'],
            ['Air', 'Conversation and ideas'],
            ['Water', 'Reflection and care'],
          ],
        },
        {
          title: 'Daily Alignment',
          headers: ['Sign Type', 'Suggested Task'],
          rows: [
            ['Fire', 'Start a new project'],
            ['Earth', 'Organize or budget'],
            ['Air', 'Write or connect'],
            ['Water', 'Rest or reflect'],
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I find the moon sign today?',
          answer:
            'Look up a lunar calendar or use a daily astrology app. The moon changes signs every 2–3 days, so the sign listed for today sets the emotional tone.',
        },
        {
          question: 'Does the moon sign affect everyone the same?',
          answer:
            'It is a collective influence, but it feels different depending on your natal chart. Some people are more sensitive to moon shifts than others.',
        },
        {
          question: 'What is the best moon sign for important decisions?',
          answer:
            'Earth moons are steady for practical decisions, while air moons are helpful for decisions that require conversation or clarity.',
        },
        {
          question: 'Can I use moon signs with tarot or rituals?',
          answer:
            'Yes. Align your rituals or readings with the moon sign to work with the strongest emotional current of the day.',
        },
        {
          question:
            'What is the difference between moon signs and moon phases?',
          answer:
            'Moon signs describe the Moon’s zodiac position, while moon phases describe its cycle of light and growth. Both influence timing in different ways.',
        },
      ]}
      internalLinks={[
        { text: 'Moon Phases Guide', href: '/grimoire/moon' },
        { text: 'Moon Rituals by Phase', href: '/grimoire/moon/rituals' },
        { text: 'Astronomy & Zodiac', href: '/grimoire/astronomy' },
      ]}
    />
  );
}
