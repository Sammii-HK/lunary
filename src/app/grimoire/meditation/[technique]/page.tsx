import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { stringToKebabCase } from '../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
const meditationTechniques = {
  'guided-meditation': {
    name: 'Guided Meditation',
    description:
      'Follow a recorded or live guide through visualization and relaxation. Great for beginners and specific intentions.',
    bestFor: 'Beginners, specific goals, relaxation, healing',
    steps: [
      "Find a quiet, comfortable space where you won't be disturbed",
      'Choose a guided meditation recording or app that resonates with you',
      'Get comfortable (sitting upright or lying down)',
      "Close your eyes and follow the guide's voice",
      'Allow yourself to relax and visualize what the guide describes',
      "If your mind wanders, gently return to the guide's voice",
      'When finished, slowly return to awareness of your surroundings',
    ],
    benefits: [
      'Perfect for beginners who need structure',
      'Helps with specific goals like sleep, anxiety, or healing',
      'Provides external focus when internal focus is difficult',
      'Can be used for deep relaxation and stress relief',
      'Great for visualization practice',
    ],
    tips: [
      'Start with shorter sessions (5-10 minutes)',
      'Try different guides to find what resonates',
      'Use headphones for better immersion',
      "Don't judge yourself if you fall asleep—that's okay",
      'Practice regularly for best results',
    ],
    commonChallenges: [
      'Difficulty staying awake during relaxation',
      'Mind wandering despite guide',
      'Feeling disconnected from the practice',
      'Finding the right guide or style',
    ],
    faqs: [
      {
        question: 'How long should I practice guided meditation?',
        answer:
          'Start with 5-10 minutes daily. As you build your practice, you can extend to 20-30 minutes. Consistency is more important than duration.',
      },
      {
        question: 'Can I use guided meditation for manifestation?',
        answer:
          'Yes! Guided meditations specifically designed for manifestation can be very powerful. Look for meditations that focus on visualization and intention setting.',
      },
      {
        question: 'What if I fall asleep during guided meditation?',
        answer:
          'Falling asleep is completely normal, especially during relaxation meditations. Your subconscious still receives the benefits. If you want to stay awake, try sitting upright instead of lying down.',
      },
    ],
  },
  'mindfulness-meditation': {
    name: 'Mindfulness Meditation',
    description:
      'Focus on present-moment awareness without judgment. Observe thoughts, feelings, and sensations as they arise.',
    bestFor: 'Daily practice, stress reduction, emotional regulation',
    steps: [
      'Sit comfortably with eyes closed or softly focused on a point',
      'Bring attention to your breath—notice the sensation of breathing',
      'When thoughts arise, notice them without judgment',
      'Label thoughts if helpful ("thinking", "worrying", "planning")',
      'Gently return attention to breath when mind wanders',
      'Practice for 5-20 minutes daily',
      'End by expanding awareness to your whole body',
    ],
    benefits: [
      'Reduces stress and anxiety',
      'Improves emotional regulation',
      'Enhances present-moment awareness',
      'Increases self-awareness and insight',
      'Can be practiced anywhere, anytime',
    ],
    tips: [
      'Start with just 5 minutes daily',
      "Use a timer so you don't worry about time",
      "Don't try to stop thoughts—just observe them",
      'Be patient—this takes practice',
      'Try different anchor points (breath, body sensations, sounds)',
    ],
    commonChallenges: [
      'Feeling like you\'re "bad" at meditation when mind wanders',
      'Restlessness or physical discomfort',
      'Falling asleep',
      'Getting frustrated with thoughts',
    ],
    faqs: [
      {
        question:
          "How do I know if I'm doing mindfulness meditation correctly?",
        answer:
          "There's no \"correct\" way—if you're noticing when your mind wanders and returning to your breath, you\'re doing it right. The practice IS the noticing and returning.",
      },
      {
        question: 'What should I do with difficult emotions during meditation?',
        answer:
          'Observe them without judgment. Notice where you feel them in your body. Allow them to be present without trying to change or suppress them. They will pass.',
      },
      {
        question: 'Can mindfulness meditation help with anxiety?',
        answer:
          'Yes, research shows mindfulness meditation can significantly reduce anxiety. It helps you observe anxious thoughts without being overwhelmed by them.',
      },
    ],
  },
  'visualization-meditation': {
    name: 'Visualization Meditation',
    description:
      'Create mental images of desired outcomes, places, or experiences. Powerful for manifestation and spiritual work.',
    bestFor: 'Manifestation, spiritual journeying, healing, energy work',
    steps: [
      'Set clear intention for what you want to visualize',
      'Get comfortable and close your eyes',
      'Take several deep breaths to relax',
      'Begin creating detailed mental images',
      'Engage all senses—see, hear, feel, smell, taste',
      'Hold the vision with strong positive feeling',
      'Spend 10-20 minutes in the visualization',
      'Slowly return to present awareness',
    ],
    benefits: [
      'Powerful tool for manifestation',
      'Enhances creativity and imagination',
      'Can be used for healing and transformation',
      'Connects you with your desires and goals',
      'Useful for spiritual journeying and astral work',
    ],
    tips: [
      'Start with simple, familiar places',
      'Use all five senses for richer visualization',
      'Add emotion and feeling to make it more powerful',
      'Practice regularly to strengthen visualization skills',
      'Be patient—visualization improves with practice',
    ],
    commonChallenges: [
      'Difficulty seeing clear images',
      'Mind wandering during visualization',
      'Feeling like it\'s not "real"',
      'Struggling to maintain the vision',
    ],
    faqs: [
      {
        question: 'What if I can\'t "see" images clearly?',
        answer:
          "That's okay! Visualization isn't just visual—focus on feelings, sensations, and knowing. Some people visualize more through feeling than seeing. Both work.",
      },
      {
        question: 'How do I use visualization for manifestation?',
        answer:
          'Visualize your desired outcome as if it has already happened. Feel the emotions you would feel. Engage all senses. Practice daily with strong intention and feeling.',
      },
      {
        question: 'Can visualization meditation help with healing?',
        answer:
          'Yes! Visualization can be used for physical and emotional healing. Visualize healing light, cells regenerating, or your body in perfect health. Combine with feeling of wellness.',
      },
    ],
  },
  'walking-meditation': {
    name: 'Walking Meditation',
    description:
      'Meditate while walking slowly and mindfully. Focus on each step, breath, and sensation. Connects body and mind.',
    bestFor: 'Those who struggle with sitting, nature connection, grounding',
    steps: [
      'Find a quiet path or space (indoor or outdoor)',
      'Stand still and take a few deep breaths',
      'Begin walking slowly and deliberately',
      'Focus on each step—lifting, moving, placing foot',
      'Notice sensations in your feet and legs',
      'Sync your breath with your steps',
      'Stay present with the movement',
      'If mind wanders, return to the sensation of walking',
    ],
    benefits: [
      'Great for those who struggle with sitting still',
      'Combines movement with mindfulness',
      'Excellent for grounding and connecting with earth',
      'Can be done anywhere you can walk',
      'Helps integrate meditation into daily life',
    ],
    tips: [
      'Walk slower than your normal pace',
      'Focus on the soles of your feet',
      'Notice the rhythm of your steps',
      'Try walking in nature for added benefits',
      'Start with 10-15 minutes',
    ],
    commonChallenges: [
      'Feeling self-conscious about slow walking',
      'Difficulty maintaining focus',
      'Wanting to walk faster',
      'Distractions from environment',
    ],
    faqs: [
      {
        question: 'How slow should I walk during walking meditation?',
        answer:
          'Walk at a pace that allows you to notice each step distinctly. This is usually much slower than normal walking—about half your normal speed or slower.',
      },
      {
        question: 'Can I do walking meditation outside?',
        answer:
          "Absolutely! Walking meditation in nature can be especially powerful. Just find a quiet path where you won't be disturbed or feel rushed.",
      },
      {
        question: 'What if people stare at me walking slowly?',
        answer:
          "If you're self-conscious, try walking meditation in a private space or park. Remember, you're practicing mindfulness, not performing for others.",
      },
    ],
  },
  'mantra-meditation': {
    name: 'Mantra Meditation',
    description:
      'Repeat a word, phrase, or sound to focus the mind. Can be spoken aloud or silently. Creates vibration and focus.',
    bestFor: 'Focus, spiritual connection, energy raising',
    steps: [
      'Choose a meaningful mantra (traditional or personal)',
      'Sit comfortably with eyes closed',
      'Take a few deep breaths to center',
      'Begin repeating mantra silently or aloud',
      'Focus on the sound and vibration',
      'Let thoughts pass without attachment',
      'Continue for 10-20 minutes',
      'Slowly reduce repetition and return to silence',
    ],
    benefits: [
      'Excellent for focus and concentration',
      'Creates vibration that affects energy',
      'Can deepen spiritual connection',
      'Helps quiet the mind',
      'Powerful for energy raising and chakra work',
    ],
    tips: [
      'Choose mantras that resonate with you',
      'Traditional mantras like "Om" or "Aum" are powerful',
      'You can use affirmations as mantras',
      'Focus on the vibration, not just the words',
      'Practice at consistent times daily',
    ],
    commonChallenges: [
      'Forgetting to repeat the mantra',
      'Getting bored with repetition',
      'Not feeling the vibration',
      'Choosing the right mantra',
    ],
    faqs: [
      {
        question: 'What makes a good mantra?',
        answer:
          'A good mantra resonates with you and is easy to remember. Traditional Sanskrit mantras like "Om" or "Om Namah Shivaya" are powerful, but you can also use affirmations or personal phrases.',
      },
      {
        question: 'Should I say the mantra aloud or silently?',
        answer:
          'Both work! Saying it aloud creates stronger vibration, while silent repetition is more subtle. Try both and see what works for you. You can also alternate.',
      },
      {
        question: 'How long should I repeat a mantra?',
        answer:
          'Traditional practice suggests 108 repetitions or 10-20 minutes. Start with shorter sessions and build up. Use a mala (prayer beads) to count if helpful.',
      },
    ],
  },
};

type TechniqueKey = keyof typeof meditationTechniques;

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ technique: string }>;
}): Promise<Metadata> {
  const { technique } = await params;
  const techniqueData = meditationTechniques[technique as TechniqueKey];

  if (!techniqueData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${techniqueData.name} Guide: How to Practice - Lunary`;
  const description = `${techniqueData.description} Learn step-by-step instructions for ${techniqueData.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function MeditationTechniquePage({
  params,
}: {
  params: Promise<{ technique: string }>;
}) {
  const { technique } = await params;
  const techniqueData = meditationTechniques[technique as TechniqueKey];

  if (!techniqueData) {
    notFound();
  }

  const meaning = `${techniqueData.name} is a powerful meditation technique that offers unique benefits for practitioners. ${techniqueData.description}

This technique is particularly well-suited for: ${techniqueData.bestFor}. Whether you're a beginner or experienced meditator, ${techniqueData.name} can enhance your practice and support your spiritual growth.

The practice involves following specific steps that guide you into a meditative state. Each step builds upon the previous one, creating a structured approach to inner stillness and awareness.`;

  const howToWorkWith = techniqueData.steps.map(
    (step, index) => `${index + 1}. ${step}`,
  );

  return (
    <SEOContentTemplate
      title={`${techniqueData.name} Guide: How to Practice - Lunary`}
      h1={techniqueData.name}
      description={`${techniqueData.description} Learn step-by-step instructions, benefits, tips, and FAQs for ${techniqueData.name}. Comprehensive guide to mastering this meditation technique.`}
      keywords={[
        techniqueData.name.toLowerCase(),
        `${techniqueData.name} guide`,
        `${techniqueData.name} instructions`,
        'meditation techniques',
        'how to meditate',
        stringToKebabCase(techniqueData.name),
        'meditation practice',
        'mindfulness meditation',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/meditation/${technique}`}
      intro={`${techniqueData.name} is one of the most effective meditation techniques for developing mindfulness, inner peace, and spiritual connection. This comprehensive guide covers everything you need to know to master this practice, from basic instructions to advanced tips and troubleshooting common challenges.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      emotionalThemes={techniqueData.benefits}
      faqs={techniqueData.faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Meditation', href: '/grimoire/meditation' },
        {
          label: techniqueData.name,
          href: `/grimoire/meditation/${technique}`,
        },
      ]}
      internalLinks={[
        { text: 'Meditation & Mindfulness', href: '/grimoire/meditation' },
        {
          text: 'Breathwork Techniques',
          href: '/grimoire/meditation/breathwork',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
      ]}
    />
  );
}
