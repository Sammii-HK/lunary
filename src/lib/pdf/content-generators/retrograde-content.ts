/**
 * Retrograde Pack Content Generator
 *
 * Generates rich PDF content for retrograde survival packs.
 */

import { PdfRetrogradePack, PdfRetrogradeSurvival } from '../schema';

interface RetrogradeData {
  planet: string;
  frequency: string;
  duration: string;
  domains: string[];
  challenges: string[];
  opportunities: string[];
  description: string;
  phases: PdfRetrogradeSurvival[];
  practicalTips: string[];
  journalPrompts: string[];
}

const RETROGRADE_DATA: Record<string, RetrogradeData> = {
  Mercury: {
    planet: 'Mercury',
    frequency: 'Three to four times per year',
    duration: 'Approximately three weeks',
    domains: ['Communication', 'Technology', 'Travel', 'Contracts', 'Thinking'],
    challenges: [
      'Miscommunication and misunderstandings',
      'Technology failures and glitches',
      'Travel delays and disruptions',
      'Contract and document issues',
    ],
    opportunities: [
      'Reviewing and revising past work',
      'Reconnecting with old friends and contacts',
      'Rethinking communication patterns',
      'Slowing down and reflecting',
    ],
    description:
      'Mercury retrograde is perhaps the most famous (and feared) of all retrograde periods. Three to four times per year, the planet of communication appears to move backward, and the domains it rules—communication, technology, travel, and thinking—can become chaotic. But Mercury retrograde is not a curse; it is an invitation to slow down, review, and reconnect.',
    phases: [
      {
        planet: 'Mercury',
        phase: 'Pre-Retrograde Shadow',
        description:
          'The shadow period begins approximately two weeks before Mercury stations retrograde. The themes that will dominate the retrograde start to emerge during this time. Consider it your opportunity to prepare.',
        doList: [
          'Back up all of your devices, files, and important data.',
          'Double-check any travel plans and reservations.',
          'Finalise pending contracts and agreements before the retrograde begins.',
          'Service your car and verify travel routes in advance.',
          'Update software and complete any necessary tech maintenance.',
        ],
        dontList: [
          'Avoid signing major contracts if you can wait.',
          'Avoid making large purchases, especially electronics.',
          'Avoid starting brand new projects during this period.',
          'Do not assume everyone has received your messages.',
        ],
        affirmation:
          'I prepare calmly for the retrograde ahead. I trust my ability to navigate whatever arises.',
      },
      {
        planet: 'Mercury',
        phase: 'Mercury Retrograde',
        description:
          'Mercury appears to move backward through the zodiac for approximately three weeks. Communication, technology, and travel are most affected during this period. This is a time for reflection, not bold action.',
        doList: [
          'Review, revise, and revisit old projects or unfinished work.',
          'Reconnect with people from your past who come to mind.',
          'Reflect honestly on your communication patterns.',
          'Rest and consciously slow down your pace.',
          'Research thoroughly before making any decisions.',
          'Re-read all messages carefully before sending them.',
        ],
        dontList: [
          'Avoid signing contracts without thorough review.',
          'Avoid buying new electronics or vehicles.',
          'Avoid launching new projects or businesses.',
          'Do not assume travel will go smoothly—build in extra time.',
          'Do not send important emails without proofreading.',
          'Avoid making assumptions in conversations.',
        ],
        affirmation:
          'I embrace the slowdown. Mercury retrograde invites me to reflect, not react.',
      },
      {
        planet: 'Mercury',
        phase: 'Direct Station',
        description:
          'Mercury stations direct, appearing to pause before resuming forward motion. This is a pivot point where things may feel stuck or particularly intense just before improvement arrives.',
        doList: [
          'Tie up any loose ends from the retrograde period.',
          'Take time to clarify any lingering miscommunications.',
          'Be patient as forward momentum slowly returns.',
          'Finalise decisions that emerged during your retrograde review.',
          'Express gratitude for the lessons this cycle has brought.',
        ],
        dontList: [
          'Do not rush into new projects immediately.',
          'Do not expect instant clarity—it returns gradually.',
          'Avoid making impulsive decisions.',
          'Do not ignore unresolved issues from the retrograde.',
        ],
        affirmation:
          'I move forward with the wisdom I have gained. The pause has served its purpose.',
      },
      {
        planet: 'Mercury',
        phase: 'Post-Retrograde Shadow',
        description:
          'The shadow period after retrograde lasts approximately two weeks. Mercury retraces its retrograde path, integrating lessons learned. Full forward momentum returns gradually during this time.',
        doList: [
          'Implement the insights you gained during the retrograde.',
          'Complete projects that were paused or delayed.',
          'Move forward confidently with new plans and contracts.',
          'Address anything that may have fallen through the cracks.',
          'Acknowledge your resilience in navigating another Mercury retrograde.',
        ],
        dontList: [
          'Do not forget the lessons you have learned.',
          'Avoid rushing back to full speed immediately.',
          'Do not ignore any lingering communication issues.',
        ],
        affirmation:
          'I integrate the lessons of this retrograde cycle. I move forward wiser and more aware.',
      },
    ],
    practicalTips: [
      'Always have a backup plan for travel during Mercury retrograde periods.',
      'Allow extra time for everything—conversations, travel, and major decisions.',
      'Lean into "re" words: review, revise, reconnect, reflect, and rest.',
      'Old friends and former partners may reappear; decide consciously how you wish to respond.',
      'Technology issues are common during this transit. Patience and regular backups are essential.',
    ],
    journalPrompts: [
      'What area of my life is calling for review and revision right now?',
      'Is there anyone from my past worth consciously reconnecting with?',
      'How can I slow down and become more present during this retrograde?',
      'What communication patterns in my life need attention?',
    ],
  },
  Venus: {
    planet: 'Venus',
    frequency: 'Approximately every 18 months',
    duration: 'About 40 days',
    domains: [
      'Love',
      'Relationships',
      'Beauty',
      'Values',
      'Money',
      'Self-Worth',
    ],
    challenges: [
      'Ex-partners reappearing',
      'Relationship doubts surfacing',
      'Financial reassessment required',
      'Self-worth wounds triggered',
    ],
    opportunities: [
      'Healing past relationship wounds',
      'Clarifying what you truly value',
      'Reconnecting with self-love',
      'Resolving old romantic karma',
    ],
    description:
      'Venus retrograde occurs approximately every 18 months, lasting about 40 days. During this time, matters of the heart come up for review—relationships, values, beauty, and self-worth all receive cosmic attention. Ex-partners may resurface, and old feelings may arise.',
    phases: [
      {
        planet: 'Venus',
        phase: 'Pre-Retrograde Shadow',
        description:
          'The themes of Venus retrograde begin to emerge. You may notice relationship issues surfacing or questions about your values arising.',
        doList: [
          'Reflect on your current relationship patterns.',
          'Assess whether your values align with how you spend your time and money.',
          'Strengthen your self-love practices before the intensity begins.',
          'Address any relationship issues that have been simmering.',
        ],
        dontList: [
          'Avoid making major relationship decisions in haste.',
          'Avoid major beauty procedures or dramatic makeovers.',
          'Do not ignore red flags in new relationships.',
        ],
        affirmation:
          'I prepare my heart for the journey inward. I am worthy of the love I seek.',
      },
      {
        planet: 'Venus',
        phase: 'Venus Retrograde',
        description:
          'Venus moves backward, and matters of the heart come into sharp focus. This is a time for reviewing relationships, not starting new ones. Old loves may return, and old wounds may surface for healing.',
        doList: [
          'Reflect deeply on your relationship patterns and history.',
          'Practice radical self-love and self-care.',
          'Process any returning feelings with compassion.',
          'Revisit your values and assess whether you are living in alignment.',
          'Heal old heartbreak through ritual, therapy, or journaling.',
        ],
        dontList: [
          'Avoid starting new relationships during this period.',
          'Avoid getting back together with an ex without careful consideration.',
          'Avoid major purchases of luxury items or art.',
          'Do not schedule cosmetic procedures.',
          'Avoid making permanent changes to your appearance.',
        ],
        affirmation:
          'I review my heart with honesty and compassion. Old wounds surface to be healed, not to harm.',
      },
      {
        planet: 'Venus',
        phase: 'Direct Station',
        description:
          'Venus stations direct, and clarity begins to return to matters of the heart. Decisions about relationships can now be made with greater wisdom.',
        doList: [
          'Make relationship decisions with the wisdom you have gained.',
          'Implement the self-love practices you have developed.',
          'Move forward with values-aligned choices.',
          'Release relationships or patterns that no longer serve you.',
        ],
        dontList: [
          'Do not expect old feelings to disappear immediately.',
          'Avoid rushing into new relationships.',
          'Do not ignore the lessons this retrograde has taught you.',
        ],
        affirmation:
          'I move forward with a clearer heart. I know what I value and what I deserve.',
      },
    ],
    practicalTips: [
      'Do not be surprised if ex-partners reappear—this is classic Venus retrograde.',
      'Use this time for deep self-love work, not seeking external validation.',
      'Avoid major beauty procedures or dramatic appearance changes.',
      'Review your finances and spending patterns.',
      'Rose quartz and heart-centred practices are especially supportive.',
    ],
    journalPrompts: [
      'What relationship patterns keep repeating in my life?',
      'What do I truly value, and am I living in alignment with those values?',
      'Where do I need to deepen my self-love practice?',
      'What old wounds are ready to be healed?',
    ],
  },
  Mars: {
    planet: 'Mars',
    frequency: 'Approximately every 2 years',
    duration: 'About 10 weeks',
    domains: ['Action', 'Anger', 'Ambition', 'Drive', 'Conflict', 'Sexuality'],
    challenges: [
      'Frustration and blocked energy',
      'Stalled projects and plans',
      'Conflict and aggression surfacing',
      'Low motivation and drive',
    ],
    opportunities: [
      'Reviewing goals and strategies',
      'Processing anger constructively',
      'Resting and rebuilding energy',
      'Redirecting ambition',
    ],
    description:
      'Mars retrograde occurs approximately every two years, lasting about 10 weeks. During this time, forward momentum slows, and frustration can build. Actions taken before may need revision, and suppressed anger may surface. This is a time to review, not to charge ahead.',
    phases: [
      {
        planet: 'Mars',
        phase: 'Pre-Retrograde Shadow',
        description:
          'Mars begins to slow, and you may notice frustration building or projects stalling. This is preparation time.',
        doList: [
          'Complete projects that require urgent action.',
          'Begin anger management or physical practices.',
          'Assess your goals and strategies honestly.',
          'Build in outlets for physical energy.',
        ],
        dontList: [
          'Avoid starting major new initiatives.',
          'Avoid suppressing anger—find healthy outlets.',
          'Do not overcommit your energy.',
        ],
        affirmation:
          'I prepare for the slowdown ahead. I channel my energy wisely.',
      },
      {
        planet: 'Mars',
        phase: 'Mars Retrograde',
        description:
          'Mars moves backward, and forward momentum significantly slows. This is not the time for new battles or bold action—it is the time for strategic retreat and review.',
        doList: [
          'Review your goals and adjust strategies as needed.',
          'Process anger through physical activity, therapy, or ritual.',
          'Rest and conserve your energy for the direct period.',
          'Revisit unfinished business that requires action.',
          'Practice patience with yourself and others.',
        ],
        dontList: [
          'Avoid starting new projects or initiatives.',
          'Avoid major confrontations or battles.',
          'Do not make aggressive moves in career or conflict.',
          'Avoid high-risk physical activities.',
          'Do not suppress frustration—it will only grow.',
        ],
        affirmation:
          'I embrace strategic rest. I redirect my fire inward for review and renewal.',
      },
      {
        planet: 'Mars',
        phase: 'Direct Station',
        description:
          'Mars stations direct, and energy begins to return. You may feel a surge of motivation as the frustration of the retrograde lifts.',
        doList: [
          'Begin implementing the strategic changes you planned.',
          'Take action on projects that have been waiting.',
          'Channel your renewed energy constructively.',
          'Move forward with the wisdom you have gained.',
        ],
        dontList: [
          'Avoid burning out with sudden activity.',
          'Do not forget the patience you cultivated.',
          'Avoid acting on residual anger impulsively.',
        ],
        affirmation:
          'My energy returns, directed by wisdom. I move forward with clarity and purpose.',
      },
    ],
    practicalTips: [
      'Physical exercise is essential for processing Mars retrograde frustration.',
      'Review your goals rather than pushing forward blindly.',
      'Avoid starting new conflicts—old ones may need resolution.',
      'This is an excellent time for strategic planning.',
      'Red jasper and bloodstone support healthy Mars energy.',
    ],
    journalPrompts: [
      'Where am I pushing when I should be pausing?',
      'What anger or frustration needs healthy expression?',
      'Which of my goals need revision or release?',
      'How can I channel my energy more wisely?',
    ],
  },
};

export function generateRetrogradePackContent(
  planet: string,
): PdfRetrogradePack {
  const data = RETROGRADE_DATA[planet];
  if (!data) {
    throw new Error(`Unknown retrograde planet: ${planet}`);
  }

  return {
    type: 'retrograde',
    slug: `${planet.toLowerCase()}-retrograde-pack`,
    title: `${planet} Retrograde`,
    subtitle: 'Your survival guide',
    planet: data.planet,
    moodText: `${planet} retrograde is not a curse—it is an invitation to slow down, review, and work with this energy consciously. This guide helps you navigate each phase with awareness and grace.`,
    perfectFor: [
      `Anyone who feels anxious about ${planet} retrograde.`,
      'Those seeking practical navigation strategies.',
      `Understanding the different phases of ${planet} retrograde.`,
    ],
    introText: data.description,
    survivalGuide: data.phases,
    practicalTips: data.practicalTips,
    journalPrompts: data.journalPrompts,
    closingText: `Thank you for navigating ${planet} retrograde with Lunary. Remember: this transit is not about punishment—it is about pause and review. Every retrograde offers a chance to catch what you may have missed and return to what truly matters.`,
    optionalAffirmation: `I flow with ${planet} retrograde rather than fighting against it. Slowdowns reveal what speed so often hides.`,
  };
}
