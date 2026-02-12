interface SurvivalDay {
  dos: string[];
  donts: string[];
  journalPrompt: string;
  tip: string;
}

const SURVIVAL_CONTENT: SurvivalDay[] = [
  {
    dos: [
      'Double-check all messages before sending',
      'Back up important files and documents',
      'Revisit old projects that need attention',
    ],
    donts: [
      'Sign contracts or make big purchases',
      'Start brand-new ventures from scratch',
      'Assume everyone understood your message',
    ],
    journalPrompt:
      'What recurring pattern from the past keeps showing up? What is it trying to teach you?',
    tip: 'Mercury retrograde is a "re-" period: review, reflect, revise, reconnect. Lean into that energy instead of fighting it.',
  },
  {
    dos: [
      'Reach out to someone you have lost touch with',
      'Review your budget and financial plans',
      'Practice active listening in conversations',
    ],
    donts: [
      'Rush through important communications',
      'Ignore technology glitches — address them calmly',
      "Make assumptions about others' intentions",
    ],
    journalPrompt:
      'Who from your past has been on your mind? What would you say to them if you could?',
    tip: 'Travel delays are common during Mercury Rx. Leave extra time and pack patience.',
  },
  {
    dos: [
      'Meditate or journal before making decisions',
      'Review and organize your digital life',
      'Practice patience with miscommunications',
    ],
    donts: [
      'Send emotional texts without sleeping on them',
      'Buy new electronics or gadgets impulsively',
      'Ignore your gut feeling about a situation',
    ],
    journalPrompt:
      'What truth have you been avoiding? How might facing it actually free you?',
    tip: 'Your inner voice is louder during retrograde. Use this time for honest self-reflection.',
  },
  {
    dos: [
      'Revisit a creative project you shelved',
      'Have conversations you have been putting off',
      'Clean and organize your physical space',
    ],
    donts: [
      'Launch a new website or app',
      'Make permanent cosmetic changes on impulse',
      'Gossip or spread unverified information',
    ],
    journalPrompt:
      'What unfinished business is weighing on you? What would completing it feel like?',
    tip: 'Retrograde is excellent for editing and refining. Polish what already exists.',
  },
  {
    dos: [
      'Read the fine print on everything',
      'Express gratitude to people who matter',
      'Take a different route — literally or metaphorically',
    ],
    donts: [
      'Overcommit your schedule',
      'Ignore warning signs in relationships',
      'Make life-altering decisions under pressure',
    ],
    journalPrompt:
      'If you could redesign one area of your life, what would it look like?',
    tip: 'Slow down. The universe is asking you to be present, not productive.',
  },
  {
    dos: [
      'Fact-check before sharing information',
      'Reconnect with a hobby you used to love',
      'Write a letter to your past self',
    ],
    donts: [
      'Ignore backed-up or delayed plans — they are messages',
      'Fight with people over misunderstandings',
      'Resist change that is clearly needed',
    ],
    journalPrompt:
      'What belief from your past no longer serves you? What would you replace it with?',
    tip: 'Old flames and old friends may reappear. Approach these reconnections with curiosity, not expectation.',
  },
  {
    dos: [
      'Review your goals for the year so far',
      'Practice breathwork or grounding exercises',
      'Write down your dreams — they may carry messages',
    ],
    donts: [
      'Force outcomes or try to control situations',
      'Neglect self-care in favor of productivity',
      'Take criticism personally — it is Mercury energy',
    ],
    journalPrompt:
      'What is Mercury retrograde mirroring back to you about how you communicate?',
    tip: 'This is a cosmic pause button. Trust that delays are redirections, not dead ends.',
  },
];

/**
 * Get survival content for a specific day of retrograde.
 * Cycles through content array if retrograde lasts longer than content entries.
 */
export function getSurvivalContent(dayNumber: number): SurvivalDay {
  const index =
    (((dayNumber - 1) % SURVIVAL_CONTENT.length) + SURVIVAL_CONTENT.length) %
    SURVIVAL_CONTENT.length;
  return SURVIVAL_CONTENT[index];
}

export type { SurvivalDay };
