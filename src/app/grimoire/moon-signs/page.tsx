import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Moon Signs & Daily Influence: Complete Guide - Lunary',
  description:
    'Learn how moon signs affect daily life, emotional energy, and moods. Discover the meaning of each moon sign and how to align with cosmic rhythms.',
  openGraph: {
    title: 'Moon Signs & Daily Influence: Complete Guide - Lunary',
    description:
      'Learn how moon signs affect daily life, emotional energy, and moods. Discover the meaning of each moon sign and how to align with cosmic rhythms.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Moon Signs & Daily Influence: Complete Guide - Lunary',
    description:
      'Learn how moon signs affect daily life, emotional energy, and moods. Discover the meaning of each moon sign and how to align with cosmic rhythms.',
  },
};

export default function MoonSignsPage() {
  return (
    <SEOContentTemplate
      title='Moon Signs & Daily Influence: Complete Guide - Lunary'
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
      canonicalUrl='https://lunary.app/grimoire/moon-signs'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Moon Phases', href: '/grimoire/moon' },
        {
          label: 'Moon Signs & Daily Influence',
          href: '/grimoire/moon-signs',
        },
      ]}
      meaning={`The moon changes signs every 2-3 days, influencing emotional energy, moods, and daily experiences. Understanding moon signs helps you align with cosmic rhythms.

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
- Self-care: Adjust your self-care practices based on the moon sign's energy`}
      internalLinks={[
        { text: 'Moon Phases Guide', href: '/grimoire/moon' },
        { text: 'Moon Rituals by Phase', href: '/grimoire/moon-rituals' },
        { text: 'Astronomy & Zodiac', href: '/grimoire/astronomy' },
      ]}
    />
  );
}
