export type RitualContext =
  | 'morning'
  | 'evening'
  | 'cosmic_reset'
  | 'new_moon'
  | 'full_moon';

export interface RitualMessage {
  id: string;
  text: string;
}

export const MORNING_MESSAGES: RitualMessage[] = [
  {
    id: 'morning-01',
    text: 'Good morning. The sky has shifted while you slept. Your insight for today is waiting when you are ready.',
  },
  {
    id: 'morning-02',
    text: 'A new day rises. What intention will you carry with you into it?',
  },
  {
    id: 'morning-03',
    text: 'The morning light is patient. Check your insight when you feel grounded.',
  },
  {
    id: 'morning-04',
    text: "Before the world asks for your attention, see how today's sky aligns with you.",
  },
  {
    id: 'morning-05',
    text: 'The dawn holds quiet wisdom. Your Lunary Insight reflects it back to you.',
  },
  {
    id: 'morning-06',
    text: "Begin slowly. The day's energy is already forming. Explore what it means for you.",
  },
  {
    id: 'morning-07',
    text: 'Your first breath of the day is a doorway. Step through with clarity.',
  },
  {
    id: 'morning-08',
    text: 'The day has not shaped you yet. Notice who you are before it does.',
  },
  {
    id: 'morning-09',
    text: "You are entering a new moment. Let today's sky guide your first step.",
  },
  { id: 'morning-10', text: 'Morning offers a reset, not a demand.' },
  {
    id: 'morning-11',
    text: 'You are not late. You are arriving in your own timing.',
  },
  { id: 'morning-12', text: 'The world wakes loudly. You do not have to.' },
  {
    id: 'morning-13',
    text: 'Clarity often arrives in small, quiet mornings like this.',
  },
  { id: 'morning-14', text: 'A quiet beginning can shape a softer day.' },
  {
    id: 'morning-15',
    text: 'Your energy is new, even if the world feels familiar.',
  },
  {
    id: 'morning-16',
    text: 'The sky moves with purpose. Let your first intention be just as gentle.',
  },
  {
    id: 'morning-17',
    text: 'Today is unwritten. Breathe before you begin to write it.',
  },
  {
    id: 'morning-18',
    text: 'Before plans and tasks, there is rhythm. Check how yours feels today.',
  },
  {
    id: 'morning-19',
    text: 'You can begin differently today, even in very small ways.',
  },
  {
    id: 'morning-20',
    text: 'Listen inward before you listen outward. Your insight can help you start.',
  },
  {
    id: 'morning-21',
    text: 'Let this morning be gentle. Not everything needs urgency.',
  },
  {
    id: 'morning-22',
    text: 'The horizon opens. So does your inner landscape. See what your insight mirrors.',
  },
  {
    id: 'morning-23',
    text: 'You are arriving at a new point in your own orbit. Pause and notice it.',
  },
  {
    id: 'morning-24',
    text: 'The day does not define you. You choose how to meet it.',
  },
  {
    id: 'morning-25',
    text: 'The sky has moved, and so have you, even in sleep.',
  },
];

export const EVENING_MESSAGES: RitualMessage[] = [
  {
    id: 'evening-01',
    text: 'The day softens. Reflect on how your insight unfolded before you rest.',
  },
  {
    id: 'evening-02',
    text: "Evening arrives. What part of today's energy stayed with you?",
  },
  {
    id: 'evening-03',
    text: 'As the sky darkens, revisit your card or transit to close the day.',
  },
  {
    id: 'evening-04',
    text: "The night invites stillness. Let today's theme settle gently.",
  },
  {
    id: 'evening-05',
    text: 'Day turns to night. Consider what from your Lunary Insight you want to carry forward.',
  },
  {
    id: 'evening-06',
    text: 'You have carried enough for today. Let something be set down.',
  },
  {
    id: 'evening-07',
    text: 'Night does not judge the day. It simply holds what remains.',
  },
  { id: 'evening-08', text: 'Let quiet be your closing ritual.' },
  {
    id: 'evening-09',
    text: 'You can end the day more softly than you began it.',
  },
  {
    id: 'evening-10',
    text: 'Let the weight of the day fall away from your shoulders.',
  },
  {
    id: 'evening-11',
    text: 'You made it through another cycle. Honour that truth quietly.',
  },
  { id: 'evening-12', text: 'Even endings can be gentle ones.' },
  {
    id: 'evening-13',
    text: 'What felt heavy today can be left outside your sleep.',
  },
  {
    id: 'evening-14',
    text: 'Your worth is not measured by how productive the day was.',
  },
  { id: 'evening-15', text: 'This is your time to return fully to yourself.' },
  { id: 'evening-16', text: 'The night sky resets what the day complicated.' },
  {
    id: 'evening-17',
    text: 'Not every question needs an answer before sleep. Presence is enough.',
  },
  {
    id: 'evening-18',
    text: 'Let the day be complete, even if it felt unfinished.',
  },
  {
    id: 'evening-19',
    text: 'Rest is a form of clarity, even when it does not feel active.',
  },
  { id: 'evening-20', text: 'You are allowed to rest without earning it.' },
];

export const COSMIC_RESET_MESSAGES: RitualMessage[] = [
  {
    id: 'reset-01',
    text: 'Your chart moved through {{mainTransits}} this week. The {{dominantTheme}} energy shaped your days. What part of it felt most true?',
  },
  {
    id: 'reset-02',
    text: 'You experienced {{moonPhases}} and felt the pull of {{dominantTheme}}. Reflect softly on what changed.',
  },
  {
    id: 'reset-03',
    text: 'This week held {{mainTransits}}. The theme of {{dominantTheme}} wove through your days. What stands out now?',
  },
  {
    id: 'reset-04',
    text: 'Notice the emotions that returned throughout the week. {{mainTransits}} may echo what you felt.',
  },
  {
    id: 'reset-05',
    text: 'Your transits this week—{{mainTransits}}—carried a theme of {{dominantTheme}}. What did they highlight for you?',
  },
  {
    id: 'reset-06',
    text: 'You moved through {{moonPhases}} and {{mainTransits}}. Honour the ways you adapted.',
  },
  {
    id: 'reset-07',
    text: 'What inner rhythm carried you through the week? {{dominantTheme}} offers a clue.',
  },
  {
    id: 'reset-08',
    text: 'Your placements experienced {{mainTransits}}. Look back at where you felt them.',
  },
  {
    id: 'reset-09',
    text: 'This week revealed something about your timing. {{dominantTheme}} shaped the pace. Reflect without pressure.',
  },
  {
    id: 'reset-10',
    text: 'You are at the end of a personal orbit. {{mainTransits}} brought you here. Let yourself reset with intention.',
  },
];

export const NEW_MOON_MESSAGES: RitualMessage[] = [
  {
    id: 'newmoon-01',
    text: 'A new moon arrives. Begin with intention, not expectation.',
  },
  { id: 'newmoon-02', text: 'The cycle resets. What do you want to call in?' },
  {
    id: 'newmoon-03',
    text: 'New moon darkness is fertile. Let your insight guide your intention.',
  },
  {
    id: 'newmoon-04',
    text: 'A fresh lunar cycle begins. Meet it with clarity.',
  },
  {
    id: 'newmoon-05',
    text: 'The sky quiets for the new moon. Listen to your inner rhythm.',
  },
  {
    id: 'newmoon-06',
    text: 'Begin again gently. There is no need to prove anything.',
  },
  {
    id: 'newmoon-07',
    text: 'This is a moment for renewal, even in subtle ways.',
  },
  { id: 'newmoon-08', text: 'New moons invite honesty. Start with yourself.' },
  {
    id: 'newmoon-09',
    text: 'You can let something end so that something softer can begin.',
  },
  {
    id: 'newmoon-10',
    text: 'The lunar cycle turns. Notice what wants to grow within you.',
  },
  {
    id: 'newmoon-11',
    text: 'You do not need a grand plan. A single sincere intention is enough.',
  },
  {
    id: 'newmoon-12',
    text: 'The new moon is a blank page. You decide how much to write.',
  },
  {
    id: 'newmoon-13',
    text: 'Let this new moon mark a small inner shift rather than a performance.',
  },
  {
    id: 'newmoon-14',
    text: 'You can set intentions that feel kind, not punishing.',
  },
  { id: 'newmoon-15', text: 'Even stillness is a valid beginning.' },
  {
    id: 'newmoon-16',
    text: 'Allow yourself to be in between what was and what is forming.',
  },
  { id: 'newmoon-17', text: 'The dark moon is not empty, it is gathering.' },
  {
    id: 'newmoon-18',
    text: 'Trust that a small inner commitment can change more than force.',
  },
  {
    id: 'newmoon-19',
    text: 'Let this new cycle support you rather than stretch you.',
  },
  {
    id: 'newmoon-20',
    text: 'You are allowed to grow at your own pace this lunar cycle.',
  },
];

export const FULL_MOON_MESSAGES: RitualMessage[] = [
  {
    id: 'fullmoon-01',
    text: 'The full moon illuminates what has been building. Look gently.',
  },
  {
    id: 'fullmoon-02',
    text: 'Tonight reveals what the month has shaped. Reflect with care.',
  },
  {
    id: 'fullmoon-03',
    text: 'The full moon brings clarity. Notice what comes forward.',
  },
  {
    id: 'fullmoon-04',
    text: 'A moment of illumination. What truth stands out for you?',
  },
  {
    id: 'fullmoon-05',
    text: 'The sky brightens. What insight does it echo in your life?',
  },
  {
    id: 'fullmoon-06',
    text: 'Full moon light invites release. What feels complete?',
  },
  {
    id: 'fullmoon-07',
    text: 'Let what surfaced today be seen without forcing action.',
  },
  {
    id: 'fullmoon-08',
    text: 'The full moon amplifies patterns. Notice them softly.',
  },
  {
    id: 'fullmoon-09',
    text: 'A cycle peaks tonight. Honour what you have learned.',
  },
  {
    id: 'fullmoon-10',
    text: 'Full moons reveal. You do not need to fix everything they show.',
  },
  {
    id: 'fullmoon-11',
    text: 'You can let go of what does not need to travel into the next cycle.',
  },
  {
    id: 'fullmoon-12',
    text: 'This is a moment to notice what you have been carrying quietly.',
  },
  { id: 'fullmoon-13', text: 'Even clarity can arrive with gentleness.' },
  {
    id: 'fullmoon-14',
    text: 'You may be more aware of your feelings. Let them move through you.',
  },
  {
    id: 'fullmoon-15',
    text: 'The full moon can highlight tension and tenderness at the same time.',
  },
  {
    id: 'fullmoon-16',
    text: 'You can choose to release something small. It still counts.',
  },
  {
    id: 'fullmoon-17',
    text: 'Let the moon hold what you are tired of holding alone.',
  },
  {
    id: 'fullmoon-18',
    text: 'This is a good night to see what is true, not what is expected.',
  },
  {
    id: 'fullmoon-19',
    text: 'The cycle that peaks tonight has brought you here. Acknowledge that.',
  },
  { id: 'fullmoon-20', text: 'After illumination, rest is allowed.' },
];

export const MESSAGE_POOLS = {
  morning: MORNING_MESSAGES,
  evening: EVENING_MESSAGES,
  cosmic_reset: COSMIC_RESET_MESSAGES,
  new_moon: NEW_MOON_MESSAGES,
  full_moon: FULL_MOON_MESSAGES,
} as const;
