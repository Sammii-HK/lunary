/**
 * Transit content templates — pre-baked, jargon-free blurbs for free-tier users.
 *
 * Voice: short, evocative, second-person, no astrologese.
 *  - "transiting Saturn squares natal Mars" → "an old wall meets a familiar fire today"
 *  - "focus on your goals" → too generic, never ship
 *
 * Pure module — no IO, no async. Safe to import server- or client-side.
 */

// Locally scoped types — keep this module decoupled from the client-only
// `useEphemerisRange` declarations and decoupled from `symbols.json` runtime.
export type BodyName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type AspectType =
  | 'Conjunction'
  | 'Opposition'
  | 'Trine'
  | 'Square'
  | 'Sextile';

export type LunarPhase =
  | 'NewMoon'
  | 'FirstQuarter'
  | 'FullMoon'
  | 'LastQuarter'
  | 'VoidOfCourseStart'
  | 'VoidOfCourseEnd';

export type EclipseKind = 'Solar' | 'Lunar';

// ---------------------------------------------------------------------------
// Discriminated union of all transit events the templates layer understands.
// ---------------------------------------------------------------------------

export type TransitEvent =
  | { kind: 'planet_in_sign'; planet: BodyName; sign: ZodiacSign }
  | {
      kind: 'aspect_to_natal';
      transitPlanet: BodyName;
      aspect: AspectType;
      natalPlanet: BodyName;
    }
  | { kind: 'retrograde'; planet: BodyName; phase: 'entering' | 'leaving' }
  | { kind: 'ingress'; planet: BodyName; sign: ZodiacSign }
  | { kind: 'eclipse'; kindOfEclipse: EclipseKind; sign?: ZodiacSign }
  | { kind: 'lunation'; phase: LunarPhase; sign?: ZodiacSign };

// ---------------------------------------------------------------------------
// Planet-in-sign blurbs.
// 40 hand-crafted entries — fallback covers the rest.
// ---------------------------------------------------------------------------

export type PlanetInSignKey = `${BodyName}_${ZodiacSign}`;

export const planetInSignBlurbs: Partial<Record<PlanetInSignKey, string>> = {
  // Sun
  Sun_Aries: 'A spark in your gut. Move first, edit later.',
  Sun_Taurus: 'Slow down. Your body knows the next right move.',
  Sun_Gemini: 'Two ideas pulling at once — let them both speak.',
  Sun_Cancer: 'Tend something soft today. The shell can wait.',
  Sun_Leo: 'Take up the room you keep apologising for.',
  Sun_Virgo: 'A small fix unlocks the whole afternoon.',
  Sun_Libra: 'Beauty is the strategy. Make the room match the mood.',
  Sun_Scorpio: 'A truth wants air. Hold it lightly before you say it.',
  Sun_Sagittarius: 'Aim further than feels reasonable. Then go.',
  Sun_Capricorn: 'Stack one stone today. Tomorrow you stack two.',
  Sun_Aquarius: 'Step sideways out of the obvious answer.',
  Sun_Pisces: 'The dream is data. Write before it dissolves.',

  // Moon
  Moon_Aries: 'Quick feelings, quicker forgiveness — yours and theirs.',
  Moon_Taurus: 'Comfort is not a reward. Take it now.',
  Moon_Gemini: 'Talk it out. The story is the medicine.',
  Moon_Cancer: 'You are the home tonight. Make it feel like one.',
  Moon_Leo: 'Big feelings need a big audience — even if it is just you.',
  Moon_Virgo: 'Tidy one corner. The nervous system will thank you.',
  Moon_Libra: 'Balance is not 50/50 today — it is who shows up first.',
  Moon_Scorpio: 'Stay with the under-feeling. It has something to say.',
  Moon_Sagittarius: 'Step outside. Distance is the answer.',
  Moon_Capricorn: 'Feelings have shape today. Build with them.',
  Moon_Aquarius: 'You feel best at arm’s length. That is allowed.',
  Moon_Pisces: 'Soft edges, low lights, less words.',

  // Mercury
  Mercury_Gemini: 'Your mind is moving fast — capture, don’t commit.',
  Mercury_Virgo: 'Edit twice. The clean version is the kind one.',
  Mercury_Sagittarius: 'Big ideas, loose details. Fact-check before sending.',
  Mercury_Pisces: 'Words feel slippery. Trust the image, not the sentence.',

  // Venus
  Venus_Taurus: 'Slow pleasures over fast wins. Rest counts as ritual.',
  Venus_Libra: 'Ask for the nice version. People want to give it.',
  Venus_Scorpio: 'You want what you want. Say it out loud.',
  Venus_Pisces: 'Love through atmosphere — candles, music, fewer plans.',

  // Mars
  Mars_Aries: 'Your fire is back online — channel it before it channels you.',
  Mars_Capricorn: 'You are the engine today. Start with the hardest thing.',
  Mars_Scorpio: 'Quiet, surgical effort beats loud pushing.',
  Mars_Cancer: 'Defend something tender. That counts as action.',

  // Jupiter
  Jupiter_Sagittarius: 'A door opens further than you thought it would.',
  Jupiter_Pisces: 'Faith is a strategy this week. Lean in.',

  // Saturn
  Saturn_Capricorn: 'The boring work is the holy work. Do the boring work.',
  Saturn_Pisces: 'Even dreams need scaffolding — pick one and build.',

  // Pluto
  Pluto_Aquarius: 'Old systems are creaking. Step away from the ones that lie.',
};

// ---------------------------------------------------------------------------
// Aspect blurbs — most common combos (transit planet x aspect x natal planet).
// 60+ specific entries; fallbacks fill the rest.
// ---------------------------------------------------------------------------

export type AspectKey = `${BodyName}_${AspectType}_${BodyName}`;

export const aspectBlurbs: Partial<Record<AspectKey, string>> = {
  // Sun aspects — identity meets the day
  Sun_Conjunction_Sun:
    'A solar return moment — a year is restarting under your feet.',
  Sun_Opposition_Sun:
    'Halfway through your year. Notice what you have outgrown.',
  Sun_Square_Sun:
    'A friction with who you said you were becoming. Adjust the aim.',
  Sun_Trine_Moon: 'Heart and head agree for once. Make the call.',
  Sun_Square_Moon: 'What you want and what you need are not the same today.',
  Sun_Conjunction_Mercury: 'Your voice lands clearer. Speak the thing.',
  Sun_Trine_Venus: 'Charm is your superpower today. Use it kindly.',
  Sun_Square_Mars: 'Your drive feels too hot for the room. Pace yourself.',
  Sun_Trine_Jupiter: 'A door opens. Walk through before you talk yourself out.',
  Sun_Square_Saturn: 'A familiar wall. The lesson is patience, not power.',
  Sun_Opposition_Pluto: 'Someone is testing your shape. Stay yours.',

  // Moon aspects — feelings meet the chart
  Moon_Conjunction_Moon: 'Your needs are loud today. Listen first, fix later.',
  Moon_Opposition_Sun: 'A pull between rest and showing up. Both can be true.',
  Moon_Square_Mars:
    'Short fuse. Move the body before you reply to the message.',
  Moon_Trine_Venus: 'Comfort and connection are easy. Let yourself be held.',
  Moon_Square_Saturn: 'Old loneliness echoes. It is a weather, not a forecast.',
  Moon_Conjunction_Neptune:
    'Moods feel cinematic. Go gentle on the interpretation.',

  // Mercury aspects — communication
  Mercury_Conjunction_Mercury:
    'Your thinking sharpens. Write the thing down today.',
  Mercury_Trine_Sun: 'Words land where you aim them. Send the email.',
  Mercury_Square_Mars: 'Sharp tongue. Read the message twice before you send.',
  Mercury_Square_Saturn: 'Speech feels heavy. Slower is not worse.',
  Mercury_Trine_Jupiter: 'A teaching mood. You explain something well today.',
  Mercury_Opposition_Neptune: 'Wires cross. Confirm before you assume.',
  Mercury_Conjunction_Venus:
    'Sweet talk works. So do honest words said softly.',

  // Venus aspects — relating
  Venus_Conjunction_Venus: 'A fresh chapter in how you love and want.',
  Venus_Trine_Sun: 'You are good company to yourself today.',
  Venus_Square_Mars: 'Want and worth get tangled. Untangle slowly.',
  Venus_Trine_Jupiter: 'Generosity returns to you. Don’t flinch when it does.',
  Venus_Opposition_Saturn: 'A test of love’s patience. Show up anyway.',
  Venus_Square_Pluto: 'You want what you want intensely. Notice why.',
  Venus_Conjunction_Moon: 'Tenderness is the strategy. Soft is strong.',

  // Mars aspects — drive
  Mars_Conjunction_Mars: 'New fuel in the tank. Pick a real target.',
  Mars_Trine_Sun: 'Action is easy today. Pick the brave one.',
  Mars_Square_Saturn: 'Push and pause. The wall is data, not punishment.',
  Mars_Conjunction_Pluto:
    'Power is moving through you. Aim it at something worthy.',
  Mars_Square_Venus: 'Friction in love. Heat is information.',
  Mars_Trine_Jupiter: 'Bold pays. Don’t shrink the ask.',
  Mars_Opposition_Saturn: 'You will hit a no today. The yes lives behind it.',

  // Jupiter aspects — expansion
  Jupiter_Conjunction_Sun: 'A year-shaped opportunity opens. Walk in.',
  Jupiter_Trine_Moon: 'You feel held by something bigger. Let it.',
  Jupiter_Square_Saturn: 'Growth meets structure. Both win if you slow down.',
  Jupiter_Conjunction_Venus: 'Love expands. Receive it in plain language.',
  Jupiter_Trine_Mars: 'Your effort doubles in value today. Move.',

  // Saturn aspects — structure & limit
  Saturn_Conjunction_Sun:
    'A ceremony of becoming serious. Choose the right altar.',
  Saturn_Square_Sun: 'A milestone wall. Climb, don’t curse.',
  Saturn_Conjunction_Moon: 'A heavy mood — but also a real one. Honour both.',
  Saturn_Opposition_Venus: 'Love wants commitment or clarity. No middle today.',
  Saturn_Trine_Mercury: 'Discipline and clarity meet. Plan something durable.',
  Saturn_Square_Mars:
    'An old wall meets a familiar fire. Patience wins this round.',
  Saturn_Conjunction_Saturn:
    'A rite of passage. The shape of your life is being redrawn.',

  // Uranus aspects — disruption
  Uranus_Conjunction_Sun: 'A jolt. The version of you that survives is freer.',
  Uranus_Square_Sun: 'Something shakes loose. You will not miss it.',
  Uranus_Opposition_Venus:
    'Love wants new air. Do not mistake change for ending.',
  Uranus_Square_Mars: 'Sudden energy — release it on purpose, not at people.',
  Uranus_Trine_Moon: 'Your feelings want a new shape. Let them surprise you.',

  // Neptune aspects — dissolution
  Neptune_Conjunction_Sun:
    'Edges blur. Beauty rises in the fog. Don’t drive fast.',
  Neptune_Square_Mercury:
    'Words feel lossy. Trust visuals and tone over arguments.',
  Neptune_Trine_Venus: 'Romance, music, art — let them be the medicine.',
  Neptune_Opposition_Saturn: 'Faith vs proof. You don’t have to pick today.',

  // Pluto aspects — transformation
  Pluto_Conjunction_Sun:
    'Something in your identity is being remade. Say less, listen more.',
  Pluto_Square_Sun: 'A power test. Don’t shrink. Don’t shout.',
  Pluto_Opposition_Venus:
    'A relationship deepens or composts. Both are honest.',
  Pluto_Trine_Mars: 'Quiet ferocity. You can move mountains in private.',
  Pluto_Square_Moon: 'An old grief moves. Let it. Don’t narrate it yet.',
};

// ---------------------------------------------------------------------------
// Retrograde / direct station blurbs.
// ---------------------------------------------------------------------------

export const retrogradeBlurbs: Partial<
  Record<BodyName, { entering: string; leaving: string }>
> = {
  Mercury: {
    entering:
      'Mercury is reversing course — back up the work, slow the sends, expect old voices.',
    leaving:
      'Mercury is direct again. The fog lifts. Send the thing you have been editing.',
  },
  Venus: {
    entering:
      'Venus turns inward. Old loves and old wants are back to be reconsidered.',
    leaving:
      'Venus moves forward. What you decided in private is ready to be lived in public.',
  },
  Mars: {
    entering:
      'Mars retrogrades. Don’t start the fight you cannot finish — sharpen the blade instead.',
    leaving:
      'Mars is direct. Action returns. The thing you paused is ready to begin.',
  },
  Jupiter: {
    entering:
      'Jupiter is internalising. Growth happens out of sight — keep watering quietly.',
    leaving:
      'Jupiter is direct. The door you saw last season opens further now.',
  },
  Saturn: {
    entering:
      'Saturn is reviewing. The structure you built is being audited from the inside.',
    leaving:
      'Saturn is direct. The rebuild can begin in the world, not just in your head.',
  },
  Uranus: {
    entering: 'Uranus retrogrades. Inner revolutions run quieter for a while.',
    leaving:
      'Uranus is direct. The change you sensed in private wants the daylight.',
  },
  Neptune: {
    entering:
      'Neptune is going inward. Dreams and drift are louder than direction.',
    leaving:
      'Neptune is direct. The vision is clearer — choose which thread to pull.',
  },
  Pluto: {
    entering:
      'Pluto is retrograding. The deep work goes underground. Trust the slow churn.',
    leaving: 'Pluto is direct. What composted in the dark is ready to surface.',
  },
};

// ---------------------------------------------------------------------------
// Lunar phases.
// ---------------------------------------------------------------------------

export const lunationBlurbs: Record<LunarPhase, string> = {
  NewMoon:
    'A reset window. Plant something small you actually want — not what you should want.',
  FirstQuarter: 'The push moment. The plan needs your hand on it now.',
  FullMoon:
    'Something is fully lit. Look where the light fell — that is the message.',
  LastQuarter:
    'A graceful release. Let go of the version that no longer serves.',
  VoidOfCourseStart:
    'The Moon has no tether for now. Don’t launch — drift, nap, notice.',
  VoidOfCourseEnd: 'The Moon is back online. You can decide things again.',
};

// ---------------------------------------------------------------------------
// Eclipse blurbs — generic but evocative.
// ---------------------------------------------------------------------------

export const eclipseBlurbs: Record<EclipseKind, string> = {
  Solar:
    'A solar eclipse — a doorway slams open. Whatever begins here will be louder than you expect.',
  Lunar:
    'A lunar eclipse — what was hidden in the heart shows up in the light. Let it.',
};

// ---------------------------------------------------------------------------
// Sign character (used for fallbacks when planet-in-sign isn't pre-authored).
// ---------------------------------------------------------------------------

const signCharacter: Record<ZodiacSign, string> = {
  Aries: 'starting things',
  Taurus: 'slow pleasure',
  Gemini: 'words and curiosity',
  Cancer: 'soft tending',
  Leo: 'taking up room',
  Virgo: 'careful refinement',
  Libra: 'beauty and balance',
  Scorpio: 'going under the surface',
  Sagittarius: 'aiming further',
  Capricorn: 'patient building',
  Aquarius: 'sideways thinking',
  Pisces: 'dreaming and dissolving',
};

const planetCharacter: Record<BodyName, string> = {
  Sun: 'your sense of self',
  Moon: 'your moods',
  Mercury: 'your thinking',
  Venus: 'how you love and want',
  Mars: 'your drive',
  Jupiter: 'your hope and reach',
  Saturn: 'your structure',
  Uranus: 'your edge of change',
  Neptune: 'your dream-life',
  Pluto: 'your buried power',
};

const aspectCharacter: Record<AspectType, string> = {
  Conjunction: 'A merging of two forces — they speak with one voice now.',
  Opposition: 'A pull between two truths — the answer is in holding both.',
  Trine: 'An easy current between two parts of you. Use it before it passes.',
  Square:
    'A challenging activation between two forces — friction is the lesson.',
  Sextile: 'A small open door between two parts of you — walk through it.',
};

// ---------------------------------------------------------------------------
// Lookup helpers.
// ---------------------------------------------------------------------------

function planetInSignFallback(planet: BodyName, sign: ZodiacSign): string {
  return `${planetCharacter[planet]} leans into ${signCharacter[sign]} — let the quality colour your day.`;
}

function aspectFallback(
  transitPlanet: BodyName,
  aspect: AspectType,
  natalPlanet: BodyName,
): string {
  return `${aspectCharacter[aspect]} (${planetCharacter[transitPlanet]} meets ${planetCharacter[natalPlanet]}).`;
}

/**
 * Get a blurb for any TransitEvent. Returns null only when the event itself
 * cannot be classified — otherwise we always have at least a fallback.
 */
export function getTemplateBlurb(event: TransitEvent): string | null {
  switch (event.kind) {
    case 'planet_in_sign': {
      const key = `${event.planet}_${event.sign}` as PlanetInSignKey;
      return (
        planetInSignBlurbs[key] ??
        planetInSignFallback(event.planet, event.sign)
      );
    }

    case 'ingress': {
      // Reuse planet-in-sign — an ingress IS a planet entering a new sign.
      const key = `${event.planet}_${event.sign}` as PlanetInSignKey;
      const base =
        planetInSignBlurbs[key] ??
        planetInSignFallback(event.planet, event.sign);
      return `${event.planet} enters ${event.sign}. ${base}`;
    }

    case 'aspect_to_natal': {
      const key =
        `${event.transitPlanet}_${event.aspect}_${event.natalPlanet}` as AspectKey;
      return (
        aspectBlurbs[key] ??
        aspectFallback(event.transitPlanet, event.aspect, event.natalPlanet)
      );
    }

    case 'retrograde': {
      const entry = retrogradeBlurbs[event.planet];
      if (!entry) {
        return event.phase === 'entering'
          ? `${event.planet} is retrograding — slow the part of you it rules.`
          : `${event.planet} is direct again — the pause is over.`;
      }
      return entry[event.phase];
    }

    case 'eclipse':
      return eclipseBlurbs[event.kindOfEclipse];

    case 'lunation':
      return lunationBlurbs[event.phase];

    default: {
      // Exhaustiveness guard — if a new event kind is added without handling,
      // TS will complain at compile time.
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

/**
 * Final-resort fallback used by the orchestrator when every other path fails.
 */
export const GENERIC_FALLBACK_BLURB =
  'The sky is moving. Pause for a breath — something is asking for your attention today.';
