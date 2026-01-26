/**
 * TikTok fallback script generation
 * Uses content-type specific templates for variety
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { ContentAspect } from '../../shared/types';
import { hasTruncationArtifact } from '../../shared/text/truncation';
import { buildHookForTopic } from '../hooks';
import {
  getContentTypeFromCategory,
  type ContentTypeKey,
} from '../content-type-voices';

/**
 * Content-type specific fallback line templates
 * Each content type has multiple options for variety
 */
const FALLBACK_TEMPLATES: Record<
  ContentTypeKey,
  {
    context: string[];
    middle: string[];
    action: Record<ContentAspect, string[]>;
    closing: string[];
  }
> = {
  angel_numbers: {
    context: [
      '{topic} appears in specific moments, not random ones.',
      '{topic} shows up when something in your life is shifting.',
      '{topic} is a pattern marker, not a message.',
      'When {topic} repeats, check what you were just thinking about.',
    ],
    middle: [
      "It's not mystical. It's pattern recognition.",
      'The timing tells you more than the number itself.',
      'Context matters more than the general meaning.',
      'Your attention landed here for a reason.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: next time you see {topic}, note what decision you were avoiding.',
        'So what: track where {topic} appears this week. The pattern reveals itself.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: ignore the generic meaning. What does {topic} mean in YOUR context?',
        'So what: the internet meaning is a starting point, not the answer.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: notice how you FEEL when {topic} appears. That tells you more.',
        'So what: your emotional response to {topic} is data.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        "Try this: screenshot when {topic} appears. Review at week's end.",
        'So what: {topic} in receipts, timestamps, addresses. Track the pattern.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: {topic} has a timing message. Are you rushing or stalling?',
        'So what: the when matters as much as the what with {topic}.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} as a decision checkpoint today.',
        'So what: let {topic} pause you, not direct you.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: if {topic} feels anxious, wait 24 hours before acting.',
        'So what: not every {topic} sighting needs a response.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s quieter meaning often matters more.",
        'So what: the obvious interpretation of {topic} is rarely the useful one.',
      ],
    },
    closing: [
      '{topic} is a mirror, not a manual.',
      'The number reflects. You interpret.',
      "What you do with {topic} matters more than what it 'means'.",
      '{topic} points. You decide.',
    ],
  },

  tarot_major: {
    context: [
      '{topic} appears when something fundamental is shifting.',
      "{topic} doesn't predict. It reveals what's already true.",
      '{topic} asks a question you might be avoiding.',
      '{topic} shows the archetype you are living right now.',
    ],
    middle: [
      'This is psychology through symbolism.',
      'The card reflects your situation, not your fate.',
      'What you resist in this card is information.',
      'The shadow of {topic} holds the real insight.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        "Try this: where in your life does {topic}'s energy show up uninvited?",
        "So what: {topic} isn't happening TO you. It's showing what's already happening.",
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: forget what you think {topic} means. What does it FEEL like?',
        'So what: the book meaning of {topic} is the starting point, not the answer.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: sit with {topic} for 2 minutes. What comes up?',
        'So what: your reaction to {topic} IS the reading.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        "Try this: who in your life is playing {topic}'s role right now?",
        'So what: {topic} might be you. It might be someone else. Check both.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: {topic} appearing now suggests a threshold. Where is it?',
        'So what: the timing of {topic} tells you what phase you are in.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: ask {topic} what action it recommends. Listen.',
        'So what: {topic} has practical advice if you drop the mysticism.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        "Try this: if {topic} feels heavy, you're not ready. That's information.",
        'So what: resistance to {topic} is as meaningful as resonance.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: look at {topic}'s background details. What did you miss?",
        'So what: the obvious message of {topic} often hides the useful one.',
      ],
    },
    closing: [
      '{topic} illuminates. You choose.',
      'The card shows the terrain, not the destination.',
      '{topic} is a conversation, not a verdict.',
      'What you do with {topic} is the real reading.',
    ],
  },

  tarot_minor: {
    context: [
      '{topic} reflects daily life, not cosmic forces.',
      "{topic} shows the situation you're in right now.",
      '{topic} captures a moment, not a destiny.',
      "This is about what's happening in your Tuesday, not your lifetime.",
    ],
    middle: [
      'Minor arcana is practical, not mystical.',
      'This card reflects circumstance, not fate.',
      'The suit tells you the domain. The number tells you the phase.',
      "What's blocked or flowing in this area?",
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: where does {topic} show up in your week? Name one situation.',
        'So what: {topic} is about daily life. What needs attention?',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: {topic} in real life looks different than the image. How?',
        'So what: the picture is symbolic. Your situation is specific.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: {topic} stirs something. Name it.',
        'So what: your emotional read of {topic} is valid data.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        "Try this: {topic}'s energy is somewhere in your life. Find it.",
        "So what: this card is reflecting something that's already happening.",
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: is {topic} about something beginning, building, or completing?',
        'So what: the number tells you where you are in the cycle.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: what would {topic} tell you to do differently today?',
        'So what: cards are tools, not oracles.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        "Try this: if {topic} feels stuck, what's blocked? Start there.",
        'So what: reversed or resistant {topic} asks what you are avoiding.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s suit matters. What life domain is activated?",
        'So what: minor arcana is specific. Get specific in your interpretation.',
      ],
    },
    closing: [
      '{topic} shows the current chapter, not the whole book.',
      'Situations shift. So does this card.',
      '{topic} is feedback, not fortune.',
      'What you do next matters more than the card.',
    ],
  },

  planets: {
    context: [
      '{topic} influences how energy moves through a specific life domain.',
      "{topic} doesn't cause events. It colors how they feel.",
      '{topic} transits create patterns you can learn to recognize.',
      'When {topic} is active, certain themes come into focus.',
    ],
    middle: [
      'Planets describe conditions, not commands.',
      'This transit has a window. Track it.',
      'Observable effects are more useful than predictions.',
      "What you notice during {topic}'s influence is data.",
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        "Try this: track what domain of life feels {topic}'s influence this week.",
        'So what: {topic} activates certain themes. Which ones for you?',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        "Try this: forget the fear about {topic}. What's the actual effect?",
        "So what: {topic} isn't good or bad. It's a condition. Work with it.",
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        "Try this: notice your energy during {topic}'s transit. What shifts?",
        'So what: mood and energy changes during {topic} are trackable.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        "Try this: where does {topic}'s theme show up in your current situation?",
        'So what: planetary influence is abstract until you ground it in specifics.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        "Try this: note when {topic}'s window opens and closes. Plan accordingly.",
        'So what: timing is the practical gift of tracking {topic}.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        "Try this: use {topic}'s energy for what it supports, not against it.",
        'So what: work with the transit, not against it.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        "Try this: if {topic} says slow down, don't force speed.",
        'So what: some planetary conditions favor waiting. Honor that.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s subtle influence is often more useful than the obvious.",
        'So what: the secondary effects of {topic} often matter more.',
      ],
    },
    closing: [
      '{topic} sets the weather. You navigate.',
      'The planet indicates. You act.',
      'Transits are conditions, not commands.',
      "{topic}'s influence has a rhythm. Learn it.",
    ],
  },

  moon_phases: {
    context: [
      '{topic} shifts the energetic tone, not the events.',
      'During {topic}, certain activities flow better than others.',
      '{topic} is about rhythm, not ritual.',
      "The cycle you're in affects how effort lands.",
    ],
    middle: [
      'Moon phases are about timing, not magic.',
      'Your energy follows rhythms whether you track them or not.',
      'What wants to happen during {topic}? Start there.',
      'The phase tells you what to emphasize.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        "Try this: align one task with {topic}'s energy today.",
        'So what: {topic} supports certain actions. Which ones for you?',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        "Try this: {topic} isn't about rituals. It's about timing. Time one thing intentionally.",
        'So what: the practical use of {topic} is often simpler than the spiritual one.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: notice your energy during {topic}. Higher? Lower? Different?',
        'So what: mood shifts during {topic} are real. Track them.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: what life area feels most affected by {topic} right now?',
        'So what: lunar influence shows up differently for everyone. Find your pattern.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        "Try this: use {topic} to time something you've been putting off.",
        'So what: the phase creates a window. What fits in it?',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: rest during {topic} if it asks for rest. Push during {topic} if it supports effort.',
        'So what: work with the phase, not against it.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: if {topic} feels off, honor that. Wait for the next phase.',
        'So what: not every phase supports every action. That is okay.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s secondary effects are often more useful than the primary.",
        'So what: what {topic} asks you to STOP doing often matters more.',
      ],
    },
    closing: [
      '{topic} suggests. You choose.',
      'The phase sets tone, not terms.',
      'Rhythm is practical, not mystical.',
      "Work with {topic}'s energy, not against it.",
    ],
  },

  retrogrades: {
    context: [
      "{topic} doesn't break things. It surfaces what was already fragile.",
      'During {topic}, certain patterns reverse or slow.',
      '{topic} creates review periods, not crisis periods.',
      "The 're-' words are active now: revisit, reconsider, reconnect.",
    ],
    middle: [
      'Retrogrades are timing patterns, not punishments.',
      "What resurfaces during {topic}? That's the message.",
      'Slow down before the retrograde slows you down.',
      'Review is the work. Completion can wait.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: what old thing is resurfacing during {topic}? Address it.',
        'So what: {topic} brings things back for a reason. Find it.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        "Try this: {topic} isn't about disaster. What needs review?",
        'So what: the fear is overblown. The review period is real.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: notice what feels unresolved during {topic}. That is the clue.',
        'So what: emotional patterns return during {topic}. For closure, not chaos.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        "Try this: who or what from the past appears during {topic}? There's a reason.",
        'So what: {topic} returns are opportunities, not burdens.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: pause new starts during {topic}. Complete old ones.',
        "So what: {topic}'s timing favors finishing over beginning.",
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} to close one loop you have been avoiding.',
        'So what: retrograde periods are productive for completions.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: if it can wait until after {topic}, let it wait.',
        'So what: not everything needs to happen during {topic}.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s deeper invitation is often in what you are avoiding.",
        'So what: resistance during {topic} points to the real work.',
      ],
    },
    closing: [
      '{topic} pauses forward motion. Use the pause.',
      'Review now. Launch later.',
      'The retrograde is a feature, not a bug.',
      '{topic} completes what was left open.',
    ],
  },

  // Add more content types as needed...
  eclipses: {
    context: [
      '{topic} accelerates shifts that were already building.',
      '{topic} creates before/after moments you can feel.',
      'During {topic}, timelines compress.',
      '{topic} illuminates what you were not looking at.',
    ],
    middle: [
      'Eclipses are inflection points, not disasters.',
      'What ends during {topic} was already ending.',
      "The clarity isn't always comfortable.",
      'Six-month windows open at {topic}.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: what shifted at the last {topic}? Track the pattern.',
        'So what: {topic} marks chapters. What chapter is ending or beginning?',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        "Try this: {topic} isn't doom. What wants to change?",
        "So what: eclipses accelerate truth. That's different from creating crisis.",
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: notice what feels different around {topic}. That is information.',
        'So what: {topic} surfaces feelings that were hiding.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        "Try this: what life area felt {topic}'s influence? Name it specifically.",
        'So what: eclipse effects show up in specific domains. Find yours.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: track 6 months forward from {topic}. What unfolds?',
        'So what: eclipse timing creates windows that play out over months.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} to release something you have been holding.',
        "So what: what's ready to go? Let {topic} take it.",
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: major decisions around {topic} can wait. Let clarity settle.',
        'So what: immediacy around {topic} is often false urgency.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s quieter effects often matter more long-term.",
        "So what: what you don't notice at {topic} may be more important.",
      ],
    },
    closing: [
      '{topic} reveals what is ready to shift.',
      'Inflection points create clarity.',
      'Before and after {topic} are different chapters.',
      'What ends makes room for what begins.',
    ],
  },

  mirror_hours: {
    context: [
      '{topic} catches your attention at specific moments for a reason.',
      'When {topic} repeats, check what you were just thinking.',
      '{topic} is a synchronicity marker, not a message.',
      'The moment you notice {topic} tells you more than the time itself.',
    ],
    middle: [
      'Synchronicities are pattern recognition.',
      'What was on your mind when {topic} appeared?',
      'The timing of noticing is the data.',
      '{topic} marks moments of alignment or misalignment.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: next time {topic} appears, note the exact thought.',
        'So what: the context of {topic} is the meaning of {topic}.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        "Try this: {topic} isn't a message from above. It's your attention flagging something.",
        'So what: you noticed for a reason. What was it?',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: how do you feel when {topic} appears? That feeling matters.',
        'So what: your response to {topic} is information.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: track {topic} appearances for a week. What pattern emerges?',
        'So what: synchronicities cluster around themes. Find yours.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        "Try this: {topic}'s timing suggests something. What were you doing?",
        'So what: when you notice matters as much as what you notice.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} as a pause signal. Stop. Check in.',
        'So what: synchronicities can be decision checkpoints.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: if {topic} creates anxiety, the anxiety is the data.',
        'So what: not every synchronicity needs action.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s subtle message often involves what you are resisting.",
        'So what: what you were avoiding when {topic} appeared?',
      ],
    },
    closing: [
      '{topic} reflects your attention back to you.',
      'The clock is a mirror, not an oracle.',
      'You noticed. Now decide what to do with that.',
      '{topic} pauses time. You interpret why.',
    ],
  },

  zodiac_sun: {
    context: [
      '{topic} describes how you express your core self.',
      "{topic} isn't your whole chart. It's your leading edge.",
      'The way {topic} shows up depends on the whole chart.',
      '{topic} is the role you play most naturally.',
    ],
    middle: [
      'Sun signs are starting points, not endpoints.',
      'How {topic} expresses depends on everything else.',
      '{topic} describes identity, not destiny.',
      "You're not just {topic}. But {topic} is real.",
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        "Try this: where does {topic}'s style show up most clearly in your life?",
        'So what: {topic} has a signature. Can you name yours?',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: ignore {topic} memes. Where is the real pattern?',
        'So what: {topic} stereotypes miss the nuance. Find yours.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: when does {topic} energy feel strongest in you?',
        "So what: {topic}'s emotional signature is specific to you.",
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: how does {topic} show up in your work? Relationships?',
        'So what: {topic} expresses differently in different domains.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when is your {topic} energy highest? Note the pattern.',
        'So what: {topic} has rhythms. Learn yours.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: lean into {topic} strengths for one decision this week.',
        'So what: your sign is a tool. Use it.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        "Try this: when {topic} energy feels off, check what you're overcompensating.",
        'So what: sign shadows show up when we overuse our strengths.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s less obvious trait might be your actual superpower.",
        'So what: the secondary {topic} quality often matters more.',
      ],
    },
    closing: [
      '{topic} is how you shine. Shine anyway.',
      'The sign describes, not prescribes.',
      '{topic} is your style, not your limit.',
      'What you do with {topic} is yours to decide.',
    ],
  },

  zodiac_moon: {
    context: [
      '{topic} describes what you need to feel safe.',
      '{topic} is your emotional operating system.',
      'Your {topic} shows how you process feelings.',
      '{topic} is private. Others might not see it.',
    ],
    middle: [
      'Moon signs are about needs, not appearances.',
      "How you comfort yourself is {topic}'s domain.",
      'Emotional patterns repeat. {topic} is the pattern.',
      "What you need isn't what you show.",
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: what does {topic} need when stressed? Provide it.',
        "So what: {topic}'s need is non-negotiable. Meet it.",
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: forget the generic {topic} description. What do YOU need?',
        'So what: your {topic} is specific to your chart.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: when emotions run high, what does {topic} reach for?',
        "So what: your coping style is {topic}'s signature.",
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: how does {topic} show up at home vs. work?',
        "So what: {topic}'s needs express differently in different contexts.",
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        "Try this: when does {topic}'s need feel most urgent?",
        'So what: emotional needs have timing. Track yours.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: build one {topic}-supporting habit this month.',
        'So what: meeting {topic} needs is practical self-care.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: when {topic} feels needy, what is actually missing?',
        'So what: over-need from {topic} signals something deeper.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s shadow need might be the one you deny.",
        "So what: what {topic} won't ask for often matters most.",
      ],
    },
    closing: [
      '{topic} knows what you need. Listen.',
      'Emotional needs are real needs.',
      '{topic} processes feeling. Honor the process.',
      'What comforts {topic} is worth knowing.',
    ],
  },

  zodiac_rising: {
    context: [
      '{topic} is how others see you first.',
      '{topic} is your social mask, not your core.',
      "The way {topic} presents isn't always how you feel.",
      '{topic} describes approach to life, not identity.',
    ],
    middle: [
      'Rising signs shape first impressions.',
      'What people assume about you is {topic}.',
      'The mask serves a purpose. Know what it is.',
      '{topic} is how you enter rooms.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: notice how strangers respond to you. That is {topic}.',
        "So what: {topic}'s effect on others is observable.",
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: {topic} is not your identity. Where is the gap?',
        'So what: the mask and the self are different. Both are real.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: when does {topic} feel comfortable vs. performative?',
        "So what: {topic}'s ease or effort tells you something.",
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: how does {topic} show up in professional settings?',
        "So what: {topic}'s expression shifts by context.",
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when does {topic} take over automatically?',
        'So what: automatic {topic} shows where the mask is thickest.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} intentionally in one interaction today.',
        'So what: the rising sign can be a tool.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: when {topic} feels fake, what are you hiding?',
        'So what: mask fatigue signals something needs attention.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s shadow appearance might be what you judge in others.",
        "So what: what you don't like about {topic} is information.",
      ],
    },
    closing: [
      '{topic} is your entrance. Make it intentional.',
      'First impressions serve a purpose.',
      '{topic} is strategy as much as personality.',
      'The mask protects. Know what it protects.',
    ],
  },

  crystals: {
    context: [
      '{topic} has specific properties you can work with.',
      '{topic} is a tool, not a magic object.',
      'The effect of {topic} comes from how you use it.',
      '{topic} interacts with energy in observable ways.',
    ],
    middle: [
      'Crystals are tools, not talismans.',
      "{topic}'s property is specific. Learn it.",
      'How you use {topic} matters more than owning it.',
      'Physical sensation is valid data with {topic}.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: hold {topic} for 2 minutes. What do you feel?',
        'So what: {topic} has a sensation. Learn to recognize it.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: forget what {topic} "means." What does it do for you?',
        'So what: {topic} is personal. Your experience is valid.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: use {topic} when that specific feeling arises.',
        'So what: match {topic} to situation, not intention.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: where would {topic} help most in your daily routine?',
        'So what: crystals work best with specific applications.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: notice when {topic} feels more or less effective.',
        'So what: timing affects how {topic} works.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} for one specific purpose this week.',
        'So what: focused use beats general intention.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: if {topic} feels off, cleanse it or set it aside.',
        'So what: crystals need care to work well.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s secondary property might be what you actually need.",
        'So what: the obvious use is not always the useful use.',
      ],
    },
    closing: [
      '{topic} is a tool. Use it skillfully.',
      'Crystals respond to attention and care.',
      'What you bring to {topic} affects what it offers.',
      'Practical use beats mystical thinking.',
    ],
  },

  chakras: {
    context: [
      '{topic} governs a specific domain of experience.',
      'Blocked {topic} shows up in specific ways.',
      '{topic} connects body sensation to energy flow.',
      'The state of {topic} affects how you function.',
    ],
    middle: [
      'Chakras are maps, not magic.',
      '{topic} blockage has physical symptoms.',
      'Energy and sensation are connected.',
      "What's stuck in {topic} shows up in life.",
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: place attention on {topic} area. What do you notice?',
        'So what: {topic} speaks through sensation. Listen.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: skip the colors and symbols. What do you feel at {topic}?',
        'So what: your body knows {topic} better than any chart.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: when {topic}-related emotions arise, notice body sensation.',
        'So what: emotion and {topic} location connect. Track it.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: where does {topic} show up in your daily functioning?',
        'So what: {topic} affects practical life, not just energy.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when does {topic} feel most open or closed?',
        'So what: {topic} has patterns. Notice them.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: one {topic}-supporting practice this week. Just one.',
        'So what: small consistent action beats occasional intensity.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: if {topic} work feels forced, pause. Come back later.',
        'So what: resistance is data. Respect it.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        "Try this: {topic}'s subtle signals often arrive before the obvious ones.",
        'So what: early {topic} signals prevent bigger issues.',
      ],
    },
    closing: [
      '{topic} is feedback, not fortune.',
      'The body knows. Trust it.',
      'Energy follows attention. Place it wisely.',
      '{topic} balances through awareness.',
    ],
  },

  elements: {
    context: [
      '{topic} describes how you process experience.',
      '{topic} energy has specific characteristics.',
      'Too much or too little {topic} creates imbalance.',
      '{topic} is a lens, not a limit.',
    ],
    middle: [
      'Elemental balance is practical.',
      '{topic} strengths can become weaknesses.',
      'What {topic} needs is specific.',
      'Balance comes from awareness.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: where does {topic} energy show up strongest in you?',
        'So what: know your {topic} pattern. Then adjust.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: {topic} is not your destiny. Where do you need balance?',
        'So what: elemental imbalance is adjustable.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: when {topic} energy runs high, what do you need?',
        'So what: {topic} excess and deficiency feel different. Learn both.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: where does {topic} affect your relationships most?',
        'So what: {topic} shows up in how you connect.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when is your {topic} energy most helpful? Most problematic?',
        'So what: {topic} has timing. Track it.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: add a balancing element practice this week.',
        'So what: balance is created, not found.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: when {topic} overwhelms, what element balances it?',
        'So what: elemental excess needs the balancing element.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        'Try this: your missing element might be what you actually need most.',
        'So what: what you lack is often what you seek.',
      ],
    },
    closing: [
      '{topic} is tendency, not destiny.',
      'Balance is active, not passive.',
      'Know your element. Then transcend it.',
      '{topic} is a starting point, not an endpoint.',
    ],
  },

  numerology_life_path: {
    context: [
      '{topic} describes your central life theme.',
      "{topic} isn't what you are, but what you're learning.",
      'The lesson of {topic} repeats until learned.',
      '{topic} shows up in patterns you can recognize.',
    ],
    middle: [
      'Life paths are lessons, not labels.',
      '{topic} keeps teaching the same thing differently.',
      'The challenge and gift are connected.',
      'Your path is yours. Comparison is useless.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: where did {topic} theme show up in your last major decision?',
        "So what: {topic} doesn't go away. It deepens.",
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: forget the {topic} stereotype. Where is YOUR pattern?',
        'So what: your {topic} is specific to your life.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: when {topic} lessons feel heavy, what needs attention?',
        'So what: resistance to {topic} creates suffering. Acceptance works better.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: how does {topic} show up in work vs. relationships?',
        'So what: the same lesson appears in different costumes.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: trace {topic} theme through your life decades. See the pattern?',
        'So what: {topic} evolves. Track the evolution.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: one {topic}-aligned decision this week.',
        'So what: working with {topic} beats working against it.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: when {topic} feels like burden, what are you resisting?',
        'So what: the lesson you avoid is the lesson you need.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        'Try this: {topic} gift often hides inside {topic} challenge.',
        'So what: strength and struggle connect. Find the connection.',
      ],
    },
    closing: [
      '{topic} is your curriculum. Engage it.',
      'The lesson repeats until learned. Then it deepens.',
      'Your path is specific. Walk it.',
      '{topic} evolves as you do.',
    ],
  },

  numerology_expression: {
    context: [
      '{topic} describes your natural gifts.',
      "{topic} is what you're meant to express.",
      'Your {topic} wants to be used.',
      '{topic} describes talent, not destiny.',
    ],
    middle: [
      'Expression numbers are about what flows naturally.',
      '{topic} ability is already present. Develop it.',
      'What comes easy to you is {topic}.',
      'Unused {topic} creates frustration.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: where does {topic} talent show up uninstructed?',
        'So what: {topic} is already happening. Notice it.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: {topic} is not about career. Where else does it appear?',
        'So what: expression happens everywhere. Not just work.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: when you use {topic} abilities, how do you feel?',
        'So what: {topic} in action feels right. Track that feeling.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: who notices your {topic} abilities? Ask them.',
        'So what: others often see {topic} before you do.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when does {topic} expression flow most easily?',
        'So what: {topic} has conditions. Create them.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} ability for one task this week.',
        'So what: talents strengthen with use.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: when {topic} feels blocked, what is in the way?',
        'So what: blocked {topic} signals something needs addressing.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        'Try this: {topic} secondary gift might be more useful than the obvious one.',
        'So what: less obvious {topic} talents often have more potential.',
      ],
    },
    closing: [
      '{topic} is waiting to be used.',
      'Express what you have. Develop what you express.',
      'Talent unused creates frustration. Use it.',
      '{topic} gets stronger with practice.',
    ],
  },

  sabbats: {
    context: [
      '{topic} marks a turning point in the yearly cycle.',
      'Nature at {topic} teaches something specific.',
      'The energy available during {topic} supports certain activities.',
      '{topic} is about rhythm, not ritual.',
    ],
    middle: [
      'Sabbats are about seasonal alignment.',
      "What's happening outside reflects what's happening inside.",
      '{topic} energy is available whether you ritualize or not.',
      'Nature is the calendar. Follow it.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: step outside during {topic}. What does the season teach?',
        'So what: {topic} wisdom is in nature. Observe.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: skip the ritual. What does {topic} naturally ask?',
        'So what: {topic} works without ceremony. Just attention.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: how does your energy shift around {topic}?',
        'So what: seasonal feelings are real. Honor them.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: what in your life is in the same phase as nature at {topic}?',
        'So what: personal seasons mirror natural ones.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: use {topic} timing for a project milestone.',
        'So what: seasonal timing supports certain activities.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: one {topic}-aligned action. Small is fine.',
        'So what: alignment is practical, not mystical.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: if {topic} energy feels off, what are you resisting?',
        'So what: seasonal resistance is information.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        'Try this: what {topic} asks you to release might matter most.',
        'So what: letting go is often the {topic} lesson.',
      ],
    },
    closing: [
      '{topic} turns the wheel. Turn with it.',
      'Nature shows the way.',
      'Seasons are teachers. Pay attention.',
      '{topic} passes. What stays?',
    ],
  },

  houses: {
    context: [
      '{topic} governs a specific life domain.',
      'Planets in {topic} affect that area directly.',
      '{topic} is where certain themes play out.',
      'Empty {topic} does not mean absent themes.',
    ],
    middle: [
      'Houses are life areas, not predictions.',
      'What happens in {topic} affects that domain.',
      'The ruler of {topic} tells you more.',
      "{topic}'s condition shows that life area's condition.",
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: what life area does {topic} govern for you?',
        'So what: house themes are specific. Get specific.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: empty {topic} does not mean empty domain. What is happening there?',
        'So what: all houses matter. Full or empty.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: how does {topic} life area make you feel?',
        'So what: your relationship to {topic} domain is information.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: where does {topic} show up in daily life?',
        'So what: houses are abstract until grounded.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when planets transit {topic}, notice what activates.',
        'So what: transits light up houses. Track it.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: focus on one {topic} improvement this month.',
        'So what: house themes respond to attention.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: when {topic} feels stuck, what planet rules it?',
        'So what: the ruler tells you what is blocking {topic}.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        'Try this: {topic} hidden themes might be more active than obvious ones.',
        'So what: what you do not see in {topic} often runs the show.',
      ],
    },
    closing: [
      '{topic} is a life domain. Tend it.',
      'Where you focus, energy flows.',
      "{topic}'s condition is changeable.",
      'Houses respond to attention.',
    ],
  },

  aspects: {
    context: [
      '{topic} describes how two energies interact.',
      '{topic} creates a specific dynamic in your chart.',
      'The tension or flow of {topic} shapes expression.',
      '{topic} aspects are lifelong patterns.',
    ],
    middle: [
      'Aspects are conversations between planets.',
      '{topic} creates either friction or flow.',
      'Hard aspects build strength. Soft aspects give ease.',
      'Neither is better. Both are useful.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: where does {topic} dynamic show up in your life?',
        'So what: aspects are abstract until you ground them.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: hard {topic} is not bad. What does it build?',
        'So what: tension creates growth. Not just problems.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: how does {topic} feel when activated?',
        'So what: aspects have signatures. Learn yours.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: in what situations does {topic} emerge most clearly?',
        'So what: aspects activate in context. Find your context.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when transits trigger {topic}, what happens?',
        'So what: natal aspects reactivate during transits.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: use {topic} dynamic intentionally this week.',
        'So what: you can work with aspects, not just experience them.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: when {topic} feels overwhelming, what needs integration?',
        'So what: overwhelming aspects need work, not avoidance.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        'Try this: {topic} secondary effects might be more useful than primary.',
        'So what: aspects have layers. Explore them.',
      ],
    },
    closing: [
      '{topic} creates a dynamic. Work with it.',
      'Friction and flow both serve.',
      'Aspects are permanent. How you use them evolves.',
      'The conversation continues. Stay engaged.',
    ],
  },

  default: {
    context: [
      '{topic} has patterns worth noticing.',
      '{topic} operates in specific ways.',
      'Understanding {topic} requires observation.',
      '{topic} affects experience in trackable ways.',
    ],
    middle: [
      'What you notice about {topic} is valid data.',
      '{topic} has practical applications.',
      'Theory about {topic} matters less than experience.',
      'Your relationship to {topic} is specific.',
    ],
    action: {
      [ContentAspect.CORE_MEANING]: [
        'Try this: observe {topic} in your life this week.',
        'So what: attention reveals patterns.',
      ],
      [ContentAspect.COMMON_MISCONCEPTION]: [
        'Try this: question what you think about {topic}.',
        'So what: assumptions about {topic} might be wrong.',
      ],
      [ContentAspect.EMOTIONAL_IMPACT]: [
        'Try this: notice how {topic} affects your mood.',
        'So what: emotional response is information.',
      ],
      [ContentAspect.REAL_LIFE_EXPRESSION]: [
        'Try this: where does {topic} show up practically?',
        'So what: ground {topic} in specifics.',
      ],
      [ContentAspect.TIMING_AND_CONTEXT]: [
        'Try this: when is {topic} most relevant?',
        'So what: context matters with {topic}.',
      ],
      [ContentAspect.PRACTICAL_APPLICATION]: [
        'Try this: apply {topic} understanding once this week.',
        'So what: application beats theory.',
      ],
      [ContentAspect.WHEN_TO_AVOID]: [
        'Try this: notice when {topic} is not useful.',
        'So what: not everything applies always.',
      ],
      [ContentAspect.SUBTLE_INSIGHT]: [
        'Try this: look for the less obvious {topic} pattern.',
        'So what: subtle often matters more.',
      ],
    },
    closing: [
      '{topic} is a tool. Use it well.',
      'Observation beats assumption.',
      'What you do with {topic} matters.',
      'Patterns reveal themselves to those who watch.',
    ],
  },
};

/**
 * Get random element from array
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Build fallback short script when AI generation fails
 * Uses content-type specific templates for variety
 */
export function buildFallbackShortScript(
  facet: DailyFacet,
  grimoireData: Record<string, any> | null,
  angle: string,
  aspect: ContentAspect,
): string {
  const contentType = getContentTypeFromCategory(facet.title);
  const templates =
    FALLBACK_TEMPLATES[contentType] || FALLBACK_TEMPLATES.default;

  const topic = facet.title;
  const lowerTopic = topic.toLowerCase();

  // Build hook using the existing hook system
  const hook = buildHookForTopic(topic, aspect);

  // Get grimoire-based context if available
  const rawBase =
    grimoireData?.meaning ||
    grimoireData?.mysticalProperties ||
    grimoireData?.description ||
    facet.focus ||
    facet.shortFormHook;
  const base =
    rawBase && !hasTruncationArtifact(String(rawBase)) ? String(rawBase) : '';

  // Build varied script body from templates
  const contextLine = pickRandom(templates.context).replace(
    /\{topic\}/g,
    topic,
  );

  const middleLine = base
    ? base.replace(/[.!?]+$/, '').trim() + '.'
    : pickRandom(templates.middle).replace(/\{topic\}/g, lowerTopic);

  const actionOptions =
    templates.action[aspect] || templates.action[ContentAspect.CORE_MEANING];
  const actionLine = pickRandom(actionOptions).replace(
    /\{topic\}/g,
    lowerTopic,
  );

  const closingLine = pickRandom(templates.closing).replace(
    /\{topic\}/g,
    topic,
  );

  // Additional middle content from grimoire if available
  const additionalLines: string[] = [];
  if (grimoireData?.transitEffect) {
    additionalLines.push(String(grimoireData.transitEffect).trim());
  }
  if (grimoireData?.houseMeaning && additionalLines.length < 2) {
    additionalLines.push(String(grimoireData.houseMeaning).trim());
  }

  const lines = [
    contextLine,
    middleLine,
    ...additionalLines.slice(0, 2),
    actionLine,
    closingLine,
  ]
    .map((line) => line.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const scriptBody = lines.slice(0, 8).join('\n');
  return `${hook}\n\n${scriptBody}`.trim();
}

/**
 * Build TikTok hook from facet (legacy, uses new system internally)
 */
export function buildTikTokHook(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  // Use the content-type aware hook builder
  return buildHookForTopic(facet.title, ContentAspect.CORE_MEANING);
}

/**
 * Build TikTok intro section
 */
export function buildTikTokIntro(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
): string {
  if (data?.description) {
    const sentences = data.description.split(/[.!?]+/).filter(Boolean);
    const intro = sentences.slice(0, 2).join('. ') + '.';
    return intro.length > 150 ? sentences[0] + '.' : intro;
  }
  return facet.focus;
}

/**
 * Build TikTok core content section
 */
export function buildTikTokCore(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  const points: string[] = [];

  if (data) {
    if (data.element) {
      points.push(`Element: ${data.element}.`);
    }
    if (data.ruler || data.rulingPlanet) {
      points.push(`Ruled by ${data.ruler || data.rulingPlanet}.`);
    }
    if (data.modality) {
      points.push(`${data.modality} modality.`);
    }
    if (data.keywords && Array.isArray(data.keywords)) {
      points.push(`Key themes: ${data.keywords.slice(0, 3).join(', ')}.`);
    }
    if (data.meaning || data.mysticalProperties) {
      const meaning = data.meaning || data.mysticalProperties;
      const shortened =
        meaning.length > 140 ? meaning.substring(0, 140) + '...' : meaning;
      points.push(shortened);
    }
    if (data.strengths && Array.isArray(data.strengths)) {
      points.push(
        `Strengths include ${data.strengths.slice(0, 2).join(' and ')}.`,
      );
    }
  }

  if (points.length < 2) {
    points.push(facet.focus);
  }

  return points.slice(0, 3).join(' ');
}

/**
 * Build TikTok takeaway section
 */
export function buildTikTokTakeaway(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  const contentType = getContentTypeFromCategory(theme.category);
  const templates =
    FALLBACK_TEMPLATES[contentType] || FALLBACK_TEMPLATES.default;

  let takeaway = '';
  if (data?.affirmation) {
    takeaway = data.affirmation;
  } else {
    takeaway = pickRandom(templates.closing).replace(/\{topic\}/g, facet.title);
  }

  return takeaway;
}

/**
 * Generate full TikTok script fallback
 */
export function generateTikTokScriptFallback(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  // Use the main fallback function which now has variety
  return buildFallbackShortScript(
    facet,
    grimoireData,
    'core_meaning',
    ContentAspect.CORE_MEANING,
  );
}
