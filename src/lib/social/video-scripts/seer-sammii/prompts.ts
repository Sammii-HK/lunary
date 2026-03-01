/**
 * Seer Sammii first-person video script prompts
 *
 * Voice: First-person, talking-to-camera, real astrology substance.
 * Structure varies by content type: transit report, teaching, spell, crystal, myth-bust.
 */

const SAMMII_IDENTITY = `
CREATOR IDENTITY: Seer Sammii is Samantha — a developer who built Lunary (an astrology app),
went deep on the craft because she needed it, and now shares what she actually knows.
Not a wellness brand. Not a vague energy coach. A technically-minded person who read the grimoire.

HER EDGE:
- She knows the actual mechanics: planetary positions, aspects, orbs, ingresses, sign rulerships
- She built the software that calculates this in real time using astronomy-engine
- She teaches FROM a real grimoire — spells, crystal correspondences, planetary hours, rituals
- She admits what she's still learning

WHY PEOPLE FOLLOW:
- She explains WHY, not just WHAT
- She makes you feel like someone finally told you the truth about astrology
- She uses real spell names and crystal names, not vague "energy tools"
- This is her PERSONAL account — no Lunary app mentions, no product pitches
`;

const SEER_SAMMII_VOICE = `
VOICE: First-person. Talking to camera. Like a knowledgeable friend who actually did the research.

FIRST-PERSON RULES:
- Use "I" naturally: "I noticed...", "Here's what I found...", "I pulled up the chart and..."
- Address viewer directly: "you", "your" — never "one" or "people"
- Sound like you're on FaceTime, not reading from a textbook
- Natural speech patterns: "okay so", "here's the thing", "real talk", "I need to say this"
- Reference your actual practice: "I checked the transits this morning", "I pulled the ephemeris"

BANNED PATTERNS:
- Third-person educational tone ("Astrology tells us...", "The cosmos wants...", "The stars say...")
- Generic spiritual language ("divine timing", "trust the process", "the universe has a plan")
- Formal phrasing ("Welcome to...", "Today we explore...", "In today's video...")
- Passive voice ("It is said that...", "This energy is felt...")
- Any sentence where "I" could be replaced with "one" without changing meaning
- Lunary app references — this is Sammii's personal TikTok, not product marketing
`;

const CONTENT_TYPES = `
CONTENT TYPE DETERMINES STRUCTURE — use the type specified in the prompt:

1. transit_report — "Here's what's happening right now cosmically and what it means for you"
   Hook pattern: "Nobody's talking about what [planet] just did" or "I checked the chart this morning and..."
   Body: Explain the specific transit/aspect/ingress, then connect to real-life experience

2. teaching — "Most people don't know what X actually means"
   Hook pattern: "I need to explain [thing] because I keep seeing it misunderstood"
   Body: Teach ONE specific astrological concept clearly. Mechanics first, then real-life impact.
   Use: "What [planet] in [sign] ACTUALLY does is..." not "this energy invites..."

3. spell_suggestion — "Here's what I'd actually do with this transit"
   Hook pattern: "If [current cosmic weather] is hitting you, here's the spell I'd cast"
   Body: Reference an ACTUAL spell from the grimoire (use real spell name if one is in the grimoire context).
   Include: timing (moon phase, day of week), 2-3 ingredients with WHY each one (planetary correspondence).

4. crystal_recommendation — "This specific crystal for this specific transit"
   Hook pattern: "If you're feeling [specific symptom of the transit], there's a reason and here's what helps"
   Body: Name 1-2 crystals. Explain the PLANETARY CORRESPONDENCE (e.g., "Black tourmaline is Saturn's crystal").
   Connect: why this crystal works for THIS transit specifically.

5. myth_bust — "This common belief about astrology is wrong"
   Hook pattern: "I'm going to say something that upsets people" or "Hot take: [sign] isn't actually [stereotype]"
   Body: Name the misconception, explain the actual mechanics of why it's wrong.
`;

const SCRIPT_STRUCTURE = `
SCRIPT STRUCTURE (talking-to-camera, 30-45 seconds):

1. HOOK (first 3 seconds, 10-20 words): The thing that stops someone mid-scroll
   - Never start with "Hey guys", "So today...", or "Welcome back"
   - Start mid-thought, like you're already in the conversation
   - The most interesting fact, reveal, or confession goes FIRST
   - Examples:
     "Nobody told me [planet] retrograde does THIS to your [house]"
     "I just checked tomorrow's chart and I need to tell you something"
     "Real talk: [sign] season isn't actually about [misconception]"

2. BODY (20-30 seconds, 50-80 words): Real astrological substance
   - Explain ONE thing well, not five things vaguely
   - Connect mechanics to lived experience: "If you've been feeling X, that's this transit"
   - If teaching: define the concept, explain the mechanism, give one real example
   - If spell: give the actual steps (2-3 max), name each ingredient's magical purpose
   - If crystal: name it, state the planetary rulership, say when/how to use it
   - Specificity over quantity — one precise insight beats three vague ones

3. CTA (3-5 seconds, 10-15 words): Natural close, never desperate
   - Match the CTA to the content: spell content → "save this for tonight"
   - Teaching content → "follow for more of this" or "comment what you want me to explain next"
   - Transit content → "comment your sign, I'll tell you how this hits you"
`;

const GRIMOIRE_USAGE = `
GRIMOIRE KNOWLEDGE — USE IT ACTIVELY:
When grimoire context is provided, reference it specifically:
- Use actual SPELL NAMES from the grimoire (not invented ones)
- Name specific CRYSTALS with their planetary rulers (e.g., "Carnelian, ruled by Mars, for courage")
- Reference PLANETARY CORRESPONDENCES accurately (e.g., "Tuesday is Mars day — ideal for protection work")
- Use MOON PHASE meanings precisely: new moon = initiating, full moon = culminating/releasing,
  waxing = building, waning = releasing
- Quote crystal chakra associations or elemental properties where relevant

This is what makes Sammii's content different: she's teaching FROM a real knowledge base.
Don't say "the grimoire says" — just weave the knowledge in naturally as fact.
`;

const UNIVERSAL_BANS = `
UNIVERSAL BANS — NEVER USE:
- "gentle nudge" / "cosmic wink" / "like the universe is"
- "whisper" / "perfect timing to" / "curious to see where it leads"
- "deepen your practice" / "journey of self-discovery" / "cosmic dance"
- "embrace your" / "step into" / "unlock your" / "manifest your"
- "It's like..." comparisons / "Ever thought about..." as hooks
- em dashes (-- or —)
- Lunary app mentions
- Any sentence that could work for 5 different topics by swapping the keyword
- Generic affirmations with no astrological substance
`;

const SPECIFICITY_TEST = `
SPECIFICITY TEST: "Could this exact sentence work for any other cosmic event if I swapped the keyword?"
If YES: DELETE IT AND WRITE SOMETHING SPECIFIC.

BAD: "Pay attention to how this energy shows up in daily life"
GOOD: "Mars just squared Saturn. If your boss annoyed you today, that's literally the chart."

BAD: "Use crystals to support this energy"
GOOD: "Black tourmaline is Saturn's crystal — when Mars hits Saturn like this, it's the one I reach for first."

BAD: "This is a great time to reflect on your relationships"
GOOD: "Venus in Pisces dissolves boundaries. You didn't suddenly become a people pleaser — it's the transit."
`;

export function buildSeerSammiiPrompt(
  topic: string,
  transitContext: string,
  grimoireContext: string,
  contentType?: string,
): string {
  return `You are writing a first-person TikTok script for Seer Sammii.

${SAMMII_IDENTITY}

${SEER_SAMMII_VOICE}

${CONTENT_TYPES}

${SCRIPT_STRUCTURE}

${GRIMOIRE_USAGE}

${UNIVERSAL_BANS}

${SPECIFICITY_TEST}

TOPIC: ${topic}

CONTENT TYPE: ${contentType || 'transit_report'}
(Follow the structure and hook pattern for this content type exactly.)

COSMIC CONTEXT (use this data — do not invent transits or positions):
${transitContext}

${grimoireContext ? `GRIMOIRE KNOWLEDGE (reference spell names, crystal names, correspondences actively):\n${grimoireContext}` : ''}

WORD BUDGET: 80-120 words total.
- Hook: 10-20 words
- Body: 50-80 words
- CTA: 10-15 words

TALKING POINTS: Generate 3-4 short talking points (5-8 words each) that Sammii can glance at while recording. Memory joggers, not sentences.

Return strict JSON only:
{
  "talkingPoints": ["point 1", "point 2", "point 3"],
  "fullScript": "The full first-person script...",
  "caption": "TikTok caption under 150 chars, sentence case, no links",
  "hashtags": ["astrology", "seers", "seersammii"],
  "cta": "The call-to-action line",
  "contentType": "${contentType || 'transit_report'}"
}`;
}

export function buildTalkingPointsPrompt(
  transitContext: string,
  grimoireContext?: string,
): string {
  return `You are brainstorming TikTok video topics for Seer Sammii — a developer who built an astrology app and teaches real astrology with spells, crystals, and grimoire knowledge. Personal brand, not Lunary brand.

Based on today's cosmic weather, generate 3 video topic options covering DIFFERENT content types (mix of: teaching, spell/ritual, transit insight, crystal, myth-bust). Variety matters.

For each option:
- A specific, compelling topic/angle (must be tied to the actual transits provided — not generic)
- 3-4 glanceable talking points (5-8 words each)
- Which transit or cosmic event this is about
- The content type: transit_report / teaching / spell_suggestion / crystal_recommendation / myth_bust

${UNIVERSAL_BANS}

CURRENT COSMIC WEATHER:
${transitContext}

${grimoireContext ? `GRIMOIRE CONTEXT (use for spell/crystal suggestions):\n${grimoireContext}` : ''}

Return strict JSON only:
{
  "options": [
    {
      "topic": "Specific topic title",
      "points": ["point 1", "point 2", "point 3"],
      "transitSource": "Which transit/event this is about",
      "contentType": "teaching"
    }
  ]
}`;
}
