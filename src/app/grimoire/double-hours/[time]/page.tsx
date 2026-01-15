import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  doubleHours,
  doubleHourKeys,
} from '@/constants/grimoire/clock-numbers-data';

export async function generateStaticParams() {
  return doubleHourKeys.map((time) => ({
    time: time.replace(':', '-'),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ time: string }>;
}): Promise<Metadata> {
  const { time } = await params;
  const timeKey = time.replace('-', ':');
  const hourData = doubleHours[timeKey as keyof typeof doubleHours];

  if (!hourData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${hourData.time} Double Hour Meaning: Spiritual Significance - Lunary`;
  const description = `Discover the complete meaning of ${hourData.time} double hour. Learn what it means when you see ${hourData.time} on the clock, its spiritual message, love meaning, and guidance.`;

  return {
    title,
    description,
    keywords: [
      `${hourData.time} meaning`,
      `double hour ${hourData.time}`,
      `seeing ${hourData.time}`,
      `${hourData.time} spiritual meaning`,
      'double hours',
      'angel numbers',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/double-hours/${time}`,
      siteName: 'Lunary',
      locale: 'en_US',
      type: 'article',
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/double-hours/${time}`,
    },
  };
}

export default async function DoubleHourPage({
  params,
}: {
  params: Promise<{ time: string }>;
}) {
  const { time } = await params;
  const timeKey = time.replace('-', ':');
  const hourData = doubleHours[timeKey as keyof typeof doubleHours];

  if (!hourData) {
    notFound();
  }

  const faqs = [
    {
      question: `What does ${hourData.time} mean?`,
      answer: `${hourData.time} is a double hour meaning ${hourData.meaning.toLowerCase()}. ${hourData.message}`,
    },
    {
      question: `What does it mean when I see ${hourData.time}?`,
      answer: `When you see ${hourData.time}, it means ${hourData.message.toLowerCase()}`,
    },
    {
      question: `What does ${hourData.time} mean in love?`,
      answer: hourData.loveMeaning,
    },
    {
      question: `What is the spiritual meaning of ${hourData.time}?`,
      answer: hourData.spiritualMeaning,
    },
    {
      question: `Is ${hourData.time} a warning or a blessing?`,
      answer:
        'It is best viewed as guidance rather than a warning. The meaning often points to alignment, awareness, or a course correction, depending on what is happening in your life.',
    },
    {
      question: `What should I do after seeing ${hourData.time}?`,
      answer:
        'Pause, take a breath, and ask what the message applies to. Choose one small action that reflects the guidance, then follow through within the next day.',
    },
    {
      question: 'Could this just be a coincidence?',
      answer:
        'Sometimes, yes. If the time appears repeatedly and feels meaningful, treat it as a prompt for reflection. If it feels random, simply note it and move on.',
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${hourData.time} Double Hour - Lunary`}
        h1={`${hourData.time} Double Hour: Complete Spiritual Guide`}
        description={`Discover the complete meaning of ${hourData.time} double hour. Learn about its spiritual significance, love meaning, and what it means when you see this time.`}
        keywords={[
          `${hourData.time} meaning`,
          `double hour ${hourData.time}`,
          `seeing ${hourData.time}`,
          'double hours',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/double-hours/${time}`}
        intro={`${hourData.name} carries the energy of ${hourData.meaning.toLowerCase()}. ${hourData.message}`}
        tldr={`${hourData.time} means ${hourData.meaning.toLowerCase()}. When you see this double hour, ${hourData.message.toLowerCase()}`}
        whatIs={{
          question: `Why is ${hourData.time} called a double hour?`,
          answer: `A double hour is when the hour and minute match, like ${hourData.time}. It is a repeating number moment that many people experience as a synchronicity or nudge to pay attention.`,
        }}
        meaning={`Double hours are times when the hour and minute are the same number, like ${hourData.time}. These powerful synchronicities are believed to be messages from your guardian angels and the universe, amplifying the energy of the repeated number.

${hourData.spiritualMeaning}

When you repeatedly see ${hourData.time} on clocks, phones, or other displays, pay attention. The universe is sending you a message through this double hour.

**The Message of ${hourData.time}**

${hourData.message}

**In Love:** ${hourData.loveMeaning}

**In Career:** ${hourData.careerMeaning}

Double hours can also be read through numerology. The repeated number amplifies the core vibration of the hour, which makes the message feel louder or more urgent. If you see ${hourData.time} repeatedly over several days, treat it as a pattern, not a coincidence. The message is likely pointing to a decision you have been postponing or a mindset you are ready to shift.

If the message feels vague, focus on what was happening in your life at the moment you saw the time. Double hours are often situational prompts rather than abstract predictions. They nudge you to notice what your attention is already on and bring a higher-level perspective to it.

You can also work with the energy for a full day. Treat ${hourData.time} as a theme and choose one small action that reflects the message. Over time, these micro-actions compound into larger shifts.

If you prefer a numerology approach, reduce the digits of ${hourData.time} to a single number and explore that meaning as the core lesson. The reduction gives you a simple keyword to focus on, like independence, harmony, or completion.

If you only see ${hourData.time} once, treat it as a gentle check-in. If it appears repeatedly, lean into the theme and consider adjusting your next choice. Repetition is what turns a passing moment into a meaningful signal.

If ${hourData.time} appears during sleep or early morning, note your dreams or first thoughts. These moments are often intuitive and can reveal why the message is surfacing now.

Most importantly, trust your intuition. If the meaning resonates, let it guide you; if it doesn’t, treat the sighting as a gentle reminder to slow down and check in with yourself. Let it be gentle guidance.`}
        tables={[
          {
            title: `${hourData.time} Interpretation Lens`,
            headers: ['Lens', 'What to Ask', 'Example Focus'],
            rows: [
              ['Mind', 'What story is repeating?', 'Beliefs or self-talk'],
              ['Heart', 'What needs attention?', 'Relationships or self-worth'],
              ['Action', 'What is one next step?', 'A small practical change'],
            ],
          },
          {
            title: 'Ways to Work with the Message',
            headers: ['Approach', 'What to Do'],
            rows: [
              ['Reflect', 'Journal about your current question or choice.'],
              ['Realign', 'Pick one behavior that matches the message.'],
              ['Release', 'Let go of the habit that blocks progress.'],
            ],
          },
        ]}
        emotionalThemes={hourData.keywords}
        howToWorkWith={[
          `When you see ${hourData.time}, pause and take a breath`,
          `Reflect on what you were thinking about at that moment`,
          `Consider the message: ${hourData.meaning.toLowerCase()}`,
          'Keep a journal of when you see this double hour',
          'Express gratitude for the angelic guidance',
          'Look for repeating themes across multiple sightings',
          'Pair the message with a simple action you can take today',
        ]}
        rituals={[
          `Set a one-line intention each time you notice ${hourData.time}.`,
          'Light a candle for five minutes and focus on the message.',
          'Write the number in your journal and list three aligned actions.',
          'Take a grounding breath and name the decision you are avoiding.',
          'Turn off notifications for 10 minutes and listen for inner guidance.',
          'Place a small sticky note with the message near your workspace.',
        ]}
        journalPrompts={[
          `What was I thinking about when I saw ${hourData.time}?`,
          `How does the message of ${hourData.meaning.toLowerCase()} apply to my life?`,
          `What guidance am I receiving from this double hour?`,
          `How can I work with ${hourData.time}'s energy today?`,
          'What is the smallest next step that honors this message?',
        ]}
        relatedItems={[
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Angel Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Mirror Hours',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Double Hours', href: '/grimoire/numerology' },
          {
            label: hourData.time,
            href: `/grimoire/double-hours/${time}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: 'Angel Numbers', href: '/grimoire/numerology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Want personalized numerology insights?'
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
