/**
 * Seer Sammii first-person video script prompts
 *
 * Voice: First-person, talking-to-camera, conversational creator style.
 * Structure: Hook → Personal observation → Insight → CTA
 */

const SEER_SAMMII_VOICE = `
VOICE: You are writing as Seer Sammii, a real creator talking directly to camera.
This is NOT a brand voice. This is a person sharing observations with their audience.

FIRST-PERSON RULES:
- Use "I" and "me" naturally: "I've been watching...", "Here's what I'm noticing..."
- Share personal observations: "I pulled up the chart and...", "What caught my eye is..."
- Address the viewer directly: "you", "your", not "one" or "people"
- Sound like you're talking to a friend, not teaching a class
- Include natural filler-like phrases: "okay so", "here's the thing", "real talk"
- Reference your own practice: "I checked the transits", "I've been tracking this"

BANNED PATTERNS (in addition to universal bans):
- Third-person educational tone ("Astrology tells us...", "The cosmos says...")
- Generic spiritual language ("The universe has a plan", "Trust the process")
- Formal or brand-voice phrasing ("Welcome to...", "Today we explore...")
- Passive voice ("It is said that...", "This energy is felt...")
- Any sentence where "I" could be replaced with "one" without changing meaning
`;

const SCRIPT_STRUCTURE = `
SCRIPT STRUCTURE (talking-to-camera):
1. HOOK (first 3 seconds): Personal reaction or observation that stops scrolling
   - "Okay so I just checked tomorrow's chart and..."
   - "Nobody is talking about this transit happening right now"
   - "I need to tell you what I noticed this morning"
2. PERSONAL OBSERVATION (10-15 seconds): What you noticed + why it matters
   - Reference specific transits or cosmic events
   - Share what YOU saw in the data, not generic info
3. INSIGHT (10-15 seconds): The "so what" moment
   - Connect the observation to the viewer's experience
   - Be specific: "If you've been feeling stuck at work, THIS is why"
4. CTA (3-5 seconds): Natural close
   - "Follow for daily cosmic check-ins"
   - "Save this if you're feeling it"
   - "Comment your sign, I'll tell you how this hits you"
`;

const UNIVERSAL_BANS = `
UNIVERSAL BANS - NEVER USE IN ANY SCRIPT:
- "gentle nudge" / "cosmic wink" / "like the universe is"
- "whisper" / "perfect timing to" / "curious to see where it leads"
- "deepen your practice/understanding"
- "journey of self-discovery" / "cosmic dance" / "your growth awaits"
- "embrace your" / "step into" / "unlock your" / "manifest your"
- "It's like..." comparisons
- "Ever thought about..." as hooks
- em dashes (-- or —)
- Any sentence that could work for 3+ different topics by swapping the keyword`;

const SPECIFICITY_TEST = `
SPECIFICITY TEST:
"Could this exact sentence work for 5 different topics if I swapped the keyword?"
If YES: DELETE IT AND WRITE SOMETHING SPECIFIC.

BAD: "Pay attention to how this energy shows up in daily life"
GOOD: "Mars just squared Saturn. If your boss annoyed you today, that's literally the chart."`;

export function buildSeerSammiiPrompt(
  topic: string,
  transitContext: string,
  grimoireContext: string,
): string {
  return `You are writing a first-person video script for Seer Sammii (a TikTok/Reels astrology creator).

${SEER_SAMMII_VOICE}

${SCRIPT_STRUCTURE}

${UNIVERSAL_BANS}

${SPECIFICITY_TEST}

TOPIC: ${topic}

CURRENT TRANSIT CONTEXT:
${transitContext}

${grimoireContext ? `GRIMOIRE KNOWLEDGE:\n${grimoireContext}` : ''}

WORD BUDGET: 80-120 words total. This is a 30-45 second talking-to-camera video.
- Hook: 10-20 words
- Body: 50-80 words
- CTA: 10-15 words

TALKING POINTS: Also generate 3-4 bullet-point talking points that Sammii can glance at while recording. These should be SHORT (5-8 words each) memory joggers, not full sentences.

Return strict JSON only:
{
  "talkingPoints": ["point 1", "point 2", "point 3"],
  "fullScript": "The full first-person script...",
  "caption": "TikTok caption (under 150 chars)",
  "hashtags": ["astrology", "cosmicupdate", "seersammii"],
  "cta": "The call-to-action line"
}`;
}

export function buildTalkingPointsPrompt(transitContext: string): string {
  return `You are brainstorming video topics for Seer Sammii, a TikTok astrology creator who talks to camera in first person.

Based on today's cosmic weather, generate 2-3 video topic options. For each, provide:
- A compelling topic/angle
- 3-4 glanceable talking points (5-8 words each)
- Which transit inspires this topic

${UNIVERSAL_BANS}

CURRENT TRANSITS:
${transitContext}

Return strict JSON only:
{
  "options": [
    {
      "topic": "Topic title",
      "points": ["point 1", "point 2", "point 3"],
      "transitSource": "Which transit this is about"
    }
  ]
}`;
}
