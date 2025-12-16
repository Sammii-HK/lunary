import OpenAI from 'openai';
import type {
  WeeklyCosmicData,
  PlanetaryHighlight,
  MajorAspect,
  MoonPhaseEvent,
} from '../../../utils/blog/weeklyContentGenerator';
import { getMoonPhase } from '../../../utils/moon/moonPhases';
import { GeoVector, Ecliptic, Body, AstroTime } from 'astronomy-engine';
import { getZodiacSign } from '../../../utils/astrology/cosmic-og';

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

/**
 * Generate a narrative voiceover script from weekly blog content using OpenAI
 * This creates a natural, flowing narrative from the structured weekly data
 */
export async function generateNarrativeFromWeeklyData(
  weeklyData: WeeklyCosmicData,
): Promise<string> {
  const openai = getOpenAI();

  // Format the weekly data into a structured prompt
  const planetaryHighlights = weeklyData.planetaryHighlights
    .slice(0, 5)
    .map(
      (h) =>
        `- ${h.planet} ${h.event === 'enters-sign' && h.details.toSign ? `enters ${h.details.toSign}` : h.event.replace(/-/g, ' ')} on ${h.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} (${h.significance} significance): ${h.description}`,
    )
    .join('\n');

  const retrogradeInfo = weeklyData.retrogradeChanges
    .map(
      (r) =>
        `- ${r.planet} ${r.action === 'begins' ? 'stations retrograde' : 'goes direct'} in ${r.sign} on ${r.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    )
    .join('\n');

  const aspects = weeklyData.majorAspects
    .slice(0, 5)
    .map(
      (a) =>
        `- ${a.planetA} ${a.aspect} ${a.planetB} on ${a.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${a.energy}`,
    )
    .join('\n');

  // Ensure moon phases are always present - add fallback if empty
  let moonPhases = weeklyData.moonPhases
    .map(
      (m) =>
        `- ${m.phase} moon in ${m.sign} on ${m.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    )
    .join('\n');

  // If no moon phases, calculate current moon phase as fallback
  if (!moonPhases || weeklyData.moonPhases.length === 0) {
    const currentMoonPhase = getMoonPhase(weeklyData.weekStart);
    // Calculate moon sign using astronomy engine
    const astroTime = new AstroTime(weeklyData.weekStart);
    const moonVector = GeoVector(Body.Moon, astroTime, true);
    const moonEcliptic = Ecliptic(moonVector);
    const moonLongitudeDegrees = moonEcliptic.elon * (180 / Math.PI);
    const moonSign = getZodiacSign(moonLongitudeDegrees) || 'Unknown';
    moonPhases = `- ${currentMoonPhase} moon in ${moonSign} on ${weeklyData.weekStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
  }

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

  const prompt = `Create a natural, flowing voiceover script (5-8 minutes, 1200-2000 words) for a YouTube video about the weekly cosmic forecast for ${weekRange}.

CRITICAL: You MUST follow this EXACT structure in this EXACT order. Each section must be present:

[OPENING - 30-60 seconds]
Start with: "The interplay between [key planets from aspects] creates a unique energetic signature for this week, offering both challenges and opportunities for growth." Then introduce the week's theme and major events.

[MAJOR PLANETARY MOVEMENTS - 2-3 minutes]
Cover all planetary highlights in order. Discuss each planet's movement, what sign it enters, and the significance. Use the format: "This week brings several major planetary movements. [Planet 1] enters [Sign] on [Date], bringing [energy]. [Planet 2] [action] on [Date], creating [effect]."

[COSMIC ALIGNMENTS - 2-3 minutes]
Cover all major aspects. Discuss the alignments between planets, their dates, and the energy they create. Use the format: "The cosmic alignments this week include [Aspect 1] between [Planet A] and [Planet B] on [Date], creating [energy]. [Aspect 2] brings [effect]."

[BEST DAYS FOR - 1-2 minutes]
Cover the best days for different activities. Use the format: "The best days this week for [activity 1] are [dates], when [reason]. For [activity 2], [dates] are ideal because [reason]."

[MOON PHASES - 1-2 minutes - MANDATORY]
This section MUST be included. Cover all moon phases. If no major moon phases occur this week, discuss the current moon phase and its influence. Use the format: "The moon phases this week include [Phase] Moon in [Sign] on [Date], bringing [energy]. This lunar influence affects [areas of life]." Even if the Moon Phases data shows 'No major moon phases this week', you MUST still include a moon phases section discussing the current lunar energy.

[CONCLUSION - 30-60 seconds]
End with: "As we navigate this week's cosmic energy, remember that these planetary movements and alignments offer both challenges and opportunities. To dive deeper into your personal cosmic forecast and understand how these energies affect your birth chart, visit Lunary.app."

Weekly Data:

Title: ${weeklyData.title}
Subtitle: ${weeklyData.subtitle}
Summary: ${weeklyData.summary}

Planetary Highlights:
${planetaryHighlights || 'None this week'}

Retrograde Activity:
${retrogradeInfo || 'No retrograde changes this week'}

Major Aspects:
${aspects || 'No major aspects this week'}

Moon Phases (MANDATORY - always include this section):
${moonPhases}

Best Days:
${
  Object.entries(weeklyData.bestDaysFor)
    .filter(([_, data]) => data.dates.length > 0)
    .slice(0, 3)
    .map(
      ([activity, data]) =>
        `- Best for ${activity} on ${data.dates.map((d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })).join(', ')}: ${data.reason}`,
    )
    .join('\n') || 'No specific best days highlighted'
}

Return ONLY the voiceover script text, no markdown, no formatting, no section headers, just natural spoken text following the structure above.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a cosmic storyteller creating engaging voiceover scripts for astrology videos. Write in a natural, conversational tone that flows smoothly when spoken aloud. Make it engaging and accessible. This is Lunary - a moon-focused astrology app. Moon phases are core to the brand and MUST always be included in every script.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2500,
      temperature: 0.3,
    });

    let script = completion.choices[0]?.message?.content || '';
    if (!script || script.trim().length === 0) {
      throw new Error('OpenAI returned an empty script');
    }

    script = script.trim();

    // Validate that moon phases are mentioned in the script
    const moonKeywords = [
      'moon',
      'lunar',
      'phase',
      'full moon',
      'new moon',
      'waxing',
      'waning',
      'crescent',
      'gibbous',
      'quarter',
    ];
    const lowerScript = script.toLowerCase();
    const hasMoonPhases = moonKeywords.some((keyword) =>
      lowerScript.includes(keyword),
    );

    if (!hasMoonPhases) {
      console.warn(
        '⚠️ Moon phases not detected in generated script. Injecting moon phase section...',
      );
      // Find conclusion section and inject moon phases before it
      const conclusionKeywords = [
        'visit lunary',
        'lunary.app',
        'dive deeper',
        'birth chart',
        'conclusion',
        'wrap up',
      ];
      const sentences = script
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      let conclusionIndex = -1;

      for (let i = sentences.length - 1; i >= 0; i--) {
        const lowerSentence = sentences[i].toLowerCase();
        if (conclusionKeywords.some((kw) => lowerSentence.includes(kw))) {
          conclusionIndex = i;
          break;
        }
      }

      // Get current moon phase for injection
      const currentMoonPhase = getMoonPhase(weeklyData.weekStart);
      const astroTime = new AstroTime(weeklyData.weekStart);
      const moonVector = GeoVector(Body.Moon, astroTime, true);
      const moonEcliptic = Ecliptic(moonVector);
      const moonLongitudeDegrees = moonEcliptic.elon * (180 / Math.PI);
      const moonSign = getZodiacSign(moonLongitudeDegrees) || 'Unknown';
      const moonPhaseDate = weeklyData.weekStart.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      const moonPhaseText = `The moon phases this week include the ${currentMoonPhase} moon in ${moonSign} on ${moonPhaseDate}, bringing powerful lunar energy. This lunar influence affects our emotional landscape and intuitive awareness, guiding us through the week's cosmic shifts.`;

      if (conclusionIndex >= 0) {
        // Insert before conclusion
        const beforeConclusion = sentences.slice(0, conclusionIndex).join('. ');
        const conclusion = sentences.slice(conclusionIndex).join('. ');
        script = `${beforeConclusion}. ${moonPhaseText} ${conclusion}`;
      } else {
        // Append before the end
        const lastPeriod = script.lastIndexOf('.');
        if (lastPeriod > 0) {
          script =
            script.substring(0, lastPeriod) +
            `. ${moonPhaseText}` +
            script.substring(lastPeriod);
        } else {
          script = `${script}. ${moonPhaseText}`;
        }
      }
    }

    return script;
  } catch (error) {
    console.error('Failed to generate narrative from OpenAI:', error);
    throw error;
  }
}

/**
 * Generate a short-form voiceover script (15-30 seconds) using OpenAI
 * Uses the intro portion of the narrative before "breaking it down"
 */
export async function generateShortFormNarrative(
  weeklyData: WeeklyCosmicData,
): Promise<string> {
  const openai = getOpenAI();

  // Same data formatting as long-form, but focus on top highlights
  const planetaryHighlights = weeklyData.planetaryHighlights
    .slice(0, 3) // Top 3 for short-form
    .map(
      (h) =>
        `- ${h.planet} ${h.event === 'enters-sign' && h.details.toSign ? `enters ${h.details.toSign}` : h.event.replace(/-/g, ' ')} on ${h.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} (${h.significance} significance): ${h.description}`,
    )
    .join('\n');

  const topAspect = weeklyData.majorAspects[0];
  const aspectInfo = topAspect
    ? `- ${topAspect.planetA} ${topAspect.aspect} ${topAspect.planetB} on ${topAspect.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${topAspect.energy}`
    : 'None';

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

  const prompt = `Create a SHORT voiceover script (15-30 seconds, ~50-75 words) for a social media video about the weekly cosmic forecast for ${weekRange}.

This should be the INTRO portion only - the opening that sets the stage. It should:
- Start with "This week with the significant..." or similar engaging opening
- Mention the most important planetary alignment or major event
- Include the energetic signature: "The interplay between [key planets] creates a unique energetic signature for this week, offering both challenges and opportunities for growth."
- Be mystical, engaging, and flow naturally
- End with a call to action: "To find out more, read the full blog on Lunary" or similar
- DO NOT go into details or "break it down" - this is just the intro hook

Weekly Data:

Title: ${weeklyData.title}
Subtitle: ${weeklyData.subtitle}

Top Planetary Highlights:
${planetaryHighlights || 'None this week'}

Most Important Aspect:
${aspectInfo}

Return ONLY the voiceover script text, no markdown, no formatting, just natural spoken text. Keep it to 50-75 words maximum.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a cosmic storyteller creating engaging, mystical voiceover scripts for astrology videos. Write in a natural, conversational tone that flows smoothly when spoken aloud. For short-form, create an engaging hook that captures the essence of the week.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const script = completion.choices[0]?.message?.content || '';
    if (!script || script.trim().length === 0) {
      throw new Error('OpenAI returned an empty script');
    }

    return script.trim();
  } catch (error) {
    console.error('Failed to generate short-form narrative:', error);
    throw error;
  }
}

/**
 * Generate social media post content to accompany a video
 * Gently guides people to the site/blog if they want to learn more
 */
export async function generateVideoPostContent(
  weeklyData: WeeklyCosmicData,
  videoType: 'short' | 'long',
  blogSlug?: string,
): Promise<string> {
  const openai = getOpenAI();

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
  const blogUrl = blogSlug
    ? `https://lunary.app/blog/${blogSlug}`
    : 'https://lunary.app';

  const prompt = `Create a social media post caption to accompany a ${videoType === 'short' ? 'short-form' : 'long-form'} video about the weekly cosmic forecast for ${weekRange}.

The post should:
- Be engaging and natural, not salesy
- Gently guide people to read the full blog on Lunary if they want to learn more
- Include a link to ${blogUrl}
- Be appropriate for Instagram, TikTok, and other platforms
- Be 2-4 sentences, concise but inviting
- Match the mystical but accessible tone of Lunary
- For short-form: Be brief and hook-focused
- For long-form: Can be slightly longer, more informative

Weekly Data:
Title: ${weeklyData.title}
Subtitle: ${weeklyData.subtitle}

Return ONLY the post content text, no markdown, no formatting, just the caption text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a social media content creator for Lunary, a cosmic astrology app. Create engaging, natural captions that guide people to learn more without being pushy or salesy. Write in a mystical but accessible tone.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const postContent = completion.choices[0]?.message?.content || '';
    if (!postContent || postContent.trim().length === 0) {
      throw new Error('OpenAI returned empty post content');
    }

    return postContent.trim();
  } catch (error) {
    console.error('Failed to generate video post content:', error);
    // Fallback to a simple post content
    return `Your cosmic forecast for the week of ${weekRange}. To read the full blog and dive deeper into this week's cosmic energy, visit ${blogUrl}`;
  }
}

export interface ScriptTopic {
  topic:
    | 'intro'
    | 'planetary_highlights'
    | 'retrogrades'
    | 'aspects'
    | 'moon_phases'
    | 'best_days'
    | 'conclusion';
  text: string;
  startTime: number; // Estimated start time in seconds
  endTime: number; // Estimated end time in seconds
  item?: string; // Optional: specific item identifier (e.g., "Mars enters Aries", "Venus trine Jupiter")
}

export interface ScriptItem extends ScriptTopic {
  item: string; // Required: specific item identifier
  exactPlanet?: PlanetaryHighlight; // Exact planet movement reference
  exactAspect?: MajorAspect; // Exact aspect reference
  exactMoonPhase?: MoonPhaseEvent; // Exact moon phase reference
}

/**
 * Split a long-form script into topics based on content
 * Estimates timestamps based on word count (average 2.5 words per second)
 * Allows multiple topics of the same type (e.g., multiple aspects images)
 */
export function segmentScriptIntoTopics(
  script: string,
  weeklyData: WeeklyCosmicData,
): ScriptTopic[] {
  const topics: ScriptTopic[] = [];
  const wordsPerSecond = 2.5; // Average speaking rate
  let currentTime = 0;

  // Split script into sentences
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length === 0) {
    // Fallback: create a single intro topic
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: script.split(/\s+/).length / wordsPerSecond,
      },
    ];
  }

  // Identify topic sections based on keywords
  let currentTopic: ScriptTopic['topic'] = 'intro';
  let currentTopicText: string[] = [];
  let topicStartTime = 0;
  const minTopicDuration = 3; // Minimum 3 seconds per topic

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const words = sentence.trim().split(/\s+/).length;
    const duration = words / wordsPerSecond;

    // Detect topic changes
    let newTopic: ScriptTopic['topic'] | null = null;

    // Check for conclusion first (highest priority)
    if (
      lowerSentence.includes('conclusion') ||
      lowerSentence.includes('wrap up') ||
      lowerSentence.includes('visit lunary') ||
      lowerSentence.includes('lunary.app') ||
      lowerSentence.includes('dive deeper') ||
      lowerSentence.includes('birth chart')
    ) {
      newTopic = 'conclusion';
    } else if (
      lowerSentence.includes('planetary') ||
      lowerSentence.includes('planet') ||
      (lowerSentence.includes('enters') && lowerSentence.includes('sign'))
    ) {
      newTopic = 'planetary_highlights';
    } else if (
      lowerSentence.includes('retrograde') ||
      lowerSentence.includes('direct')
    ) {
      newTopic = 'retrogrades';
    } else if (
      lowerSentence.includes('aspect') ||
      lowerSentence.includes('trine') ||
      lowerSentence.includes('square') ||
      lowerSentence.includes('opposition') ||
      lowerSentence.includes('conjunction') ||
      lowerSentence.includes('alignment')
    ) {
      newTopic = 'aspects';
    } else if (
      lowerSentence.includes('moon') ||
      lowerSentence.includes('lunar') ||
      lowerSentence.includes('phase')
    ) {
      newTopic = 'moon_phases';
    } else if (
      lowerSentence.includes('best') ||
      lowerSentence.includes('ideal') ||
      lowerSentence.includes('favorable') ||
      lowerSentence.includes('optimal')
    ) {
      newTopic = 'best_days';
    }

    // If topic changed and we have enough content, save previous topic
    if (newTopic && newTopic !== currentTopic && currentTopicText.length > 0) {
      const topicDuration = currentTime - topicStartTime;
      if (topicDuration >= minTopicDuration) {
        topics.push({
          topic: currentTopic,
          text: currentTopicText.join('. '),
          startTime: topicStartTime,
          endTime: currentTime,
        });
        currentTopic = newTopic;
        currentTopicText = [];
        topicStartTime = currentTime;
      } else if (newTopic === 'conclusion') {
        // Always switch to conclusion even if previous topic was short
        topics.push({
          topic: currentTopic,
          text: currentTopicText.join('. '),
          startTime: topicStartTime,
          endTime: currentTime,
        });
        currentTopic = newTopic;
        currentTopicText = [];
        topicStartTime = currentTime;
      }
    }

    currentTopicText.push(sentence.trim());
    currentTime += duration;
  }

  // Add final topic
  if (currentTopicText.length > 0) {
    const topicDuration = currentTime - topicStartTime;
    if (topicDuration >= minTopicDuration || topics.length === 0) {
      topics.push({
        topic: currentTopic,
        text: currentTopicText.join('. '),
        startTime: topicStartTime,
        endTime: currentTime,
      });
    }
  }

  // Ensure conclusion is always at the end if script mentions lunary.app or visit
  const hasConclusion = topics.some((t) => t.topic === 'conclusion');
  if (!hasConclusion && topics.length > 0) {
    const lastTopic = topics[topics.length - 1];
    // Check if last topic mentions conclusion keywords
    const lastText = lastTopic.text.toLowerCase();
    if (
      lastText.includes('lunary') ||
      lastText.includes('visit') ||
      lastText.includes('dive deeper')
    ) {
      lastTopic.topic = 'conclusion';
    } else {
      // Add a conclusion from the last few sentences
      const conclusionSentences = lastTopic.text
        .split('.')
        .slice(-2)
        .join('.')
        .trim();
      if (conclusionSentences.length > 10) {
        const wordsBefore = lastTopic.text
          .split('.')
          .slice(0, -2)
          .join('.')
          .trim();
        if (wordsBefore.length > 10) {
          lastTopic.text = wordsBefore;
          lastTopic.endTime =
            lastTopic.startTime +
            wordsBefore.split(/\s+/).length / wordsPerSecond;
          const conclusionStart = lastTopic.endTime;
          const conclusionDuration =
            conclusionSentences.split(/\s+/).length / wordsPerSecond;
          topics.push({
            topic: 'conclusion',
            text: conclusionSentences,
            startTime: conclusionStart,
            endTime: conclusionStart + conclusionDuration,
          });
        } else {
          lastTopic.topic = 'conclusion';
        }
      } else {
        lastTopic.topic = 'conclusion';
      }
    }
  }

  // Ensure we have at least one topic
  if (topics.length === 0) {
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: currentTime || script.split(/\s+/).length / wordsPerSecond,
      },
    ];
  }

  return topics;
}

/**
 * Extract exact planet movement from sentence
 * Matches patterns like "Sun enters Capricorn", "Mars stations retrograde", etc.
 * Uses strict word order matching to avoid false positives
 */
function extractPlanetMovement(
  sentence: string,
  weeklyData: WeeklyCosmicData,
): PlanetaryHighlight | null {
  const lowerSentence = sentence.toLowerCase();

  // List of planet names to match (with word boundaries)
  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];

  // List of zodiac signs
  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  // Try to match "Planet enters Sign" pattern with strict word order
  for (const planet of planets) {
    const planetIndex = lowerSentence.indexOf(planet);
    if (planetIndex === -1) continue;

    // Check for "enters Sign" pattern - planet must come before "enters" which comes before sign
    for (const sign of signs) {
      const signIndex = lowerSentence.indexOf(sign);
      if (signIndex === -1) continue;

      // Check for enter keywords between planet and sign
      const enterKeywords = [
        'enters',
        'enter',
        'moves into',
        'moves to',
        'transits into',
      ];
      for (const keyword of enterKeywords) {
        const keywordIndex = lowerSentence.indexOf(keyword);
        if (
          keywordIndex > planetIndex &&
          keywordIndex < signIndex &&
          signIndex - keywordIndex < 50 // Reasonable proximity check
        ) {
          // Find exact match in weeklyData
          const match = weeklyData.planetaryHighlights.find(
            (h) =>
              h.planet.toLowerCase() === planet &&
              h.event === 'enters-sign' &&
              h.details?.toSign?.toLowerCase() === sign,
          );
          if (match) return match;
        }
      }
    }

    // Try to match "Planet stations retrograde" or "Planet goes retrograde" with word order
    const retrogradeIndex = lowerSentence.indexOf('retrograde');
    if (retrogradeIndex > planetIndex) {
      const retrogradeKeywords = ['stations', 'station', 'goes', 'turns'];
      for (const keyword of retrogradeKeywords) {
        const keywordIndex = lowerSentence.indexOf(keyword);
        if (
          keywordIndex > planetIndex &&
          keywordIndex < retrogradeIndex &&
          retrogradeIndex - keywordIndex < 20
        ) {
          const match = weeklyData.planetaryHighlights.find(
            (h) =>
              h.planet.toLowerCase() === planet &&
              h.event === 'goes-retrograde',
          );
          if (match) return match;
        }
      }
    }

    // Try to match "Planet goes direct" with word order
    const directIndex = lowerSentence.indexOf('direct');
    if (directIndex > planetIndex) {
      const directKeywords = ['goes', 'turns', 'stations'];
      for (const keyword of directKeywords) {
        const keywordIndex = lowerSentence.indexOf(keyword);
        if (
          keywordIndex > planetIndex &&
          keywordIndex < directIndex &&
          directIndex - keywordIndex < 20
        ) {
          const match = weeklyData.planetaryHighlights.find(
            (h) =>
              h.planet.toLowerCase() === planet && h.event === 'goes-direct',
          );
          if (match) return match;
        }
      }
    }
  }

  return null;
}

/**
 * Extract exact aspect from sentence
 * Matches patterns like "Venus trine Jupiter", "Mars square Saturn", etc.
 * Uses strict word order matching to avoid false positives
 */
function extractAspect(
  sentence: string,
  weeklyData: WeeklyCosmicData,
): MajorAspect | null {
  const lowerSentence = sentence.toLowerCase();

  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];

  const aspects = [
    'conjunction',
    'conjunct',
    'trine',
    'square',
    'opposition',
    'opposite',
    'sextile',
  ];

  // Try to match "PlanetA aspect PlanetB" pattern with strict word order
  for (const planetA of planets) {
    const planetAIndex = lowerSentence.indexOf(planetA);
    if (planetAIndex === -1) continue;

    for (const aspect of aspects) {
      const aspectIndex = lowerSentence.indexOf(aspect);
      if (aspectIndex === -1 || aspectIndex <= planetAIndex) continue;

      // Normalize aspect name
      let normalizedAspect = aspect;
      if (aspect === 'conjunct') normalizedAspect = 'conjunction';
      if (aspect === 'opposite') normalizedAspect = 'opposition';

      // Look for PlanetB after the aspect
      for (const planetB of planets) {
        if (planetB === planetA) continue;

        const planetBIndex = lowerSentence.indexOf(planetB, aspectIndex);
        if (
          planetBIndex > aspectIndex &&
          planetBIndex - aspectIndex < 30 // Reasonable proximity
        ) {
          // Find exact match in weeklyData (PlanetA aspect PlanetB)
          const match = weeklyData.majorAspects.find(
            (a) =>
              a.planetA.toLowerCase() === planetA &&
              a.planetB.toLowerCase() === planetB &&
              a.aspect.toLowerCase() === normalizedAspect,
          );
          if (match) return match;

          // Try reverse order (PlanetB aspect PlanetA)
          const reverseMatch = weeklyData.majorAspects.find(
            (a) =>
              a.planetA.toLowerCase() === planetB &&
              a.planetB.toLowerCase() === planetA &&
              a.aspect.toLowerCase() === normalizedAspect,
          );
          if (reverseMatch) return reverseMatch;
        }
      }
    }
  }

  // Also try "PlanetA and PlanetB form a aspect" pattern
  for (const planetA of planets) {
    const planetAIndex = lowerSentence.indexOf(planetA);
    if (planetAIndex === -1) continue;

    const andIndex = lowerSentence.indexOf(' and ', planetAIndex);
    if (andIndex === -1 || andIndex - planetAIndex > 20) continue;

    for (const planetB of planets) {
      if (planetB === planetA) continue;

      const planetBIndex = lowerSentence.indexOf(planetB, andIndex);
      if (planetBIndex === -1 || planetBIndex - andIndex > 20) continue;

      for (const aspect of aspects) {
        const aspectIndex = lowerSentence.indexOf(aspect, planetBIndex);
        if (aspectIndex === -1 || aspectIndex - planetBIndex > 30) continue;

        let normalizedAspect = aspect;
        if (aspect === 'conjunct') normalizedAspect = 'conjunction';
        if (aspect === 'opposite') normalizedAspect = 'opposition';

        const match = weeklyData.majorAspects.find(
          (a) =>
            a.planetA.toLowerCase() === planetA &&
            a.planetB.toLowerCase() === planetB &&
            a.aspect.toLowerCase() === normalizedAspect,
        );
        if (match) return match;

        const reverseMatch = weeklyData.majorAspects.find(
          (a) =>
            a.planetA.toLowerCase() === planetB &&
            a.planetB.toLowerCase() === planetA &&
            a.aspect.toLowerCase() === normalizedAspect,
        );
        if (reverseMatch) return reverseMatch;
      }
    }
  }

  return null;
}

/**
 * Extract exact moon phase from sentence
 * Matches patterns like "Full Moon in Leo", "New Moon", etc.
 */
function extractMoonPhase(
  sentence: string,
  weeklyData: WeeklyCosmicData,
): MoonPhaseEvent | null {
  const lowerSentence = sentence.toLowerCase();

  const moonPhases = [
    'new moon',
    'waxing crescent',
    'first quarter',
    'waxing gibbous',
    'full moon',
    'waning gibbous',
    'last quarter',
    'waning crescent',
  ];

  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  // Try to match moon phase patterns with strict word order
  for (const phase of moonPhases) {
    const phaseIndex = lowerSentence.indexOf(phase);
    if (phaseIndex === -1) continue;

    // Try to match with sign: "Full Moon in Leo" - phase must come before "in" before sign
    const inIndex = lowerSentence.indexOf(' in ', phaseIndex);
    if (inIndex > phaseIndex && inIndex - phaseIndex < 30) {
      for (const sign of signs) {
        const signIndex = lowerSentence.indexOf(sign, inIndex);
        if (signIndex > inIndex && signIndex - inIndex < 20) {
          const match = weeklyData.moonPhases.find(
            (m) =>
              m.phase.toLowerCase() === phase && m.sign.toLowerCase() === sign,
          );
          if (match) return match;
        }
      }
    }

    // Try to match without sign (just phase) - but only if no sign mentioned nearby
    const hasSignNearby = signs.some(
      (sign) =>
        lowerSentence.includes(sign) &&
        Math.abs(lowerSentence.indexOf(sign) - phaseIndex) < 50,
    );
    if (!hasSignNearby) {
      const match = weeklyData.moonPhases.find(
        (m) => m.phase.toLowerCase() === phase,
      );
      if (match) return match;
    }
  }

  return null;
}

/**
 * Split a long-form script into item-based segments
 * Creates granular segments for each specific item mentioned (planet, aspect, moon phase)
 * This provides better image-to-text correspondence
 */
export function segmentScriptIntoItems(
  script: string,
  weeklyData: WeeklyCosmicData,
): ScriptItem[] {
  const items: ScriptItem[] = [];
  const wordsPerSecond = 2.5; // Average speaking rate
  let currentTime = 0;

  // Split script into sentences
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length === 0) {
    // Fallback: create a single intro item
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: script.split(/\s+/).length / wordsPerSecond,
        item: 'intro',
      },
    ];
  }

  const minItemDuration = 2; // Minimum 2 seconds per item
  const usedExactItems = new Set<string>(); // Track used exact items to avoid duplicates

  // Planet and aspect names for checking best_days assignment
  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];
  const aspects = [
    'conjunction',
    'conjunct',
    'trine',
    'square',
    'opposition',
    'opposite',
    'sextile',
  ];

  // Start with intro - it stays intro unless exact item found
  let currentTopic: ScriptTopic['topic'] = 'intro';
  let currentItemText: string[] = [];
  let itemStartTime = 0;
  let currentItem: string | null = 'intro';
  let currentExactPlanet: PlanetaryHighlight | null = null;
  let currentExactAspect: MajorAspect | null = null;
  let currentExactMoonPhase: MoonPhaseEvent | null = null;
  let isFirstSegment = true; // Track if we're still in intro

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const words = sentence.trim().split(/\s+/).length;
    const duration = words / wordsPerSecond;

    // Check for conclusion first (highest priority)
    if (
      lowerSentence.includes('conclusion') ||
      lowerSentence.includes('wrap up') ||
      lowerSentence.includes('visit lunary') ||
      lowerSentence.includes('lunary.app') ||
      lowerSentence.includes('dive deeper') ||
      lowerSentence.includes('birth chart')
    ) {
      // Save previous item if exists
      if (currentItem && currentItemText.length > 0) {
        const itemDuration = currentTime - itemStartTime;
        if (itemDuration >= minItemDuration || items.length === 0) {
          items.push({
            topic: currentTopic,
            text: currentItemText.join('. '),
            startTime: itemStartTime,
            endTime: currentTime,
            item: currentItem,
            exactPlanet: currentExactPlanet || undefined,
            exactAspect: currentExactAspect || undefined,
            exactMoonPhase: currentExactMoonPhase || undefined,
          });
        }
      }
      // Start conclusion
      currentTopic = 'conclusion';
      currentItem = 'conclusion';
      currentItemText = [sentence.trim()];
      itemStartTime = currentTime;
      currentExactPlanet = null;
      currentExactAspect = null;
      currentExactMoonPhase = null;
      isFirstSegment = false;
      currentTime += duration;
      continue;
    }

    // Try to extract exact items - ONLY create segment if exact match found
    let exactPlanet: PlanetaryHighlight | null = null;
    let exactAspect: MajorAspect | null = null;
    let exactMoonPhase: MoonPhaseEvent | null = null;
    let detectedTopic: ScriptTopic['topic'] | null = null;
    let detectedItem: string | null = null;

    // Priority 1: Try to extract exact moon phase (critical for Lunary)
    exactMoonPhase = extractMoonPhase(sentence, weeklyData);
    if (exactMoonPhase) {
      const itemKey = `moon-${exactMoonPhase.phase}-${exactMoonPhase.sign}`;
      if (!usedExactItems.has(itemKey)) {
        detectedTopic = 'moon_phases';
        detectedItem = itemKey;
        usedExactItems.add(itemKey);
      }
    }
    // If no exact match but text mentions moon phases, still create moon phase segment
    else if (
      lowerSentence.includes('moon') ||
      lowerSentence.includes('lunar') ||
      lowerSentence.includes('phase') ||
      lowerSentence.includes('no major moon phases')
    ) {
      // Check that we're not in a context that should be another topic
      const hasPlanetMention = planets.some((p) => lowerSentence.includes(p));
      const hasAspectMention = aspects.some((a) => lowerSentence.includes(a));
      // Create moon phase segment if:
      // 1. Explicitly mentions "moon phase" or "no major moon phases", OR
      // 2. Mentions moon/lunar/phase without strong planet/aspect context
      if (
        lowerSentence.includes('moon phase') ||
        lowerSentence.includes('no major moon phases') ||
        (!hasPlanetMention && !hasAspectMention)
      ) {
        detectedTopic = 'moon_phases';
        detectedItem = 'moon-phase-no-match';
        // exactMoonPhase remains undefined - image generator will show "No Major Changes"
      }
    }
    // Priority 2: Try to extract exact aspect
    if (!detectedTopic) {
      exactAspect = extractAspect(sentence, weeklyData);
      if (exactAspect) {
        const itemKey = `aspect-${exactAspect.planetA}-${exactAspect.aspect}-${exactAspect.planetB}`;
        if (!usedExactItems.has(itemKey)) {
          detectedTopic = 'aspects';
          detectedItem = itemKey;
          usedExactItems.add(itemKey);
        }
      }
      // Priority 3: Try to extract exact planet movement
      else {
        exactPlanet = extractPlanetMovement(sentence, weeklyData);
        if (exactPlanet) {
          const itemKey = `planet-${exactPlanet.planet}-${exactPlanet.event}`;
          if (!usedExactItems.has(itemKey)) {
            detectedTopic = 'planetary_highlights';
            detectedItem = itemKey;
            usedExactItems.add(itemKey);
          }
        }
        // Priority 4: Check for best days - only if no exact item found AND keywords are clear
        else if (
          !isFirstSegment && // Don't assign best_days to intro
          (lowerSentence.includes('best days') ||
            lowerSentence.includes('best for') ||
            (lowerSentence.includes('ideal') &&
              (lowerSentence.includes('timing') ||
                lowerSentence.includes('day') ||
                lowerSentence.includes('date'))))
        ) {
          // Only assign best_days if we're sure - check that no planets/aspects mentioned
          const hasPlanetMention = planets.some((p) =>
            lowerSentence.includes(p),
          );
          const hasAspectMention = aspects.some((a) =>
            lowerSentence.includes(a),
          );
          if (!hasPlanetMention && !hasAspectMention) {
            detectedTopic = 'best_days';
            detectedItem = 'best-days';
          }
        }
      }
    }

    // Only create new segment if exact item found (or best_days with clear keywords)
    if (detectedItem && detectedTopic) {
      // Save previous item if exists
      if (currentItem && currentItemText.length > 0) {
        const itemDuration = currentTime - itemStartTime;
        if (itemDuration >= minItemDuration || items.length === 0) {
          items.push({
            topic: currentTopic,
            text: currentItemText.join('. '),
            startTime: itemStartTime,
            endTime: currentTime,
            item: currentItem,
            exactPlanet: currentExactPlanet || undefined,
            exactAspect: currentExactAspect || undefined,
            exactMoonPhase: currentExactMoonPhase || undefined,
          });
        }
      }
      // Start new segment with exact item
      currentTopic = detectedTopic;
      currentItem = detectedItem;
      currentExactPlanet = exactPlanet;
      currentExactAspect = exactAspect;
      currentExactMoonPhase = exactMoonPhase;
      currentItemText = [sentence.trim()];
      itemStartTime = currentTime;
      isFirstSegment = false;
    } else {
      // Continue current item - don't change topic/item if no exact match
      currentItemText.push(sentence.trim());
    }

    currentTime += duration;
  }

  // Add final item
  if (currentItemText.length > 0) {
    const itemDuration = currentTime - itemStartTime;
    if (itemDuration >= minItemDuration || items.length === 0) {
      items.push({
        topic: currentTopic,
        text: currentItemText.join('. '),
        startTime: itemStartTime,
        endTime: currentTime,
        item: currentItem || 'intro',
        exactPlanet: currentExactPlanet || undefined,
        exactAspect: currentExactAspect || undefined,
        exactMoonPhase: currentExactMoonPhase || undefined,
      });
    }
  }

  // Ensure we have at least one item
  if (items.length === 0) {
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: currentTime || script.split(/\s+/).length / wordsPerSecond,
        item: 'intro',
      },
    ];
  }

  // Ensure moon phases are present - if none found, add one
  const hasMoonPhases = items.some((i) => i.topic === 'moon_phases');
  if (!hasMoonPhases) {
    console.warn(
      '⚠️ No moon phase segments found in script. Adding moon phase segment...',
    );
    // Find a good place to insert (before conclusion, or at 80% of script)
    const conclusionIndex = items.findIndex((i) => i.topic === 'conclusion');
    const insertIndex =
      conclusionIndex >= 0 ? conclusionIndex : Math.floor(items.length * 0.8);
    const insertTime =
      insertIndex > 0 ? items[insertIndex - 1].endTime : items[0].startTime;

    // Use first moon phase from weeklyData if available
    const fallbackMoonPhase =
      weeklyData.moonPhases.length > 0 ? weeklyData.moonPhases[0] : null;

    const moonPhaseText = fallbackMoonPhase
      ? `The moon phases this week include ${fallbackMoonPhase.phase} moon in ${fallbackMoonPhase.sign}.`
      : 'The lunar energy this week guides our emotional landscape.';
    const moonPhaseDuration =
      moonPhaseText.split(/\s+/).length / wordsPerSecond;

    items.splice(insertIndex, 0, {
      topic: 'moon_phases',
      text: moonPhaseText,
      startTime: insertTime,
      endTime: insertTime + moonPhaseDuration,
      item: fallbackMoonPhase
        ? `moon-${fallbackMoonPhase.phase}-${fallbackMoonPhase.sign}`
        : 'moon-phase-fallback',
      exactMoonPhase: fallbackMoonPhase || undefined,
    });
  }

  return items;
}
